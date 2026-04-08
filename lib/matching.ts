import type { PersonalityTraits, RomanceTraitsV2, UserProfile } from "@/app/data/types";
import { normalizeIdealPreferenceTags } from "@/app/data/idealPreferenceTags";
import { ROMANCE_TRAIT_LABELS, ROMANCE_TRAIT_LABELS_V2 } from "@/app/data/matchContent";

type BinaryGender = "M" | "F" | "ANY";
type TraitVersion = "legacy" | "v2";
type NumericTraits = Record<string, number>;

type TraitConfig = {
  version: TraitVersion;
  keys: string[];
  weights: Record<string, number>;
  complementaryTraits: Set<string>;
  complementaryTargetGap: number;
  complementaryDivisor: number;
  similarityDivisor: number;
  defaults: NumericTraits;
  labels: Record<string, string>;
};

type MatchingProfile = {
  id: string;
  gender: BinaryGender;
  lookingFor: BinaryGender;
  traits: NumericTraits;
  campusTags: string[];
  idealTags: string[];
  age: number;
  university: string;
  traitVersion: TraitVersion;
};

type MatchBreakdown = {
  personality: number;
  interests: number;
  background: number;
  complementary: number;
};

type TraitSignals = {
  bothHighTraits: string[];
  complementaryTraits: string[];
};

type MatchDetails = {
  score100: number;
  baseScorePercent: number;
  tagBonusPercent: number;
  breakdown: MatchBreakdown;
  sharedTags: string[];
  sharedIdealTags: string[];
  traitSignals: TraitSignals;
  config: TraitConfig;
  versionConfidence: number;
};

const LEGACY_TRAIT_CONFIG: TraitConfig = {
  version: "legacy",
  keys: [
    "socialStyle",
    "emotionalReadiness",
    "dateStyle",
    "commitment",
    "communication",
    "independence",
    "career",
    "flexibility",
  ],
  weights: {
    commitment: 2.5,
    career: 1.5,
    dateStyle: 1.5,
    emotionalReadiness: 1.5,
    communication: 1.0,
    flexibility: 1.0,
    socialStyle: 0.5,
    independence: 0.5,
  },
  complementaryTraits: new Set(["socialStyle", "independence", "flexibility"]),
  complementaryTargetGap: 3,
  complementaryDivisor: 4.9,
  similarityDivisor: 10,
  defaults: {
    socialStyle: 5,
    emotionalReadiness: 5,
    dateStyle: 5,
    commitment: 5,
    communication: 5,
    independence: 5,
    career: 5,
    flexibility: 5,
  } satisfies PersonalityTraits,
  labels: ROMANCE_TRAIT_LABELS,
};

const V2_TRAIT_CONFIG: TraitConfig = {
  version: "v2",
  keys: [
    "approachPace",
    "reassuranceNeed",
    "boundaryAutonomy",
    "emotionalExpression",
    "conflictEngagement",
    "futureOrientation",
    "jealousyRegulation",
    "stabilityPreference",
  ],
  weights: {
    approachPace: 1.1,
    reassuranceNeed: 1.6,
    boundaryAutonomy: 1.2,
    emotionalExpression: 1.2,
    conflictEngagement: 1.4,
    futureOrientation: 1.7,
    jealousyRegulation: 1.1,
    stabilityPreference: 1.8,
  },
  complementaryTraits: new Set(["approachPace", "boundaryAutonomy"]),
  complementaryTargetGap: 2.2,
  complementaryDivisor: 4.5,
  similarityDivisor: 9,
  defaults: {
    approachPace: 5,
    reassuranceNeed: 5,
    boundaryAutonomy: 5,
    emotionalExpression: 5,
    conflictEngagement: 5,
    futureOrientation: 5,
    jealousyRegulation: 5,
    stabilityPreference: 5,
  } satisfies RomanceTraitsV2,
  labels: ROMANCE_TRAIT_LABELS_V2,
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampTrait(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 5;
  return Math.max(0, Math.min(10, num));
}

function normalizeGender(value: unknown): BinaryGender {
  const text = String(value ?? "").trim().toLowerCase();
  if (["m", "male", "man", "boy", "男"].includes(text)) return "M";
  if (["f", "female", "woman", "girl", "女"].includes(text)) return "F";
  return "ANY";
}

function normalizeLookingFor(value: unknown): BinaryGender {
  const text = String(value ?? "").trim().toLowerCase();
  if (["any", "all", "都可以", "不限"].includes(text)) return "ANY";
  if (["m", "male", "man", "boy", "男"].includes(text)) return "M";
  if (["f", "female", "woman", "girl", "女"].includes(text)) return "F";
  return "ANY";
}

function parseTraits(value: unknown): NumericTraits {
  let raw: unknown = value;

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = null;
    }
  }

  if (!raw || typeof raw !== "object") {
    return {};
  }

  const result: NumericTraits = {};
  for (const [key, current] of Object.entries(raw)) {
    const numericValue = Number(current);
    if (Number.isFinite(numericValue)) {
      result[key] = clampTrait(numericValue);
    }
  }

  return result;
}

