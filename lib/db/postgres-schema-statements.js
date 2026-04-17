export const POSTGRES_BOOTSTRAP_STATEMENTS = [
  `
    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      seeking TEXT NOT NULL,
      university TEXT NOT NULL,
      email TEXT NOT NULL,
      instagram TEXT,
      chat_user_id TEXT,
      wechat_open_id TEXT,
      wechat_union_id TEXT,
      wechat_notice_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
      wechat_bound_at TIMESTAMPTZ,
      interests TEXT,
      ideal_date TEXT NOT NULL,
      ideal_date_tags TEXT NOT NULL DEFAULT '[]',
      bio TEXT,
      personality_profile JSONB NOT NULL,
      matching_status TEXT DEFAULT 'WAITING',
      match_at TIMESTAMPTZ,
      eligible_release_at TIMESTAMPTZ,
      match_opt_out_until TIMESTAMPTZ,
      email_sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram TEXT;`,
  `CREATE UNIQUE INDEX IF NOT EXISTS email_unique ON profiles(email);`,
  `CREATE UNIQUE INDEX IF NOT EXISTS profiles_wechat_open_id_unique ON profiles(wechat_open_id);`,
  `
    CREATE TABLE IF NOT EXISTS email_login_tokens (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      created_at INTEGER NOT NULL
    );
  `,
  `CREATE UNIQUE INDEX IF NOT EXISTS email_login_tokens_token_hash_unique ON email_login_tokens(token_hash);`,
  `CREATE INDEX IF NOT EXISTS email_login_tokens_email_created_idx ON email_login_tokens(email, created_at);`,
  `CREATE INDEX IF NOT EXISTS email_login_tokens_expires_idx ON email_login_tokens(expires_at);`,
  `
    CREATE TABLE IF NOT EXISTS match_pairs (
      id SERIAL PRIMARY KEY,
      round_key TEXT NOT NULL,
      mode TEXT NOT NULL,
      user_a_id INTEGER NOT NULL,
      user_b_id INTEGER NOT NULL,
      base_score DOUBLE PRECISION NOT NULL,
      user_a_rank INTEGER NOT NULL,
      user_b_rank INTEGER NOT NULL,
      pair_score DOUBLE PRECISION NOT NULL,
      user_a_confirmed_at TIMESTAMPTZ,
      user_b_confirmed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `CREATE UNIQUE INDEX IF NOT EXISTS match_pairs_round_pair_unique ON match_pairs(round_key, user_a_id, user_b_id);`,
  `CREATE INDEX IF NOT EXISTS match_pairs_round_score_idx ON match_pairs(round_key, pair_score);`,
  `CREATE INDEX IF NOT EXISTS match_pairs_round_user_a_idx ON match_pairs(round_key, user_a_id);`,
  `CREATE INDEX IF NOT EXISTS match_pairs_round_user_b_idx ON match_pairs(round_key, user_b_id);`,
  `CREATE INDEX IF NOT EXISTS match_pairs_mode_created_idx ON match_pairs(mode, created_at);`,
  `
    CREATE TABLE IF NOT EXISTS profile_update_drafts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      mode TEXT NOT NULL,
      draft_payload JSONB NOT NULL,
      effective_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `CREATE UNIQUE INDEX IF NOT EXISTS profile_update_drafts_user_unique ON profile_update_drafts(user_id);`,
  `CREATE INDEX IF NOT EXISTS profile_update_drafts_status_effective_idx ON profile_update_drafts(status, effective_at);`,
  `
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      round_key TEXT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `CREATE INDEX IF NOT EXISTS chat_messages_round_idx ON chat_messages(round_key);`,
  `CREATE INDEX IF NOT EXISTS chat_messages_sender_idx ON chat_messages(sender_id);`,
  `CREATE INDEX IF NOT EXISTS chat_messages_receiver_idx ON chat_messages(receiver_id);`,
  `CREATE INDEX IF NOT EXISTS chat_messages_pair_created_idx ON chat_messages(sender_id, receiver_id, created_at);`,
  `CREATE INDEX IF NOT EXISTS chat_messages_round_pair_created_idx ON chat_messages(round_key, sender_id, receiver_id, created_at);`,
  `
    CREATE TABLE IF NOT EXISTS chat_notification_events (
      id SERIAL PRIMARY KEY,
      message_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      event_type TEXT NOT NULL DEFAULT 'NEW_MESSAGE',
      status TEXT NOT NULL DEFAULT 'PENDING',
      last_error TEXT,
      consumed_at TIMESTAMPTZ,
      email_status TEXT NOT NULL DEFAULT 'PENDING',
      email_last_error TEXT,
      email_consumed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `CREATE INDEX IF NOT EXISTS chat_notification_events_receiver_status_idx ON chat_notification_events(receiver_id, status, created_at);`,
  `CREATE INDEX IF NOT EXISTS chat_notification_events_receiver_email_status_idx ON chat_notification_events(receiver_id, email_status, created_at);`,
  `CREATE INDEX IF NOT EXISTS chat_notification_events_message_idx ON chat_notification_events(message_id);`,
  `
    CREATE TABLE IF NOT EXISTS chat_email_reminder_windows (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      last_sent_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  `CREATE UNIQUE INDEX IF NOT EXISTS chat_email_reminder_windows_sender_receiver_unique ON chat_email_reminder_windows(sender_id, receiver_id);`,
  `CREATE INDEX IF NOT EXISTS chat_email_reminder_windows_receiver_last_sent_idx ON chat_email_reminder_windows(receiver_id, last_sent_at);`,
];

export const POSTGRES_IMPORT_TABLE_ORDER = [
  "profiles",
  "email_login_tokens",
  "match_pairs",
  "profile_update_drafts",
  "chat_messages",
  "chat_notification_events",
  "chat_email_reminder_windows",
];
