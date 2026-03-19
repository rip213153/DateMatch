const path = require("path");
const Database = require("better-sqlite3");

function parseArgs(argv) {
  const options = {
    source: "D:\\datematch.db",
    target: path.join(process.cwd(), "datematch.db"),
    dryRun: false,
    clearMatchPairs: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--source") {
      options.source = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--target") {
      options.target = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--keep-match-pairs") {
      options.clearMatchPairs = false;
    }
  }

  return options;
}

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function hasTable(db, tableName) {
  const row = db
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1")
    .get(tableName);

  return Boolean(row);
}

function getColumns(db, tableName) {
  if (!hasTable(db, tableName)) {
    return new Set();
  }

  return new Set(
    db
      .prepare(`PRAGMA table_info(${tableName})`)
      .all()
      .map((column) => column.name)
  );
}

function buildInsertStatement(db, tableName, columns) {
  const columnList = columns.join(", ");
  const placeholderList = columns.map(() => "?").join(", ");
  return db.prepare(`INSERT INTO ${tableName} (${columnList}) VALUES (${placeholderList})`);
}

function buildUpdateStatement(db, tableName, columns, keyColumn) {
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  return db.prepare(`UPDATE ${tableName} SET ${assignments} WHERE ${keyColumn} = ?`);
}

function createRowKey(parts) {
  return parts
    .map((part) => {
      if (part === null || part === undefined) return "__NULL__";
      return String(part);
    })
    .join("||");
}

