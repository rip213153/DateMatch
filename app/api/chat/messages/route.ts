import { NextResponse } from "next/server";
import { and, asc, eq, or } from "drizzle-orm";
import { db } from "@/lib/database";
import { chatMessages, profiles } from "@/lib/schema";
import { getBestMatches } from "@/lib/matching";
import { normalizeProfiles } from "@/lib/profile-normalizer";

export const dynamic = "force-dynamic";

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

async function getPairRows(userId: number, targetUserId: number) {
  return db
    .select({
      id: chatMessages.id,
      sender_id: chatMessages.sender_id,
      receiver_id: chatMessages.receiver_id,
      content: chatMessages.content,
      created_at: chatMessages.created_at,
    })
    .from(chatMessages)
    .where(
      or(
        and(eq(chatMessages.sender_id, userId), eq(chatMessages.receiver_id, targetUserId)),
        and(eq(chatMessages.sender_id, targetUserId), eq(chatMessages.receiver_id, userId))
      )
    )
    .orderBy(asc(chatMessages.created_at), asc(chatMessages.id));
}

async function getTopMatchIdSet(userId: number) {
  const allUsers = normalizeProfiles(await db.select().from(profiles));
  const currentUser = allUsers.find((user) => Number(user.id) === userId);
  if (!currentUser) return { user: null, ids: new Set<number>() };
  const ids = new Set(getBestMatches(currentUser, allUsers, 5).map((item) => Number(item.user.id)));
  return { user: currentUser, ids };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = toPositiveInt(searchParams.get("userId"));
    const targetUserId = toPositiveInt(searchParams.get("targetUserId"));

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: "缺少合法的 userId/targetUserId 参数" }, { status: 400 });
    }

    const rows = await getPairRows(userId, targetUserId);

    return NextResponse.json({
      success: true,
      messages: rows.map((row) => ({
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        content: row.content,
        createdAt: toIsoString(row.created_at),
      })),
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json({ error: "获取聊天消息失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const senderId = toPositiveInt(payload.senderId);
    const receiverId = toPositiveInt(payload.receiverId);
    const content = typeof payload.content === "string" ? payload.content.trim() : "";

    if (!senderId || !receiverId) {
      return NextResponse.json({ error: "缺少合法的 senderId/receiverId" }, { status: 400 });
    }

    if (senderId === receiverId) {
      return NextResponse.json({ error: "不能给自己发消息" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "消息内容不能为空" }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "消息长度不能超过 1000 字" }, { status: 400 });
    }

    const [senderInfo, receiverInfo, pairRows] = await Promise.all([
      getTopMatchIdSet(senderId),
      getTopMatchIdSet(receiverId),
      getPairRows(senderId, receiverId),
    ]);

    if (!senderInfo.user || !receiverInfo.user) {
      return NextResponse.json({ error: "聊天用户不存在" }, { status: 404 });
    }

    const senderHasReceiverInTopFive = senderInfo.ids.has(receiverId);
    const receiverHasSenderInTopFive = receiverInfo.ids.has(senderId);
    const hasConversation = pairRows.length > 0;
    const senderMessageCount = pairRows.filter((row) => row.sender_id === senderId).length;
    const receiverHasReplied = pairRows.some((row) => row.sender_id === receiverId && row.receiver_id === senderId);

    if (!senderHasReceiverInTopFive && !hasConversation) {
      return NextResponse.json({ error: "对方当前不在你的前五匹配中，暂时不能主动发起消息" }, { status: 403 });
    }

    if (!receiverHasSenderInTopFive && !receiverHasReplied && senderMessageCount >= 1) {
      return NextResponse.json({ error: "对方回复前，你现在只能先发送 1 条消息" }, { status: 403 });
    }

    const [inserted] = await db
      .insert(chatMessages)
      .values({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        created_at: new Date(),
      })
      .returning({
        id: chatMessages.id,
        sender_id: chatMessages.sender_id,
        receiver_id: chatMessages.receiver_id,
        content: chatMessages.content,
        created_at: chatMessages.created_at,
      });

    return NextResponse.json({
      success: true,
      message: {
        id: inserted.id,
        senderId: inserted.sender_id,
        receiverId: inserted.receiver_id,
        content: inserted.content,
        createdAt: toIsoString(inserted.created_at),
      },
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return NextResponse.json({ error: "发送消息失败" }, { status: 500 });
  }
}
