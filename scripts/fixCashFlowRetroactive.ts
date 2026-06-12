import { getDb } from "./db";

async function main() {
  const db = await getDb();
  console.log(`Conectado ao banco: ${db.type}`);

  const result = await db.sql`SELECT id, data FROM guilds`;
  const total = result.rowCount;
  let fixed = 0;
  let fixedGuilds = 0;

  for (const row of result.rows) {
    if (row.data === null || row.data === undefined) {
      console.warn(`  AVISO: guild ${row.id} tem data nulo — ignorando`);
      continue;
    }

    const guild = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
    if (!guild.logs || !Array.isArray(guild.logs)) {
      console.warn(`  AVISO: guild ${row.id} não tem logs — ignorando`);
      continue;
    }

    let changed = false;
    for (const log of guild.logs) {
      if (log.category === 'Dominio' && log.value !== 0 && log.value !== undefined) {
        const desc = log.description || '';
        if (!desc.startsWith('Investimento no Domínio') && !desc.startsWith('Saque do Domínio')) {
          log.value = 0;
          changed = true;
          fixed++;
        }
      }
    }

    if (changed) {
      const dataJson = JSON.stringify(guild);
      if (db.type === "postgres") {
        await db.sql`UPDATE guilds SET data = ${dataJson}::jsonb WHERE id = ${row.id}`;
      } else {
        await db.sql`UPDATE guilds SET data = ${dataJson} WHERE id = ${row.id}`;
      }
      fixedGuilds++;
    }
  }

  console.log(`\nTotal de guildas: ${total}`);
  console.log(`Guildas modificadas: ${fixedGuilds}`);
  console.log(`Logs corrigidos (value → 0): ${fixed}`);
  if (fixed === 0) {
    console.log("Nenhum log precisou de correção — os dados já estão consistentes.");
  } else {
    console.log("Correção retroativa concluída.");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Falha no script:", err.message);
  process.exit(1);
});
