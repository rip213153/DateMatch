"use client";

import { motion } from "framer-motion";
import { MatchCardActionsSection } from "@/components/match/MatchCardActionsSection";
import { MatchCardBioSection } from "@/components/match/MatchCardBioSection";
import { MatchCardBreakdownSection } from "@/components/match/MatchCardBreakdownSection";
import { MatchCardConfirmationSection } from "@/components/match/MatchCardConfirmationSection";
import { MatchCardHeaderSection } from "@/components/match/MatchCardHeaderSection";
import { MatchCardIceBreakersSection } from "@/components/match/MatchCardIceBreakersSection";
import type { MatchConfirmationStatus, MatchItem } from "@/components/match/types";
import type { AuthMode } from "@/lib/auth";

interface MatchCardProps {
  mode: AuthMode;
  match: MatchItem;
  onNext: () => void;
  onPrev: () => void;
  activeIndex: number;
  totalMatches: number;
  onOpenProfile: () => void;
  onStartChat: () => void;
  confirmationStatus: MatchConfirmationStatus | null;
  onToggleConfirm: () => void;
  confirmationUpdating: boolean;
  iceBreakers: string[];
  highlights: string[];
}

function getConfirmationCopy(mode: AuthMode, status: MatchConfirmationStatus | null) {
  if (!status) {
    return {
      title: mode === "friendship" ? "在同步本轮回应状态" : "在同步本轮回应状态",
      description:
        mode === "friendship"
          ? "稍等一下，正在更新你们这轮朋友推荐里的回应情况。"
          : "稍等一下，正在更新你们这轮推荐里的双向回应情况。",
      actionLabel: "加载中",
      actionDisabled: true,
    };
  }

  if (status.canMessage || (status.selfConfirmed && status.otherConfirmed)) {
    return {
      title: mode === "friendship" ? "你们已经互相回应" : "你们已经互相确认",
      description:
        mode === "friendship"
          ? "这轮推荐已经双向接住，可以放心继续聊下去。"
          : "你们已经完成双向确认，可以更自然地继续往下聊。",
      actionLabel: mode === "friendship" ? "已互相回应" : "已互相确认",
      actionDisabled: true,
    };
  }

  if (status.selfConfirmed) {
    return {
      title: mode === "friendship" ? "你已经回应对方了" : "你已经点亮对方了",
      description:
        mode === "friendship"
          ? "你已经表达了想继续认识，接下来等对方回应就好。"
          : "你已经表达了继续靠近的意愿，接下来等对方回应就好。",
      actionLabel: mode === "friendship" ? "取消回应" : "取消点亮",
      actionDisabled: false,
    };
  }

  if (status.otherConfirmed) {
    return {
      title: mode === "friendship" ? "对方先回应你了" : "对方先点亮你了",
      description:
        mode === "friendship"
          ? "对方已经表达了想继续认识，你可以决定要不要接住这次连接。"
          : "对方已经表达了继续了解的兴趣，你可以决定要不要回应这次靠近。",
      actionLabel: mode === "friendship" ? "回应一下" : "回应点亮",
      actionDisabled: false,
    };
  }

  return {
    title: mode === "friendship" ? "觉得不错就回应一下" : "有感觉的话可以先点亮",
    description:
      mode === "friendship"
        ? "回应后，对方会知道你愿意继续认识；如果对方也回应，这段连接会更容易继续。"
        : "点亮后，对方会知道你愿意继续了解；如果对方也点亮，这段关系会更容易自然展开。",
    actionLabel: mode === "friendship" ? "回应 TA" : "点亮 TA",
    actionDisabled: false,
  };
}

export function MatchCard({
  mode,
  match,
  onNext,
  onPrev,
  activeIndex,
  totalMatches,
  onOpenProfile,
  onStartChat,
  confirmationStatus,
  onToggleConfirm,
  confirmationUpdating,
  iceBreakers,
  highlights,
}: MatchCardProps) {
  const confirmationCopy = getConfirmationCopy(mode, confirmationStatus);

  return (
    <motion.div
      key={match.user.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex flex-col"
    >
      <motion.div
        drag={totalMatches > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.25}
        onDragEnd={(_, info) => {
          const distance = info.offset.x;
          const speed = info.velocity.x;
          if (Math.abs(distance) < 70 && Math.abs(speed) < 500) return;
          if (distance < 0 || speed < 0) onNext();
          else onPrev();
        }}
        className="rounded-[1.6rem] border border-white/70 bg-white/80 p-4 shadow-[0_12px_40px_rgba(236,72,153,0.12)]"
      >
        <MatchCardHeaderSection
          mode={mode}
          match={match}
          activeIndex={activeIndex}
          totalMatches={totalMatches}
          onNext={onNext}
          onPrev={onPrev}
          highlights={highlights}
        />
        <MatchCardIceBreakersSection iceBreakers={iceBreakers} />
        <MatchCardConfirmationSection
          title={confirmationCopy.title}
          description={confirmationCopy.description}
          actionLabel={confirmationCopy.actionLabel}
          actionDisabled={confirmationCopy.actionDisabled}
          confirmationUpdating={confirmationUpdating}
          onToggleConfirm={onToggleConfirm}
        />
        <MatchCardBioSection bio={match.user.bio} />
        <MatchCardBreakdownSection mode={mode} breakdown={match.match.breakdown} />
        <MatchCardActionsSection onStartChat={onStartChat} onOpenProfile={onOpenProfile} />
      </motion.div>
    </motion.div>
  );
}
