import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { profiles } from "@/lib/schema";
import { getBestMatches } from "@/lib/matching";
import type { UserProfile } from "@/app/data/types";
import { normalizeProfiles } from "@/lib/profile-normalizer";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId } = data;

    if (!userId) {
      return NextResponse.json({ error: "缺少 userId 参数" }, { status: 400 });
    }

    const allUsers = normalizeProfiles(await db.select().from(profiles));
    const currentUser = allUsers.find((user) => Number(user.id) === userId);

    if (!currentUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 计算匹配
    const matches = getBestMatches(currentUser, allUsers, 5);

    // 更新用户状态为 MATCHED
    await db
      .update(profiles)
      .set({
        matching_status: "MATCHED",
        match_at: new Date(),
      })
      .where(eq(profiles.id, Number(userId)));

    return NextResponse.json({
      success: true,
      matches,
      totalMatches: matches.length,
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        chat_user_id: (currentUser as any).chat_user_id ?? null,
      },
    });
  } catch (error) {
    console.error("Error calculating matches:", error);
    return NextResponse.json({ error: "匹配计算失败" }, { status: 500 });
  }
}
