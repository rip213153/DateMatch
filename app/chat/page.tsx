"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, SendHorizonal, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BackButton } from "@/components/ui/back-button";

type UserSummary = {
  id: number;
  name: string;
  age: number;
  university: string;
  email?: string;
  ideal_date?: string;
  bio?: string;
  interests?: string | string[];
};

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

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function maskEmail(email: string | null): string {
  if (!email) return "";
  if (email.length < 8) return email;
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return email;
  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex);
  if (localPart.length < 4) return email;
  const masked = localPart.substring(0, 3) + "****" + localPart.substring(3, atIndex);
  return masked + domainPart;
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentUserId = useMemo(() => toPositiveInt(searchParams.get("userId")), [searchParams]);
  const targetUserIdFromQuery = useMemo(() => toPositiveInt(searchParams.get("targetUserId")), [searchParams]);

  const [availableUsers, setAvailableUsers] = useState<UserSummary[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const[activeContactId, setActiveContactId] = useState<number | null>(targetUserIdFromQuery);
  const[messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const[error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedMatchUser, setSelectedMatchUser] = useState<UserSummary | null>(null);
  const [checkingEmailAccess, setCheckingEmailAccess] = useState(false);
  const [emailUnlocked, setEmailUnlocked] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  },[]);

  const activeContact = useMemo(
    () => contacts.find((item) => item.id === activeContactId) ?? null,
    [contacts, activeContactId]
  );

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) return;
      setAvailableUsers(Array.isArray(data.users) ? (data.users as UserSummary[]) :[]);
    } catch {
      // Ignore user list loading errors in chat page.
    }
  },[]);

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
        setError(data?.error || "加载联系人失败");
        setContacts([]);
        return;
      }

      const contactList = Array.isArray(data.contacts) ? (data.contacts as ChatContact[]) :[];
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
      setError("加载联系人失败，请稍后重试");
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
        setMessageError(data?.error || "加载消息失败");
        if (!silent) setMessages([]);
        return;
      }

      const list = Array.isArray(data.messages) ? (data.messages as ChatMessage[]) :[];
      setMessages(list);
    } catch {
      setMessageError("加载消息失败，请稍后重试");
      if (!silent) setMessages([]);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  },[]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!currentUserId) {
      setError("缺少合法 userId，请从匹配页进入");
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

    // 【优化】改为轮询时不影响用户输入
    const timer = window.setInterval(() => {
      loadMessages(currentUserId, activeContactId, true);
    }, 1500);

    return () => window.clearInterval(timer);
  }, [currentUserId, activeContactId, loadMessages]);

  // 【修复】监听 messages 长度变化，收到新消息时也能自动滚动
  useEffect(() => {
    const timer = window.setTimeout(() => {
      scrollToBottom("smooth");
    }, 100);
    return () => window.clearTimeout(timer);
  }, [messages.length, scrollToBottom]);

  const handleSwitchUser = (nextUserId: number) => {
    if (!currentUserId || nextUserId === currentUserId) return;

    const params = new URLSearchParams({ userId: String(nextUserId) });

    if (activeContactId) {
      params.set("targetUserId", String(currentUserId));
    }

    router.push(`/chat?${params.toString()}`);
  };

  const openProfile = async (targetUser: UserSummary) => {
    setSelectedMatchUser(targetUser);
    setProfileOpen(true);
    setEmailUnlocked(false);

    if (!currentUserId) return;

    setCheckingEmailAccess(true);
    try {
      const response = await fetch(`/api/chat/messages?userId=${currentUserId}&targetUserId=${targetUser.id}`, {
        cache: "no-store",
      });
      const data = await response.json();
      const chatMessages: Array<{ senderId: number }> = Array.isArray(data.messages) ? data.messages : [];
      const sentByCurrentUser = chatMessages.some((message) => message.senderId === currentUserId);
      const sentByTargetUser = chatMessages.some((message) => message.senderId === targetUser.id);
      setEmailUnlocked(sentByCurrentUser && sentByTargetUser);
    } catch {
      setEmailUnlocked(false);
    } finally {
      setCheckingEmailAccess(false);
    }
  };

  const startChat = (targetUserId: number) => {
    if (!currentUserId) return;
    router.push(`/chat?userId=${currentUserId}&targetUserId=${targetUserId}`);
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
        setMessageError(data?.error || "发送失败");
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
      setMessageError("发送失败，请稍后重试");
    } finally {
      setSending(false);
    }
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-50 to-white p-4">
        <div className="mx-auto max-w-md rounded-3xl border border-rose-100 bg-white p-6 text-center shadow-xl">
          <h1 className="text-xl font-bold text-gray-900">{"缺少聊天用户"}</h1>
          <p className="mt-2 text-sm text-gray-600">{"请从匹配页点击“发起消息”进入聊天。"}</p>
          <Button className="mt-4" onClick={() => router.push("/dev-channel-2")}>
            {"返回匹配页"}
          </Button>
        </div>
      </div>
    );
  }

  const targetUser = activeContact
    ? {
        id: activeContact.id,
        name: activeContact.name,
        age: activeContact.age,
        university: activeContact.university,
      }
    : null;

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-rose-100 via-pink-50 to-white px-3 py-6 sm:px-4 sm:py-6">
        <BackButton />
        <div className="mx-auto max-w-md h-full flex flex-col">
          <div className="flex-1 flex flex-col overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-2xl">
            <div className="border-b border-rose-100 bg-gradient-to-r from-rose-100 to-pink-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {activeContact ? `和 ${activeContact.name} 聊天` : "聊天"}
                  </h1>
                  <p className="text-xs text-gray-600">{"消息保存在本地 SQLite，可直接聊天"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (activeContact) {
                      openProfile({
                        id: activeContact.id,
                        name: activeContact.name,
                        age: activeContact.age,
                        university: activeContact.university,
                        email: activeContact.email,
                        ideal_date: activeContact.ideal_date,
                        bio: activeContact.bio,
                        interests: activeContact.interests,
                      });
                    }
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-pink-600 shadow-sm transition hover:bg-white hover:scale-110 active:scale-95"
                  aria-label="查看资料"
                >
                  <User className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="border-b border-rose-100 bg-rose-50/70 px-3 py-2">
              {loadingContacts ? (
                <div className="text-xs text-gray-500">{"正在加载联系人..."}</div>
              ) : contacts.length === 0 ? (
                <div className="text-xs text-gray-500">{"暂无联系人，可从匹配页发起第一条消息。"}</div>
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
                        {contact.lastMessage || `${contact.university} | ${contact.age}岁`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fff_0%,#fff6f9_100%)] px-3 py-4">
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
                <div className="pt-10 text-center text-sm text-gray-500">{"选择一个联系人开始聊天"}</div>
              ) : loadingMessages ? (
                <div className="pt-10 text-center text-sm text-gray-500">{"正在同步消息..."}</div>
              ) : messages.length === 0 ? (
                <div className="pt-10 text-center text-sm text-gray-500">{"还没有消息，先打个招呼吧"}</div>
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

            <div className="border-t border-rose-100 bg-white px-3 py-2">
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
                  placeholder={activeContact ? `给 ${activeContact.name} 发消息...` : "请先选择联系人"}
                  className="min-h-[40px] max-h-32 flex-1 resize-none rounded-2xl border border-rose-100 bg-rose-50/60 px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-pink-300 focus:bg-white overflow-y-auto"
                  disabled={!activeContact || sending}
                />
                <Button
                  type="button"
                  onClick={handleSend}
                  disabled={!activeContact || !input.trim() || sending}
                  className="h-10 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 px-3 text-white hover:from-pink-600 hover:to-rose-600"
                >
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={profileOpen} onOpenChange={(open) => {
        setProfileOpen(open);
        if (!open) {
          setCheckingEmailAccess(false);
          setEmailUnlocked(false);
        }
      }}>
        <DialogContent className="border-white/70 bg-white/95 p-0 shadow-2xl sm:max-w-lg">
          <DialogHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5 text-left">
            <DialogTitle className="text-2xl font-extrabold text-gray-900">{selectedMatchUser?.name ?? "对方"}的资料</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">查看资料，了解更多关于Ta的信息。</DialogDescription>
          </DialogHeader>

          {selectedMatchUser ? (
            <div className="space-y-4 px-6 py-5 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gray-50 p-4"><div className="text-gray-500">年龄</div><div className="font-semibold text-gray-900">{selectedMatchUser.age} 岁</div></div>
                <div className="rounded-2xl bg-gray-50 p-4"><div className="text-gray-500">学校</div><div className="font-semibold text-gray-900">{selectedMatchUser.university}</div></div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-1 text-gray-500">自我介绍</div>
                <div className="leading-relaxed text-gray-800">{selectedMatchUser.bio || "该用户暂未填写自我介绍"}</div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-1 text-gray-500">兴趣爱好</div>
                <div className="leading-relaxed text-gray-800">{selectedMatchUser.interests ? (Array.isArray(selectedMatchUser.interests) ? selectedMatchUser.interests.join("、") : selectedMatchUser.interests) : "暂未填写"}</div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-1 text-gray-500">理想约会</div>
                <div className="leading-relaxed text-gray-800">{selectedMatchUser.ideal_date || "暂未填写"}</div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-700"><Mail className="h-4 w-4 text-pink-500" /><span className="font-medium">邮箱</span></div>
                <div className="mt-2 break-all text-sm text-gray-600">
                  {checkingEmailAccess ? (
                    "正在检查解锁条件..."
                  ) : emailUnlocked ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">•</span> {maskEmail(selectedMatchUser.email ?? null)}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500">•</span> 双方都发送过消息后，这里才会显示邮箱
                      <span className="text-xs text-gray-400">邮箱仅用于登录验证，保护您的隐私</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-1">
                <Button variant="outline" onClick={() => setProfileOpen(false)} className="h-11 rounded-xl w-full">关闭</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}