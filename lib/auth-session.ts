import { sql } from "drizzle-orm";
import { getAuthSessionStateCore, type SessionRouteDependencies } from "./auth-session-core";
import { getDbForMode } from "./database";
import { readSessionFromRequest } from "./server-auth";
import { profiles } from "./schema";
import type { SessionPayload } from "./session";

async function getProfileByEmail(payload: SessionPayload) {
  const db = getDbForMode(payload.mode);
  const rows = await db
    .select({ id: profiles.id, email: profiles.email })
    .from(profiles)
    .where(sql`lower(${profiles.email}) = lower(${payload.email})`)
    .limit(1);

  return rows[0] ?? null;
}

export async function getAuthSessionState(
  request: Request,
  dependencies: SessionRouteDependencies = {
    readSessionFromRequest,
    getProfileByEmail,
  },
) {
  return getAuthSessionStateCore(request, dependencies);
}
