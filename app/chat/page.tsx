"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";

type UserSummary = {
  id: number;
  name: string;
  age: number;
  university: string;
};

type ChatContact = {
  id: number;
  name: string;
  age: number;
  university: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
};

type ChatMessage = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string | null;
};

function toPositiveInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentUserId = useMemo(() => toPositiveInt(searchParams.get("userId")), [searchParams]);
  const targetUserIdFromQuery = useMemo(() => toPositiveInt(searchParams.get("targetUserId")), [searchParams]);

  const [availableUsers, setAvailableUsers] = useState<UserSummary[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>("\u5f53\u524d\u7528\u6237");
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContactId, setActiveContactId] = useState<number | null>(targetUserIdFromQuery);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const activeContact = useMemo(
    () => contacts.find((item) => item.id === activeContactId) ?? null,
    [contacts, activeContactId]
  );

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) return;
      setAvailableUsers(Array.isArray(data.users) ? (data.users as UserSummary[]) : []);
    } catch {
      // Ignore user list loading errors in chat page.
    }
  }, []);

  const loadContacts = useCallback(async () => {
    if (!currentUserId) return;

    setLoadingContacts(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/contacts?userId=${currentUserId}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "\u52a0\u8f7d\u8054\u7cfb\u4eba\u5931\u8d25");
        setContacts([]);
        return;
      }

      const contactList = Array.isArray(data.contacts) ? (data.contacts as ChatContact[]) : [];
      setContacts(contactList);

      if (data.currentUser?.name) {
        setCurrentUserName(data.currentUser.name);
      }

      setActiveContactId((prev) => {
        const queryTarget = targetUserIdFromQuery;
        const hasQueryTarget = queryTarget
          ? contactList.some((item) => item.id === queryTarget)
          : false;

        if (prev && contactList.some((item) => item.id === prev)) {
          return prev;
        }

        if (hasQueryTarget && queryTarget) {
          return queryTarget;
        }

        return contactList[0]?.id ?? null;
      });
    } catch {
      setError("\u52a0\u8f7d\u8054\u7cfb\u4eba\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5");
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  }, [currentUserId, targetUserIdFromQuery]);

  const loadMessages = useCallback(async (userId: number, targetUserId: number, silent = false) => {
    setMessageError(null);
    if (!silent) setLoadingMessages(true);

    try {
      const response = await fetch(
        `/api/chat/messages?userId=${userId}&targetUserId=${targetUserId}`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (!response.ok) {
        setMessageError(data?.error || "\u52a0\u8f7d\u6d88\u606f\u5931\u8d25");
        if (!silent) setMessages([]);
        return;
      }

      const list = Array.isArray(data.messages) ? (data.messages as ChatMessage[]) : [];
      setMessages(list);
    } catch {
      setMessageError("\u52a0\u8f7d\u6d88\u606f\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5");
      if (!silent) setMessages([]);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!currentUserId) {
      setError("\u7f3a\u5c11\u5408\u6cd5 userId\uff0c\u8bf7\u4ece\u5339\u914d\u9875\u8fdb\u5165");
      setLoadingContacts(false);
      return;
    }

    loadContacts();
  }, [currentUserId, loadContacts]);

  useEffect(() => {
    if (!currentUserId || !activeContactId) {
      setMessages([]);
      return;
    }

    loadMessages(currentUserId, activeContactId);

    const timer = window.setInterval(() => {
      loadMessages(currentUserId, activeContactId, true);
    }, 1500);

    return () => window.clearInterval(timer);
  }, [currentUserId, activeContactId, loadMessages]);

  useEffect(() => {
    if (!activeContactId) return;

    const timer = window.setTimeout(() => {
      scrollToBottom("auto");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeContactId, scrollToBottom]);

  const handleSwitchUser = (nextUserId: number) => {
    if (!currentUserId || nextUserId === currentUserId) return;

    const params = new URLSearchParams({ userId: String(nextUserId) });

    if (activeContactId) {
      params.set("targetUserId", String(currentUserId));
    }

    router.push(`/chat?${params.toString()}`);
  };

  const handleSwitchPerspective = () => {
    if (!currentUserId || !activeContactId) return;

    const params = new URLSearchParams({
      userId: String(activeContactId),
      targetUserId: String(currentUserId),
    });

    router.push(`/chat?${params.toString()}`);
  };

  const handleSend = async () => {
    if (!currentUserId || !activeContactId || !input.trim() || sending) return;

    const content = input.trim();
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessageError(data?.error || "\u53d1\u9001\u5931\u8d25");
        return;
      }

      const newMessage = data.message as ChatMessage;
      setMessages((prev) => [...prev, newMessage]);
      window.setTimeout(() => scrollToBottom("smooth"), 0);
      setContacts((prev) =>
        prev
          .map((contact) =>
            contact.id === activeContactId
              ? {
                  ...contact,
                  lastMessage: newMessage.content,
                  lastMessageAt: newMessage.createdAt,
                }
              : contact
          )
          .sort((a, b) => {
            const aTime = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
            const bTime = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
            if (aTime !== bTime) return bTime - aTime;
            return a.id - b.id;
          })
      );
      setInput("");
    } catch {
      setMessageError("\u53d1\u9001\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5");
    } finally {
      setSending(false);
    }
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-50 to-white p-4">
        <div className="mx-auto max-w-md rounded-3xl border border-rose-100 bg-white p-6 text-center shadow-xl">
          <h1 className="text-xl font-bold text-gray-900">{"\u7f3a\u5c11\u804a\u5929\u7528\u6237"}</h1>
          <p className="mt-2 text-sm text-gray-600">{"\u8bf7\u4ece\u5339\u914d\u9875\u70b9\u51fb\u201c\u53d1\u8d77\u6d88\u606f\u201d\u8fdb\u5165\u804a\u5929\u3002"}</p>
          <Button className="mt-4" onClick={() => router.push("/dev-channel-2")}>
            {"\u8fd4\u56de\u5339\u914d\u9875"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-50 to-white px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex items-center justify-between"
        >
          <Button variant="outline" size="sm" onClick={() => router.back()} className="bg-white">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {"\u8fd4\u56de"}
          </Button>
          <div className="text-right text-xs text-gray-600">
            <div>{"\u5f53\u524d\u7528\u6237\uff1a"}{currentUserName}</div>
            <div>ID: {currentUserId}</div>
          </div>
        </motion.div>

        <div className="mb-3 rounded-2xl border border-rose-100 bg-white/90 p-3 shadow-sm">
          <div className="mb-2 text-xs font-semibold text-rose-600">{"\u804a\u5929\u5bf9\u8c61"}</div>
          <div className="flex items-center gap-2">
            <select
              className="h-9 flex-1 rounded-lg border border-rose-100 bg-white px-2 text-sm outline-none focus:border-pink-300"
              value={String(currentUserId)}
              onChange={(event) => handleSwitchUser(Number(event.target.value))}
            >
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}\uff08ID:{user.id}\uff09
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-2xl">
          <div className="border-b border-rose-100 bg-gradient-to-r from-rose-100 to-pink-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {activeContact ? `\u548c ${activeContact.name} \u804a\u5929` : "\u804a\u5929"}
                </h1>
                <p className="text-xs text-gray-600">{"\u6d88\u606f\u4fdd\u5b58\u5728\u672c\u5730 SQLite\uff0c\u53ef\u76f4\u63a5\u804a\u5929"}</p>
              </div>
              <MessageCircle className="h-5 w-5 text-pink-600" />
            </div>
          </div>

          <div className="border-b border-rose-100 bg-rose-50/70 px-3 py-2">
            {loadingContacts ? (
              <div className="text-xs text-gray-500">{"\u6b63\u5728\u52a0\u8f7d\u8054\u7cfb\u4eba..."}</div>
            ) : contacts.length === 0 ? (
              <div className="text-xs text-gray-500">{"\u6682\u65e0\u8054\u7cfb\u4eba\uff0c\u53ef\u4ece\u5339\u914d\u9875\u53d1\u8d77\u7b2c\u4e00\u6761\u6d88\u606f\u3002"}</div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setActiveContactId(contact.id)}
                    className={`min-w-[130px] rounded-2xl px-3 py-2 text-left transition ${
                      activeContactId === contact.id
                        ? "bg-white text-pink-600 shadow"
                        : "bg-white/60 text-gray-700 hover:bg-white"
                    }`}
                  >
                    <div className="truncate text-sm font-semibold">{contact.name}</div>
                    <div className="truncate text-[11px] text-gray-500">
                      {contact.lastMessage || `${contact.university} | ${contact.age}\u5c81`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-[58vh] overflow-y-auto bg-[linear-gradient(180deg,#fff_0%,#fff6f9_100%)] px-3 py-4">
            {error && (
              <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            {messageError && (
              <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                {messageError}
              </div>
            )}

            {!activeContact ? (
              <div className="pt-10 text-center text-sm text-gray-500">{"\u9009\u62e9\u4e00\u4e2a\u8054\u7cfb\u4eba\u5f00\u59cb\u804a\u5929"}</div>
            ) : loadingMessages ? (
              <div className="pt-10 text-center text-sm text-gray-500">{"\u6b63\u5728\u540c\u6b65\u6d88\u606f..."}</div>
            ) : messages.length === 0 ? (
              <div className="pt-10 text-center text-sm text-gray-500">{"\u8fd8\u6ca1\u6709\u6d88\u606f\uff0c\u5148\u6253\u4e2a\u62db\u547c\u5427"}</div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const mine = message.senderId === currentUserId;
                  return (
                    <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[78%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                        <div
                          className={`rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                            mine
                              ? "rounded-br-md bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                              : "rounded-bl-md border border-rose-100 bg-white text-gray-800"
                          }`}
                        >
                          {message.content}
                        </div>
                        <div className="mt-1 text-[10px] text-gray-400">{formatTime(message.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
            )}
          </div>

          <div className="border-t border-rose-100 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={activeContact ? `\u7ed9 ${activeContact.name} \u53d1\u6d88\u606f...` : "\u8bf7\u5148\u9009\u62e9\u8054\u7cfb\u4eba"}
                className="min-h-[44px] max-h-28 flex-1 resize-none rounded-2xl border border-rose-100 bg-rose-50/60 px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-pink-300 focus:bg-white"
                disabled={!activeContact || sending}
              />
              <Button
                type="button"
                onClick={handleSend}
                disabled={!activeContact || !input.trim() || sending}
                className="h-11 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 text-white hover:from-pink-600 hover:to-rose-600"
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

