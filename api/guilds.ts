
import { db } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const client = await db.connect();

  try {
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

        // Tenta buscar como usuário normal (senha da guilda)
        let result = await client.sql`
          SELECT data FROM guilds 
          WHERE id = ${id} AND password = ${password}
        `;

        // Se falhar, verifica se a senha fornecida é a senha de ADMIN
        if (result.rowCount === 0) {
           const adminAuth = await client.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
           if (adminAuth.rowCount > 0 && adminAuth.rows[0].password === password) {
              // É admin, libera o acesso aos dados da guilda mesmo sem a senha da guilda
              result = await client.sql`SELECT data FROM guilds WHERE id = ${id}`;
           }
        }

        if (result.rowCount === 0) {
          return new Response(JSON.stringify({ error: 'Acesso negado ou Guilda não encontrada' }), { status: 403 });
        }

        return new Response(JSON.stringify(result.rows[0].data), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
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
      const { id, guildName, password, ...rest } = body;

      if (!id || !guildName || !password) {
        return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 });
      }

      // Verifica existência para decidir se é Update ou Create
      const existing = await client.sql`SELECT password FROM guilds WHERE id = ${id}`;
      
      // Update
      if (existing.rowCount > 0) {
        // Para atualizar, precisa da senha da guilda
        if (existing.rows[0].password !== password) {
           return new Response(JSON.stringify({ error: 'Senha incorreta para atualizar esta guilda.' }), { status: 403 });
        }
      } else {
        // Create (Nova Guilda)
        // Opcional: Poderíamos exigir senha de admin no header para criar novas guildas para impedir spam
        // Por enquanto, deixamos aberto ou validamos no front via contexto Admin
      }

      const guildData = { id, guildName, ...rest };

      await client.sql`
        INSERT INTO guilds (id, guild_name, password, data, updated_at)
        VALUES (${id}, ${guildName}, ${password}, ${JSON.stringify(guildData)}, NOW())
        ON CONFLICT (id) 
        DO UPDATE SET 
          guild_name = ${guildName}, 
          data = ${JSON.stringify(guildData)}, 
          updated_at = NOW();
      `;

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // DELETE: Apagar (Apenas Admin pode apagar totalmente via UI, ou quem tem a senha)
    if (method === 'DELETE') {
      const authHeader = request.headers.get('Authorization');
      const password = authHeader?.replace('Bearer ', '');

      if (!id || !password) return new Response(JSON.stringify({ error: 'ID e Senha necessários' }), { status: 400 });

      // Verifica se é a senha da guilda
      let canDelete = false;
      const guildCheck = await client.sql`SELECT password FROM guilds WHERE id = ${id} AND password = ${password}`;
      if (guildCheck.rowCount > 0) canDelete = true;

      // Se não for, verifica se é admin
      if (!canDelete) {
         const adminCheck = await client.sql`SELECT password FROM admin_auth WHERE key = 'master' AND password = ${password}`;
         if (adminCheck.rowCount > 0) canDelete = true;
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
