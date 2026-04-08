"use client";

import { motion } from "framer-motion";
import type { MatchItem } from "@/components/match/types";
import type { AuthMode } from "@/lib/auth";

type MatchBreakdown = MatchItem["match"]["breakdown"];

type BreakdownCopy = {
  label: string;
  description: string;
  gradientClassName: string;
};

const ROMANCE_BREAKDOWN_ITEMS: Array<{
  key: keyof MatchBreakdown;
  copy: BreakdownCopy;
}> = [
  {
    key: "personality",
    copy: {
      label: "关系理解",
      description: "你们对靠近、回应和相处方式的理解有多接近。",
      gradientClassName: "bg-gradient-to-r from-blue-400 to-indigo-500",
    },
  },
  {
    key: "interests",
    copy: {
      label: "相处入口",
      description: "你们有没有现成能聊起来、能一起做的连接点。",
      gradientClassName: "bg-gradient-to-r from-emerald-400 to-teal-500",
    },
  },
  {
    key: "background",
    copy: {
      label: "现实落点",
      description: "你们在学校、年龄和生活场景上是否更容易接上。",
      gradientClassName: "bg-gradient-to-r from-amber-400 to-orange-500",
    },
  },
  {
    key: "complementary",
    copy: {
      label: "节奏互补",
      description: "你们的不同能不能形成舒服的配合，而不是彼此消耗。",
      gradientClassName: "bg-gradient-to-r from-purple-400 to-fuchsia-500",
    },
  },
];

const FRIENDSHIP_BREAKDOWN_ITEMS: Array<{
  key: keyof MatchBreakdown;
  copy: BreakdownCopy;
}> = [
  {
    key: "personality",
    copy: {
      label: "朋友节奏",
      description: "你们对陪伴、边界和联结方式的理解有多接近。",
      gradientClassName: "bg-gradient-to-r from-blue-400 to-indigo-500",
    },
  },
  {
    key: "interests",
    copy: {
      label: "共同话题",
      description: "你们有没有自然能接上的兴趣和日常切口。",
      gradientClassName: "bg-gradient-to-r from-emerald-400 to-teal-500",
    },
  },
  {
    key: "background",
    copy: {
      label: "生活场景",
      description: "你们在学校、年龄和现实环境上是否更容易走近。",
      gradientClassName: "bg-gradient-to-r from-amber-400 to-orange-500",
    },
  },
  {
    key: "complementary",
    copy: {
      label: "相处余地",
      description: "你们的不同能不能留出弹性，而不是把关系拉紧。",
      gradientClassName: "bg-gradient-to-r from-purple-400 to-fuchsia-500",
    },
  },
];

interface MatchCardBreakdownSectionProps {
  mode: AuthMode;
  breakdown: MatchBreakdown;
}

export function MatchCardBreakdownSection({ mode, breakdown }: MatchCardBreakdownSectionProps) {
  const items = mode === "friendship" ? FRIENDSHIP_BREAKDOWN_ITEMS : ROMANCE_BREAKDOWN_ITEMS;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6">
      {items.map((item) => {
        const value = Math.round(breakdown[item.key] * 100);

        return (
          <div key={item.key} className="flex flex-col gap-1.5 rounded-2xl bg-white/55 px-3 py-3">
            <div className="flex items-end justify-between text-xs font-bold text-gray-600">
              <span>{item.copy.label}</span>
              <span className="text-sm text-gray-700">{value}%</span>
            </div>
            <p className="text-xs leading-5 text-gray-500">{item.copy.description}</p>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className={`absolute left-0 top-0 h-full rounded-full ${item.copy.gradientClassName}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
