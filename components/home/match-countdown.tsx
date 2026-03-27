"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import {
  getCountdownParts,
  getMatchSchedule,
  MATCH_DAY,
  MATCH_HOUR,
  MATCH_MINUTE,
  type MatchSchedulePhase,
} from "@/lib/match-schedule";

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  targetAt: Date;
  phase: MatchSchedulePhase;
};

function getCountdownState(now: Date = new Date()): CountdownState {
  const schedule = getMatchSchedule(now);
  const parts = getCountdownParts(schedule.countdownTargetAt, now);

  return {
    ...parts,
    targetAt: new Date(schedule.countdownTargetAt),
    phase: schedule.phase,
  };
}

function formatWeeklySchedule() {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `每周${weekdays[MATCH_DAY]} ${String(MATCH_HOUR).padStart(2, "0")}:${String(MATCH_MINUTE).padStart(2, "0")}`;
}

export function MatchCountdown() {
  const [isClient, setIsClient] = useState(false);
  const [countdown, setCountdown] = useState<CountdownState | null>(null);

  useEffect(() => {
    setIsClient(true);
    setCountdown(getCountdownState());
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const timer = window.setInterval(() => {
      setCountdown(getCountdownState());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isClient]);

  if (!isClient || !countdown) {
    return (
      <div className="mb-7 rounded-2xl border border-pink-100/70 bg-white/70 px-4 py-4 shadow-sm">
        <div className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold text-pink-600">
          <Clock3 className="h-4 w-4" />
          <span>距离下一轮匹配开放</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {["天", "时", "分", "秒"].map((label) => (
            <div key={label} className="rounded-xl bg-white/90 py-2 text-center">
              <div className="text-xl font-bold tabular-nums text-gray-800">00</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-2 text-center text-xs text-gray-500">{formatWeeklySchedule()} 开放匹配</div>
      </div>
    );
  }

  const countdownItems = [
    { label: "天", value: countdown.days },
    { label: "时", value: countdown.hours },
    { label: "分", value: countdown.minutes },
    { label: "秒", value: countdown.seconds },
  ];
  const isDisplayWindow = countdown.phase === "display_window";
  const headerText = isDisplayWindow ? "距离本轮匹配结束" : "距离下一轮匹配开放";
  const footerText = isDisplayWindow
    ? "每周五18:00开放匹配；本轮匹配展示截至："
    : `${formatWeeklySchedule()} 开放匹配，下一轮：`;

  return (
    <div className="mb-7 rounded-2xl border border-pink-100/70 bg-white/70 px-4 py-4 shadow-sm">
      <div className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold text-pink-600">
        <Clock3 className="h-4 w-4" />
        <span>{headerText}</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {countdownItems.map((item) => (
          <div key={item.label} className="rounded-xl bg-white/90 py-2 text-center">
            <div className="text-xl font-bold tabular-nums text-gray-800">
              {String(item.value).padStart(2, "0")}
            </div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-center text-xs text-gray-500">
        {footerText}
        {countdown.targetAt.toLocaleString("zh-CN", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Shanghai",
        })}
      </div>
    </div>
  );
}
