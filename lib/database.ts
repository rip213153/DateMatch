import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import BetterSqlite3 from "better-sqlite3";
import postgres from "postgres";
import path from "path";
import type { QuizMode } from "@/app/data/types";
import { runPendingMigrations } from "@/lib/db/migrations";
import { PG_TABLES } from "@/lib/db/schema-pg";
import { SQLITE_TABLES } from "@/lib/db/schema-sqlite";

const DATABASE_URL_ENV_BY_MODE = {
  romance: "ROMANCE_DATABASE_URL",
  friendship: "FRIENDSHIP_DATABASE_URL",
} as const;

type SqliteDatabase = ReturnType<typeof drizzleSqlite>;
type PostgresDatabase = ReturnType<typeof drizzlePostgres>;

type DatabaseState =
  | {
      backend: "sqlite";
      sqlite: InstanceType<typeof BetterSqlite3>;
      db: SqliteDatabase;
      tables: typeof SQLITE_TABLES;
      initialized: boolean;
    }
  | {
      backend: "postgres";
      sql: ReturnType<typeof postgres>;
      db: PostgresDatabase;
      tables: typeof PG_TABLES;
      initialized: boolean;
    };

function getSqlitePathForMode(mode: QuizMode) {
  return path.join(process.cwd(), mode === "friendship" ? "datematch-friendship.db" : "datematch.db");
}

function getConfiguredDatabaseUrlForMode(mode: QuizMode) {
  const envKey = DATABASE_URL_ENV_BY_MODE[mode];
  const raw = process.env[envKey];
  const normalized = typeof raw === "string" ? raw.trim() : "";
  return normalized || null;
}

function createSqliteDatabaseStateForMode(mode: QuizMode): DatabaseState {
  const sqlite = new BetterSqlite3(getSqlitePathForMode(mode));

  return {
    backend: "sqlite",
    sqlite,
    db: drizzleSqlite(sqlite),
    tables: SQLITE_TABLES,
    initialized: false,
  };
}

function createPostgresDatabaseState(mode: QuizMode, connectionString: string): DatabaseState {
  const sql = postgres(connectionString, {
    max: 1,
    prepare: false,
  });

  return {
    backend: "postgres",
    sql,
    db: drizzlePostgres(sql),
    tables: PG_TABLES,
    initialized: true,
  };
}

const globalForDatabase = globalThis as typeof globalThis & {
  __datematchDatabaseStates?: Partial<Record<QuizMode, DatabaseState>>;
};

function getDatabaseState(mode: QuizMode) {
  const states = globalForDatabase.__datematchDatabaseStates ?? ({} as Partial<Record<QuizMode, DatabaseState>>);
  globalForDatabase.__datematchDatabaseStates = states;

  const existing = states[mode];
  if (existing) {
    if (existing.backend === "sqlite" && !existing.initialized) {
      runPendingMigrations(existing.sqlite, mode);
      existing.initialized = true;
    }
    return existing;
  }

  const configuredDatabaseUrl = getConfiguredDatabaseUrlForMode(mode);
  const created = configuredDatabaseUrl
    ? createPostgresDatabaseState(mode, configuredDatabaseUrl)
    : createSqliteDatabaseStateForMode(mode);
  states[mode] = created;
  if (created.backend === "sqlite" && !created.initialized) {
    runPendingMigrations(created.sqlite, mode);
    created.initialized = true;
  }
  return created;
}

export function resolveQuizMode(value: unknown): QuizMode {
  return value === "friendship" ? "friendship" : "romance";
}

export function getDbForMode(mode: QuizMode) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getDatabaseState(mode).db as any;
}

export function getTablesForMode(mode: QuizMode) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getDatabaseState(mode).tables as any;
}

export function getDatabaseContextForMode(mode: QuizMode) {
  const state = getDatabaseState(mode);
  return {
    backend: state.backend,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db: state.db as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tables: state.tables as any,
  };
}

export function getDb() {
  return getDbForMode("romance");
}
