export type SessionPayloadLike = {
  email: string;
  mode: "romance" | "friendship";
  exp: number;
};

export type SessionRouteProfile = {
  id: number;
  email: string;
};

export type SessionRouteDependencies = {
  readSessionFromRequest: (request: Request) => SessionPayloadLike | null;
  getProfileByEmail: (payload: SessionPayloadLike) => Promise<SessionRouteProfile | null>;
};

export function readSessionTokenFromCookieHeader(rawCookieHeader: string) {
  const sessionCookie = rawCookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("datematch_session="));

  return sessionCookie ? decodeURIComponent(sessionCookie.slice("datematch_session=".length)) : "";
}

export function readSessionPayloadFromCookieHeader(
  rawCookieHeader: string,
  verifySessionToken: (token: string) => SessionPayloadLike | null,
) {
  const token = readSessionTokenFromCookieHeader(rawCookieHeader);
  return token ? verifySessionToken(token) : null;
}

export function isAuthenticatedUserIdAllowed(
  authenticatedUserId: number,
  claimedUserId?: number | null,
) {
  return claimedUserId === null || claimedUserId === undefined || authenticatedUserId === claimedUserId;
}

export async function getAuthSessionStateCore(
  request: Request,
  dependencies: SessionRouteDependencies,
) {
  const payload = dependencies.readSessionFromRequest(request);

  if (!payload) {
    return { isAuthenticated: false as const };
  }

  const profile = await dependencies.getProfileByEmail(payload);

  if (!profile) {
    return { isAuthenticated: false as const };
  }

  return {
    isAuthenticated: true as const,
    email: profile.email,
    mode: payload.mode,
    userId: profile.id,
    expiresAt: payload.exp,
  };
}
