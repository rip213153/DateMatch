import type { FriendshipTraits, UserProfile } from "@/app/data/types";
import { normalizeIdealPreferenceTags } from "@/app/data/idealPreferenceTags";

type FriendshipMatchingProfile = {
  id: string;
  gender: "M" | "F" | "ANY";
  lookingFor: "M" | "F" | "ANY";
  traits: FriendshipTraits;
  tags: string[];
  idealTags: string[];
  university: string;
  age: number;
};

type MatchBreakdown = {
  personality: number;
  interests: number;
  background: number;
  complementary: number;
};

const TRAIT_WEIGHTS: Record<keyof FriendshipTraits, number> = {
  socialEnergy: 1.4,
  maintenance: 1.5,
  boundaries: 1.6,
  spontaneity: 1.2,
  empathy: 1.1,
  reliability: 1.4,
  depth: 1.3,
  openness: 1.0,
};

const COMPLEMENTARY_TRAITS = new Set<keyof FriendshipTraits>(["socialEnergy", "spontaneity"]);

const TRAIT_KEYS: Array<keyof FriendshipTraits> = [
  "socialEnergy",
  "maintenance",
  "boundaries",
  "spontaneity",
  "empathy",
  "reliability",
  "depth",
  "openness",
];

const DEFAULT_TRAITS: FriendshipTraits = {
  socialEnergy: 5,
  maintenance: 5,
  boundaries: 5,
  spontaneity: 5,
  empathy: 5,
  reliability: 5,
  depth: 5,
  openness: 5,
}
function normalizeGender(value: unknown): "M" | "F" | "ANY" {
  const text = String(value ?? "").trim().toLowerCase();
  if (["m", "male", "man", "boy", "?"].includes(text)) return "M";
  if (["f", "female", "woman", "girl", "?"].includes(text)) return "F";
  return "ANY";
}

function normalizeLookingFor(value: unknown): "M" | "F" | "ANY" {
  const text = String(value ?? "").trim().toLowerCase();
  if (["m", "male", "man", "boy", "?"].includes(text)) return "M";
  if (["f", "female", "woman", "girl", "?"].includes(text)) return "F";
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

function parseTraits(value: unknown): FriendshipTraits {
  let raw: unknown = value;

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = null;
    }
  }

  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_TRAITS };
  }

  const obj = raw as Partial<Record<keyof FriendshipTraits, unknown>>;

  return {
    socialEnergy: clampTrait(obj.socialEnergy),
    maintenance: clampTrait(obj.maintenance),
    boundaries: clampTrait(obj.boundaries),
    spontaneity: clampTrait(obj.spontaneity),
    empathy: clampTrait(obj.empathy),
    reliability: clampTrait(obj.reliability),
    depth: clampTrait(obj.depth),
    openness: clampTrait(obj.openness),
  };
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
    user.interests
      .split(/[\n,\uff0c\u3001;\uff1b|]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => bucket.add(item.toLowerCase()));
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
  return {
    id: String(user.id),
    gender: normalizeGender(user.gender),
    lookingFor: normalizeLookingFor(user.seeking),
    traits: parseTraits(user.personality_profile),
    tags: normalizeTags(user),
    idealTags: normalizeIdealTags(user),
    university: String(user.university ?? "").trim(),
    age: Number.isFinite(Number(user.age)) ? Number(user.age) : 0,
  };
}

function isPreferenceCompatible(a: FriendshipMatchingProfile, b: FriendshipMatchingProfile) {
  if (a.lookingFor !== "ANY" && a.lookingFor !== b.gender) return false;
  if (b.lookingFor !== "ANY" && b.lookingFor !== a.gender) return false;
  return true;
}

type MatchDetails = {
  score100: number;
  breakdown: MatchBreakdown;
  sharedTags: string[];
  sharedIdealTags: string[];
};

function calculateMatchDetails(a: FriendshipMatchingProfile, b: FriendshipMatchingProfile): MatchDetails {
  let weightedScoreSum = 0;
  let totalWeight = 0;
  let complementaryScoreSum = 0;
  let complementaryCount = 0;

  for (const key of TRAIT_KEYS) {
    const weight = TRAIT_WEIGHTS[key];
    const valueA = clampTrait(a.traits[key]);
    const valueB = clampTrait(b.traits[key]);
    const diff = Math.abs(valueA - valueB);

    const penalty = COMPLEMENTARY_TRAITS.has(key)
      ? Math.min(((diff - 2.2) ** 2) / 5.2, 10)
      : Math.min((diff ** 2) / 9, 10);

    const itemScore = 10 - penalty;
    weightedScoreSum += itemScore * weight;
    totalWeight += weight * 10;

    if (COMPLEMENTARY_TRAITS.has(key)) {
      complementaryScoreSum += itemScore;
      complementaryCount += 1;
    }
  }

  const tagOverlap = getOverlapScore(a.tags, b.tags);
  const idealOverlap = getOverlapScore(a.idealTags, b.idealTags);
  const tagScore = getWeightedScore([
    { score: tagOverlap.score, weight: 0.7 },
    { score: idealOverlap.score, weight: 0.3 },
  ]);

  let background = 0;
  if (a.university && a.university === b.university) background += 0.55;
  const ageDiff = Math.abs(a.age - b.age);
  if (ageDiff <= 2) background += 0.2;
  else if (ageDiff <= 4) background += 0.1;

  const breakdown: MatchBreakdown = {
    personality: clamp01(totalWeight > 0 ? weightedScoreSum / totalWeight : 0),
    interests: clamp01(tagScore),
    background: clamp01(background),
    complementary: complementaryCount > 0 ? clamp01(complementaryScoreSum / (complementaryCount * 10)) : 0,
  };

  const rawScore =
    breakdown.personality * 0.7 +
    breakdown.interests * 0.15 +
    breakdown.background * 0.08 +
    breakdown.complementary * 0.07;

  return {
    score100: Math.max(0, Math.min(Math.round(Math.pow(rawScore, 1.45) * 100), 100)),
    breakdown,
    sharedTags: tagOverlap.shared,
    sharedIdealTags: idealOverlap.shared,
  };
}

function buildHighlights(details: MatchDetails) {
  const items: string[] = [];

  if (details.breakdown.personality >= 0.78) {
    items.push("????????");
  }

  if (details.breakdown.complementary >= 0.62) {
    items.push("???????");
  }

  if (details.breakdown.interests >= 0.28 && details.sharedTags.length > 0) {
    items.push(`????: ${details.sharedTags.slice(0, 3).join("?")}`);
  }

  if (details.sharedIdealTags.length > 0) {
    items.push(`??????: ${details.sharedIdealTags.slice(0, 2).join("?")}`);
  }

  if (details.breakdown.background >= 0.55) {
    items.push("????????");
  }

  if (items.length === 0) {
    items.push("??????????????");
  }

  return items.slice(0, 4);
}

function buildRecommendations(details: MatchDetails) {
  const items: string[] = [];

  if (details.breakdown.interests >= 0.28) {
    items.push("????????????????????????");
  }

  if (details.sharedIdealTags.length > 0) {
    items.push("???????????????????????????????");
  }

  if (details.breakdown.complementary >= 0.6) {
    items.push("?????????????????????????");
  }

  if (details.breakdown.personality >= 0.75) {
    items.push("?????????????????????????????");
  }

  if (items.length === 0) {
    items.push("??????????????????????????");
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