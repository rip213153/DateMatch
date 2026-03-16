import type { FriendshipTraits, UserProfile } from "@/app/data/types";

type FriendshipMatchingProfile = {
  id: string;
  gender: "M" | "F" | "ANY";
  lookingFor: "M" | "F" | "ANY";
  traits: FriendshipTraits;
  tags: string[];
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
};

function normalizeGender(value: unknown): "M" | "F" | "ANY" {
  const text = String(value ?? "").trim().toLowerCase();
  if (["m", "male", "man", "boy", "男"].includes(text)) return "M";
  if (["f", "female", "woman", "girl", "女"].includes(text)) return "F";
  return "ANY";
}

function normalizeLookingFor(value: unknown): "M" | "F" | "ANY" {
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

function toMatchingProfile(user: UserProfile): FriendshipMatchingProfile {
  return {
    id: String(user.id),
    gender: normalizeGender(user.gender),
    lookingFor: normalizeLookingFor(user.seeking),
    traits: parseTraits(user.personality_profile),
    tags: normalizeTags(user),
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

  const tagsA = new Set(a.tags);
  const tagsB = new Set(b.tags);
  const sharedTags = Array.from(tagsA).filter((tag) => tagsB.has(tag));
  const unionTags = new Set<string>(Array.from(tagsA).concat(Array.from(tagsB)));
  const tagScore = unionTags.size === 0 ? 0 : sharedTags.length / unionTags.size;

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
    sharedTags,
  };
}

function buildHighlights(details: MatchDetails) {
  const items: string[] = [];

  if (details.breakdown.personality >= 0.78) {
    items.push("相处节奏高度同频");
  }

  if (details.breakdown.complementary >= 0.62) {
    items.push("性格互补不费劲");
  }

  if (details.breakdown.interests >= 0.28 && details.sharedTags.length > 0) {
    items.push(`共同标签: ${details.sharedTags.slice(0, 3).join("、")}`);
  }

  if (details.breakdown.background >= 0.55) {
    items.push("校园生活场景接近");
  }

  if (items.length === 0) {
    items.push("边界感和互动频率较容易磨合");
  }

  return items.slice(0, 4);
}

function buildRecommendations(details: MatchDetails) {
  const items: string[] = [];

  if (details.breakdown.interests >= 0.28) {
    items.push("先从共同兴趣或校园日常切入，会更容易自然熟起来。");
  }

  if (details.breakdown.complementary >= 0.6) {
    items.push("你们适合一动一静或一热一稳的搭配，互动会很有层次。");
  }

  if (details.breakdown.personality >= 0.75) {
    items.push("保持现在这种轻松节奏，很容易从普通朋友发展成长期同频搭子。");
  }

  if (items.length === 0) {
    items.push("先用低压力的话题破冰，慢慢试探彼此的聊天频率和边界。");
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
