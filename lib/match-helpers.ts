import {
  FRIENDSHIP_TRAIT_LABELS,
  INTEREST_TOPIC_OPENERS,
  MATCH_CONTENT_COPY,
  MATCH_HIGHLIGHT_TEMPLATES,
  MATCH_ICEBREAKER_TEMPLATES,
  ROMANCE_TRAIT_LABELS,
  type HighlightTemplate,
  type IceBreakerTemplate,
  type MatchContentCondition,
  type MatchContentContext,
  type MatchContentMode,
} from "@/app/data/matchContent";
import type { MatchItem, UserSummary } from "@/components/match/types";

type NumericProfile = Record<string, number>;

const HIGH_TRAIT_THRESHOLD = 7;
const LOW_TRAIT_THRESHOLD = 4;
const COMPLEMENTARY_GAP_THRESHOLD = 3;

export function generateIceBreakers(currentUser: UserSummary, match: MatchItem): string[] {
  const context = buildMatchContentContext(currentUser, match);
  const results = [
    ...getInterestTopicOpeners(context, currentUser, match),
    ...getPreferenceTagOpeners(context),
    ...pickTemplateTexts(MATCH_ICEBREAKER_TEMPLATES, context, currentUser, match, 5),
  ];

  return dedupeTexts(results).slice(0, 5);
}

export function getHighlights(currentUser: UserSummary, match: MatchItem): string[] {
  const context = buildMatchContentContext(currentUser, match);
  const templateHighlights = pickTemplateTexts(
    MATCH_HIGHLIGHT_TEMPLATES,
    context,
    currentUser,
    match,
    4,
  );

  const derivedHighlights = buildDerivedHighlights(context);
  const existingHighlights = Array.isArray(match.match.matches) ? match.match.matches : [];

  return dedupeTexts([
    ...templateHighlights,
    ...existingHighlights,
    ...derivedHighlights,
  ]).slice(0, 4);
}

export function formatInterests(interests: unknown): string {
  const normalized = normalizeInterestsToArray(interests);
  return normalized.length ? normalized.join("、") : MATCH_CONTENT_COPY.interestPlaceholder;
}

function buildMatchContentContext(currentUser: UserSummary, match: MatchItem): MatchContentContext {
  const currentUserProfile = parseProfile(currentUser.personality_profile);
  const matchUserProfile = parseProfile(match.user.personality_profile);
  const mode = inferMatchContentMode(currentUserProfile, matchUserProfile);
  const traitLabels = getTraitLabels(mode);
  const activeTraitKeys = Object.keys(traitLabels);

  const currentUserInterests = normalizeInterestsToArray(currentUser.interests);
  const matchUserInterests = normalizeInterestsToArray(match.user.interests);
  const currentUserPreferenceTags = normalizeStringArray(currentUser.ideal_date_tags);
  const matchUserPreferenceTags = normalizeStringArray(match.user.ideal_date_tags);

  const sameUniversity = Boolean(
    currentUser.university &&
      match.user.university &&
      currentUser.university.trim() === match.user.university.trim(),
  );

  const ageDiff = Math.abs(Number(currentUser.age || 0) - Number(match.user.age || 0));

  const bothHighTraits = activeTraitKeys.filter((trait) =>
    hasTraitValue(currentUserProfile, trait, HIGH_TRAIT_THRESHOLD, Infinity) &&
    hasTraitValue(matchUserProfile, trait, HIGH_TRAIT_THRESHOLD, Infinity),
  );

  const bothLowTraits = activeTraitKeys.filter((trait) =>
    hasTraitValue(currentUserProfile, trait, -Infinity, LOW_TRAIT_THRESHOLD) &&
    hasTraitValue(matchUserProfile, trait, -Infinity, LOW_TRAIT_THRESHOLD),
  );

  const complementaryTraits = activeTraitKeys.filter((trait) => {
    const left = currentUserProfile[trait];
    const right = matchUserProfile[trait];

    return typeof left === "number" &&
      typeof right === "number" &&
      Math.abs(left - right) >= COMPLEMENTARY_GAP_THRESHOLD;
  });

  return {
    mode,
    sameUniversity,
    ageDiff,
    sharedInterests: getSharedInterests(currentUserInterests, matchUserInterests),
    sharedPreferenceTags: getSharedInterests(currentUserPreferenceTags, matchUserPreferenceTags),
    personalityScore: normalizeScore(match.match.breakdown.personality),
    interestsScore: normalizeScore(match.match.breakdown.interests),
    backgroundScore: normalizeScore(match.match.breakdown.background),
    complementaryScore: normalizeScore(match.match.breakdown.complementary),
    bothHighTraits,
    bothLowTraits,
    complementaryTraits,
  };
}

