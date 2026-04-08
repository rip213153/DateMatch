export type MatchStatusRouteMode = "romance" | "friendship";

export type MatchStatusRouteAuthenticatedProfile = {
  id: number | string;
} & Record<string, unknown>;

export type MatchStatusRouteGetDependencies<TProfile extends MatchStatusRouteAuthenticatedProfile> = {
  readPositiveInt: (value: unknown) => number | null;
  resolveQuizMode: (value: unknown) => MatchStatusRouteMode;
  requireAuthenticatedProfile: (
    request: Request,
    mode: MatchStatusRouteMode,
    options?: { claimedUserId?: number | null },
  ) => Promise<{ profile: TProfile }>;
};

export type MatchStatusRoutePostDependencies<TProfile extends MatchStatusRouteAuthenticatedProfile> =
  MatchStatusRouteGetDependencies<TProfile> & {
  readJsonBody: (request: Request) => Promise<Record<string, unknown>>;
};

export async function getMatchStatusAuthContext<TProfile extends MatchStatusRouteAuthenticatedProfile>(
  request: Request,
  dependencies: MatchStatusRouteGetDependencies<TProfile>,
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

export async function postMatchStatusAuthContext<TProfile extends MatchStatusRouteAuthenticatedProfile>(
  request: Request,
  dependencies: MatchStatusRoutePostDependencies<TProfile>,
) {
  const data = await dependencies.readJsonBody(request);
  const requestedUserId = dependencies.readPositiveInt(data.userId);
  const mode = dependencies.resolveQuizMode(data?.mode);
  const { profile } = await dependencies.requireAuthenticatedProfile(request, mode, {
    claimedUserId: requestedUserId,
  });

  return {
    data,
    mode,
    requestedUserId,
    authenticatedProfile: profile,
  };
}
