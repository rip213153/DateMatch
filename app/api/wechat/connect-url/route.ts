import { NextResponse } from "next/server";
import { readPositiveInt } from "@/lib/api-route";
import { resolveQuizMode } from "@/lib/database";
import { requireAuthenticatedProfile } from "@/lib/server-auth";
import { getWeChatConnectAuthContext } from "@/lib/wechat-connect-route-core";
import { buildWeChatOAuthUrl, getWeChatConfig, isWeChatOAuthConfigured } from "@/lib/wechat";
import { createWeChatBindingState } from "@/lib/wechat-state";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { mode, authenticatedProfile: profile } = await getWeChatConnectAuthContext(request, {
      readPositiveInt,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });

    const state = createWeChatBindingState(Number(profile.id), mode);
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
