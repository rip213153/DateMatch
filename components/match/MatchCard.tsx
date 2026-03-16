//匹配卡片的功能
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { MatchConfirmationStatus, MatchItem } from "@/components/match/types";
import { BellRing, Heart, MapPin, MessageCircle, Sparkles, User } from "lucide-react";

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
      title: "同步点亮状态中",
      description: "我们正在加载你们这组双向推荐的确认状态。",
      actionLabel: "加载中",
      actionDisabled: true,
    };
  }

  if (status.canMessage) {
    return {
      title: "双方都已点亮",
      description: "你们已经明确互相感兴趣，可以继续聊天推进关系。",
      actionLabel: "已互相点亮",
      actionDisabled: true,
    };
  }

  if (status.selfConfirmed && status.otherConfirmed) {
    return {
      title: "双方都已点亮",
      description: "你们已经明确互相感兴趣，可以继续聊天推进关系。",
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
    description: "你可以先发一条消息，也可以先点亮对方表达明确意愿。",
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
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
              <BellRing className="h-3.5 w-3.5" />本轮双向推荐
            </div>
            <h2 className="mb-2 flex items-end gap-2 text-2xl font-extrabold text-gray-900">
              {match.user.name}
              <span className="text-lg font-medium text-gray-500">{match.user.age}岁</span>
            </h2>
            <p className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-pink-400" />
              {match.user.university} · {match.user.ideal_date || "适合从轻松自然的见面开始"}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-xl font-black text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]">
              {Math.round(match.match.overallScore * 100)}%
              <svg className="absolute inset-0 h-full w-full animate-spin-slow" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="30 10" />
              </svg>
            </div>
            <span className="mt-2 text-xs font-bold text-pink-600">双方已互相入选</span>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
            <Heart className="h-4 w-4 text-rose-500" fill="currentColor" />匹配亮点
          </div>
          {totalMatches > 1 ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-gray-400 sm:inline">左右滑动切换卡片</span>
              <Button type="button" variant="outline" size="sm" onClick={onNext} className="h-8 rounded-full border-pink-200 bg-white text-pink-600 hover:bg-pink-50">
                换一位
              </Button>
            </div>
          ) : null}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {highlights.map((tag) => (
            <span key={tag} className="rounded-md border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-6 rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-bold text-purple-800">
            <Sparkles className="h-4 w-4 text-purple-500" />专属破冰建议
          </div>
          <div className="space-y-2">
            {iceBreakers.length > 0 ? (
              iceBreakers.map((line, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-purple-700 leading-relaxed">
                  <span className="mt-0.5 flex h-1.5 w-1.5 shrink-0 items-center justify-center rounded-full bg-purple-400" />
                  <span>{line}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-purple-700 leading-relaxed">
                匹配度这么高，说明咱们审美很像，先从交换最近的一首好听的歌开始吧？
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-emerald-800">{confirmationCopy.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-emerald-700">{confirmationCopy.description}</div>
            </div>
            <Button
              type="button"
              variant={confirmationCopy.actionDisabled ? "outline" : "default"}
              onClick={onToggleConfirm}
              disabled={confirmationCopy.actionDisabled || confirmationUpdating}
              className={
                confirmationCopy.actionDisabled
                  ? "h-10 rounded-xl border-emerald-200 bg-white text-emerald-600"
                  : "h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              }
            >
              {confirmationUpdating ? "处理中..." : confirmationCopy.actionLabel}
            </Button>
          </div>
        </div>

        {match.user.bio ? (
          <div className="mb-6 rounded-xl border border-pink-100 bg-pink-50/50 p-4">
            <div className="mb-1 text-xs font-bold text-pink-700">自我介绍</div>
            <div className="text-xs text-pink-600 leading-relaxed">{match.user.bio}</div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <div className="mb-1 text-xs font-bold text-gray-600">自我介绍</div>
            <div className="text-xs text-gray-500 italic">该用户暂未填写自我介绍</div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-end justify-between text-xs font-bold text-gray-600">
              <span>性格匹配</span>
              <span className="text-sm text-gray-700">{Math.round(match.match.breakdown.personality * 100)}%</span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${match.match.breakdown.personality * 100}%` }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-end justify-between text-xs font-bold text-gray-600">
              <span>兴趣重叠</span>
              <span className="text-sm text-gray-700">{Math.round(match.match.breakdown.interests * 100)}%</span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${match.match.breakdown.interests * 100}%` }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-end justify-between text-xs font-bold text-gray-600">
              <span>背景相似</span>
              <span className="text-sm text-gray-700">{Math.round(match.match.breakdown.background * 100)}%</span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${match.match.breakdown.background * 100}%` }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-end justify-between text-xs font-bold text-gray-600">
              <span>性格互补</span>
              <span className="text-sm text-gray-700">{Math.round(match.match.breakdown.complementary * 100)}%</span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${match.match.breakdown.complementary * 100}%` }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row">
          <Button type="button" onClick={onStartChat} className="group relative h-12 flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-200 transition-all hover:-translate-y-0.5 hover:from-pink-600 hover:to-purple-700">
            <span className="relative z-10 flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4" />开始聊天（可先发一条）
            </span>
            <div className="absolute inset-0 -translate-x-full skew-x-[-45deg] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          </Button>
          <Button type="button" variant="outline" onClick={onOpenProfile} className="h-12 flex-1 rounded-xl border-pink-200 bg-white/50 font-bold text-pink-600 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-pink-50">
            <User className="mr-2 h-4 w-4" />查看资料
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