function inferTraitVersion(traits: NumericTraits): TraitVersion {
  const keys = new Set(Object.keys(traits));
  const legacyHits = LEGACY_TRAIT_CONFIG.keys.filter((key) => keys.has(key)).length;
  const v2Hits = V2_TRAIT_CONFIG.keys.filter((key) => keys.has(key)).length;
  return v2Hits > legacyHits ? "v2" : "legacy";
}

function getTraitConfig(version: TraitVersion): TraitConfig {
  return version === "v2" ? V2_TRAIT_CONFIG : LEGACY_TRAIT_CONFIG;
}

function mergeTraitsWithDefaults(traits: NumericTraits, config: TraitConfig): NumericTraits {
  return config.keys.reduce<NumericTraits>((acc, key) => {
    acc[key] = clampTrait(traits[key] ?? config.defaults[key]);
    return acc;
  }, {});
}

function normalizeTagText(input: unknown): string {
  return String(input ?? "").trim().toLowerCase();
}

function normalizeCampusTags(user: UserProfile): string[] {
  const bucket = new Set<string>();

  const directTags = (user as unknown as { campusTags?: unknown }).campusTags;
  if (Array.isArray(directTags)) {
    for (const tag of directTags) {
      const normalized = normalizeTagText(tag);
      if (normalized) bucket.add(normalized);
    }
  }

  if (Array.isArray(user.interests)) {
    for (const item of user.interests) {
      const normalized = normalizeTagText(item);
      if (normalized) bucket.add(normalized);
    }
  } else if (typeof user.interests === "string") {
    const raw = user.interests.trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const normalized = normalizeTagText(item);
            if (normalized) bucket.add(normalized);
          }
        } else {
          raw
            .split(/[\n,，、;；|]+/)
            .map((item) => item.trim())
            .filter(Boolean)
            .forEach((item) => bucket.add(item.toLowerCase()));
        }
      } catch {
        raw
          .split(/[\n,，、;；|]+/)
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => bucket.add(item.toLowerCase()));
      }
    }
  }

  const schoolTag = normalizeTagText(user.university);
  if (schoolTag) bucket.add(schoolTag);

  return Array.from(bucket).slice(0, 20);
}

function normalizeIdealTags(user: UserProfile) {
  return normalizeIdealPreferenceTags(user.ideal_date_tags).map((tag) => tag.toLowerCase());
}

function getOverlapPercent(left: string[], right: string[]) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const shared = Array.from(leftSet).filter((tag) => rightSet.has(tag));
  const union = new Set<string>([...Array.from(leftSet), ...Array.from(rightSet)]);

  return {
    shared,
    percent: union.size === 0 ? null : (shared.length / union.size) * 100,
  };
}

function getWeightedPercent(items: Array<{ percent: number | null; weight: number }>) {
  const available = items.filter((item) => item.percent !== null);
  if (available.length === 0) return 0;

  const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return 0;

  return available.reduce((sum, item) => sum + (item.percent ?? 0) * item.weight, 0) / totalWeight;
}

