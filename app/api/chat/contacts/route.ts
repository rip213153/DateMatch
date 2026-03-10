import { NextResponse } from "next/server";
import { desc, eq, or } from "drizzle-orm";
import { db } from "@/lib/database";
import { chatMessages, profiles } from "@/lib/schema";
import { getBestMatches } from "@/lib/matching";
import { normalizeProfiles } from "@/lib/profile-normalizer";

export const dynamic = "force-dynamic";

type ContactItem = {
  id: number;
  name: string;
  age: number;
  university: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
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

    if (!userId) {
      return NextResponse.json({ error: "缺少合法的 userId 参数" }, { status: 400 });
    }

    const allUsers = normalizeProfiles(await db.select().from(profiles));
    const currentUser = allUsers.find((user) => Number(user.id) === userId);

    if (!currentUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const topMatches = getBestMatches(currentUser, allUsers, 5);
    const topMatchMap = new Map(topMatches.map((item) => [Number(item.user.id), item]));
    const userMap = new Map(allUsers.map((user) => [Number(user.id), user]));

    const messageRows = await db
      .select({
        id: chatMessages.id,
        sender_id: chatMessages.sender_id,
        receiver_id: chatMessages.receiver_id,
        content: chatMessages.content,
        created_at: chatMessages.created_at,
      })
      .from(chatMessages)
      .where(or(eq(chatMessages.sender_id, userId), eq(chatMessages.receiver_id, userId)))
      .orderBy(desc(chatMessages.created_at), desc(chatMessages.id));

    const visibleContactIds = new Set<number>(topMatches.map((item) => Number(item.user.id)));
    const latestMessageMap = new Map<number, { content: string; createdAt: string | null }>();

    for (const row of messageRows) {
      const contactId: number = row.sender_id === userId ? row.receiver_id : row.sender_id;
      if (contactId === userId) continue;

      if (!latestMessageMap.has(contactId)) {
        latestMessageMap.set(contactId, {
          content: row.content,
          createdAt: toIsoString(row.created_at),
        });
      }

      const isInboundFromContact = row.sender_id === contactId && row.receiver_id === userId;
      if (isInboundFromContact) {
        visibleContactIds.add(contactId);
      }
    }

    const contactItems = Array.from(visibleContactIds)
      .map((contactId) => {
        const user = userMap.get(contactId);
        if (!user) return null;

        const lastMessage = latestMessageMap.get(contactId);
        const topMatch = topMatchMap.get(contactId);

        return {
          id: contactId,
          name: user.name,
          age: user.age,
          university: user.university,
          lastMessage: lastMessage?.content ?? null,
          lastMessageAt: lastMessage?.createdAt ?? null,
          rankScore: topMatch?.match.overallScore ?? 0,
          isTopMatch: Boolean(topMatch),
        };
      })
      .filter((item): item is ContactItem & { rankScore: number; isTopMatch: boolean } => Boolean(item))
      .sort((a, b) => {
        const aTime = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
        const bTime = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
        if (aTime !== bTime) return bTime - aTime;
        if (a.isTopMatch !== b.isTopMatch) return a.isTopMatch ? -1 : 1;
        if (a.rankScore !== b.rankScore) return b.rankScore - a.rankScore;
        return a.id - b.id;
      });

    const contacts: ContactItem[] = contactItems.map((item) => ({
      id: item.id,
      name: item.name,
      age: item.age,
      university: item.university,
      lastMessage: item.lastMessage,
      lastMessageAt: item.lastMessageAt,
    }));

    return NextResponse.json({
      success: true,
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
      },
      contacts,
    });
  } catch (error) {
    console.error("Error fetching chat contacts:", error);
    return NextResponse.json({ error: "获取联系人失败" }, { status: 500 });
  }
}
