import { and, asc, desc, eq, gte, or, sql } from "drizzle-orm";
import type { QuizMode, UserProfile } from "@/app/data/types";
import { getDbForMode } from "@/lib/database";
import { getBestFriendshipMatches } from "@/lib/friendship-matching";
import {
  buildMatchPairKey,
  getMatchRepeatWindowStart,
  isMatchPairCoolingDown,
} from "@/lib/match-repeat-policy";
import { getBestMatches } from "@/lib/matching";
import { normalizeProfile, normalizeProfiles } from "@/lib/profile-normalizer";
import { matchPairs, profiles } from "@/lib/schema";

export const MUTUAL_MATCH_LIMIT = 3;

type ProfileRow = typeof profiles.$inferSelect;

type RankedMatch = {
  user: UserProfile;
  match: {
    overallScore: number;
    breakdown: {
      personality: number;
      interests: number;
      background: number;
      complementary: number;
    };
    matches: string[];
    recommendations: string[];
  };
};

type MutualPairRow = typeof matchPairs.$inferSelect;
type MutualPairInsert = typeof matchPairs.$inferInsert;

function getRankedMatches(
  mode: QuizMode,
  currentUser: UserProfile,
  pool: UserProfile[],
  limit: number = MUTUAL_MATCH_LIMIT,
): RankedMatch[] {
  return mode === "friendship"
    ? getBestFriendshipMatches(currentUser, pool, limit)
    : getBestMatches(currentUser, pool, limit);
}

function getReciprocalRankScore(rankA: number, rankB: number, limit: number) {
  if (limit <= 1) return 1;
  const distance = Math.max(0, rankA - 1) + Math.max(0, rankB - 1);
  return Math.max(0, 1 - distance / (2 * (limit - 1)));
}

function buildFallbackMatch(targetUser: UserProfile, overallScore: number): RankedMatch {
  return {
    user: targetUser,
    match: {
      overallScore,
      breakdown: {
        personality: overallScore,
        interests: 0,
        background: 0,
        complementary: 0,
      },
      matches: ["Mutual recommendation"],
      recommendations: ["You can start with one message."],
    },
  };
}

export function buildMutualRoundKey(mode: QuizMode, releaseAt: number) {
  return `${mode}:${releaseAt}`;
}

export async function countMutualPairsForRound(mode: QuizMode, releaseAt: number) {
  const db = getDbForMode(mode);
  const roundKey = buildMutualRoundKey(mode, releaseAt);
  const countRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(matchPairs)
    .where(eq(matchPairs.round_key, roundKey));

  return Number(countRows[0]?.count ?? 0);
}

export async function hasPreparedMutualPairsForRound(mode: QuizMode, releaseAt: number) {
  return (await countMutualPairsForRound(mode, releaseAt)) > 0;
}

async function listCoolingDownPairKeys(mode: QuizMode, now: Date = new Date()) {
  const db = getDbForMode(mode);
  const rows = await db
    .select({
      user_a_id: matchPairs.user_a_id,
      user_b_id: matchPairs.user_b_id,
    })
    .from(matchPairs)
    .where(
      and(
        eq(matchPairs.mode, mode),
        gte(matchPairs.created_at, getMatchRepeatWindowStart(now)),
      ),
    );

  return new Set(rows.map((row) => buildMatchPairKey(row.user_a_id, row.user_b_id)));
}

export async function prepareMutualPairsForRound(
  mode: QuizMode,
  eligibleProfileRows: ProfileRow[],
  releaseAt: number,
  now: Date = new Date(),
) {
  const roundKey = buildMutualRoundKey(mode, releaseAt);
  if (await hasPreparedMutualPairsForRound(mode, releaseAt)) {
    return roundKey;
  }

  const db = getDbForMode(mode);
  const eligibleUsers = normalizeProfiles(eligibleProfileRows);
  const coolingDownPairKeys = await listCoolingDownPairKeys(mode, now);
  const rankingsByUserId = new Map<number, Map<number, { rank: number; overallScore: number }>>();

  for (const user of eligibleUsers) {
    const userId = Number(user.id);
    const pool = eligibleUsers.filter((candidate) => {
      const candidateId = Number(candidate.id);
      return candidateId !== userId && !isMatchPairCoolingDown(userId, candidateId, coolingDownPairKeys);
    });
    const rankedMatches = getRankedMatches(mode, user, pool, MUTUAL_MATCH_LIMIT);
    const rankMap = new Map<number, { rank: number; overallScore: number }>();

    rankedMatches.forEach((item, index) => {
      rankMap.set(Number(item.user.id), {
        rank: index + 1,
        overallScore: item.match.overallScore,
      });
    });

    rankingsByUserId.set(userId, rankMap);
  }

  const pairValues: Array<typeof matchPairs.$inferInsert> = [];
  const seenPairs = new Set<string>();

  for (const [userId, rankMap] of Array.from(rankingsByUserId.entries())) {
    for (const [targetUserId, ownRankInfo] of Array.from(rankMap.entries())) {
      const reverseRankInfo = rankingsByUserId.get(targetUserId)?.get(userId);
      if (!reverseRankInfo) continue;

      const userAId = Math.min(userId, targetUserId);
      const userBId = Math.max(userId, targetUserId);
      const pairKey = `${userAId}:${userBId}`;

      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      const userARank = userAId === userId ? ownRankInfo.rank : reverseRankInfo.rank;
      const userBRank = userAId === userId ? reverseRankInfo.rank : ownRankInfo.rank;
      const baseScore = (ownRankInfo.overallScore + reverseRankInfo.overallScore) / 2;
      const reciprocalRankScore = getReciprocalRankScore(userARank, userBRank, MUTUAL_MATCH_LIMIT);
      const pairScore = baseScore * 0.7 + reciprocalRankScore * 0.3;

      pairValues.push({
        round_key: roundKey,
        mode,
        user_a_id: userAId,
        user_b_id: userBId,
        base_score: Number(baseScore.toFixed(4)),
        user_a_rank: userARank,
        user_b_rank: userBRank,
        pair_score: Number(pairScore.toFixed(4)),
        created_at: now,
      });
    }
  }

  if (pairValues.length > 0) {
    await db.insert(matchPairs).values(pairValues);
  }

  return roundKey;
}

