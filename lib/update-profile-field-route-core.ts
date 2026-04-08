export type UpdateProfileFieldRouteMode = "romance" | "friendship";

export type UpdateProfileFieldAuthenticatedProfile = {
  id: number | string;
} & Record<string, unknown>;

export type UpdateProfileFieldRouteDependencies<TProfile extends UpdateProfileFieldAuthenticatedProfile> = {
  readJsonBody: (request: Request) => Promise<Record<string, unknown>>;
  readPositiveInt: (value: unknown) => number | null;
  resolveQuizMode: (value: unknown) => UpdateProfileFieldRouteMode;
  requireAuthenticatedProfile: (
    request: Request,
    mode: UpdateProfileFieldRouteMode,
    options?: { claimedUserId?: number | null },
  ) => Promise<{ profile: TProfile }>;
};

export async function postUpdateProfileFieldAuthContext<TProfile extends UpdateProfileFieldAuthenticatedProfile>(
  request: Request,
  dependencies: UpdateProfileFieldRouteDependencies<TProfile>,
) {
  const body = await dependencies.readJsonBody(request);
  const requestedUserId = dependencies.readPositiveInt(body.userId);
  const mode = dependencies.resolveQuizMode(body.mode);
  const { profile } = await dependencies.requireAuthenticatedProfile(request, mode, {
    claimedUserId: requestedUserId,
  });

  return {
    body,
    mode,
    requestedUserId,
    authenticatedProfile: profile,
  };
}
