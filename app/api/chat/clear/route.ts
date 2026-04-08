import { eq, or } from "drizzle-orm";
import { apiSuccess, handleApiRouteError, readJsonBody, readPositiveInt } from "@/lib/api-route";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { chatMessages } from "@/lib/schema";
import { requireAuthenticatedProfile } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await readJsonBody(request);
    const mode = resolveQuizMode(payload?.mode);
    const requestedUserId = readPositiveInt(payload?.userId);
    const { profile } = await requireAuthenticatedProfile(request, mode, {
      claimedUserId: requestedUserId,
    });
    const userId = Number(profile.id);
    const db = getDbForMode(mode);

    await db
      .delete(chatMessages)
      .where(or(eq(chatMessages.sender_id, userId), eq(chatMessages.receiver_id, userId)));

    return apiSuccess({
      mode,
      message: "Cleared the current user's chat history",
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to clear chat history",
      code: "CLEAR_CHAT_HISTORY_FAILED",
      logMessage: "Error clearing chat messages:",
    });
  }
}
