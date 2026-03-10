import { PersonalityTraits, UserProfile } from "@/app/data/types";

type BinaryGender = "M" | "F" | "ANY";

type MatchingProfile = {
  id: string;
  gender: BinaryGender;
  lookingFor: BinaryGender;
  traits: PersonalityTraits;
  campusTags: string[];
  age: number;
  university: string;
};

type MatchBreakdown = {
  personality: number;
  interests: number;
  background: number;
  complementary: number;
};

const TRAIT_WEIGHTS: Record<keyof PersonalityTraits, number> = {
  commitment: 2.5,
  career: 1.5,
  dateStyle: 1.5,
  emotionalReadiness: 1.5,
  communication: 1.0,
  flexibility: 1.0,
  socialStyle: 0.5,
  independence: 0.5,
};

const COMPLEMENTARY_TRAITS = new Set<keyof PersonalityTraits>([
  "socialStyle",
  "independence",
  "flexibility",
]);

const TRAIT_KEYS: (keyof PersonalityTraits)[] = [
  "socialStyle",
  "emotionalReadiness",
  "dateStyle",
  "commitment",
  "communication",
  "independence",
  "career",
  "flexibility",
];

const DEFAULT_TRAITS: PersonalityTraits = {
  socialStyle: 5,
  emotionalReadiness: 5,
  dateStyle: 5,
  commitment: 5,
  communication: 5,
  independence: 5,
  career: 5,
  flexibility: 5,
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
  if (["m", "male", "man", "boy", "\u7537"].includes(text)) return "M";
  if (["f", "female", "woman", "girl", "\u5973"].includes(text)) return "F";
  return "ANY";
}

function normalizeLookingFor(value: unknown): BinaryGender {
  const text = String(value ?? "").trim().toLowerCase();
  if (["any", "all", "\u90fd\u53ef\u4ee5", "\u4e0d\u9650"].includes(text)) return "ANY";
  if (["m", "male", "man", "boy", "\u7537"].includes(text)) return "M";
  if (["f", "female", "woman", "girl", "\u5973"].includes(text)) return "F";
  return "ANY";
}

