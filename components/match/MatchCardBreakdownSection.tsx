"use client";

import { motion } from "framer-motion";
import type { MatchItem } from "@/components/match/types";

type MatchBreakdown = MatchItem["match"]["breakdown"];

const BREAKDOWN_ITEMS: Array<{
  key: keyof MatchBreakdown;
  label: string;
  gradientClassName: string;
}> = [
  {
    key: "personality",
    label: "性格匹配",
    gradientClassName: "bg-gradient-to-r from-blue-400 to-indigo-500",
  },
  {
    key: "interests",
    label: "兴趣重合",
    gradientClassName: "bg-gradient-to-r from-emerald-400 to-teal-500",
  },
  {
    key: "background",
    label: "背景相似",
    gradientClassName: "bg-gradient-to-r from-amber-400 to-orange-500",
  },
  {
    key: "complementary",
    label: "互补程度",
    gradientClassName: "bg-gradient-to-r from-purple-400 to-fuchsia-500",
  },
];

interface MatchCardBreakdownSectionProps {
  breakdown: MatchBreakdown;
}

export function MatchCardBreakdownSection({ breakdown }: MatchCardBreakdownSectionProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6">
      {BREAKDOWN_ITEMS.map((item) => {
        const value = Math.round(breakdown[item.key] * 100);

        return (
          <div key={item.key} className="flex flex-col gap-1.5">
            <div className="flex items-end justify-between text-xs font-bold text-gray-600">
              <span>{item.label}</span>
              <span className="text-sm text-gray-700">{value}%</span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className={`absolute left-0 top-0 h-full rounded-full ${item.gradientClassName}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
