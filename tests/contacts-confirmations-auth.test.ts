import assert from "node:assert/strict";
import test from "node:test";
import { getChatContactsAuthContext } from "../lib/chat-contacts-route-core.ts";
import {
  getMatchConfirmationsAuthContext,
  postMatchConfirmationsAuthContext,
} from "../lib/match-confirmations-route-core.ts";

test("chat contacts GET forwards query userId into auth guard, preventing users from listing another person's contacts", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/chat/contacts?mode=friendship&userId=14");

  const result = await getChatContactsAuthContext(request, {
    readPositiveInt: (value) => (value ? Number(value) : null),
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return {
        profile: { id: 14, name: "Alice" },
      };
    },
  });

  assert.equal(result.mode, "friendship");
  assert.equal(Number(result.authenticatedProfile.id), 14);
  assert.deepEqual(calls, [{ mode: "friendship", claimedUserId: 14 }]);
});

test("chat contacts auth helper preserves auth failures instead of returning an empty contacts list", async () => {
  const authError = new Error("AUTH_REQUIRED");

  await assert.rejects(
    () =>
      getChatContactsAuthContext(new Request("https://example.com/api/chat/contacts?mode=romance&userId=5"), {
        readPositiveInt: (value) => (value ? Number(value) : null),
        resolveQuizMode: () => "romance",
        requireAuthenticatedProfile: async () => {
          throw authError;
        },
      }),
    authError,
  );
});

test("match confirmations GET forwards userId and deduplicates target ids, preventing forged reads and noisy duplicates", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request(
    "https://example.com/api/match-confirmations?mode=romance&userId=21&targetUserIds=30,30,21,44,bad",
  );

  const result = await getMatchConfirmationsAuthContext(request, {
    readPositiveInt: (value) => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    },
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 21 } };
    },
  });

  assert.equal(result.mode, "romance");
  assert.deepEqual(result.targetUserIds, [30, 44]);
  assert.deepEqual(calls, [{ mode: "romance", claimedUserId: 21 }]);
});

test("match confirmations POST forwards target user and confirmed flag, preventing forged confirmation writes", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/match-confirmations", { method: "POST" });

  const result = await postMatchConfirmationsAuthContext(request, {
    readJsonBody: async () => ({
      mode: "friendship",
      userId: 21,
      targetUserId: 44,
      confirmed: false,
    }),
    readPositiveInt: (value) => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    },
    readBoolean: (value, defaultValue = false) => {
      if (value === undefined || value === null) return defaultValue;
      return Boolean(value);
    },
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 21 } };
    },
  });

  assert.equal(result.mode, "friendship");
  assert.equal(result.targetUserId, 44);
  assert.equal(result.confirmed, false);
  assert.deepEqual(calls, [{ mode: "friendship", claimedUserId: 21 }]);
});

test("match confirmations auth helpers preserve auth failures instead of acting like the round is simply closed", async () => {
  const authError = new Error("AUTH_MODE_MISMATCH");

  await assert.rejects(
    () =>
      getMatchConfirmationsAuthContext(
        new Request("https://example.com/api/match-confirmations?mode=friendship&userId=3&targetUserIds=9"),
        {
          readPositiveInt: (value) => {
            const parsed = Number(value);
            return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
          },
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
      postMatchConfirmationsAuthContext(new Request("https://example.com/api/match-confirmations", { method: "POST" }), {
        readJsonBody: async () => ({ mode: "friendship", userId: 3, targetUserId: 9, confirmed: true }),
        readPositiveInt: (value) => {
          const parsed = Number(value);
          return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
        },
        readBoolean: (value, defaultValue = false) => {
          if (value === undefined || value === null) return defaultValue;
          return Boolean(value);
        },
        resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
        requireAuthenticatedProfile: async () => {
          throw authError;
        },
      }),
    authError,
  );
});
