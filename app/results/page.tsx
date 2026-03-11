﻿﻿﻿﻿﻿﻿"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Download, Heart, RefreshCcw, Sparkles, Star } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { PersonalityTraits } from "@/app/data/types";

const TEXT = {
  retake: "重测",
  resultTitle: "恋爱多维图谱",
  traitOverview: "八维速览",
  hoverHintDesktop: "悬浮卡片查看详细说明",
  hoverHintMobile: "点一下卡片展开详细说明",
  strengths: "关系优势",
  growth: "成长机会",
  compatibility: "兼容性档案",
  bestMatch: "最佳匹配",
  challenge: "潜在挑战",
  saveCard: "保存专属卡片",
  generating: "生成中...",
  findSoulmate: "去遇见灵魂伴侣",
  mobileDetailTitle: "维度说明",
  loading: "Loading...",
};

const DEFAULT_PROFILE: PersonalityTraits = {
  socialStyle: 5,
  emotionalReadiness: 5,
  dateStyle: 5,
  commitment: 5,
  communication: 5,
  independence: 5,
  career: 5,
  flexibility: 5,
};

type TraitMetaItem = {
  key: keyof PersonalityTraits;
  label: string;
  fillClass: string;
  chipClass: string;
  panelClass: string;
  summaries: [string, string, string];
  details: [string, string, string];
};

const TRAIT_META: TraitMetaItem[] = [
  {
    key: "socialStyle",
    label: "社交",
    fillClass: "bg-sky-500",
    chipClass: "bg-sky-50 text-sky-700 ring-sky-100",
    panelClass: "border-sky-100 bg-sky-50/80 text-sky-900",
    summaries: ["慢热但重质量", "社交节奏自然", "自带连接磁场"],
    details: [
      "你更适合从低压力、一对一的场景慢慢熟起来，熟悉感建立后反而更稳定。",
      "你既能接住热闹氛围，也能留出独处空间，关系推进通常比较舒服。",
      "你很会把关系带出起点，主动性和场域感都不错，容易让对方快速放松。",
    ],
  },
  {
    key: "emotionalReadiness",
    label: "情感",
    fillClass: "bg-rose-500",
    chipClass: "bg-rose-50 text-rose-700 ring-rose-100",
    panelClass: "border-rose-100 bg-rose-50/80 text-rose-900",
    summaries: ["先观察再投入", "情绪感知在线", "能稳住关系氛围"],
    details: [
      "你在确认安全感前会先观察，不急着投入，但一旦确定通常会更认真。",
      "你能察觉情绪变化，也愿意处理关系里的细节，是比较稳定的相处型。",
      "你对情绪的识别和消化能力较强，遇到摩擦时更容易把关系稳住。",
    ],
  },
  {
    key: "dateStyle",
    label: "约会",
    fillClass: "bg-fuchsia-500",
    chipClass: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
    panelClass: "border-fuchsia-100 bg-fuchsia-50/80 text-fuchsia-900",
    summaries: ["偏谨慎试探", "约会偏自然派", "敢主动制造火花"],
    details: [
      "你不太会贸然推进，更看重是否聊得来、相处是否舒服，再决定要不要继续。",
      "你在约会里不追求太夸张的表演感，更偏好真实、自然、能落地的互动。",
      "你对推进关系有行动力，也愿意创造记忆点，恋爱氛围感通常会比较强。",
    ],
  },
  {
    key: "commitment",
    label: "承诺",
    fillClass: "bg-emerald-500",
    chipClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    panelClass: "border-emerald-100 bg-emerald-50/80 text-emerald-900",
    summaries: ["节奏偏慢", "稳定感不错", "长期投入意愿强"],
    details: [
      "你对承诺更谨慎，通常需要更多相处样本来确认这段关系值不值得投入。",
      "你对关系有稳定意识，愿意在确认合适后维持一致和持续的投入。",
      "你重视长期感和确定性，适合和同样认真、节奏清晰的人往前走。",
    ],
  },
  {
    key: "communication",
    label: "沟通",
    fillClass: "bg-cyan-500",
    chipClass: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    panelClass: "border-cyan-100 bg-cyan-50/80 text-cyan-900",
    summaries: ["更适合慢慢聊开", "表达基本顺畅", "很会把话说到点上"],
    details: [
      "你可能不是一开始就很会表达，但在放松的关系里会越来越敢说真心话。",
      "你在表达需求和回应情绪上比较均衡，关系里通常不容易积压太多误会。",
      "你擅长把感受说清楚，也更容易让对方听懂你的边界和认真程度。",
    ],
  },
  {
    key: "independence",
    label: "独立",
    fillClass: "bg-amber-500",
    chipClass: "bg-amber-50 text-amber-700 ring-amber-100",
    panelClass: "border-amber-100 bg-amber-50/80 text-amber-900",
    summaries: ["关系参与感更强", "亲密与自我较平衡", "边界感很清晰"],
    details: [
      "你比较享受高参与感的亲密关系，也更需要对方给到及时回应和陪伴。",
      "你能兼顾亲密感和个人节奏，既不会太黏，也不会让人觉得过度疏离。",
      "你很清楚自己的空间需求，适合和尊重边界、不过度消耗的人相处。",
    ],
  },
  {
    key: "career",
    label: "事业",
    fillClass: "bg-violet-500",
    chipClass: "bg-violet-50 text-violet-700 ring-violet-100",
    panelClass: "border-violet-100 bg-violet-50/80 text-violet-900",
    summaries: ["更看重当下体验", "生活目标较均衡", "目标感很明确"],
    details: [
      "你现阶段更在意生活体验和关系感受，事业不是唯一优先级。",
      "你对未来有方向，也愿意兼顾感情和生活，整体节奏相对均衡。",
      "你目标感和执行感都比较强，适合和理解成长节奏的人建立关系。",
    ],
  },
  {
    key: "flexibility",
    label: "适应",
    fillClass: "bg-lime-500",
    chipClass: "bg-lime-50 text-lime-700 ring-lime-100",
    panelClass: "border-lime-100 bg-lime-50/80 text-lime-900",
    summaries: ["偏爱熟悉节奏", "能接住适度变化", "适应力和包容度高"],
    details: [
      "你会更偏好熟悉、可预期的相处方式，关系里也更希望节奏明确一些。",
      "你能接受关系里的变化，也愿意为了磨合做调整，整体弹性不错。",
      "你面对计划变动和差异时较从容，通常能把关系往更顺滑的方向带。",
    ],
  },
];

