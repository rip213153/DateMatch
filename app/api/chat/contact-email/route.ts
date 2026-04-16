import {
  apiSuccess,
  assertApi,
  handleApiRouteError,
  readPositiveInt,
} from "@/lib/api-route";
import { resolveChatEmailAccess } from "@/lib/chat-contact-email";
import { getChatMessagesAuthContext } from "@/lib/chat-messages-route-core";
import { resolveQuizMode } from "@/lib/database";
import { getProfileRowByIdForMode } from "@/lib/profile-updates";
import { requireAuthenticatedProfile } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { mode, targetUserId, authenticatedProfile: profile } =
      await getChatMessagesAuthContext(request, {
        readPositiveInt,
        resolveQuizMode,
        requireAuthenticatedProfile,
      });
    const userId = Number(profile.id);

    assertApi(targetUserId, "Missing valid targetUserId", {
      status: 400,
      code: "INVALID_CHAT_TARGET_USER_ID",
    });

    const targetProfile = await getProfileRowByIdForMode(mode, targetUserId);
    assertApi(targetProfile, "Chat user not found", {
      status: 404,
      code: "CHAT_USER_NOT_FOUND",
    });

    const { conversation, emailUnlocked } = await resolveChatEmailAccess(
      mode,
      userId,
      targetUserId,
    );

    assertApi(
      Boolean(conversation.source),
      "You can only access contact details for your current mutual recommendations or existing chats.",
      {
        status: 403,
        code: "CHAT_CONTACT_EMAIL_ACCESS_DENIED",
      },
    );

    return apiSuccess({
      mode,
      targetUserId,
      emailUnlocked,
      email: emailUnlocked ? String(targetProfile.email ?? "").trim() || null : null,
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to resolve contact email visibility",
      code: "FETCH_CHAT_CONTACT_EMAIL_FAILED",
      logMessage: "Error resolving chat contact email visibility:",
    });
  }
}