export const ensureMutualPairsForRound = prepareMutualPairsForRound;

export async function getMutualPairRowsForUser(
  userId: number,
  mode: QuizMode,
  releaseAt: number,
) {
  const db = getDbForMode(mode);
  const roundKey = buildMutualRoundKey(mode, releaseAt);

  return db
    .select()
    .from(matchPairs)
    .where(
      and(
        eq(matchPairs.round_key, roundKey),
        or(eq(matchPairs.user_a_id, userId), eq(matchPairs.user_b_id, userId)),
      ),
    )
    .orderBy(desc(matchPairs.pair_score), asc(matchPairs.id));
}

export async function getMutualMatchesForUser(
  userId: number,
  mode: QuizMode,
  currentUserRow: ProfileRow,
  targetProfileRows: ProfileRow[],
  releaseAt: number,
) {
  const pairRows = await getMutualPairRowsForUser(userId, mode, releaseAt);
  return buildMutualMatchesForUser(userId, mode, currentUserRow, targetProfileRows, pairRows);
}

export function buildMutualMatchesForUser(
  userId: number,
  mode: QuizMode,
  currentUserRow: ProfileRow,
  targetProfileRows: ProfileRow[],
  pairRows: MutualPairRow[],
) {
  const currentUser = normalizeProfile(currentUserRow);
  const usersById = new Map(targetProfileRows.map((row) => [Number(row.id), normalizeProfile(row)]));

  return pairRows
    .map((pairRow) => {
      const targetUserId = pairRow.user_a_id === userId ? pairRow.user_b_id : pairRow.user_a_id;
      const targetUser = usersById.get(targetUserId);

      if (!targetUser) return null;

      const rankedMatch = getRankedMatches(mode, currentUser, [targetUser], 1)[0];
      if (rankedMatch) {
        return rankedMatch;
      }

      return buildFallbackMatch(targetUser, Number(pairRow.base_score ?? 0));
    })
    .filter((item): item is RankedMatch => item !== null);
}

export function getMutualTargetUserId(pairRow: MutualPairRow, userId: number) {
  return pairRow.user_a_id === userId ? pairRow.user_b_id : pairRow.user_a_id;
}

export function buildMutualPairKey(userId: number, targetUserId: number) {
  const userAId = Math.min(userId, targetUserId);
  const userBId = Math.max(userId, targetUserId);

  return {
    userAId,
    userBId,
  };
}

export function buildMutualPairConfirmationState(pairRow: MutualPairRow, userId: number, targetUserId: number) {
  const { userAId } = buildMutualPairKey(userId, targetUserId);
  const selfConfirmedAt = userId === userAId ? pairRow.user_a_confirmed_at : pairRow.user_b_confirmed_at;
  const otherConfirmedAt = userId === userAId ? pairRow.user_b_confirmed_at : pairRow.user_a_confirmed_at;

  return {
    selfConfirmed: Boolean(selfConfirmedAt),
    otherConfirmed: Boolean(otherConfirmedAt),
    canMessage: Boolean(selfConfirmedAt) && Boolean(otherConfirmedAt),
  };
}

export async function hasMutualPairForUsers(
  userId: number,
  targetUserId: number,
  mode: QuizMode,
  releaseAt: number,
) {
  const pairRow = await getMutualPairRowForUsers(userId, targetUserId, mode, releaseAt);
  return Boolean(pairRow);
}

export async function getMutualPairRowForUsers(
  userId: number,
  targetUserId: number,
  mode: QuizMode,
  releaseAt: number,
) {
  const db = getDbForMode(mode);
  const roundKey = buildMutualRoundKey(mode, releaseAt);
  const { userAId, userBId } = buildMutualPairKey(userId, targetUserId);
  const rows = await db
    .select()
    .from(matchPairs)
    .where(
      and(
        eq(matchPairs.round_key, roundKey),
        eq(matchPairs.user_a_id, userAId),
        eq(matchPairs.user_b_id, userBId),
      ),
    )
    .orderBy(desc(matchPairs.id));

  return rows[0] ?? null;
}

export function buildMutualPairConfirmationPatch(
  userId: number,
  targetUserId: number,
  confirmed: boolean,
  confirmedAt: Date,
): Pick<MutualPairInsert, "user_a_confirmed_at" | "user_b_confirmed_at"> {
  const { userAId } = buildMutualPairKey(userId, targetUserId);

  if (userId === userAId) {
    return {
      user_a_confirmed_at: confirmed ? confirmedAt : null,
    };
  }

  return {
    user_b_confirmed_at: confirmed ? confirmedAt : null,
  };
}
