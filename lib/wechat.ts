import type { QuizMode } from "@/app/data/types";

type WeChatOAuthResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  openid?: string;
  scope?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
};

type WeChatTemplateSendResponse = {
  errcode?: number;
  errmsg?: string;
  msgid?: number;
};

type WeChatSendInput = {
  openId: string;
  senderName: string;
  previewText: string;
  chatUrl: string;
  mode: QuizMode;
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getWeChatConfig() {
  return {
    appId: process.env.WECHAT_OFFICIAL_APP_ID?.trim() || "",
    appSecret: process.env.WECHAT_OFFICIAL_APP_SECRET?.trim() || "",
    templateId: process.env.WECHAT_TEMPLATE_ID?.trim() || "",
    redirectUri: process.env.WECHAT_OAUTH_REDIRECT_URI?.trim() || `${getAppBaseUrl()}/wechat/connect`,
    followUrl: process.env.NEXT_PUBLIC_WECHAT_FOLLOW_URL?.trim() || "",
    webhookUrl: process.env.WECHAT_NOTIFICATION_WEBHOOK_URL?.trim() || "",
    templateUrl: process.env.WECHAT_TEMPLATE_TARGET_URL?.trim() || "",
    fieldIntro: process.env.WECHAT_TEMPLATE_FIELD_INTRO?.trim() || "first",
    fieldSender: process.env.WECHAT_TEMPLATE_FIELD_SENDER?.trim() || "keyword1",
    fieldPreview: process.env.WECHAT_TEMPLATE_FIELD_PREVIEW?.trim() || "keyword2",
    fieldRemark: process.env.WECHAT_TEMPLATE_FIELD_REMARK?.trim() || "remark",
  };
}

export function isWeChatOAuthConfigured() {
  const config = getWeChatConfig();
  return Boolean(config.appId && config.redirectUri);
}

export function isWeChatNotificationDeliveryConfigured() {
  const config = getWeChatConfig();
  return Boolean(config.webhookUrl || (config.appId && config.appSecret && config.templateId));
}

export function buildWeChatOAuthUrl(state: string) {
  const config = getWeChatConfig();
  const redirectUri = encodeURIComponent(config.redirectUri);
  const encodedState = encodeURIComponent(state);
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=${encodedState}#wechat_redirect`;
}

export async function exchangeWeChatCode(code: string) {
  const config = getWeChatConfig();
  if (!config.appId || !config.appSecret) {
    throw new Error("WECHAT_OFFICIAL_APP_ID or WECHAT_OFFICIAL_APP_SECRET is missing");
  }

  const url = new URL("https://api.weixin.qq.com/sns/oauth2/access_token");
  url.searchParams.set("appid", config.appId);
  url.searchParams.set("secret", config.appSecret);
  url.searchParams.set("code", code);
  url.searchParams.set("grant_type", "authorization_code");

  const response = await fetch(url.toString(), { cache: "no-store" });
  const data = (await response.json()) as WeChatOAuthResponse;

  if (!response.ok || !data.openid) {
    throw new Error(data.errmsg || "Failed to exchange WeChat code");
  }

  return {
    openId: data.openid,
    unionId: data.unionid ?? null,
  };
}

async function getOfficialAccessToken() {
  const config = getWeChatConfig();
  if (!config.appId || !config.appSecret) {
    throw new Error("WECHAT_OFFICIAL_APP_ID or WECHAT_OFFICIAL_APP_SECRET is missing");
  }

  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const url = new URL("https://api.weixin.qq.com/cgi-bin/token");
  url.searchParams.set("grant_type", "client_credential");
  url.searchParams.set("appid", config.appId);
  url.searchParams.set("secret", config.appSecret);

  const response = await fetch(url.toString(), { cache: "no-store" });
  const data = (await response.json()) as WeChatOAuthResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(data.errmsg || "Failed to fetch WeChat access token");
  }

  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + Math.max((data.expires_in ?? 7200) - 120, 60) * 1000,
  };

  return cachedAccessToken.token;
}

export async function sendWeChatMessageNotification(input: WeChatSendInput) {
  const config = getWeChatConfig();

  if (config.webhookUrl) {
    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "wechat-official-account",
        openId: input.openId,
        senderName: input.senderName,
        previewText: input.previewText,
        chatUrl: input.chatUrl,
        mode: input.mode,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook delivery failed with status ${response.status}`);
    }

    return { provider: "webhook" as const };
  }

  if (!isWeChatNotificationDeliveryConfigured()) {
    throw new Error("WeChat notification delivery is not configured");
  }

  const accessToken = await getOfficialAccessToken();
  const targetUrl = config.templateUrl || input.chatUrl;
  const previewText = input.previewText.trim().slice(0, 48) || "你收到了一条新的匹配消息";

  const data = {
    [config.fieldIntro]: {
      value: input.mode === "friendship" ? "DateMatch 搭子提醒" : "DateMatch 匹配提醒",
      color: "#17324d",
    },
    [config.fieldSender]: {
      value: input.senderName,
      color: "#2563eb",
    },
    [config.fieldPreview]: {
      value: previewText,
      color: "#0f172a",
    },
    [config.fieldRemark]: {
      value: "你收到了一条新的消息，点击查看详情。",
      color: "#64748b",
    },
  };

  const response = await fetch(
    `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        touser: input.openId,
        template_id: config.templateId,
        url: targetUrl,
        data,
      }),
    }
  );

  const result = (await response.json()) as WeChatTemplateSendResponse;
  if (!response.ok || result.errcode !== 0) {
    throw new Error(result.errmsg || "WeChat template send failed");
  }

  return { provider: "official-account" as const, messageId: result.msgid ?? null };
}
