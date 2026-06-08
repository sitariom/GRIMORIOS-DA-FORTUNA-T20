import "dotenv/config";
import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { hashPassword, verifyAndMaybeUpgradePassword, verifyPassword } from "./utils/password";

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// Fix malformed POSTGRES_URL if the user pasted the key name into the value
if (process.env.POSTGRES_URL) {
  let val = process.env.POSTGRES_URL.trim();
  
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.slice(1, -1).trim();
  } else if (val.startsWith("'") && val.endsWith("'")) {
    val = val.slice(1, -1).trim();
  }
  
  if (val.startsWith('POSTGRES_URL=')) {
    val = val.substring('POSTGRES_URL='.length).trim();
  }

  // just in case they have double quotes around the URL itself after the equal sign
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.slice(1, -1).trim();
  } else if (val.startsWith("'") && val.endsWith("'")) {
    val = val.slice(1, -1).trim();
  }

  process.env.POSTGRES_URL = val;
}

// Fallback to SQLite if no POSTGRES_URL is provided
const usePostgres = !!process.env.POSTGRES_URL;

let vercelDb: any = null;
let sqliteDb: any = null;

async function getDbClient() {
  if (usePostgres) {
    if (!vercelDb) {
      const vercelModule = await import("@vercel/postgres");
      vercelDb = vercelModule.createPool({ connectionString: process.env.POSTGRES_URL });
    }
    const client = await vercelDb.connect();
    return {
      type: 'postgres',
      client,
      sql: client.sql.bind(client),
      release: () => client.release()
    };
  } else {
    if (!sqliteDb) {
      const sqlite3 = await import('sqlite3');
      const { open } = await import('sqlite');
      sqliteDb = await open({
        filename: path.join(process.cwd(), 'database.sqlite'),
        driver: sqlite3.default.Database || sqlite3.Database
      });
      await sqliteDb.exec("PRAGMA journal_mode = WAL;");
    }
    
    return {
      type: 'sqlite',
      client: sqliteDb,
      sql: async (strings: TemplateStringsArray, ...values: any[]) => {
        let query = strings.reduce((acc, str, i) => acc + str + (i < values.length ? '?' : ''), '');
        
        // Polyfill PostgreSQL types to SQLite
        query = query.replace(/JSONB/g, 'TEXT');
        query = query.replace(/UUID/g, 'TEXT');
        query = query.replace(/TIMESTAMP WITH TIME ZONE/g, 'DATETIME');
        query = query.replace(/NOW\(\)/g, "CURRENT_TIMESTAMP");
        
        // Log query for debug
        // console.log("SQLITE QUERY:", query, values);

        if (query.trim().toUpperCase().startsWith('SELECT')) {
           const rows = await sqliteDb.all(query, values);
           // Handle JSON parsing for data column
           const parsedRows = rows.map((r: any) => {
              if (r.data && typeof r.data === 'string') {
                try { r.data = JSON.parse(r.data); } catch (e) {}
              }
              return r;
           });
           return { rows: parsedRows, rowCount: rows.length };
        } else {
           const result = await sqliteDb.run(query, values);
           return { rowCount: result.changes };
        }
      },
      release: () => {} // No-op for SQLite single connection
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
        password TEXT NOT NULL
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
    if (check.rowCount === 0) {
      const allowDefault =
        process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
      const initial = process.env.ADMIN_PASSWORD ?? (allowDefault ? "admin" : undefined);
      if (!initial) throw new Error("ADMIN_PASSWORD não configurado.");
      const hashed = await hashPassword(initial);
      await dbWrapper.sql`INSERT INTO admin_auth (key, password) VALUES ('master', ${hashed})`;
    }
  } finally {
    if (dbWrapper) dbWrapper.release();
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Segurança: Headers HTTP
  app.use(helmet({
    contentSecurityPolicy: false, // Desabilitado temporariamente para não quebrar o Vite/React
  }));

  // Segurança: CORS
  app.use(cors());

  // Segurança: Rate Limiting para evitar ataques de força bruta na API
  const isDevOrTest = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" || !process.env.NODE_ENV;
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isDevOrTest ? 10000 : 100, // Limite muito maior em desenvolvimento/testes
    message: { error: "Muitas requisições deste IP, tente novamente em 15 minutos." }
  });
  
  app.use("/api/", apiLimiter);

  app.use(express.json({ limit: '10mb' }));

  await ensureSchema();

  // API Admin
  app.post("/api/admin", async (req, res) => {
    let dbWrapper;
    try {
      dbWrapper = await getDbClient();
      const { action, password, newPassword, guildId } = req.body;
      const auth = await dbWrapper.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
      if (auth.rowCount === 0) {
        res.status(500).json({ error: "Admin não inicializado. Defina ADMIN_PASSWORD e reinicie." });
        return;
      }
      const stored = auth.rows[0].password as string;

      if (action === "login") {
        const v = await verifyAndMaybeUpgradePassword(stored, password);
        if (!v.ok) {
          res.status(401).json({ error: "Senha de administrador incorreta" });
          return;
        }
        if (v.upgraded) {
          await dbWrapper.sql`UPDATE admin_auth SET password = ${v.upgraded} WHERE key = 'master'`;
        }
        res.status(200).json({ success: true });
        return;
      }

      if (action === "change_admin_password") {
        if (!newPassword) {
          res.status(400).json({ error: "Nova senha obrigatória" });
          return;
        }
        const ok = await verifyPassword(stored, password);
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
        const ok = await verifyPassword(stored, password);
        if (!ok) {
          res.status(403).json({ error: "Acesso negado" });
          return;
        }
        const hashed = await hashPassword(newPassword);
        await dbWrapper.sql`UPDATE guilds SET password = ${hashed} WHERE id = ${guildId}`;
        res.status(200).json({ success: true });
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

  // API Guilds
  app.get("/api/guilds", async (req, res) => {
    let dbWrapper;
    try {
      dbWrapper = await getDbClient();

      const id = req.query.id as string | undefined;

      if (id) {
        const authHeader = req.headers["authorization"];
        const password = authHeader?.replace("Bearer ", "");

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
      const { id, guildName, password, version, ...rest } = body;

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
        if (dbWrapper.type === 'sqlite') {
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
