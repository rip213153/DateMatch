import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizMode } from "@/app/data/types";

export type ChatMessage = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string | null;
};

export type LoadMessagesOptions = {
  silent?: boolean;
  useCachedFirst?: boolean;
  forceRefresh?: boolean;
};

type MessageCacheEntry = {
  messages: ChatMessage[];
  loadedAt: number;
};

type UseChatMessagesOptions = {
  currentUserId: number | null;
  activeContactId: number | null;
  mode: QuizMode;
  isPageVisible: boolean;
  isWindowFocused: boolean;
  onLatestMessage?: (targetUserId: number, latestMessage: ChatMessage) => void;
};

const MESSAGE_CACHE_STALE_MS = 10_000;
const MESSAGE_POLL_BACKOFF_MS = [1500, 3000, 5000, 10000] as const;
const MESSAGE_POLL_RECENT_ACTIVITY_MS = 3000;
const MESSAGE_POLL_DEFAULT_MS = 6000;
const MESSAGE_POLL_WAITING_REPLY_MS = 10000;
const MESSAGE_POLL_EMPTY_MS = 15000;
const MESSAGE_POLL_RECENT_WINDOW_MS = 2 * 60 * 1000;

function buildMessageCacheKey(userId: number, targetUserId: number, mode: QuizMode) {
  return `${mode}:${userId}:${targetUserId}`;
}

function isMessageCacheFresh(entry: MessageCacheEntry | undefined) {
  if (!entry) return false;
  return Date.now() - entry.loadedAt < MESSAGE_CACHE_STALE_MS;
}

