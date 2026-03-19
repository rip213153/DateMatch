import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { getMatchSchedule, isOptedOutForRound } from "@/lib/match-schedule";
import { profiles } from "@/lib/schema";

type MatchingStatus = "WAITING" | "MATCHED" | "VIEWED";

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

function resolveOptOutUntil(value: number | string | null | undefined): Date | null {
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string" && value) return new Date(value);
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const mode = resolveQuizMode(searchParams.get("mode"));
    const db = getDbForMode(mode);

    if (!userId) {
      return NextResponse.json({ error: "缺少 userId 参数" }, { status: 400 });
    }

    const user = await db.select().from(profiles).where(eq(profiles.id, Number(userId))).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mode,
      matchingStatus: (user[0].matching_status || "WAITING") as MatchingStatus,
      optOutUntil: user[0].match_opt_out_until ? new Date(user[0].match_opt_out_until).getTime() : null,
      isOptedOutForRound: isOptedOutForRound(user[0].match_opt_out_until),
      ...buildSchedulePayload(),
    });
  } catch (error) {
    console.error("Error getting match status:", error);
    return NextResponse.json({ error: "获取匹配状态失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, status, matchAt, optOutUntil } = data as {
      userId?: number | string;
      status?: MatchingStatus;
      matchAt?: number | string | null;
      optOutUntil?: number | string | null;
    };
    const mode = resolveQuizMode(data?.mode);
    const db = getDbForMode(mode);

    if (!userId) {
      return NextResponse.json({ error: "缺少 userId 参数" }, { status: 400 });
    }

    if (!status || !["WAITING", "MATCHED", "VIEWED"].includes(status)) {
      return NextResponse.json({ error: "无效的 matching_status" }, { status: 400 });
    }

    const schedule = getMatchSchedule();
    const resolvedMatchAt =
      typeof matchAt === "number"
        ? new Date(matchAt)
        : typeof matchAt === "string" && matchAt
          ? new Date(matchAt)
          : new Date(schedule.releaseAt);
    const resolvedOptOutUntil = resolveOptOutUntil(optOutUntil);

    await db
      .update(profiles)
      .set({
        matching_status: status,
        match_at: resolvedMatchAt,
        match_opt_out_until: resolvedOptOutUntil,
      })
      .where(eq(profiles.id, Number(userId)));

    return NextResponse.json({
      success: true,
      mode,
      matchingStatus: status,
      optOutUntil: resolvedOptOutUntil ? resolvedOptOutUntil.getTime() : null,
      isOptedOutForRound: isOptedOutForRound(resolvedOptOutUntil),
      ...buildSchedulePayload(),
    });
  } catch (error) {
    console.error("Error updating match status:", error);
    return NextResponse.json({ error: "更新匹配状态失败" }, { status: 500 });
  }
}
