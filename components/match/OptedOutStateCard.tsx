"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";

type OptedOutStateCardProps = {
  nextReleaseTime: string;
};

export function OptedOutStateCard({ nextReleaseTime }: OptedOutStateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative z-10 overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_8px_32px_0_rgba(236,72,153,0.08)] backdrop-blur-xl sm:p-8"
    >
      <div className="hidden min-h-[320px] flex-col items-center justify-center py-10 text-center opacity-70">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-600">雷达已关闭</h3>
        <p className="max-w-xs text-sm text-gray-400">打开上方雷达开关，就能继续查看你当前的匹配位。</p>
      </div>

      <div className="flex min-h-[320px] flex-col items-center justify-center py-10 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-700">你已退出本轮匹配</h3>
        <p className="max-w-sm text-sm text-gray-500">
          本轮匹配卡片和你的曝光都会关闭，系统会在下一轮自动恢复你的雷达状态。
        </p>
        <p className="mt-3 rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600">
          下轮恢复时间：{nextReleaseTime}
        </p>
      </div>
    </motion.div>
  );
}
