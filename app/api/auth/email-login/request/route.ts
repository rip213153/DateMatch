import { desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { profiles } from "@/lib/schema";
import { createSessionToken } from "@/lib/session";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body?.email ?? ""));

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "请输入有效邮箱" }, { status: 400 });
    }

    const rows = await db
      .select({ id: profiles.id, email: profiles.email })
      .from(profiles)
      .where(sql`lower(${profiles.email}) = ${email}`)
      .orderBy(desc(profiles.id))
      .limit(1);

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "邮箱未找到，请先完成测试并提交资料" },
        { status: 404 }
      );
    }

    const matched = rows[0];
    const response = NextResponse.json({
      success: true,
      message: "验证通过，正在登录",
      email: matched.email,
      userId: matched.id,
    });

    response.cookies.set({
      name: "datematch_session",
      value: createSessionToken(matched.email),
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