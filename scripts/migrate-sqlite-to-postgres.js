import path from "path";
import BetterSqlite3 from "better-sqlite3";
import postgres from "postgres";
import {
  POSTGRES_BOOTSTRAP_STATEMENTS,
  POSTGRES_IMPORT_TABLE_ORDER,
} from "../lib/db/postgres-schema-statements.js";

const DATABASE_URL_ENV_BY_MODE = {
  romance: "ROMANCE_DATABASE_URL",
  friendship: "FRIENDSHIP_DATABASE_URL",
};

const SQLITE_PATH_BY_MODE = {
  romance: path.join(process.cwd(), "datematch.db"),
  friendship: path.join(process.cwd(), "datematch-friendship.db"),
};

const TIMESTAMP_FIELDS = {
  profiles: [
    "wechat_bound_at",
    "match_at",
    "eligible_release_at",
    "match_opt_out_until",
    "email_sent_at",
    "created_at",
  ],
  match_pairs: ["user_a_confirmed_at", "user_b_confirmed_at", "created_at"],
  profile_update_drafts: ["effective_at", "created_at", "updated_at"],
  chat_messages: ["created_at"],
  chat_notification_events: ["consumed_at", "email_consumed_at", "created_at"],
  chat_email_reminder_windows: ["last_sent_at", "created_at", "updated_at"],
};

const JSON_FIELDS = {
  profiles: ["personality_profile"],
  profile_update_drafts: ["draft_payload"],
};

const BOOLEAN_FIELDS = {
  profiles: ["wechat_notice_opt_in"],
};

function resolveTargetModes() {
  const requestedMode = process.argv[2]?.trim();

  if (!requestedMode) {
    return ["romance", "friendship"];
  }

  if (requestedMode === "romance" || requestedMode === "friendship") {
    return [requestedMode];
  }

  throw new Error(`Unsupported mode "${requestedMode}". Use "romance" or "friendship".`);
}

function getRequiredDatabaseUrl(mode) {
  const envKey = DATABASE_URL_ENV_BY_MODE[mode];
  const value = process.env[envKey]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${envKey}`);
  }

  return value;
}

function normalizeTimestampValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" && /[A-Za-z:-]/.test(value)) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  const ms = Math.abs(numeric) > 1_000_000_000_000 ? numeric : numeric * 1000;
  const parsed = new Date(ms);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeJsonValue(value) {
  if (value === null || value === undefined || value === "") {
    return {};
  }

  if (typeof value === "object") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  let current = value;

  for (let index = 0; index < 2; index += 1) {
    if (typeof current !== "string") {
      break;
    }

    try {
      current = JSON.parse(current);
    } catch {
      break;
    }
  }

  return current;
}

function normalizeBooleanValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  const normalized = String(value).trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return normalized === "true" || normalized === "1";
}

function normalizeRow(tableName, row) {
  const nextRow = { ...row };

  for (const field of TIMESTAMP_FIELDS[tableName] ?? []) {
    nextRow[field] = normalizeTimestampValue(nextRow[field]);
  }

  for (const field of JSON_FIELDS[tableName] ?? []) {
    nextRow[field] = normalizeJsonValue(nextRow[field]);
  }

  for (const field of BOOLEAN_FIELDS[tableName] ?? []) {
    nextRow[field] = normalizeBooleanValue(nextRow[field]);
  }

  return nextRow;
}

function chunkRows(rows, size) {
  const chunks = [];

  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }

  return chunks;
}

function tableExists(sqlite, tableName) {
  const row = sqlite
    .prepare(
      `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table' AND name = ?
      `
    )
    .get(tableName);

  return Boolean(row);
}

function readSqliteRows(sqlite, tableName) {
  if (!tableExists(sqlite, tableName)) {
    return [];
  }

  return sqlite.prepare(`SELECT * FROM ${tableName}`).all();
}

async function bootstrapSchema(sql) {
  for (const statement of POSTGRES_BOOTSTRAP_STATEMENTS) {
    await sql.unsafe(statement);
  }
}

async function truncateTables(sql) {
  for (const tableName of [...POSTGRES_IMPORT_TABLE_ORDER].reverse()) {
    await sql.unsafe(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;`);
  }
}

async function resetSequence(sql, tableName) {
  await sql.unsafe(`
    SELECT setval(
      pg_get_serial_sequence('${tableName}', 'id'),
      COALESCE((SELECT MAX(id) FROM ${tableName}), 1),
      true
    );
  `);
}

async function getTargetColumns(sql, tableName) {
  const rows = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${tableName}
    ORDER BY ordinal_position
  `;

  return new Set(rows.map((row) => row.column_name));
}

async function insertChunk(sql, tableName, rows, targetColumns) {
  const columns = Object.keys(rows[0]).filter((column) => targetColumns.has(column));
  const filteredRows = rows.map((row) =>
    Object.fromEntries(Object.entries(row).filter(([column]) => targetColumns.has(column)))
  );

  if (!columns.length) {
    return;
  }

  await sql`INSERT INTO ${sql(tableName)} ${sql(filteredRows, ...columns)}`;
}

async function migrateMode(mode) {
  const sqlite = new BetterSqlite3(SQLITE_PATH_BY_MODE[mode], { readonly: true });
  const sql = postgres(getRequiredDatabaseUrl(mode), {
    max: 1,
    prepare: false,
  });

  try {
    await bootstrapSchema(sql);
    await truncateTables(sql);

    for (const tableName of POSTGRES_IMPORT_TABLE_ORDER) {
      const targetColumns = await getTargetColumns(sql, tableName);
      const sourceRows = readSqliteRows(sqlite, tableName);
      const normalizedRows = sourceRows.map((row) => normalizeRow(tableName, row));

      if (!normalizedRows.length) {
        console.log(`[${mode}] ${tableName}: 0 rows`);
        continue;
      }

      for (const chunk of chunkRows(normalizedRows, 500)) {
        await insertChunk(sql, tableName, chunk, targetColumns);
      }

      await resetSequence(sql, tableName);
      console.log(`[${mode}] ${tableName}: ${normalizedRows.length} rows`);
    }
  } finally {
    sqlite.close();
    await sql.end({ timeout: 5 });
  }
}

async function main() {
  const modes = resolveTargetModes();

  for (const mode of modes) {
    await migrateMode(mode);
  }
}

main().catch((error) => {
  console.error("Failed to migrate SQLite data to PostgreSQL:", error);
  process.exitCode = 1;
});
