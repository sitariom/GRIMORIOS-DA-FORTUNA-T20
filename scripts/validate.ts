import { getDb } from "./db";

async function main() {
  const db = await getDb();
  console.log(`Conectado ao banco: ${db.type}`);

  const result = await db.sql`SELECT id, data FROM guilds`;
  const total = result.rowCount;
  let invalid = 0;
  let nulos = 0;

  for (const row of result.rows) {
    if (row.data === null || row.data === undefined) {
      nulos++;
      console.warn(`  AVISO: guild ${row.id} tem data nulo`);
      continue;
    }
    if (db.type === "postgres") {
      const typeCheck = await db.sql`
        SELECT jsonb_typeof(${row.data}::jsonb) AS t
      `;
      if (typeCheck.rows[0]?.t !== "object") {
        invalid++;
        console.warn(`  INVÁLIDO: guild ${row.id} data não é objeto (tipo: ${typeCheck.rows[0]?.t})`);
      }
    } else {
      if (typeof row.data === "string") {
        try {
          const parsed = JSON.parse(row.data);
          if (typeof parsed !== "object" || Array.isArray(parsed)) {
            invalid++;
            console.warn(`  INVÁLIDO: guild ${row.id} data não é objeto json`);
          }
        } catch {
          invalid++;
          console.warn(`  INVÁLIDO: guild ${row.id} data não é JSON válido`);
        }
      } else if (typeof row.data === "object" && row.data !== null) {
        // já parseado pelo polyfill
      } else {
        invalid++;
        console.warn(`  INVÁLIDO: guild ${row.id} data type=${typeof row.data}`);
      }
    }
  }

  console.log(`\nTotal de guildas: ${total} | Inválidas: ${invalid} | Nulas: ${nulos}`);
  if (invalid > 0) {
    console.log("ALERTA: existem registros com data inválida.");
    process.exit(1);
  }
  console.log("Validação OK.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Falha na validação:", err.message);
  process.exit(1);
});
