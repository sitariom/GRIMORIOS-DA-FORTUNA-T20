import { getDb } from "./db";

async function main() {
  const db = await getDb();
  console.log(`Conectado ao banco: ${db.type}`);

  if (db.type === "postgres") {
    // Verifica tipo atual
    const check = await db.sql`
      SELECT data_type FROM information_schema.columns
      WHERE table_name = 'guilds' AND column_name = 'data'
    `;
    if (check.rowCount === 0) {
      console.log("ERRO: tabela 'guilds' ou coluna 'data' não existe.");
      process.exit(1);
    }

    const currentType = check.rows[0].data_type as string;
    if (currentType.toUpperCase() === "JSONB") {
      console.log("Migração JSONB: coluna já era JSONB. Nada a fazer.");
      process.exit(0);
    }

    // Testa em transação primeiro
    if (db.pool) {
      const testClient = await db.pool.connect();
      try {
        await testClient.sql`BEGIN`;
        await testClient.sql`ALTER TABLE guilds ALTER COLUMN data TYPE JSONB USING data::JSONB`;
        await testClient.sql`ROLLBACK`;
        console.log("Migração testada em transação: OK");
      } finally {
        testClient.release();
      }
    }

    // Executa migração real
    await db.sql`ALTER TABLE guilds ALTER COLUMN data TYPE JSONB USING data::JSONB`;
    console.log("Migração JSONB: OK — coluna alterada para JSONB com dados preservados.");
    process.exit(0);
  } else {
    console.log("SQLite: não há migração necessária (JSONB → TEXT via polyfill).");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Falha na migração:", err.message);
  process.exit(1);
});
