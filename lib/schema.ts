﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable(
  "profiles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    age: integer("age").notNull(),
    gender: text("gender").notNull(),
    seeking: text("seeking").notNull(),
    university: text("university").notNull(),
    email: text("email").notNull(),
    chat_user_id: text("chat_user_id"),
    interests: text("interests"),
    ideal_date: text("ideal_date").notNull(),
    bio: text("bio"),
    personality_profile: text("personality_profile", { mode: "json" }).notNull(),
    matching_status: text("matching_status", { enum: ["WAITING", "MATCHED", "VIEWED"] }).default("WAITING"),
    match_at: integer("match_at", { mode: "timestamp" }),
    email_sent_at: integer("email_sent_at", { mode: "timestamp" }),
    created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
  },
  (table) => ({
    emailUnique: uniqueIndex("email_unique").on(table.email),
  })
);

export const emailLoginTokens = sqliteTable(
  "email_login_tokens",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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

export const matchConfirmations = sqliteTable(
  "match_confirmations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    user_id: integer("user_id").notNull(),
    target_user_id: integer("target_user_id").notNull(),
    confirmed_at: integer("confirmed_at", { mode: "timestamp" }).defaultNow(),
  },
  (table) => ({
    pairUnique: uniqueIndex("match_confirmations_pair_unique").on(
      table.user_id,
      table.target_user_id
    ),
  })
);

export const chatMessages = sqliteTable(
  "chat_messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sender_id: integer("sender_id").notNull(),
    receiver_id: integer("receiver_id").notNull(),
    content: text("content").notNull(),
    created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
  },
  (table) => ({
    senderIdx: index("chat_messages_sender_idx").on(table.sender_id),
    receiverIdx: index("chat_messages_receiver_idx").on(table.receiver_id),
    pairCreatedIdx: index("chat_messages_pair_created_idx").on(
      table.sender_id,
      table.receiver_id,
      table.created_at
    ),
  })
);
