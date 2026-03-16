"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BellRing, Mail, MessageCircle, SendHorizonal, User } from "lucide-react";
import type { QuizMode } from "@/app/data/types";
import type { MatchConfirmationStatus } from "@/components/match/types";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ChatContact = {
  id: number;
  name: string;
  age: number;
  university: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  email?: string;
  ideal_date?: string;
  bio?: string;
  interests?: string | string[];
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

function formatTime(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function maskEmail(email: string | null) {
  if (!email) return "";
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return email;

  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex);
  if (localPart.length <= 3) return email;

  return `${localPart.slice(0, 3)}****${domainPart}`;
}

function formatInterests(interests: string | string[] | undefined) {
  if (Array.isArray(interests)) {
    return interests.filter((item) => item.trim()).join("、");
  }

  return interests?.trim() || "暂未填写";
}

function hasPendingReply(items: ChatMessage[], currentUserId: number, targetUserId: number | null) {
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

function buildEmptyConfirmationStatus(): MatchConfirmationStatus {
  return {
    selfConfirmed: false,
    otherConfirmed: false,
    canMessage: false,
  };
}

function getConfirmationCopy(status: MatchConfirmationStatus | null) {
  if (!status) {
    return {
      title: "同步点亮状态中",
      description: "正在加载这组双向推荐的点亮状态。",
      actionLabel: "加载中",
      actionDisabled: true,
    };
  }

  if (status.canMessage) {
    return {
      title: "双方都已点亮",
      description: "你们已经互相明确表达意愿，可以继续推进聊天。",
      actionLabel: "已互相点亮",
      actionDisabled: true,
    };
  }

  if (status.selfConfirmed) {
    return {
      title: "你已点亮对方",
      description: "对方回复前，你仍然可以先发一条消息。",
      actionLabel: "取消点亮",
      actionDisabled: false,
    };
  }

  if (status.otherConfirmed) {
    return {
      title: "对方已点亮你",
      description: "如果你也愿意，可以回点对方；也可以先发一条消息。",
      actionLabel: "回点对方",
      actionDisabled: false,
    };
  }

  return {
    title: "双向推荐已建立",
    description: "你可以先发一条消息，也可以先点亮对方。",
    actionLabel: "点亮 TA",
    actionDisabled: false,
  };
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentUserId = useMemo(() => toPositiveInt(searchParams.get("userId")), [searchParams]);
  const targetUserIdFromQuery = useMemo(() => toPositiveInt(searchParams.get("targetUserId")), [searchParams]);
  const mode = useMemo<QuizMode>(
    () => (searchParams.get("mode") === "friendship" ? "friendship" : "romance"),
    [searchParams]
  );

  const theme = mode === "friendship"
    ? {
        pageBg: "bg-gradient-to-b from-sky-100 via-cyan-50 to-white",
        panelBorder: "border-sky-100",
        panelBg: "bg-gradient-to-r from-sky-100 to-cyan-100",
        badgeBg: "bg-sky-50/80",
        badgeText: "text-sky-600",
        accentButton: "bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600",
        myBubble: "bg-gradient-to-r from-sky-500 to-cyan-500 text-white",
        profileIcon: "text-sky-600",
        mutedBg: "bg-sky-50/60",
      }
    : {
        pageBg: "bg-gradient-to-b from-rose-100 via-pink-50 to-white",
        panelBorder: "border-rose-100",
        panelBg: "bg-gradient-to-r from-rose-100 to-pink-100",
        badgeBg: "bg-rose-50/80",
        badgeText: "text-pink-600",
        accentButton: "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600",
        myBubble: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
        profileIcon: "text-pink-600",
        mutedBg: "bg-rose-50/60",
      };

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContactId, setActiveContactId] = useState<number | null>(targetUserIdFromQuery);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [checkingEmailAccess, setCheckingEmailAccess] = useState(false);
  const [emailUnlocked, setEmailUnlocked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [wechatConnected, setWechatConnected] = useState(false);
  const [wechatNoticeOptIn, setWechatNoticeOptIn] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<MatchConfirmationStatus | null>(null);
  const [loadingConfirmationStatus, setLoadingConfirmationStatus] = useState(false);
  const [updatingConfirmationStatus, setUpdatingConfirmationStatus] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastMessageIdRef = useRef<number | null>(null);

  const activeContact = useMemo(
    () => contacts.find((item) => item.id === activeContactId) ?? null,
    [activeContactId, contacts]
  );
  const waitingForReply = useMemo(
    () => (currentUserId ? hasPendingReply(messages, currentUserId, activeContactId) : false),
    [activeContactId, currentUserId, messages]
  );
  const confirmationCopy = useMemo(
    () => getConfirmationCopy(confirmationStatus),
    [confirmationStatus]
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const isNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;

    const remaining = container.scrollHeight - container.scrollTop - container.clientHeight;
    return remaining <= 96;
  }, []);

  const loadContacts = useCallback(async () => {
    if (!currentUserId) return;

    setLoadingContacts(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/contacts?userId=${currentUserId}&mode=${mode}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        setContacts([]);
        setError(data?.error || "加载聊天联系人失败");
        return;
      }

      const nextContacts = Array.isArray(data.contacts) ? (data.contacts as ChatContact[]) : [];
      setContacts(nextContacts);
      setWechatConnected(Boolean(data?.currentUser?.wechatConnected));
      setWechatNoticeOptIn(Boolean(data?.currentUser?.wechatNoticeOptIn));

      setActiveContactId((current) => {
        if (current && nextContacts.some((item) => item.id === current)) {
          return current;
        }

        if (targetUserIdFromQuery && nextContacts.some((item) => item.id === targetUserIdFromQuery)) {
          return targetUserIdFromQuery;
        }

        return nextContacts[0]?.id ?? null;
      });
    } catch {
      setContacts([]);
      setWechatConnected(false);
      setWechatNoticeOptIn(false);
      setError("加载聊天联系人失败，请稍后重试");
    } finally {
      setLoadingContacts(false);
    }
  }, [currentUserId, mode, targetUserIdFromQuery]);

  const loadMessages = useCallback(
    async (userId: number, targetUserId: number, silent = false) => {
      if (!silent) setLoadingMessages(true);
      setMessageError(null);

      try {
        const response = await fetch(
          `/api/chat/messages?userId=${userId}&targetUserId=${targetUserId}&mode=${mode}`,
          { cache: "no-store" }
        );
        const data = await response.json();

        if (!response.ok) {
          if (!silent) setMessages([]);
          setMessageError(data?.error || "加载消息失败");
          return;
        }

        const nextMessages = Array.isArray(data.messages) ? (data.messages as ChatMessage[]) : [];
        setMessages(nextMessages);
      } catch {
        if (!silent) setMessages([]);
        setMessageError("加载消息失败，请稍后重试");
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [mode]
  );

  useEffect(() => {
    if (!currentUserId) {
      setLoadingContacts(false);
      setError("缺少合法的 userId，请从匹配页进入聊天");
      return;
    }

    void loadContacts();
  }, [currentUserId, loadContacts]);

  useEffect(() => {
    if (!currentUserId || !activeContactId) {
      setMessages([]);
      return;
    }

    void loadMessages(currentUserId, activeContactId);

    const timer = window.setInterval(() => {
      void loadMessages(currentUserId, activeContactId, true);
    }, 1500);

    return () => window.clearInterval(timer);
  }, [activeContactId, currentUserId, loadMessages]);

  useEffect(() => {
    if (!currentUserId || !activeContactId) {
      setConfirmationStatus(null);
      setLoadingConfirmationStatus(false);
      return;
    }

    const controller = new AbortController();
    setLoadingConfirmationStatus(true);

    fetch(
      `/api/match-confirmations?userId=${currentUserId}&targetUserIds=${encodeURIComponent(String(activeContactId))}&mode=${mode}`,
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

        const nextStatus = (data?.statuses?.[String(activeContactId)] as MatchConfirmationStatus | undefined) ?? null;
        setConfirmationStatus(nextStatus);
      })
      .catch((fetchError) => {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        console.error("Failed to load chat confirmation status:", fetchError);
        setConfirmationStatus(null);
      })
      .finally(() => {
        setLoadingConfirmationStatus(false);
      });

    return () => controller.abort();
  }, [activeContactId, currentUserId, mode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      scrollToBottom("smooth");
    }, 100);

    return () => window.clearTimeout(timer);
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    setToastMessage(null);
    lastMessageIdRef.current = null;
  }, [activeContactId]);

  useEffect(() => {
    if (!messages.length) {
      lastMessageIdRef.current = null;
      return;
    }

    const latestMessage = messages[messages.length - 1];

    if (lastMessageIdRef.current === null) {
      lastMessageIdRef.current = latestMessage.id;
      return;
    }

    if (latestMessage.id === lastMessageIdRef.current) {
      return;
    }

    lastMessageIdRef.current = latestMessage.id;

    if (!currentUserId || latestMessage.senderId === currentUserId || typeof document === "undefined") {
      return;
    }

    if (document.visibilityState !== "visible") {
      return;
    }

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(200);
    }

    if (isNearBottom()) {
      window.setTimeout(() => scrollToBottom("smooth"), 0);
      return;
    }

    setToastMessage(`收到 ${activeContact?.name ?? "对方"} 的新消息`);
  }, [activeContact?.name, currentUserId, isNearBottom, messages, scrollToBottom]);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const openProfile = async (contact: ChatContact) => {
    setSelectedContact(contact);
    setProfileOpen(true);
    setEmailUnlocked(false);

    if (!currentUserId) return;

    setCheckingEmailAccess(true);
    try {
      const response = await fetch(
        `/api/chat/messages?userId=${currentUserId}&targetUserId=${contact.id}&mode=${mode}`,
        { cache: "no-store" }
      );
      const data = await response.json();
      const chatMessages: Array<{ senderId: number }> = Array.isArray(data.messages) ? data.messages : [];
      const sentByCurrentUser = chatMessages.some((message) => message.senderId === currentUserId);
      const sentByTargetUser = chatMessages.some((message) => message.senderId === contact.id);
      setEmailUnlocked(sentByCurrentUser && sentByTargetUser);
    } catch {
      setEmailUnlocked(false);
    } finally {
      setCheckingEmailAccess(false);
    }
  };

  const toggleConfirmation = async () => {
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
        throw new Error(data?.error || "更新点亮状态失败");
      }

      setConfirmationStatus((data?.status as MatchConfirmationStatus | undefined) ?? currentStatus);
    } catch (toggleError) {
      console.error("Failed to update chat confirmation status:", toggleError);
      setMessageError(toggleError instanceof Error ? toggleError.message : "更新点亮状态失败");
    } finally {
      setUpdatingConfirmationStatus(false);
    }
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
          mode,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessageError(data?.error || "发送失败");
        return;
      }

      const newMessage = data.message as ChatMessage;
      setMessages((current) => [...current, newMessage]);
      setContacts((current) =>
        current
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
      window.setTimeout(() => scrollToBottom("smooth"), 0);
    } catch {
      setMessageError("发送失败，请稍后重试");
    } finally {
      setSending(false);
    }
  };

  if (!currentUserId) {
    return (
      <div className={`min-h-screen ${theme.pageBg} p-4`}>
        <div className={`mx-auto max-w-md rounded-3xl border ${theme.panelBorder} bg-white p-6 text-center shadow-xl`}>
          <h1 className="text-xl font-bold text-gray-900">缺少聊天用户</h1>
          <p className="mt-2 text-sm text-gray-600">请从匹配结果页点击“开始聊天”进入。</p>
          <Button
            className={`mt-4 text-white ${theme.accentButton}`}
            onClick={() => router.push(mode === "friendship" ? "/dev-channel-2?mode=friendship" : "/dev-channel-2")}
          >
            返回匹配页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`fixed inset-0 ${theme.pageBg} px-3 py-6 sm:px-4`}>
        <BackButton />
        <div className="mx-auto flex h-full max-w-md flex-col">
          <div className={`flex flex-1 flex-col overflow-hidden rounded-[28px] border ${theme.panelBorder} bg-white shadow-2xl`}>
            <div className={`border-b ${theme.panelBorder} ${theme.panelBg} px-4 py-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {activeContact ? `和 ${activeContact.name} 聊天` : mode === "friendship" ? "朋友聊天" : "匹配聊天"}
                  </h1>
                  <p className={`mt-1 text-xs ${theme.badgeText}`}>
                    {mode === "friendship" ? "朋友双向推荐通道" : "恋爱双向推荐通道"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => activeContact && void openProfile(activeContact)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/85 shadow-sm transition hover:scale-105 ${theme.profileIcon}`}
                  aria-label="查看资料"
                  disabled={!activeContact}
                >
                  <User className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className={`border-b ${theme.panelBorder} ${theme.badgeBg} px-3 py-2`}>
              {!wechatConnected || !wechatNoticeOptIn ? (
                <button
                  type="button"
                  onClick={() => router.push(`/wechat/connect?userId=${currentUserId}&mode=${mode}`)}
                  className={`mb-2 flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-xs font-medium text-gray-700 shadow-sm transition hover:scale-[1.01] ${theme.panelBorder} bg-white/90`}
                >
                  <span className="flex items-center gap-2">
                    <BellRing className={`h-4 w-4 ${theme.profileIcon}`} />
                    <span>点此关注，开启消息提醒</span>
                  </span>
                  <span className={`${theme.badgeText}`}>去设置</span>
                </button>
              ) : (
                <div className="mb-2 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  <BellRing className="h-4 w-4" />
                  <span>公众号消息提醒已开启</span>
                </div>
              )}
              {loadingContacts ? (
                <div className="text-xs text-gray-500">正在加载联系人...</div>
              ) : contacts.length === 0 ? (
                <div className="text-xs text-gray-500">暂无联系人，当前只显示本轮双向推荐或已有对话对象。</div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => setActiveContactId(contact.id)}
                      className={`min-w-[140px] rounded-2xl px-3 py-2 text-left transition ${
                        activeContactId === contact.id
                          ? "bg-white text-gray-900 shadow"
                          : "bg-white/70 text-gray-700 hover:bg-white"
                      }`}
                    >
                      <div className="truncate text-sm font-semibold">{contact.name}</div>
                      <div className="truncate text-[11px] text-gray-500">
                        {contact.lastMessage || `${contact.university} | ${contact.age}岁`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              ref={scrollContainerRef}
              onScroll={() => {
                if (toastMessage && isNearBottom()) {
                  setToastMessage(null);
                }
              }}
              className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fff_0%,#fef7fb_100%)] px-3 py-4"
            >
              {error ? (
                <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </div>
              ) : null}

              {messageError ? (
                <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {messageError}
                </div>
              ) : null}

              {activeContact ? (
                <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  <div className="font-semibold text-emerald-800">
                    {loadingConfirmationStatus ? "同步点亮状态中" : confirmationCopy.title}
                  </div>
                  <div className="mt-1">{confirmationCopy.description}</div>
                </div>
              ) : null}

              {activeContact && waitingForReply ? (
                <div className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-700">
                  你们已进入双向推荐；在对方回复前，你暂时只能先发送一条消息。
                </div>
              ) : null}

              {!activeContact ? (
                <div className="pt-10 text-center text-sm text-gray-500">选择一个联系人开始聊天。</div>
              ) : loadingMessages ? (
                <div className="pt-10 text-center text-sm text-gray-500">正在同步消息...</div>
              ) : messages.length === 0 ? (
                <div className="pt-10 text-center text-sm text-gray-500">还没有消息，先打个招呼吧。</div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const mine = message.senderId === currentUserId;

                    return (
                      <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`flex max-w-[78%] flex-col ${mine ? "items-end" : "items-start"}`}>
                          <div
                            className={`rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                              mine
                                ? `${theme.myBubble} rounded-br-md`
                                : `rounded-bl-md border ${theme.panelBorder} bg-white text-gray-800`
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

            <div className={`border-t ${theme.panelBorder} bg-white px-3 py-2`}>
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder={activeContact ? `给 ${activeContact.name} 发消息...` : "请先选择联系人"}
                  className={`min-h-[40px] max-h-32 flex-1 resize-none rounded-2xl border ${theme.panelBorder} ${theme.mutedBg} px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:bg-white overflow-y-auto`}
                  disabled={!activeContact || sending || waitingForReply}
                />
                <Button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={!activeContact || !input.trim() || sending || waitingForReply}
                  className={`h-10 rounded-2xl px-3 text-white ${theme.accentButton}`}
                >
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {toastMessage ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-20 z-30 flex justify-center px-4">
            <button
              type="button"
              onClick={() => {
                setToastMessage(null);
                scrollToBottom("smooth");
              }}
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/70 bg-gray-900/92 px-4 py-3 text-sm font-medium text-white shadow-xl backdrop-blur"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{toastMessage}</span>
              <span className="text-xs text-white/70">点击查看</span>
            </button>
          </div>
        ) : null}
      </div>

      <Dialog
        open={profileOpen}
        onOpenChange={(open) => {
          setProfileOpen(open);
          if (!open) {
            setCheckingEmailAccess(false);
            setEmailUnlocked(false);
          }
        }}
      >
        <DialogContent className="border-white/70 bg-white/95 p-0 shadow-2xl sm:max-w-lg">
          <DialogHeader className={`border-b ${theme.panelBorder} ${theme.panelBg} px-6 py-5 text-left`}>
            <DialogTitle className="text-2xl font-extrabold text-gray-900">{selectedContact?.name ?? "对方"}的资料</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {mode === "friendship" ? "看看你们的兴趣和相处方式是否同频。" : "看看对方的档案和理想约会风格。"}
            </DialogDescription>
          </DialogHeader>

          {selectedContact ? (
            <div className="space-y-4 px-6 py-5 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="text-gray-500">年龄</div>
                  <div className="font-semibold text-gray-900">{selectedContact.age} 岁</div>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="text-gray-500">学校</div>
                  <div className="font-semibold text-gray-900">{selectedContact.university}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-1 text-gray-500">自我介绍</div>
                <div className="leading-relaxed text-gray-800">{selectedContact.bio || "暂未填写"}</div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-1 text-gray-500">兴趣爱好</div>
                <div className="leading-relaxed text-gray-800">{formatInterests(selectedContact.interests)}</div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-1 text-gray-500">{mode === "friendship" ? "理想相处方式" : "理想约会"}</div>
                <div className="leading-relaxed text-gray-800">{selectedContact.ideal_date || "暂未填写"}</div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="text-sm font-semibold text-emerald-800">
                  {loadingConfirmationStatus ? "同步点亮状态中" : confirmationCopy.title}
                </div>
                <div className="mt-1 text-xs leading-relaxed text-emerald-700">{confirmationCopy.description}</div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className={`h-4 w-4 ${theme.profileIcon}`} />
                  <span className="font-medium">邮箱</span>
                </div>
                <div className="mt-2 break-all text-sm text-gray-600">
                  {checkingEmailAccess ? (
                    "正在检查解锁条件..."
                  ) : emailUnlocked ? (
                    maskEmail(selectedContact.email ?? null)
                  ) : (
                    <div className="space-y-1">
                      <div>双方都发送过消息后，这里才会显示邮箱。</div>
                      <div className="text-xs text-gray-400">邮箱仅用于登录验证，默认不会直接公开。</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
                <Button variant="outline" onClick={() => setProfileOpen(false)} className="h-11 rounded-xl">
                  关闭
                </Button>
                <Button
                  type="button"
                  variant={confirmationCopy.actionDisabled ? "outline" : "default"}
                  onClick={() => void toggleConfirmation()}
                  disabled={confirmationCopy.actionDisabled || loadingConfirmationStatus || updatingConfirmationStatus}
                  className={
                    confirmationCopy.actionDisabled
                      ? "h-11 rounded-xl border-emerald-200 bg-white text-emerald-600"
                      : "h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                  }
                >
                  {updatingConfirmationStatus ? "处理中..." : confirmationCopy.actionLabel}
                </Button>
                <Button
                  onClick={() => {
                    if (!currentUserId || !selectedContact) return;
                    router.push(`/chat?userId=${currentUserId}&targetUserId=${selectedContact.id}&mode=${mode}`);
                  }}
                  className={`h-11 rounded-xl text-white ${theme.accentButton}`}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  继续聊天
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
