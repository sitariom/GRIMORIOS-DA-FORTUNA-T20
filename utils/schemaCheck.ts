const schemaCache: Record<string, boolean> = {};

export async function checkJsonbColumn(sql: (strings: TemplateStringsArray, ...values: any[]) => Promise<any>, cacheKey = "default") {
  if (schemaCache[cacheKey]) return; // já verificado

  try {
    const result = await sql`
      SELECT data_type FROM information_schema.columns
      WHERE table_name = 'guilds' AND column_name = 'data'
    `;
    if (result.rowCount > 0) {
      const dataType = (result.rows[0].data_type as string).toUpperCase();
      if (dataType === "JSONB") {
        schemaCache[cacheKey] = true;
      } else {
        console.warn(`WARN: coluna data é ${dataType}, esperado JSONB. Considere executar 'npm run db:migrate'.`);
        schemaCache[cacheKey] = true; // cacheia mesmo assim para não logar a cada request
      }
    }
  } catch {
    // Tabela pode não existir ainda — ignora
  }
}

export function resetSchemaCache() {
  Object.keys(schemaCache).forEach((k) => delete schemaCache[k]);
}
