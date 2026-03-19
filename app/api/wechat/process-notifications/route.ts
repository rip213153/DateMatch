import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { listChatNotificationEvents, markChatNotificationEvent } from "@/lib/chat-notification-events";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { chatMessages, profiles } from "@/lib/schema";
import { getAppBaseUrl, isWeChatNotificationDeliveryConfigured, sendWeChatMessageNotification } from "@/lib/wechat";

function toPositiveInt(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const mode = resolveQuizMode(payload?.mode);
    const receiverId = toPositiveInt(payload?.receiverId);
    const limit = Math.min(Math.max(toPositiveInt(payload?.limit) ?? 20, 1), 50);
    const db = getDbForMode(mode);
    const events = await listChatNotificationEvents(mode, {
      receiverId,
      status: "PENDING",
      limit,
    });

    const deliveryReady = isWeChatNotificationDeliveryConfigured();
    let delivered = 0;
    let failed = 0;
    let skipped = 0;
    let blocked = 0;

    const results = [];

    for (const event of events) {
      const [sender] = await db
        .select({
          id: profiles.id,
          name: profiles.name,
        })
        .from(profiles)
        .where(eq(profiles.id, event.senderId))
        .limit(1);

      const [receiver] = await db
        .select({
          id: profiles.id,
          wechat_open_id: profiles.wechat_open_id,
          wechat_notice_opt_in: profiles.wechat_notice_opt_in,
        })
        .from(profiles)
        .where(eq(profiles.id, event.receiverId))
        .limit(1);

      const [message] = await db
        .select({
          content: chatMessages.content,
        })
        .from(chatMessages)
        .where(eq(chatMessages.id, event.messageId))
        .limit(1);

      if (!receiver) {
        failed += 1;
        await markChatNotificationEvent(mode, {
          eventId: event.id,
          status: "FAILED",
          lastError: "receiver_profile_not_found",
        });
        results.push({ eventId: event.id, status: "FAILED", reason: "receiver_profile_not_found" });
        continue;
      }

      if (!receiver.wechat_notice_opt_in || !receiver.wechat_open_id) {
        skipped += 1;
        await markChatNotificationEvent(mode, {
          eventId: event.id,
          status: "SKIPPED",
          lastError: !receiver.wechat_open_id ? "wechat_not_bound" : "wechat_opt_out",
        });
        results.push({
          eventId: event.id,
          status: "SKIPPED",
          reason: !receiver.wechat_open_id ? "wechat_not_bound" : "wechat_opt_out",
        });
        continue;
      }

      if (!deliveryReady) {
        blocked += 1;
        results.push({ eventId: event.id, status: "PENDING", reason: "delivery_not_configured" });
        continue;
      }

      try {
        const chatUrl = `${getAppBaseUrl()}/chat?userId=${event.receiverId}&targetUserId=${event.senderId}&mode=${mode}`;
        await sendWeChatMessageNotification({
          openId: receiver.wechat_open_id,
          senderName: sender?.name || "有人",
          previewText: message?.content || "你收到了一条新的匹配消息",
          chatUrl,
          mode,
        });

        delivered += 1;
        await markChatNotificationEvent(mode, {
          eventId: event.id,
          status: "PROCESSED",
        });
        results.push({ eventId: event.id, status: "PROCESSED" });
      } catch (error) {
        const reason = error instanceof Error ? error.message : "wechat_delivery_failed";
        failed += 1;
        await markChatNotificationEvent(mode, {
          eventId: event.id,
          status: "FAILED",
          lastError: reason,
        });
        results.push({ eventId: event.id, status: "FAILED", reason });
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      deliveryReady,
      summary: {
        total: events.length,
        delivered,
        failed,
        skipped,
        blocked,
      },
      results,
    });
  } catch (error) {
    console.error("Error processing WeChat notifications:", error);
    return NextResponse.json({ error: "Failed to process WeChat notifications" }, { status: 500 });
  }
}
