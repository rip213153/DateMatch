import { asc } from "drizzle-orm";
import {
  apiSuccess,
  assertApi,
  handleApiRouteError,
  readJsonBody,
  readPositiveInt,
  readTrimmedString,
} from "@/lib/api-route";
import {
  getChatMessagesAuthContext,
  postChatMessagesAuthContext,
} from "@/lib/chat-messages-route-core";
import { buildChatConversationCondition, resolveChatConversationScope } from "@/lib/chat-conversations";
import { createChatNotificationEvent } from "@/lib/chat-notification-events";
import { getDatabaseContextForMode, resolveQuizMode } from "@/lib/database";
import { getProfileRowByIdForMode, syncProfileUpdateDrafts } from "@/lib/profile-updates";
import { requireAuthenticatedProfile } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

function toIsoString(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") {
    const ms = value > 1_000_000_000_000 ? value : value * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (typeof value === "string") {
    const numeric = Number(value);
    if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
      const ms = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
      const date = new Date(ms);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

async function getPairRows(mode: "romance" | "friendship", userId: number, targetUserId: number, roundKey: string | null) {
  const { db, tables: { chatMessages } } = getDatabaseContextForMode(mode);

  return db
    .select({
      id: chatMessages.id,
      round_key: chatMessages.round_key,
      sender_id: chatMessages.sender_id,
      receiver_id: chatMessages.receiver_id,
      content: chatMessages.content,
      created_at: chatMessages.created_at,
    })
    .from(chatMessages)
    .where(buildChatConversationCondition(chatMessages, userId, targetUserId, roundKey))
    .orderBy(asc(chatMessages.created_at), asc(chatMessages.id));
}

function countSenderMessagesSinceLastReply(
  pairRows: Array<{ sender_id: number; receiver_id: number }>,
  senderId: number,
  receiverId: number,
) {
  let count = 0;

  for (const row of pairRows) {
    if (row.sender_id === receiverId && row.receiver_id === senderId) {
      count = 0;
      continue;
    }

    if (row.sender_id === senderId && row.receiver_id === receiverId) {
      count += 1;
    }
  }

  return count;
}

export async function GET(request: Request) {
  try {
    const { mode, targetUserId, authenticatedProfile: profile } = await getChatMessagesAuthContext(request, {
      readPositiveInt,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });
    const userId = Number(profile.id);

    assertApi(targetUserId, "Missing valid targetUserId", {
      status: 400,
      code: "INVALID_CHAT_TARGET_USER_ID",
    });

    const now = new Date();
    await syncProfileUpdateDrafts(mode, now);
    const receiverProfile = await getProfileRowByIdForMode(mode, targetUserId);

    assertApi(receiverProfile, "Chat user not found", {
      status: 404,
      code: "CHAT_USER_NOT_FOUND",
    });

    const conversation = await resolveChatConversationScope(mode, userId, targetUserId, now);

    assertApi(Boolean(conversation.source), "You can only access chats from your current mutual recommendations.", {
      status: 403,
      code: "CHAT_ACCESS_DENIED",
    });

    const rows = (await getPairRows(mode, userId, targetUserId, conversation.roundKey)) as Array<{
      id: number;
      sender_id: number;
      receiver_id: number;
      content: string;
      created_at: unknown;
    }>;

    return apiSuccess({
      mode,
      messages: rows.map((row) => ({
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        content: row.content,
        createdAt: toIsoString(row.created_at),
      })),
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to fetch chat messages",
      code: "FETCH_CHAT_MESSAGES_FAILED",
      logMessage: "Error fetching chat messages:",
    });
  }
}

export async function POST(request: Request) {
  try {
    const { mode, receiverId, content, authenticatedProfile: profile } = await postChatMessagesAuthContext(request, {
      readJsonBody,
      readPositiveInt,
      readTrimmedString,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });
    const senderId = Number(profile.id);

    assertApi(receiverId, "Missing valid receiverId", {
      status: 400,
      code: "INVALID_CHAT_RECEIVER_ID",
    });
    assertApi(senderId !== receiverId, "Cannot send messages to yourself", {
      status: 400,
      code: "SELF_CHAT_NOT_ALLOWED",
    });
    assertApi(content, "Message content cannot be empty", {
      status: 400,
      code: "EMPTY_MESSAGE_CONTENT",
    });
    assertApi(content.length <= 1000, "Message content must be 1000 characters or fewer", {
      status: 400,
      code: "MESSAGE_CONTENT_TOO_LONG",
    });

    const now = new Date();
    await syncProfileUpdateDrafts(mode, now);
    const { db, tables: { chatMessages } } = getDatabaseContextForMode(mode);
    const receiverProfile = await getProfileRowByIdForMode(mode, receiverId);

    assertApi(receiverProfile, "Chat user not found", {
      status: 404,
      code: "CHAT_USER_NOT_FOUND",
    });

    const conversation = await resolveChatConversationScope(mode, senderId, receiverId, now);

    assertApi(Boolean(conversation.source), "The other user is not currently in your mutual recommendations.", {
      status: 403,
      code: "CHAT_TARGET_NOT_AVAILABLE",
    });

    const pairRows = await getPairRows(mode, senderId, receiverId, conversation.roundKey);
    const senderMessagesSinceLastReply = countSenderMessagesSinceLastReply(pairRows, senderId, receiverId);
    assertApi(senderMessagesSinceLastReply < 1, "You can only send one opening message until the other user replies.", {
      status: 403,
      code: "CHAT_OPENING_MESSAGE_LIMIT",
    });

    const [inserted] = await db
      .insert(chatMessages)
      .values({
        round_key: conversation.roundKey,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        created_at: now,
      })
      .returning({
        id: chatMessages.id,
        round_key: chatMessages.round_key,
        sender_id: chatMessages.sender_id,
        receiver_id: chatMessages.receiver_id,
        content: chatMessages.content,
        created_at: chatMessages.created_at,
      });

    let notificationEvent = null;
    try {
      notificationEvent = await createChatNotificationEvent(mode, {
        messageId: inserted.id,
        senderId,
        receiverId,
      });
    } catch (notificationError) {
      console.error("Error creating chat notification event:", notificationError);
    }

    return apiSuccess({
      mode,
      message: {
        id: inserted.id,
        senderId: inserted.sender_id,
        receiverId: inserted.receiver_id,
        content: inserted.content,
        createdAt: toIsoString(inserted.created_at),
      },
      notificationEvent,
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to send chat message",
      code: "SEND_CHAT_MESSAGE_FAILED",
      logMessage: "Error sending chat message:",
    });
  }
}
