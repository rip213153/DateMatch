import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { profiles } from "@/lib/schema";
import { readSessionFromRequest } from "@/lib/server-auth";
import { exchangeWeChatCode } from "@/lib/wechat";
import { isWeChatBindAllowed, resolveWeChatBindIdentity } from "@/lib/wechat-bind-route-core";
import { verifyWeChatBindingState } from "@/lib/wechat-state";

function toPositiveInt(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
}

async function bindOpenIdToProfile(
  mode: ReturnType<typeof resolveQuizMode>,
  userId: number,
  openId: string,
  unionId: string | null,
  noticeOptIn: boolean,
) {
  const db = getDbForMode(mode);
  const [profile] = await db
    .update(profiles)
    .set({
      wechat_open_id: openId,
      wechat_union_id: unionId,
      wechat_notice_opt_in: noticeOptIn,
      wechat_bound_at: new Date(),
    })
    .where(eq(profiles.id, userId))
    .returning({
      id: profiles.id,
      wechat_open_id: profiles.wechat_open_id,
      wechat_notice_opt_in: profiles.wechat_notice_opt_in,
      wechat_bound_at: profiles.wechat_bound_at,
    });

  return profile ?? null;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const explicitMode = resolveQuizMode(payload?.mode);
    const explicitUserId = toPositiveInt(payload?.userId);
    const openId = String(payload?.openId ?? "").trim();
    const code = String(payload?.code ?? "").trim();
    const state = String(payload?.state ?? "").trim();
    const noticeOptIn = payload?.noticeOptIn !== false;

    let userId = explicitUserId;
    let mode = explicitMode;
    let unionId: string | null = null;
    let resolvedOpenId = openId;

    const session = readSessionFromRequest(request);
    const identity = resolveWeChatBindIdentity(
      {
        explicitMode,
        explicitUserId,
        state,
        session,
      },
      verifyWeChatBindingState,
    );

    if (!identity.ok) {
      return NextResponse.json({ error: identity.error }, { status: identity.status });
    }

    userId = identity.userId;
    mode = identity.mode;
    const authenticatedSession = identity.session;

    const db = getDbForMode(mode);
    const matchedProfiles = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(sql`lower(${profiles.email}) = ${authenticatedSession.email}`)
      .limit(1);
    const authenticatedProfile = matchedProfiles[0] ?? null;

    if (!authenticatedProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!isWeChatBindAllowed(authenticatedProfile, userId)) {
      return NextResponse.json({ error: "You are not allowed to bind another user's WeChat" }, { status: 403 });
    }

    if (code) {
      const exchange = await exchangeWeChatCode(code);
      resolvedOpenId = exchange.openId;
      unionId = exchange.unionId;
    }

    if (!resolvedOpenId) {
      return NextResponse.json({ error: "Missing openId or code" }, { status: 400 });
    }

    let profile = null;

    try {
      profile = await bindOpenIdToProfile(mode, userId, resolvedOpenId, unionId, noticeOptIn);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("profiles.wechat_open_id") || message.includes("profiles_wechat_open_id_unique")) {
        return NextResponse.json({ error: "This WeChat openId is already bound to another profile" }, { status: 409 });
      }

      throw error;
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mode,
      profile: {
        id: profile.id,
        wechatOpenId: profile.wechat_open_id,
        wechatNoticeOptIn: profile.wechat_notice_opt_in,
        wechatBoundAt: profile.wechat_bound_at,
      },
    });
  } catch (error) {
    console.error("Error binding WeChat openId:", error);
    return NextResponse.json({ error: "Failed to bind WeChat openId" }, { status: 500 });
  }
}
