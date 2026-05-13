
import { db } from '@vercel/postgres';
import { hashPassword, verifyAndMaybeUpgradePassword, verifyPassword } from '../utils/password';

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
    const check = await client.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
    if (check.rowCount === 0) {
      const allowDefault =
        process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
      const initial = process.env.ADMIN_PASSWORD ?? (allowDefault ? 'admin' : undefined);
      if (!initial) {
        return new Response(JSON.stringify({ error: 'Admin não inicializado. Defina ADMIN_PASSWORD.' }), { status: 500 });
      }
      const hashed = await hashPassword(initial);
      await client.sql`INSERT INTO admin_auth (key, password) VALUES ('master', ${hashed})`;
    }

    const body = await request.json();
    const { action, password, newPassword, guildId } = body;

    // Login Admin
    if (action === 'login') {
      const result = await client.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
      const stored = result.rows[0].password as string;
      const v = await verifyAndMaybeUpgradePassword(stored, password);
      if (!v.ok) return new Response(JSON.stringify({ error: 'Senha de administrador incorreta' }), { status: 401 });
      if (v.upgraded) {
        await client.sql`UPDATE admin_auth SET password = ${v.upgraded} WHERE key = 'master'`;
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Alterar Senha Admin
    if (action === 'change_admin_password') {
      const result = await client.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
      const stored = result.rows[0].password as string;
      const ok = await verifyPassword(stored, password);
      if (!ok) {
        return new Response(JSON.stringify({ error: 'Senha atual incorreta' }), { status: 401 });
      }
      if (!newPassword) {
        return new Response(JSON.stringify({ error: 'Nova senha obrigatória' }), { status: 400 });
      }
      const hashed = await hashPassword(newPassword);
      await client.sql`UPDATE admin_auth SET password = ${hashed} WHERE key = 'master'`;
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Resetar Senha da Guilda (Requer senha de admin)
    if (action === 'reset_guild_password') {
      const auth = await client.sql`SELECT password FROM admin_auth WHERE key = 'master'`;
      const stored = auth.rows[0].password as string;
      const ok = await verifyPassword(stored, password);
      if (!ok) {
         return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403 });
      }
      if (!guildId || !newPassword) {
        return new Response(JSON.stringify({ error: 'Guilda e nova senha obrigatórias' }), { status: 400 });
      }
      const hashed = await hashPassword(newPassword);
      await client.sql`UPDATE guilds SET password = ${hashed} WHERE id = ${guildId}`;
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Ação desconhecida' }), { status: 400 });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  } finally {
    client.release();
  }
}
