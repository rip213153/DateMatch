export type ChatContactsRouteMode = "romance" | "friendship";

export type ChatContactsRouteAuthenticatedProfile = {
  id: number | string;
};

export type ChatContactsRouteDependencies<TProfile extends ChatContactsRouteAuthenticatedProfile> = {
  readPositiveInt: (value: unknown) => number | null;
  resolveQuizMode: (value: unknown) => ChatContactsRouteMode;
  requireAuthenticatedProfile: (
    request: Request,
    mode: ChatContactsRouteMode,
    options?: { claimedUserId?: number | null },
  ) => Promise<{ profile: TProfile }>;
};

export async function getChatContactsAuthContext<TProfile extends ChatContactsRouteAuthenticatedProfile>(
  request: Request,
  dependencies: ChatContactsRouteDependencies<TProfile>,
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
