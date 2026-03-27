"use client";

import { motion } from "framer-motion";
import { MatchCardActionsSection } from "@/components/match/MatchCardActionsSection";
import { MatchCardBioSection } from "@/components/match/MatchCardBioSection";
import { MatchCardBreakdownSection } from "@/components/match/MatchCardBreakdownSection";
import { MatchCardConfirmationSection } from "@/components/match/MatchCardConfirmationSection";
import { MatchCardHeaderSection } from "@/components/match/MatchCardHeaderSection";
import { MatchCardIceBreakersSection } from "@/components/match/MatchCardIceBreakersSection";
import type { MatchConfirmationStatus, MatchItem } from "@/components/match/types";

interface MatchCardProps {
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

function getConfirmationCopy(status: MatchConfirmationStatus | null) {
  if (!status) {
    return {
      title: "确认状态加载中",
      description: "稍等一下，正在同步你们本轮的互选状态。",
      actionLabel: "加载中",
      actionDisabled: true,
    };
  }

  if (status.canMessage || (status.selfConfirmed && status.otherConfirmed)) {
    return {
      title: "已互相确认",
      description: "你们已经完成双向确认，可以放心继续聊天啦。",
      actionLabel: "已互相确认",
      actionDisabled: true,
    };
  }

  if (status.selfConfirmed) {
    return {
      title: "你已确认对方",
      description: "已为这张卡片点亮，等待对方回应。",
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
    description: "点亮后对方会看到你对这次匹配有兴趣，双方都确认后会更容易继续推进。",
    actionLabel: "点亮 TA",
    actionDisabled: false,
  };
}

export function MatchCard({
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
  const confirmationCopy = getConfirmationCopy(confirmationStatus);

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
        <MatchCardBreakdownSection breakdown={match.match.breakdown} />
        <MatchCardActionsSection onStartChat={onStartChat} onOpenProfile={onOpenProfile} />
      </motion.div>
    </motion.div>
  );
}
