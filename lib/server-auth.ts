import type { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import type { QuizMode } from "../app/data/types";
import type { ProfileRow } from "./db/schema-types";
import { assertApi } from "./api-route";
import {
  isAuthenticatedUserIdAllowed,
  readSessionPayloadFromCookieHeader,
} from "./auth-session-core";
import { getDatabaseContextForMode } from "./database";
import type { SessionPayload } from "./session";
import { createSessionToken, verifySessionToken } from "./session";

export const SESSION_COOKIE_NAME = "datematch_session";

export type AuthenticatedRequestContext = {
  mode: QuizMode;
  session: SessionPayload;
  profile: ProfileRow;
};

export function readSessionFromRequest(request: Request): SessionPayload | null {
  return readSessionPayloadFromCookieHeader(request.headers.get("cookie") ?? "", verifySessionToken);
}

export function setSessionCookie(
  response: NextResponse,
  email: string,
  mode: QuizMode,
) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: createSessionToken(email, mode),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

export function resolveAuthenticatedUserId(
  authenticatedUserId: number,
  claimedUserId?: number | null,
) {
  assertApi(isAuthenticatedUserIdAllowed(authenticatedUserId, claimedUserId), "You are not allowed to access another user's data.", {
    status: 403,
    code: "AUTH_USER_MISMATCH",
  });

  return authenticatedUserId;
}

export async function requireAuthenticatedProfile(
  request: Request,
  mode: QuizMode,
  options: {
    claimedUserId?: number | null;
  } = {},
): Promise<AuthenticatedRequestContext> {
  const session = readSessionFromRequest(request);

  assertApi(session, "Please log in first.", {
    status: 401,
    code: "AUTH_REQUIRED",
  });
  assertApi(session.mode === mode, "Current session does not match the requested mode.", {
    status: 403,
    code: "AUTH_MODE_MISMATCH",
  });

  const { db, tables: { profiles } } = getDatabaseContextForMode(mode);
  const rows = await db
    .select()
    .from(profiles)
    .where(sql`lower(${profiles.email}) = ${session.email}`)
    .limit(1);

  const profile = rows[0] ?? null;
  assertApi(profile, "The current session could not find a matching profile.", {
    status: 404,
    code: "AUTH_PROFILE_NOT_FOUND",
  });

  resolveAuthenticatedUserId(Number(profile.id), options.claimedUserId);

  return {
    mode,
    session,
    profile,
  };
}
