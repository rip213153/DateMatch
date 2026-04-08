"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BellRing, Mail, MessageCircle, SendHorizonal, User } from "lucide-react";
import type { QuizMode } from "@/app/data/types";
import type { MatchConfirmationStatus } from "@/components/match/types";
import { deriveChatViewState } from "@/lib/chat-page-state";
import { type ChatContact, useChatContacts } from "@/lib/use-chat-contacts";
import { useChatConfirmationStatus } from "@/lib/use-chat-confirmation-status";
import { hasMutualMessages, hasPendingReply, useChatMessages } from "@/lib/use-chat-messages";
import { IdealPreferenceDisplay } from "@/components/profile/IdealPreferenceDisplay";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    const normalized = interests.map((item) => item.trim()).filter(Boolean);
    return normalized.length > 0 ? normalized.join("、") : "暂未填写";
  }

  if (typeof interests === "string") {
    const normalized = interests
      .split(/[\n,，、/]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    return normalized.length > 0 ? normalized.join("、") : "暂未填写";
  }

  return "暂未填写";
}

function getConfirmationCopy(status: MatchConfirmationStatus | null) {
  if (!status) {
    return {
      title: "确认状态加载中",
      description: "稍等一下，正在同步你们的双向确认状态。",
      actionLabel: "加载中",
      actionDisabled: true,
    };
  }

  if (status.canMessage) {
    return {
      title: "已互相确认",
      description: "你们已经完成双向确认，可以继续自然聊下去。",
      actionLabel: "已互相确认",
      actionDisabled: true,
    };
  }

  if (status.selfConfirmed) {
    return {
      title: "你已向对方表达心意",
      description: "你已经表达过兴趣，现在等待对方回应。",
      actionLabel: "取消确认",
      actionDisabled: false,
    };
  }

  if (status.otherConfirmed) {
    return {
      title: "对方已表达心意",
      description: "对方已经表达兴趣，你可以决定是否回应确认。",
      actionLabel: "回应确认",
      actionDisabled: false,
    };
  }

  return {
    title: "可以先点亮一下",
    description: "点亮后，对方会知道你愿意继续了解。",
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
    [searchParams],
  );

  const theme =
    mode === "friendship"
      ? {
          pageBg: "bg-gradient-to-b from-sky-100 via-cyan-50 to-white",
          panelBorder: "border-sky-100",
          panelBg: "bg-gradient-to-r from-sky-100 to-cyan-100",
          badgeBg: "bg-sky-50/80",
          badgeText: "text-sky-600",
          accentButton: "bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600",
          myBubble: "bg-gradient-to-r from-sky-500 to-cyan-500 text-white",
          profileIcon: "text-sky-600",
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
        };

  const [input, setInput] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [checkingEmailAccess, setCheckingEmailAccess] = useState(false);
  const [emailUnlocked, setEmailUnlocked] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(() => (typeof document === "undefined" ? true : !document.hidden));
  const [isWindowFocused, setIsWindowFocused] = useState(() => (typeof document === "undefined" ? true : document.hasFocus()));

  const endRef = useRef<HTMLDivElement | null>(null);
  const {
    contacts,
    activeContactId,
    setActiveContactId,
    loadingContacts,
    error,
    updateContactWithLatestMessage,
  } = useChatContacts({
    currentUserId,
    mode,
    targetUserIdFromQuery,
  });
  const activeContact = useMemo(
    () => contacts.find((item) => item.id === activeContactId) ?? null,
    [activeContactId, contacts],
  );
  const {
    messages,
    loadingMessages,
    sending,
    messageError,
    setMessageError,
    sendMessage,
    getCachedMessages,
    isCachedConversationFresh,
    ensureConversationLoaded,
  } = useChatMessages({
    currentUserId,
    activeContactId,
    mode,
    isPageVisible,
    isWindowFocused,
    onLatestMessage: updateContactWithLatestMessage,
  });
  const waitingForReply = useMemo(
    () => (currentUserId ? hasPendingReply(messages, currentUserId, activeContactId) : false),
    [activeContactId, currentUserId, messages],
  );
  const {
    confirmationStatus,
    loadingConfirmationStatus,
    updatingConfirmationStatus,
    toggleConfirmation,
  } = useChatConfirmationStatus({
    currentUserId,
    activeContactId,
    mode,
    onError: setMessageError,
  });
  const confirmationCopy = useMemo(() => getConfirmationCopy(confirmationStatus), [confirmationStatus]);
  const {
    showMessageSwitchOverlay,
    showInitialMessageLoading,
    confirmationDescription,
    confirmationActionLabel,
    confirmationActionDisabled,
  } = useMemo(
    () =>
      deriveChatViewState({
        loadingMessages,
        messageCount: messages.length,
        loadingConfirmationStatus,
        updatingConfirmationStatus,
        confirmationCopy,
      }),
    [confirmationCopy, loadingConfirmationStatus, loadingMessages, messages.length, updatingConfirmationStatus],
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => setIsPageVisible(!document.hidden);
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      scrollToBottom("smooth");
    }, 100);

    return () => window.clearTimeout(timer);
  }, [activeContactId, messages.length, scrollToBottom]);

  const openProfile = async (contact: ChatContact) => {
    setSelectedContact(contact);
    setProfileOpen(true);
    setCheckingEmailAccess(false);

    if (!currentUserId) return;

    const cachedMessages = getCachedMessages(contact.id);

    if (cachedMessages) {
      setEmailUnlocked(hasMutualMessages(cachedMessages, currentUserId, contact.id));
    } else {
      setEmailUnlocked(false);
    }

    if (contact.id === activeContactId || isCachedConversationFresh(contact.id)) {
      return;
    }

    setCheckingEmailAccess(true);
    try {
      const nextMessages = await ensureConversationLoaded(contact.id, {
        useCachedFirst: true,
        forceRefresh: true,
      });
      if (nextMessages) {
        setEmailUnlocked(hasMutualMessages(nextMessages, currentUserId, contact.id));
      }
    } catch {
      if (!cachedMessages) {
        setEmailUnlocked(false);
      }
    } finally {
      setCheckingEmailAccess(false);
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;

    const success = await sendMessage(content);
    if (success) {
      setInput("");
      window.setTimeout(() => scrollToBottom("smooth"), 0);
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
      <div className={`min-h-screen ${theme.pageBg} px-3 py-6 sm:px-4`}>
        <BackButton />
        <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row">
          <div className={`w-full rounded-[28px] border ${theme.panelBorder} bg-white shadow-2xl lg:w-[320px]`}>
            <div className={`border-b ${theme.panelBorder} ${theme.panelBg} px-4 py-4`}>
              <h1 className="text-lg font-bold text-gray-900">{mode === "friendship" ? "搭子聊天" : "匹配聊天"}</h1>
              <p className={`mt-1 text-xs ${theme.badgeText}`}>{mode === "friendship" ? "和同频搭子继续了解" : "和匹配对象继续了解"}</p>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-3 py-3">
              {loadingContacts ? (
                <div className="px-3 py-8 text-center text-sm text-gray-500">正在加载联系人...</div>
              ) : error ? (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              ) : contacts.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-gray-500">当前还没有可聊天的联系人。</div>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => {
                    const isActive = contact.id === activeContactId;
                    return (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => setActiveContactId(contact.id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? `${theme.panelBorder} ${theme.badgeBg}`
                            : "border-transparent bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-gray-900">{contact.name}</div>
                            <div className="mt-1 text-xs text-gray-500">{contact.university}</div>
                          </div>
                          <div className="text-right text-[11px] text-gray-400">{formatTime(contact.lastMessageAt)}</div>
                        </div>
                        <div className="mt-2 line-clamp-1 text-xs text-gray-500">
                          {contact.lastMessage || "还没有消息，发一句打个招呼吧。"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={`flex min-h-[72vh] flex-1 flex-col overflow-hidden rounded-[28px] border ${theme.panelBorder} bg-white shadow-2xl`}>
            <div className={`border-b ${theme.panelBorder} ${theme.panelBg} px-4 py-4`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {activeContact ? `${activeContact.name} · ${activeContact.age}岁` : "请选择联系人"}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">{activeContact ? activeContact.university : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  {waitingForReply ? (
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${theme.badgeBg} ${theme.badgeText}`}>
                      等待对方回复
                    </span>
                  ) : null}
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
            </div>

            {activeContact ? (
              <>
                <div className="border-b border-dashed border-gray-200 px-4 py-3">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                          <BellRing className="h-4 w-4" />
                          {loadingConfirmationStatus ? "正在同步确认状态" : confirmationCopy.title}
                        </div>
                        <div className="mt-1 text-xs leading-relaxed text-emerald-700">{confirmationDescription}</div>
                      </div>
                      <Button
                        type="button"
                        variant={confirmationActionDisabled ? "outline" : "default"}
                        disabled={confirmationActionDisabled}
                        onClick={() => void toggleConfirmation()}
                        className={
                          confirmationActionDisabled
                            ? "border-emerald-200 bg-white text-emerald-600"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }
                      >
                        {confirmationActionLabel}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="relative flex-1 overflow-y-auto px-4 py-4">
                  {showInitialMessageLoading ? (
                    <div className="py-10 text-center text-sm text-gray-500">正在加载消息...</div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
                      <div>
                        <div className="font-medium text-gray-700">还没有聊天记录</div>
                        <div className="mt-2">可以先从兴趣、近况，或对方资料里的标签开始聊。</div>
                      </div>
                    </div>
                  ) : (
                    <div className={`space-y-3 transition ${showMessageSwitchOverlay ? "pointer-events-none opacity-40 blur-[1px]" : ""}`}>
                      {messages.map((message) => {
                        const isMine = message.senderId === currentUserId;
                        return (
                          <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isMine ? theme.myBubble : "bg-gray-100 text-gray-800"}`}>
                              <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                              <div className={`mt-2 text-[11px] ${isMine ? "text-white/80" : "text-gray-400"}`}>{formatTime(message.createdAt)}</div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={endRef} />
                    </div>
                  )}

                  {showMessageSwitchOverlay ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="rounded-2xl border border-white/80 bg-white/88 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
                        <div className="text-sm font-medium text-gray-800">
                          正在切换到 {activeContact?.name ?? "新联系人"}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">聊天记录马上就好，不会打断当前页面。</div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-gray-100 px-4 py-4">
                  {messageError ? <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{messageError}</div> : null}
                  <div className="flex items-end gap-3">
                    <textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void handleSend();
                        }
                      }}
                       rows={2}
                        className="min-h-[56px] flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-500/10"
                       placeholder={mode === "friendship" ? "发一句打招呼的话，聊聊最近想一起做的事..." : "发一句打招呼的话，聊聊你们都感兴趣的话题..."}
                       disabled={showMessageSwitchOverlay}
                     />
                    <Button type="button" onClick={() => void handleSend()} disabled={!input.trim() || sending || showMessageSwitchOverlay} className={`h-14 rounded-2xl px-5 text-white ${theme.accentButton}`}>
                      <SendHorizonal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-gray-500">
                先从左侧选择一个联系人，再继续聊天。
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedContact ? `${selectedContact.name} 的资料` : "资料"}</DialogTitle>
            <DialogDescription>
              {mode === "friendship" ? "看看对方的相处偏好，再决定怎么开启聊天。" : "看看对方的约会偏好，再决定怎么继续了解。"}
            </DialogDescription>
          </DialogHeader>

          {selectedContact ? (
            <div className="space-y-4 text-sm text-gray-700">
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
                <div className="mb-1 text-gray-500">兴趣爱好</div>
                <div className="leading-relaxed text-gray-800">{formatInterests(selectedContact.interests)}</div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-2 text-gray-500">{mode === "friendship" ? "理想相处方式" : "理想约会"}</div>
                <IdealPreferenceDisplay mode={mode} tags={selectedContact.ideal_date_tags} description={selectedContact.ideal_date} />
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-1 text-gray-500">自我介绍</div>
                <div className="leading-relaxed text-gray-800">{selectedContact.bio?.trim() || "暂未填写"}</div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4 text-pink-500" />
                  <span className="font-medium">邮箱</span>
                </div>
                <div className="mt-2 break-all text-sm text-gray-600">
                  {checkingEmailAccess ? (
                    "正在检查是否满足展示条件..."
                  ) : emailUnlocked ? (
                    selectedContact.email || "暂未填写"
                  ) : (
                    <div className="space-y-1">
                      <div>只有当双方都互相发过消息后，这里才会显示邮箱。</div>
                      <div className="text-xs text-gray-400">邮箱仅用于登录验证，默认不会直接公开。</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-500">
                <span>当前公开邮箱</span>
                <span className="font-medium text-gray-700">{maskEmail(emailUnlocked ? selectedContact.email ?? null : null) || "未解锁"}</span>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setProfileOpen(false)}>
                  关闭
                </Button>
                <Button type="button" className={`flex-1 rounded-xl text-white ${theme.accentButton}`} onClick={() => setProfileOpen(false)}>
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
