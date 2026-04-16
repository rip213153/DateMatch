export function readCookieValue(cookieHeader: string | null, cookieName: string): string {
  if (!cookieHeader) return "";

  for (const segment of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = segment.split("=");
    if (!rawName || rawValueParts.length === 0) continue;

    if (rawName.trim() !== cookieName) continue;
    return rawValueParts.join("=").trim();
  }

  return "";
}

export function readOpsAccessTokenFromRequest(
  request: Pick<Request, "headers">,
  cookieName: string,
) {
  const authorization = request.headers.get("authorization")?.trim() ?? "";
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  const headerToken = request.headers.get("x-ops-token")?.trim() ?? "";
  if (headerToken) {
    return headerToken;
  }

  return readCookieValue(request.headers.get("cookie"), cookieName);
}

export function isOpsRequestTokenAuthorized(options: {
  configuredToken: string;
  providedToken: string;
  bypassEnabled: boolean;
}) {
  const { configuredToken, providedToken, bypassEnabled } = options;

  if (!configuredToken) {
    return bypassEnabled;
  }

  return providedToken === configuredToken;
}
