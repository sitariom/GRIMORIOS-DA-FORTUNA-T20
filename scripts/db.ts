import "dotenv/config";
import path from "path";

function fixPostgresUrl() {
  let val = process.env.POSTGRES_URL?.trim();
  if (!val) return;

  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).trim();
  else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1).trim();
  if (val.startsWith("POSTGRES_URL=")) val = val.substring("POSTGRES_URL=".length).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).trim();
  else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1).trim();
  process.env.POSTGRES_URL = val;
}
fixPostgresUrl();

const usePostgres = !!process.env.POSTGRES_URL;

export async function getDb() {
  if (usePostgres) {
    const vercelModule = await import("@vercel/postgres");
    const pool = vercelModule.createPool({ connectionString: process.env.POSTGRES_URL });
    return { type: "postgres" as const, pool, sql: pool.sql.bind(pool) };
  } else {
    const sqlite3 = await import("sqlite3");
    const { open } = await import("sqlite");
    const db = await open({
      filename: path.join(process.cwd(), "database.sqlite"),
      driver: sqlite3.default.Database || sqlite3.Database,
    });
    await db.exec("PRAGMA journal_mode = WAL;");
    const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
      let query = strings.reduce((acc, s, i) => acc + s + (i < values.length ? "?" : ""), "");
      query = query.replace(/JSONB/g, "TEXT").replace(/NOW\(\)/g, "CURRENT_TIMESTAMP");
      const rows = await db.all(query, values);
      return { rows, rowCount: rows.length };
    };
    return { type: "sqlite" as const, sql };
  }
}
