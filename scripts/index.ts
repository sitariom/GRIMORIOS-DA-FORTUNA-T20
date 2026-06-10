import { getDb } from "./db";

async function main() {
  const db = await getDb();
  console.log(`Conectado ao banco: ${db.type}`);

  if (db.type === "postgres") {
    await db.sql`CREATE INDEX IF NOT EXISTS idx_guilds_data_gin ON guilds USING GIN (data jsonb_path_ops)`;
    console.log("Índice GIN idx_guilds_data_gin criado/verificado.");
    process.exit(0);
  } else {
    console.log("SQLite: índice GIN não aplicável.");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Falha ao criar índice:", err.message);
  process.exit(1);
});
