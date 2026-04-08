import { eq } from "drizzle-orm";
import {
  apiSuccess,
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
    const newBio = readTrimmedString(body.newBio);

    const db = getDbForMode(mode);
    await db.update(profiles).set({ bio: newBio }).where(eq(profiles.id, Number(profile.id)));

    return apiSuccess({ message: "鑷垜浠嬬粛宸叉洿鏂?" });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "鏇存柊澶辫触",
      code: "UPDATE_BIO_FAILED",
      logMessage: "Error updating bio:",
    });
  }
}
