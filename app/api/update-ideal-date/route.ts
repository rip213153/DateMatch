import { eq } from "drizzle-orm";
import {
  apiSuccess,
  assertApi,
  handleApiRouteError,
  readJsonBody,
  readPositiveInt,
  readTrimmedString,
} from "@/lib/api-route";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { profiles } from "@/lib/schema";
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
    const newIdealDate = readTrimmedString(body.newIdealDate);

    assertApi(newIdealDate || newIdealDate === "", "缂哄皯蹇呰鍙傛暟", {
      status: 400,
      code: "MISSING_IDEAL_DATE",
    });

    await getDbForMode(mode)
      .update(profiles)
      .set({ ideal_date: newIdealDate })
      .where(eq(profiles.id, Number(profile.id)));

    return apiSuccess({ message: "鐞嗘兂绾︿細宸叉洿鏂?" });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "鏇存柊澶辫触",
      code: "UPDATE_IDEAL_DATE_FAILED",
      logMessage: "Error updating ideal date:",
    });
  }
}