function clampTrait(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 5;
  return Math.max(0, Math.min(10, num));
}

function parseProfile(raw: string | null): PersonalityTraits {
  if (!raw) return { ...DEFAULT_PROFILE };

  const tryParse = (text: string): PersonalityTraits | null => {
    try {
      const data = JSON.parse(text) as Partial<Record<keyof PersonalityTraits, unknown>>;
      return {
        socialStyle: clampTrait(data.socialStyle),
        emotionalReadiness: clampTrait(data.emotionalReadiness),
        dateStyle: clampTrait(data.dateStyle),
        commitment: clampTrait(data.commitment),
        communication: clampTrait(data.communication),
        independence: clampTrait(data.independence),
        career: clampTrait(data.career),
        flexibility: clampTrait(data.flexibility),
      };
    } catch {
      return null;
    }
  };

  const direct = tryParse(raw);
  if (direct) return direct;

  const decoded = tryParse(decodeURIComponent(raw));
  if (decoded) return decoded;

  return { ...DEFAULT_PROFILE };
}

function getTraitLevel(value: number): 0 | 1 | 2 {
  if (value >= 7) return 2;
  if (value >= 4) return 1;
  return 0;
}

function BackgroundEffects() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#faf8f9]" />
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-pink-300/40 blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -40, 30, 0], y: [0, 50, -20, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-10%] top-[20%] h-[60%] w-[40%] rounded-full bg-purple-300/40 blur-[100px]"
      />
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [downloading, setDownloading] = useState(false);
  const [activeTraitKey, setActiveTraitKey] = useState<keyof PersonalityTraits | null>(null);

  const profile = useMemo(() => {
    const param = searchParams.get("profile");
    if (param) return parseProfile(param);
    return { ...DEFAULT_PROFILE };
  }, [searchParams]);

  const chartData = useMemo(
    () => TRAIT_META.map((item) => ({ trait: item.label, value: profile[item.key] })),
    [profile]
  );

  const traitCards = useMemo(
    () =>
      TRAIT_META.map((item) => {
        const score = profile[item.key];
        const level = getTraitLevel(score);
        return {
          ...item,
          score,
          shortSummary: item.summaries[level],
          detail: item.details[level],
        };
      }),
    [profile]
  );

  const activeTrait = activeTraitKey ? traitCards.find((item) => item.key === activeTraitKey) ?? null : null;

  // 根据人格特质生成动态标题和描述
  const getProfileTitleAndDescription = () => {
    const scores = profile;
    const highScores = Object.entries(scores).filter(([, value]) => value >= 7);
    const lowScores = Object.entries(scores).filter(([, value]) => value <= 3);
    
    // 根据最高分的特质决定主标题
    const dominantTrait = highScores.length > 0 ? highScores[0][0] : Object.keys(scores)[0];
    
    const titles: Record<string, string> = {
      socialStyle: scores.socialStyle >= 7 ? "社交达人" : scores.socialStyle <= 3 ? "深度连接者" : "平衡社交家",
      emotionalReadiness: scores.emotionalReadiness >= 7 ? "情感投入者" : scores.emotionalReadiness <= 3 ? "理性观察者" : "情感平衡者",
      dateStyle: scores.dateStyle >= 7 ? "浪漫制造者" : scores.dateStyle <= 3 ? "谨慎探索者" : "自然约会派",
      commitment: scores.commitment >= 7 ? "长期主义者" : scores.commitment <= 3 ? "自由随性派" : "稳定发展者",
      communication: scores.communication >= 7 ? "沟通高手" : scores.communication <= 3 ? "内敛倾听者" : "真诚表达者",
      independence: scores.independence >= 7 ? "独立自我者" : scores.independence <= 3 ? "亲密依赖型" : "平衡独立者",
      career: scores.career >= 7 ? "事业追求者" : scores.career <= 3 ? "生活享受家" : "工作生活平衡者",
      flexibility: scores.flexibility >= 7 ? "灵活适应者" : scores.flexibility <= 3 ? "稳定偏好者" : "弹性平衡者",
    };
    
    const descriptions: Record<string, string> = {
      socialStyle: scores.socialStyle >= 7 
        ? "你天生擅长建立连接，在社交场合中如鱼得水。记得在热闹中也为内心留出安静空间。"
        : scores.socialStyle <= 3
        ? "你更看重深度的情感连接，而非广泛的社交网络。一对一的交流让你更容易展现真实的自己。"
        : "你既能享受社交的乐趣，也需要独处的时光。这种平衡让你在关系中既亲切又独立。",
      
      emotionalReadiness: scores.emotionalReadiness >= 7
        ? "你对感情投入认真，愿意为关系付出真心。保持这份热忱，同时记得照顾好自己的情感需求。"
        : scores.emotionalReadiness <= 3
        ? "你在感情中保持理性，不轻易被情绪左右。试着偶尔放下防备，让真心有机会靠近。"
        : "你在感性和理性之间找到平衡，既能感受情绪流动，也能保持清醒判断。",
      
      dateStyle: scores.dateStyle >= 7
        ? "你敢于主动制造浪漫，为关系创造美好回忆。你的行动力让爱情充满惊喜和温度。"
        : scores.dateStyle <= 3
        ? "你偏好慢慢了解对方，不急于推进关系。这种谨慎让你更容易找到真正合适的人。"
        : "你的约会风格自然舒适，既不刻意也不被动。真实的相处让你和对方都感到放松。",
      
      commitment: scores.commitment >= 7
        ? "你重视承诺和长期关系，愿意为爱情持续投入。你的稳定性是伴侣最安心的依靠。"
        : scores.commitment <= 3
        ? "你享受当下的自由和轻松，不喜欢被束缚。随性的态度让你更容易体验爱情的多种可能。"
        : "你对关系有适度的期待，既不过度依赖也不刻意疏离。这种平衡让感情自然生长。",
      
      communication: scores.communication >= 7
        ? "你善于表达感受和需求，也懂得倾听对方。良好的沟通能力让你的关系更加顺畅。"
        : scores.communication <= 3
        ? "你更习惯用行动而非言语表达情感。试着多分享内心想法，让对方更懂你的真心。"
        : "你在表达和倾听之间找到平衡，既能说清楚自己，也能理解对方的需求。",
      
      independence: scores.independence >= 7
        ? "你很清楚自己的边界和需求，在关系中保持独立自我。这种清晰让感情更健康持久。"
        : scores.independence <= 3
        ? "你享受高参与感的亲密关系，需要对方的陪伴和回应。试着也为彼此留出一些独立空间。"
        : "你既能享受亲密也能保持独立，这种平衡让你在关系中既温暖又自在。",
      
      career: scores.career >= 7
        ? "你有明确的目标和执行力，在事业上不断追求成长。理解你的野心的人会是最棒的伴侣。"
        : scores.career <= 3
        ? "你更看重生活体验和当下感受，不被事业绑架。这种生活态度让你更容易发现小确幸。"
        : "你在事业和生活之间找到平衡点，既有追求也懂享受。这种节奏让你更有魅力。",
      
      flexibility: scores.flexibility >= 7
        ? "你适应力强，能从容应对关系中的变化和挑战。这种包容力让感情更加稳固。"
        : scores.flexibility <= 3
        ? "你偏好稳定和可预期的关系节奏，这让你更有安全感。明确边界会让相处更舒适。"
        : "你既有原则也能包容差异，在坚持和妥协之间找到平衡。这种弹性让关系更和谐。",
    };
    
    return {
      title: titles[dominantTrait] || "独特魅力者",
      description: descriptions[dominantTrait] || "你的独特人格决定了你的恋爱方式，保持真诚与沟通会让关系更稳定。",
    };
  };
  
  const { title, description } = getProfileTitleAndDescription();

  const strengths = [
    "擅长建立社交连接",
    "情感表达较稳定",
    "责任意识较强",
    "适应变化能力较好",
  ];

  const growthAreas = [
    "尝试更早说清需求",
    "练习冲突中先表达感受",
    "保持稳定但有弹性的节奏",
    "定期回顾关系沟通质量",
  ];

  const compatibility = {
    bestMatches: ["偏好坦诚沟通的人", "愿意进行稳定投入的人"],
    challengingMatches: ["沟通方式过于对抗的人", "节奏过快且缺乏边界感的人"],
  };

  const downloadResultCard = async () => {
    if (downloading) return;

    setDownloading(true);
    try {
      const params = new URLSearchParams({
        mode: "results",
        title,
        description,
        profile: JSON.stringify(profile),
      });

      const response = await fetch(`/api/og?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.status}`);
      }

      const blob = await response.blob();
      if (!blob.size) {
        throw new Error("Generated image is empty");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `datematch-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error("download card failed", error);
      alert("生成图片失败，请稍后重试");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundEffects />
      <BackButton className="top-4 left-4 z-50" />

      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700">
            <div className="rounded-xl border border-pink-100 bg-white p-2 shadow-sm">
              <Heart className="h-5 w-5 text-pink-500" fill="currentColor" />
            </div>
            <span className="text-xl font-bold">DateMatch</span>
          </Link>
          <Button variant="outline" onClick={() => router.push("/quiz")} className="rounded-full bg-white/80">
            <RefreshCcw className="mr-2 h-4 w-4" /> {TEXT.retake}
          </Button>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/70 bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl"
        >
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900">{title}</h1>
          <p className="mx-auto max-w-lg leading-relaxed text-gray-600">{description}</p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
          className="rounded-[2rem] border border-white/70 bg-white/60 p-8 shadow-xl backdrop-blur-xl md:mb-20"
        >
          <h2 className="mb-6 flex items-center text-xl font-bold text-gray-900">
            <Sparkles className="mr-2 text-pink-500" />
            {TEXT.resultTitle}
          </h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#fbcfe8" />
                <PolarAngleAxis dataKey="trait" tick={{ fill: "#4b5563", fontSize: 13 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{TEXT.traitOverview}</h3>
              <p className="mt-1 hidden text-xs text-gray-500 md:block">{TEXT.hoverHintDesktop}</p>
              <p className="mt-1 text-xs text-gray-500 md:hidden">{TEXT.hoverHintMobile}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {traitCards.map((item) => (
              <div key={item.key} className="group relative">
                <button
                  type="button"
                  onClick={() => setActiveTraitKey((current) => (current === item.key ? null : item.key))}
                  className="flex min-h-[136px] w-full flex-col justify-between rounded-[1.5rem] border border-white/70 bg-white/85 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                  aria-pressed={activeTraitKey === item.key}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${item.chipClass}`}>
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-gray-700">{item.score.toFixed(1)}</span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${item.fillClass}`} style={{ width: `${(item.score / 10) * 100}%` }} />
                  </div>

                  <p className="mt-4 text-sm font-medium leading-6 text-gray-800">{item.shortSummary}</p>
                </button>

                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 hidden w-[240px] -translate-x-1/2 -translate-y-3 rounded-2xl border border-pink-100 bg-white/95 p-4 text-sm leading-6 text-gray-700 opacity-0 shadow-xl backdrop-blur transition duration-200 group-hover:-translate-y-4 group-hover:opacity-100 md:block">
                  {item.detail}
                </div>
              </div>
            ))}
          </div>

          {activeTrait ? (
            <div className={`mt-4 rounded-[1.5rem] border p-4 text-sm leading-6 shadow-sm md:hidden ${activeTrait.panelClass}`}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{TEXT.mobileDetailTitle}</span>
                <span className="text-xs font-bold uppercase tracking-[0.2em]">{activeTrait.label}</span>
              </div>
              <p>{activeTrait.detail}</p>
            </div>
          ) : null}
        </motion.section>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="rounded-[2rem] border border-green-100 bg-white/60 p-6 shadow-md backdrop-blur-sm"
          >
            <h3 className="mb-4 flex items-center font-bold text-green-700">
              <Star className="mr-1 h-4 w-4" />
              {TEXT.strengths}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {strengths.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="rounded-[2rem] border border-purple-100 bg-white/60 p-6 shadow-md backdrop-blur-sm"
          >
            <h3 className="mb-4 flex items-center font-bold text-purple-700">
              <Sparkles className="mr-1 h-4 w-4" />
              {TEXT.growth}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {growthAreas.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-[2rem] border border-white/70 bg-white/60 p-8 shadow-lg backdrop-blur-xl"
        >
          <h2 className="mb-6 flex items-center text-xl font-bold text-gray-900">
            <Sparkles className="mr-2 text-pink-500" />
            {TEXT.compatibility}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-bold text-green-600">{TEXT.bestMatch}</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {compatibility.bestMatches.map((m, i) => (
                  <li key={i}>✓ {m}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-bold text-rose-600">{TEXT.challenge}</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {compatibility.challengingMatches.map((m, i) => (
                  <li key={i}>! {m}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Button onClick={downloadResultCard} className="h-12 flex-1 rounded-full bg-white text-pink-600 shadow-md">
            <Download className="mr-2 h-4 w-4" /> {downloading ? TEXT.generating : TEXT.saveCard}
          </Button>
          <Button
            onClick={() => router.push("/find-match")}
            className="h-12 flex-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
          >
            {TEXT.findSoulmate} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.section>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf8f9]">
          <div className="text-gray-600">{TEXT.loading}</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}

