import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { profiles } from "@/lib/schema";
import { getBestMatches } from "@/lib/matching";
import type { UserProfile } from "@/app/data/types";
import { normalizeProfiles } from "@/lib/profile-normalizer";
import { eq } from "drizzle-orm";
import { sendMatchResultEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/email";

export const dynamic = "force-dynamic";

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

function buildCurrentUserPayload(user: Pick<UserProfile, "id" | "name">) {
  return {
    id: user.id,
    name: user.name,
    chat_user_id: null,
  };
}

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
  
  // 匹配时间 = 下周三 18:00
  const matchTime = nextWednesday.getTime();
  
  // 展示结束时间 = 匹配时间 + 5 天
  const displayEndTime = matchTime + (DISPLAY_DAYS * 24 * 60 * 60 * 1000);
  
  // 如果当前时间在匹配后的展示期内，返回展示结束时间
  // 否则返回下一个匹配时间
  if (now.getTime() >= matchTime && now.getTime() < displayEndTime) {
    return displayEndTime;
  }
  
  return matchTime;
}

async function findMatchesByUserId(userId: number) {
  const allUsers = normalizeProfiles(await db.select().from(profiles));
  const currentUser = allUsers.find((user) => Number(user.id) === userId);

  if (!currentUser) {
    return null;
  }

  const matches = getBestMatches(currentUser, allUsers, 5);

  return {
    currentUser,
    matches,
  };
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const userId = toPositiveInt(data.userId);

    if (!userId) {
      return NextResponse.json({ error: "缺少合法的用户 ID" }, { status: 400 });
    }

    const result = await findMatchesByUserId(userId);

    if (!result) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const now = new Date();
    
    // 计算本周三 18:00 的时间
    const today = new Date(now);
    const daysSinceThisWeekWednesday = (now.getDay() - MATCH_DAY + 7) % 7;
    const thisWednesday = new Date(now);
    thisWednesday.setDate(now.getDate() - daysSinceThisWeekWednesday);
    thisWednesday.setHours(MATCH_HOUR, MATCH_MINUTE, 0, 0);
    
    // 计算下周三 18:00 的时间
    const nextWednesday = new Date(thisWednesday);
    nextWednesday.setDate(nextWednesday.getDate() + 7);
    
    // 计算展示结束时间 (匹配时间 + 5 天)
    const displayEndTime = new Date(thisWednesday);
    displayEndTime.setDate(thisWednesday.getDate() + DISPLAY_DAYS);
    
    const currentTime = now.getTime();
    const wednesdayTime = thisWednesday.getTime();
    const endTime = displayEndTime.getTime();
    const nextMatchTime = nextWednesday.getTime();
    
    // 判断当前是否在展示期内
    const isInDisplayPeriod = currentTime >= wednesdayTime && currentTime < endTime;
    
    // 强制返回匹配结果，不检查时间
    // if (!isInDisplayPeriod) {
    //   return NextResponse.json({
    //     success: true,
    //     matches: [],
    //     totalMatches: 0,
    //     currentUser: buildCurrentUserPayload(result.currentUser as any),
    //     matchAt: nextMatchTime,
    //   });
    // }
    
    // 在展示期内，返回匹配结果
    const response = NextResponse.json({
      success: true,
      matches: result.matches,
      totalMatches: result.matches.length,
      currentUser: buildCurrentUserPayload(result.currentUser as any),
      matchAt: nextMatchTime,
    });
    
    // 如果是刚进入展示期 (24 小时内)，发送邮件通知
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const isJustStarted = currentTime >= wednesdayTime && currentTime < wednesdayTime + oneDayInMs;
    
    if (isJustStarted && result.matches.length > 0) {
      try {
        const user = result.currentUser as any;
        
        // 检查是否已经发送过邮件
        if (!user.email_sent_at) {
          const viewUrl = `${getBaseUrl()}/dev-channel-2`;
          
          // 异步发送邮件，不阻塞响应
          sendMatchResultEmail({
            email: user.email,
            name: user.name || user.email.split('@')[0],
            matchCount: result.matches.length,
            viewUrl,
          }).then(() => {
            // 邮件发送成功后更新数据库
            db.update(profiles)
              .set({ email_sent_at: new Date() })
              .where(eq(profiles.id, user.id))
              .catch(err => {
                console.error("更新 email_sent_at 失败:", err);
              });
          }).catch(err => {
            console.error("发送匹配结果邮件失败:", err);
          });
        }
      } catch (err) {
        console.error("准备发送邮件时出错:", err);
      }
    }
    
    return response;
  } catch (error) {
    console.error("Error finding matches:", error);
    return NextResponse.json({ error: "匹配失败，请重试" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = toPositiveInt(searchParams.get("userId"));

    if (!userId) {
      return NextResponse.json({ error: "缺少合法的 userId 参数" }, { status: 400 });
    }

    const result = await findMatchesByUserId(userId);

    if (!result) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const now = new Date();
    
    // 计算本周三 18:00 的时间
    const daysSinceThisWeekWednesday = (now.getDay() - MATCH_DAY + 7) % 7;
    const thisWednesday = new Date(now);
    thisWednesday.setDate(now.getDate() - daysSinceThisWeekWednesday);
    thisWednesday.setHours(MATCH_HOUR, MATCH_MINUTE, 0, 0);
    
    // 计算下周三 18:00 的时间
    const nextWednesday = new Date(thisWednesday);
    nextWednesday.setDate(nextWednesday.getDate() + 7);
    
    // 计算展示结束时间 (匹配时间 + 5 天)
    const displayEndTime = new Date(thisWednesday);
    displayEndTime.setDate(thisWednesday.getDate() + DISPLAY_DAYS);
    
    const currentTime = now.getTime();
    const wednesdayTime = thisWednesday.getTime();
    const endTime = displayEndTime.getTime();
    const nextMatchTime = nextWednesday.getTime();
    
    // 判断当前是否在展示期内
    const isInDisplayPeriod = currentTime >= wednesdayTime && currentTime < endTime;
    
    // 强制返回匹配结果，不检查时间
    // if (!isInDisplayPeriod) {
    //   return NextResponse.json({
    //     success: true,
    //     matches: [],
    //     totalMatches: 0,
    //     currentUser: buildCurrentUserPayload(result.currentUser as any),
    //     matchAt: nextMatchTime,
    //   });
    // }
    
    // 在展示期内，返回匹配结果
    const response = NextResponse.json({
      success: true,
      matches: result.matches,
      totalMatches: result.matches.length,
      currentUser: buildCurrentUserPayload(result.currentUser as any),
      matchAt: nextMatchTime,
    });
    
    // 如果是刚进入展示期 (1 小时内)，发送邮件通知
    const oneHourInMs = 60 * 60 * 1000;
    const isJustStarted = currentTime >= wednesdayTime && currentTime < wednesdayTime + oneHourInMs;
    
    if (isJustStarted && result.matches.length > 0) {
      try {
        const user = result.currentUser as any;
        
        // 检查是否已经发送过邮件
        if (!user.email_sent_at) {
          const viewUrl = `${getBaseUrl()}/dev-channel-2`;
          
          // 异步发送邮件，不阻塞响应
          sendMatchResultEmail({
            email: user.email,
            name: user.name || user.email.split('@')[0],
            matchCount: result.matches.length,
            viewUrl,
          }).then(() => {
            // 邮件发送成功后更新数据库
            db.update(profiles)
              .set({ email_sent_at: new Date() })
              .where(eq(profiles.id, user.id))
              .catch(err => {
                console.error("更新 email_sent_at 失败:", err);
              });
          }).catch(err => {
            console.error("发送匹配结果邮件失败:", err);
          });
        }
      } catch (err) {
        console.error("准备发送邮件时出错:", err);
      }
    }
    
    return response;
  } catch (error) {
    console.error("Error finding matches:", error);
    return NextResponse.json({ error: "匹配失败，请重试" }, { status: 500 });
  }
}
