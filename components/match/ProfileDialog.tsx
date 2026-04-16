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
    return normalized.length > 0 ? normalized.join(", ") : "Not provided";
  }

  if (typeof interests === "string" && interests.trim()) {
    const normalized = interests
      .split(/[\n,，、/]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    return normalized.length > 0 ? normalized.join(", ") : "Not provided";
  }

  return "Not provided";
}

function getConfirmationCopy(status: MatchConfirmationStatus | null) {
  if (!status) {
    return {
      title: "Confirmation loading",
      description: "Please wait while we sync the latest confirmation status.",
      actionLabel: "Loading",
      actionDisabled: true,
    };
  }

  if (status.canMessage) {
    return {
      title: "Mutually confirmed",
      description: "You have both confirmed, so you can keep chatting with confidence.",
      actionLabel: "Mutually confirmed",
      actionDisabled: true,
    };
  }

  if (status.selfConfirmed) {
    return {
      title: "You confirmed them",
      description: "You already showed interest. Now you are waiting for their reply.",
      actionLabel: "Cancel confirmation",
      actionDisabled: false,
    };
  }

  if (status.otherConfirmed) {
    return {
      title: "They confirmed you",
      description: "They already showed interest. You can decide whether to confirm back.",
      actionLabel: "Confirm back",
      actionDisabled: false,
    };
  }

  return {
    title: "You can light them up first",
    description: "After you confirm, they will know that you are interested in this match.",
    actionLabel: "Light them up",
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
  const [unlockedEmail, setUnlockedEmail] = useState<string | null>(null);
  const [checkingEmailAccess, setCheckingEmailAccess] = useState(false);
  const confirmationCopy = getConfirmationCopy(confirmationStatus);

  useEffect(() => {
    if (!open || !match || !currentUser) {
      setEmailUnlocked(false);
      setUnlockedEmail(null);
      setCheckingEmailAccess(false);
      return;
    }

    const controller = new AbortController();
    setCheckingEmailAccess(true);
    setEmailUnlocked(false);
    setUnlockedEmail(null);

    fetch(
      `/api/chat/contact-email?userId=${encodeURIComponent(currentUser.id)}&targetUserId=${encodeURIComponent(match.id)}&mode=${mode}`,
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || "fetch failed");
        return data;
      })
      .then((data) => {
        const nextUnlocked = Boolean(data?.emailUnlocked);
        setEmailUnlocked(nextUnlocked);
        setUnlockedEmail(nextUnlocked && typeof data?.email === "string" ? data.email : null);
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to resolve match email access:", error);
        setEmailUnlocked(false);
        setUnlockedEmail(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCheckingEmailAccess(false);
        }
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
            email={unlockedEmail ?? undefined}
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
