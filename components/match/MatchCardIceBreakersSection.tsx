"use client";

import { Sparkles } from "lucide-react";

interface MatchCardIceBreakersSectionProps {
  iceBreakers: string[];
}

export function MatchCardIceBreakersSection({ iceBreakers }: MatchCardIceBreakersSectionProps) {
  return (
    <div className="mb-6 rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-bold text-purple-800">
        <Sparkles className="h-4 w-4 text-purple-500" />
        破冰建议
      </div>
      <div className="space-y-2">
        {iceBreakers.length > 0 ? (
          iceBreakers.map((line, index) => (
            <div key={index} className="flex items-start gap-2 text-xs leading-relaxed text-purple-700">
              <span className="mt-0.5 flex h-1.5 w-1.5 shrink-0 items-center justify-center rounded-full bg-purple-400" />
              <span>{line}</span>
            </div>
          ))
        ) : (
          <div className="text-xs leading-relaxed text-purple-700">
            你们的匹配度很高，可以先从最近常做的事，或者一首喜欢的歌聊起。
          </div>
        )}
      </div>
    </div>
  );
}
