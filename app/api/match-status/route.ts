import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { profiles } from "@/lib/schema";
import { eq } from "drizzle-orm";

const MATCH_DAY = 5; // 周五
const MATCH_HOUR = 18;
const MATCH_MINUTE = 0;
const DISPLAY_DAYS = 5; // 匹配结果展示 5 天

function getNextMatchTime(now: Date = new Date()): number {
  // 计算下一个周三的时间
  const nextWednesday = new Date(now);
  const daysUntilWednesday = (MATCH_DAY - now.getDay() + 7) % 7;
  
  nextWednesday.setDate(now.getDate() + daysUntilWednesday);
  nextWednesday.setHours(MATCH_HOUR, MATCH_MINUTE, 0, 0);
  
  if (nextWednesday <= now) {
    nextWednesday.setDate(nextWednesday.getDate() + 7);
  }
  
  // 匹配时间 = 下周五 18:00
  const matchTime = nextWednesday.getTime();
  
  // 展示结束时间 = 匹配时间 + 5 天
  const displayEndTime = matchTime + (DISPLAY_DAYS * 24 * 60 * 60 * 1000);
  
  // 如果当前时间在展示期内，返回展示结束时间
  // 如果当前时间还没到匹配时间，返回匹配时间
  if (now.getTime() >= matchTime && now.getTime() < displayEndTime) {
    return displayEndTime;
  }
  
  return matchTime;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "缺少 userId 参数" }, { status: 400 });
    }

    const user = await db.select().from(profiles).where(eq(profiles.id, Number(userId))).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const userData = user[0];
    
    // 优先使用前端统一计算的时间，确保和首页完全一致
    const now = new Date();
    const targetTime = getNextMatchTime(now);

    return NextResponse.json({
      success: true,
      matchingStatus: userData.matching_status || "WAITING",
      matchAt: targetTime,
    });
  } catch (error) {
    console.error("Error getting match status:", error);
    return NextResponse.json({ error: "获取匹配状态失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, status, matchAt } = data;

    if (!userId) {
      return NextResponse.json({ error: "缺少 userId 参数" }, { status: 400 });
    }

    if (!status || ![
      "WAITING",
      "MATCHED",
      "VIEWED"
    ].includes(status)) {
      return NextResponse.json({ error: "无效的 matching_status" }, { status: 400 });
    }

    // 优先使用前端传入的 matchAt；若未传入，则使用统一时间逻辑计算
    const targetTime = matchAt ? (typeof matchAt === 'number' ? new Date(matchAt) : matchAt) : new Date(getNextMatchTime());

    const updateData: { matching_status?: "WAITING" | "MATCHED" | "VIEWED"; match_at?: Date } = {
      matching_status: status as "WAITING" | "MATCHED" | "VIEWED",
      match_at: targetTime,
    };

    await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, Number(userId)));

    return NextResponse.json({
      success: true,
      matchingStatus: status as "WAITING" | "MATCHED" | "VIEWED",
      matchAt: targetTime.getTime(),
    });
  } catch (error) {
    console.error("Error updating match status:", error);
    return NextResponse.json({ error: "更新匹配状态失败" }, { status: 500 });
  }
}
