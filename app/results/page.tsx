"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Download, Heart, RefreshCcw, Sparkles, Star, Users } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import type { FriendshipTraits, PersonalityTraits, QuizMode } from "@/app/data/types";
import {
  FRIENDSHIP_DEFAULT_PROFILE,
  FRIENDSHIP_TITLE_MAP,
  FRIENDSHIP_TRAIT_META,
  RESULTS_MODE_CONFIG,
  RESULTS_TEXT,
  ROMANCE_DEFAULT_PROFILE,
  ROMANCE_TITLE_MAP,
  ROMANCE_TRAIT_META,
  type TitleDescriptionEntry,
  type TraitMetaItem,
} from "@/app/data/resultsContent";

function clampTrait(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 5;
  return Math.max(0, Math.min(10, num));
}

function detectQuizMode(value: string | null): QuizMode {
  return value === "friendship" ? "friendship" : "romance";
}

function parseProfile(raw: string | null, defaults: Record<string, number>) {
  if (!raw) return { ...defaults };

  const tryParse = (text: string) => {
    try {
      const data = JSON.parse(text) as Record<string, unknown>;
      return Object.keys(defaults).reduce((acc, key) => {
        acc[key] = clampTrait(data[key]);
        return acc;
      }, {} as Record<string, number>);
    } catch {
      return null;
    }
  };

  const direct = tryParse(raw);
  if (direct) return direct;

  const decoded = tryParse(decodeURIComponent(raw));
  if (decoded) return decoded;

  return { ...defaults };
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

function getTopAndBottomTraits(profile: Record<string, number>, meta: TraitMetaItem[]) {
  const sorted = [...meta].sort((a, b) => (profile[b.key] ?? 0) - (profile[a.key] ?? 0));
  return {
    top: sorted.slice(0, 3),
    bottom: [...sorted].reverse().slice(0, 3),
  };
}

function getTitleAndDescription(
  profile: Record<string, number>,
  meta: TraitMetaItem[],
  titleMap: Record<string, TitleDescriptionEntry>
) {
  const dominantTrait = [...meta].sort((a, b) => (profile[b.key] ?? 0) - (profile[a.key] ?? 0))[0];
  const score = profile[dominantTrait.key] ?? 5;
  const entry = titleMap[dominantTrait.key];

  if (score >= 7) return { title: entry.high, description: entry.highDesc };
  if (score >= 4) return { title: entry.mid, description: entry.midDesc };
  return { title: entry.low, description: entry.lowDesc };
}

function buildHighlights(profile: Record<string, number>, meta: TraitMetaItem[]) {
  const { top, bottom } = getTopAndBottomTraits(profile, meta);

  const strengths = top.map((item) => {
    const score = profile[item.key] ?? 5;
    const level = getTraitLevel(score);
    return `${item.label}：${item.summaries[level]}`;
  });

  const growthAreas = bottom.map((item) => {
    const score = profile[item.key] ?? 5;
    const level = getTraitLevel(score);
    return `${item.label}：${item.details[level]}`;
  });

  return { strengths, growthAreas };
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [downloading, setDownloading] = useState(false);
  const [activeTraitKey, setActiveTraitKey] = useState<string | null>(null);

  const mode = detectQuizMode(searchParams.get("mode"));
  const modeConfig = RESULTS_MODE_CONFIG[mode];
  const defaults =
    mode === "friendship"
      ? (FRIENDSHIP_DEFAULT_PROFILE as unknown as Record<string, number>)
      : (ROMANCE_DEFAULT_PROFILE as unknown as Record<string, number>);
  const traitMeta = mode === "friendship" ? FRIENDSHIP_TRAIT_META : ROMANCE_TRAIT_META;
  const titleMap = mode === "friendship" ? FRIENDSHIP_TITLE_MAP : ROMANCE_TITLE_MAP;

  const profile = useMemo(() => parseProfile(searchParams.get("profile"), defaults), [defaults, searchParams]);
  const chartData = useMemo(
    () => traitMeta.map((item) => ({ trait: item.label, value: profile[item.key] ?? 5 })),
    [profile, traitMeta]
  );

  const traitCards = useMemo(
    () =>
      traitMeta.map((item) => {
        const score = profile[item.key] ?? 5;
        const level = getTraitLevel(score);
        return {
          ...item,
          score,
          shortSummary: item.summaries[level],
          detail: item.details[level],
        };
      }),
    [profile, traitMeta]
  );

  const activeTrait = activeTraitKey ? traitCards.find((item) => item.key === activeTraitKey) ?? null : null;
  const { title, description } = getTitleAndDescription(profile, traitMeta, titleMap);
  const { strengths, growthAreas } = buildHighlights(profile, traitMeta);

  const downloadResultCard = async () => {
    if (downloading) return;

    setDownloading(true);
    try {
      const params = new URLSearchParams({
        mode: "results",
        quizMode: mode,
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
      link.download = `datematch-${mode}-${Date.now()}.png`;
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
      <BackButton className="left-4 top-4 z-50" />

      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700">
            <div className="rounded-xl border border-pink-100 bg-white p-2 shadow-sm">
              {mode === "friendship" ? <Users className="h-5 w-5 text-sky-500" /> : <Heart className="h-5 w-5 text-pink-500" fill="currentColor" />}
            </div>
            <span className="text-xl font-bold">DateMatch</span>
          </Link>
          <Button variant="outline" onClick={() => router.push(`/quiz?mode=${mode}`)} className="rounded-full bg-white/80">
            <RefreshCcw className="mr-2 h-4 w-4" /> {RESULTS_TEXT.retake}
          </Button>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/70 bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-4 py-1.5 text-sm font-semibold text-pink-600">
            {mode === "friendship" ? <Users className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {modeConfig.badgeText}
          </div>
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
            {modeConfig.titlePrefix}
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
              <h3 className="text-sm font-semibold text-gray-900">{RESULTS_TEXT.traitOverview}</h3>
              <p className="mt-1 hidden text-xs text-gray-500 md:block">{RESULTS_TEXT.hoverHintDesktop}</p>
              <p className="mt-1 text-xs text-gray-500 md:hidden">{RESULTS_TEXT.hoverHintMobile}</p>
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
                <span className="text-sm font-semibold">{RESULTS_TEXT.mobileDetailTitle}</span>
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
              {RESULTS_TEXT.strengths}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {strengths.map((item, index) => (
                <li key={index}>• {item}</li>
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
              {RESULTS_TEXT.growth}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {growthAreas.map((item, index) => (
                <li key={index}>• {item}</li>
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
            {modeConfig.compatibilityTitle}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-bold text-green-600">{modeConfig.bestMatchTitle}</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {modeConfig.bestMatches.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-bold text-rose-600">{modeConfig.challengeTitle}</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {modeConfig.challengingMatches.map((item, index) => (
                  <li key={index}>• {item}</li>
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
            <Download className="mr-2 h-4 w-4" /> {downloading ? RESULTS_TEXT.generating : RESULTS_TEXT.saveCard}
          </Button>
          <Button
            onClick={() => router.push(modeConfig.primaryActionHref)}
            className="h-12 flex-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
          >
            {modeConfig.primaryActionLabel} <ArrowRight className="ml-2 h-4 w-4" />
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
          <div className="text-gray-600">{RESULTS_TEXT.loading}</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
