"use client";

import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";

type DisplayWindowNoticeCardProps = {
  isQueuedForNextRound: boolean;
  scheduleTime: string;
};

export function DisplayWindowNoticeCard({
  isQueuedForNextRound,
  scheduleTime,
}: DisplayWindowNoticeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative z-10 overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_8px_32px_0_rgba(236,72,153,0.08)] backdrop-blur-xl sm:p-8"
    >
      <div className="flex min-h-[320px] flex-col items-center justify-center py-10 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
          <Clock3 className="h-8 w-8 text-pink-500" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-700">
          {isQueuedForNextRound ? "你已进入下一轮匹配" : "当前不在匹配展示期"}
        </h3>
        <p className="max-w-sm text-sm text-gray-500">
          {isQueuedForNextRound
            ? "你是在本轮展示期内提交的档案，因此会自动归入下一轮；等下一次倒计时结束后，就能看到你的匹配卡片。"
            : "匹配卡片会在开放时间后展示，关闭期内会自动隐藏。"}
        </p>
        <p className="mt-3 rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600">
          {isQueuedForNextRound ? "你的可见时间：" : "下一轮开放时间："}
          {scheduleTime}
        </p>
      </div>
    </motion.div>
  );
}
