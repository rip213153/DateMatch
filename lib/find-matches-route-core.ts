export type FindMatchesRouteMode = "romance" | "friendship";

export type FindMatchesRouteAuthenticatedProfile = {
  id: number | string;
};

export type FindMatchesRouteGetDependencies = {
  readPositiveInt: (value: unknown) => number | null;
  resolveQuizMode: (value: unknown) => FindMatchesRouteMode;
  requireAuthenticatedProfile: (
    request: Request,
    mode: FindMatchesRouteMode,
    options?: { claimedUserId?: number | null },
  ) => Promise<{ profile: FindMatchesRouteAuthenticatedProfile }>;
};

export type FindMatchesRoutePostDependencies = FindMatchesRouteGetDependencies & {
  readJsonBody: (request: Request) => Promise<Record<string, unknown>>;
};

export async function getFindMatchesAuthContext(
  request: Request,
  dependencies: FindMatchesRouteGetDependencies,
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

export async function postFindMatchesAuthContext(
  request: Request,
  dependencies: FindMatchesRoutePostDependencies,
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
