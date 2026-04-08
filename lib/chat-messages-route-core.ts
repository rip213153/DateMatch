export type ChatMessagesRouteMode = "romance" | "friendship";

export type ChatMessagesRouteAuthenticatedProfile = {
  id: number | string;
};

export type ChatMessagesRouteGetDependencies = {
  readPositiveInt: (value: unknown) => number | null;
  resolveQuizMode: (value: unknown) => ChatMessagesRouteMode;
  requireAuthenticatedProfile: (
    request: Request,
    mode: ChatMessagesRouteMode,
    options?: { claimedUserId?: number | null },
  ) => Promise<{ profile: ChatMessagesRouteAuthenticatedProfile }>;
};

export type ChatMessagesRoutePostDependencies = ChatMessagesRouteGetDependencies & {
  readJsonBody: (request: Request) => Promise<Record<string, unknown>>;
  readTrimmedString: (value: unknown) => string;
};

export async function getChatMessagesAuthContext(
  request: Request,
  dependencies: ChatMessagesRouteGetDependencies,
) {
  const { searchParams } = new URL(request.url);
  const requestedUserId = dependencies.readPositiveInt(searchParams.get("userId"));
  const targetUserId = dependencies.readPositiveInt(searchParams.get("targetUserId"));
  const mode = dependencies.resolveQuizMode(searchParams.get("mode"));
  const { profile } = await dependencies.requireAuthenticatedProfile(request, mode, {
    claimedUserId: requestedUserId,
  });

  return {
    mode,
    requestedUserId,
    targetUserId,
    authenticatedProfile: profile,
  };
}

export async function postChatMessagesAuthContext(
  request: Request,
  dependencies: ChatMessagesRoutePostDependencies,
) {
  const body = await dependencies.readJsonBody(request);
  const requestedSenderId = dependencies.readPositiveInt(body.senderId);
  const receiverId = dependencies.readPositiveInt(body.receiverId);
  const content = dependencies.readTrimmedString(body.content);
  const mode = dependencies.resolveQuizMode(body.mode);
  const { profile } = await dependencies.requireAuthenticatedProfile(request, mode, {
    claimedUserId: requestedSenderId,
  });

  return {
    body,
    mode,
    requestedSenderId,
    receiverId,
    content,
    authenticatedProfile: profile,
  };
}
