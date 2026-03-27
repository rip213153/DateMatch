"use client";

import { motion } from "framer-motion";
import { Radar } from "lucide-react";

type RadarStatusCardProps = {
  radarOn: boolean;
  loading: boolean;
  updatingRadar: boolean;
  isOptedOutForRound: boolean;
  hasDisplayEndAt: boolean;
  onToggle: () => void;
};

export function RadarStatusCard({
  radarOn,
  loading,
  updatingRadar,
  isOptedOutForRound,
  hasDisplayEndAt,
  onToggle,
}: RadarStatusCardProps) {
  const disabled = loading || updatingRadar || isOptedOutForRound || !hasDisplayEndAt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex items-center justify-between rounded-[2rem] border border-white/60 bg-white/60 px-6 py-4 shadow-[0_8px_32px_0_rgba(236,72,153,0.08)] backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2.5 transition-colors ${radarOn ? "bg-pink-100 text-pink-500" : "bg-gray-100 text-gray-400"}`}>
          <Radar className={`h-5 w-5 ${radarOn ? "animate-spin-slow" : ""}`} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{radarOn ? "校园雷达已开启" : "已退出本轮匹配"}</h3>
          <p className="text-xs text-gray-500">
            {radarOn
              ? "关闭雷达后，将退出本轮匹配并在下一轮自动恢复。"
              : "本轮不会再展示你的匹配卡片，下一轮会自动恢复参与。"}
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-label="toggle matching"
        onClick={onToggle}
        disabled={disabled}
        className={`flex h-8 w-14 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ${
          radarOn ? "bg-gradient-to-r from-pink-400 to-purple-400 shadow-inner" : "bg-gray-200"
        } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
        title={
          isOptedOutForRound
            ? "你已退出本轮匹配，下一轮自动恢复"
            : !hasDisplayEndAt
              ? "正在同步匹配轮次"
              : "关闭雷达即退出本轮匹配"
        }
      >
        <motion.div
          layout
          className="h-6 w-6 rounded-full bg-white shadow-sm"
          animate={{ x: radarOn ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </motion.div>
  );
}
