import { and, asc, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { QuizMode } from "@/app/data/types";
import { createChatNotificationEvent } from "@/lib/chat-notification-events";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { getMatchSchedule } from "@/lib/match-schedule";
import { hasMutualPairForUsers } from "@/lib/mutual-matching";
import { getProfileRowsForMode } from "@/lib/profile-updates";
import { chatMessages } from "@/lib/schema";

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

async function getPairRows(mode: QuizMode, userId: number, targetUserId: number) {
  const db = getDbForMode(mode);

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

function countSenderMessagesSinceLastReply(
  pairRows: Array<{ sender_id: number; receiver_id: number }>,
  senderId: number,
  receiverId: number
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
    const { searchParams } = new URL(request.url);
    const userId = toPositiveInt(searchParams.get("userId"));
    const targetUserId = toPositiveInt(searchParams.get("targetUserId"));
    const mode = resolveQuizMode(searchParams.get("mode"));

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: "Missing valid userId or targetUserId" }, { status: 400 });
    }

    const now = new Date();
    const db = getDbForMode(mode);
    const [profileRows, rows] = await Promise.all([
      getProfileRowsForMode(mode, now),
      getPairRows(mode, userId, targetUserId),
    ]);

    const senderExists = profileRows.some((row) => Number(row.id) === userId);
    const receiverExists = profileRows.some((row) => Number(row.id) === targetUserId);

    if (!senderExists || !receiverExists) {
      return NextResponse.json({ error: "Chat user not found" }, { status: 404 });
    }

    const hasConversation = rows.length > 0;
    const schedule = getMatchSchedule(now);
    const canUseMutualPair =
      schedule.isInDisplayWindow &&
      (await hasMutualPairForUsers(userId, targetUserId, mode, profileRows, schedule.releaseAt, now));

    if (!hasConversation && !canUseMutualPair) {
      return NextResponse.json(
        { error: "You can only access chats from your current mutual recommendations." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
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
    console.error("Error fetching chat messages:", error);
    return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const senderId = toPositiveInt(payload?.senderId);
    const receiverId = toPositiveInt(payload?.receiverId);
    const content = typeof payload?.content === "string" ? payload.content.trim() : "";
    const mode = resolveQuizMode(payload?.mode);

    if (!senderId || !receiverId) {
      return NextResponse.json({ error: "Missing valid senderId or receiverId" }, { status: 400 });
    }

    if (senderId === receiverId) {
      return NextResponse.json({ error: "Cannot send messages to yourself" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "Message content must be 1000 characters or fewer" }, { status: 400 });
    }

    const now = new Date();
    const db = getDbForMode(mode);
    const [profileRows, pairRows] = await Promise.all([
      getProfileRowsForMode(mode, now),
      getPairRows(mode, senderId, receiverId),
    ]);

    const senderExists = profileRows.some((row) => Number(row.id) === senderId);
    const receiverExists = profileRows.some((row) => Number(row.id) === receiverId);

    if (!senderExists || !receiverExists) {
      return NextResponse.json({ error: "Chat user not found" }, { status: 404 });
    }

    const hasConversation = pairRows.length > 0;
    const senderMessagesSinceLastReply = countSenderMessagesSinceLastReply(pairRows, senderId, receiverId);
    const schedule = getMatchSchedule(now);
    const canUseMutualPair =
      schedule.isInDisplayWindow &&
      (await hasMutualPairForUsers(senderId, receiverId, mode, profileRows, schedule.releaseAt, now));

    if (!canUseMutualPair && !hasConversation) {
      return NextResponse.json(
        { error: "The other user is not currently in your mutual recommendations." },
        { status: 403 }
      );
    }

    if (senderMessagesSinceLastReply >= 1) {
      return NextResponse.json(
        { error: "You can only send one opening message until the other user replies." },
        { status: 403 }
      );
    }
    const [inserted] = await db
      .insert(chatMessages)
      .values({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        created_at: now,
      })
      .returning({
        id: chatMessages.id,
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

    return NextResponse.json({
      success: true,
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
    console.error("Error sending chat message:", error);
    return NextResponse.json({ error: "Failed to send chat message" }, { status: 500 });
  }
}
