import { drizzle } from "drizzle-orm/better-sqlite3";
import BetterSqlite3 from "better-sqlite3";
import path from "path";
import type { QuizMode } from "@/app/data/types";
import { runPendingMigrations } from "@/lib/db/migrations";

function getSqlitePathForMode(mode: QuizMode) {
  return path.join(process.cwd(), mode === "friendship" ? "datematch-friendship.db" : "datematch.db");
}

function createDatabaseState(mode: QuizMode) {
  const sqlite = new BetterSqlite3(getSqlitePathForMode(mode));

  return {
    sqlite,
    db: drizzle(sqlite),
    initialized: false,
  };
}

type DatabaseState = ReturnType<typeof createDatabaseState>;

const globalForDatabase = globalThis as typeof globalThis & {
  __datematchDatabaseStates?: Partial<Record<QuizMode, DatabaseState>>;
};

function getDatabaseState(mode: QuizMode) {
  const states = globalForDatabase.__datematchDatabaseStates ?? ({} as Partial<Record<QuizMode, DatabaseState>>);
  globalForDatabase.__datematchDatabaseStates = states;

  const existing = states[mode];
  if (existing) {
    if (!existing.initialized) {
      runPendingMigrations(existing.sqlite, mode);
      existing.initialized = true;
    }
    return existing;
  }

  const created = createDatabaseState(mode);
  states[mode] = created;
  runPendingMigrations(created.sqlite, mode);
  created.initialized = true;
  return created;
}

export function resolveQuizMode(value: unknown): QuizMode {
  return value === "friendship" ? "friendship" : "romance";
}

export function getDbForMode(mode: QuizMode) {
  return getDatabaseState(mode).db;
}

export function getDb() {
  return getDbForMode("romance");
}
