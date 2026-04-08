export type UsersRouteMode = "romance" | "friendship";

export type UsersRouteAuthenticatedProfile = {
  id: number | string;
} & Record<string, unknown>;

export type UsersRouteAuthDependencies<TProfile extends UsersRouteAuthenticatedProfile> = {
  resolveQuizMode: (value: unknown) => UsersRouteMode;
  requireAuthenticatedProfile: (
    request: Request,
    mode: UsersRouteMode,
  ) => Promise<{ profile: TProfile }>;
};

export async function getUsersRouteAuthContext<TProfile extends UsersRouteAuthenticatedProfile>(
  request: Request,
  dependencies: UsersRouteAuthDependencies<TProfile>,
) {
  const { searchParams } = new URL(request.url);
  const mode = dependencies.resolveQuizMode(searchParams.get("mode"));
  const { profile } = await dependencies.requireAuthenticatedProfile(request, mode);

  return {
    mode,
    authenticatedProfile: profile,
  };
}
