import { and, desc, eq, isNull, or } from "drizzle-orm";
import type { QuizMode } from "@/app/data/types";
import { getDbForMode } from "@/lib/database";
import { getMatchSchedule } from "@/lib/match-schedule";
import { buildMutualRoundKey, hasMutualPairForUsers } from "@/lib/mutual-matching";
import { chatMessages } from "@/lib/schema";

export type ChatConversationScope = {
  roundKey: string | null;
  source: "current_mutual_pair" | "history" | null;
};

export function normalizeChatRoundKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function buildChatPairCondition(userId: number, targetUserId: number) {
  return or(
    and(eq(chatMessages.sender_id, userId), eq(chatMessages.receiver_id, targetUserId)),
    and(eq(chatMessages.sender_id, targetUserId), eq(chatMessages.receiver_id, userId))
  );
}

export function buildChatConversationCondition(userId: number, targetUserId: number, roundKey: string | null) {
  const pairCondition = buildChatPairCondition(userId, targetUserId);

  return roundKey === null
    ? and(pairCondition, isNull(chatMessages.round_key))
    : and(pairCondition, eq(chatMessages.round_key, roundKey));
}

export async function resolveChatConversationScope(
  mode: QuizMode,
  userId: number,
  targetUserId: number,
  now: Date = new Date()
): Promise<ChatConversationScope> {
  const schedule = getMatchSchedule(now);
  if (schedule.isInDisplayWindow) {
    const canUseMutualPair = await hasMutualPairForUsers(userId, targetUserId, mode, schedule.releaseAt);
    if (canUseMutualPair) {
      return {
        roundKey: buildMutualRoundKey(mode, schedule.releaseAt),
        source: "current_mutual_pair",
      };
    }
  }

  const db = getDbForMode(mode);
  const [latestRow] = await db
    .select({
      round_key: chatMessages.round_key,
    })
    .from(chatMessages)
    .where(buildChatPairCondition(userId, targetUserId))
    .orderBy(desc(chatMessages.created_at), desc(chatMessages.id))
    .limit(1);

  if (!latestRow) {
    return {
      roundKey: null,
      source: null,
    };
  }

  return {
    roundKey: normalizeChatRoundKey(latestRow.round_key),
    source: "history",
  };
}