function toMatchingProfile(user: UserProfile): MatchingProfile {
  const dynamic = user as unknown as {
    lookingFor?: unknown;
    seeking?: unknown;
    personality_profile?: unknown;
  };
  const parsedTraits = parseTraits(dynamic.personality_profile ?? user.personality_profile);
  const traitVersion = inferTraitVersion(parsedTraits);

  return {
    id: String(user.id),
    gender: normalizeGender(user.gender),
    lookingFor: normalizeLookingFor(dynamic.lookingFor ?? dynamic.seeking ?? user.seeking),
    traits: mergeTraitsWithDefaults(parsedTraits, getTraitConfig(traitVersion)),
    campusTags: normalizeCampusTags(user),
    idealTags: normalizeIdealTags(user),
    age: Number.isFinite(Number(user.age)) ? Number(user.age) : 0,
    university: String(user.university ?? "").trim(),
    traitVersion,
  };
}

function isOrientationCompatible(userA: MatchingProfile, userB: MatchingProfile): boolean {
  if (userA.lookingFor !== "ANY" && userA.lookingFor !== userB.gender) return false;
  if (userB.lookingFor !== "ANY" && userB.lookingFor !== userA.gender) return false;
  return true;
}

function resolveConfig(userA: MatchingProfile, userB: MatchingProfile): TraitConfig {
  if (userA.traitVersion === "v2" || userB.traitVersion === "v2") {
    return V2_TRAIT_CONFIG;
  }
  return LEGACY_TRAIT_CONFIG;
}

function getVersionConfidence(userA: MatchingProfile, userB: MatchingProfile): number {
  return userA.traitVersion === userB.traitVersion ? 1 : 0.72;
}

function calculateMatchDetails(userA: MatchingProfile, userB: MatchingProfile): MatchDetails {
  const config = resolveConfig(userA, userB);
  const versionConfidence = getVersionConfidence(userA, userB);
  const traitsA = mergeTraitsWithDefaults(userA.traits, config);
  const traitsB = mergeTraitsWithDefaults(userB.traits, config);

  let weightedScoreSum = 0;
  let totalWeight = 0;
  let complementaryScoreSum = 0;
  let complementaryCount = 0;

  const bothHighTraits: string[] = [];
  const complementaryTraits: string[] = [];

  for (const traitKey of config.keys) {
    const weight = config.weights[traitKey] ?? 1;
    const valA = clampTrait(traitsA[traitKey]);
    const valB = clampTrait(traitsB[traitKey]);
    const diff = Math.abs(valA - valB);

    const isComplementary = config.complementaryTraits.has(traitKey);
    const penalty = isComplementary
      ? Math.min(((diff - config.complementaryTargetGap) ** 2) / config.complementaryDivisor, 10)
      : Math.min((diff ** 2) / config.similarityDivisor, 10);

    const itemScore = 10 - penalty;
    weightedScoreSum += itemScore * weight;
    totalWeight += weight * 10;

    if (valA >= 7 && valB >= 7) {
      bothHighTraits.push(traitKey);
    }

    if (isComplementary) {
      complementaryScoreSum += itemScore;
      complementaryCount += 1;
      if (diff >= 2 && diff <= 5) {
        complementaryTraits.push(traitKey);
      }
    }
  }

  const baseScorePercent = totalWeight > 0 ? (weightedScoreSum / totalWeight) * 100 : 0;

  const campusOverlap = getOverlapPercent(userA.campusTags, userB.campusTags);
  const idealOverlap = getOverlapPercent(userA.idealTags, userB.idealTags);
  const tagBonusPercent = getWeightedPercent([
    { percent: campusOverlap.percent, weight: 0.62 },
    { percent: idealOverlap.percent, weight: 0.38 },
  ]);

  const ageDiff = Math.abs(userA.age - userB.age);
  let background = 0;
  if (userA.university && userB.university && userA.university === userB.university) background += 0.5;
  if (ageDiff <= 2) background += 0.2;
  else if (ageDiff <= 5) background += 0.1;
  if (isOrientationCompatible(userA, userB)) background += 0.12;

  const rawPersonality = clamp01(baseScorePercent / 100);
  const rawComplementary =
    complementaryCount > 0 ? clamp01(complementaryScoreSum / (complementaryCount * 10)) : 0;

  // When legacy and V2 trait profiles mix, treat personality/complementary signals as lower-confidence
  // instead of letting neutral defaults inflate compatibility.
  const breakdown: MatchBreakdown = {
    personality: clamp01(rawPersonality * versionConfidence + 0.5 * (1 - versionConfidence)),
    interests: clamp01(tagBonusPercent / 100),
    background: clamp01(background),
    complementary:
      versionConfidence === 1
        ? rawComplementary
        : clamp01(rawComplementary * 0.6 + 0.4 * (1 - versionConfidence)),
  };

  const rawScore =
    (config.version === "v2"
      ? breakdown.personality * 0.68 +
        breakdown.interests * 0.1 +
        breakdown.background * 0.08 +
        breakdown.complementary * 0.14
      : breakdown.personality * 0.72 +
        breakdown.interests * 0.1 +
        breakdown.background * 0.1 +
        breakdown.complementary * 0.08);
  const calibratedScore = Math.pow(clamp01(rawScore), config.version === "v2" ? 1.62 : 1.75);

  return {
    score100: Math.max(0, Math.min(Math.round(calibratedScore * 100), 100)),
    baseScorePercent,
    tagBonusPercent,
    breakdown,
    sharedTags: campusOverlap.shared,
    sharedIdealTags: idealOverlap.shared,
    traitSignals: {
      bothHighTraits,
      complementaryTraits,
    },
    config,
    versionConfidence,
  };
}

