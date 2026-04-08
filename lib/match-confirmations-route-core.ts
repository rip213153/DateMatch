export type MatchConfirmationsRouteMode = "romance" | "friendship";

export type MatchConfirmationsRouteAuthenticatedProfile = {
  id: number | string;
};

export type MatchConfirmationsRouteGetDependencies = {
  readPositiveInt: (value: unknown) => number | null;
  resolveQuizMode: (value: unknown) => MatchConfirmationsRouteMode;
  requireAuthenticatedProfile: (
    request: Request,
    mode: MatchConfirmationsRouteMode,
    options?: { claimedUserId?: number | null },
  ) => Promise<{ profile: MatchConfirmationsRouteAuthenticatedProfile }>;
};

export type MatchConfirmationsRoutePostDependencies = MatchConfirmationsRouteGetDependencies & {
  readJsonBody: (request: Request) => Promise<Record<string, unknown>>;
  readBoolean: (value: unknown, defaultValue?: boolean) => boolean;
};

export async function getMatchConfirmationsAuthContext(
  request: Request,
  dependencies: MatchConfirmationsRouteGetDependencies,
) {
  const { searchParams } = new URL(request.url);
  const requestedUserId = dependencies.readPositiveInt(searchParams.get("userId"));
  const mode = dependencies.resolveQuizMode(searchParams.get("mode"));
  const { profile } = await dependencies.requireAuthenticatedProfile(request, mode, {
    claimedUserId: requestedUserId,
  });
  const rawTargetIds = (searchParams.get("targetUserIds") ?? "")
    .split(",")
    .map((id) => dependencies.readPositiveInt(id))
    .filter((id): id is number => id !== null && id !== Number(profile.id));

  return {
    mode,
    requestedUserId,
    targetUserIds: Array.from(new Set(rawTargetIds)),
    authenticatedProfile: profile,
  };
}

export async function postMatchConfirmationsAuthContext(
  request: Request,
  dependencies: MatchConfirmationsRoutePostDependencies,
) {
  const body = await dependencies.readJsonBody(request);
  const requestedUserId = dependencies.readPositiveInt(body.userId);
  const targetUserId = dependencies.readPositiveInt(body.targetUserId);
  const mode = dependencies.resolveQuizMode(body.mode);
  const confirmed = dependencies.readBoolean(body.confirmed, true);
  const { profile } = await dependencies.requireAuthenticatedProfile(request, mode, {
    claimedUserId: requestedUserId,
  });

  return {
    body,
    mode,
    requestedUserId,
    targetUserId,
    confirmed,
    authenticatedProfile: profile,
  };
}
