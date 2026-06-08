
import { db } from '@vercel/postgres';
import { hashPassword, verifyAndMaybeUpgradePassword } from '../utils/password';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const client = await db.connect();

  try {
    // Garante que a tabela existe (Auto-migration)
    await client.sql`
      CREATE TABLE IF NOT EXISTS guilds (
        id UUID PRIMARY KEY,
        guild_name TEXT NOT NULL,
        password TEXT NOT NULL,
        data JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const url = new URL(request.url);
    const method = request.method;
    const id = url.searchParams.get('id');

    // GET: Listar ou Buscar Detalhes
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
          return new Response(JSON.stringify(guild.rows[0].data), {
            status: 200,
            headers: { 'content-type': 'application/json' }
          });
        }

        const adminTableCheck = await client.sql`SELECT to_regclass('public.admin_auth')`;
        if (adminTableCheck.rows[0]?.to_regclass) {
          const adminAuth = await client.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
          if ((adminAuth.rowCount ?? 0) > 0) {
            const storedAdmin = adminAuth.rows[0].password as string;
            const a = await verifyAndMaybeUpgradePassword(storedAdmin, password);
            if (a.ok) {
              if (a.upgraded) {
                await client.sql`UPDATE admin_auth SET password = ${a.upgraded} WHERE key = 'master'`;
              }
              return new Response(JSON.stringify(guild.rows[0].data), {
                status: 200,
                headers: { 'content-type': 'application/json' }
              });
            }
          }
        }

        return new Response(JSON.stringify({ error: 'Acesso negado ou Guilda não encontrada' }), { status: 403 });
      } else {
        // Listagem pública
        const result = await client.sql`
          SELECT id, guild_name, updated_at 
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

    // POST: Criar ou Atualizar
    if (method === 'POST') {
      const body = await request.json();
      const { id, guildName, password, version, ...rest } = body;

      if (!id || !guildName || !password) {
        return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 });
      }

      // Verifica existência para decidir se é Update ou Create e checar conflitos
      const existing = await client.sql`SELECT password, data FROM guilds WHERE id = ${id}`;
      
      // Update
      if ((existing.rowCount ?? 0) > 0) {
        const dbRow = existing.rows[0];
        
        const v = await verifyAndMaybeUpgradePassword(dbRow.password as string, password);
        if (!v.ok) {
           return new Response(JSON.stringify({ error: 'Senha incorreta para atualizar esta guilda.' }), { status: 403 });
        }

        // 2. Validação de Concorrência (Optimistic Locking)
        const dbData = dbRow.data;
        const dbVersion = (dbData && dbData.version) || 0;
        const incomingVersion = version || 0;

        // Se a versão que chega é MENOR ou IGUAL a do banco, significa que o cliente está desatualizado
        // Exceção: Se for 0 ou 1, pode ser migração inicial ou reset, então permitimos se a diferença for pequena, mas regra geral é travar.
        if (incomingVersion <= dbVersion && incomingVersion !== 0) {
            return new Response(JSON.stringify({ 
                error: 'Conflito de Edição: Os dados foram alterados por outro usuário. Atualize a página.',
                type: 'conflict'
            }), { status: 409 });
        }
      }

      // Prepara o payload final
      const guildData = { id, guildName, version, ...rest };
      const hashed = await hashPassword(password);

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

    // DELETE: Apagar (Apenas Admin pode apagar totalmente via UI, ou quem tem a senha)
    if (method === 'DELETE') {
      const authHeader = request.headers.get('Authorization');
      const password = authHeader?.replace('Bearer ', '');

      if (!id || !password) return new Response(JSON.stringify({ error: 'ID e Senha necessários' }), { status: 400 });

      // Verifica se é a senha da guilda
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

      // Se não for, verifica se é admin
      if (!canDelete) {
         // Verifica tabela admin
         const adminTableCheck = await client.sql`SELECT to_regclass('public.admin_auth')`;
          if (adminTableCheck.rows[0]?.to_regclass) {
             const adminAuth = await client.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
              if ((adminAuth.rowCount ?? 0) > 0) {
               const storedAdmin = adminAuth.rows[0].password as string;
               const v = await verifyAndMaybeUpgradePassword(storedAdmin, password);
               if (v.ok) {
                 canDelete = true;
                 if (v.upgraded) {
                   await client.sql`UPDATE admin_auth SET password = ${v.upgraded} WHERE key = 'master'`;
                 }
               }
             }
         }
      }

      if (!canDelete) {
         return new Response(JSON.stringify({ error: 'Falha ao apagar. Senha incorreta.' }), { status: 403 });
      }

      await client.sql`DELETE FROM guilds WHERE id = ${id}`;
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  } finally {
    client.release();
  }
}
