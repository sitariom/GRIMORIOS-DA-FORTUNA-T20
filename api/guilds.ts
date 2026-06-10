
import { db } from '@vercel/postgres';
import { hashPassword, verifyAndMaybeUpgradePassword } from '../utils/password';
import { authenticate, AuthError, signToken } from './middleware/auth';
import { checkJsonbColumn } from '../utils/schemaCheck';

export const config = {
  runtime: 'edge',
};

async function getGuildData(client: any, id: string, field?: string, jsonbFilter?: string) {
  if (field) {
    const query = jsonbFilter
      ? `SELECT ${jsonbFilter} AS data FROM guilds WHERE id = $1`
      : `SELECT data->'${field}' AS data FROM guilds WHERE id = $1`;
    const result = await client.sql.query(query, [id]);
    if (result.rowCount === 0) return null;
    return result.rows[0]?.data;
  }
  const result = await client.sql`SELECT data FROM guilds WHERE id = ${id}`;
  if (result.rowCount === 0) return null;
  return result.rows[0]?.data;
}

export default async function handler(request: Request) {
  const client = await db.connect();

  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS guilds (
        id UUID PRIMARY KEY,
        guild_name TEXT NOT NULL,
        password TEXT NOT NULL,
        data JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Schema check cacheado (apenas Postgres)
    if (process.env.POSTGRES_URL && !process.env.__JSONB_CHECKED__) {
      checkJsonbColumn(client.sql, 'guilds').catch(() => {});
      process.env.__JSONB_CHECKED__ = '1';
    }

    const url = new URL(request.url);
    const method = request.method;
    const segments = url.pathname.replace(/\/+$/, '').split('/');
    const id = segments[3] || url.searchParams.get('id');
    const subResource = segments[4] || null;

    // --- SUB-RESOURCE ENDPOINTS (partial queries) ---
    if (method === 'GET' && id && subResource) {
      let auth: { userId: string };
      try {
        auth = await authenticate(request, { allowAdmin: true });
      } catch (e) {
        const err = e as AuthError;
        return new Response(JSON.stringify({ error: err.message }), { status: err.status });
      }

      if (auth.userId !== id && auth.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403 });
      }

      const statusFilter = url.searchParams.get('status');

      let partialField: string | undefined;
      let jsonbFilter: string | undefined;

      switch (subResource) {
        case 'members':
          if (statusFilter) {
            const validStatuses = ['Ativo', 'Inativo', 'Morto', 'Ferido', 'Em Missao', 'Viajando'];
            if (!validStatuses.includes(statusFilter)) {
              return new Response(JSON.stringify({
                error: `Status inválido. Valores: ${validStatuses.join(', ')}`
              }), { status: 400 });
            }
            jsonbFilter = `SELECT jsonb_path_query_array(data, '$.members[*] ? (@.status == "${statusFilter}")') AS data`;
            partialField = 'members_filtered';
          } else {
            partialField = 'members';
          }
          break;
        case 'domains':
          partialField = 'domains';
          break;
        case 'items':
          partialField = 'items';
          break;
        case 'wallet':
          partialField = 'wallet';
          break;
        default:
          return new Response(JSON.stringify({ error: 'Recurso não encontrado' }), { status: 404 });
      }

      const data = await getGuildData(client, id, partialField, jsonbFilter);
      if (data === null) {
        return new Response(JSON.stringify({ error: 'Guilda não encontrada' }), { status: 404 });
      }
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    // --- STANDARD GET ---
    if (method === 'GET') {
      if (id) {
        const authHeader = request.headers.get('Authorization');
        const password = authHeader?.replace('Bearer ', '');

        if (!password) {
          return new Response(JSON.stringify({ error: 'Senha necessária' }), { status: 401 });
        }

        const guild = await client.sql`SELECT password, data FROM guilds WHERE id = ${id}`;
        if (guild.rowCount === 0) {
          return new Response(JSON.stringify({ error: 'Acesso negado ou Guilda não encontrada' }), { status: 403 });
        }

        const storedGuild = guild.rows[0].password as string;
        const v = await verifyAndMaybeUpgradePassword(storedGuild, password);
        if (v.ok) {
          if (v.upgraded) {
            await client.sql`UPDATE guilds SET password = ${v.upgraded} WHERE id = ${id}`;
          }
          // Emit JWT for guild session
          const { token, expiresIn } = await signToken({ sub: id, role: 'guild' });
          return new Response(JSON.stringify(guild.rows[0].data), {
            status: 200,
            headers: {
              'content-type': 'application/json',
              'X-Session-Token': token,
              'X-Token-Expires-In': String(expiresIn),
            }
          });
        }

        // Try admin access
        try {
          const adminAuth = await authenticate(request, { allowAdmin: true });
          if (adminAuth.role === 'admin') {
            return new Response(JSON.stringify(guild.rows[0].data), {
              status: 200,
              headers: { 'content-type': 'application/json' }
            });
          }
        } catch (_) {}

        return new Response(JSON.stringify({ error: 'Acesso negado ou Guilda não encontrada' }), { status: 403 });
      } else {
        // Listagem pública (opcionalmente com contagens)
        const result = await client.sql`
          SELECT id, guild_name, updated_at,
                 jsonb_array_length(data->'members') AS member_count,
                 jsonb_array_length(data->'domains') AS domain_count,
                 data->>'wallet' AS wallet_summary
          FROM guilds
          ORDER BY updated_at DESC
          LIMIT 50
        `;
        return new Response(JSON.stringify(result.rows), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
    }

    // --- POST (Create / Update) ---
    if (method === 'POST') {
      const body = await request.json();
      const { id, guildName, password, version, $patch, ...rest } = body;

      if (!id || !guildName || !password) {
        return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 });
      }

      const existing = await client.sql`SELECT password, data FROM guilds WHERE id = ${id}`;
      const hashed = await hashPassword(password);

      if ((existing.rowCount ?? 0) > 0) {
        const dbRow = existing.rows[0];
        const v = await verifyAndMaybeUpgradePassword(dbRow.password as string, password);
        if (!v.ok) {
          return new Response(JSON.stringify({ error: 'Senha incorreta para atualizar esta guilda.' }), { status: 403 });
        }

        if (!v.ok) {
          return new Response(JSON.stringify({ error: 'Senha incorreta para atualizar esta guilda.' }), { status: 403 });
        }

        const dbData = dbRow.data;
        const dbVersion = (dbData && dbData.version) || 0;
        const incomingVersion = version || 0;

        if (incomingVersion <= dbVersion && incomingVersion !== 0) {
          return new Response(JSON.stringify({
            error: 'Conflito de Edição: Os dados foram alterados por outro usuário. Atualize a página.',
            type: 'conflict'
          }), { status: 409 });
        }

        if ($patch) {
          // Patch parcial — mescla campos fornecidos no JSONB existente
          const patchFields = { guildName, version, ...rest };
          for (const [key, value] of Object.entries(patchFields)) {
            const jsonValue = JSON.stringify(value);
            await client.sql.query(
              `UPDATE guilds SET data = jsonb_set(data, '{${key}}', $1::jsonb), updated_at = NOW() WHERE id = $2`,
              [jsonValue, id]
            );
          }
          await client.sql.query(
            `UPDATE guilds SET guild_name = $1, updated_at = NOW() WHERE id = $2`,
            [guildName, id]
          );
          return new Response(JSON.stringify({ success: true, version }), { status: 200 });
        }
      }

      // Full replace
      const guildData = { id, guildName, version, ...rest };
      await client.sql`
        INSERT INTO guilds (id, guild_name, password, data, updated_at)
        VALUES (${id}, ${guildName}, ${hashed}, ${JSON.stringify(guildData)}, NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          guild_name = ${guildName},
          password = ${hashed},
          data = ${JSON.stringify(guildData)},
          updated_at = NOW();
      `;

      return new Response(JSON.stringify({ success: true, version }), { status: 200 });
    }

    // --- DELETE ---
    if (method === 'DELETE') {
      const authHeader = request.headers.get('Authorization');
      const password = authHeader?.replace('Bearer ', '');

      if (!id || !password) return new Response(JSON.stringify({ error: 'ID e Senha necessários' }), { status: 400 });

      let canDelete = false;
      const guild = await client.sql`SELECT password FROM guilds WHERE id = ${id}`;
      if ((guild.rowCount ?? 0) > 0) {
        const storedGuild = guild.rows[0].password as string;
        const v = await verifyAndMaybeUpgradePassword(storedGuild, password);
        if (v.ok) {
          canDelete = true;
          if (v.upgraded) {
            await client.sql`UPDATE guilds SET password = ${v.upgraded} WHERE id = ${id}`;
          }
        }
      }

      if (!canDelete) {
        try {
          const adminAuth = await authenticate(request, { allowAdmin: true });
          if (adminAuth.role === 'admin') canDelete = true;
        } catch (_) {}
      }

      if (!canDelete) {
        return new Response(JSON.stringify({ error: 'Falha ao apagar. Senha incorreta.' }), { status: 403 });
      }

      await client.sql`DELETE FROM guilds WHERE id = ${id}`;
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Método não suportado' }), { status: 405 });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  } finally {
    client.release();
  }
}
