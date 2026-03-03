import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config();

const SOURCE_URL = process.env.DATABASE_URL;
let url = (process.env.DB_GENKI_URL ?? process.env.GENKI_DB_URL ?? process.env.DB_GENKI ?? process.env.DATABASE_URL_GENKI);
if (url && url.includes("/railway")) {
  url = url.replace("/railway", "/frontend");
}
const RAW_TARGET_URL = url;

if (!SOURCE_URL) {
  throw new Error("DATABASE_URL is not set");
}

if (!RAW_TARGET_URL) {
  throw new Error("Target DB url is not set. Expected one of DB_GENKI_URL, DB_GENKI, GENKI_DB_URL, or DATABASE_URL_GENKI.");
}

const sourceUrl: string = SOURCE_URL;
const rawTargetUrl: string = RAW_TARGET_URL;

type TableConfig = {
  name: string;
  primaryKey?: string;
  resetSequence?: string;
};

const TABLES: TableConfig[] = [
  { name: "users", primaryKey: "clerk_id" },
  { name: "strategies", primaryKey: "id", resetSequence: "strategies_id_seq" },
  { name: "subscriptions", primaryKey: "id", resetSequence: "subscriptions_id_seq" },
  { name: "payments", primaryKey: "id", resetSequence: "payments_id_seq" },
];

function withDatabaseName(connectionString: string, databaseName: string) {
  const url = new URL(connectionString);
  url.pathname = `/${databaseName}`;
  return url.toString();
}

function quoteIdent(identifier: string) {
  return `"${identifier.split('"').join('""')}"`;
}

function quoteTable(name: string) {
  return name
    .split(".")
    .map((part) => quoteIdent(part))
    .join(".");
}

async function getColumns(sqlSource: postgres.Sql, sqlTarget: postgres.Sql, tableName: string) {
  const [sourceCols, targetCols] = await Promise.all([
    sqlSource<{ column_name: string }[]>`
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = ${tableName}
      order by ordinal_position
    `,
    sqlTarget<{ column_name: string }[]>`
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = ${tableName}
    `
  ]);

  if (sourceCols.length === 0) {
    throw new Error(`Table "${tableName}" was not found in source database`);
  }
  if (targetCols.length === 0) {
    throw new Error(`Table "${tableName}" was not found in target database`);
  }

  const targetColNames = new Set(targetCols.map((c) => c.column_name));
  const commonCols = sourceCols
    .map((c) => c.column_name)
    .filter((name) => targetColNames.has(name));

  if (commonCols.length === 0) {
    throw new Error(`No matching columns found for table "${tableName}" between source and target`);
  }

  return commonCols;
}

async function copyTable(sqlSource: postgres.Sql, sqlTarget: postgres.Sql, table: TableConfig) {
  const columns = await getColumns(sqlSource, sqlTarget, table.name);
  const columnList = columns.map(quoteIdent).join(", ");
  const tableRef = quoteTable(table.name);
  const orderClause = table.primaryKey ? `order by ${quoteIdent(table.primaryKey)}` : "";

  console.log(`\nCopying ${table.name}...`);
  let offset = 0;
  let total = 0;

  // PostgreSQL parameter limit is 65535. We stay safely under it.
  const MAX_PARAMS = 60000;
  const batchSizeDynamic = Math.max(1, Math.floor(MAX_PARAMS / columns.length));

  for (; ;) {
    const rows = await sqlSource.unsafe<Record<string, unknown>[]>(
      `select ${columnList} from ${tableRef} ${orderClause} limit $1 offset $2`,
      [batchSizeDynamic, offset],
    );

    if (rows.length === 0) {
      break;
    }

    const params: postgres.ParameterOrJSON<never>[] = [];
    const valueGroups = rows.map((row) => {
      const placeholders = columns.map((column) => {
        params.push(row[column] as postgres.ParameterOrJSON<never>);
        return `$${params.length}`;
      });

      return `(${placeholders.join(", ")})`;
    });

    await sqlTarget.unsafe(
      `insert into ${tableRef} (${columnList}) overriding system value values ${valueGroups.join(", ")}`,
      params,
    );

    total += rows.length;
    offset += rows.length;
    console.log(`  inserted ${total} row(s)`);
  }

  console.log(`Finished ${table.name}: ${total} row(s) copied`);
}

async function resetSequence(sqlTarget: postgres.Sql, table: TableConfig) {
  if (!table.resetSequence || !table.primaryKey) {
    return;
  }

  const tableRef = quoteTable(table.name);
  const primaryKey = quoteIdent(table.primaryKey);

  await sqlTarget.unsafe(
    `
      select setval(
        $1,
        coalesce((select max(${primaryKey}) from ${tableRef}), 1),
        coalesce((select count(*) > 0 from ${tableRef}), false)
      )
    `,
    [table.resetSequence],
  );
}

async function main() {
  const targetUrl = rawTargetUrl;

  const sqlSource = postgres(sourceUrl, {
    ssl: "require",
    max: 1,
  });

  const sqlTarget = postgres(targetUrl, {
    ssl: "require",
    max: 1,
  });

  try {
    console.log("Source:", new URL(sourceUrl).pathname || "/");
    console.log("Target:", new URL(targetUrl).pathname || "/");

    await sqlTarget.begin(async (tx) => {
      const tableNames = TABLES.map((t) => quoteTable(t.name)).join(", ");
      await tx.unsafe(`truncate table ${tableNames} restart identity cascade`);

      for (const table of TABLES) {
        await copyTable(sqlSource, tx, table);
      }

      for (const table of TABLES) {
        await resetSequence(tx, table);
      }
    });

    console.log("\nMigration completed successfully.");
  } finally {
    await sqlSource.end();
    await sqlTarget.end();
  }
}

main().catch((error) => {
  console.error("\nMigration failed.");
  console.error(error);
  process.exit(1);
});
