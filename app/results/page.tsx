"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Download, Heart, RefreshCcw, Sparkles, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import type { QuizMode } from "@/app/data/types";
import {
  FRIENDSHIP_DEFAULT_PROFILE,
  FRIENDSHIP_PROFILE_COMPATIBILITY_V2,
  FRIENDSHIP_TITLE_MAP,
  FRIENDSHIP_TRAIT_COPY_V2,
  FRIENDSHIP_TRAIT_META,
  RESULTS_MODE_CONFIG,
  RESULTS_TEXT,
  RESULTS_TEXT_V2,
  ROMANCE_DEFAULT_PROFILE,
  ROMANCE_PROFILE_COMPATIBILITY_V2,
  ROMANCE_TITLE_MAP,
  ROMANCE_TRAIT_COPY_V2,
  ROMANCE_TRAIT_META,
  resolveV2ProfileCopy,
  type TitleDescriptionEntry,
  type TraitMetaItem,
  type V2TraitCopy,
} from "@/app/data/resultsContent";

const TraitRadarChart = dynamic(
  () => import("@/components/results/trait-radar-chart").then((mod) => mod.TraitRadarChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center rounded-[1.5rem] bg-white/60">
        <div className="h-44 w-44 animate-pulse rounded-full border border-pink-100 bg-gradient-to-br from-pink-50 to-purple-50" />
      </div>
    ),
  }
);

type LegacyTraitCard = TraitMetaItem & {
  score: number;
  shortSummary: string;
  detail: string;
};

type V2LevelKey = "high" | "mid" | "low";

type V2TraitCard = {
  key: string;
  label: string;
  hint: string;
  score: number;
  levelKey: V2LevelKey;
  shortSummary: string;
  subtitle: string;
  detail: string;
  fillClass: string;
  chipClass: string;
  panelClass: string;
};

type DisplayModel =
  | {
      kind: "legacy";
      profile: Record<string, number>;
      chartData: Array<{ trait: string; value: number }>;
      title: string;
      description: string;
      radarTitle: string;
      radarHintDesktop: string;
      radarHintMobile: string;
      strengthsTitle: string;
      growthTitle: string;
      summaryTitle: string;
      summaryText: string;
      closingText: string;
      traitCards: LegacyTraitCard[];
      strengths: Array<{ key: string; label: string; summary: string; detail: string }>;
      growthAreas: string[];
      activeTrait: LegacyTraitCard | null;
    }
  | {
      kind: "v2";
      profile: Record<string, number>;
      chartData: Array<{ trait: string; value: number }>;
      title: string;
      description: string;
      radarTitle: string;
      radarHintDesktop: string;
      radarHintMobile: string;
      strengthsTitle: string;
      growthTitle: string;
      summaryTitle: string;
      summaryText: string;
      closingText: string;
      traitCards: V2TraitCard[];
      strengths: Array<{ key: string; label: string; summary: string; detail: string }>;
      growthAreas: string[];
      activeTrait: V2TraitCard | null;
      profileStrengths: string;
      profileUnderStress: string;
      bestMatches: string[];
      challengingMatches: string[];
      compatibilityIntro: string;
      bestMatchesIntro: string;
      challengingMatchesIntro: string;
    };

const V2_CARD_STYLES = [
  {
    fillClass: "bg-sky-500",
    chipClass: "bg-sky-50 text-sky-700 ring-sky-100",
    panelClass: "border-sky-100 bg-sky-50/80 text-sky-900",
  },
  {
    fillClass: "bg-rose-500",
    chipClass: "bg-rose-50 text-rose-700 ring-rose-100",
    panelClass: "border-rose-100 bg-rose-50/80 text-rose-900",
  },
  {
    fillClass: "bg-emerald-500",
    chipClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    panelClass: "border-emerald-100 bg-emerald-50/80 text-emerald-900",
  },
  {
    fillClass: "bg-amber-500",
    chipClass: "bg-amber-50 text-amber-700 ring-amber-100",
    panelClass: "border-amber-100 bg-amber-50/80 text-amber-900",
  },
  {
    fillClass: "bg-fuchsia-500",
    chipClass: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
    panelClass: "border-fuchsia-100 bg-fuchsia-50/80 text-fuchsia-900",
  },
  {
    fillClass: "bg-cyan-500",
    chipClass: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    panelClass: "border-cyan-100 bg-cyan-50/80 text-cyan-900",
  },
  {
    fillClass: "bg-violet-500",
    chipClass: "bg-violet-50 text-violet-700 ring-violet-100",
    panelClass: "border-violet-100 bg-violet-50/80 text-violet-900",
  },
  {
    fillClass: "bg-lime-500",
    chipClass: "bg-lime-50 text-lime-700 ring-lime-100",
    panelClass: "border-lime-100 bg-lime-50/80 text-lime-900",
  },
] as const;

