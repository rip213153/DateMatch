import { useState, useEffect, useCallback } from "react";

type MatchingStatus = "WAITING" | "MATCHED" | "VIEWED";

interface MatchStatus {
  matchingStatus: MatchingStatus;
  matchAt: number | null;
}

export function useMatchStatus(userId: number | null) {
  const [status, setStatus] = useState<MatchStatus>({
    matchingStatus: "WAITING",
    matchAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/match-status?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "获取匹配状态失败");
      }

      setStatus({
        matchingStatus: data.matchingStatus || "WAITING",
        matchAt: data.matchAt,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取匹配状态失败");
      setStatus({
        matchingStatus: "WAITING",
        matchAt: null,
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const updateStatus = useCallback(
    async (newStatus: MatchingStatus, matchAt?: number) => {
      try {
        const response = await fetch("/api/match-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            status: newStatus,
            matchAt,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "更新匹配状态失败");
        }

        setStatus({
          matchingStatus: newStatus,
          matchAt: matchAt || data.matchAt,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "更新匹配状态失败");
      }
    },
    [userId]
  );

  const isWaiting = status.matchingStatus === "WAITING";
  const isMatched = status.matchingStatus === "MATCHED";
  const isViewed = status.matchingStatus === "VIEWED";

  const canViewResults = isMatched || isViewed;
  const canMatch = isWaiting && status.matchAt !== null;

  return {
    status,
    loading,
    error,
    updateStatus,
    isWaiting,
    isMatched,
    isViewed,
    canViewResults,
    canMatch,
    fetchStatus,
  };
}
