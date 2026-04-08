import { and, eq, ne, sql } from "drizzle-orm";
import {
  apiSuccess,
  assertApi,
  handleApiRouteError,
  readJsonBody,
  readLowercaseEmail,
  readPositiveInt,
} from "@/lib/api-route";
import { createSessionToken } from "@/lib/session";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { profiles } from "@/lib/schema";
import { requireAuthenticatedProfile } from "@/lib/server-auth";
import { postUpdateProfileFieldAuthContext } from "@/lib/update-profile-field-route-core";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const { body, mode, authenticatedProfile: profile } = await postUpdateProfileFieldAuthContext(request, {
      readJsonBody,
      readPositiveInt,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });
    const newEmail = readLowercaseEmail(body.newEmail);
    const userId = Number(profile.id);

    assertApi(isValidEmail(newEmail), "璇疯緭鍏ユ湁鏁堥偖绠?", {
      status: 400,
      code: "INVALID_EMAIL",
    });

    const db = getDbForMode(mode);
    const duplicateRows = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(and(sql`lower(${profiles.email}) = ${newEmail}`, ne(profiles.id, userId)))
      .limit(1);

    assertApi(duplicateRows.length === 0, "閭宸茶鍏朵粬鐢ㄦ埛浣跨敤", {
      status: 409,
      code: "EMAIL_ALREADY_IN_USE",
    });

    await db.update(profiles).set({ email: newEmail }).where(eq(profiles.id, userId));

    const response = apiSuccess({ email: newEmail });
    response.cookies.set({
      name: "datematch_session",
      value: createSessionToken(newEmail, mode),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiRouteError(error, {
      message: "淇敼閭澶辫触",
      code: "UPDATE_EMAIL_FAILED",
      logMessage: "Error updating email:",
    });
  }
}
