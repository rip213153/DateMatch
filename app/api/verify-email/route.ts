import { createHash } from "crypto";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { emailLoginTokens } from "@/lib/schema";
import { createSessionToken } from "@/lib/session";

function normalizeRedirect(value: string) {
  return value.startsWith("/") ? value : "/results";
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function resolveSessionMode(redirect: string) {
  try {
    const redirectUrl = new URL(redirect, "http://localhost");
    return redirectUrl.searchParams.get("mode") === "friendship" ? "friendship" : "romance";
  } catch {
    return "romance";
  }
}

function redirectToLoginWithError(origin: string, code: string) {
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", code);
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() ?? "";
  const redirect = normalizeRedirect(url.searchParams.get("redirect")?.trim() ?? "/results");

  if (!token) {
    return redirectToLoginWithError(url.origin, "missing_token");
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const tokenHash = hashValue(token);

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
      return redirectToLoginWithError(url.origin, "invalid_or_expired");
    }

    const row = rows[0];

    await db
      .update(emailLoginTokens)
      .set({ used_at: now })
      .where(eq(emailLoginTokens.id, row.id));

    const sessionToken = createSessionToken(row.email, resolveSessionMode(redirect));
    const target = new URL(redirect, url.origin);
    const response = NextResponse.redirect(target);

    response.cookies.set({
      name: "datematch_session",
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("verify email link failed:", error);
    return redirectToLoginWithError(url.origin, "server_error");
  }
}
