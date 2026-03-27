"use client";

import { MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchCardActionsSectionProps {
  onStartChat: () => void;
  onOpenProfile: () => void;
}

export function MatchCardActionsSection({
  onStartChat,
  onOpenProfile,
}: MatchCardActionsSectionProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row">
      <Button
        type="button"
        onClick={onStartChat}
        className="group relative h-12 flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-200 transition-all hover:-translate-y-0.5 hover:from-pink-600 hover:to-purple-700"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <MessageCircle className="h-4 w-4" />
          开始聊天（可先发一条）
        </span>
        <div className="absolute inset-0 -translate-x-full skew-x-[-45deg] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onOpenProfile}
        className="h-12 flex-1 rounded-xl border-pink-200 bg-white/50 font-bold text-pink-600 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-pink-50"
      >
        <User className="mr-2 h-4 w-4" />
        查看资料
      </Button>
    </div>
  );
}
