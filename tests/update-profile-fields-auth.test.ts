import assert from "node:assert/strict";
import test from "node:test";
import { postUpdateProfileFieldAuthContext } from "../lib/update-profile-field-route-core.ts";

test("update profile field helper forwards body userId into auth guard, preventing forged writes to another account", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/update-name", { method: "POST" });

  const result = await postUpdateProfileFieldAuthContext(request, {
    readJsonBody: async () => ({
      mode: "friendship",
      userId: 77,
      newName: "Alice",
    }),
    readPositiveInt: (value) => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    },
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 77 } };
    },
  });

  assert.equal(result.mode, "friendship");
  assert.equal(Number(result.authenticatedProfile.id), 77);
  assert.equal(String(result.body.newName), "Alice");
  assert.deepEqual(calls, [{ mode: "friendship", claimedUserId: 77 }]);
});

test("update profile field helper preserves missing claimed userId so old clients still rely on session identity", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/update-bio", { method: "POST" });

  await postUpdateProfileFieldAuthContext(request, {
    readJsonBody: async () => ({
      mode: "romance",
      newBio: "hello",
    }),
    readPositiveInt: () => null,
    resolveQuizMode: () => "romance",
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 5 } };
    },
  });

  assert.deepEqual(calls, [{ mode: "romance", claimedUserId: null }]);
});

test("update profile field helper keeps mode and body intact for email and ideal-date updates", async () => {
  const request = new Request("https://example.com/api/update-email", { method: "POST" });

  const emailResult = await postUpdateProfileFieldAuthContext(request, {
    readJsonBody: async () => ({
      mode: "romance",
      userId: 12,
      newEmail: "next@example.com",
    }),
    readPositiveInt: (value) => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    },
    resolveQuizMode: () => "romance",
    requireAuthenticatedProfile: async () => ({ profile: { id: 12 } }),
  });

  const idealDateResult = await postUpdateProfileFieldAuthContext(
    new Request("https://example.com/api/update-ideal-date", { method: "POST" }),
    {
      readJsonBody: async () => ({
        mode: "friendship",
        userId: 12,
        newIdealDate: "museum day",
      }),
      readPositiveInt: (value) => {
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
      },
      resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
      requireAuthenticatedProfile: async () => ({ profile: { id: 12 } }),
    },
  );

  assert.equal(emailResult.mode, "romance");
  assert.equal(String(emailResult.body.newEmail), "next@example.com");
  assert.equal(idealDateResult.mode, "friendship");
  assert.equal(String(idealDateResult.body.newIdealDate), "museum day");
});

test("update profile field helper preserves auth failures instead of turning them into generic update errors", async () => {
  const authError = new Error("AUTH_USER_MISMATCH");

  await assert.rejects(
    () =>
      postUpdateProfileFieldAuthContext(new Request("https://example.com/api/update-email", { method: "POST" }), {
        readJsonBody: async () => ({ mode: "romance", userId: 9, newEmail: "x@example.com" }),
        readPositiveInt: (value) => {
          const parsed = Number(value);
          return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
        },
        resolveQuizMode: () => "romance",
        requireAuthenticatedProfile: async () => {
          throw authError;
        },
      }),
    authError,
  );
});
