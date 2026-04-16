import type { ChatNotificationEventStatus } from "@/app/data/types";
import {
  apiError,
  apiSuccess,
  handleApiRouteError,
  readJsonBody,
} from "@/lib/api-route";
import {
  listChatNotificationEvents,
  markChatNotificationEvent,
} from "@/lib/chat-notification-events";
import { resolveQuizMode } from "@/lib/database";
import { isOpsRequestAuthorized } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

function toPositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function resolveEventStatus(
  value: unknown,
  fallback: ChatNotificationEventStatus | null = null,
) {
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
    if (!isOpsRequestAuthorized(request)) {
      return apiError("Unauthorized", {
        status: 401,
        code: "OPS_UNAUTHORIZED",
      });
    }

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

    return apiSuccess({
      mode,
      events,
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to fetch chat notification events",
      code: "FETCH_CHAT_NOTIFICATION_EVENTS_FAILED",
      logMessage: "Error fetching chat notification events:",
    });
  }
}

export async function POST(request: Request) {
  try {
    if (!isOpsRequestAuthorized(request)) {
      return apiError("Unauthorized", {
        status: 401,
        code: "OPS_UNAUTHORIZED",
      });
    }

    const payload = await readJsonBody(request);
    const mode = resolveQuizMode(payload?.mode);
    const eventId = toPositiveInt(payload?.eventId);
    const status = resolveEventStatus(payload?.status);
    const lastError = typeof payload?.lastError === "string" ? payload.lastError : null;

    if (!eventId || !status || status === "PENDING") {
      return apiError("Missing valid eventId or terminal status", {
        status: 400,
        code: "INVALID_CHAT_NOTIFICATION_EVENT_UPDATE",
      });
    }

    const event = await markChatNotificationEvent(mode, {
      eventId,
      status,
      lastError,
    });

    if (!event) {
      return apiError("Notification event not found", {
        status: 404,
        code: "CHAT_NOTIFICATION_EVENT_NOT_FOUND",
      });
    }

    return apiSuccess({
      mode,
      event,
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to update chat notification event",
      code: "UPDATE_CHAT_NOTIFICATION_EVENT_FAILED",
      logMessage: "Error updating chat notification event:",
    });
  }
}
