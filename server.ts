import "dotenv/config";
import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { hashPassword, verifyAndMaybeUpgradePassword, verifyPassword } from "./utils/password";
import { signToken, verifyToken, errors as jwtErrors } from "./utils/jwt";
import { checkJsonbColumn } from "./utils/schemaCheck";

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

if (process.env.POSTGRES_URL) {
  let val = process.env.POSTGRES_URL.trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).trim();
  else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1).trim();
  if (val.startsWith("POSTGRES_URL=")) val = val.substring("POSTGRES_URL=".length).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).trim();
  else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1).trim();
  process.env.POSTGRES_URL = val;
}

const usePostgres = !!process.env.POSTGRES_URL;

let vercelDb: any = null;
let sqliteDb: any = null;

const schemaChecked: Record<string, boolean> = {};

async function getDbClient() {
  if (usePostgres) {
    if (!vercelDb) {
      const vercelModule = await import("@vercel/postgres");
      vercelDb = vercelModule.createPool({ connectionString: process.env.POSTGRES_URL });
    }
    const client = await vercelDb.connect();
    return {
      type: "postgres" as const,
      client,
      sql: client.sql.bind(client),
      release: () => client.release(),
    };
  } else {
    if (!sqliteDb) {
      const sqlite3 = await import("sqlite3");
      const { open } = await import("sqlite");
      sqliteDb = await open({
        filename: path.join(process.cwd(), "database.sqlite"),
        driver: sqlite3.default.Database || sqlite3.Database,
      });
      await sqliteDb.exec("PRAGMA journal_mode = WAL;");
    }
    return {
      type: "sqlite" as const,
      client: sqliteDb,
      sql: async (strings: TemplateStringsArray, ...values: any[]) => {
        let query = strings.reduce((acc, str, i) => acc + str + (i < values.length ? "?" : ""), "");
        query = query.replace(/JSONB/g, "TEXT")
          .replace(/UUID/g, "TEXT")
          .replace(/TIMESTAMP WITH TIME ZONE/g, "DATETIME")
          .replace(/NOW\(\)/g, "CURRENT_TIMESTAMP");

        if (query.trim().toUpperCase().startsWith("SELECT")) {
          const rows = await sqliteDb.all(query, values);
          const parsedRows = rows.map((r: any) => {
            if (r.data && typeof r.data === "string") {
              try { r.data = JSON.parse(r.data); } catch (e) { }
            }
            return r;
          });
          return { rows: parsedRows, rowCount: rows.length };
        } else {
          const result = await sqliteDb.run(query, values);
          return { rowCount: result.changes };
        }
      },
      release: () => { },
    };
  }
}

