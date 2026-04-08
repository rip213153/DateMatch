import BetterSqlite3 from "better-sqlite3";

function runStatement(sqlite: InstanceType<typeof BetterSqlite3>, statement: string) {
  sqlite.exec(statement);
}

function runAddColumn(
  sqlite: InstanceType<typeof BetterSqlite3>,
  statement: string,
  duplicateColumnMessage: string = "duplicate column name",
) {
  try {
    sqlite.exec(statement);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(duplicateColumnMessage)) {
      throw error;
    }
  }
}

export const initialSchemaMigration = {
  id: "001-initial-schema",
  description: "Create the baseline DateMatch tables and indexes.",
  apply(sqlite: InstanceType<typeof BetterSqlite3>) {
    runStatement(
      sqlite,
      `
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
      `,
    );

    runAddColumn(sqlite, "ALTER TABLE profiles ADD COLUMN chat_user_id TEXT");
    runAddColumn(sqlite, "ALTER TABLE profiles ADD COLUMN ideal_date_tags TEXT NOT NULL DEFAULT '[]'");
    runAddColumn(sqlite, "ALTER TABLE profiles ADD COLUMN wechat_open_id TEXT");
    runAddColumn(sqlite, "ALTER TABLE profiles ADD COLUMN wechat_union_id TEXT");
    runAddColumn(sqlite, "ALTER TABLE profiles ADD COLUMN wechat_notice_opt_in INTEGER NOT NULL DEFAULT 0");
    runAddColumn(sqlite, "ALTER TABLE profiles ADD COLUMN wechat_bound_at INTEGER");
    runAddColumn(sqlite, "ALTER TABLE profiles ADD COLUMN email_sent_at INTEGER");
    runAddColumn(sqlite, "ALTER TABLE profiles ADD COLUMN match_opt_out_until INTEGER");
    runAddColumn(sqlite, "ALTER TABLE profiles ADD COLUMN eligible_release_at INTEGER");

    runStatement(
      sqlite,
      `
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
      `,
    );

    runStatement(
      sqlite,
      `
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

        CREATE INDEX IF NOT EXISTS match_pairs_mode_created_idx
          ON match_pairs(mode, created_at);
      `,
    );

    runAddColumn(sqlite, "ALTER TABLE match_pairs ADD COLUMN user_a_confirmed_at INTEGER");
    runAddColumn(sqlite, "ALTER TABLE match_pairs ADD COLUMN user_b_confirmed_at INTEGER");

    runStatement(
      sqlite,
      `
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
      `,
    );

    runStatement(
      sqlite,
      `
        CREATE TABLE IF NOT EXISTS chat_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          round_key TEXT,
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
      `,
    );

    runAddColumn(sqlite, "ALTER TABLE chat_messages ADD COLUMN round_key TEXT");

    runStatement(
      sqlite,
      `
        CREATE INDEX IF NOT EXISTS chat_messages_round_idx
          ON chat_messages(round_key);

        CREATE INDEX IF NOT EXISTS chat_messages_round_pair_created_idx
          ON chat_messages(round_key, sender_id, receiver_id, created_at);
      `,
    );

    runStatement(
      sqlite,
      `
        CREATE TABLE IF NOT EXISTS chat_notification_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          message_id INTEGER NOT NULL,
          sender_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          event_type TEXT NOT NULL DEFAULT 'NEW_MESSAGE',
          status TEXT NOT NULL DEFAULT 'PENDING',
          last_error TEXT,
          consumed_at INTEGER,
          email_status TEXT NOT NULL DEFAULT 'PENDING',
          email_last_error TEXT,
          email_consumed_at INTEGER,
          created_at INTEGER DEFAULT (strftime('%s', 'now'))
        );

        CREATE INDEX IF NOT EXISTS chat_notification_events_receiver_status_idx
          ON chat_notification_events(receiver_id, status, created_at);

        CREATE INDEX IF NOT EXISTS chat_notification_events_receiver_email_status_idx
          ON chat_notification_events(receiver_id, email_status, created_at);

        CREATE INDEX IF NOT EXISTS chat_notification_events_message_idx
          ON chat_notification_events(message_id);
      `,
    );

    runAddColumn(sqlite, "ALTER TABLE chat_notification_events ADD COLUMN email_status TEXT NOT NULL DEFAULT 'PENDING'");
    runAddColumn(sqlite, "ALTER TABLE chat_notification_events ADD COLUMN email_last_error TEXT");
    runAddColumn(sqlite, "ALTER TABLE chat_notification_events ADD COLUMN email_consumed_at INTEGER");

    runStatement(
      sqlite,
      `
        CREATE INDEX IF NOT EXISTS chat_notification_events_receiver_email_status_idx
          ON chat_notification_events(receiver_id, email_status, created_at);
      `,
    );

    runStatement(
      sqlite,
      `
        CREATE TABLE IF NOT EXISTS chat_email_reminder_windows (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          last_sent_at INTEGER NOT NULL,
          created_at INTEGER DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER DEFAULT (strftime('%s', 'now')),
          UNIQUE(sender_id, receiver_id)
        );

        CREATE INDEX IF NOT EXISTS chat_email_reminder_windows_receiver_last_sent_idx
          ON chat_email_reminder_windows(receiver_id, last_sent_at);
      `,
    );
  },
};
