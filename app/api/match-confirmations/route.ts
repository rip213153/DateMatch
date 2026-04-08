import { and, eq } from "drizzle-orm";
import {
  apiSuccess,
  assertApi,
  handleApiRouteError,
  readBoolean,
  readJsonBody,
  readPositiveInt,
} from "@/lib/api-route";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { getMatchSchedule } from "@/lib/match-schedule";
import {
  getMatchConfirmationsAuthContext,
  postMatchConfirmationsAuthContext,
} from "@/lib/match-confirmations-route-core";
import {
  buildMutualPairConfirmationPatch,
  buildMutualPairConfirmationState,
  buildMutualPairKey,
  getMutualPairRowForUsers,
  getMutualPairRowsForUser,
} from "@/lib/mutual-matching";
import { matchPairs } from "@/lib/schema";
import { requireAuthenticatedProfile } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

type PairStatus = {
  selfConfirmed: boolean;
  otherConfirmed: boolean;
  canMessage: boolean;
};

function buildEmptyStatus(): PairStatus {
  return {
    selfConfirmed: false,
    otherConfirmed: false,
    canMessage: false,
  };
}

export async function GET(request: Request) {
  try {
    const { mode, targetUserIds, authenticatedProfile: profile } = await getMatchConfirmationsAuthContext(request, {
      readPositiveInt,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });
    const userId = Number(profile.id);
    const statuses: Record<string, PairStatus> = {};

    if (targetUserIds.length === 0) {
      return apiSuccess({
        userId,
        mode,
        statuses,
      });
    }

    const now = new Date();
    const schedule = getMatchSchedule(now);

    if (!schedule.isInDisplayWindow) {
      for (const targetUserId of targetUserIds) {
        statuses[String(targetUserId)] = buildEmptyStatus();
      }

      return apiSuccess({
        userId,
        mode,
        statuses,
      });
    }

    const pairRows = await getMutualPairRowsForUser(userId, mode, schedule.releaseAt);
    const pairMap = new Map(pairRows.map((pairRow) => [`${pairRow.user_a_id}:${pairRow.user_b_id}`, pairRow]));

    for (const targetUserId of targetUserIds) {
      const { userAId, userBId } = buildMutualPairKey(userId, targetUserId);
      const pairRow = pairMap.get(`${userAId}:${userBId}`);
      statuses[String(targetUserId)] = pairRow
        ? buildMutualPairConfirmationState(pairRow, userId, targetUserId)
        : buildEmptyStatus();
    }

    return apiSuccess({
      userId,
      mode,
      statuses,
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to fetch match confirmations",
      code: "FETCH_MATCH_CONFIRMATIONS_FAILED",
      logMessage: "Error fetching match confirmations:",
    });
  }
}

export async function POST(request: Request) {
  try {
    const { mode, targetUserId, confirmed, authenticatedProfile: profile } = await postMatchConfirmationsAuthContext(request, {
      readJsonBody,
      readPositiveInt,
      readBoolean,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });
    const userId = Number(profile.id);

    assertApi(targetUserId, "Missing valid targetUserId", {
      status: 400,
      code: "INVALID_MATCH_CONFIRMATION_TARGET_USER_ID",
    });
    assertApi(userId !== targetUserId, "Cannot confirm yourself", {
      status: 400,
      code: "SELF_CONFIRM_NOT_ALLOWED",
    });

    const now = new Date();
    const schedule = getMatchSchedule(now);

    assertApi(schedule.isInDisplayWindow, "Match confirmations are currently closed", {
      status: 403,
      code: "MATCH_CONFIRMATION_CLOSED",
    });

    const db = getDbForMode(mode);
    const pairRow = await getMutualPairRowForUsers(
      userId,
      targetUserId,
      mode,
      schedule.releaseAt,
    );

    assertApi(pairRow, "This pair is not available in the current mutual matching round", {
      status: 404,
      code: "MATCH_PAIR_NOT_FOUND",
    });

    const { userAId, userBId } = buildMutualPairKey(userId, targetUserId);
    await db
      .update(matchPairs)
      .set(buildMutualPairConfirmationPatch(userId, targetUserId, confirmed, now))
      .where(
        and(
          eq(matchPairs.id, pairRow.id),
          eq(matchPairs.user_a_id, userAId),
          eq(matchPairs.user_b_id, userBId),
        ),
      );

    const updatedPairRow = await getMutualPairRowForUsers(
      userId,
      targetUserId,
      mode,
      schedule.releaseAt,
    );

    assertApi(updatedPairRow, "Failed to refresh match confirmation state", {
      status: 500,
      code: "MATCH_CONFIRMATION_UPDATE_FAILED",
    });

    return apiSuccess({
      userId,
      targetUserId,
      mode,
      status: buildMutualPairConfirmationState(updatedPairRow, userId, targetUserId),
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to update match confirmation",
      code: "UPDATE_MATCH_CONFIRMATION_FAILED",
      logMessage: "Error updating match confirmation:",
    });
  }
}
