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
  buildMutualPairConfirmationPatch,
  buildMutualPairConfirmationState,
  buildMutualPairKey,
  getMutualPairRowForUsers,
  getMutualPairRowsForUser,
} from "@/lib/mutual-matching";
import { getProfileRowsForMode } from "@/lib/profile-updates";
import { matchPairs } from "@/lib/schema";

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
    const { searchParams } = new URL(request.url);
    const userId = readPositiveInt(searchParams.get("userId"));
    const mode = resolveQuizMode(searchParams.get("mode"));

    assertApi(userId, "缺少合法的 userId 参数", {
      status: 400,
      code: "INVALID_MATCH_CONFIRMATION_USER_ID",
    });

    const rawTargetIds = (searchParams.get("targetUserIds") ?? "")
      .split(",")
      .map((id) => readPositiveInt(id))
      .filter((id): id is number => id !== null && id !== userId);

    const targetUserIds = Array.from(new Set(rawTargetIds));
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
    const profileRows = await getProfileRowsForMode(mode, now);
    const userExists = profileRows.some((row) => Number(row.id) === userId);

    assertApi(userExists, "用户不存在", {
      status: 404,
      code: "MATCH_CONFIRMATION_USER_NOT_FOUND",
    });

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

    const pairRows = await getMutualPairRowsForUser(userId, mode, profileRows, schedule.releaseAt, now);
    const pairMap = new Map(
      pairRows.map((pairRow) => [`${pairRow.user_a_id}:${pairRow.user_b_id}`, pairRow]),
    );

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
      message: "获取确认状态失败",
      code: "FETCH_MATCH_CONFIRMATIONS_FAILED",
      logMessage: "Error fetching match confirmations:",
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const userId = readPositiveInt(body.userId);
    const targetUserId = readPositiveInt(body.targetUserId);
    const mode = resolveQuizMode(body.mode);
    const confirmed = readBoolean(body.confirmed, true);

    assertApi(userId && targetUserId, "缺少合法的 userId/targetUserId", {
      status: 400,
      code: "INVALID_MATCH_CONFIRMATION_USER_IDS",
    });
    assertApi(userId !== targetUserId, "不能给自己确认", {
      status: 400,
      code: "SELF_CONFIRM_NOT_ALLOWED",
    });

    const now = new Date();
    const schedule = getMatchSchedule(now);

    assertApi(schedule.isInDisplayWindow, "当前不在可确认的匹配展示期", {
      status: 403,
      code: "MATCH_CONFIRMATION_CLOSED",
    });

    const db = getDbForMode(mode);
    const profileRows = await getProfileRowsForMode(mode, now);
    const pairRow = await getMutualPairRowForUsers(
      userId,
      targetUserId,
      mode,
      profileRows,
      schedule.releaseAt,
      now,
    );

    assertApi(pairRow, "当前轮次没有这组双向推荐", {
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
      profileRows,
      schedule.releaseAt,
      now,
    );

    assertApi(updatedPairRow, "更新确认状态失败", {
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
      message: "更新确认状态失败",
      code: "UPDATE_MATCH_CONFIRMATION_FAILED",
      logMessage: "Error updating match confirmation:",
    });
  }
}
