import type { FriendshipTraits, FriendshipTraitsV2, UserProfile } from "@/app/data/types";
import { normalizeIdealPreferenceTags } from "@/app/data/idealPreferenceTags";
import { FRIENDSHIP_TRAIT_LABELS, FRIENDSHIP_TRAIT_LABELS_V2 } from "@/app/data/matchContent";

type GenderTarget = "M" | "F" | "ANY";
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

type FriendshipMatchingProfile = {
  id: string;
  gender: GenderTarget;
  lookingFor: GenderTarget;
  traits: NumericTraits;
  tags: string[];
  idealTags: string[];
  university: string;
  age: number;
  traitVersion: TraitVersion;
};

type MatchBreakdown = {
  personality: number;
  interests: number;
  background: number;
  complementary: number;
};

type MatchDetails = {
  score100: number;
  breakdown: MatchBreakdown;
  sharedTags: string[];
  sharedIdealTags: string[];
  bothHighTraits: string[];
  complementaryTraits: string[];
  config: TraitConfig;
  versionConfidence: number;
};

const LEGACY_TRAIT_CONFIG: TraitConfig = {
  version: "legacy",
  keys: ["socialEnergy", "maintenance", "boundaries", "spontaneity", "empathy", "reliability", "depth", "openness"],
  weights: {
    socialEnergy: 1.4,
    maintenance: 1.5,
    boundaries: 1.6,
    spontaneity: 1.2,
    empathy: 1.1,
    reliability: 1.4,
    depth: 1.3,
    openness: 1.0,
  },
  complementaryTraits: new Set(["socialEnergy", "spontaneity"]),
  complementaryTargetGap: 2.2,
  complementaryDivisor: 5.2,
  similarityDivisor: 9,
  defaults: {
    socialEnergy: 5,
    maintenance: 5,
    boundaries: 5,
    spontaneity: 5,
    empathy: 5,
    reliability: 5,
    depth: 5,
    openness: 5,
  } satisfies FriendshipTraits,
  labels: FRIENDSHIP_TRAIT_LABELS,
};

const V2_TRAIT_CONFIG: TraitConfig = {
  version: "v2",
  keys: [
    "connectionFrequency",
    "emotionalHolding",
    "boundaryClarity",
    "repairInitiative",
    "dependability",
    "differenceOpenness",
    "comparisonTolerance",
    "lowPressureCompanionship",
  ],
  weights: {
    connectionFrequency: 1.2,
    emotionalHolding: 1.5,
    boundaryClarity: 1.5,
    repairInitiative: 1.4,
    dependability: 1.8,
    differenceOpenness: 1.0,
    comparisonTolerance: 1.0,
    lowPressureCompanionship: 1.6,
  },
  complementaryTraits: new Set(["connectionFrequency", "lowPressureCompanionship"]),
  complementaryTargetGap: 2.4,
  complementaryDivisor: 5,
  similarityDivisor: 8.5,
  defaults: {
    connectionFrequency: 5,
    emotionalHolding: 5,
    boundaryClarity: 5,
    repairInitiative: 5,
    dependability: 5,
    differenceOpenness: 5,
    comparisonTolerance: 5,
    lowPressureCompanionship: 5,
  } satisfies FriendshipTraitsV2,
  labels: FRIENDSHIP_TRAIT_LABELS_V2,
};

function normalizeGender(value: unknown): GenderTarget {
  const text = String(value ?? "").trim().toLowerCase();
  if (["m", "male", "man", "boy", "男"].includes(text)) return "M";
  if (["f", "female", "woman", "girl", "女"].includes(text)) return "F";
  return "ANY";
}

