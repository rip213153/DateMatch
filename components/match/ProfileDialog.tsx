"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";
import type { QuizMode } from "@/app/data/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MatchConfirmationStatus, UserSummary } from "@/components/match/types";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: UserSummary | null;
  currentUser: { id: number } | null;
  mode: QuizMode;
  confirmationStatus: MatchConfirmationStatus | null;
  confirmationUpdating: boolean;
  onToggleConfirm: () => void;
}

function formatInterests(interests: unknown) {
  if (Array.isArray(interests)) {
    return interests
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .join("、");
  }

  if (typeof interests === "string" && interests.trim()) {
    return interests;
  }

  return "暂未填写";
}

function getConfirmationCopy(status: MatchConfirmationStatus | null) {
  if (!status) {
    return {
      title: "同步点亮状态中",
      description: "我们正在加载这组双向推荐的确认状态。",
      actionLabel: "加载中",
      actionDisabled: true,
    };
  }

  if (status.canMessage) {
    return {
      title: "双方都已点亮",
      description: "你们已经互相表达了明确意愿，可以更积极地继续聊天。",
      actionLabel: "已互相点亮",
      actionDisabled: true,
    };
  }

  if (status.selfConfirmed) {
    return {
      title: "你已点亮对方",
      description: "对方回复前，你仍然可以先发一条消息主动破冰。",
      actionLabel: "取消点亮",
      actionDisabled: false,
    };
  }

  if (status.otherConfirmed) {
    return {
      title: "对方已点亮你",
      description: "如果你也愿意，可以点亮对方；现在也能先发一条消息。",
      actionLabel: "回点对方",
      actionDisabled: false,
    };
  }

  return {
    title: "双向推荐已建立",
    description: "你可以先点亮对方表达意愿，也可以直接发出第一条消息。",
    actionLabel: "点亮 TA",
    actionDisabled: false,
  };
}

export function ProfileDialog({
  open,
  onOpenChange,
  match,
  currentUser,
  mode,
  confirmationStatus,
  confirmationUpdating,
  onToggleConfirm,
}: ProfileDialogProps) {
  const router = useRouter();
  const [emailUnlocked, setEmailUnlocked] = useState(false);
  const [checkingEmailAccess, setCheckingEmailAccess] = useState(false);
  const confirmationCopy = getConfirmationCopy(confirmationStatus);

  useEffect(() => {
    if (!open || !match || !currentUser) {
      setEmailUnlocked(false);
      setCheckingEmailAccess(false);
      return;
    }

    const controller = new AbortController();
    setCheckingEmailAccess(true);

    fetch(
      `/api/chat/messages?userId=${encodeURIComponent(currentUser.id)}&targetUserId=${encodeURIComponent(match.id)}&mode=${mode}`,
      { cache: "no-store", signal: controller.signal }
    )
      .then((response) => {
        if (!response.ok) throw new Error("fetch failed");
        return response.json();
      })
      .then((data) => {
        const chatMessages: Array<{ senderId: number }> = Array.isArray(data.messages) ? data.messages : [];
        const sentByCurrentUser = chatMessages.some((message) => message.senderId === currentUser.id);
        const sentByTargetUser = chatMessages.some((message) => message.senderId === match.id);
        setEmailUnlocked(sentByCurrentUser && sentByTargetUser);
      })
      .catch(() => {
        setEmailUnlocked(false);
      })
      .finally(() => {
        setCheckingEmailAccess(false);
      });

    return () => controller.abort();
  }, [currentUser, match, mode, open]);

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/70 bg-white/95 p-0 shadow-2xl sm:max-w-lg">
        <DialogHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5 text-left">
          <DialogTitle className="text-2xl font-extrabold text-gray-900">{match.name} 的资料</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {mode === "friendship"
              ? "先看看对方的兴趣和相处方式，再决定要不要主动打招呼。"
              : "先看看对方的资料，再决定要不要继续推进这次双向推荐。"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5 text-sm text-gray-700">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="text-gray-500">年龄</div>
              <div className="font-semibold text-gray-900">{match.age} 岁</div>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="text-gray-500">学校</div>
              <div className="font-semibold text-gray-900">{match.university}</div>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="mb-1 text-gray-500">兴趣爱好</div>
            <div className="leading-relaxed text-gray-800">{formatInterests(match.interests)}</div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="mb-1 text-gray-500">{mode === "friendship" ? "理想相处方式" : "理想约会"}</div>
            <div className="leading-relaxed text-gray-800">{match.ideal_date || "暂未填写"}</div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="text-sm font-semibold text-emerald-800">{confirmationCopy.title}</div>
            <div className="mt-1 text-xs leading-relaxed text-emerald-700">{confirmationCopy.description}</div>
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
                match.email || "暂未填写"
              ) : (
                <div className="space-y-1">
                  <div>双方都互相发过消息后，这里才会显示邮箱。</div>
                  <div className="text-xs text-gray-400">邮箱仅用于登录验证，默认不会直接公开。</div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11 rounded-xl">
              关闭
            </Button>
            <Button
              type="button"
              variant={confirmationCopy.actionDisabled ? "outline" : "default"}
              onClick={onToggleConfirm}
              disabled={confirmationCopy.actionDisabled || confirmationUpdating}
              className={
                confirmationCopy.actionDisabled
                  ? "h-11 rounded-xl border-emerald-200 bg-white text-emerald-600"
                  : "h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              }
            >
              {confirmationUpdating ? "处理中..." : confirmationCopy.actionLabel}
            </Button>
            <Button
              onClick={() => {
                if (!currentUser) return;
                router.push(`/chat?userId=${currentUser.id}&targetUserId=${match.id}&mode=${mode}`);
              }}
              className="h-11 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              开始聊天
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
