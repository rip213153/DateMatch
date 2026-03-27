"use client";

import Link from "next/link";
import { ArrowRight, Heart, MailCheck, Sparkles } from "lucide-react";
import { MatchCountdown } from "@/components/home/match-countdown";
import { Button } from "@/components/ui/button";

type HomeHeroSectionProps = {
  onStartTest: () => void;
};

export function HomeHeroSection({ onStartTest }: HomeHeroSectionProps) {
  return (
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
          onClick={onStartTest}
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
  );
}
