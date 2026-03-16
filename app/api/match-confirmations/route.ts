import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { getMatchSchedule } from "@/lib/match-schedule";
import {
  buildMutualPairConfirmationState,
  buildMutualPairConfirmationPatch,
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

function toPositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
}

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
    const userId = toPositiveInt(searchParams.get("userId"));
    const mode = resolveQuizMode(searchParams.get("mode"));

    if (!userId) {
      return NextResponse.json({ error: "缺少合法的 userId 参数" }, { status: 400 });
    }

    const rawTargetIds = (searchParams.get("targetUserIds") ?? "")
      .split(",")
      .map((id) => toPositiveInt(id))
      .filter((id): id is number => id !== null && id !== userId);

    const targetUserIds = Array.from(new Set(rawTargetIds));
    const statuses: Record<string, PairStatus> = {};

    if (targetUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        userId,
        mode,
        statuses,
      });
    }

    const now = new Date();
    const schedule = getMatchSchedule(now);
    const profileRows = await getProfileRowsForMode(mode, now);
    const userExists = profileRows.some((row) => Number(row.id) === userId);

    if (!userExists) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (!schedule.isInDisplayWindow) {
      for (const targetUserId of targetUserIds) {
        statuses[String(targetUserId)] = buildEmptyStatus();
      }

      return NextResponse.json({
        success: true,
        userId,
        mode,
        statuses,
      });
    }

    const pairRows = await getMutualPairRowsForUser(userId, mode, profileRows, schedule.releaseAt, now);
    const pairMap = new Map(pairRows.map((pairRow) => [String(pairRow.user_a_id) + ":" + String(pairRow.user_b_id), pairRow]));

    for (const targetUserId of targetUserIds) {
      const { userAId, userBId } = buildMutualPairKey(userId, targetUserId);
      const pairRow = pairMap.get(`${userAId}:${userBId}`);
      statuses[String(targetUserId)] = pairRow
        ? buildMutualPairConfirmationState(pairRow, userId, targetUserId)
        : buildEmptyStatus();
    }

    return NextResponse.json({
      success: true,
      userId,
      mode,
      statuses,
    });
  } catch (error) {
    console.error("Error fetching match confirmations:", error);
    return NextResponse.json({ error: "获取确认状态失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const userId = toPositiveInt(payload.userId);
    const targetUserId = toPositiveInt(payload.targetUserId);
    const mode = resolveQuizMode(payload.mode);

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: "缺少合法的 userId/targetUserId" }, { status: 400 });
    }

    if (userId === targetUserId) {
      return NextResponse.json({ error: "不能给自己确认" }, { status: 400 });
    }

    const confirmed = payload.confirmed !== false;
    const now = new Date();
    const schedule = getMatchSchedule(now);

    if (!schedule.isInDisplayWindow) {
      return NextResponse.json({ error: "当前不在可确认的匹配展示期" }, { status: 403 });
    }

    const db = getDbForMode(mode);
    const profileRows = await getProfileRowsForMode(mode, now);
    const pairRow = await getMutualPairRowForUsers(
      userId,
      targetUserId,
      mode,
      profileRows,
      schedule.releaseAt,
      now
    );

    if (!pairRow) {
      return NextResponse.json({ error: "当前轮次没有这组双向推荐" }, { status: 404 });
    }

    const { userAId, userBId } = buildMutualPairKey(userId, targetUserId);
    await db
      .update(matchPairs)
      .set(buildMutualPairConfirmationPatch(userId, targetUserId, confirmed, now))
      .where(
        and(
          eq(matchPairs.id, pairRow.id),
          eq(matchPairs.user_a_id, userAId),
          eq(matchPairs.user_b_id, userBId)
        )
      );

    const updatedPairRow = await getMutualPairRowForUsers(
      userId,
      targetUserId,
      mode,
      profileRows,
      schedule.releaseAt,
      now
    );

    if (!updatedPairRow) {
      return NextResponse.json({ error: "更新确认状态失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      userId,
      targetUserId,
      mode,
      status: buildMutualPairConfirmationState(updatedPairRow, userId, targetUserId),
    });
  } catch (error) {
    console.error("Error updating match confirmation:", error);
    return NextResponse.json({ error: "更新确认状态失败" }, { status: 500 });
  }
}
