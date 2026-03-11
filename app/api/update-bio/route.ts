import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { profiles } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { userId, newBio } = await request.json();

    if (!userId || newBio === undefined) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    await db
      .update(profiles)
      .set({ bio: newBio })
      .where(eq(profiles.id, userId))
      .run();

    return NextResponse.json({ success: true, message: "自我介绍已更新" });
  } catch (error) {
    console.error("Error updating bio:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
