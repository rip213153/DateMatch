import assert from "node:assert/strict";
import test from "node:test";
import {
  getChatMessagesAuthContext,
  postChatMessagesAuthContext,
} from "../lib/chat-messages-route-core.ts";
import {
  getFindMatchesAuthContext,
  postFindMatchesAuthContext,
} from "../lib/find-matches-route-core.ts";

test("chat GET forwards claimed userId and targetUserId, preventing users from reading another person's conversation", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/chat/messages?mode=friendship&userId=12&targetUserId=34");

  const result = await getChatMessagesAuthContext(request, {
    readPositiveInt: (value) => (value ? Number(value) : null),
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 12 } };
    },
  });

  assert.equal(result.mode, "friendship");
  assert.equal(result.targetUserId, 34);
  assert.equal(Number(result.authenticatedProfile.id), 12);
  assert.deepEqual(calls, [{ mode: "friendship", claimedUserId: 12 }]);
});

test("chat POST forwards senderId into auth guard, preventing forged message sends as another user", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/chat/messages", { method: "POST" });

  const result = await postChatMessagesAuthContext(request, {
    readJsonBody: async () => ({
      mode: "romance",
      senderId: 8,
      receiverId: 19,
      content: "  hello there  ",
    }),
    readPositiveInt: (value) => (value ? Number(value) : null),
    readTrimmedString: (value) => String(value ?? "").trim(),
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 8 } };
    },
  });

  assert.equal(result.mode, "romance");
  assert.equal(result.receiverId, 19);
  assert.equal(result.content, "hello there");
  assert.deepEqual(calls, [{ mode: "romance", claimedUserId: 8 }]);
});

test("chat auth helpers preserve auth failures instead of turning them into conversation errors", async () => {
  const authError = new Error("AUTH_MODE_MISMATCH");

  await assert.rejects(
    () =>
      getChatMessagesAuthContext(
        new Request("https://example.com/api/chat/messages?mode=friendship&userId=3&targetUserId=9"),
        {
          readPositiveInt: (value) => (value ? Number(value) : null),
          resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
          requireAuthenticatedProfile: async () => {
            throw authError;
          },
        },
      ),
    authError,
  );

  await assert.rejects(
    () =>
      postChatMessagesAuthContext(new Request("https://example.com/api/chat/messages", { method: "POST" }), {
        readJsonBody: async () => ({ mode: "friendship", senderId: 3, receiverId: 9, content: "hi" }),
        readPositiveInt: (value) => (value ? Number(value) : null),
        readTrimmedString: (value) => String(value ?? "").trim(),
        resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
        requireAuthenticatedProfile: async () => {
          throw authError;
        },
      }),
    authError,
  );
});

test("find-matches GET forwards query userId into auth guard, preventing users from reading another person's recommendations", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/find-matches?mode=romance&userId=41");

  const result = await getFindMatchesAuthContext(request, {
    readPositiveInt: (value) => (value ? Number(value) : null),
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 41 } };
    },
  });

  assert.equal(result.mode, "romance");
  assert.equal(Number(result.authenticatedProfile.id), 41);
  assert.deepEqual(calls, [{ mode: "romance", claimedUserId: 41 }]);
});

test("find-matches POST keeps body mode and userId aligned with auth guard, preventing cross-mode or forged refreshes", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/find-matches", { method: "POST" });

  const result = await postFindMatchesAuthContext(request, {
    readJsonBody: async () => ({
      mode: "friendship",
      userId: 55,
    }),
    readPositiveInt: (value) => (value ? Number(value) : null),
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 55 } };
    },
  });

  assert.equal(result.mode, "friendship");
  assert.equal(Number(result.authenticatedProfile.id), 55);
  assert.deepEqual(calls, [{ mode: "friendship", claimedUserId: 55 }]);
});

test("find-matches auth helpers preserve auth failures instead of returning a fake empty match list", async () => {
  const authError = new Error("AUTH_REQUIRED");

  await assert.rejects(
    () =>
      getFindMatchesAuthContext(new Request("https://example.com/api/find-matches?mode=romance&userId=2"), {
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
      postFindMatchesAuthContext(new Request("https://example.com/api/find-matches", { method: "POST" }), {
        readJsonBody: async () => ({ mode: "romance", userId: 2 }),
        readPositiveInt: (value) => (value ? Number(value) : null),
        resolveQuizMode: () => "romance",
        requireAuthenticatedProfile: async () => {
          throw authError;
        },
      }),
    authError,
  );
});
