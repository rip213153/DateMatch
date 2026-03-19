import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;
const SECRET =
  process.env.AUTH_SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "datematch-dev-session-secret-change-me";

type SessionPayload = {
  email: string;
  mode: "romance" | "friendship";
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

export function createSessionToken(
  email: string,
  mode: "romance" | "friendship" = "romance",
  ttlSeconds: number = DEFAULT_TTL_SECONDS
) {
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    mode,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const payloadEncoded = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 2) return null;

  const [payloadEncoded, signature] = parts;
  if (!payloadEncoded || !signature) return null;

  const expectedSig = sign(payloadEncoded);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(payloadEncoded)) as Partial<SessionPayload>;
    if (!payload?.email || !payload?.exp) return null;

    const now = Math.floor(Date.now() / 1000);
    if (now >= payload.exp) return null;

    return {
      email: payload.email,
      mode: payload.mode === "friendship" ? "friendship" : "romance",
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
