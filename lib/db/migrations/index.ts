import BetterSqlite3 from "better-sqlite3";
import { initialSchemaMigration } from "./001-initial-schema";

export type DatabaseMigration = {
  id: string;
  description: string;
  apply: (sqlite: InstanceType<typeof BetterSqlite3>) => void;
};

const MIGRATION_KEY_PREFIX = "migration:";

export const DATABASE_MIGRATIONS: DatabaseMigration[] = [initialSchemaMigration];

function buildMigrationMetadataKey(id: string) {
  return `${MIGRATION_KEY_PREFIX}${id}`;
}

export function ensureMigrationMetadataTable(sqlite: InstanceType<typeof BetterSqlite3>) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS database_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);
}

export function listAppliedMigrationIds(sqlite: InstanceType<typeof BetterSqlite3>) {
  ensureMigrationMetadataTable(sqlite);

  const rows = sqlite
    .prepare(
      `
        SELECT key
        FROM database_metadata
        WHERE key LIKE ?
        ORDER BY key ASC
      `,
    )
    .all(`${MIGRATION_KEY_PREFIX}%`) as Array<{ key: string }>;

  return new Set(rows.map((row) => row.key.slice(MIGRATION_KEY_PREFIX.length)));
}

function markMigrationAsApplied(sqlite: InstanceType<typeof BetterSqlite3>, migrationId: string) {
  sqlite
    .prepare(
      `
        INSERT INTO database_metadata (key, value, updated_at)
        VALUES (?, ?, strftime('%s', 'now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `,
    )
    .run(buildMigrationMetadataKey(migrationId), "applied");
}

export function runPendingMigrations(sqlite: InstanceType<typeof BetterSqlite3>, label: string) {
  const appliedMigrationIds = listAppliedMigrationIds(sqlite);

  for (const migration of DATABASE_MIGRATIONS) {
    if (appliedMigrationIds.has(migration.id)) {
      continue;
    }

    console.info(`Running database migration (${label}): ${migration.id}`);
    migration.apply(sqlite);
    markMigrationAsApplied(sqlite, migration.id);
  }
}
