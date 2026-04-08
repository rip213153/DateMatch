import assert from "node:assert/strict";
import test from "node:test";
import {
  getAuthSessionStateCore,
  isAuthenticatedUserIdAllowed,
  readSessionPayloadFromCookieHeader,
  readSessionTokenFromCookieHeader,
} from "../lib/auth-session-core.ts";
import { createSessionToken, verifySessionToken } from "../lib/session.ts";

test("readSessionTokenFromCookieHeader extracts the session cookie", () => {
  const token = createSessionToken("user@example.com", "friendship", 60);
  const header = `theme=dark; datematch_session=${encodeURIComponent(token)}; locale=zh-CN`;

  assert.equal(readSessionTokenFromCookieHeader(header), token);
});

test("readSessionPayloadFromCookieHeader parses a valid cookie token", () => {
  const token = createSessionToken("user@example.com", "friendship", 60);
  const payload = readSessionPayloadFromCookieHeader(
    `datematch_session=${encodeURIComponent(token)}`,
    verifySessionToken,
  );

  assert.ok(payload);
  assert.equal(payload.email, "user@example.com");
  assert.equal(payload.mode, "friendship");
});

test("isAuthenticatedUserIdAllowed accepts the authenticated user", () => {
  assert.equal(isAuthenticatedUserIdAllowed(42), true);
  assert.equal(isAuthenticatedUserIdAllowed(42, null), true);
  assert.equal(isAuthenticatedUserIdAllowed(42, 42), true);
});

test("isAuthenticatedUserIdAllowed rejects mismatched user ids", () => {
  assert.equal(isAuthenticatedUserIdAllowed(42, 7), false);
});

test("getAuthSessionStateCore returns anonymous state without a session", async () => {
  const state = await getAuthSessionStateCore(new Request("https://example.com/api/auth/session"), {
    readSessionFromRequest: () => null,
    getProfileByEmail: async () => ({ id: 1, email: "unused@example.com" }),
  });

  assert.deepEqual(state, { isAuthenticated: false });
});

test("getAuthSessionStateCore returns anonymous state when the profile is missing", async () => {
  const state = await getAuthSessionStateCore(new Request("https://example.com/api/auth/session"), {
    readSessionFromRequest: () => ({
      email: "user@example.com",
      mode: "romance",
      exp: 1234567890,
    }),
    getProfileByEmail: async () => null,
  });

  assert.deepEqual(state, { isAuthenticated: false });
});

test("getAuthSessionStateCore returns the authenticated profile payload", async () => {
  const state = await getAuthSessionStateCore(new Request("https://example.com/api/auth/session"), {
    readSessionFromRequest: () => ({
      email: "user@example.com",
      mode: "friendship",
      exp: 1234567890,
    }),
    getProfileByEmail: async () => ({
      id: 9,
      email: "User@Example.com",
    }),
  });

  assert.deepEqual(state, {
    isAuthenticated: true,
    email: "User@Example.com",
    mode: "friendship",
    userId: 9,
    expiresAt: 1234567890,
  });
});
