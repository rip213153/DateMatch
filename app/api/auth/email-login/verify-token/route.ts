import { createHash } from "crypto";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { emailLoginTokens } from "@/lib/schema";

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body?.token ?? "").trim();
    const requestedMode = resolveQuizMode(body?.mode);

    if (!token) {
      return NextResponse.json({ success: false, error: "缺少 token" }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    const tokenHash = hashValue(token);
    const modesToCheck =
      requestedMode === "friendship"
        ? (["friendship", "romance"] as const)
        : (["romance", "friendship"] as const);

    for (const mode of modesToCheck) {
      const db = getDbForMode(mode);
      const rows = await db
        .select({ id: emailLoginTokens.id, email: emailLoginTokens.email })
        .from(emailLoginTokens)
        .where(
          and(
            eq(emailLoginTokens.token_hash, tokenHash),
            isNull(emailLoginTokens.used_at),
            gt(emailLoginTokens.expires_at, now)
          )
        )
        .orderBy(desc(emailLoginTokens.id))
        .limit(1);

      if (!rows.length) {
        continue;
      }

      const row = rows[0];

      await db
        .update(emailLoginTokens)
        .set({ used_at: now })
        .where(eq(emailLoginTokens.id, row.id));

      return NextResponse.json({ success: true, email: row.email, mode });
    }

    return NextResponse.json(
      { success: false, error: "验证链接无效或已过期" },
      { status: 400 }
    );
  } catch (error) {
    console.error("verify token failed:", error);
    return NextResponse.json({ success: false, error: "验证失败，请稍后重试" }, { status: 500 });
  }
}