function pickColumns(availableColumns, values) {
  return Object.entries(values).filter(([column]) => availableColumns.has(column));
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const sourceDb = new Database(options.source, { readonly: true });
  const targetDb = new Database(options.target);

  const sourceProfileColumns = getColumns(sourceDb, "profiles");
  const targetProfileColumns = getColumns(targetDb, "profiles");
  const targetChatColumns = getColumns(targetDb, "chat_messages");
  const targetMatchPairColumns = getColumns(targetDb, "match_pairs");
  const targetConfirmationColumns = getColumns(targetDb, "match_confirmations");

  if (!sourceProfileColumns.size || !targetProfileColumns.size) {
    throw new Error("profiles table is missing in source or target database");
  }

  const summary = {
    source: options.source,
    target: options.target,
    dryRun: options.dryRun,
    profiles: {
      inserted: 0,
      updated: 0,
      mapped: 0,
    },
    chatMessages: {
      inserted: 0,
      skipped: 0,
      missingProfileMapping: 0,
    },
    matchConfirmations: {
      inserted: 0,
      skipped: 0,
      missingProfileMapping: 0,
    },
    matchPairs: {
      deleted: 0,
    },
  };

  const sourceProfiles = sourceDb.prepare("SELECT * FROM profiles ORDER BY id").all();
  const targetProfiles = targetDb.prepare("SELECT * FROM profiles").all();
  const targetProfilesByEmail = new Map(
    targetProfiles
      .map((profile) => [normalizeEmail(profile.email), profile])
      .filter(([email]) => email)
  );
  const sourceIdToTargetId = new Map();

  const insertProfileFields = pickColumns(targetProfileColumns, {
    name: null,
    age: null,
    gender: null,
    seeking: null,
    university: null,
    email: null,
    instagram: null,
    interests: null,
    ideal_date: null,
    personality_profile: null,
    created_at: null,
    chat_user_id: null,
    bio: null,
    matching_status: null,
    match_at: null,
    email_sent_at: null,
    ideal_date_tags: null,
    wechat_open_id: null,
    wechat_union_id: null,
    wechat_notice_opt_in: null,
    wechat_bound_at: null,
    eligible_release_at: null,
    match_opt_out_until: null,
  }).map(([column]) => column);

  const updateProfileFields = pickColumns(targetProfileColumns, {
    name: null,
    age: null,
    gender: null,
    seeking: null,
    university: null,
    email: null,
    instagram: null,
    interests: null,
    ideal_date: null,
    personality_profile: null,
    created_at: null,
    chat_user_id: null,
    bio: null,
    matching_status: null,
    match_at: null,
    email_sent_at: null,
  }).map(([column]) => column);

  const insertProfileStatement = buildInsertStatement(targetDb, "profiles", insertProfileFields);
  const updateProfileStatement = buildUpdateStatement(targetDb, "profiles", updateProfileFields, "id");

  const existingChatKeys = new Set();
  if (targetChatColumns.size) {
    const targetChatRows = targetDb
      .prepare("SELECT sender_id, receiver_id, content, created_at FROM chat_messages")
      .all();
    for (const row of targetChatRows) {
      existingChatKeys.add(createRowKey([row.sender_id, row.receiver_id, row.content, row.created_at]));
    }
  }

  const existingConfirmationKeys = new Set();
  if (targetConfirmationColumns.size && hasTable(targetDb, "match_confirmations")) {
    const confirmationRows = targetDb
      .prepare("SELECT user_id, target_user_id, confirmed_at FROM match_confirmations")
      .all();
    for (const row of confirmationRows) {
      existingConfirmationKeys.add(createRowKey([row.user_id, row.target_user_id, row.confirmed_at]));
    }
  }

  const sourceChatRows = hasTable(sourceDb, "chat_messages")
    ? sourceDb.prepare("SELECT sender_id, receiver_id, content, created_at FROM chat_messages ORDER BY id").all()
    : [];

  const sourceConfirmationRows = hasTable(sourceDb, "match_confirmations")
    ? sourceDb
        .prepare("SELECT user_id, target_user_id, confirmed_at FROM match_confirmations ORDER BY id")
        .all()
    : [];

  const insertChatFields = pickColumns(targetChatColumns, {
    sender_id: null,
    receiver_id: null,
    content: null,
    created_at: null,
  }).map(([column]) => column);
  const insertChatStatement =
    insertChatFields.length > 0 ? buildInsertStatement(targetDb, "chat_messages", insertChatFields) : null;

  const insertConfirmationFields = pickColumns(targetConfirmationColumns, {
    user_id: null,
    target_user_id: null,
    confirmed_at: null,
  }).map(([column]) => column);
  const insertConfirmationStatement =
    insertConfirmationFields.length > 0 && hasTable(targetDb, "match_confirmations")
      ? buildInsertStatement(targetDb, "match_confirmations", insertConfirmationFields)
      : null;

  const deleteMatchPairsStatement =
    options.clearMatchPairs && targetMatchPairColumns.size
      ? targetDb.prepare("DELETE FROM match_pairs")
      : null;

  const transaction = targetDb.transaction(() => {
    for (const sourceProfile of sourceProfiles) {
      const normalizedEmail = normalizeEmail(sourceProfile.email);
      if (!normalizedEmail) {
        continue;
      }

      const profileValues = {
        name: sourceProfile.name,
        age: sourceProfile.age,
        gender: sourceProfile.gender,
        seeking: sourceProfile.seeking,
        university: sourceProfile.university,
        email: sourceProfile.email,
        instagram: sourceProfile.instagram ?? null,
        interests: sourceProfile.interests ?? null,
        ideal_date: sourceProfile.ideal_date,
        personality_profile: sourceProfile.personality_profile,
        created_at: sourceProfile.created_at ?? null,
        chat_user_id: sourceProfile.chat_user_id ?? null,
        bio: sourceProfile.bio ?? null,
        matching_status: sourceProfile.matching_status ?? "WAITING",
        match_at: sourceProfile.match_at ?? null,
        email_sent_at: sourceProfile.email_sent_at ?? null,
        ideal_date_tags: "[]",
        wechat_open_id: null,
        wechat_union_id: null,
        wechat_notice_opt_in: 0,
        wechat_bound_at: null,
        eligible_release_at: null,
        match_opt_out_until: null,
      };

      const existingTargetProfile = targetProfilesByEmail.get(normalizedEmail);

      if (existingTargetProfile) {
        const updateValues = updateProfileFields.map((column) => profileValues[column]);

        if (!options.dryRun) {
          updateProfileStatement.run(...updateValues, existingTargetProfile.id);
        }

        sourceIdToTargetId.set(sourceProfile.id, existingTargetProfile.id);
        summary.profiles.updated += 1;
        summary.profiles.mapped += 1;
        continue;
      }

      const insertValues = insertProfileFields.map((column) => profileValues[column]);
      let insertedId = null;

      if (!options.dryRun) {
        const result = insertProfileStatement.run(...insertValues);
        insertedId = Number(result.lastInsertRowid);
      } else {
        insertedId = -summary.profiles.inserted - 1;
      }

      sourceIdToTargetId.set(sourceProfile.id, insertedId);
      targetProfilesByEmail.set(normalizedEmail, { id: insertedId, email: sourceProfile.email });
      summary.profiles.inserted += 1;
      summary.profiles.mapped += 1;
    }

    if (insertChatStatement) {
      for (const row of sourceChatRows) {
        const senderId = sourceIdToTargetId.get(row.sender_id);
        const receiverId = sourceIdToTargetId.get(row.receiver_id);

        if (!senderId || !receiverId) {
          summary.chatMessages.missingProfileMapping += 1;
          continue;
        }

        const key = createRowKey([senderId, receiverId, row.content, row.created_at ?? null]);
        if (existingChatKeys.has(key)) {
          summary.chatMessages.skipped += 1;
          continue;
        }

        const values = {
          sender_id: senderId,
          receiver_id: receiverId,
          content: row.content,
          created_at: row.created_at ?? null,
        };

        if (!options.dryRun) {
          insertChatStatement.run(...insertChatFields.map((column) => values[column]));
        }

        existingChatKeys.add(key);
        summary.chatMessages.inserted += 1;
      }
    }

    if (insertConfirmationStatement) {
      for (const row of sourceConfirmationRows) {
        const userId = sourceIdToTargetId.get(row.user_id);
        const targetUserId = sourceIdToTargetId.get(row.target_user_id);

        if (!userId || !targetUserId) {
          summary.matchConfirmations.missingProfileMapping += 1;
          continue;
        }

        const key = createRowKey([userId, targetUserId, row.confirmed_at ?? null]);
        if (existingConfirmationKeys.has(key)) {
          summary.matchConfirmations.skipped += 1;
          continue;
        }

        const values = {
          user_id: userId,
          target_user_id: targetUserId,
          confirmed_at: row.confirmed_at ?? null,
        };

        if (!options.dryRun) {
          insertConfirmationStatement.run(...insertConfirmationFields.map((column) => values[column]));
        }

        existingConfirmationKeys.add(key);
        summary.matchConfirmations.inserted += 1;
      }
    }

    if (deleteMatchPairsStatement) {
      summary.matchPairs.deleted = targetDb.prepare("SELECT COUNT(*) AS count FROM match_pairs").get().count;
      if (!options.dryRun) {
        deleteMatchPairsStatement.run();
      }
    }
  });

  try {
    transaction();
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    sourceDb.close();
    targetDb.close();
  }
}

main();
