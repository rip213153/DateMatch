import { drizzle } from "drizzle-orm/better-sqlite3";
import BetterSqlite3 from "better-sqlite3";
import path from "path";
import type { QuizMode } from "@/app/data/types";

const romanceSqlitePath = path.join(process.cwd(), "datematch.db");
const friendshipSqlitePath = path.join(process.cwd(), "datematch-friendship.db");

function ensureDatabase(sqlite: InstanceType<typeof BetterSqlite3>, label: string) {
  console.log(`Database path (${label}):`, sqlite.name);

  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        seeking TEXT NOT NULL,
        university TEXT NOT NULL,
        email TEXT NOT NULL,
        chat_user_id TEXT,
        wechat_open_id TEXT,
        wechat_union_id TEXT,
        wechat_notice_opt_in INTEGER NOT NULL DEFAULT 0,
        wechat_bound_at INTEGER,
        interests TEXT,
        ideal_date TEXT NOT NULL,
        ideal_date_tags TEXT NOT NULL DEFAULT '[]',
        bio TEXT,
        personality_profile TEXT NOT NULL,
        matching_status TEXT DEFAULT 'WAITING',
        match_at INTEGER,
        eligible_release_at INTEGER,
        match_opt_out_until INTEGER,
        email_sent_at INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      CREATE UNIQUE INDEX IF NOT EXISTS email_unique
        ON profiles(email);

      CREATE UNIQUE INDEX IF NOT EXISTS profiles_wechat_open_id_unique
        ON profiles(wechat_open_id);
    `);
    console.log(`Ensured profiles table exists (${label})`);
  } catch (error) {
    console.error(`Failed to ensure profiles table (${label}):`, error);
  }

  try {
    sqlite.exec("ALTER TABLE profiles ADD COLUMN chat_user_id TEXT");
    console.log(`Added profiles.chat_user_id column (${label})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("duplicate column name")) {
      console.error(`Failed to ensure profiles.chat_user_id column (${label}):`, error);
    }
  }

  try {
    sqlite.exec("ALTER TABLE profiles ADD COLUMN ideal_date_tags TEXT NOT NULL DEFAULT '[]'");
    console.log(`Added profiles.ideal_date_tags column (${label})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("duplicate column name")) {
      console.error(`Failed to ensure profiles.ideal_date_tags column (${label}):`, error);
    }
  }

  try {
    sqlite.exec("ALTER TABLE profiles ADD COLUMN wechat_open_id TEXT");
    console.log(`Added profiles.wechat_open_id column (${label})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("duplicate column name")) {
      console.error(`Failed to ensure profiles.wechat_open_id column (${label}):`, error);
    }
  }

  try {
    sqlite.exec("ALTER TABLE profiles ADD COLUMN wechat_union_id TEXT");
    console.log(`Added profiles.wechat_union_id column (${label})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("duplicate column name")) {
      console.error(`Failed to ensure profiles.wechat_union_id column (${label}):`, error);
    }
  }

  try {
    sqlite.exec("ALTER TABLE profiles ADD COLUMN wechat_notice_opt_in INTEGER NOT NULL DEFAULT 0");
    console.log(`Added profiles.wechat_notice_opt_in column (${label})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("duplicate column name")) {
      console.error(`Failed to ensure profiles.wechat_notice_opt_in column (${label}):`, error);
    }
  }

  try {
    sqlite.exec("ALTER TABLE profiles ADD COLUMN wechat_bound_at INTEGER");
    console.log(`Added profiles.wechat_bound_at column (${label})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("duplicate column name")) {
      console.error(`Failed to ensure profiles.wechat_bound_at column (${label}):`, error);
    }
  }

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
    console.log(`Ensured email_login_tokens table exists (${label})`);
  } catch (error) {
    console.error(`Failed to ensure email_login_tokens table (${label}):`, error);
  }

  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS match_pairs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        round_key TEXT NOT NULL,
        mode TEXT NOT NULL,
        user_a_id INTEGER NOT NULL,
        user_b_id INTEGER NOT NULL,
        base_score REAL NOT NULL,
        user_a_rank INTEGER NOT NULL,
        user_b_rank INTEGER NOT NULL,
        pair_score REAL NOT NULL,
        user_a_confirmed_at INTEGER,
        user_b_confirmed_at INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        UNIQUE(round_key, user_a_id, user_b_id)
      );

      CREATE INDEX IF NOT EXISTS match_pairs_round_score_idx
        ON match_pairs(round_key, pair_score);

      CREATE INDEX IF NOT EXISTS match_pairs_round_user_a_idx
        ON match_pairs(round_key, user_a_id);

      CREATE INDEX IF NOT EXISTS match_pairs_round_user_b_idx
        ON match_pairs(round_key, user_b_id);
    `);
    console.log(`Ensured match_pairs table exists (${label})`);
  } catch (error) {
    console.error(`Failed to ensure match_pairs table (${label}):`, error);
  }

  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS profile_update_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        mode TEXT NOT NULL,
        draft_payload TEXT NOT NULL,
        effective_at INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        UNIQUE(user_id)
      );

      CREATE INDEX IF NOT EXISTS profile_update_drafts_status_effective_idx
        ON profile_update_drafts(status, effective_at);
    `);
    console.log(`Ensured profile_update_drafts table exists (${label})`);
  } catch (error) {
    console.error(`Failed to ensure profile_update_drafts table (${label}):`, error);
  }

  try {
    sqlite.exec("ALTER TABLE match_pairs ADD COLUMN user_a_confirmed_at INTEGER");
    console.log(`Added match_pairs.user_a_confirmed_at column (${label})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("duplicate column name")) {
      console.error(`Failed to ensure match_pairs.user_a_confirmed_at column (${label}):`, error);
    }
  }

  try {
    sqlite.exec("ALTER TABLE match_pairs ADD COLUMN user_b_confirmed_at INTEGER");
    console.log(`Added match_pairs.user_b_confirmed_at column (${label})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("duplicate column name")) {
      console.error(`Failed to ensure match_pairs.user_b_confirmed_at column (${label}):`, error);
    }
  }

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
    console.log(`Ensured chat_messages table exists (${label})`);
  } catch (error) {
    console.error(`Failed to ensure chat_messages table (${label}):`, error);
  }

  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS chat_notification_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        event_type TEXT NOT NULL DEFAULT 'NEW_MESSAGE',
        status TEXT NOT NULL DEFAULT 'PENDING',
        last_error TEXT,
        consumed_at INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      CREATE INDEX IF NOT EXISTS chat_notification_events_receiver_status_idx
        ON chat_notification_events(receiver_id, status, created_at);

      CREATE INDEX IF NOT EXISTS chat_notification_events_message_idx
        ON chat_notification_events(message_id);
    `);
    console.log(`Ensured chat_notification_events table exists (${label})`);
  } catch (error) {
    console.error(`Failed to ensure chat_notification_events table (${label}):`, error);
  }

  try {
    sqlite.exec("ALTER TABLE profiles ADD COLUMN email_sent_at INTEGER");
    console.log(`Added profiles.email_sent_at column (${label})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("duplicate column name")) {
      console.error(`Failed to ensure profiles.email_sent_at column (${label}):`, error);
    }
  }

  try {
    sqlite.exec("ALTER TABLE profiles ADD COLUMN match_opt_out_until INTEGER");
    console.log(`Added profiles.match_opt_out_until column (${label})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("duplicate column name")) {
      console.error(`Failed to ensure profiles.match_opt_out_until column (${label}):`, error);
    }
  }

  try {
    sqlite.exec("ALTER TABLE profiles ADD COLUMN eligible_release_at INTEGER");
    console.log(`Added profiles.eligible_release_at column (${label})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("duplicate column name")) {
      console.error(`Failed to ensure profiles.eligible_release_at column (${label}):`, error);
    }
  }
}

const romanceSqlite = new BetterSqlite3(romanceSqlitePath);
const friendshipSqlite = new BetterSqlite3(friendshipSqlitePath);

ensureDatabase(romanceSqlite, "romance");
ensureDatabase(friendshipSqlite, "friendship");

export const romanceDb = drizzle(romanceSqlite);
export const friendshipDb = drizzle(friendshipSqlite);

export const db = romanceDb;

export function resolveQuizMode(value: unknown): QuizMode {
  return value === "friendship" ? "friendship" : "romance";
}

export function getDbForMode(mode: QuizMode) {
  return mode === "friendship" ? friendshipDb : romanceDb;
}

export function getDb() {
  return db;
}
