import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { profiles } from "@/lib/schema";

export async function POST(request: Request) {
  try {
    const { userId, newName, mode } = await request.json();
    const db = getDbForMode(resolveQuizMode(mode));

    if (!userId || !newName) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    await db.update(profiles).set({ name: newName }).where(eq(profiles.id, userId)).run();

    return NextResponse.json({ success: true, message: "昵称已更新" });
  } catch (error) {
    console.error("Error updating name:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
