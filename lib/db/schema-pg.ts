import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const profiles = pgTable(
  "profiles",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    age: integer("age").notNull(),
    gender: text("gender").notNull(),
    seeking: text("seeking").notNull(),
    university: text("university").notNull(),
    email: text("email").notNull(),
    instagram: text("instagram"),
    chat_user_id: text("chat_user_id"),
    wechat_open_id: text("wechat_open_id"),
    wechat_union_id: text("wechat_union_id"),
    wechat_notice_opt_in: boolean("wechat_notice_opt_in").notNull().default(false),
    wechat_bound_at: timestamp("wechat_bound_at", { withTimezone: true, mode: "date" }),
    interests: text("interests"),
    ideal_date: text("ideal_date").notNull(),
    ideal_date_tags: text("ideal_date_tags").notNull().default("[]"),
    bio: text("bio"),
    personality_profile: jsonb("personality_profile").notNull(),
    matching_status: text("matching_status").default("WAITING"),
    match_at: timestamp("match_at", { withTimezone: true, mode: "date" }),
    eligible_release_at: timestamp("eligible_release_at", { withTimezone: true, mode: "date" }),
    match_opt_out_until: timestamp("match_opt_out_until", { withTimezone: true, mode: "date" }),
    email_sent_at: timestamp("email_sent_at", { withTimezone: true, mode: "date" }),
    created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
  },
  (table) => ({
    emailUnique: uniqueIndex("email_unique").on(table.email),
    wechatOpenIdUnique: uniqueIndex("profiles_wechat_open_id_unique").on(table.wechat_open_id),
  })
);

export const emailLoginTokens = pgTable(
  "email_login_tokens",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    code_hash: text("code_hash").notNull(),
    token_hash: text("token_hash").notNull(),
    expires_at: integer("expires_at").notNull(),
    used_at: integer("used_at"),
    created_at: integer("created_at").notNull(),
  },
  (table) => ({
    tokenHashUnique: uniqueIndex("email_login_tokens_token_hash_unique").on(table.token_hash),
    emailCreatedIdx: index("email_login_tokens_email_created_idx").on(table.email, table.created_at),
    expiresIdx: index("email_login_tokens_expires_idx").on(table.expires_at),
  })
);

export const matchPairs = pgTable(
  "match_pairs",
  {
    id: serial("id").primaryKey(),
    round_key: text("round_key").notNull(),
    mode: text("mode").notNull(),
    user_a_id: integer("user_a_id").notNull(),
    user_b_id: integer("user_b_id").notNull(),
    base_score: doublePrecision("base_score").notNull(),
    user_a_rank: integer("user_a_rank").notNull(),
    user_b_rank: integer("user_b_rank").notNull(),
    pair_score: doublePrecision("pair_score").notNull(),
    user_a_confirmed_at: timestamp("user_a_confirmed_at", { withTimezone: true, mode: "date" }),
    user_b_confirmed_at: timestamp("user_b_confirmed_at", { withTimezone: true, mode: "date" }),
    created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
  },
  (table) => ({
    roundPairUnique: uniqueIndex("match_pairs_round_pair_unique").on(
      table.round_key,
      table.user_a_id,
      table.user_b_id
    ),
    roundScoreIdx: index("match_pairs_round_score_idx").on(table.round_key, table.pair_score),
    roundUserAIdx: index("match_pairs_round_user_a_idx").on(table.round_key, table.user_a_id),
    roundUserBIdx: index("match_pairs_round_user_b_idx").on(table.round_key, table.user_b_id),
    modeCreatedIdx: index("match_pairs_mode_created_idx").on(table.mode, table.created_at),
  })
);

export const profileUpdateDrafts = pgTable(
  "profile_update_drafts",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull(),
    mode: text("mode").notNull(),
    draft_payload: jsonb("draft_payload").notNull(),
    effective_at: timestamp("effective_at", { withTimezone: true, mode: "date" }).notNull(),
    status: text("status").notNull().default("PENDING"),
    created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow(),
  },
  (table) => ({
    userUnique: uniqueIndex("profile_update_drafts_user_unique").on(table.user_id),
    statusEffectiveIdx: index("profile_update_drafts_status_effective_idx").on(
      table.status,
      table.effective_at
    ),
  })
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: serial("id").primaryKey(),
    round_key: text("round_key"),
    sender_id: integer("sender_id").notNull(),
    receiver_id: integer("receiver_id").notNull(),
    content: text("content").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
  },
  (table) => ({
    roundIdx: index("chat_messages_round_idx").on(table.round_key),
    senderIdx: index("chat_messages_sender_idx").on(table.sender_id),
    receiverIdx: index("chat_messages_receiver_idx").on(table.receiver_id),
    pairCreatedIdx: index("chat_messages_pair_created_idx").on(
      table.sender_id,
      table.receiver_id,
      table.created_at
    ),
    roundPairCreatedIdx: index("chat_messages_round_pair_created_idx").on(
      table.round_key,
      table.sender_id,
      table.receiver_id,
      table.created_at
    ),
  })
);

export const chatNotificationEvents = pgTable(
  "chat_notification_events",
  {
    id: serial("id").primaryKey(),
    message_id: integer("message_id").notNull(),
    sender_id: integer("sender_id").notNull(),
    receiver_id: integer("receiver_id").notNull(),
    event_type: text("event_type").notNull().default("NEW_MESSAGE"),
    status: text("status").notNull().default("PENDING"),
    last_error: text("last_error"),
    consumed_at: timestamp("consumed_at", { withTimezone: true, mode: "date" }),
    email_status: text("email_status").notNull().default("PENDING"),
    email_last_error: text("email_last_error"),
    email_consumed_at: timestamp("email_consumed_at", { withTimezone: true, mode: "date" }),
    created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
  },
  (table) => ({
    receiverStatusIdx: index("chat_notification_events_receiver_status_idx").on(
      table.receiver_id,
      table.status,
      table.created_at
    ),
    receiverEmailStatusIdx: index("chat_notification_events_receiver_email_status_idx").on(
      table.receiver_id,
      table.email_status,
      table.created_at
    ),
    messageIdx: index("chat_notification_events_message_idx").on(table.message_id),
  })
);

export const chatEmailReminderWindows = pgTable(
  "chat_email_reminder_windows",
  {
    id: serial("id").primaryKey(),
    sender_id: integer("sender_id").notNull(),
    receiver_id: integer("receiver_id").notNull(),
    last_sent_at: timestamp("last_sent_at", { withTimezone: true, mode: "date" }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow(),
  },
  (table) => ({
    senderReceiverUnique: uniqueIndex("chat_email_reminder_windows_sender_receiver_unique").on(
      table.sender_id,
      table.receiver_id
    ),
    receiverLastSentIdx: index("chat_email_reminder_windows_receiver_last_sent_idx").on(
      table.receiver_id,
      table.last_sent_at
    ),
  })
);

export const PG_TABLES = {
  profiles,
  emailLoginTokens,
  matchPairs,
  profileUpdateDrafts,
  chatMessages,
  chatNotificationEvents,
  chatEmailReminderWindows,
} as const;
