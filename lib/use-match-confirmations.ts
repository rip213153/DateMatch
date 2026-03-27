import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AuthMode } from "@/lib/auth";
import type { MatchConfirmationStatus, MatchItem, UserSummary } from "@/components/match/types";

interface UseMatchConfirmationsOptions {
  currentUser: UserSummary | null;
  matches: MatchItem[];
  mode: AuthMode;
  isInDisplayWindow: boolean;
  setError: Dispatch<SetStateAction<string | null>>;
}

interface UseMatchConfirmationsResult {
  loadingConfirmations: boolean;
  updatingConfirmationUserId: number | null;
  getConfirmationStatus: (targetUserId: number) => MatchConfirmationStatus | null;
  toggleConfirmation: (targetUserId: number) => Promise<void>;
}

function buildEmptyConfirmationStatus(): MatchConfirmationStatus {
  return {
    selfConfirmed: false,
    otherConfirmed: false,
    canMessage: false,
  };
}

export function useMatchConfirmations({
  currentUser,
  matches,
  mode,
  isInDisplayWindow,
  setError,
}: UseMatchConfirmationsOptions): UseMatchConfirmationsResult {
  const [confirmationStatuses, setConfirmationStatuses] = useState<Record<string, MatchConfirmationStatus>>({});
  const [loadingConfirmations, setLoadingConfirmations] = useState(false);
  const [updatingConfirmationUserId, setUpdatingConfirmationUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser || matches.length === 0 || !isInDisplayWindow) {
      setConfirmationStatuses({});
      setLoadingConfirmations(false);
      return;
    }

    const controller = new AbortController();
    const targetUserIds = matches.map((item) => item.user.id).join(",");
    setLoadingConfirmations(true);

    fetch(
      `/api/match-confirmations?userId=${currentUser.id}&targetUserIds=${encodeURIComponent(targetUserIds)}&mode=${mode}`,
      {
        cache: "no-store",
        signal: controller.signal,
      }
    )
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "加载点亮状态失败");
        }

        setConfirmationStatuses((data?.statuses ?? {}) as Record<string, MatchConfirmationStatus>);
      })
      .catch((fetchError) => {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        console.error("Failed to load match confirmations:", fetchError);
        setConfirmationStatuses({});
      })
      .finally(() => {
        setLoadingConfirmations(false);
      });

    return () => controller.abort();
  }, [currentUser, isInDisplayWindow, matches, mode]);

  const getConfirmationStatus = useCallback(
    (targetUserId: number) => confirmationStatuses[String(targetUserId)] ?? null,
    [confirmationStatuses]
  );

  const toggleConfirmation = useCallback(
    async (targetUserId: number) => {
      if (!currentUser || updatingConfirmationUserId === targetUserId) return;

      const currentStatus = getConfirmationStatus(targetUserId) ?? buildEmptyConfirmationStatus();
      if (currentStatus.canMessage && currentStatus.selfConfirmed && currentStatus.otherConfirmed) {
        return;
      }

      const nextConfirmed = !currentStatus.selfConfirmed;
      setUpdatingConfirmationUserId(targetUserId);

      try {
        const response = await fetch("/api/match-confirmations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.id,
            targetUserId,
            confirmed: nextConfirmed,
            mode,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "更新点亮状态失败");
        }

        if (data?.status) {
          setConfirmationStatuses((current) => ({
            ...current,
            [String(targetUserId)]: data.status as MatchConfirmationStatus,
          }));
        }
      } catch (toggleError) {
        console.error("Failed to update match confirmation:", toggleError);
        setError(toggleError instanceof Error ? toggleError.message : "更新点亮状态失败");
      } finally {
        setUpdatingConfirmationUserId(null);
      }
    },
    [currentUser, getConfirmationStatus, mode, setError, updatingConfirmationUserId]
  );

  return {
    loadingConfirmations,
    updatingConfirmationUserId,
    getConfirmationStatus,
    toggleConfirmation,
  };
}