function parseTraits(value: unknown): PersonalityTraits {
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

  const obj = raw as Partial<Record<keyof PersonalityTraits, unknown>>;

  return {
    socialStyle: clampTrait(obj.socialStyle),
    emotionalReadiness: clampTrait(obj.emotionalReadiness),
    dateStyle: clampTrait(obj.dateStyle),
    commitment: clampTrait(obj.commitment),
    communication: clampTrait(obj.communication),
    independence: clampTrait(obj.independence),
    career: clampTrait(obj.career),
    flexibility: clampTrait(obj.flexibility),
  };
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
            .split(/[\n,\uff0c\u3001;\uff1b|]+/)
            .map((item) => item.trim())
            .filter(Boolean)
            .forEach((item) => bucket.add(item.toLowerCase()));
        }
      } catch {
        raw
          .split(/[\n,\uff0c\u3001;\uff1b|]+/)
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

function toMatchingProfile(user: UserProfile): MatchingProfile {
  const dynamic = user as unknown as {
    lookingFor?: unknown;
    seeking?: unknown;
    personality_profile?: unknown;
  };

  return {
    id: String(user.id),
    gender: normalizeGender(user.gender),
    lookingFor: normalizeLookingFor(dynamic.lookingFor ?? dynamic.seeking ?? user.seeking),
    traits: parseTraits(dynamic.personality_profile ?? user.personality_profile),
    campusTags: normalizeCampusTags(user),
    age: Number.isFinite(Number(user.age)) ? Number(user.age) : 0,
    university: String(user.university ?? "").trim(),
  };
}

function isOrientationCompatible(userA: MatchingProfile, userB: MatchingProfile): boolean {
  if (userA.lookingFor !== "ANY" && userA.lookingFor !== userB.gender) return false;
  if (userB.lookingFor !== "ANY" && userB.lookingFor !== userA.gender) return false;
  return true;
}

type MatchDetails = {
  score100: number;
  baseScorePercent: number;
  tagBonusPercent: number;
  breakdown: MatchBreakdown;
  sharedTags: string[];
};

function calculateMatchDetails(userA: MatchingProfile, userB: MatchingProfile): MatchDetails {
  let weightedScoreSum = 0;
  let totalWeight = 0;

  let complementaryScoreSum = 0;
  let complementaryCount = 0;

  for (const traitKey of TRAIT_KEYS) {
    const weight = TRAIT_WEIGHTS[traitKey];
    const valA = clampTrait(userA.traits[traitKey]);
    const valB = clampTrait(userB.traits[traitKey]);
    const diff = Math.abs(valA - valB);

    const penalty = COMPLEMENTARY_TRAITS.has(traitKey)
      ? Math.min(((diff - 3) ** 2) / 4.9, 10)
      : Math.min((diff ** 2) / 10, 10);

    const itemScore = 10 - penalty;

    weightedScoreSum += itemScore * weight;
    totalWeight += weight * 10;

    if (COMPLEMENTARY_TRAITS.has(traitKey)) {
      complementaryScoreSum += itemScore;
      complementaryCount += 1;
    }
  }

  const baseScorePercent = totalWeight > 0 ? (weightedScoreSum / totalWeight) * 100 : 0;

  const tagsA = new Set(userA.campusTags);
  const tagsB = new Set(userB.campusTags);
  const sharedTags = Array.from(tagsA).filter((tag) => tagsB.has(tag));
  const unionTags = new Set<string>();
  tagsA.forEach((tag) => unionTags.add(tag));
  tagsB.forEach((tag) => unionTags.add(tag));
  const unionCount = unionTags.size;
  const tagBonusPercent = unionCount === 0 ? 0 : (sharedTags.length / unionCount) * 100;

  const ageDiff = Math.abs(userA.age - userB.age);
  let background = 0;
  if (userA.university && userB.university && userA.university === userB.university) background += 0.52;
  if (ageDiff <= 2) background += 0.2;
  else if (ageDiff <= 5) background += 0.1;
  if (isOrientationCompatible(userA, userB)) background += 0.12;

  const breakdown: MatchBreakdown = {
    personality: clamp01(baseScorePercent / 100),
    interests: clamp01(tagBonusPercent / 100),
    background: clamp01(background),
    complementary:
      complementaryCount > 0 ? clamp01(complementaryScoreSum / (complementaryCount * 10)) : 0,
  };

  const rawScore =
    breakdown.personality * 0.72 +
    breakdown.interests * 0.1 +
    breakdown.background * 0.1 +
    breakdown.complementary * 0.08;
  const calibratedScore = Math.pow(clamp01(rawScore), 1.75);

  return {
    score100: Math.max(0, Math.min(Math.round(calibratedScore * 100), 100)),
    baseScorePercent,
    tagBonusPercent,
    breakdown,
    sharedTags,
  };
}

function buildHighlights(
  userA: MatchingProfile,
  userB: MatchingProfile,
  details: MatchDetails
): string[] {
  const list: string[] = [];

  if (userA.university && userA.university === userB.university) {
    list.push("\u540c\u6821");
  }

  if (Math.abs(userA.age - userB.age) <= 2) {
    list.push("\u5e74\u9f84\u76f8\u8fd1");
  }

  if (details.breakdown.personality >= 0.78) {
    list.push("\u6027\u683c\u5951\u5408\u5ea6\u9ad8");
  }

  if (details.breakdown.complementary >= 0.62) {
    list.push("\u6027\u683c\u4e92\u8865\u6027\u5f3a");
  }

  if (details.sharedTags.length > 0) {
    list.push(`\u5171\u540c\u6807\u7b7e: ${details.sharedTags.slice(0, 3).join("\u3001")}`);
  }

  if (list.length === 0) {
    list.push("\u4ef7\u503c\u89c2\u4e0e\u751f\u6d3b\u8282\u594f\u8f83\u4e3a\u63a5\u8fd1");
  }

  return list.slice(0, 4);
}

function buildRecommendations(details: MatchDetails): string[] {
  const tips: string[] = [];

  if (details.breakdown.interests >= 0.35) {
    tips.push("\u53ef\u4ee5\u4ece\u5171\u540c\u6807\u7b7e\u5165\u624b\uff0c\u5feb\u901f\u627e\u5230\u8bdd\u9898\u3002");
  }

  if (details.breakdown.complementary >= 0.6) {
    tips.push("\u4f60\u4eec\u4e92\u8865\u6027\u4e0d\u9519\uff0c\u4e00\u65b9\u4e3b\u5bfc\u8bdd\u9898\u3001\u4e00\u65b9\u54cd\u5e94\uff0c\u6548\u679c\u4f1a\u5f88\u597d\u3002");
  }

  if (details.breakdown.personality >= 0.75) {
    tips.push("\u6027\u683c\u5951\u5408\u5ea6\u9ad8\uff0c\u5148\u804a\u6821\u56ed\u65e5\u5e38\u6216\u6700\u8fd1\u5174\u8da3\u5373\u53ef\u7834\u51b0\u3002");
  }

  if (details.breakdown.background >= 0.5) {
    tips.push("\u80cc\u666f\u76f8\u8fd1\uff0c\u53ef\u4ee5\u76f4\u63a5\u7ea6\u4e00\u6b21\u7ebf\u4e0b\u8f7b\u677e\u89c1\u9762\u3002");
  }

  if (tips.length === 0) {
    tips.push("\u5148\u53d1\u4e00\u53e5\u8f7b\u95ee\u5019\uff0c\u4ece\u5b66\u6821\u3001\u5174\u8da3\u6216\u65e5\u5e38\u5f00\u59cb\u5bf9\u8bdd\u3002");
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