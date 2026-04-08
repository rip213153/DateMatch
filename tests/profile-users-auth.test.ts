import assert from "node:assert/strict";
import test from "node:test";
import {
  getProfileRouteAuthContext,
  postProfileRouteAuthContext,
} from "../lib/profile-route-core.ts";
import { getUsersRouteAuthContext } from "../lib/users-route-core.ts";

test("profile GET forwards query userId into auth guard, preventing users from reading someone else's profile", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/profile?mode=friendship&userId=7");

  const result = await getProfileRouteAuthContext(request, {
    readPositiveInt: (value) => (value ? Number(value) : null),
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 7 } };
    },
  });

  assert.equal(result.mode, "friendship");
  assert.equal(Number(result.authenticatedProfile.id), 7);
  assert.deepEqual(calls, [{ mode: "friendship", claimedUserId: 7 }]);
});

test("profile GET tolerates missing userId so existing clients still rely on the session user", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/profile?mode=romance");

  await getProfileRouteAuthContext(request, {
    readPositiveInt: () => null,
    resolveQuizMode: () => "romance",
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 11 } };
    },
  });

  assert.deepEqual(calls, [{ mode: "romance", claimedUserId: null }]);
});

test("profile POST forwards body userId into auth guard, preventing forged updates to another account", async () => {
  const calls: Array<{ mode: string; claimedUserId?: number | null }> = [];
  const request = new Request("https://example.com/api/profile", {
    method: "POST",
  });

  const result = await postProfileRouteAuthContext(request, {
    readJsonBody: async () => ({
      mode: "romance",
      userId: 23,
      name: "Alice",
    }),
    readPositiveInt: (value) => (value ? Number(value) : null),
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode, options) => {
      calls.push({ mode, claimedUserId: options?.claimedUserId });
      return { profile: { id: 23 } };
    },
  });

  assert.equal(result.mode, "romance");
  assert.equal(result.data.name, "Alice");
  assert.deepEqual(calls, [{ mode: "romance", claimedUserId: 23 }]);
});

test("users GET forwards mode into auth guard, preventing a romance session from reading friendship data", async () => {
  const calls: string[] = [];
  const request = new Request("https://example.com/api/users?mode=friendship");

  const result = await getUsersRouteAuthContext(request, {
    resolveQuizMode: (value) => (value === "friendship" ? "friendship" : "romance"),
    requireAuthenticatedProfile: async (_request, mode) => {
      calls.push(mode);
      return { profile: { id: 5 } };
    },
  });

  assert.equal(result.mode, "friendship");
  assert.equal(Number(result.authenticatedProfile.id), 5);
  assert.deepEqual(calls, ["friendship"]);
});

test("profile and users auth helpers preserve auth failures instead of silently downgrading them", async () => {
  const authError = new Error("AUTH_REQUIRED");
  const profileRequest = new Request("https://example.com/api/profile?mode=romance&userId=3");
  const usersRequest = new Request("https://example.com/api/users?mode=romance");

  await assert.rejects(
    () =>
      getProfileRouteAuthContext(profileRequest, {
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
      getUsersRouteAuthContext(usersRequest, {
        resolveQuizMode: () => "romance",
        requireAuthenticatedProfile: async () => {
          throw authError;
        },
      }),
    authError,
  );
});
