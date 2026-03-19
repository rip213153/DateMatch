"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";
import type { QuizMode } from "@/app/data/types";
import type { MatchConfirmationStatus, UserSummary } from "@/components/match/types";
import { IdealPreferenceDisplay } from "@/components/profile/IdealPreferenceDisplay";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    const normalized = interests
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim());
    return normalized.length > 0 ? normalized.join("、") : "暂未填写";
  }

  if (typeof interests === "string" && interests.trim()) {
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
      description: "稍等一下，正在同步你们本轮的互选状态。",
      actionLabel: "加载中",
      actionDisabled: true,
    };
  }

  if (status.canMessage) {
    return {
      title: "已互相确认",
      description: "你们已经完成双向确认，可以继续安心聊天。",
      actionLabel: "已互相确认",
      actionDisabled: true,
    };
  }

  if (status.selfConfirmed) {
    return {
      title: "你已确认对方",
      description: "你已经表达过兴趣，现在等待对方回应。",
      actionLabel: "取消确认",
      actionDisabled: false,
    };
  }

  if (status.otherConfirmed) {
    return {
      title: "对方已确认你",
      description: "对方已经表达兴趣，你可以决定是否回应确认。",
      actionLabel: "回应确认",
      actionDisabled: false,
    };
  }

  return {
    title: "可以先点亮一下",
    description: "点亮后，对方会知道你对这次匹配有兴趣。",
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
      { cache: "no-store", signal: controller.signal },
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
              ? "看看对方的相处偏好，确认合适再继续聊天。"
              : "看看对方的约会偏好，确认有感觉再继续了解。"}
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
            <div className="mb-2 text-gray-500">{mode === "friendship" ? "理想相处方式" : "理想约会"}</div>
            <IdealPreferenceDisplay mode={mode} tags={match.ideal_date_tags} description={match.ideal_date} />
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="text-sm font-semibold text-emerald-800">{confirmationCopy.title}</div>
            <div className="mt-1 text-xs leading-relaxed text-emerald-700">{confirmationCopy.description}</div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="mb-1 text-gray-500">自我介绍</div>
            <div className="leading-relaxed text-gray-800">{match.bio?.trim() || "暂未填写"}</div>
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
                  <div>只有当双方都互相发过消息后，这里才会显示邮箱。</div>
                  <div className="text-xs text-gray-400">邮箱仅用于登录验证，默认不会直接公开。</div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 rounded-xl">
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
              type="button"
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
