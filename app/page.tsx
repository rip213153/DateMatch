"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, Heart, MailCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  nextMatch: Date;
};

const MATCH_DAY = 5; // 周五
const MATCH_HOUR = 18;
const MATCH_MINUTE = 0;
const DISPLAY_DAYS = 5; // 匹配结果展示 5 天

function getNextMatchTime(now: Date): Date {
  // 计算本周五的时间
  const thisFriday = new Date(now);
  const daysSinceFriday = (now.getDay() - MATCH_DAY + 7) % 7;
  thisFriday.setDate(now.getDate() - daysSinceFriday);
  thisFriday.setHours(MATCH_HOUR, MATCH_MINUTE, 0, 0);
  
  // 计算下周五的时间
  const nextFriday = new Date(thisFriday);
  nextFriday.setDate(nextFriday.getDate() + 7);
  
  // 匹配时间 = 本周五 18:00
  const matchTime = thisFriday.getTime();
  
  // 展示结束时间 = 匹配时间 + 5 天
  const displayEndTime = matchTime + (DISPLAY_DAYS * 24 * 60 * 60 * 1000);
  
  // 如果当前时间还没到本周五匹配时间，返回本周五
  if (now.getTime() < matchTime) {
    return thisFriday;
  }
  
  // 如果当前时间已经超过展示期，返回下周五
  if (now.getTime() >= displayEndTime) {
    return nextFriday;
  }
  
  // 如果当前时间在展示期内，仍然返回下周五（因为这是下一轮匹配）
  return nextFriday;
}

function getCountdownState(now: Date = new Date()): CountdownState {
  const nextMatch = getNextMatchTime(now);
  const diffMs = Math.max(0, nextMatch.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    days: Math.floor(totalSeconds / (24 * 60 * 60)),
    hours: Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60)),
    minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
    seconds: totalSeconds % 60,
    nextMatch,
  };
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
          <span>距离下一次匹配开放</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[0, 0, 0, 0].map((_, i) => (
            <div key={i} className="rounded-xl bg-white/90 py-2 text-center">
              <div className="text-xl font-bold tabular-nums text-gray-800">00</div>
              <div className="text-xs text-gray-500">{["天", "时", "分", "秒"][i]}</div>
            </div>
          ))}
        </div>

        <div className="mt-2 text-center text-xs text-gray-500">
          每周五 18:00 开放匹配
        </div>
      </div>
    );
  }

  const countdownItems = [
    { label: "天", value: countdown.days },
    { label: "时", value: countdown.hours },
    { label: "分", value: countdown.minutes },
    { label: "秒", value: countdown.seconds },
  ];

  return (
    <div className="mb-7 rounded-2xl border border-pink-100/70 bg-white/70 px-4 py-4 shadow-sm">
      <div className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold text-pink-600">
        <Clock3 className="h-4 w-4" />
        <span>距离下一次匹配开放</span>
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
        每周五 18:00 开放匹配，下一次：
        {countdown.nextMatch.toLocaleString("zh-CN", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </div>
    </div>
  );
}

function BackgroundEffects() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#faf8f9]" />
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-pink-300/40 blur-[100px] mix-blend-multiply"
      />
      <motion.div
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 50, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-10%] top-[20%] h-[60%] w-[40%] rounded-full bg-purple-300/40 blur-[100px] mix-blend-multiply"
      />
    </div>
  );
}

export default function Home() {
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

          <h1 className="mb-3 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
            测一测，你的正缘
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">何时出现</span>
          </h1>

          <p className="mb-7 text-gray-600">
            基于多维人格和校园标签，快速找到同频的人。先完成测试，再查看匹配结果与聊天入口。
          </p>

          <MatchCountdown />

          <Link href="/quiz" className="block">
            <Button className="group h-14 w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-lg font-bold text-white hover:from-pink-600 hover:to-purple-700">
              <span className="flex items-center gap-2">
                开始测试
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>

          <p className="mt-3 text-center text-xs text-gray-500">仅需 2 分钟，马上看到匹配结果</p>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="mb-3 text-center text-sm text-gray-600">已经测试过了？</p>
            <Link href="/login?redirect=/dev-channel-2" className="block">
              <Button
                variant="outline"
                className="h-12 w-full rounded-full border-pink-200 bg-white/80 text-pink-600 backdrop-blur-md hover:bg-pink-50"
              >
                <MailCheck className="mr-2 h-4 w-4" />
                登录查看匹配结果
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}