import { createHash } from "crypto";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import {
  apiSuccess,
  assertApi,
  handleApiRouteError,
  readJsonBody,
  readTrimmedString,
} from "@/lib/api-route";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { setSessionCookie } from "@/lib/server-auth";
import { emailLoginTokens, profiles } from "@/lib/schema";

export const dynamic = "force-dynamic";

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const token = readTrimmedString(body.token);
    const requestedMode = resolveQuizMode(body.mode);

    assertApi(token, "缺少 token", {
      status: 400,
      code: "MISSING_TOKEN",
    });

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
            gt(emailLoginTokens.expires_at, now),
          ),
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

      const profileRows = await db
        .select({ id: profiles.id, email: profiles.email })
        .from(profiles)
        .where(sql`lower(${profiles.email}) = lower(${row.email})`)
        .limit(1);
      const profile = profileRows[0] ?? null;

      assertApi(profile, "Profile not found for this login token", {
        status: 404,
        code: "PROFILE_NOT_FOUND",
      });

      const response = apiSuccess({
        email: profile.email,
        mode,
        userId: profile.id,
      });
      setSessionCookie(response, profile.email, mode);
      return response;
    }

    return handleApiRouteError(new Error("invalid token"), {
      message: "验证链接无效或已过期",
      status: 400,
      code: "INVALID_OR_EXPIRED_TOKEN",
      logMessage: "verify token invalid:",
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "验证失败，请稍后重试",
      code: "VERIFY_EMAIL_TOKEN_FAILED",
      logMessage: "verify token failed:",
    });
  }
}
