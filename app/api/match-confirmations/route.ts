import { NextResponse } from "next/server";
import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "@/lib/database";
import { matchConfirmations } from "@/lib/schema";

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

function buildPairStatus(
  rows: Array<{ user_id: number; target_user_id: number }>,
  userId: number,
  targetUserId: number
): PairStatus {
  const selfConfirmed = rows.some(
    (row) => row.user_id === userId && row.target_user_id === targetUserId
  );
  const otherConfirmed = rows.some(
    (row) => row.user_id === targetUserId && row.target_user_id === userId
  );

  return {
    selfConfirmed,
    otherConfirmed,
    canMessage: selfConfirmed && otherConfirmed,
  };
}

async function queryPairRows(userId: number, targetUserIds: number[]) {
  if (targetUserIds.length === 0) {
    return [] as Array<{ user_id: number; target_user_id: number }>;
  }

  return db
    .select({
      user_id: matchConfirmations.user_id,
      target_user_id: matchConfirmations.target_user_id,
    })
    .from(matchConfirmations)
    .where(
      or(
        and(
          eq(matchConfirmations.user_id, userId),
          inArray(matchConfirmations.target_user_id, targetUserIds)
        ),
        and(
          inArray(matchConfirmations.user_id, targetUserIds),
          eq(matchConfirmations.target_user_id, userId)
        )
      )
    );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = toPositiveInt(searchParams.get("userId"));

    if (!userId) {
      return NextResponse.json({ error: "缺少合法的 userId 参数" }, { status: 400 });
    }

    const rawTargetIds = (searchParams.get("targetUserIds") ?? "")
      .split(",")
      .map((id) => toPositiveInt(id))
      .filter((id): id is number => id !== null && id !== userId);

    const targetUserIds = Array.from(new Set(rawTargetIds));
    const rows = await queryPairRows(userId, targetUserIds);

    const statuses: Record<string, PairStatus> = {};
    for (const targetUserId of targetUserIds) {
      statuses[String(targetUserId)] = buildPairStatus(rows, userId, targetUserId);
    }

    return NextResponse.json({
      success: true,
      userId,
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

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: "缺少合法的 userId/targetUserId" }, { status: 400 });
    }

    if (userId === targetUserId) {
      return NextResponse.json({ error: "不能给自己确认" }, { status: 400 });
    }

    const confirmed = payload.confirmed !== false;

    if (confirmed) {
      await db
        .insert(matchConfirmations)
        .values({
          user_id: userId,
          target_user_id: targetUserId,
          confirmed_at: new Date(),
        })
        .onConflictDoUpdate({
          target: [matchConfirmations.user_id, matchConfirmations.target_user_id],
          set: {
            confirmed_at: new Date(),
          },
        });
    } else {
      await db
        .delete(matchConfirmations)
        .where(
          and(
            eq(matchConfirmations.user_id, userId),
            eq(matchConfirmations.target_user_id, targetUserId)
          )
        );
    }

    const rows = await queryPairRows(userId, [targetUserId]);
    const status = buildPairStatus(rows, userId, targetUserId);

    return NextResponse.json({
      success: true,
      userId,
      targetUserId,
      status,
    });
  } catch (error) {
    console.error("Error updating match confirmation:", error);
    return NextResponse.json({ error: "更新确认状态失败" }, { status: 500 });
  }
}