function buildHighlights(userA: MatchingProfile, userB: MatchingProfile, details: MatchDetails): string[] {
  const list: string[] = [];
  const { labels } = details.config;

  if (userA.university && userA.university === userB.university) {
    list.push("同校");
  }

  if (Math.abs(userA.age - userB.age) <= 2) {
    list.push("年龄相近");
  }

  if (details.breakdown.personality >= 0.78) {
    list.push(details.config.version === "v2" ? "关系节奏整体契合" : "性格契合度高");
  }

  if (details.traitSignals.bothHighTraits.length > 0) {
    const key = details.traitSignals.bothHighTraits[0];
    list.push(`共同重视: ${labels[key] ?? key}`);
  }

  if (details.traitSignals.complementaryTraits.length > 0) {
    const key = details.traitSignals.complementaryTraits[0];
    list.push(`互补亮点: ${labels[key] ?? key}`);
  }

  if (details.sharedTags.length > 0) {
    list.push(`共同标签: ${details.sharedTags.slice(0, 3).join("、")}`);
  }

  if (details.sharedIdealTags.length > 0) {
    list.push(`偏好同频: ${details.sharedIdealTags.slice(0, 2).join("、")}`);
  }

  if (details.versionConfidence < 1) {
    list.push("新旧题库混合匹配");
  }

  if (list.length === 0) {
    list.push(details.config.version === "v2" ? "相处期待和关系理解比较接近" : "价值观与生活节奏较为接近");
  }

  return list.slice(0, 4);
}

function buildRecommendations(details: MatchDetails): string[] {
  const tips: string[] = [];
  const { labels } = details.config;
  const primaryShared = details.traitSignals.bothHighTraits[0];
  const primaryComplementary = details.traitSignals.complementaryTraits[0];

  if (details.breakdown.interests >= 0.35) {
    tips.push("可以先从共同兴趣或最近在做的事聊起，比较容易自然进入状态。");
  }

  if (details.sharedIdealTags.length > 0) {
    tips.push("你们在偏好标签上有重合，可以直接聊聊什么样的见面和相处最舒服。");
  }

  if (primaryShared) {
    tips.push(`你们都比较看重“${labels[primaryShared] ?? primaryShared}”，适合从自己在关系里最在意的点聊起。`);
  }

  if (primaryComplementary) {
    tips.push(`你们在“${labels[primaryComplementary] ?? primaryComplementary}”上有一点互补，先对齐彼此节奏会更顺。`);
  }

  if (details.breakdown.background >= 0.5) {
    tips.push("生活场景比较接近，先约一次低压力见面会比长时间硬聊更自然。");
  }

  if (details.versionConfidence < 1) {
    tips.push("这组结果包含新旧题库的混合画像，可以先从兴趣和现实节奏聊起，再慢慢确认关系理解是否一致。");
  }

  if (tips.length === 0) {
    tips.push("先发一句轻问候，从学校、兴趣或最近的小日常开始对话会比较稳。");
  }

  return tips.slice(0, 4);
}