function getLatestMessageTimestamp(items: ChatMessage[]) {
  const latestMessage = items[items.length - 1] ?? null;
  if (!latestMessage?.createdAt) return null;

  const timestamp = Date.parse(latestMessage.createdAt);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function hasPendingReply(items: ChatMessage[], currentUserId: number, targetUserId: number | null) {
  if (!targetUserId) return false;

  let sentSinceLastReply = 0;

  for (const item of items) {
    if (item.senderId === targetUserId && item.receiverId === currentUserId) {
      sentSinceLastReply = 0;
      continue;
    }

    if (item.senderId === currentUserId && item.receiverId === targetUserId) {
      sentSinceLastReply += 1;
    }
  }

  return sentSinceLastReply >= 1;
}

export function hasMutualMessages(
  items: Array<Pick<ChatMessage, "senderId" | "receiverId">>,
  currentUserId: number,
  targetUserId: number,
) {
  const sentByCurrentUser = items.some(
    (message) => message.senderId === currentUserId && message.receiverId === targetUserId,
  );
  const sentByTargetUser = items.some(
    (message) => message.senderId === targetUserId && message.receiverId === currentUserId,
  );
  return sentByCurrentUser && sentByTargetUser;
}

function getMessagePollDelay(
  items: ChatMessage[],
  currentUserId: number,
  targetUserId: number,
  now: number = Date.now(),
) {
  if (items.length === 0) {
    return MESSAGE_POLL_EMPTY_MS;
  }

  if (hasPendingReply(items, currentUserId, targetUserId)) {
    return MESSAGE_POLL_WAITING_REPLY_MS;
  }

  const latestMessageTimestamp = getLatestMessageTimestamp(items);
  if (latestMessageTimestamp && now - latestMessageTimestamp <= MESSAGE_POLL_RECENT_WINDOW_MS) {
    return MESSAGE_POLL_RECENT_ACTIVITY_MS;
  }

  return MESSAGE_POLL_DEFAULT_MS;
}

export function useChatMessages({
  currentUserId,
  activeContactId,
  mode,
  isPageVisible,
  isWindowFocused,
  onLatestMessage,
}: UseChatMessagesOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  const messageCacheRef = useRef<Map<string, MessageCacheEntry>>(new Map());
  const inFlightMessageRequestsRef = useRef<Map<string, Promise<ChatMessage[]>>>(new Map());
  const pollTimeoutRef = useRef<number | null>(null);
  const pollFailureCountRef = useRef(0);
  const currentUserIdRef = useRef<number | null>(currentUserId);
  const activeContactIdRef = useRef<number | null>(activeContactId);
  const pageVisibleRef = useRef(isPageVisible);
  const windowFocusedRef = useRef(isWindowFocused);
  const previousPageVisibleRef = useRef(isPageVisible);
  const previousWindowFocusedRef = useRef(isWindowFocused);

  const clearMessagePoll = useCallback(() => {
    if (pollTimeoutRef.current !== null) {
      window.clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const getMessageCacheEntry = useCallback(
    (userId: number, targetUserId: number) =>
      messageCacheRef.current.get(buildMessageCacheKey(userId, targetUserId, mode)),
    [mode],
  );

  const setMessageCacheEntry = useCallback(
    (userId: number, targetUserId: number, nextMessages: ChatMessage[]) => {
      messageCacheRef.current.set(buildMessageCacheKey(userId, targetUserId, mode), {
        messages: nextMessages,
        loadedAt: Date.now(),
      });

      const latestMessage = nextMessages[nextMessages.length - 1] ?? null;
      if (latestMessage) {
        onLatestMessage?.(targetUserId, latestMessage);
      }
    },
    [mode, onLatestMessage],
  );

  const fetchConversationMessages = useCallback(
    async (userId: number, targetUserId: number) => {
      const requestKey = buildMessageCacheKey(userId, targetUserId, mode);
      const inFlightRequest = inFlightMessageRequestsRef.current.get(requestKey);

      if (inFlightRequest) {
        return inFlightRequest;
      }

      const nextRequest = (async () => {
        const response = await fetch(`/api/chat/messages?userId=${userId}&targetUserId=${targetUserId}&mode=${mode}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "加载消息失败，请稍后重试。");
        }

        return Array.isArray(data.messages) ? (data.messages as ChatMessage[]) : [];
      })();

      inFlightMessageRequestsRef.current.set(requestKey, nextRequest);

      try {
        return await nextRequest;
      } finally {
        if (inFlightMessageRequestsRef.current.get(requestKey) === nextRequest) {
          inFlightMessageRequestsRef.current.delete(requestKey);
        }
      }
    },
    [mode],
  );

  const loadMessages = useCallback(
    async (userId: number, targetUserId: number, options: LoadMessagesOptions = {}) => {
      const { silent = false, useCachedFirst = false, forceRefresh = false } = options;
      const cacheEntry = getMessageCacheEntry(userId, targetUserId);
      const hydratedFromCache = useCachedFirst && Boolean(cacheEntry);

      if (hydratedFromCache && cacheEntry) {
        if (activeContactIdRef.current === targetUserId) {
          setMessages(cacheEntry.messages);
        }
        setLoadingMessages(false);
        setMessageError(null);

        if (!forceRefresh && isMessageCacheFresh(cacheEntry)) {
          return true;
        }
      } else if (!silent) {
        setLoadingMessages(true);
        setMessageError(null);
      }

      try {
        const nextMessages = await fetchConversationMessages(userId, targetUserId);
        setMessageCacheEntry(userId, targetUserId, nextMessages);

        if (activeContactIdRef.current === targetUserId) {
          setMessages(nextMessages);
        }
        setMessageError(null);
        return true;
      } catch {
        if (!silent && !hydratedFromCache && activeContactIdRef.current === targetUserId) {
          setMessages([]);
          setMessageError("加载消息失败，请稍后重试。");
        }
        return false;
      } finally {
        if (!silent && !hydratedFromCache) {
          setLoadingMessages(false);
        }
      }
    },
    [fetchConversationMessages, getMessageCacheEntry, setMessageCacheEntry],
  );

  const scheduleMessagePoll = useCallback(() => {
    clearMessagePoll();

    if (
      !currentUserIdRef.current ||
      !activeContactIdRef.current ||
      !pageVisibleRef.current ||
      !windowFocusedRef.current
    ) {
      return;
    }

    const userId = currentUserIdRef.current;
    const targetUserId = activeContactIdRef.current;
    const cacheEntry = userId && targetUserId ? getMessageCacheEntry(userId, targetUserId) : undefined;
    const adaptiveDelay =
      userId && targetUserId
        ? getMessagePollDelay(cacheEntry?.messages ?? [], userId, targetUserId)
        : MESSAGE_POLL_DEFAULT_MS;
    const failureBackoffDelay =
      MESSAGE_POLL_BACKOFF_MS[Math.min(pollFailureCountRef.current, MESSAGE_POLL_BACKOFF_MS.length - 1)];
    const nextDelay = Math.max(adaptiveDelay, failureBackoffDelay);

    pollTimeoutRef.current = window.setTimeout(async () => {
      const userId = currentUserIdRef.current;
      const targetUserId = activeContactIdRef.current;

      if (!userId || !targetUserId || !pageVisibleRef.current || !windowFocusedRef.current) {
        clearMessagePoll();
        return;
      }

      const success = await loadMessages(userId, targetUserId, {
        silent: true,
        forceRefresh: true,
      });

      pollFailureCountRef.current = success
        ? 0
        : Math.min(pollFailureCountRef.current + 1, MESSAGE_POLL_BACKOFF_MS.length - 1);

      scheduleMessagePoll();
    }, nextDelay);
  }, [clearMessagePoll, getMessageCacheEntry, loadMessages]);

  const ensureConversationLoaded = useCallback(
    async (targetUserId: number, options: LoadMessagesOptions = {}) => {
      if (!currentUserId) return null;

      const success = await loadMessages(currentUserId, targetUserId, options);
      if (!success) {
        return null;
      }

      return getMessageCacheEntry(currentUserId, targetUserId)?.messages ?? null;
    },
    [currentUserId, getMessageCacheEntry, loadMessages],
  );

  const getCachedMessages = useCallback(
    (targetUserId: number) => {
      if (!currentUserId) return targetUserId === activeContactId ? messages : null;

      return (
        getMessageCacheEntry(currentUserId, targetUserId)?.messages ??
        (targetUserId === activeContactId ? messages : null)
      );
    },
    [activeContactId, currentUserId, getMessageCacheEntry, messages],
  );

  const isCachedConversationFresh = useCallback(
    (targetUserId: number) => {
      if (!currentUserId) return false;
      return isMessageCacheFresh(getMessageCacheEntry(currentUserId, targetUserId));
    },
    [currentUserId, getMessageCacheEntry],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentUserId || !activeContactId || !content.trim() || sending) return false;

      setSending(true);
      setMessageError(null);

      try {
        const response = await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: currentUserId,
            receiverId: activeContactId,
            content,
            mode,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          setMessageError(data?.error || "发送失败，请稍后重试。");
          return false;
        }

        const newMessage = data.message as ChatMessage;
        const latestCachedMessages = getMessageCacheEntry(currentUserId, activeContactId)?.messages ?? messages;
        const nextMessages = [...latestCachedMessages, newMessage];
        setMessages(nextMessages);
        setMessageCacheEntry(currentUserId, activeContactId, nextMessages);
        pollFailureCountRef.current = 0;
        scheduleMessagePoll();
        return true;
      } catch {
        setMessageError("发送失败，请稍后重试。");
        return false;
      } finally {
        setSending(false);
      }
    },
    [activeContactId, currentUserId, getMessageCacheEntry, messages, mode, scheduleMessagePoll, sending, setMessageCacheEntry],
  );

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    activeContactIdRef.current = activeContactId;
  }, [activeContactId]);

  useEffect(() => {
    pageVisibleRef.current = isPageVisible;
  }, [isPageVisible]);

  useEffect(() => {
    windowFocusedRef.current = isWindowFocused;
  }, [isWindowFocused]);

  useEffect(() => {
    return () => {
      currentUserIdRef.current = null;
      activeContactIdRef.current = null;
      pageVisibleRef.current = false;
      windowFocusedRef.current = false;
      clearMessagePoll();
    };
  }, [clearMessagePoll]);

  useEffect(() => {
    pollFailureCountRef.current = 0;
  }, [activeContactId, currentUserId, mode]);

  useEffect(() => {
    if (!currentUserId || !activeContactId) {
      setMessages([]);
      setLoadingMessages(false);
      setMessageError(null);
      return;
    }

    void loadMessages(currentUserId, activeContactId, {
      useCachedFirst: true,
    });
  }, [activeContactId, currentUserId, loadMessages]);

  useEffect(() => {
    clearMessagePoll();

    if (!currentUserId || !activeContactId || !isPageVisible || !isWindowFocused) {
      return clearMessagePoll;
    }

    scheduleMessagePoll();
    return clearMessagePoll;
  }, [activeContactId, clearMessagePoll, currentUserId, isPageVisible, isWindowFocused, scheduleMessagePoll]);

  useEffect(() => {
    const regainedVisibility =
      (!previousPageVisibleRef.current && isPageVisible) || (!previousWindowFocusedRef.current && isWindowFocused);

    previousPageVisibleRef.current = isPageVisible;
    previousWindowFocusedRef.current = isWindowFocused;

    if (!regainedVisibility || !currentUserId || !activeContactId || !isPageVisible || !isWindowFocused) {
      return;
    }

    void loadMessages(currentUserId, activeContactId, {
      silent: true,
      useCachedFirst: true,
      forceRefresh: true,
    }).then((success) => {
      pollFailureCountRef.current = success ? 0 : 1;
      scheduleMessagePoll();
    });
  }, [activeContactId, currentUserId, isPageVisible, isWindowFocused, loadMessages, scheduleMessagePoll]);

  return {
    messages,
    loadingMessages,
    sending,
    messageError,
    setMessageError,
    sendMessage,
    getCachedMessages,
    isCachedConversationFresh,
    ensureConversationLoaded,
  };
}

