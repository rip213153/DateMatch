import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

const sqlitePath = path.join(process.cwd(), "datematch.db");
console.log("Database path:", sqlitePath);
const sqlite = new Database(sqlitePath);

// Lightweight migration: ensure profiles.chat_user_id exists.
try {
  sqlite.exec("ALTER TABLE profiles ADD COLUMN chat_user_id TEXT");
  console.log("Added profiles.chat_user_id column");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes("duplicate column name")) {
    console.error("Failed to ensure profiles.chat_user_id column:", error);
  }
}

// Lightweight migration: ensure email login tokens table exists.
try {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS email_login_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS email_login_tokens_token_hash_unique
      ON email_login_tokens(token_hash);

    CREATE INDEX IF NOT EXISTS email_login_tokens_email_created_idx
      ON email_login_tokens(email, created_at);

    CREATE INDEX IF NOT EXISTS email_login_tokens_expires_idx
      ON email_login_tokens(expires_at);
  `);
  console.log("Ensured email_login_tokens table exists");
} catch (error) {
  console.error("Failed to ensure email_login_tokens table:", error);
}

// Lightweight migration: ensure mutual confirmation table exists.
try {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS match_confirmations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      target_user_id INTEGER NOT NULL,
      confirmed_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(user_id, target_user_id)
    );
  `);
  console.log("Ensured match_confirmations table exists");
} catch (error) {
  console.error("Failed to ensure match_confirmations table:", error);
}

// Lightweight migration: ensure chat messages table exists.
try {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE INDEX IF NOT EXISTS chat_messages_sender_idx
      ON chat_messages(sender_id);

    CREATE INDEX IF NOT EXISTS chat_messages_receiver_idx
      ON chat_messages(receiver_id);

    CREATE INDEX IF NOT EXISTS chat_messages_pair_created_idx
      ON chat_messages(sender_id, receiver_id, created_at);
  `);
  console.log("Ensured chat_messages table exists");
} catch (error) {
  console.error("Failed to ensure chat_messages table:", error);
}

// Lightweight migration: ensure profiles.email_sent_at exists.
try {
  sqlite.exec("ALTER TABLE profiles ADD COLUMN email_sent_at INTEGER");
  console.log("Added profiles.email_sent_at column");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes("duplicate column name")) {
    console.error("Failed to ensure profiles.email_sent_at column:", error);
  }
}

export const db = drizzle(sqlite);

export function getDb() {
  return db;
}
