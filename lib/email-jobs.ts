import { and, eq } from "drizzle-orm";
import type { QuizMode } from "@/app/data/types";
import {
  listChatEmailNotificationEvents,
  markChatEmailNotificationEvent,
} from "@/lib/chat-notification-events";
import { getDbForMode } from "@/lib/database";
import {
  getBaseUrl,
  isEmailDeliveryConfigured,
  sendChatReminderEmail,
  sendMatchResultEmail,
} from "@/lib/email";
import { getMatchSchedule, isOptedOutForRound } from "@/lib/match-schedule";
import { ensureMutualPairsForRound } from "@/lib/mutual-matching";
import { getProfileRowsForMode } from "@/lib/profile-updates";
import {
  chatEmailReminderWindows,
  matchPairs,
  profiles,
} from "@/lib/schema";

const CHAT_REMINDER_COOLDOWN_MS = 2 * 60 * 60 * 1000;
const CHAT_REMINDER_INTERVAL_MS = 60 * 1000;
const MATCH_RELEASE_INTERVAL_MS = 60 * 1000;

type JobSummary = {
  mode: QuizMode;
  scanned: number;
  sent: number;
  failed: number;
  skipped: number;
  blocked: number;
};

type WorkerState = {
  started: boolean;
  chatRunning: boolean;
  matchRunning: boolean;
  chatTimer: NodeJS.Timeout | null;
  matchTimer: NodeJS.Timeout | null;
};

type GlobalWorkerState = typeof globalThis & {
  __datematchEmailWorkerState?: WorkerState;
};

function getWorkerState(): WorkerState {
  const globalState = globalThis as GlobalWorkerState;

  if (!globalState.__datematchEmailWorkerState) {
    globalState.__datematchEmailWorkerState = {
      started: false,
      chatRunning: false,
      matchRunning: false,
      chatTimer: null,
      matchTimer: null,
    };
  }

  return globalState.__datematchEmailWorkerState;
}

