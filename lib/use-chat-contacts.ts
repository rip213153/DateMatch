import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizMode } from "@/app/data/types";

export type ChatContact = {
  id: number;
  name: string;
  age: number;
  university: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  email?: string;
  ideal_date?: string;
  ideal_date_tags?: string[];
  bio?: string;
  interests?: string | string[];
};

type ContactsCacheEntry = {
  contacts: ChatContact[];
  loadedAt: number;
};

type LoadContactsOptions = {
  useCachedFirst?: boolean;
  forceRefresh?: boolean;
};

type UseChatContactsOptions = {
  currentUserId: number | null;
  mode: QuizMode;
  targetUserIdFromQuery: number | null;
};

const CONTACTS_CACHE_STALE_MS = 30_000;
const CONTACTS_CACHE_STORAGE_PREFIX = "datematch_chat_contacts";

export function sortChatContacts(items: ChatContact[]) {
  return [...items].sort((a, b) => {
    const aTime = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
    const bTime = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
    if (aTime !== bTime) return bTime - aTime;
    return a.id - b.id;
  });
}

function buildContactsCacheKey(userId: number, mode: QuizMode) {
  return `${CONTACTS_CACHE_STORAGE_PREFIX}:${mode}:${userId}`;
}

function isContactsCacheFresh(entry: ContactsCacheEntry | undefined) {
  if (!entry) return false;
  return Date.now() - entry.loadedAt < CONTACTS_CACHE_STALE_MS;
}

function readContactsCacheFromStorage(cacheKey: string): ContactsCacheEntry | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.sessionStorage.getItem(cacheKey);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw) as Partial<ContactsCacheEntry> | null;
    if (!parsed || !Array.isArray(parsed.contacts) || typeof parsed.loadedAt !== "number") {
      return undefined;
    }

    return {
      contacts: sortChatContacts(parsed.contacts as ChatContact[]),
      loadedAt: parsed.loadedAt,
    };
  } catch {
    return undefined;
  }
}

function writeContactsCacheToStorage(cacheKey: string, entry: ContactsCacheEntry) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch {
    // Ignore storage write failures and continue with in-memory cache only.
  }
}

export function useChatContacts({ currentUserId, mode, targetUserIdFromQuery }: UseChatContactsOptions) {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContactId, setActiveContactId] = useState<number | null>(targetUserIdFromQuery);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contactsCacheRef = useRef<Map<string, ContactsCacheEntry>>(new Map());
  const inFlightContactsRequestsRef = useRef<Map<string, Promise<ChatContact[]>>>(new Map());

  const resolveNextActiveContactId = useCallback(
    (nextContacts: ChatContact[], currentActiveContactId: number | null) => {
      if (currentActiveContactId && nextContacts.some((item) => item.id === currentActiveContactId)) {
        return currentActiveContactId;
      }

      if (targetUserIdFromQuery && nextContacts.some((item) => item.id === targetUserIdFromQuery)) {
        return targetUserIdFromQuery;
      }

      return nextContacts[0]?.id ?? null;
    },
    [targetUserIdFromQuery],
  );

  const getContactsCacheEntry = useCallback(
    (userId: number) => {
      const cacheKey = buildContactsCacheKey(userId, mode);
      const memoryEntry = contactsCacheRef.current.get(cacheKey);
      if (memoryEntry) {
        return memoryEntry;
      }

      const storedEntry = readContactsCacheFromStorage(cacheKey);
      if (storedEntry) {
        contactsCacheRef.current.set(cacheKey, storedEntry);
      }

      return storedEntry;
    },
    [mode],
  );

  const setContactsCacheEntry = useCallback(
    (userId: number, nextContacts: ChatContact[]) => {
      const cacheKey = buildContactsCacheKey(userId, mode);
      const entry: ContactsCacheEntry = {
        contacts: sortChatContacts(nextContacts),
        loadedAt: Date.now(),
      };

      contactsCacheRef.current.set(cacheKey, entry);
      writeContactsCacheToStorage(cacheKey, entry);
    },
    [mode],
  );

  const fetchContacts = useCallback(
    async (userId: number) => {
      const cacheKey = buildContactsCacheKey(userId, mode);
      const inFlightRequest = inFlightContactsRequestsRef.current.get(cacheKey);

      if (inFlightRequest) {
        return inFlightRequest;
      }

      const nextRequest = (async () => {
        const response = await fetch(`/api/chat/contacts?userId=${userId}&mode=${mode}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "加载聊天联系人失败，请稍后重试。");
        }

        return sortChatContacts(Array.isArray(data.contacts) ? (data.contacts as ChatContact[]) : []);
      })();

      inFlightContactsRequestsRef.current.set(cacheKey, nextRequest);

      try {
        return await nextRequest;
      } finally {
        if (inFlightContactsRequestsRef.current.get(cacheKey) === nextRequest) {
          inFlightContactsRequestsRef.current.delete(cacheKey);
        }
      }
    },
    [mode],
  );

  const loadContacts = useCallback(async (options: LoadContactsOptions = {}) => {
    if (!currentUserId) return false;

    const { useCachedFirst = true, forceRefresh = false } = options;
    const cacheEntry = getContactsCacheEntry(currentUserId);
    const hydratedFromCache = useCachedFirst && Boolean(cacheEntry);

    if (hydratedFromCache && cacheEntry) {
      setContacts(cacheEntry.contacts);
      setActiveContactId((current) => resolveNextActiveContactId(cacheEntry.contacts, current));
      setLoadingContacts(false);
      setError(null);

      if (!forceRefresh && isContactsCacheFresh(cacheEntry)) {
        return true;
      }
    } else {
      setLoadingContacts(true);
      setError(null);
    }

    try {
      const nextContacts = await fetchContacts(currentUserId);
      setContactsCacheEntry(currentUserId, nextContacts);
      setContacts(nextContacts);
      setActiveContactId((current) => resolveNextActiveContactId(nextContacts, current));
      return true;
    } catch {
      if (!hydratedFromCache) {
        setContacts([]);
        setError("加载聊天联系人失败，请稍后重试。");
      }
      return false;
    } finally {
      if (!hydratedFromCache) {
        setLoadingContacts(false);
      }
    }
  }, [currentUserId, fetchContacts, getContactsCacheEntry, resolveNextActiveContactId, setContactsCacheEntry]);

  const updateContactWithLatestMessage = useCallback((targetUserId: number, latestMessage: { content: string; createdAt: string | null }) => {
    setContacts((current) =>
      sortChatContacts(
        current.map((contact) =>
          contact.id === targetUserId
            ? {
                ...contact,
                lastMessage: latestMessage.content,
                lastMessageAt: latestMessage.createdAt,
              }
            : contact,
        ),
      ),
    );
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setLoadingContacts(false);
      setError("缺少合法 userId，请从匹配页进入聊天。");
      return;
    }

    void loadContacts();
  }, [currentUserId, loadContacts]);

  useEffect(() => {
    if (!currentUserId || loadingContacts || error) {
      return;
    }

    setContactsCacheEntry(currentUserId, contacts);
  }, [contacts, currentUserId, error, loadingContacts, setContactsCacheEntry]);

  return {
    contacts,
    activeContactId,
    setActiveContactId,
    loadingContacts,
    error,
    setContacts,
    updateContactWithLatestMessage,
  };
}

