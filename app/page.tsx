"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, Heart, MailCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

function MatchCountdown() {
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

function BackgroundEffects() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#faf8f9]" />
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-pink-300/40 blur-[100px] mix-blend-multiply"
      />
      <motion.div
        animate={{ x: [0, -40, 30, 0], y: [0, 50, -20, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-10%] top-[20%] h-[60%] w-[40%] rounded-full bg-purple-300/40 blur-[100px] mix-blend-multiply"
      />
    </div>
  );
}

export default function Home() {
  const [isModeDialogOpen, setIsModeDialogOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-8">
      <BackgroundEffects />

      <div className="relative z-10 mx-auto w-full max-w-xl">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl border border-pink-100 bg-white p-2 shadow-sm">
            <Heart className="h-5 w-5 text-pink-500" fill="currentColor" />
          </div>
          
          <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
            DateMatch
          </span>
        </div>

        <section className="rounded-[2rem] border border-white/70 bg-white/50 p-6 shadow-[0_8px_32px_0_rgba(236,72,153,0.08)] backdrop-blur-xl sm:p-8">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-pink-100 bg-white/80 px-3 py-1 text-sm font-semibold text-pink-600">
            <Sparkles className="h-4 w-4" />
            2026 校园专属匹配
          </div>

          <h1 className="mb-4 text-5xl font-extrabold leading-none tracking-[-0.04em] text-gray-900 sm:text-7xl">
            <span className="animate-text-flow bg-gradient-to-r from-[#ff3b7c] via-[#a855f7] to-[#ff6aa2] bg-clip-text text-transparent">
              DateMatch
            </span>
          </h1>

          <p className="mb-7 text-gray-600">
            基于多维人格和校园标签，快速找到同频的人。先完成测试，再查看匹配结果与聊天入口。
          </p>

          <MatchCountdown />

          <Button
            onClick={() => setIsModeDialogOpen(true)}
            className="group h-14 w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-lg font-bold text-white hover:from-pink-600 hover:to-purple-700"
          >
            <span className="flex items-center gap-2">
              开始测试
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>

          <p className="mt-3 text-center text-xs text-gray-500">仅需 2 分钟，先选模式，再查看你的专属结果</p>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="mb-3 text-center text-sm text-gray-600">已经测试过了？</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/login?redirect=%2Fdev-channel-2&mode=romance" className="block">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-full border-pink-200 bg-white/80 text-pink-600 backdrop-blur-md hover:bg-pink-50"
                >
                  <MailCheck className="mr-2 h-4 w-4" />
                  登录看恋爱匹配
                </Button>
              </Link>
              <Link
                href="/login?redirect=%2Fdev-channel-2%3Fmode%3Dfriendship&mode=friendship"
                className="block"
              >
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-full border-sky-200 bg-white/80 text-sky-600 backdrop-blur-md hover:bg-sky-50"
                >
                  <MailCheck className="mr-2 h-4 w-4" />
                  登录看朋友匹配
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={isModeDialogOpen} onOpenChange={setIsModeDialogOpen}>
        <DialogContent className="border-white/80 bg-white/90 p-0 shadow-2xl backdrop-blur-xl sm:max-w-2xl">
          <DialogHeader className="px-6 pt-6 sm:px-8 sm:pt-8">
            <DialogTitle className="text-center text-2xl font-bold text-gray-900">选择你的测试模式</DialogTitle>
            <p className="text-center text-sm leading-6 text-gray-500">
              恋爱模式更关注亲密关系节奏，朋友模式更关注社交电量、边界感与同频默契。
            </p>
          </DialogHeader>

          <div className="grid gap-4 px-6 pb-6 pt-2 sm:grid-cols-2 sm:px-8 sm:pb-8">
            <Link href="/quiz?mode=romance" onClick={() => setIsModeDialogOpen(false)} className="block">
              <div className="group w-full rounded-[1.75rem] border border-pink-100 bg-gradient-to-br from-white to-pink-50 p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-pink-300 hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                  <Heart className="h-6 w-6 transition-transform group-hover:scale-110" fill="currentColor" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">遇见心动正缘</h3>
                <p className="text-sm leading-6 text-gray-500">
                  测试依恋倾向、沟通方式与关系节奏，看看你在亲密关系里更吸引什么样的人。
                </p>
              </div>
            </Link>

            <Link href="/quiz?mode=friendship" onClick={() => setIsModeDialogOpen(false)} className="block">
              <div className="group w-full rounded-[1.75rem] border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                  <Users className="h-6 w-6 transition-transform group-hover:scale-110" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">寻找灵魂搭子</h3>
                <p className="text-sm leading-6 text-gray-500">
                  测试社交电量、维护成本和边界感，看看你更适合和什么样的朋友长期同频。
                </p>
              </div>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
