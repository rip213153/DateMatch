import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizMode } from "@/app/data/types";
import type { MatchConfirmationStatus } from "@/components/match/types";

type ConfirmationCacheEntry = {
  status: MatchConfirmationStatus | null;
  loadedAt: number;
};

type LoadConfirmationStatusOptions = {
  useCachedFirst?: boolean;
  forceRefresh?: boolean;
  silent?: boolean;
};

type UseChatConfirmationStatusOptions = {
  currentUserId: number | null;
  activeContactId: number | null;
  mode: QuizMode;
  onError?: (message: string) => void;
};

const CONFIRMATION_CACHE_STALE_MS = 20_000;

function buildConfirmationCacheKey(userId: number, targetUserId: number, mode: QuizMode) {
  return `datematch_chat_confirmation:${mode}:${userId}:${targetUserId}`;
}

function isConfirmationCacheFresh(entry: ConfirmationCacheEntry | undefined) {
  if (!entry) return false;
  return Date.now() - entry.loadedAt < CONFIRMATION_CACHE_STALE_MS;
}

function buildEmptyConfirmationStatus(): MatchConfirmationStatus {
  return {
    selfConfirmed: false,
    otherConfirmed: false,
    canMessage: false,
  };
}

export function useChatConfirmationStatus({
  currentUserId,
  activeContactId,
  mode,
  onError,
}: UseChatConfirmationStatusOptions) {
  const [confirmationStatus, setConfirmationStatus] = useState<MatchConfirmationStatus | null>(null);
  const [loadingConfirmationStatus, setLoadingConfirmationStatus] = useState(false);
  const [updatingConfirmationStatus, setUpdatingConfirmationStatus] = useState(false);

  const confirmationCacheRef = useRef<Map<string, ConfirmationCacheEntry>>(new Map());
  const inFlightConfirmationRequestsRef = useRef<Map<string, Promise<MatchConfirmationStatus | null>>>(new Map());
  const activeContactIdRef = useRef<number | null>(activeContactId);

  useEffect(() => {
    activeContactIdRef.current = activeContactId;
  }, [activeContactId]);

  const getConfirmationCacheEntry = useCallback(
    (userId: number, targetUserId: number) =>
      confirmationCacheRef.current.get(buildConfirmationCacheKey(userId, targetUserId, mode)),
    [mode],
  );

  const setConfirmationCacheEntry = useCallback(
    (userId: number, targetUserId: number, status: MatchConfirmationStatus | null) => {
      confirmationCacheRef.current.set(buildConfirmationCacheKey(userId, targetUserId, mode), {
        status,
        loadedAt: Date.now(),
      });
    },
    [mode],
  );

  const fetchConfirmationStatus = useCallback(
    async (userId: number, targetUserId: number) => {
      const cacheKey = buildConfirmationCacheKey(userId, targetUserId, mode);
      const inFlightRequest = inFlightConfirmationRequestsRef.current.get(cacheKey);

      if (inFlightRequest) {
        return inFlightRequest;
      }

      const nextRequest = (async () => {
        const response = await fetch(
          `/api/match-confirmations?userId=${userId}&targetUserIds=${encodeURIComponent(String(targetUserId))}&mode=${mode}`,
          {
            cache: "no-store",
          },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "加载确认状态失败，请稍后重试。");
        }

        return (data?.statuses?.[String(targetUserId)] as MatchConfirmationStatus | undefined) ?? null;
      })();

      inFlightConfirmationRequestsRef.current.set(cacheKey, nextRequest);

      try {
        return await nextRequest;
      } finally {
        if (inFlightConfirmationRequestsRef.current.get(cacheKey) === nextRequest) {
          inFlightConfirmationRequestsRef.current.delete(cacheKey);
        }
      }
    },
    [mode],
  );

  const loadConfirmationStatus = useCallback(
    async (userId: number, targetUserId: number, options: LoadConfirmationStatusOptions = {}) => {
      const { useCachedFirst = true, forceRefresh = false, silent = false } = options;
      const cacheEntry = getConfirmationCacheEntry(userId, targetUserId);
      const hydratedFromCache = useCachedFirst && Boolean(cacheEntry);

      if (hydratedFromCache && cacheEntry) {
        if (activeContactIdRef.current === targetUserId) {
          setConfirmationStatus(cacheEntry.status);
        }
        setLoadingConfirmationStatus(false);

        if (!forceRefresh && isConfirmationCacheFresh(cacheEntry)) {
          return true;
        }
      } else if (!silent) {
        setLoadingConfirmationStatus(true);
      }

      try {
        const nextStatus = await fetchConfirmationStatus(userId, targetUserId);
        setConfirmationCacheEntry(userId, targetUserId, nextStatus);

        if (activeContactIdRef.current === targetUserId) {
          setConfirmationStatus(nextStatus);
        }

        return true;
      } catch {
        if (!hydratedFromCache && activeContactIdRef.current === targetUserId) {
          setConfirmationStatus(null);
        }

        return false;
      } finally {
        if (!hydratedFromCache || !silent) {
          setLoadingConfirmationStatus(false);
        }
      }
    },
    [fetchConfirmationStatus, getConfirmationCacheEntry, setConfirmationCacheEntry],
  );

  const toggleConfirmation = useCallback(async () => {
    if (!currentUserId || !activeContactId || updatingConfirmationStatus) return;

    const currentStatus = confirmationStatus ?? buildEmptyConfirmationStatus();
    if (currentStatus.canMessage && currentStatus.selfConfirmed && currentStatus.otherConfirmed) {
      return;
    }

    setUpdatingConfirmationStatus(true);
    try {
      const response = await fetch("/api/match-confirmations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId,
          targetUserId: activeContactId,
          confirmed: !currentStatus.selfConfirmed,
          mode,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "更新确认状态失败，请稍后重试。");
      }

      const nextStatus = (data?.status as MatchConfirmationStatus | undefined) ?? currentStatus;
      setConfirmationStatus(nextStatus);
      setConfirmationCacheEntry(currentUserId, activeContactId, nextStatus);
    } catch (toggleError) {
      onError?.(toggleError instanceof Error ? toggleError.message : "更新确认状态失败，请稍后重试。");
    } finally {
      setUpdatingConfirmationStatus(false);
    }
  }, [activeContactId, confirmationStatus, currentUserId, mode, onError, setConfirmationCacheEntry, updatingConfirmationStatus]);

  useEffect(() => {
    if (!currentUserId || !activeContactId) {
      setConfirmationStatus(null);
      setLoadingConfirmationStatus(false);
      return;
    }

    void loadConfirmationStatus(currentUserId, activeContactId, {
      useCachedFirst: true,
    });
  }, [activeContactId, currentUserId, loadConfirmationStatus]);

  return {
    confirmationStatus,
    loadingConfirmationStatus,
    updatingConfirmationStatus,
    toggleConfirmation,
    loadConfirmationStatus,
  };
}
