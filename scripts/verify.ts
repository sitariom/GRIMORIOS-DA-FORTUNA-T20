import { getDb } from "./db";

async function main() {
  const db = await getDb();
  console.log(`Conectado ao banco: ${db.type}`);

  if (db.type === "postgres") {
    const result = await db.sql`
      SELECT data_type FROM information_schema.columns
      WHERE table_name = 'guilds' AND column_name = 'data'
    `;
    if (result.rowCount === 0) {
      console.log("ALERTA: tabela 'guilds' ou coluna 'data' não existe.");
      process.exit(1);
    }
    const dataType = result.rows[0].data_type as string;
    if (dataType.toUpperCase() === "JSONB") {
      console.log("JSONB OK — coluna data é JSONB.");
      process.exit(0);
    } else {
      console.log(`ALERTA: coluna data é do tipo ${dataType}, esperado JSONB.`);
      console.log("Comando para corrigir:");
      console.log("  ALTER TABLE guilds ALTER COLUMN data TYPE JSONB USING data::JSONB;");
      process.exit(1);
    }
  } else {
    console.log("SQLite OK — SQLite não tem JSONB, polyfill usa TEXT.");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Falha na verificação:", err.message);
  process.exit(1);
});
