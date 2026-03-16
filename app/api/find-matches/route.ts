import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { UserProfile } from "@/app/data/types";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { getBaseUrl, sendMatchResultEmail } from "@/lib/email";
import { getMatchSchedule, isOptedOutForRound } from "@/lib/match-schedule";
import { ensureMutualPairsForRound, getMutualMatchesForUser } from "@/lib/mutual-matching";
import { getProfileRowsForMode } from "@/lib/profile-updates";
import { normalizeProfile } from "@/lib/profile-normalizer";
import { profiles } from "@/lib/schema";

export const dynamic = "force-dynamic";

function toPositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function buildCurrentUserPayload(user: Pick<UserProfile, "id" | "name">) {
  return {
    id: user.id,
    name: user.name,
    chat_user_id: null,
  };
}

function buildSchedulePayload(now: Date = new Date()) {
  const schedule = getMatchSchedule(now);

  return {
    matchAt: schedule.countdownTargetAt,
    releaseAt: schedule.releaseAt,
    displayEndAt: schedule.displayEndAt,
    nextReleaseAt: schedule.nextReleaseAt,
    isInDisplayWindow: schedule.isInDisplayWindow,
    phase: schedule.phase,
  };
}

function toTimestamp(value: unknown): number | null {
  if (!value) return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const date = new Date(String(value));
  const timestamp = date.getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isEligibleForRelease(value: unknown, releaseAt: number) {
  const timestamp = toTimestamp(value);
  if (timestamp === null) return true;
  return timestamp <= releaseAt;
}

async function findMatchesByUserId(userId: number, mode: "romance" | "friendship", now: Date) {
  const rows = await getProfileRowsForMode(mode, now);
  const currentUserRow = rows.find((user) => Number(user.id) === userId);
  const schedule = getMatchSchedule(now);

  if (!currentUserRow) {
    return null;
  }

  const currentUser = normalizeProfile(currentUserRow);
  const isEligibleForCurrentRound = isEligibleForRelease(currentUserRow.eligible_release_at, schedule.releaseAt);
  const shouldLoadMutualMatches = schedule.isInDisplayWindow && isEligibleForCurrentRound;
  const matches = shouldLoadMutualMatches
    ? await (async () => {
        const roundKey = await ensureMutualPairsForRound(mode, rows, schedule.releaseAt, now);
        return getMutualMatchesForUser(userId, mode, rows, roundKey);
      })()
    : [];

  return {
    currentUser,
    emailSentAt: currentUserRow.email_sent_at ? new Date(currentUserRow.email_sent_at).getTime() : null,
    optOutUntil: currentUserRow.match_opt_out_until ? new Date(currentUserRow.match_opt_out_until).getTime() : null,
    isOptedOutForRound: isOptedOutForRound(currentUserRow.match_opt_out_until, now),
    isEligibleForCurrentRound,
    eligibleReleaseAt: toTimestamp(currentUserRow.eligible_release_at),
    matches,
  };
}

function buildClosedResponse(
  result: NonNullable<Awaited<ReturnType<typeof findMatchesByUserId>>>,
  now: Date,
  mode: string,
  overrides?: Partial<ReturnType<typeof buildSchedulePayload>> & { isQueuedForNextRound?: boolean }
) {
  const schedulePayload = {
    ...buildSchedulePayload(now),
    ...overrides,
  };

  return NextResponse.json({
    success: true,
    mode,
    matches: [],
    totalMatches: 0,
    currentUser: buildCurrentUserPayload(result.currentUser),
    optOutUntil: result.optOutUntil,
    isOptedOutForRound: result.isOptedOutForRound,
    isQueuedForNextRound: Boolean(overrides?.isQueuedForNextRound),
    eligibleReleaseAt: result.eligibleReleaseAt,
    ...schedulePayload,
  });
}

async function maybeSendMatchEmail(
  result: NonNullable<Awaited<ReturnType<typeof findMatchesByUserId>>>,
  releaseAt: number,
  now: Date,
  mode: "romance" | "friendship"
) {
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const nowTime = now.getTime();

  if (nowTime < releaseAt || nowTime >= releaseAt + oneDayInMs || result.matches.length === 0 || result.isOptedOutForRound) {
    return;
  }

  const user = result.currentUser;
  const sentAt = result.emailSentAt;

  if (!user.email) {
    return;
  }

  if (sentAt !== null && Number.isFinite(sentAt) && sentAt >= releaseAt && sentAt < releaseAt + oneDayInMs) {
    return;
  }

  const viewUrl = `${getBaseUrl()}/dev-channel-2${mode === "friendship" ? "?mode=friendship" : ""}`;

  sendMatchResultEmail({
    email: user.email,
    name: user.name || user.email.split("@")[0],
    matchCount: result.matches.length,
    viewUrl,
  })
    .then(() => {
      return getDbForMode(mode).update(profiles).set({ email_sent_at: new Date() }).where(eq(profiles.id, Number(user.id)));
    })
    .catch((error) => {
      console.error("发送匹配结果邮件失败:", error);
    });
}

async function buildOpenResponse(
  result: NonNullable<Awaited<ReturnType<typeof findMatchesByUserId>>>,
  now: Date,
  mode: "romance" | "friendship"
) {
  const schedule = getMatchSchedule(now);
  await maybeSendMatchEmail(result, schedule.releaseAt, now, mode);

  return NextResponse.json({
    success: true,
    mode,
    matches: result.matches,
    totalMatches: result.matches.length,
    currentUser: buildCurrentUserPayload(result.currentUser),
    optOutUntil: result.optOutUntil,
    isOptedOutForRound: result.isOptedOutForRound,
    isQueuedForNextRound: false,
    eligibleReleaseAt: result.eligibleReleaseAt,
    ...buildSchedulePayload(now),
  });
}

async function handleRequest(userId: number, mode: "romance" | "friendship", now: Date) {
  const result = await findMatchesByUserId(userId, mode, now);

  if (!result) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const schedule = getMatchSchedule(now);

  if (schedule.isInDisplayWindow && !result.isEligibleForCurrentRound) {
    return buildClosedResponse(result, now, mode, {
      isInDisplayWindow: false,
      phase: "before_release",
      isQueuedForNextRound: true,
    });
  }

  if (!schedule.isInDisplayWindow || result.isOptedOutForRound) {
    return buildClosedResponse(result, now, mode);
  }

  return buildOpenResponse(result, now, mode);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = toPositiveInt(searchParams.get("userId"));
    const mode = resolveQuizMode(searchParams.get("mode"));

    if (!userId) {
      return NextResponse.json({ error: "缺少合法的 userId 参数" }, { status: 400 });
    }

    return handleRequest(userId, mode, new Date());
  } catch (error) {
    console.error("Error finding matches:", error);
    return NextResponse.json({ error: "匹配失败，请重试" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const userId = toPositiveInt(data.userId);
    const mode = resolveQuizMode(data?.mode);

    if (!userId) {
      return NextResponse.json({ error: "缺少合法的用户 ID" }, { status: 400 });
    }

    return handleRequest(userId, mode, new Date());
  } catch (error) {
    console.error("Error finding matches:", error);
    return NextResponse.json({ error: "匹配失败，请重试" }, { status: 500 });
  }
}
