import { apiSuccess } from "@/lib/api-route";
import { getAuthSessionState } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return apiSuccess(await getAuthSessionState(request));
}