function normalizeLookingFor(value: unknown): GenderTarget {
  const text = String(value ?? "").trim().toLowerCase();
  if (["m", "male", "man", "boy", "男"].includes(text)) return "M";
  if (["f", "female", "woman", "girl", "女"].includes(text)) return "F";
  return "ANY";
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function clampTrait(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 5;
  return Math.max(0, Math.min(10, num));
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

function normalizeTagText(input: unknown) {
  return String(input ?? "").trim().toLowerCase();
}

function normalizeTags(user: UserProfile) {
  const bucket = new Set<string>();

  if (Array.isArray(user.interests)) {
    user.interests.forEach((item) => {
      const normalized = normalizeTagText(item);
      if (normalized) bucket.add(normalized);
    });
  } else if (typeof user.interests === "string") {
    const raw = user.interests.trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            const normalized = normalizeTagText(item);
            if (normalized) bucket.add(normalized);
          });
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

function getOverlapScore(left: string[], right: string[]) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const shared = Array.from(leftSet).filter((tag) => rightSet.has(tag));
  const union = new Set<string>([...Array.from(leftSet), ...Array.from(rightSet)]);

  return {
    shared,
    score: union.size === 0 ? null : shared.length / union.size,
  };
}

function getWeightedScore(items: Array<{ score: number | null; weight: number }>) {
  const available = items.filter((item) => item.score !== null);
  if (available.length === 0) return 0;

  const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return 0;

  return available.reduce((sum, item) => sum + (item.score ?? 0) * item.weight, 0) / totalWeight;
}

function toMatchingProfile(user: UserProfile): FriendshipMatchingProfile {
  const parsedTraits = parseTraits(user.personality_profile);
  const traitVersion = inferTraitVersion(parsedTraits);

  return {
    id: String(user.id),
    gender: normalizeGender(user.gender),
    lookingFor: normalizeLookingFor(user.seeking),
    traits: mergeTraitsWithDefaults(parsedTraits, getTraitConfig(traitVersion)),
    tags: normalizeTags(user),
    idealTags: normalizeIdealTags(user),
    university: String(user.university ?? "").trim(),
    age: Number.isFinite(Number(user.age)) ? Number(user.age) : 0,
    traitVersion,
  };
}

function isPreferenceCompatible(a: FriendshipMatchingProfile, b: FriendshipMatchingProfile) {
  if (a.lookingFor !== "ANY" && a.lookingFor !== b.gender) return false;
  if (b.lookingFor !== "ANY" && b.lookingFor !== a.gender) return false;
  return true;
}

function resolveConfig(a: FriendshipMatchingProfile, b: FriendshipMatchingProfile): TraitConfig {
  if (a.traitVersion === "v2" || b.traitVersion === "v2") {
    return V2_TRAIT_CONFIG;
  }
  return LEGACY_TRAIT_CONFIG;
}

function getVersionConfidence(a: FriendshipMatchingProfile, b: FriendshipMatchingProfile): number {
  return a.traitVersion === b.traitVersion ? 1 : 0.72;
}

function calculateMatchDetails(a: FriendshipMatchingProfile, b: FriendshipMatchingProfile): MatchDetails {
  const config = resolveConfig(a, b);
  const versionConfidence = getVersionConfidence(a, b);
  const traitsA = mergeTraitsWithDefaults(a.traits, config);
  const traitsB = mergeTraitsWithDefaults(b.traits, config);

  let weightedScoreSum = 0;
  let totalWeight = 0;
  let complementaryScoreSum = 0;
  let complementaryCount = 0;

  const bothHighTraits: string[] = [];
  const complementaryTraits: string[] = [];

  for (const key of config.keys) {
    const weight = config.weights[key] ?? 1;
    const valueA = clampTrait(traitsA[key]);
    const valueB = clampTrait(traitsB[key]);
    const diff = Math.abs(valueA - valueB);
    const isComplementary = config.complementaryTraits.has(key);

    const penalty = isComplementary
      ? Math.min(((diff - config.complementaryTargetGap) ** 2) / config.complementaryDivisor, 10)
      : Math.min((diff ** 2) / config.similarityDivisor, 10);

    const itemScore = 10 - penalty;
    weightedScoreSum += itemScore * weight;
    totalWeight += weight * 10;

    if (valueA >= 7 && valueB >= 7) {
      bothHighTraits.push(key);
    }

    if (isComplementary) {
      complementaryScoreSum += itemScore;
      complementaryCount += 1;
      if (diff >= 2 && diff <= 5) {
        complementaryTraits.push(key);
      }
    }
  }

  const tagOverlap = getOverlapScore(a.tags, b.tags);
  const idealOverlap = getOverlapScore(a.idealTags, b.idealTags);
  const tagScore = getWeightedScore([
    { score: tagOverlap.score, weight: 0.66 },
    { score: idealOverlap.score, weight: 0.34 },
  ]);

  let background = 0;
  if (a.university && a.university === b.university) background += 0.55;
  const ageDiff = Math.abs(a.age - b.age);
  if (ageDiff <= 2) background += 0.2;
  else if (ageDiff <= 4) background += 0.1;

  const rawPersonality = clamp01(totalWeight > 0 ? weightedScoreSum / totalWeight : 0);
  const rawComplementary =
    complementaryCount > 0 ? clamp01(complementaryScoreSum / (complementaryCount * 10)) : 0;

  const breakdown: MatchBreakdown = {
    personality: clamp01(rawPersonality * versionConfidence + 0.5 * (1 - versionConfidence)),
    interests: clamp01(tagScore),
    background: clamp01(background),
    complementary:
      versionConfidence === 1
        ? rawComplementary
        : clamp01(rawComplementary * 0.6 + 0.4 * (1 - versionConfidence)),
  };

  const rawScore =
    config.version === "v2"
      ? breakdown.personality * 0.66 +
        breakdown.interests * 0.14 +
        breakdown.background * 0.08 +
        breakdown.complementary * 0.12
      : breakdown.personality * 0.7 +
        breakdown.interests * 0.15 +
        breakdown.background * 0.08 +
        breakdown.complementary * 0.07;

  return {
    score100: Math.max(0, Math.min(Math.round(Math.pow(rawScore, config.version === "v2" ? 1.34 : 1.45) * 100), 100)),
    breakdown,
    sharedTags: tagOverlap.shared,
    sharedIdealTags: idealOverlap.shared,
    bothHighTraits,
    complementaryTraits,
    config,
    versionConfidence,
  };
}

function buildHighlights(details: MatchDetails) {
  const items: string[] = [];
  const { labels, version } = details.config;

  if (details.breakdown.personality >= 0.78) {
    items.push(version === "v2" ? "友情节奏比较合拍" : "社交节奏很合拍");
  }

  if (details.bothHighTraits.length > 0) {
    const key = details.bothHighTraits[0];
    items.push(`共同重视: ${labels[key] ?? key}`);
  }

  if (details.complementaryTraits.length > 0) {
    const key = details.complementaryTraits[0];
    items.push(`互补亮点: ${labels[key] ?? key}`);
  }

  if (details.breakdown.interests >= 0.28 && details.sharedTags.length > 0) {
    items.push(`共同兴趣: ${details.sharedTags.slice(0, 3).join("、")}`);
  }

  if (details.sharedIdealTags.length > 0) {
    items.push(`相处偏好同频: ${details.sharedIdealTags.slice(0, 2).join("、")}`);
  }

  if (details.breakdown.background >= 0.55) {
    items.push("生活场景比较接近");
  }

  if (details.versionConfidence < 1) {
    items.push("新旧题库混合匹配");
  }

  if (items.length === 0) {
    items.push(version === "v2" ? "对陪伴和边界的理解比较接近" : "相处节奏和朋友边界比较接近");
  }

  return items.slice(0, 4);
}

function buildRecommendations(details: MatchDetails) {
  const items: string[] = [];
  const { labels } = details.config;
  const primaryShared = details.bothHighTraits[0];
  const primaryComplementary = details.complementaryTraits[0];

  if (details.breakdown.interests >= 0.28) {
    items.push("可以先从共同兴趣聊起，比较容易自然热起来。");
  }

  if (details.sharedIdealTags.length > 0) {
    items.push("你们对舒服的相处方式有重合，可以直接聊聊各自喜欢的朋友节奏。");
  }

  if (primaryShared) {
    items.push(`你们都比较在意“${labels[primaryShared] ?? primaryShared}”，适合先聊自己最重视的朋友感觉。`);
  }

  if (primaryComplementary) {
    items.push(`你们在“${labels[primaryComplementary] ?? primaryComplementary}”上有一点互补，先对齐彼此节奏会更顺。`);
  }

  if (details.versionConfidence < 1) {
    items.push("这组结果包含新旧题库的混合画像，先从共同兴趣和现实日常聊起，会比直接判断关系深浅更稳。");
  }

  if (items.length === 0) {
    items.push("先发一句轻松问候，从学校、兴趣或周末安排开始破冰会更自然。");
  }

  return items.slice(0, 4);
}

export function getBestFriendshipMatches(currentUser: UserProfile, allUsers: UserProfile[], limit: number = 10) {
  const current = toMatchingProfile(currentUser);

  return allUsers
    .filter((user) => String(user.id) !== current.id)
    .map((user) => {
      const target = toMatchingProfile(user);
      if (!isPreferenceCompatible(current, target)) {
        return null;
      }

      const details = calculateMatchDetails(current, target);

      return {
        user,
        match: {
          overallScore: details.score100 / 100,
          breakdown: details.breakdown,
          matches: buildHighlights(details),
          recommendations: buildRecommendations(details),
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .filter((item) => item.match.overallScore > 0)
    .sort((a, b) => b.match.overallScore - a.match.overallScore)
    .slice(0, limit);
}