async function ensureSchema() {
  let dbWrapper;
  try {
    dbWrapper = await getDbClient();
    await dbWrapper.sql`
      CREATE TABLE IF NOT EXISTS admin_auth (
        key TEXT PRIMARY KEY,
        password TEXT,
        token_version INTEGER DEFAULT 0
      );
    `;
    await dbWrapper.sql`
      CREATE TABLE IF NOT EXISTS guilds (
        id UUID PRIMARY KEY,
        guild_name TEXT NOT NULL,
        password TEXT NOT NULL,
        data JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const check = await dbWrapper.sql`SELECT password FROM admin_auth WHERE key = 'master'`;

    // Migração: adiciona token_version se não existir
    if (dbWrapper.type === "postgres") {
      try {
        await dbWrapper.sql`ALTER TABLE admin_auth ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0`;
      } catch (_) { }
    } else {
      try {
        await dbWrapper.client.run("ALTER TABLE admin_auth ADD COLUMN token_version INTEGER DEFAULT 0");
      } catch (_) { }
    }

    const checkWithVer = await dbWrapper.sql`SELECT password, token_version FROM admin_auth WHERE key = 'master'`;
    if (checkWithVer.rowCount === 0) {
      const allowDefault =
        process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
      const initial = process.env.ADMIN_PASSWORD ?? (allowDefault ? "admin" : undefined);
      if (!initial) throw new Error("ADMIN_PASSWORD não configurado.");
      const hashed = await hashPassword(initial);
      await dbWrapper.sql`INSERT INTO admin_auth (key, password, token_version) VALUES ('master', ${hashed}, 0)`;
    }
  } finally {
    if (dbWrapper) dbWrapper.release();
  }
}

function getBearerPassword(req: express.Request): string | null {
  const auth = req.headers["authorization"];
  if (!auth) return null;
  return auth.replace("Bearer ", "");
}

async function authenticateExpress(req: express.Request, options?: { allowAdmin?: boolean }): Promise<{ userId: string; role: "admin" | "guild" }> {
  const token = getBearerPassword(req);
  if (!token) throw Object.assign(new Error("Token de autenticação necessário"), { status: 401 });

  try {
    const payload = await verifyToken(token);
    if (options?.allowAdmin === false && payload.role === "admin") {
      throw Object.assign(new Error("Acesso admin não permitido"), { status: 403 });
    }
    return { userId: payload.sub, role: payload.role };
  } catch (err: any) {
    if (err instanceof jwtErrors.JWTExpired) {
      throw Object.assign(new Error("Token expirado"), { status: 401 });
    }
    throw Object.assign(new Error("Token JWT inválido"), { status: 401 });
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());

  const isDevOrTest = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" || !process.env.NODE_ENV;
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevOrTest ? 10000 : 100,
    message: { error: "Muitas requisições deste IP, tente novamente em 15 minutos." },
  });
  app.use("/api/", apiLimiter);
  app.use(express.json({ limit: "50mb" }));

  await ensureSchema();

  // Schema check cacheado (apenas Postgres)
  if (usePostgres) {
    const dbWrapper = await getDbClient();
    try {
      await checkJsonbColumn(dbWrapper.sql, 'server');
    } finally {
      dbWrapper.release();
    }
  }

  // --- ADMIN API ---
  app.post("/api/admin", async (req, res) => {
    let dbWrapper;
    try {
      dbWrapper = await getDbClient();
      const { action, password, newPassword, guildId } = req.body;

      // Suporta autenticação via JWT ou senha admin no body
      let adminPass = password;
      if (!adminPass) {
        try {
          const auth = await authenticateExpress(req);
          if (auth.role === "admin") adminPass = "__jwt_authenticated__";
        } catch (_) { }
      }

      if (!adminPass) {
        res.status(401).json({ error: "Senha de administrador necessária" });
        return;
      }

      const authRow = await dbWrapper.sql`SELECT password, token_version FROM admin_auth WHERE key = 'master'`;
      if (authRow.rowCount === 0) {
        res.status(500).json({ error: "Admin não inicializado. Defina ADMIN_PASSWORD e reinicie." });
        return;
      }
      const stored = authRow.rows[0].password as string;
      const tokenVersion = (authRow.rows[0].token_version as number) || 0;

      if (action === "login") {
        const v = await verifyAndMaybeUpgradePassword(stored, adminPass);
        if (!v.ok) {
          res.status(401).json({ error: "Senha de administrador incorreta" });
          return;
        }
        if (v.upgraded) {
          await dbWrapper.sql`UPDATE admin_auth SET password = ${v.upgraded} WHERE key = 'master'`;
        }
        const { token, expiresIn } = await signToken({ sub: "admin", role: "admin", ver: tokenVersion });
        res.status(200).json({ success: true, token, expiresIn, role: "admin" });
        return;
      }

      if (action === "change_admin_password") {
        if (!newPassword) {
          res.status(400).json({ error: "Nova senha obrigatória" });
          return;
        }
        const ok = await verifyPassword(stored, adminPass);
        if (!ok) {
          res.status(401).json({ error: "Senha atual incorreta" });
          return;
        }
        const hashed = await hashPassword(newPassword);
        await dbWrapper.sql`UPDATE admin_auth SET password = ${hashed} WHERE key = 'master'`;
        res.status(200).json({ success: true });
        return;
      }

      if (action === "reset_guild_password") {
        if (!newPassword || !guildId) {
          res.status(400).json({ error: "Guilda e nova senha obrigatórias" });
          return;
        }
        const ok = await verifyPassword(stored, adminPass);
        if (!ok) {
          res.status(403).json({ error: "Acesso negado" });
          return;
        }
        const hashed = await hashPassword(newPassword);
        await dbWrapper.sql`UPDATE guilds SET password = ${hashed} WHERE id = ${guildId}`;
        res.status(200).json({ success: true });
        return;
      }

      if (action === "revoke_all") {
        const ok = await verifyPassword(stored, adminPass);
        if (!ok) {
          res.status(403).json({ error: "Acesso negado" });
          return;
        }
        await dbWrapper.sql`UPDATE admin_auth SET token_version = token_version + 1 WHERE key = 'master'`;
        res.status(200).json({ success: true, message: "Todos os tokens revogados." });
        return;
      }

      res.status(400).json({ error: "Ação desconhecida" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: (error as Error).message });
    } finally {
      if (dbWrapper) dbWrapper.release();
    }
  });

  // --- GUILDS API ---
  app.get("/api/guilds/:id/:subResource?", async (req, res) => {
    let dbWrapper;
    try {
      dbWrapper = await getDbClient();
      const { id, subResource } = req.params;
      const statusFilter = req.query.status as string | undefined;

      if (subResource) {
        // Partial endpoint
        let auth;
        try {
          auth = await authenticateExpress(req, { allowAdmin: true });
        } catch (err: any) {
          res.status(err.status || 401).json({ error: err.message });
          return;
        }

        if (auth.userId !== id && auth.role !== "admin") {
          res.status(403).json({ error: "Acesso negado" });
          return;
        }

        const fullResult = await dbWrapper.sql`SELECT data FROM guilds WHERE id = ${id}`;
        if (fullResult.rowCount === 0) {
          res.status(404).json({ error: "Guilda não encontrada" });
          return;
        }
        const guildData = fullResult.rows[0].data as any;

        switch (subResource) {
          case "members":
            if (statusFilter) {
              const valid = ["Ativo", "Inativo", "Morto", "Ferido", "Em Missao", "Viajando"];
              if (!valid.includes(statusFilter)) {
                res.status(400).json({ error: `Status inválido. Valores: ${valid.join(", ")}` });
                return;
              }
              const members = (guildData?.members || []).filter((m: any) => m.status === statusFilter);
              res.status(200).json(members);
              return;
            }
            res.status(200).json(guildData?.members || []);
            return;
          case "domains":
            res.status(200).json(guildData?.domains || []);
            return;
          case "items":
            res.status(200).json(guildData?.items || []);
            return;
          case "wallet":
            res.status(200).json(guildData?.wallet || { TC: 0, TS: 0, TO: 0, LO: 0 });
            return;
          default:
            res.status(404).json({ error: "Recurso não encontrado" });
            return;
        }
      }

      // GET single guild
      const password = getBearerPassword(req);
      if (!password) {
        res.status(401).json({ error: "Senha necessária" });
        return;
      }

      const guild = await dbWrapper.sql`SELECT password, data FROM guilds WHERE id = ${id}`;
      if (guild.rowCount === 0) {
        res.status(403).json({ error: "Acesso negado ou Guilda não encontrada" });
        return;
      }

      const storedGuildPass = guild.rows[0].password as string;
      const guildCheck = await verifyAndMaybeUpgradePassword(storedGuildPass, password);
      if (guildCheck.ok) {
        if (guildCheck.upgraded) {
          await dbWrapper.sql`UPDATE guilds SET password = ${guildCheck.upgraded} WHERE id = ${id}`;
        }
        const { token, expiresIn } = await signToken({ sub: id, role: "guild" });
        res.setHeader("X-Session-Token", token);
        res.setHeader("X-Token-Expires-In", String(expiresIn));
        res.status(200).json(guild.rows[0].data);
        return;
      }

      // Try JWT auth
      try {
        const auth = await authenticateExpress(req, { allowAdmin: true });
        if (auth.role === "admin" || auth.userId === id) {
          res.status(200).json(guild.rows[0].data);
          return;
        }
      } catch (_) { }

      res.status(403).json({ error: "Acesso negado ou Guilda não encontrada" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: (error as Error).message });
    } finally {
      if (dbWrapper) dbWrapper.release();
    }
  });

  app.get("/api/guilds", async (req, res) => {
    let dbWrapper;
    try {
      dbWrapper = await getDbClient();
      const id = req.query.id as string | undefined;

      if (id) {
        const password = getBearerPassword(req);
        if (!password) {
          res.status(401).json({ error: "Senha necessária" });
          return;
        }

        const guild = await dbWrapper.sql`SELECT password, data FROM guilds WHERE id = ${id}`;
        if (guild.rowCount === 0) {
          res.status(403).json({ error: "Acesso negado ou Guilda não encontrada" });
          return;
        }

        const storedGuildPass = guild.rows[0].password as string;
        const guildCheck = await verifyAndMaybeUpgradePassword(storedGuildPass, password);
        if (guildCheck.ok) {
          if (guildCheck.upgraded) {
            await dbWrapper.sql`UPDATE guilds SET password = ${guildCheck.upgraded} WHERE id = ${id}`;
          }
          const { token, expiresIn } = await signToken({ sub: id, role: "guild" });
          res.setHeader("X-Session-Token", token);
          res.setHeader("X-Token-Expires-In", String(expiresIn));
          res.status(200).json(guild.rows[0].data);
          return;
        }

        let adminHasAccess = false;
        if (dbWrapper.type === "sqlite") {
          const tableCheck = await dbWrapper.sql`SELECT name FROM sqlite_master WHERE type='table' AND name='admin_auth'`;
          if (tableCheck.rowCount > 0) adminHasAccess = true;
        } else {
          const adminTableCheck = await dbWrapper.sql`SELECT to_regclass('public.admin_auth')`;
          if (adminTableCheck.rows[0].to_regclass) adminHasAccess = true;
        }

        if (adminHasAccess) {
          const adminAuth = await dbWrapper.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
          if (adminAuth.rowCount > 0) {
            const storedAdmin = adminAuth.rows[0].password as string;
            const adminCheck = await verifyAndMaybeUpgradePassword(storedAdmin, password);
            if (adminCheck.ok) {
              if (adminCheck.upgraded) {
                await dbWrapper.sql`UPDATE admin_auth SET password = ${adminCheck.upgraded} WHERE key = 'master'`;
              }
              res.status(200).json(guild.rows[0].data);
              return;
            }
          }
        }

        res.status(403).json({ error: "Acesso negado ou Guilda não encontrada" });
      } else {
        const result = await dbWrapper.sql`
          SELECT id, guild_name, updated_at
          FROM guilds
          ORDER BY updated_at DESC
          LIMIT 50
        `;
        if (dbWrapper.type === "postgres") {
          const enriched = await dbWrapper.sql`
            SELECT id, guild_name, updated_at,
                   jsonb_array_length(data->'members') AS member_count,
                   jsonb_array_length(data->'domains') AS domain_count
            FROM guilds
            ORDER BY updated_at DESC
            LIMIT 50
          `;
          res.status(200).json(enriched.rows);
          return;
        }
        res.status(200).json(result.rows);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: (error as Error).message });
    } finally {
      if (dbWrapper) dbWrapper.release();
    }
  });

  app.post("/api/guilds", async (req, res) => {
    let dbWrapper;
    try {
      dbWrapper = await getDbClient();

      const body = req.body;
      const { id, guildName, password, version, $patch, ...rest } = body;

      if (!id || !guildName || !password) {
        res.status(400).json({ error: "Dados incompletos" });
        return;
      }

      const existing = await dbWrapper.sql`SELECT password, data FROM guilds WHERE id = ${id}`;

      if (existing.rowCount > 0) {
        const dbRow = existing.rows[0];
        const v = await verifyAndMaybeUpgradePassword(dbRow.password as string, password);
        if (!v.ok) {
          res.status(403).json({ error: "Senha incorreta para atualizar esta guilda." });
          return;
        }

        const dbData = dbRow.data;
        const dbVersion = dbData.version || 0;
        const incomingVersion = version || 0;

        if (incomingVersion <= dbVersion && incomingVersion !== 0) {
          res.status(409).json({
            error: "Conflito de Edição: Os dados foram alterados por outro usuário. Atualize a página.",
            type: "conflict",
          });
          return;
        }

        if ($patch && dbWrapper.type === "postgres") {
          const patchFields = { guildName, version, ...rest };
          for (const [key, value] of Object.entries(patchFields)) {
            const jsonValue = JSON.stringify(value);
            await dbWrapper.client.sql.query(
              `UPDATE guilds SET data = jsonb_set(data, '{${key}}', $1::jsonb), updated_at = NOW() WHERE id = $2`,
              [jsonValue, id]
            );
          }
          await dbWrapper.client.sql.query(
            `UPDATE guilds SET guild_name = $1, updated_at = NOW() WHERE id = $2`,
            [guildName, id]
          );
          res.status(200).json({ success: true, version });
          return;
        }
      }

      const guildData = { id, guildName, version, ...rest };
      const hashed = await hashPassword(password);

      await dbWrapper.sql`
        INSERT INTO guilds (id, guild_name, password, data, updated_at)
        VALUES (${id}, ${guildName}, ${hashed}, ${JSON.stringify(guildData)}, NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          guild_name = ${guildName},
          password = ${hashed},
          data = ${JSON.stringify(guildData)},
          updated_at = NOW();
      `;

      res.status(200).json({ success: true, version });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: (error as Error).message });
    } finally {
      if (dbWrapper) dbWrapper.release();
    }
  });

  app.delete("/api/guilds", async (req, res) => {
    let dbWrapper;
    try {
      dbWrapper = await getDbClient();

      const id = req.query.id as string | undefined;
      const authHeader = req.headers["authorization"];
      const password = authHeader?.replace("Bearer ", "");

      if (!id || !password) {
        res.status(400).json({ error: "ID e Senha necessários" });
        return;
      }

      let canDelete = false;
      const guild = await dbWrapper.sql`SELECT password FROM guilds WHERE id = ${id}`;
      if (guild.rowCount > 0) {
        const storedGuild = guild.rows[0].password as string;
        const v = await verifyAndMaybeUpgradePassword(storedGuild, password);
        if (v.ok) {
          canDelete = true;
          if (v.upgraded) {
            await dbWrapper.sql`UPDATE guilds SET password = ${v.upgraded} WHERE id = ${id}`;
          }
        }
      }

      if (!canDelete) {
        let adminHasAccess = false;
        if (dbWrapper.type === "sqlite") {
          const tableCheck = await dbWrapper.sql`SELECT name FROM sqlite_master WHERE type='table' AND name='admin_auth'`;
          if (tableCheck.rowCount > 0) adminHasAccess = true;
        } else {
          const adminTableCheck = await dbWrapper.sql`SELECT to_regclass('public.admin_auth')`;
          if (adminTableCheck.rows[0].to_regclass) adminHasAccess = true;
        }

        if (adminHasAccess) {
          const adminAuth = await dbWrapper.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
          if (adminAuth.rowCount > 0) {
            const storedAdmin = adminAuth.rows[0].password as string;
            const v = await verifyAndMaybeUpgradePassword(storedAdmin, password);
            if (v.ok) {
              canDelete = true;
              if (v.upgraded) {
                await dbWrapper.sql`UPDATE admin_auth SET password = ${v.upgraded} WHERE key = 'master'`;
              }
            }
          }
        }
      }

      if (!canDelete) {
        res.status(403).json({ error: "Falha ao apagar. Senha incorreta." });
        return;
      }

      await dbWrapper.sql`DELETE FROM guilds WHERE id = ${id}`;
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: (error as Error).message });
    } finally {
      if (dbWrapper) dbWrapper.release();
    }
  });

  // --- TOKEN REFRESH ---
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const token = getBearerPassword(req);
      if (!token) {
        res.status(401).json({ error: "Token necessário" });
        return;
      }
      const payload = await verifyToken(token);
      const { token: newToken, expiresIn } = await signToken({
        sub: payload.sub,
        role: payload.role,
        ver: payload.ver,
      });
      res.status(200).json({ success: true, token: newToken, expiresIn, role: payload.role });
    } catch (err: any) {
      if (err instanceof jwtErrors.JWTExpired) {
        res.status(401).json({ error: "Token expirado. Faça login novamente." });
        return;
      }
      res.status(401).json({ error: "Token inválido." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
