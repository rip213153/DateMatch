import { useCallback, useEffect, useState } from "react";
import type { MatchItem } from "@/components/match/types";
import type { MatchSchedulePhase } from "@/lib/match-schedule";

export type MatchAvailability = {
  matchAt: number | null;
  releaseAt: number | null;
  displayEndAt: number | null;
  nextReleaseAt: number | null;
  optOutUntil: number | null;
  eligibleReleaseAt: number | null;
  isInDisplayWindow: boolean;
  isOptedOutForRound: boolean;
  isQueuedForNextRound: boolean;
  phase: MatchSchedulePhase | null;
};

interface UseMatchDataResult {
  matches: MatchItem[];
  availability: MatchAvailability;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const EMPTY_AVAILABILITY: MatchAvailability = {
  matchAt: null,
  releaseAt: null,
  displayEndAt: null,
  nextReleaseAt: null,
  optOutUntil: null,
  eligibleReleaseAt: null,
  isInDisplayWindow: false,
  isOptedOutForRound: false,
  isQueuedForNextRound: false,
  phase: null,
};

export function useMatchData(
  currentUserId: number | null,
  isAuthenticated: boolean,
  mode: "romance" | "friendship" = "romance"
): UseMatchDataResult {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [availability, setAvailability] = useState<MatchAvailability>(EMPTY_AVAILABILITY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/find-matches?userId=${currentUserId}&mode=${mode}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "获取匹配结果失败");
        setMatches([]);
        setAvailability(EMPTY_AVAILABILITY);
        return;
      }

      const nextMatches = Array.isArray(data.matches) ? (data.matches as MatchItem[]) : [];

      setMatches(nextMatches);
      setAvailability({
        matchAt: typeof data.matchAt === "number" ? data.matchAt : null,
        releaseAt: typeof data.releaseAt === "number" ? data.releaseAt : null,
        displayEndAt: typeof data.displayEndAt === "number" ? data.displayEndAt : null,
        nextReleaseAt: typeof data.nextReleaseAt === "number" ? data.nextReleaseAt : null,
        optOutUntil: typeof data.optOutUntil === "number" ? data.optOutUntil : null,
        eligibleReleaseAt: typeof data.eligibleReleaseAt === "number" ? data.eligibleReleaseAt : null,
        isInDisplayWindow: Boolean(data.isInDisplayWindow),
        isOptedOutForRound: Boolean(data.isOptedOutForRound),
        isQueuedForNextRound: Boolean(data.isQueuedForNextRound),
        phase: typeof data.phase === "string" ? (data.phase as MatchSchedulePhase) : null,
      });
    } catch {
      setError("获取匹配结果失败，请稍后重试");
      setMatches([]);
      setAvailability(EMPTY_AVAILABILITY);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, mode]);

  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      void fetchMatches();
    }
  }, [currentUserId, fetchMatches, isAuthenticated]);

  return {
    matches,
    availability,
    loading,
    error,
    refresh: fetchMatches,
  };
}
