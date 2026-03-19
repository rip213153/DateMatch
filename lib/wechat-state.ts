import { createHmac, timingSafeEqual } from "crypto";
import type { QuizMode } from "@/app/data/types";

const DEFAULT_TTL_SECONDS = 10 * 60;
const SECRET =
  process.env.AUTH_SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "datematch-dev-session-secret-change-me";

type WeChatBindingState = {
  userId: number;
  mode: QuizMode;
  exp: number;
};

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

export function createWeChatBindingState(userId: number, mode: QuizMode, ttlSeconds: number = DEFAULT_TTL_SECONDS) {
  const payload: WeChatBindingState = {
    userId,
    mode,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const payloadEncoded = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function verifyWeChatBindingState(token: string) {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 2) return null;

  const [payloadEncoded, signature] = parts;
  if (!payloadEncoded || !signature) return null;

  const expectedSignature = sign(payloadEncoded);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(payloadEncoded)) as WeChatBindingState;
    if (!payload?.userId || !payload?.mode || !payload?.exp) return null;

    if (Math.floor(Date.now() / 1000) >= payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
