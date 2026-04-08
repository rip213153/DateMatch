"use client";

import { motion } from "framer-motion";
import { Radar } from "lucide-react";
import type { MatchAvailability } from "@/lib/use-match-data";
import { DisplayWindowNoticeCard } from "@/components/match/DisplayWindowNoticeCard";
import { MatchCard } from "@/components/match/MatchCard";
import { OptedOutStateCard } from "@/components/match/OptedOutStateCard";
import { RadarStatusCard } from "@/components/match/RadarStatusCard";
import type { MatchConfirmationStatus, MatchItem } from "@/components/match/types";
import type { AuthMode } from "@/lib/auth";

type MatchStagePanelProps = {
  mode: AuthMode;
  radarOn: boolean;
  loading: boolean;
  updatingRadar: boolean;
  availability: MatchAvailability;
  matchError: string | null;
  activeMatch: MatchItem | null;
  activeIndex: number;
  totalMatches: number;
  panelError: string | null;
  confirmationStatus: MatchConfirmationStatus | null;
  confirmationUpdating: boolean;
  iceBreakers: string[];
  highlights: string[];
  optedOutNextReleaseTime: string;
  displayWindowScheduleTime: string;
  onToggleRadar: () => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onOpenProfile: () => void;
  onStartChat: () => void;
  onToggleConfirm: () => void;
};

export function MatchStagePanel({
  mode,
  radarOn,
  loading,
  updatingRadar,
  availability,
  matchError,
  activeMatch,
  activeIndex,
  totalMatches,
  panelError,
  confirmationStatus,
  confirmationUpdating,
  iceBreakers,
  highlights,
  optedOutNextReleaseTime,
  displayWindowScheduleTime,
  onToggleRadar,
  onNextMatch,
  onPrevMatch,
  onOpenProfile,
  onStartChat,
  onToggleConfirm,
}: MatchStagePanelProps) {
  return (
    <>
      <RadarStatusCard
        radarOn={radarOn}
        loading={loading}
        updatingRadar={updatingRadar}
        isOptedOutForRound={availability.isOptedOutForRound}
        hasDisplayEndAt={Boolean(availability.displayEndAt)}
        onToggle={onToggleRadar}
      />

      {!radarOn ? (
        <OptedOutStateCard nextReleaseTime={optedOutNextReleaseTime} />
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
            <Radar className="h-8 w-8 animate-spin text-pink-600" />
          </div>
          <p className="ml-4 text-gray-600">正在计算匹配...</p>
        </div>
      ) : matchError ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">{matchError}</div>
      ) : !availability.isInDisplayWindow ? (
        <DisplayWindowNoticeCard
          isQueuedForNextRound={availability.isQueuedForNextRound}
          scheduleTime={displayWindowScheduleTime}
        />
      ) : totalMatches === 0 || !activeMatch ? (
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-600">暂无匹配对象，请稍后再试</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_8px_32px_0_rgba(236,72,153,0.08)] backdrop-blur-xl sm:p-8"
        >
          {panelError ? (
            <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {panelError}
            </div>
          ) : null}

          <MatchCard
            mode={mode}
            match={activeMatch}
            onNext={onNextMatch}
            onPrev={onPrevMatch}
            activeIndex={activeIndex}
            totalMatches={totalMatches}
            onOpenProfile={onOpenProfile}
            onStartChat={onStartChat}
            confirmationStatus={confirmationStatus}
            onToggleConfirm={onToggleConfirm}
            confirmationUpdating={confirmationUpdating}
            iceBreakers={iceBreakers}
            highlights={highlights}
          />
        </motion.div>
      )}
    </>
  );
}
