import assert from "node:assert/strict";
import test from "node:test";
import {
  getMatchStatusAuthContext,
  postMatchStatusAuthContext,
} from "../lib/match-status-route-core.ts";
import { getWeChatConnectAuthContext } from "../lib/wechat-connect-route-core.ts";
import {
  isWeChatBindAllowed,
  resolveWeChatBindIdentity,
} from "../lib/wechat-bind-route-core.ts";

test("match-status GET forwards query userId into auth guard, preventing users from reading another person's status", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/match-status?mode=friendship&userId=18");

  const result = await getMatchStatusAuthContext(request, {
    readPositiveInt: (value) => (value ? Number(value) : null),
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 18 } };
    },
  });

  assert.equal(result.mode, "friendship");
  assert.equal(Number(result.authenticatedProfile.id), 18);
  assert.deepEqual(calls, [{ mode: "friendship", claimedUserId: 18 }]);
});

test("match-status POST forwards body userId into auth guard, preventing forged status writes", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/match-status", { method: "POST" });

  const result = await postMatchStatusAuthContext(request, {
    readJsonBody: async () => ({
      mode: "romance",
      userId: 18,
      status: "VIEWED",
    }),
    readPositiveInt: (value) => (value ? Number(value) : null),
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 18 } };
    },
  });

  assert.equal(result.mode, "romance");
  assert.equal(result.data.status, "VIEWED");
  assert.deepEqual(calls, [{ mode: "romance", claimedUserId: 18 }]);
});

test("match-status auth helpers preserve auth failures instead of acting like the user is simply waiting", async () => {
  const authError = new Error("AUTH_REQUIRED");

  await assert.rejects(
    () =>
      getMatchStatusAuthContext(new Request("https://example.com/api/match-status?mode=romance&userId=2"), {
        readPositiveInt: (value) => (value ? Number(value) : null),
        resolveQuizMode: () => "romance",
        requireAuthenticatedProfile: async () => {
          throw authError;
        },
      }),
    authError,
  );

  await assert.rejects(
    () =>
      postMatchStatusAuthContext(new Request("https://example.com/api/match-status", { method: "POST" }), {
        readJsonBody: async () => ({ mode: "romance", userId: 2, status: "WAITING" }),
        readPositiveInt: (value) => (value ? Number(value) : null),
        resolveQuizMode: () => "romance",
        requireAuthenticatedProfile: async () => {
          throw authError;
        },
      }),
    authError,
  );
});

test("wechat connect-url GET forwards query userId into auth guard, preventing users from generating another person's bind state", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/wechat/connect-url?mode=friendship&userId=61");

  const result = await getWeChatConnectAuthContext(request, {
    readPositiveInt: (value) => (value ? Number(value) : null),
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 61 } };
    },
  });

  assert.equal(result.mode, "friendship");
  assert.equal(Number(result.authenticatedProfile.id), 61);
  assert.deepEqual(calls, [{ mode: "friendship", claimedUserId: 61 }]);
});

test("resolveWeChatBindIdentity lets verified state override explicit ids, preventing tampered client payloads", () => {
  const result = resolveWeChatBindIdentity(
    {
      explicitMode: "romance",
      explicitUserId: 10,
      state: "signed-state",
      session: {
        email: "user@example.com",
        mode: "friendship",
        exp: 123,
      },
    },
    (state) => (state === "signed-state" ? { userId: 61, mode: "friendship" } : null),
  );

  assert.deepEqual(result, {
    ok: true,
    userId: 61,
    mode: "friendship",
    session: {
      email: "user@example.com",
      mode: "friendship",
      exp: 123,
    },
  });
});

test("resolveWeChatBindIdentity rejects invalid state, missing session, and mode mismatches with auth-specific errors", () => {
  assert.deepEqual(
    resolveWeChatBindIdentity(
      {
        explicitMode: "romance",
        explicitUserId: 10,
        state: "bad-state",
        session: {
          email: "user@example.com",
          mode: "romance",
          exp: 123,
        },
      },
      () => null,
    ),
    {
      ok: false,
      status: 400,
      error: "Invalid or expired WeChat state",
    },
  );

  assert.deepEqual(
    resolveWeChatBindIdentity(
      {
        explicitMode: "romance",
        explicitUserId: 10,
        state: "",
        session: null,
      },
      () => null,
    ),
    {
      ok: false,
      status: 401,
      error: "Please log in first",
    },
  );

  assert.deepEqual(
    resolveWeChatBindIdentity(
      {
        explicitMode: "romance",
        explicitUserId: 10,
        state: "",
        session: {
          email: "user@example.com",
          mode: "friendship",
          exp: 123,
        },
      },
      () => null,
    ),
    {
      ok: false,
      status: 403,
      error: "Current session does not match the requested mode",
    },
  );
});

test("isWeChatBindAllowed only allows binding the authenticated profile, preventing cross-account WeChat binds", () => {
  assert.equal(isWeChatBindAllowed({ id: 61 }, 61), true);
  assert.equal(isWeChatBindAllowed({ id: 61 }, 62), false);
  assert.equal(isWeChatBindAllowed(null, 61), false);
});
