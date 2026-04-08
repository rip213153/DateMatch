import assert from "node:assert/strict";
import test from "node:test";
import { createSessionToken, verifySessionToken } from "../lib/session.ts";

test("session token normalizes email and preserves mode", () => {
  const token = createSessionToken("  User@Example.com  ", "friendship", 60);
  const payload = verifySessionToken(token);

  assert.ok(payload);
  assert.equal(payload.email, "user@example.com");
  assert.equal(payload.mode, "friendship");
  assert.ok(payload.exp > Math.floor(Date.now() / 1000));
});

test("session token rejects tampered signatures", () => {
  const token = createSessionToken("user@example.com", "romance", 60);
  const [payloadEncoded, signature] = token.split(".");
  const tamperedToken = `${payloadEncoded}.${signature.slice(0, -1)}x`;

  assert.equal(verifySessionToken(tamperedToken), null);
});

test("session token rejects expired payloads", () => {
  const token = createSessionToken("user@example.com", "romance", -1);

  assert.equal(verifySessionToken(token), null);
});