function toTimestamp(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const parsed = new Date(String(value)).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function isEligibleForRelease(value: unknown, releaseAt: number) {
  const timestamp = toTimestamp(value);
  if (timestamp === null) return true;
  return timestamp <= releaseAt;
}

export function hasMatchEmailBeenSentForRound(
  sentAt: unknown,
  releaseAt: number,
  nextReleaseAt: number
) {
  const timestamp = toTimestamp(sentAt);
  if (timestamp === null) return false;
  return timestamp >= releaseAt && timestamp < nextReleaseAt;
}

export function isChatReminderCoolingDown(lastSentAt: unknown, now: Date = new Date()) {
  const timestamp = toTimestamp(lastSentAt);
  if (timestamp === null) return false;
  return now.getTime() - timestamp < CHAT_REMINDER_COOLDOWN_MS;
}

async function getChatReminderWindow(mode: QuizMode, senderId: number, receiverId: number) {
  const db = getDbForMode(mode);
  const rows = await db
    .select({
      id: chatEmailReminderWindows.id,
      last_sent_at: chatEmailReminderWindows.last_sent_at,
    })
    .from(chatEmailReminderWindows)
    .where(
      and(
        eq(chatEmailReminderWindows.sender_id, senderId),
        eq(chatEmailReminderWindows.receiver_id, receiverId)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

async function upsertChatReminderWindow(
  mode: QuizMode,
  senderId: number,
  receiverId: number,
  sentAt: Date
) {
  const db = getDbForMode(mode);
  await db
    .insert(chatEmailReminderWindows)
    .values({
      sender_id: senderId,
      receiver_id: receiverId,
      last_sent_at: sentAt,
      created_at: sentAt,
      updated_at: sentAt,
    })
    .onConflictDoUpdate({
      target: [
        chatEmailReminderWindows.sender_id,
        chatEmailReminderWindows.receiver_id,
      ],
      set: {
        last_sent_at: sentAt,
        updated_at: sentAt,
      },
    });
}

export async function processPendingChatReminderEmails(
  mode: QuizMode,
  options: {
    receiverId?: number | null;
    limit?: number;
  } = {}
): Promise<JobSummary> {
  const db = getDbForMode(mode);
  const events = await listChatEmailNotificationEvents(mode, {
    receiverId: options.receiverId ?? null,
    status: "PENDING",
    limit: options.limit ?? 20,
  });

  const summary: JobSummary = {
    mode,
    scanned: events.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    blocked: 0,
  };

  if (!events.length) {
    return summary;
  }

  if (!isEmailDeliveryConfigured()) {
    summary.blocked = events.length;
    return summary;
  }

  for (const event of events) {
    const [sender] = await db
      .select({
        id: profiles.id,
        name: profiles.name,
      })
      .from(profiles)
      .where(eq(profiles.id, event.senderId))
      .limit(1);

    const [receiver] = await db
      .select({
        id: profiles.id,
        email: profiles.email,
      })
      .from(profiles)
      .where(eq(profiles.id, event.receiverId))
      .limit(1);

    if (!receiver) {
      summary.failed += 1;
      await markChatEmailNotificationEvent(mode, {
        eventId: event.id,
        status: "FAILED",
        lastError: "receiver_profile_not_found",
      });
      continue;
    }

    const receiverEmail = String(receiver.email ?? "").trim();
    if (!receiverEmail) {
      summary.skipped += 1;
      await markChatEmailNotificationEvent(mode, {
        eventId: event.id,
        status: "SKIPPED",
        lastError: "receiver_email_missing",
      });
      continue;
    }

    const reminderWindow = await getChatReminderWindow(
      mode,
      event.senderId,
      event.receiverId
    );
    const now = new Date();

    if (isChatReminderCoolingDown(reminderWindow?.last_sent_at, now)) {
      summary.skipped += 1;
      await markChatEmailNotificationEvent(mode, {
        eventId: event.id,
        status: "SKIPPED",
        lastError: "email_rate_limited",
      });
      continue;
    }

    try {
      const chatUrl = `${getBaseUrl()}/chat?userId=${event.receiverId}&targetUserId=${event.senderId}&mode=${mode}`;

      await sendChatReminderEmail({
        email: receiverEmail,
        senderName: sender?.name || "有人",
        chatUrl,
        mode,
      });

      await upsertChatReminderWindow(mode, event.senderId, event.receiverId, now);
      await markChatEmailNotificationEvent(mode, {
        eventId: event.id,
        status: "PROCESSED",
      });
      summary.sent += 1;
    } catch (error) {
      summary.failed += 1;
      await markChatEmailNotificationEvent(mode, {
        eventId: event.id,
        status: "FAILED",
        lastError: error instanceof Error ? error.message : "chat_email_delivery_failed",
      });
    }
  }

  return summary;
}

export async function processAutomaticMatchReleaseEmails(
  mode: QuizMode,
  now: Date = new Date()
): Promise<JobSummary> {
  const schedule = getMatchSchedule(now);
  const summary: JobSummary = {
    mode,
    scanned: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    blocked: 0,
  };

  if (!schedule.isInDisplayWindow) {
    return summary;
  }

  const db = getDbForMode(mode);
  const profileRows = await getProfileRowsForMode(mode, now);
  const roundKey = await ensureMutualPairsForRound(mode, profileRows, schedule.releaseAt, now);
  const pairRows = await db
    .select({
      user_a_id: matchPairs.user_a_id,
      user_b_id: matchPairs.user_b_id,
    })
    .from(matchPairs)
    .where(eq(matchPairs.round_key, roundKey));

  const matchCounts = new Map<number, number>();
  for (const pairRow of pairRows) {
    matchCounts.set(pairRow.user_a_id, (matchCounts.get(pairRow.user_a_id) ?? 0) + 1);
    matchCounts.set(pairRow.user_b_id, (matchCounts.get(pairRow.user_b_id) ?? 0) + 1);
  }

  const candidates = profileRows.filter((row) => {
    const userId = Number(row.id);
    const email = String(row.email ?? "").trim();

    return (
      Boolean(email) &&
      !isOptedOutForRound(row.match_opt_out_until, now) &&
      isEligibleForRelease(row.eligible_release_at, schedule.releaseAt) &&
      (matchCounts.get(userId) ?? 0) > 0 &&
      !hasMatchEmailBeenSentForRound(
        row.email_sent_at,
        schedule.releaseAt,
        schedule.nextReleaseAt
      )
    );
  });

  summary.scanned = candidates.length;
  if (!candidates.length) {
    return summary;
  }

  if (!isEmailDeliveryConfigured()) {
    summary.blocked = candidates.length;
    return summary;
  }

  for (const row of candidates) {
    const userId = Number(row.id);
    const matchCount = matchCounts.get(userId) ?? 0;
    if (matchCount <= 0) {
      summary.skipped += 1;
      continue;
    }

    try {
      await sendMatchResultEmail({
        email: String(row.email).trim(),
        name: String(row.name || String(row.email).split("@")[0]),
        matchCount,
        viewUrl: `${getBaseUrl()}/dev-channel-2${mode === "friendship" ? "?mode=friendship" : ""}`,
      });

      await db
        .update(profiles)
        .set({ email_sent_at: now })
        .where(eq(profiles.id, userId));

      summary.sent += 1;
    } catch (error) {
      summary.failed += 1;
      console.error("match release email delivery failed:", {
        mode,
        userId,
        error,
      });
    }
  }

  return summary;
}

async function runChatEmailCycle() {
  const summaries = await Promise.all([
    processPendingChatReminderEmails("romance"),
    processPendingChatReminderEmails("friendship"),
  ]);

  if (summaries.some((summary) => summary.sent > 0 || summary.failed > 0)) {
    console.info("chat email cycle summary:", summaries);
  }
}

async function runMatchReleaseCycle() {
  const summaries = await Promise.all([
    processAutomaticMatchReleaseEmails("romance"),
    processAutomaticMatchReleaseEmails("friendship"),
  ]);

  if (summaries.some((summary) => summary.sent > 0 || summary.failed > 0)) {
    console.info("match release email cycle summary:", summaries);
  }
}

function createLoop(intervalMs: number, runner: () => Promise<void>) {
  const run = () => {
    void runner().catch((error) => {
      console.error("email worker cycle failed:", error);
    });
  };

  run();
  const timer = setInterval(run, intervalMs);
  timer.unref?.();
  return timer;
}

function isBuildProcess() {
  if (process.env.npm_lifecycle_event === "build") {
    return true;
  }

  return process.argv.some((arg) => /\bbuild\b/i.test(arg));
}

export function ensureEmailBackgroundWorkersStarted() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  if (isBuildProcess()) {
    return;
  }

  const state = getWorkerState();
  if (state.started) {
    return;
  }

  state.started = true;
  state.chatTimer = createLoop(CHAT_REMINDER_INTERVAL_MS, async () => {
    if (state.chatRunning) return;
    state.chatRunning = true;

    try {
      await runChatEmailCycle();
    } finally {
      state.chatRunning = false;
    }
  });

  state.matchTimer = createLoop(MATCH_RELEASE_INTERVAL_MS, async () => {
    if (state.matchRunning) return;
    state.matchRunning = true;

    try {
      await runMatchReleaseCycle();
    } finally {
      state.matchRunning = false;
    }
  });

  console.info("DateMatch email background workers started");
}
