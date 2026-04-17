import path from "path";
import BetterSqlite3 from "better-sqlite3";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { PG_TABLES } from "../lib/db/schema-pg";
import {
  POSTGRES_BOOTSTRAP_STATEMENTS,
  POSTGRES_IMPORT_TABLE_ORDER,
} from "../lib/db/postgres-schema-statements.js";

type QuizMode = "romance" | "friendship";
type TableName = (typeof POSTGRES_IMPORT_TABLE_ORDER)[number];

const DATABASE_URL_ENV_BY_MODE: Record<QuizMode, string> = {
  romance: "ROMANCE_DATABASE_URL",
  friendship: "FRIENDSHIP_DATABASE_URL",
};

const SQLITE_PATH_BY_MODE: Record<QuizMode, string> = {
  romance: path.join(process.cwd(), "datematch.db"),
  friendship: path.join(process.cwd(), "datematch-friendship.db"),
};

const TABLE_DEFINITIONS: Record<TableName, unknown> = {
  profiles: PG_TABLES.profiles,
  email_login_tokens: PG_TABLES.emailLoginTokens,
  match_pairs: PG_TABLES.matchPairs,
  profile_update_drafts: PG_TABLES.profileUpdateDrafts,
  chat_messages: PG_TABLES.chatMessages,
  chat_notification_events: PG_TABLES.chatNotificationEvents,
  chat_email_reminder_windows: PG_TABLES.chatEmailReminderWindows,
};

const TIMESTAMP_FIELDS: Partial<Record<TableName, string[]>> = {
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

const JSON_FIELDS: Partial<Record<TableName, string[]>> = {
  profiles: ["personality_profile"],
  profile_update_drafts: ["draft_payload"],
};

const BOOLEAN_FIELDS: Partial<Record<TableName, string[]>> = {
  profiles: ["wechat_notice_opt_in"],
};

function resolveTargetModes(): QuizMode[] {
  const requestedMode = process.argv[2]?.trim();

  if (!requestedMode) {
    return ["romance", "friendship"];
  }

  if (requestedMode === "romance" || requestedMode === "friendship") {
    return [requestedMode];
  }

  throw new Error(`Unsupported mode "${requestedMode}". Use "romance" or "friendship".`);
}

function getRequiredDatabaseUrl(mode: QuizMode) {
  const envKey = DATABASE_URL_ENV_BY_MODE[mode];
  const value = process.env[envKey]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${envKey}`);
  }

  return value;
}

function normalizeTimestampValue(value: unknown) {
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

function normalizeJsonValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return {};
  }

  if (typeof value === "object") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  let current: unknown = value;

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

function normalizeBooleanValue(value: unknown) {
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

function normalizeRow(tableName: TableName, row: Record<string, unknown>) {
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

function chunkRows<T>(rows: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }

  return chunks;
}

function tableExists(sqlite: InstanceType<typeof BetterSqlite3>, tableName: string) {
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

function readSqliteRows(sqlite: InstanceType<typeof BetterSqlite3>, tableName: TableName) {
  if (!tableExists(sqlite, tableName)) {
    return [] as Array<Record<string, unknown>>;
  }

  return sqlite.prepare(`SELECT * FROM ${tableName}`).all() as Array<Record<string, unknown>>;
}

async function bootstrapSchema(sql: ReturnType<typeof postgres>) {
  for (const statement of POSTGRES_BOOTSTRAP_STATEMENTS) {
    await sql.unsafe(statement);
  }
}

async function truncateTables(sql: ReturnType<typeof postgres>) {
  for (const tableName of [...POSTGRES_IMPORT_TABLE_ORDER].reverse()) {
    await sql.unsafe(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;`);
  }
}

async function resetSequence(sql: ReturnType<typeof postgres>, tableName: TableName) {
  await sql.unsafe(`
    SELECT setval(
      pg_get_serial_sequence('${tableName}', 'id'),
      COALESCE((SELECT MAX(id) FROM ${tableName}), 1),
      true
    );
  `);
}

async function migrateMode(mode: QuizMode) {
  const sqlite = new BetterSqlite3(SQLITE_PATH_BY_MODE[mode], { readonly: true });
  const sql = postgres(getRequiredDatabaseUrl(mode), {
    max: 1,
    prepare: false,
  });
  const db = drizzle(sql);

  try {
    await bootstrapSchema(sql);
    await truncateTables(sql);

    for (const tableName of POSTGRES_IMPORT_TABLE_ORDER) {
      const sourceRows = readSqliteRows(sqlite, tableName);
      const normalizedRows = sourceRows.map((row) => normalizeRow(tableName, row));

      if (!normalizedRows.length) {
        console.log(`[${mode}] ${tableName}: 0 rows`);
        continue;
      }

      for (const chunk of chunkRows(normalizedRows, 500)) {
        await db.insert(TABLE_DEFINITIONS[tableName] as never).values(chunk as never);
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
