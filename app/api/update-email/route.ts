import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { profiles } from "@/lib/schema";

export async function POST(request: Request) {
  try {
    const { userId, newEmail } = await request.json();

    if (!userId || !newEmail) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const email = newEmail.trim().toLowerCase();

    await db.update(profiles).set({ email }).where(eq(profiles.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating email:", error);
    return NextResponse.json({ error: "修改邮箱失败" }, { status: 500 });
  }
}
