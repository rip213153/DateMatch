"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { QuizMode } from "@/app/data/types";
import { ProfileDialogActionsSection } from "@/components/match/ProfileDialogActionsSection";
import { ProfileDialogConfirmationNotice } from "@/components/match/ProfileDialogConfirmationNotice";
import { ProfileDialogDetailsSection } from "@/components/match/ProfileDialogDetailsSection";
import { ProfileDialogEmailSection } from "@/components/match/ProfileDialogEmailSection";
import { ProfileDialogHeaderSection } from "@/components/match/ProfileDialogHeaderSection";
import type { MatchConfirmationStatus, UserSummary } from "@/components/match/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

  const formattedInterests = formatInterests(match.interests);
  const handleStartChat = () => {
    if (!currentUser) return;
    router.push(`/chat?userId=${currentUser.id}&targetUserId=${match.id}&mode=${mode}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/70 bg-white/95 p-0 shadow-2xl sm:max-w-lg">
        <ProfileDialogHeaderSection name={match.name} mode={mode} />

        <div className="space-y-4 px-6 py-5 text-sm text-gray-700">
          <ProfileDialogDetailsSection
            age={match.age}
            university={match.university}
            formattedInterests={formattedInterests}
            mode={mode}
            idealDateTags={match.ideal_date_tags}
            idealDate={match.ideal_date}
            bio={match.bio}
          />
          <ProfileDialogConfirmationNotice
            title={confirmationCopy.title}
            description={confirmationCopy.description}
          />
          <ProfileDialogEmailSection
            checkingEmailAccess={checkingEmailAccess}
            emailUnlocked={emailUnlocked}
            email={match.email}
          />
          <ProfileDialogActionsSection
            actionDisabled={confirmationCopy.actionDisabled}
            actionLabel={confirmationCopy.actionLabel}
            confirmationUpdating={confirmationUpdating}
            onClose={() => onOpenChange(false)}
            onToggleConfirm={onToggleConfirm}
            onStartChat={handleStartChat}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