export function checkGenderOrientationMatch(profile1: UserProfile, profile2: UserProfile): {
  canMatch: boolean;
  reason?: string;
} {
  const a = toMatchingProfile(profile1);
  const b = toMatchingProfile(profile2);

  if (!isOrientationCompatible(a, b)) {
    return { canMatch: false, reason: "orientation_not_compatible" };
  }

  return { canMatch: true };
}

export function calculateMatchScore(userA: UserProfile, userB: UserProfile): number {
  const a = toMatchingProfile(userA);
  const b = toMatchingProfile(userB);

  if (!isOrientationCompatible(a, b)) return 0;
  return calculateMatchDetails(a, b).score100;
}

export function calculateOverallMatch(
  profile1: UserProfile,
  profile2: UserProfile
): {
  overallScore: number;
  breakdown: MatchBreakdown;
  matches: string[];
  recommendations: string[];
} {
  const a = toMatchingProfile(profile1);
  const b = toMatchingProfile(profile2);

  if (!isOrientationCompatible(a, b)) {
    return {
      overallScore: 0,
      breakdown: {
        personality: 0,
        interests: 0,
        background: 0,
        complementary: 0,
      },
      matches: [],
      recommendations: [],
    };
  }

  const details = calculateMatchDetails(a, b);

  return {
    overallScore: details.score100 / 100,
    breakdown: details.breakdown,
    matches: buildHighlights(a, b, details),
    recommendations: buildRecommendations(details),
  };
}

type RankedMatchItem = {
  user: UserProfile;
  match: {
    overallScore: number;
    breakdown: MatchBreakdown;
    matches: string[];
    recommendations: string[];
  };
};

function takeNextUnique(
  target: RankedMatchItem[],
  pool: RankedMatchItem[],
  selectedIds: Set<string>,
  count: number = 1
) {
  for (const item of pool) {
    const id = String(item.user.id);
    if (selectedIds.has(id)) continue;
    target.push(item);
    selectedIds.add(id);
    if (target.length >= count) break;
  }
}

function curateMatchOrder(items: RankedMatchItem[]): RankedMatchItem[] {
  if (items.length <= 5) return items;

  const selected: RankedMatchItem[] = [];
  const selectedIds = new Set<string>();

  takeNextUnique(selected, items, selectedIds, 3);

  const complementaryPool = [...items].sort((a, b) => {
    if (b.match.breakdown.complementary !== a.match.breakdown.complementary) {
      return b.match.breakdown.complementary - a.match.breakdown.complementary;
    }
    if (b.match.breakdown.personality !== a.match.breakdown.personality) {
      return b.match.breakdown.personality - a.match.breakdown.personality;
    }
    return b.match.overallScore - a.match.overallScore;
  });
  takeNextUnique(selected, complementaryPool, selectedIds, 4);

  const lowScorePool = [...items].sort((a, b) => {
    if (a.match.overallScore !== b.match.overallScore) {
      return a.match.overallScore - b.match.overallScore;
    }
    return b.match.breakdown.complementary - a.match.breakdown.complementary;
  });
  takeNextUnique(selected, lowScorePool, selectedIds, 5);

  const remaining = items.filter((item) => !selectedIds.has(String(item.user.id)));
  return [...selected, ...remaining];
}

export function getBestMatches(
  currentUser: UserProfile,
  allUsers: UserProfile[],
  limit: number = 10
): {
  user: UserProfile;
  match: {
    overallScore: number;
    breakdown: MatchBreakdown;
    matches: string[];
    recommendations: string[];
  };
}[] {
  const rankedItems: RankedMatchItem[] = allUsers
    .filter((user) => String(user.id) !== String(currentUser.id))
    .map((user) => ({
      user,
      match: calculateOverallMatch(currentUser, user),
    }))
    .filter((item) => item.match.overallScore > 0)
    .sort((a, b) => b.match.overallScore - a.match.overallScore);

  return curateMatchOrder(rankedItems).slice(0, limit);
}
