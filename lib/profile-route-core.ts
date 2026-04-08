export type ProfileRouteMode = "romance" | "friendship";

export type ProfileRouteAuthenticatedProfile = {
  id: number | string;
};

export type ProfileRouteAuthDependencies = {
  readPositiveInt: (value: unknown) => number | null;
  resolveQuizMode: (value: unknown) => ProfileRouteMode;
  requireAuthenticatedProfile: (
    request: Request,
    mode: ProfileRouteMode,
    options?: { claimedUserId?: number | null },
  ) => Promise<{ profile: ProfileRouteAuthenticatedProfile }>;
};

export type ProfileRoutePostAuthDependencies = ProfileRouteAuthDependencies & {
  readJsonBody: (request: Request) => Promise<Record<string, unknown>>;
};

export async function getProfileRouteAuthContext(
  request: Request,
  dependencies: ProfileRouteAuthDependencies,
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

export async function postProfileRouteAuthContext(
  request: Request,
  dependencies: ProfileRoutePostAuthDependencies,
) {
  const data = await dependencies.readJsonBody(request);
  const requestedUserId = dependencies.readPositiveInt(data?.userId);
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
