export type WeChatBindRouteMode = "romance" | "friendship";

export type WeChatBindRouteSession = {
  email: string;
  mode: WeChatBindRouteMode;
  exp: number;
};

export type WeChatBindVerifiedState = {
  userId: number;
  mode: WeChatBindRouteMode;
};

export type WeChatBindAuthenticatedProfile = {
  id: number | string;
};

export type WeChatBindInput = {
  explicitMode: WeChatBindRouteMode;
  explicitUserId: number | null;
  state: string;
  session: WeChatBindRouteSession | null;
};

export function resolveWeChatBindIdentity(
  input: WeChatBindInput,
  verifyWeChatBindingState: (state: string) => WeChatBindVerifiedState | null,
) {
  let userId = input.explicitUserId;
  let mode = input.explicitMode;

  if (input.state) {
    const verified = verifyWeChatBindingState(input.state);
    if (!verified) {
      return {
        ok: false as const,
        status: 400,
        error: "Invalid or expired WeChat state",
      };
    }

    userId = verified.userId;
    mode = verified.mode;
  }

  if (!userId) {
    return {
      ok: false as const,
      status: 400,
      error: "Missing valid userId",
    };
  }

  if (!input.session) {
    return {
      ok: false as const,
      status: 401,
      error: "Please log in first",
    };
  }

  if (input.session.mode !== mode) {
    return {
      ok: false as const,
      status: 403,
      error: "Current session does not match the requested mode",
    };
  }

  return {
    ok: true as const,
    userId,
    mode,
    session: input.session,
  };
}

export function isWeChatBindAllowed(
  authenticatedProfile: WeChatBindAuthenticatedProfile | null,
  requestedUserId: number,
) {
  return authenticatedProfile !== null && Number(authenticatedProfile.id) === requestedUserId;
}
