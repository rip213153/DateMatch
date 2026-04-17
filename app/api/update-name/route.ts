import { eq } from "drizzle-orm";
import {
  apiSuccess,
  assertApi,
  handleApiRouteError,
  readJsonBody,
  readPositiveInt,
  readTrimmedString,
} from "@/lib/api-route";
import { getDatabaseContextForMode, resolveQuizMode } from "@/lib/database";
import { requireAuthenticatedProfile } from "@/lib/server-auth";
import { postUpdateProfileFieldAuthContext } from "@/lib/update-profile-field-route-core";

export async function POST(request: Request) {
  try {
    const { body, mode, authenticatedProfile: profile } = await postUpdateProfileFieldAuthContext(request, {
      readJsonBody,
      readPositiveInt,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });
    const newName = readTrimmedString(body.newName);

    assertApi(newName, "缂哄皯蹇呰鍙傛暟", {
      status: 400,
      code: "MISSING_NAME",
    });

    const { db, tables: { profiles } } = getDatabaseContextForMode(mode);
    await db.update(profiles).set({ name: newName }).where(eq(profiles.id, Number(profile.id)));

    return apiSuccess({ message: "鏄电О宸叉洿鏂?" });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "鏇存柊澶辫触",
      code: "UPDATE_NAME_FAILED",
      logMessage: "Error updating name:",
    });
  }
}
