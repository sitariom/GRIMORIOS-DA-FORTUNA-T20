
import { db } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const client = await db.connect();

  try {
    // Inicialização da tabela de admin se não existir
    await client.sql`
      CREATE TABLE IF NOT EXISTS admin_auth (
        key TEXT PRIMARY KEY,
        password TEXT NOT NULL
      );
    `;
    
    // Insere senha padrão 'admin' se não existir nada
    const check = await client.sql`SELECT * FROM admin_auth WHERE key = 'master'`;
    if (check.rowCount === 0) {
      await client.sql`INSERT INTO admin_auth (key, password) VALUES ('master', 'admin')`;
    }

    const body = await request.json();
    const { action, password, newPassword, guildId } = body;

    // Login Admin
    if (action === 'login') {
      const result = await client.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
      if (result.rows[0].password === password) {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Senha de administrador incorreta' }), { status: 401 });
    }

    // Alterar Senha Admin
    if (action === 'change_admin_password') {
      const result = await client.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
      if (result.rows[0].password !== password) { // Valida senha antiga
        return new Response(JSON.stringify({ error: 'Senha atual incorreta' }), { status: 401 });
      }
      await client.sql`UPDATE admin_auth SET password = ${newPassword} WHERE key = 'master'`;
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Resetar Senha da Guilda (Requer senha de admin)
    if (action === 'reset_guild_password') {
      const auth = await client.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
      if (auth.rows[0].password !== password) {
         return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403 });
      }
      
      await client.sql`UPDATE guilds SET password = ${newPassword} WHERE id = ${guildId}`;
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Ação desconhecida' }), { status: 400 });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  } finally {
    client.release();
  }
}
