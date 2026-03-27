import { apiSuccess } from "@/lib/api-route";
import { verifySessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const raw = request.headers.get("cookie") ?? "";
  const sessionCookie = raw
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("datematch_session="));
  const token = sessionCookie ? decodeURIComponent(sessionCookie.slice("datematch_session=".length)) : "";
  const payload = token ? verifySessionToken(token) : null;

  if (!payload) {
    return apiSuccess({ isAuthenticated: false });
  }

  return apiSuccess({
    isAuthenticated: true,
    email: payload.email,
    expiresAt: payload.exp,
  });
}
