import { eq } from "drizzle-orm";
import {
  apiSuccess,
  assertApi,
  handleApiRouteError,
  readJsonBody,
  readPositiveInt,
} from "@/lib/api-route";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { getMatchSchedule, isOptedOutForRound } from "@/lib/match-schedule";
import {
  getMatchStatusAuthContext,
  postMatchStatusAuthContext,
} from "@/lib/match-status-route-core";
import { profiles } from "@/lib/schema";
import { requireAuthenticatedProfile } from "@/lib/server-auth";

type MatchingStatus = "WAITING" | "MATCHED" | "VIEWED";

export const dynamic = "force-dynamic";

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

function resolveOptOutUntil(value: unknown): Date | null {
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string" && value) return new Date(value);
  return null;
}

function isMatchingStatus(value: unknown): value is MatchingStatus {
  return value === "WAITING" || value === "MATCHED" || value === "VIEWED";
}

export async function GET(request: Request) {
  try {
    const { mode, authenticatedProfile: profile } = await getMatchStatusAuthContext(request, {
      readPositiveInt,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });

    return apiSuccess({
      mode,
      matchingStatus: (profile.matching_status || "WAITING") as MatchingStatus,
      optOutUntil: profile.match_opt_out_until ? new Date(profile.match_opt_out_until).getTime() : null,
      isOptedOutForRound: isOptedOutForRound(profile.match_opt_out_until),
      ...buildSchedulePayload(),
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to fetch match status",
      code: "FETCH_MATCH_STATUS_FAILED",
      logMessage: "Error getting match status:",
    });
  }
}

export async function POST(request: Request) {
  try {
    const { data, mode, authenticatedProfile: profile } = await postMatchStatusAuthContext(request, {
      readJsonBody,
      readPositiveInt,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });
    const status = data.status;
    const matchAt = data.matchAt;
    const optOutUntil = data.optOutUntil;
    const userId = Number(profile.id);

    assertApi(isMatchingStatus(status), "Invalid matching status", {
      status: 400,
      code: "INVALID_MATCHING_STATUS",
    });

    const schedule = getMatchSchedule();
    const resolvedMatchAt =
      typeof matchAt === "number"
        ? new Date(matchAt)
        : typeof matchAt === "string" && matchAt
          ? new Date(matchAt)
          : new Date(schedule.releaseAt);
    const resolvedOptOutUntil = resolveOptOutUntil(optOutUntil);

    const db = getDbForMode(mode);
    await db
      .update(profiles)
      .set({
        matching_status: status,
        match_at: resolvedMatchAt,
        match_opt_out_until: resolvedOptOutUntil,
      })
      .where(eq(profiles.id, userId));

    return apiSuccess({
      mode,
      matchingStatus: status,
      optOutUntil: resolvedOptOutUntil ? resolvedOptOutUntil.getTime() : null,
      isOptedOutForRound: isOptedOutForRound(resolvedOptOutUntil),
      ...buildSchedulePayload(),
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to update match status",
      code: "UPDATE_MATCH_STATUS_FAILED",
      logMessage: "Error updating match status:",
    });
  }
}
