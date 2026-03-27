import { desc, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { normalizeChatRoundKey } from "@/lib/chat-conversations";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { getMatchSchedule } from "@/lib/match-schedule";
import { buildMutualRoundKey, getMutualPairRowsForUser, getMutualTargetUserId } from "@/lib/mutual-matching";
import { getProfileRowsForMode } from "@/lib/profile-updates";
import { normalizeProfiles } from "@/lib/profile-normalizer";
import { chatMessages } from "@/lib/schema";

export const dynamic = "force-dynamic";

type ContactItem = {
  id: number;
  name: string;
  age: number;
  university: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  email: string;
  ideal_date: string;
  ideal_date_tags?: string[];
  bio?: string;
  interests?: string | string[];
};

function toPositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function toIsoString(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") {
    const ms = value > 1_000_000_000_000 ? value : value * 1000;
    return new Date(ms).toISOString();
  }
  if (typeof value === "string") {
    const numeric = Number(value);
    if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
      const ms = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
      return new Date(ms).toISOString();
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = toPositiveInt(searchParams.get("userId"));
    const mode = resolveQuizMode(searchParams.get("mode"));

    if (!userId) {
      return NextResponse.json({ error: "Missing valid userId" }, { status: 400 });
    }

    const db = getDbForMode(mode);
    const now = new Date();
    const profileRows = await getProfileRowsForMode(mode, now);
    const allUsers = normalizeProfiles(profileRows);
    const currentUser = allUsers.find((user) => Number(user.id) === userId);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const schedule = getMatchSchedule(now);
    const mutualPairRows = schedule.isInDisplayWindow
      ? await getMutualPairRowsForUser(userId, mode, profileRows, schedule.releaseAt, now)
      : [];
    const currentRoundKey = schedule.isInDisplayWindow ? buildMutualRoundKey(mode, schedule.releaseAt) : null;

    const pairScoreMap = new Map(
      mutualPairRows.map((pairRow) => [getMutualTargetUserId(pairRow, userId), Number(pairRow.pair_score)])
    );
    const userMap = new Map(allUsers.map((user) => [Number(user.id), user]));

    const messageRows = await db
      .select({
        id: chatMessages.id,
        round_key: chatMessages.round_key,
        sender_id: chatMessages.sender_id,
        receiver_id: chatMessages.receiver_id,
        content: chatMessages.content,
        created_at: chatMessages.created_at,
      })
      .from(chatMessages)
      .where(or(eq(chatMessages.sender_id, userId), eq(chatMessages.receiver_id, userId)))
      .orderBy(desc(chatMessages.created_at), desc(chatMessages.id));

    const visibleContactIds = new Set<number>(Array.from(pairScoreMap.keys()));
    const latestMessageMap = new Map<number, { content: string; createdAt: string | null }>();
    const historyRoundMap = new Map<number, string | null>();

    for (const row of messageRows) {
      const contactId: number = row.sender_id === userId ? row.receiver_id : row.sender_id;
      if (contactId === userId) continue;

      const messageRoundKey = normalizeChatRoundKey(row.round_key);
      const isCurrentTopMatch = pairScoreMap.has(contactId);

      if (isCurrentTopMatch) {
        if (currentRoundKey && messageRoundKey === currentRoundKey && !latestMessageMap.has(contactId)) {
          latestMessageMap.set(contactId, {
            content: row.content,
            createdAt: toIsoString(row.created_at),
          });
        }
        continue;
      }

      if (!historyRoundMap.has(contactId)) {
        historyRoundMap.set(contactId, messageRoundKey);
        visibleContactIds.add(contactId);
      }

      if (!latestMessageMap.has(contactId)) {
        latestMessageMap.set(contactId, {
          content: row.content,
          createdAt: toIsoString(row.created_at),
        });
      }
    }

    const contacts: ContactItem[] = Array.from(visibleContactIds)
      .map((contactId) => {
        const user = userMap.get(contactId);
        if (!user) return null;

        const lastMessage = latestMessageMap.get(contactId);
        const pairScore = pairScoreMap.get(contactId);

        return {
          id: contactId,
          name: user.name,
          age: user.age,
          university: user.university,
          lastMessage: lastMessage?.content ?? null,
          lastMessageAt: lastMessage?.createdAt ?? null,
          email: user.email,
          ideal_date: user.ideal_date,
          ideal_date_tags: user.ideal_date_tags,
          bio: user.bio,
          interests: user.interests,
          rankScore: pairScore ?? 0,
          isTopMatch: typeof pairScore === "number",
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        if (a.isTopMatch !== b.isTopMatch) return a.isTopMatch ? -1 : 1;
        const aTime = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
        const bTime = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
        if (aTime !== bTime) return bTime - aTime;
        if (a.rankScore !== b.rankScore) return b.rankScore - a.rankScore;
        return a.id - b.id;
      })
      .map((item) => ({
        id: item.id,
        name: item.name,
        age: item.age,
        university: item.university,
        lastMessage: item.lastMessage,
        lastMessageAt: item.lastMessageAt,
        email: item.email,
        ideal_date: item.ideal_date,
        ideal_date_tags: item.ideal_date_tags,
        bio: item.bio,
        interests: item.interests,
      }));

    return NextResponse.json({
      success: true,
      mode,
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        wechatConnected: Boolean(currentUser.wechat_open_id),
        wechatNoticeOptIn: Boolean(currentUser.wechat_notice_opt_in),
      },
      contacts,
    });
  } catch (error) {
    console.error("Error fetching chat contacts:", error);
    return NextResponse.json({ error: "Failed to fetch chat contacts" }, { status: 500 });
  }
}
