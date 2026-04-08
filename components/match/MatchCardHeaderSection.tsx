"use client";

import { BellRing, Heart, MapPin } from "lucide-react";
import { summarizeIdealPreference } from "@/app/data/idealPreferenceTags";
import type { MatchItem } from "@/components/match/types";
import { Button } from "@/components/ui/button";
import type { AuthMode } from "@/lib/auth";

interface MatchCardHeaderSectionProps {
  mode: AuthMode;
  match: MatchItem;
  activeIndex: number;
  totalMatches: number;
  onNext: () => void;
  onPrev: () => void;
  highlights: string[];
}

export function MatchCardHeaderSection({
  mode,
  match,
  activeIndex,
  totalMatches,
  onNext,
  onPrev,
  highlights,
}: MatchCardHeaderSectionProps) {
  const headerBadge = mode === "friendship" ? "本轮朋友推荐" : "本轮双向推荐";
  const scoreLabel = mode === "friendship" ? "朋友契合度" : "综合匹配度";

  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
            <BellRing className="h-3.5 w-3.5" />
            {headerBadge}
          </div>
          <h2 className="mb-2 flex items-end gap-2 text-2xl font-extrabold text-gray-900">
            {match.user.name}
            <span className="text-lg font-medium text-gray-500">{match.user.age}岁</span>
          </h2>
          <p className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-pink-400" />
            {match.user.university} ·{" "}
            {summarizeIdealPreference(
              match.user.ideal_date_tags,
              match.user.ideal_date,
              "适合从轻松自然的见面开始",
            )}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-xl font-black text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]">
            {Math.round(match.match.overallScore * 100)}%
            <svg className="absolute inset-0 h-full w-full animate-spin-slow" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="30 10" />
            </svg>
          </div>
          <span className="mt-2 text-xs font-bold text-pink-600">{scoreLabel}</span>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
          <Heart className="h-4 w-4 text-rose-500" fill="currentColor" />
          匹配亮点
        </div>
        {totalMatches > 1 ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-gray-400 sm:inline">左右滑动切换卡片</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={activeIndex >= totalMatches - 1 ? onPrev : onNext}
              className="h-8 rounded-full border-pink-200 bg-white text-pink-600 hover:bg-pink-50"
            >
              {activeIndex >= totalMatches - 1 ? "回上一张" : "换一个"}
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
    </>
  );
}