function parseProfile(profile: unknown): NumericProfile {
  if (!profile) {
    return {};
  }

  if (typeof profile === "string") {
    const text = profile.trim();
    if (!text) {
      return {};
    }

    try {
      const parsed = JSON.parse(text);
      return parseProfile(parsed);
    } catch {
      return {};
    }
  }

  if (typeof profile !== "object") {
    return {};
  }

  const result: NumericProfile = {};
  for (const [key, value] of Object.entries(profile)) {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      result[key] = numericValue;
    }
  }

  return result;
}

function inferMatchContentMode(
  currentUserProfile: NumericProfile,
  matchUserProfile: NumericProfile,
): MatchContentMode {
  const profileKeys = new Set([
    ...Object.keys(currentUserProfile),
    ...Object.keys(matchUserProfile),
  ]);

  const romanceHits = Object.keys(ROMANCE_TRAIT_LABELS).filter((key) => profileKeys.has(key)).length;
  const friendshipHits = Object.keys(FRIENDSHIP_TRAIT_LABELS).filter((key) => profileKeys.has(key)).length;

  if (friendshipHits > romanceHits) {
    return "friendship";
  }

  return "romance";
}

function getTraitLabels(mode: MatchContentMode): Record<string, string> {
  return mode === "friendship" ? FRIENDSHIP_TRAIT_LABELS : ROMANCE_TRAIT_LABELS;
}

function normalizeInterestsToArray(interests: unknown): string[] {
  if (Array.isArray(interests)) {
    return dedupeTexts(
      interests
        .map((item) => String(item).trim())
        .filter(Boolean),
    );
  }

  if (typeof interests === "string") {
    const text = interests.trim();
    if (!text) {
      return [];
    }

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return normalizeInterestsToArray(parsed);
      }
    } catch {
      return dedupeTexts(
        text
          .split(/[、，,\/|｜\n\r]+/)
          .map((item) => item.trim())
          .filter(Boolean),
      );
    }

    return dedupeTexts([text]);
  }

  return [];
}

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return dedupeTexts(
    values
      .map((item) => String(item).trim())
      .filter(Boolean),
  );
}

function getSharedInterests(left: string[], right: string[]): string[] {
  const rightLookup = new Map(right.map((item) => [normalizeTextKey(item), item]));

  return dedupeTexts(
    left
      .filter((item) => rightLookup.has(normalizeTextKey(item)))
      .map((item) => rightLookup.get(normalizeTextKey(item)) ?? item),
  );
}

function hasTraitValue(
  profile: NumericProfile,
  trait: string,
  min: number,
  max: number,
): boolean {
  const value = profile[trait];
  return typeof value === "number" && value >= min && value <= max;
}

function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  const normalized = score > 1 ? score / 100 : score;
  return Math.max(0, Math.min(1, normalized));
}

function matchesCondition(
  context: MatchContentContext,
  condition: MatchContentCondition,
): boolean {
  if (
    typeof condition.sameUniversity === "boolean" &&
    context.sameUniversity !== condition.sameUniversity
  ) {
    return false;
  }

  if (
    typeof condition.ageDiffMax === "number" &&
    context.ageDiff > condition.ageDiffMax
  ) {
    return false;
  }

  if (
    typeof condition.personalityMin === "number" &&
    context.personalityScore < condition.personalityMin
  ) {
    return false;
  }

  if (
    typeof condition.interestsMin === "number" &&
    context.interestsScore < condition.interestsMin
  ) {
    return false;
  }

  if (
    typeof condition.backgroundMin === "number" &&
    context.backgroundScore < condition.backgroundMin
  ) {
    return false;
  }

  if (
    typeof condition.complementaryMin === "number" &&
    context.complementaryScore < condition.complementaryMin
  ) {
    return false;
  }

  if (
    typeof condition.sharedInterestCountMin === "number" &&
    context.sharedInterests.length < condition.sharedInterestCountMin
  ) {
    return false;
  }

  if (
    condition.bothHighTraitsAny?.length &&
    !condition.bothHighTraitsAny.some((trait) => context.bothHighTraits.includes(trait))
  ) {
    return false;
  }

  if (
    condition.bothLowTraitsAny?.length &&
    !condition.bothLowTraitsAny.some((trait) => context.bothLowTraits.includes(trait))
  ) {
    return false;
  }

  if (
    condition.complementaryTraitsAny?.length &&
    !condition.complementaryTraitsAny.some((trait) => context.complementaryTraits.includes(trait))
  ) {
    return false;
  }

  return true;
}

