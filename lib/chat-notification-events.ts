import { and, desc, eq } from "drizzle-orm";
import type {
  ChatNotificationEvent,
  ChatNotificationEventStatus,
  ChatNotificationEventType,
  QuizMode,
} from "@/app/data/types";
import { getDbForMode } from "@/lib/database";
import { chatNotificationEvents } from "@/lib/schema";

type ChatNotificationEventRow = {
  id: number;
  message_id: number;
  sender_id: number;
  receiver_id: number;
  event_type: ChatNotificationEventType;
  status: ChatNotificationEventStatus;
  last_error: string | null;
  created_at: Date | null;
  consumed_at: Date | null;
};

function toIsoString(value: Date | string | number | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function serializeEvent(row: ChatNotificationEventRow): ChatNotificationEvent {
  return {
    id: row.id,
    messageId: row.message_id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    eventType: row.event_type,
    status: row.status,
    lastError: row.last_error,
    createdAt: toIsoString(row.created_at),
    consumedAt: toIsoString(row.consumed_at),
  };
}

export async function createChatNotificationEvent(
  mode: QuizMode,
  input: {
    messageId: number;
    senderId: number;
    receiverId: number;
    eventType?: ChatNotificationEventType;
  }
) {
  const db = getDbForMode(mode);
  const [inserted] = await db
    .insert(chatNotificationEvents)
    .values({
      message_id: input.messageId,
      sender_id: input.senderId,
      receiver_id: input.receiverId,
      event_type: input.eventType ?? "NEW_MESSAGE",
      status: "PENDING",
      created_at: new Date(),
    })
    .returning({
      id: chatNotificationEvents.id,
      message_id: chatNotificationEvents.message_id,
      sender_id: chatNotificationEvents.sender_id,
      receiver_id: chatNotificationEvents.receiver_id,
      event_type: chatNotificationEvents.event_type,
      status: chatNotificationEvents.status,
      last_error: chatNotificationEvents.last_error,
      created_at: chatNotificationEvents.created_at,
      consumed_at: chatNotificationEvents.consumed_at,
    });

  return serializeEvent(inserted);
}

export async function listChatNotificationEvents(
  mode: QuizMode,
  options: {
    receiverId?: number | null;
    status?: ChatNotificationEventStatus | null;
    limit?: number;
  } = {}
) {
  const db = getDbForMode(mode);
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
  const receiverId = options.receiverId ?? null;
  const status = options.status ?? null;

  const whereClause =
    receiverId && status
      ? and(
          eq(chatNotificationEvents.receiver_id, receiverId),
          eq(chatNotificationEvents.status, status)
        )
      : receiverId
        ? eq(chatNotificationEvents.receiver_id, receiverId)
        : status
          ? eq(chatNotificationEvents.status, status)
          : undefined;

  const rows = await db
    .select({
      id: chatNotificationEvents.id,
      message_id: chatNotificationEvents.message_id,
      sender_id: chatNotificationEvents.sender_id,
      receiver_id: chatNotificationEvents.receiver_id,
      event_type: chatNotificationEvents.event_type,
      status: chatNotificationEvents.status,
      last_error: chatNotificationEvents.last_error,
      created_at: chatNotificationEvents.created_at,
      consumed_at: chatNotificationEvents.consumed_at,
    })
    .from(chatNotificationEvents)
    .where(whereClause)
    .orderBy(desc(chatNotificationEvents.created_at), desc(chatNotificationEvents.id))
    .limit(limit);

  return rows.map(serializeEvent);
}

export async function markChatNotificationEvent(
  mode: QuizMode,
  input: {
    eventId: number;
    status: Exclude<ChatNotificationEventStatus, "PENDING">;
    lastError?: string | null;
  }
) {
  const db = getDbForMode(mode);
  const [updated] = await db
    .update(chatNotificationEvents)
    .set({
      status: input.status,
      last_error: input.lastError?.trim() || null,
      consumed_at: new Date(),
    })
    .where(eq(chatNotificationEvents.id, input.eventId))
    .returning({
      id: chatNotificationEvents.id,
      message_id: chatNotificationEvents.message_id,
      sender_id: chatNotificationEvents.sender_id,
      receiver_id: chatNotificationEvents.receiver_id,
      event_type: chatNotificationEvents.event_type,
      status: chatNotificationEvents.status,
      last_error: chatNotificationEvents.last_error,
      created_at: chatNotificationEvents.created_at,
      consumed_at: chatNotificationEvents.consumed_at,
    });

  return updated ? serializeEvent(updated) : null;
}
