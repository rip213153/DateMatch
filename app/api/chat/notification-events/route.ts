import { NextResponse } from "next/server";
import type { ChatNotificationEventStatus } from "@/app/data/types";
import { listChatNotificationEvents, markChatNotificationEvent } from "@/lib/chat-notification-events";
import { resolveQuizMode } from "@/lib/database";

export const dynamic = "force-dynamic";

function toPositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function resolveEventStatus(value: unknown, fallback: ChatNotificationEventStatus | null = null) {
  if (
    value === "PENDING" ||
    value === "PROCESSED" ||
    value === "FAILED" ||
    value === "SKIPPED"
  ) {
    return value;
  }

  return fallback;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = resolveQuizMode(searchParams.get("mode"));
    const receiverId = toPositiveInt(searchParams.get("receiverId"));
    const limit = toPositiveInt(searchParams.get("limit")) ?? 20;
    const status = resolveEventStatus(searchParams.get("status"), "PENDING");

    const events = await listChatNotificationEvents(mode, {
      receiverId,
      status,
      limit,
    });

    return NextResponse.json({
      success: true,
      mode,
      events,
    });
  } catch (error) {
    console.error("Error fetching chat notification events:", error);
    return NextResponse.json({ error: "Failed to fetch chat notification events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const mode = resolveQuizMode(payload?.mode);
    const eventId = toPositiveInt(payload?.eventId);
    const status = resolveEventStatus(payload?.status);
    const lastError = typeof payload?.lastError === "string" ? payload.lastError : null;

    if (!eventId || !status || status === "PENDING") {
      return NextResponse.json({ error: "Missing valid eventId or terminal status" }, { status: 400 });
    }

    const event = await markChatNotificationEvent(mode, {
      eventId,
      status,
      lastError,
    });

    if (!event) {
      return NextResponse.json({ error: "Notification event not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mode,
      event,
    });
  } catch (error) {
    console.error("Error updating chat notification event:", error);
    return NextResponse.json({ error: "Failed to update chat notification event" }, { status: 500 });
  }
}
