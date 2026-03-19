import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { profiles } from "@/lib/schema";
import { createSessionToken } from "@/lib/session";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function findProfileByEmail(email: string, mode: "romance" | "friendship") {
  const db = getDbForMode(mode);
  const rows = await db
    .select({ id: profiles.id, email: profiles.email })
    .from(profiles)
    .where(sql`lower(${profiles.email}) = lower(${email})`)
    .limit(1);

  return rows[0] ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body?.email ?? ""));
    const requestedMode = resolveQuizMode(body?.mode);

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "请输入有效邮箱" }, { status: 400 });
    }

    const matched = await findProfileByEmail(email, requestedMode);

    if (!matched) {
      return NextResponse.json(
        { success: false, error: "邮箱未找到，请先完成测试并提交资料" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "验证通过，正在登录",
      email: matched.email,
      userId: matched.id,
      mode: requestedMode,
    });

    response.cookies.set({
      name: "datematch_session",
      value: createSessionToken(matched.email, requestedMode),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("direct email login failed:", error);
    return NextResponse.json({ success: false, error: "验证失败，请稍后重试" }, { status: 500 });
  }
}
