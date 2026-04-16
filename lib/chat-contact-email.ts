import type { QuizMode } from "@/app/data/types";
import {
  buildChatConversationCondition,
  resolveChatConversationScope,
} from "@/lib/chat-conversations";
import { getDbForMode } from "@/lib/database";
import { chatMessages } from "@/lib/schema";

export type ChatDirectionRow = {
  sender_id: number;
  receiver_id: number;
};

export function hasMutualMessageExchange(
  rows: ChatDirectionRow[],
  userId: number,
  targetUserId: number,
) {
  let sentByCurrentUser = false;
  let sentByTargetUser = false;

  for (const row of rows) {
    if (row.sender_id === userId && row.receiver_id === targetUserId) {
      sentByCurrentUser = true;
    }

    if (row.sender_id === targetUserId && row.receiver_id === userId) {
      sentByTargetUser = true;
    }

    if (sentByCurrentUser && sentByTargetUser) {
      return true;
    }
  }

  return false;
}

export async function resolveChatEmailAccess(
  mode: QuizMode,
  userId: number,
  targetUserId: number,
  now: Date = new Date(),
) {
  const conversation = await resolveChatConversationScope(
    mode,
    userId,
    targetUserId,
    now,
  );

  if (!conversation.source) {
    return {
      conversation,
      emailUnlocked: false,
    };
  }

  const db = getDbForMode(mode);
  const rows = await db
    .select({
      sender_id: chatMessages.sender_id,
      receiver_id: chatMessages.receiver_id,
    })
    .from(chatMessages)
    .where(buildChatConversationCondition(userId, targetUserId, conversation.roundKey));

  return {
    conversation,
    emailUnlocked: hasMutualMessageExchange(rows, userId, targetUserId),
  };
}
