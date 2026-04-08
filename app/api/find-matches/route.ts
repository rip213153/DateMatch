import type { UserProfile } from "@/app/data/types";
import {
  apiSuccess,
  handleApiRouteError,
  readJsonBody,
  readPositiveInt,
} from "@/lib/api-route";
import { resolveQuizMode } from "@/lib/database";
import {
  getFindMatchesAuthContext,
  postFindMatchesAuthContext,
} from "@/lib/find-matches-route-core";
import { getMatchSchedule, isOptedOutForRound } from "@/lib/match-schedule";
import {
  buildMutualMatchesForUser,
  getMutualPairRowsForUser,
  getMutualTargetUserId,
} from "@/lib/mutual-matching";
import {
  getProfileRowByIdForMode,
  listProfileRowsByIdsForMode,
  syncProfileUpdateDrafts,
} from "@/lib/profile-updates";
import { normalizeProfile } from "@/lib/profile-normalizer";
import { requireAuthenticatedProfile } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

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
  await syncProfileUpdateDrafts(mode, now);
  const currentUserRow = await getProfileRowByIdForMode(mode, userId);
  const schedule = getMatchSchedule(now);

  if (!currentUserRow) {
    return null;
  }

  const currentUser = normalizeProfile(currentUserRow);
  const isEligibleForCurrentRound = isEligibleForRelease(currentUserRow.eligible_release_at, schedule.releaseAt);
  const shouldLoadMutualMatches = schedule.isInDisplayWindow && isEligibleForCurrentRound;
  const matches = shouldLoadMutualMatches
    ? await (async () => {
        const pairRows = await getMutualPairRowsForUser(userId, mode, schedule.releaseAt);
        const targetUserIds = pairRows.map((pairRow) => getMutualTargetUserId(pairRow, userId));
        const targetProfileRows = await listProfileRowsByIdsForMode(mode, targetUserIds);
        return buildMutualMatchesForUser(userId, mode, currentUserRow, targetProfileRows, pairRows);
      })()
    : [];

  return {
    currentUser,
    optOutUntil: currentUserRow.match_opt_out_until
      ? new Date(currentUserRow.match_opt_out_until).getTime()
      : null,
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
  overrides?: Partial<ReturnType<typeof buildSchedulePayload>> & {
    isQueuedForNextRound?: boolean;
  },
) {
  return apiSuccess({
    mode,
    matches: [],
    totalMatches: 0,
    currentUser: buildCurrentUserPayload(result.currentUser),
    optOutUntil: result.optOutUntil,
    isOptedOutForRound: result.isOptedOutForRound,
    isQueuedForNextRound: Boolean(overrides?.isQueuedForNextRound),
    eligibleReleaseAt: result.eligibleReleaseAt,
    ...buildSchedulePayload(now),
    ...(overrides ?? {}),
  });
}

function buildOpenResponse(
  result: NonNullable<Awaited<ReturnType<typeof findMatchesByUserId>>>,
  now: Date,
  mode: "romance" | "friendship",
) {
  return apiSuccess({
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
    return Response.json({ error: "User not found" }, { status: 404 });
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
    const { mode, authenticatedProfile: profile } = await getFindMatchesAuthContext(request, {
      readPositiveInt,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });

    return handleRequest(Number(profile.id), mode, new Date());
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to fetch matches",
      code: "FETCH_MATCHES_FAILED",
      logMessage: "Error finding matches:",
    });
  }
}

export async function POST(request: Request) {
  try {
    const { mode, authenticatedProfile: profile } = await postFindMatchesAuthContext(request, {
      readJsonBody,
      readPositiveInt,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });

    return handleRequest(Number(profile.id), mode, new Date());
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to fetch matches",
      code: "FETCH_MATCHES_FAILED",
      logMessage: "Error finding matches:",
    });
  }
}