function clampTrait(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 5;
  return Math.max(0, Math.min(10, num));
}

function detectQuizMode(value: string | null): QuizMode {
  return value === "friendship" ? "friendship" : "romance";
}

function parseRawProfile(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;

  const tryParse = (text: string) => {
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      return null;
    }
  };

  return tryParse(raw) ?? tryParse(decodeURIComponent(raw));
}

function parseProfileWithDefaults(rawProfile: Record<string, unknown> | null, defaults: Record<string, number>) {
  return Object.keys(defaults).reduce((acc, key) => {
    acc[key] = clampTrait(rawProfile?.[key]);
    return acc;
  }, {} as Record<string, number>);
}

function buildNeutralProfile(traits: V2TraitCopy[]) {
  return traits.reduce<Record<string, number>>((acc, trait) => {
    acc[trait.key] = 5;
    return acc;
  }, {});
}

function countMatchingKeys(rawProfile: Record<string, unknown> | null, keys: string[]) {
  if (!rawProfile) return 0;
  return keys.reduce((count, key) => count + (key in rawProfile ? 1 : 0), 0);
}

function getTraitLevel(value: number): 0 | 1 | 2 {
  if (value >= 7) return 2;
  if (value >= 4) return 1;
  return 0;
}

function getV2LevelKey(value: number): V2LevelKey {
  if (value >= 7) return "high";
  if (value >= 4) return "mid";
  return "low";
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

function buildLegacyHighlights(profile: Record<string, number>, meta: TraitMetaItem[]) {
  const { top, bottom } = getTopAndBottomTraits(profile, meta);

  const strengths = top.map((item) => {
    const score = profile[item.key] ?? 5;
    const level = getTraitLevel(score);
    return {
      key: item.key,
      label: item.label,
      summary: item.summaries[level],
      detail: item.details[level],
    };
  });

  const growthAreas = bottom.map((item) => {
    const score = profile[item.key] ?? 5;
    const level = getTraitLevel(score);
    return `${item.label}：${item.details[level]}`;
  });

  return { strengths, growthAreas };
}

function buildV2Highlights(profile: Record<string, number>, traits: V2TraitCopy[]) {
  const sorted = [...traits].sort((a, b) => (profile[b.key] ?? 0) - (profile[a.key] ?? 0));
  const top = sorted.slice(0, 3);
  const bottom = [...sorted].reverse().slice(0, 3);

  const strengths = top.map((trait) => {
    const levelKey = getV2LevelKey(profile[trait.key] ?? 5);
    const level = trait.levels[levelKey];
    return {
      key: trait.key,
      label: trait.label,
      summary: level.title,
      detail: level.description,
    };
  });

  const growthAreas = bottom.map((trait) => {
    const levelKey = getV2LevelKey(profile[trait.key] ?? 5);
    return `${trait.label}：${trait.levels[levelKey].description}`;
  });

  return { strengths, growthAreas };
}

function buildLegacyDisplayModel(
  mode: QuizMode,
  rawProfile: Record<string, unknown> | null,
  activeTraitKey: string | null
): DisplayModel {
  const defaults =
    mode === "friendship"
      ? (FRIENDSHIP_DEFAULT_PROFILE as unknown as Record<string, number>)
      : (ROMANCE_DEFAULT_PROFILE as unknown as Record<string, number>);
  const traitMeta = mode === "friendship" ? FRIENDSHIP_TRAIT_META : ROMANCE_TRAIT_META;
  const titleMap = mode === "friendship" ? FRIENDSHIP_TITLE_MAP : ROMANCE_TITLE_MAP;
  const profile = parseProfileWithDefaults(rawProfile, defaults);
  const chartData = traitMeta.map((item) => ({ trait: item.label, value: profile[item.key] ?? 5 }));
  const traitCards = traitMeta.map((item) => {
    const score = profile[item.key] ?? 5;
    const level = getTraitLevel(score);
    return {
      ...item,
      score,
      shortSummary: item.summaries[level],
      detail: item.details[level],
    };
  });
  const activeTrait = activeTraitKey ? traitCards.find((item) => item.key === activeTraitKey) ?? null : null;
  const { title, description } = getTitleAndDescription(profile, traitMeta, titleMap);
  const { strengths, growthAreas } = buildLegacyHighlights(profile, traitMeta);

  return {
    kind: "legacy",
    profile,
    chartData,
    title,
    description,
    radarTitle: RESULTS_TEXT.traitOverview,
    radarHintDesktop: RESULTS_TEXT.hoverHintDesktop,
    radarHintMobile: RESULTS_TEXT.hoverHintMobile,
    strengthsTitle: RESULTS_TEXT.strengths,
    growthTitle: RESULTS_TEXT.growth,
    summaryTitle: mode === "friendship" ? "友情画像摘要" : "亲密关系摘要",
    summaryText: description,
    closingText:
      mode === "friendship"
        ? "舒服的友情，往往不是最热闹的那种，而是你能自然待在里面的那种。"
        : "真正适合你的关系，不只是有火花，也会让你在靠近时越来越像自己。",
    traitCards,
    strengths,
    growthAreas,
    activeTrait,
  };
}

function buildV2DisplayModel(
  mode: QuizMode,
  rawProfile: Record<string, unknown> | null,
  activeTraitKey: string | null
): DisplayModel {
  const traitCopy = mode === "friendship" ? FRIENDSHIP_TRAIT_COPY_V2 : ROMANCE_TRAIT_COPY_V2;
  const neutralProfile = buildNeutralProfile(traitCopy);
  const profile = parseProfileWithDefaults(rawProfile, neutralProfile);
  const resultsText = RESULTS_TEXT_V2[mode];
  const resolvedProfile = resolveV2ProfileCopy(mode, profile);
  const compatibilityMap =
    mode === "friendship" ? FRIENDSHIP_PROFILE_COMPATIBILITY_V2 : ROMANCE_PROFILE_COMPATIBILITY_V2;
  const compatibility =
    compatibilityMap[resolvedProfile.profile.id] ??
    resolvedProfile.profile.compatibility ?? {
      bestMatches: [],
      challengingMatches: [],
    };
  const compatibilityIntro =
    mode === "friendship"
      ? `${resolvedProfile.profile.title}的你，通常会更自然地靠近某些友情节奏，也会在另一些关系里更容易觉得别扭。`
      : `${resolvedProfile.profile.title}的你，通常会被某些关系气质吸引，也会在某些靠近方式里更容易卡住。`;
  const bestMatchesIntro =
    mode === "friendship"
      ? "这些特质的人，通常更容易让你觉得关系舒服、值得留在生活里："
      : "这些关系气质的人，通常更容易让你愿意继续靠近：";
  const challengingMatchesIntro =
    mode === "friendship"
      ? "而在下面这些友情模式里，你会更容易觉得关系有点费力："
      : "而在下面这些关系模式里，你会更容易感到拉扯或消耗：";
  const chartData = traitCopy.map((item) => ({ trait: item.label, value: profile[item.key] ?? 5 }));
  const traitCards = traitCopy.map((item, index) => {
    const score = profile[item.key] ?? 5;
    const levelKey = getV2LevelKey(score);
    const level = item.levels[levelKey];
    const style = V2_CARD_STYLES[index % V2_CARD_STYLES.length];

    return {
      key: item.key,
      label: item.label,
      hint: item.hint,
      score,
      levelKey,
      shortSummary: level.title,
      subtitle: level.subtitle,
      detail: level.description,
      ...style,
    };
  });
  const activeTrait = activeTraitKey ? traitCards.find((item) => item.key === activeTraitKey) ?? null : null;
  const { strengths, growthAreas } = buildV2Highlights(profile, traitCopy);

  return {
    kind: "v2",
    profile,
    chartData,
    title: resolvedProfile.profile.title,
    description: resolvedProfile.profile.subtitle,
    radarTitle: resultsText.radarTitle,
    radarHintDesktop: resultsText.radarHint,
    radarHintMobile: resultsText.radarHint,
    strengthsTitle: resultsText.strengthsTitle,
    growthTitle: resultsText.growthTitle,
    summaryTitle: resultsText.summaryTitle,
    summaryText: resolvedProfile.profile.summary,
    closingText: resultsText.closingText,
    traitCards,
    strengths,
    growthAreas,
    activeTrait,
    profileStrengths: resolvedProfile.profile.strengths,
    profileUnderStress: resolvedProfile.profile.underStress,
    bestMatches: compatibility.bestMatches,
    challengingMatches: compatibility.challengingMatches,
    compatibilityIntro,
    bestMatchesIntro,
    challengingMatchesIntro,
  };
}

function getResultVersion(mode: QuizMode, rawProfile: Record<string, unknown> | null) {
  const legacyKeys =
    mode === "friendship"
      ? FRIENDSHIP_TRAIT_META.map((item) => item.key)
      : ROMANCE_TRAIT_META.map((item) => item.key);
  const v2Keys =
    mode === "friendship"
      ? FRIENDSHIP_TRAIT_COPY_V2.map((item) => item.key)
      : ROMANCE_TRAIT_COPY_V2.map((item) => item.key);

  const legacyMatches = countMatchingKeys(rawProfile, legacyKeys);
  const v2Matches = countMatchingKeys(rawProfile, v2Keys);

  if (v2Matches > legacyMatches) {
    return "v2";
  }

  return "legacy";
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [downloading, setDownloading] = useState(false);
  const [activeTraitKey, setActiveTraitKey] = useState<string | null>(null);

  const mode = detectQuizMode(searchParams.get("mode"));
  const modeConfig = RESULTS_MODE_CONFIG[mode];
  const rawProfile = useMemo(() => parseRawProfile(searchParams.get("profile")), [searchParams]);
  const resultVersion = useMemo(() => getResultVersion(mode, rawProfile), [mode, rawProfile]);

  const displayModel = useMemo(
    () =>
      resultVersion === "v2"
        ? buildV2DisplayModel(mode, rawProfile, activeTraitKey)
        : buildLegacyDisplayModel(mode, rawProfile, activeTraitKey),
    [activeTraitKey, mode, rawProfile, resultVersion]
  );
  const isV2 = displayModel.kind === "v2";
  const retakeLabel = isV2 ? "重新测一次" : RESULTS_TEXT.retake;
  const saveCardLabel = isV2 ? "保存这张关系画像" : RESULTS_TEXT.saveCard;
  const generatingLabel = isV2 ? "正在生成画像卡片..." : RESULTS_TEXT.generating;
  const mobileDetailTitle = isV2 ? "维度解释" : RESULTS_TEXT.mobileDetailTitle;
  const compatibilitySectionTitle = isV2
    ? mode === "friendship"
      ? "你更容易和什么样的朋友走得久"
      : "你更容易和什么样的人舒服靠近"
    : modeConfig.compatibilityTitle;
  const bestMatchTitle = isV2
    ? mode === "friendship"
      ? "你更容易留住的朋友气质"
      : "你更容易被吸引的关系气质"
    : modeConfig.bestMatchTitle;
  const challengeTitle = isV2
    ? mode === "friendship"
      ? "你更容易觉得费力的友情模式"
      : "你更容易卡住的关系模式"
    : modeConfig.challengeTitle;

  useEffect(() => {
    router.prefetch("/");
    router.prefetch(`/quiz?mode=${mode}`);
    router.prefetch(modeConfig.primaryActionHref);
  }, [mode, modeConfig.primaryActionHref, router]);

  const downloadResultCard = async () => {
    if (downloading) return;

    setDownloading(true);
    try {
      const params = new URLSearchParams({
        mode: "results",
        quizMode: mode,
        title: displayModel.title,
        description: displayModel.description,
        profile: JSON.stringify(displayModel.profile),
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
              {mode === "friendship" ? (
                <Users className="h-5 w-5 text-sky-500" />
              ) : (
                <Heart className="h-5 w-5 text-pink-500" fill="currentColor" />
              )}
            </div>
            <span className="text-xl font-bold">DateMatch</span>
          </Link>
          <Button variant="outline" onClick={() => router.push(`/quiz?mode=${mode}`)} className="rounded-full bg-white/80">
            <RefreshCcw className="mr-2 h-4 w-4" /> {retakeLabel}
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
          <h1 className="mb-3 text-4xl font-extrabold text-gray-900">{displayModel.title}</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-700">{displayModel.description}</p>
          <div className="mx-auto mt-6 max-w-2xl rounded-[1.5rem] border border-white/70 bg-white/75 p-5 text-left shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pink-500">{displayModel.summaryTitle}</p>
            <p className="mt-3 text-sm leading-7 text-gray-700">{displayModel.summaryText}</p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
          className="rounded-[2rem] border border-white/70 bg-white/60 p-8 shadow-xl backdrop-blur-xl md:mb-20"
        >
          <h2 className="mb-6 flex items-center text-xl font-bold text-gray-900">
            <Sparkles className="mr-2 text-pink-500" />
            {displayModel.radarTitle}
          </h2>
          <div className="h-[350px] w-full">
            <TraitRadarChart data={displayModel.chartData} />
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{displayModel.radarTitle}</h3>
              <p className="mt-1 hidden text-xs text-gray-500 md:block">{displayModel.radarHintDesktop}</p>
              <p className="mt-1 text-xs text-gray-500 md:hidden">{displayModel.radarHintMobile}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {displayModel.traitCards.map((item) => (
              <div key={item.key} className="group relative">
                <button
                  type="button"
                  onClick={() => setActiveTraitKey((current) => (current === item.key ? null : item.key))}
                  className="flex min-h-[148px] w-full flex-col justify-between rounded-[1.5rem] border border-white/70 bg-white/85 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-300"
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

                  <div className="mt-4">
                    <p className="text-sm font-medium leading-6 text-gray-800">{item.shortSummary}</p>
                    {"subtitle" in item ? <p className="mt-1 text-xs leading-5 text-gray-500">{item.subtitle}</p> : null}
                  </div>
                </button>

                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 hidden w-[260px] -translate-x-1/2 -translate-y-3 rounded-2xl border border-pink-100 bg-white/95 p-4 text-sm leading-6 text-gray-700 opacity-0 shadow-xl backdrop-blur transition duration-200 group-hover:-translate-y-4 group-hover:opacity-100 md:block">
                  {"subtitle" in item ? <p className="mb-2 font-semibold text-gray-900">{item.subtitle}</p> : null}
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {displayModel.activeTrait ? (
            <div className={`mt-4 rounded-[1.5rem] border p-4 text-sm leading-6 shadow-sm md:hidden ${displayModel.activeTrait.panelClass}`}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{RESULTS_TEXT.mobileDetailTitle}</span>
                <span className="text-xs font-bold uppercase tracking-[0.2em]">{displayModel.activeTrait.label}</span>
              </div>
              {"subtitle" in displayModel.activeTrait ? (
                <p className="mb-2 font-semibold">{displayModel.activeTrait.subtitle}</p>
              ) : null}
              <p>
                <span className="mr-1 font-semibold">{mobileDetailTitle}：</span>
                {displayModel.activeTrait.detail}
              </p>
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
              {displayModel.strengthsTitle}
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {displayModel.kind === "v2" ? (
                <li className="rounded-2xl bg-green-50/70 px-4 py-4 leading-7 text-gray-700">{displayModel.profileStrengths}</li>
              ) : null}
              {displayModel.strengths.map((item, index) => (
                <li key={item.key ?? index} className="rounded-2xl bg-green-50/60 px-4 py-3">
                  <div className="font-semibold text-gray-900">
                    {item.label}：{item.summary}
                  </div>
                  <p className="mt-1 leading-6 text-gray-600">{item.detail}</p>
                </li>
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
              {displayModel.growthTitle}
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {displayModel.kind === "v2" ? (
                <li className="rounded-2xl bg-purple-50/70 px-4 py-4 leading-7 text-gray-700">{displayModel.profileUnderStress}</li>
              ) : null}
              {displayModel.growthAreas.map((item, index) => (
                <li key={index} className="rounded-2xl bg-purple-50/60 px-4 py-3 leading-6">
                  {item}
                </li>
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
          <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900">
            <Sparkles className="mr-2 text-pink-500" />
            {displayModel.kind === "v2" ? RESULTS_TEXT_V2[mode].pageTitle : modeConfig.compatibilityTitle}
          </h2>
          <p className="leading-7 text-gray-600">{displayModel.closingText}</p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[2rem] border border-white/70 bg-white/60 p-8 shadow-lg backdrop-blur-xl"
        >
          <h2 className="mb-6 flex items-center text-xl font-bold text-gray-900">
            <Sparkles className="mr-2 text-pink-500" />
            {compatibilitySectionTitle}
          </h2>
          {displayModel.kind === "v2" ? (
            <p className="mb-6 leading-7 text-gray-600">{displayModel.compatibilityIntro}</p>
          ) : null}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-bold text-green-600">{bestMatchTitle}</h4>
              {displayModel.kind === "v2" ? (
                <p className="mb-3 text-sm leading-6 text-gray-600">{displayModel.bestMatchesIntro}</p>
              ) : null}
              <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
                {(displayModel.kind === "v2" ? displayModel.bestMatches : modeConfig.bestMatches).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-bold text-rose-600">{challengeTitle}</h4>
              {displayModel.kind === "v2" ? (
                <p className="mb-3 text-sm leading-6 text-gray-600">{displayModel.challengingMatchesIntro}</p>
              ) : null}
              <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
                {(displayModel.kind === "v2" ? displayModel.challengingMatches : modeConfig.challengingMatches).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Button onClick={downloadResultCard} className="h-12 flex-1 rounded-full bg-white text-pink-600 shadow-md">
            <Download className="mr-2 h-4 w-4" /> {downloading ? generatingLabel : saveCardLabel}
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
