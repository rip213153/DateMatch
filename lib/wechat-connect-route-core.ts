export type WeChatConnectRouteMode = "romance" | "friendship";

export type WeChatConnectRouteAuthenticatedProfile = {
  id: number | string;
};

export type WeChatConnectRouteDependencies<TProfile extends WeChatConnectRouteAuthenticatedProfile> = {
  readPositiveInt: (value: unknown) => number | null;
  resolveQuizMode: (value: unknown) => WeChatConnectRouteMode;
  requireAuthenticatedProfile: (
    request: Request,
    mode: WeChatConnectRouteMode,
    options?: { claimedUserId?: number | null },
  ) => Promise<{ profile: TProfile }>;
};

export async function getWeChatConnectAuthContext<TProfile extends WeChatConnectRouteAuthenticatedProfile>(
  request: Request,
  dependencies: WeChatConnectRouteDependencies<TProfile>,
) {
  const { searchParams } = new URL(request.url);
  const requestedUserId = dependencies.readPositiveInt(searchParams.get("userId"));
  const mode = dependencies.resolveQuizMode(searchParams.get("mode"));
  const { profile } = await dependencies.requireAuthenticatedProfile(request, mode, {
    claimedUserId: requestedUserId,
  });

  return {
    mode,
    requestedUserId,
    authenticatedProfile: profile,
  };
}
