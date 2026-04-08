const DAY_MS = 24 * 60 * 60 * 1000;

export const MATCH_REPEAT_COOLDOWN_DAYS = 14;
export const MATCH_REPEAT_COOLDOWN_MS = MATCH_REPEAT_COOLDOWN_DAYS * DAY_MS;

export function buildMatchPairKey(userId: number, targetUserId: number) {
  const userAId = Math.min(userId, targetUserId);
  const userBId = Math.max(userId, targetUserId);
  return `${userAId}:${userBId}`;
}

export function getMatchRepeatWindowStart(now: Date = new Date()) {
  return new Date(now.getTime() - MATCH_REPEAT_COOLDOWN_MS);
}

export function isMatchPairCoolingDown(
  userId: number,
  targetUserId: number,
  coolingDownPairKeys: Set<string>,
) {
  return coolingDownPairKeys.has(buildMatchPairKey(userId, targetUserId));
}