function pickTemplateTexts<TTemplate extends HighlightTemplate | IceBreakerTemplate>(
  templates: TTemplate[],
  context: MatchContentContext,
  currentUser: UserSummary,
  match: MatchItem,
  limit: number,
): string[] {
  const candidates = templates
    .filter((template) => isTemplateModeMatch(template.modes, context.mode))
    .filter((template) => matchesCondition(context, template.when))
    .sort((left, right) => right.priority - left.priority);

  const results: string[] = [];

  for (const template of candidates) {
    const seed = `${currentUser.id}:${match.user.id}:${template.id}`;
    const text = selectDeterministicText(template.texts, seed);
    const filled = fillTemplateText(text, context);

    if (filled) {
      results.push(filled);
    }

    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

function isTemplateModeMatch(
  modes: MatchContentMode[] | ["all"],
  mode: MatchContentMode,
): boolean {
  return modes.some((item) => item === "all" || item === mode);
}

function selectDeterministicText(texts: string[], seed: string): string {
  if (texts.length === 0) {
    return "";
  }

  const index = stableHash(seed) % texts.length;
  return texts[index] ?? texts[0] ?? "";
}

function fillTemplateText(text: string, context: MatchContentContext): string {
  const traitLabels = getTraitLabels(context.mode);
  const traitPair = getPrimaryTraitLabel(context, traitLabels);
  const sharedInterests = context.sharedInterests.slice(0, 3).join("、");
  const primaryInterest = context.sharedInterests[0] ?? MATCH_CONTENT_COPY.defaultPrimaryInterest;

  return text
    .replaceAll("{sharedInterests}", sharedInterests || MATCH_CONTENT_COPY.interestPlaceholder)
    .replaceAll("{primaryInterest}", primaryInterest)
    .replaceAll("{traitPair}", traitPair);
}

function getPrimaryTraitLabel(
  context: MatchContentContext,
  traitLabels: Record<string, string>,
): string {
  const traitKey = context.complementaryTraits[0] ??
    context.bothHighTraits[0] ??
    context.bothLowTraits[0];

  return traitKey ? traitLabels[traitKey] ?? traitKey : MATCH_CONTENT_COPY.defaultTraitPair;
}

function getInterestTopicOpeners(
  context: MatchContentContext,
  currentUser: UserSummary,
  match: MatchItem,
): string[] {
  const interestSeeds = context.sharedInterests
    .filter((interest) => Array.isArray(INTEREST_TOPIC_OPENERS[interest]))
    .slice(0, 2);

  return interestSeeds.map((interest, index) => {
    const texts = INTEREST_TOPIC_OPENERS[interest] ?? [];
    const seed = `${currentUser.id}:${match.user.id}:${interest}:${index}`;
    return fillTemplateText(selectDeterministicText(texts, seed), context);
  }).filter(Boolean);
}

function getPreferenceTagOpeners(context: MatchContentContext): string[] {
  return context.sharedPreferenceTags
    .slice(0, 2)
    .map((tag) => `发现你们都在意“${tag}”，可以先聊聊这点为什么会吸引你。`);
}

function buildDerivedHighlights(context: MatchContentContext): string[] {
  const results: string[] = [];

  if (context.sameUniversity) {
    results.push(MATCH_CONTENT_COPY.derivedHighlights.sameUniversity);
  }

  if (context.ageDiff <= 2) {
    results.push(MATCH_CONTENT_COPY.derivedHighlights.ageClose);
  }

  if (context.personalityScore >= 0.8) {
    results.push(MATCH_CONTENT_COPY.derivedHighlights.personalityHigh);
  }

  if (context.sharedInterests.length > 0) {
    results.push(
      `${MATCH_CONTENT_COPY.derivedHighlights.sharedInterestsPrefix}${context.sharedInterests
        .slice(0, 3)
        .join("、")}`,
    );
  }

  if (context.sharedPreferenceTags.length > 0) {
    results.push(`共同偏好：${context.sharedPreferenceTags.slice(0, 3).join("、")}`);
  }

  if (context.complementaryScore >= 0.66) {
    results.push(MATCH_CONTENT_COPY.derivedHighlights.complementaryHigh);
  }

  return results;
}

function dedupeTexts(texts: string[]): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const text of texts) {
    const normalized = normalizeTextKey(text);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    results.push(text.trim());
  }

  return results;
}

function normalizeTextKey(text: string): string {
  return String(text).trim().toLowerCase();
}

function stableHash(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}
