import { NextResponse } from "next/server";
import { createWeChatBindingState } from "@/lib/wechat-state";
import { buildWeChatOAuthUrl, getWeChatConfig, isWeChatOAuthConfigured } from "@/lib/wechat";
import { resolveQuizMode } from "@/lib/database";

function toPositiveInt(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
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

    const state = createWeChatBindingState(userId, mode);
    const config = getWeChatConfig();
    const connectUrl = isWeChatOAuthConfigured() ? buildWeChatOAuthUrl(state) : null;

    return NextResponse.json({
      success: true,
      mode,
      state,
      oauthReady: Boolean(connectUrl),
      connectUrl,
      followUrl: config.followUrl || null,
    });
  } catch (error) {
    console.error("Error creating WeChat connect URL:", error);
    return NextResponse.json({ error: "Failed to create WeChat connect URL" }, { status: 500 });
  }
}
