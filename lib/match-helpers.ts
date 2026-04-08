import {
  FRIENDSHIP_TRAIT_LABELS,
  FRIENDSHIP_TRAIT_LABELS_V2,
  INTEREST_TOPIC_OPENERS,
  MATCH_CONTENT_COPY,
  MATCH_HIGHLIGHT_TEMPLATES,
  MATCH_HIGHLIGHT_TEMPLATES_V2,
  MATCH_ICEBREAKER_TEMPLATES,
  MATCH_ICEBREAKER_TEMPLATES_V2,
  ROMANCE_TRAIT_LABELS,
  ROMANCE_TRAIT_LABELS_V2,
  type HighlightTemplate,
  type IceBreakerTemplate,
  type MatchContentCondition,
  type MatchContentContext,
  type MatchContentMode,
} from "@/app/data/matchContent";
import {
  FRIENDSHIP_PROFILE_THEMES,
  ROMANCE_PROFILE_THEMES,
  resolveV2ProfileCopy,
  type V2ProfileResolverMode,
} from "@/app/data/resultsContent";
import type { MatchItem, UserSummary } from "@/components/match/types";

type NumericProfile = Record<string, number>;
type MatchContentVersion = "legacy" | "v2";
type ThemeHighlightLevel = "core" | "secondary" | "signature";
type HighlightBucket = "profile" | "complementary" | "shared" | "context" | "fallback";
type BreakdownKey = "personality" | "interests" | "background" | "complementary";

export type HighlightDebugTraceItem = {
  text: string;
  bucket: HighlightBucket;
  evidenceKey: BreakdownKey;
  evidenceScore: number;
};

const HIGH_TRAIT_THRESHOLD = 7;
const LOW_TRAIT_THRESHOLD = 4;
const COMPLEMENTARY_GAP_THRESHOLD = 3;

const ROMANCE_THEME_HIGHLIGHT_COPY: Record<string, string> = {
  [ROMANCE_PROFILE_THEMES.stableResponse]: "都重视稳定回应",
  [ROMANCE_PROFILE_THEMES.longTermIntent]: "都把关系往长期看",
  [ROMANCE_PROFILE_THEMES.reassurance]: "都在意关系被确认",
  [ROMANCE_PROFILE_THEMES.slowWarmup]: "都更适合慢慢靠近",
  [ROMANCE_PROFILE_THEMES.carefulObservation]: "都习惯先观察再投入",
  [ROMANCE_PROFILE_THEMES.personalBoundary]: "亲近里也重视边界",
  [ROMANCE_PROFILE_THEMES.selfPacedCloseness]: "都想按自己的节奏靠近",
  [ROMANCE_PROFILE_THEMES.spaceRespect]: "都需要关系里的空间感",
  [ROMANCE_PROFILE_THEMES.emotionalCandor]: "都愿意把感受说开",
  [ROMANCE_PROFILE_THEMES.directRepair]: "都倾向把问题聊开",
  [ROMANCE_PROFILE_THEMES.problemFacing]: "遇到问题都不回避",
  [ROMANCE_PROFILE_THEMES.gentleRepair]: "都偏温和地修复关系",
  [ROMANCE_PROFILE_THEMES.emotionalCare]: "都很在意彼此感受",
  [ROMANCE_PROFILE_THEMES.keepConnection]: "都想把关系留住",
  [ROMANCE_PROFILE_THEMES.presentFeeling]: "都更相信当下感觉",
  [ROMANCE_PROFILE_THEMES.aliveness]: "都希望关系有真实活力",
  [ROMANCE_PROFILE_THEMES.flowSense]: "都偏顺着感觉往前走",
  [ROMANCE_PROFILE_THEMES.explicitReassurance]: "都需要明确的安心感",
  [ROMANCE_PROFILE_THEMES.sensitivityToSignals]: "都很在意细节变化",
  [ROMANCE_PROFILE_THEMES.settledAfterConfirmation]: "有回应时都会更安定",
  [ROMANCE_PROFILE_THEMES.futurePlanning]: "都在意关系的未来感",
  [ROMANCE_PROFILE_THEMES.sharedPlanning]: "都愿意一起做规划",
  [ROMANCE_PROFILE_THEMES.directionSense]: "都希望关系有清晰方向",
};

const FRIENDSHIP_THEME_HIGHLIGHT_COPY: Record<string, string> = {
  [FRIENDSHIP_PROFILE_THEMES.reliablePresence]: "都属于会在场的朋友",
  [FRIENDSHIP_PROFILE_THEMES.showUpWhenNeeded]: "关键时候都靠得住",
  [FRIENDSHIP_PROFILE_THEMES.steadySupport]: "都能给人稳定托底",
  [FRIENDSHIP_PROFILE_THEMES.lowPressureCompany]: "都偏好低压陪伴",
  [FRIENDSHIP_PROFILE_THEMES.comfortOverHeat]: "都更看重舒服长久",
  [FRIENDSHIP_PROFILE_THEMES.canStayWithoutNoise]: "放着不聊也不容易断",
  [FRIENDSHIP_PROFILE_THEMES.emotionalHolding]: "都能接住朋友情绪",
  [FRIENDSHIP_PROFILE_THEMES.stayWithFragility]: "脆弱时刻也愿意留下来",
  [FRIENDSHIP_PROFILE_THEMES.gentleContainment]: "都偏温和地承接情绪",
  [FRIENDSHIP_PROFILE_THEMES.clearBoundary]: "都重视朋友间的边界感",
  [FRIENDSHIP_PROFILE_THEMES.mutualEase]: "都希望相处彼此轻松",
  [FRIENDSHIP_PROFILE_THEMES.respectMeasure]: "都在意关系里的分寸感",
  [FRIENDSHIP_PROFILE_THEMES.proactiveContact]: "都愿意主动维系联系",
  [FRIENDSHIP_PROFILE_THEMES.proactiveRepair]: "关系卡住时都愿意修复",
  [FRIENDSHIP_PROFILE_THEMES.keepFriendshipAlive]: "都想把友情留在生活里",
  [FRIENDSHIP_PROFILE_THEMES.tolerateDifference]: "都能容纳彼此不同",
  [FRIENDSHIP_PROFILE_THEMES.approachAcrossDifference]: "有差异也愿意继续靠近",
  [FRIENDSHIP_PROFILE_THEMES.relationalElasticity]: "都给关系留有弹性",
  [FRIENDSHIP_PROFILE_THEMES.holdComplexity]: "都能接受关系里的复杂感",
  [FRIENDSHIP_PROFILE_THEMES.staySteadyInComparison]: "比较里也能稳住关系",
  [FRIENDSHIP_PROFILE_THEMES.notOverIdealize]: "都不靠理想化维持友情",
  [FRIENDSHIP_PROFILE_THEMES.longTermUnderstanding]: "都重视长期理解",
  [FRIENDSHIP_PROFILE_THEMES.deepCompanionship]: "都更看重深度同行",
  [FRIENDSHIP_PROFILE_THEMES.qualityMatters]: "都很看重友情质量",
};

const ROMANCE_PROFILE_MATCH_COPY: Record<string, string> = {
  stable_connector: "都想把关系落在稳定回应里",
  slow_observer: "都更适合先熟一点再认真靠近",
  clear_autonomy: "都希望亲密和自我能同时成立",
  direct_expressor: "都不太接受把重要的话憋着",
  gentle_repair: "都愿意把重要关系温和修回来",
  present_experience: "都更在意相处里的真实感觉",
  deep_reassurance: "都需要被认真回应才会更安心",
  long_term_builder: "都习惯把喜欢放进未来考虑",
};

const FRIENDSHIP_PROFILE_MATCH_COPY: Record<string, string> = {
  steady_anchor: "都属于关键时候能站出来的朋友",
  low_pressure_long_flow: "都更喜欢轻松但不断线的友情",
  gentle_holder: "都愿意在朋友脆弱时留下来",
  clear_boundary: "都重视舒服和分寸并存的相处",
  active_maintainer: "都愿意主动把友情留在生活里",
  difference_friendly: "都能让不同的人慢慢靠近自己",
  balanced_realist: "都能接受友情里的复杂和变化",
  deep_companion: "都更想要长期理解而不只是热闹",
};

const ROMANCE_COMPLEMENTARY_HIGHLIGHT_COPY: Record<string, string> = {
  approachPace: "一个更主动，一个更稳，靠近节奏有互补",
  reassuranceNeed: "一个更需要确认，一个更能给稳定回应",
  boundaryAutonomy: "一个重亲近，一个重空间，关系里有互补余地",
  emotionalExpression: "一个更外露，一个更内敛，情绪表达能互相校准",
  conflictEngagement: "一个更愿意开口，一个更适合放慢，修复方式有互补",
  futureOrientation: "一个更看长期，一个更重当下，关系想象有互补",
  jealousyRegulation: "一个更敏感，一个更稳得住，不安调节上有互补",
  stabilityPreference: "一个给结构，一个带流动，关系节奏有互补",
};

const FRIENDSHIP_COMPLEMENTARY_HIGHLIGHT_COPY: Record<string, string> = {
  connectionFrequency: "一个更常联系，一个更低压，友情频率有互补",
  emotionalHolding: "一个更会接情绪，一个更会给空间，陪伴方式有互补",
  boundaryClarity: "一个更讲分寸，一个更愿意靠近，相处距离有互补",
  repairInitiative: "一个更主动修复，一个更适合接住，关系修复有互补",
  dependability: "一个更擅长托底，一个更带来轻松，朋友角色有互补",
  differenceOpenness: "一个更敢接近不同，一个更帮关系落地，差异处理有互补",
  comparisonTolerance: "一个更稳得住比较，一个更带来松弛，关系压力有互补",
  lowPressureCompanionship: "一个更随和，一个更愿意维系，陪伴浓度有互补",
};

const ROMANCE_PROFILE_OPENER_COPY: Record<string, string[]> = {
  stable_connector: [
    "你会觉得一段关系开始变认真，通常是从哪种回应开始的？",
    "对你来说，关系里最让人安心的，是持续回应、真实表达，还是未来方向？",
  ],
  slow_observer: [
    "如果一个人让你觉得可以慢慢靠近，通常是因为什么？",
    "你会更习惯先熟一点再投入，还是感觉到了就直接往前走？",
  ],
  clear_autonomy: [
    "你会怎么理解“喜欢一个人，但也不想失去自己”这件事？",
    "你更喜欢那种“把话说明白”的亲近，还是“彼此懂分寸”的亲近？",
  ],
  direct_expressor: [
    "如果关系里有误会，你更习惯当下说开，还是等情绪稳一点再聊？",
    "你会更欣赏那种直接表达的人，还是有分寸但不回避的人？",
  ],
  gentle_repair: [
    "你觉得一段关系真正难得的地方，是少出问题，还是出了问题还能修回来？",
    "如果关系里有点别扭，你通常会怎么把它慢慢聊回来？",
  ],
  present_experience: [
    "如果一段关系很舒服，你觉得是因为节奏对，还是因为相处里有感觉？",
    "你会更相信关系里的当下感觉，还是更在意它是不是有明确方向？",
  ],
  deep_reassurance: [
    "你会觉得被认真对待，通常是从哪些细节里感受到的？",
    "对你来说，明确回应和稳定陪伴，哪个更容易让人安心？",
  ],
  long_term_builder: [
    "如果一段关系值得往后走，最关键的信号通常是什么？",
    "你会从什么时候开始，把一个人放进自己的未来考虑里？",
  ],
};

const FRIENDSHIP_PROFILE_OPENER_COPY: Record<string, string[]> = {
  steady_anchor: [
    "你觉得真正靠得住的朋友，最明显的表现通常是什么？",
    "朋友之间你最看重的是聊得来，还是关键时刻能在场？",
  ],
  low_pressure_long_flow: [
    "你更珍惜那种常联系的朋友，还是放久了也不会断的朋友？",
    "你觉得低压但不断线的友情，通常靠什么维持住？",
  ],
  gentle_holder: [
    "如果朋友状态不好，你通常会更想陪着，还是先给对方一点空间？",
    "你会更习惯先接住朋友情绪，还是先帮对方理清问题？",
  ],
  clear_boundary: [
    "对你来说，朋友之间的分寸感应该怎么拿捏最舒服？",
    "你会觉得边界感是在拉远关系，还是在保护关系？",
  ],
  active_maintainer: [
    "你更喜欢主动维系的友情，还是自然流动但一直都在的友情？",
    "如果一段友情开始变淡，你通常会主动拉回来吗？",
  ],
  difference_friendly: [
    "面对和自己很不一样的人，你通常会先被吸引，还是先观察？",
    "你觉得差异大的朋友关系，最重要的是包容、边界，还是节奏？",
  ],
  balanced_realist: [
    "你会怎么理解朋友关系里的复杂感？",
    "你觉得一段成熟的友情，需要能容纳哪些不那么完美的东西？",
  ],
  deep_companion: [
    "你觉得深度同行和热闹陪伴，最大的差别在哪里？",
    "你会怎么判断一个朋友是真的能走很久的人？",
  ],
};

const ROMANCE_THEME_OPENER_COPY: Record<string, string[]> = {
  [ROMANCE_PROFILE_THEMES.stableResponse]: ["你会觉得“稳定回应”具体长什么样？"],
  [ROMANCE_PROFILE_THEMES.longTermIntent]: ["如果两个人都认真看待关系，你觉得最自然的推进方式是什么？"],
  [ROMANCE_PROFILE_THEMES.reassurance]: ["你更容易被哪种确认感打动：语言上的，行动上的，还是持续性的？"],
  [ROMANCE_PROFILE_THEMES.slowWarmup]: ["你会更习惯先慢慢熟起来，还是感觉对了就直接靠近？"],
  [ROMANCE_PROFILE_THEMES.personalBoundary]: ["你会觉得边界感是拉远关系，还是保护关系？"],
  [ROMANCE_PROFILE_THEMES.emotionalCandor]: ["关系里你最在意被理解的部分，通常是什么？"],
  [ROMANCE_PROFILE_THEMES.directRepair]: ["如果有误会，你觉得什么样的沟通最容易把关系拉回来？"],
  [ROMANCE_PROFILE_THEMES.futurePlanning]: ["你会从什么时候开始，把喜欢放进未来考虑里？"],
};

const FRIENDSHIP_THEME_OPENER_COPY: Record<string, string[]> = {
  [FRIENDSHIP_PROFILE_THEMES.lowPressureCompany]: ["你觉得低压但不断线的友情，通常靠什么维持住？"],
  [FRIENDSHIP_PROFILE_THEMES.canStayWithoutNoise]: ["你觉得“放着也不容易断”的朋友关系，通常靠什么成立？"],
  [FRIENDSHIP_PROFILE_THEMES.emotionalHolding]: ["如果朋友需要你，你更习惯第一时间出现，还是先确认对方真正需要什么？"],
  [FRIENDSHIP_PROFILE_THEMES.clearBoundary]: ["对你来说，朋友之间的分寸感应该怎么拿捏最舒服？"],
  [FRIENDSHIP_PROFILE_THEMES.proactiveContact]: ["你更喜欢主动维系的友情，还是顺其自然但一直都在的友情？"],
  [FRIENDSHIP_PROFILE_THEMES.tolerateDifference]: ["你更喜欢能聊很深的朋友，还是和自己不太一样但很有新鲜感的朋友？"],
  [FRIENDSHIP_PROFILE_THEMES.longTermUnderstanding]: ["你会怎么判断一个朋友是真的能走很久的人？"],
  [FRIENDSHIP_PROFILE_THEMES.deepCompanionship]: ["你觉得深度同行和热闹陪伴，最大的差别在哪里？"],
};

const ROMANCE_COMPLEMENTARY_OPENER_COPY: Record<string, string[]> = {
  approachPace: ["如果一个人偏主动、一个人偏慢热，你觉得怎样的节奏会让彼此都舒服？"],
  reassuranceNeed: ["如果一个人更需要确认、另一个人更习惯用稳定行动表达，你觉得中间最好的平衡点会是什么？"],
  boundaryAutonomy: ["如果一个人很看重空间感，另一个人很看重靠近频率，你觉得怎样的距离最自然？"],
  emotionalExpression: ["你会更欣赏那种直接表达的人，还是会先消化一下再开口的人？"],
  conflictEngagement: ["如果两个人一个更想当下聊开，一个更适合先缓一缓，你觉得怎么沟通最不容易错位？"],
  futureOrientation: ["如果两个人一个更看长期、一个更重当下，你觉得关系要怎么走才不会互相拉扯？"],
  jealousyRegulation: ["当一方更敏感、另一方更稳定时，你觉得最好的相处方式是什么？"],
  stabilityPreference: ["如果一个人更需要结构感，另一个人更重流动感，你觉得怎样的关系节奏最舒服？"],
};

const FRIENDSHIP_COMPLEMENTARY_OPENER_COPY: Record<string, string[]> = {
  connectionFrequency: ["如果一个人习惯常联系，另一个人更喜欢低压相处，你觉得怎样的频率最不会有负担？"],
  emotionalHolding: ["你会更习惯在朋友情绪上来时马上接住，还是先给一点缓冲空间？"],
  boundaryClarity: ["如果一个人很讲分寸，另一个人更容易亲近，你觉得怎样的距离最自然？"],
  repairInitiative: ["朋友之间如果一方总是先修复关系，另一方更擅长回应，你觉得这种搭配舒服吗？"],
  dependability: ["如果一个人更擅长托底，一个人更会带来轻松感，你觉得这种朋友组合会是什么样？"],
  differenceOpenness: ["面对差异比较大的朋友，你觉得最重要的是包容、边界，还是节奏？"],
  comparisonTolerance: ["如果一方更容易被比较影响，另一方更松弛一点，你觉得这种关系会怎么互相影响？"],
  lowPressureCompanionship: ["如果一个人更随和、另一个人更愿意维系，你觉得这种陪伴浓度会舒服吗？"],
};

const ROMANCE_COMPLEMENTARY_DISPLAY_PRIORITY: Record<string, number> = {
  reassuranceNeed: 10,
  approachPace: 9,
  boundaryAutonomy: 8,
  conflictEngagement: 7,
  futureOrientation: 6,
  emotionalExpression: 5,
  stabilityPreference: 4,
  jealousyRegulation: 3,
};

const FRIENDSHIP_COMPLEMENTARY_DISPLAY_PRIORITY: Record<string, number> = {
  connectionFrequency: 10,
  boundaryClarity: 9,
  repairInitiative: 8,
  dependability: 7,
  emotionalHolding: 6,
  lowPressureCompanionship: 5,
  differenceOpenness: 4,
  comparisonTolerance: 3,
};

export function generateIceBreakers(currentUser: UserSummary, match: MatchItem): string[] {
  const context = buildMatchContentContext(currentUser, match);
  const templates =
    context.version === "v2"
      ? [...MATCH_ICEBREAKER_TEMPLATES_V2, ...MATCH_ICEBREAKER_TEMPLATES]
      : MATCH_ICEBREAKER_TEMPLATES;
  const results = [
    ...buildV2SemanticOpeners(context, currentUser, match),
    ...getInterestTopicOpeners(context, currentUser, match),
    ...getPreferenceTagOpeners(context),
    ...pickTemplateTexts(templates, context, currentUser, match, 5),
  ];

  return dedupeHighlightTexts(results).slice(0, 5);
}

export function getHighlights(currentUser: UserSummary, match: MatchItem): string[] {
  const context = buildMatchContentContext(currentUser, match);
  const templates =
    context.version === "v2"
      ? [...MATCH_HIGHLIGHT_TEMPLATES_V2, ...MATCH_HIGHLIGHT_TEMPLATES]
      : MATCH_HIGHLIGHT_TEMPLATES;
  const templateHighlights = pickTemplateTexts(
    templates,
    context,
    currentUser,
    match,
    4,
  );

  const derivedHighlights = buildDerivedHighlights(context);
  const profileThemeHighlights = buildV2ProfileThemeHighlights(context, currentUser, match);
  const existingHighlights = Array.isArray(match.match.matches) ? match.match.matches : [];

  return buildBalancedHighlights(context, {
    profile: profileThemeHighlights,
    complementary: collectComplementaryHighlights(context, [...profileThemeHighlights, ...templateHighlights, ...derivedHighlights]),
    shared: collectSharedHighlights(context, [...profileThemeHighlights, ...templateHighlights, ...derivedHighlights]),
    context: collectContextHighlights(context, [...templateHighlights, ...derivedHighlights]),
    fallback: [...templateHighlights, ...derivedHighlights, ...existingHighlights],
  }).slice(0, 4);
}

export function getHighlightDebugTrace(
  currentUser: UserSummary,
  match: MatchItem,
): HighlightDebugTraceItem[] {
  const context = buildMatchContentContext(currentUser, match);
  const highlights = getHighlights(currentUser, match);

  return highlights.map((text) => ({
    text,
    bucket: inferHighlightBucket(text),
    evidenceKey: inferHighlightEvidenceKey(text),
    evidenceScore: Number(getHighlightEvidenceScore(context, text).toFixed(2)),
  }));
}

export function formatInterests(interests: unknown): string {
  const normalized = normalizeInterestsToArray(interests);
  return normalized.length ? normalized.join("、") : MATCH_CONTENT_COPY.interestPlaceholder;
}

function buildMatchContentContext(currentUser: UserSummary, match: MatchItem): MatchContentContext {
  const currentUserProfile = parseProfile(currentUser.personality_profile);
  const matchUserProfile = parseProfile(match.user.personality_profile);
  const mode = inferMatchContentMode(currentUserProfile, matchUserProfile);
  const version = inferMatchContentVersion(mode, currentUserProfile, matchUserProfile);
  const traitLabels = getTraitLabels(mode, version);
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

  const complementaryTraits = activeTraitKeys
    .filter((trait) => {
      const left = currentUserProfile[trait];
      const right = matchUserProfile[trait];

      return typeof left === "number" &&
        typeof right === "number" &&
        Math.abs(left - right) >= COMPLEMENTARY_GAP_THRESHOLD;
    })
    .sort((leftTrait, rightTrait) =>
      compareComplementaryTraits(
        mode,
        currentUserProfile,
        matchUserProfile,
        leftTrait,
        rightTrait,
      ),
    );

  return {
    mode,
    version,
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

function inferMatchContentVersion(
  mode: MatchContentMode,
  currentUserProfile: NumericProfile,
  matchUserProfile: NumericProfile,
): MatchContentVersion {
  const profileKeys = new Set([
    ...Object.keys(currentUserProfile),
    ...Object.keys(matchUserProfile),
  ]);
  const traitLabelsV2 = mode === "friendship" ? FRIENDSHIP_TRAIT_LABELS_V2 : ROMANCE_TRAIT_LABELS_V2;
  const traitLabelsLegacy = mode === "friendship" ? FRIENDSHIP_TRAIT_LABELS : ROMANCE_TRAIT_LABELS;
  const v2Hits = Object.keys(traitLabelsV2).filter((key) => profileKeys.has(key)).length;
  const legacyHits = Object.keys(traitLabelsLegacy).filter((key) => profileKeys.has(key)).length;

  return v2Hits > legacyHits ? "v2" : "legacy";
}

function getTraitLabels(mode: MatchContentMode, version: MatchContentVersion): Record<string, string> {
  if (mode === "friendship") {
    return version === "v2" ? FRIENDSHIP_TRAIT_LABELS_V2 : FRIENDSHIP_TRAIT_LABELS;
  }

  return version === "v2" ? ROMANCE_TRAIT_LABELS_V2 : ROMANCE_TRAIT_LABELS;
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

function compareComplementaryTraits(
  mode: MatchContentMode,
  currentUserProfile: NumericProfile,
  matchUserProfile: NumericProfile,
  leftTrait: string,
  rightTrait: string,
): number {
  const leftScore = getComplementaryDisplayScore(mode, currentUserProfile, matchUserProfile, leftTrait);
  const rightScore = getComplementaryDisplayScore(mode, currentUserProfile, matchUserProfile, rightTrait);

  return rightScore - leftScore;
}

function getComplementaryDisplayScore(
  mode: MatchContentMode,
  currentUserProfile: NumericProfile,
  matchUserProfile: NumericProfile,
  trait: string,
): number {
  const leftValue = currentUserProfile[trait];
  const rightValue = matchUserProfile[trait];
  const diff =
    typeof leftValue === "number" && typeof rightValue === "number"
      ? Math.abs(leftValue - rightValue)
      : 0;

  const priorityMap =
    mode === "friendship"
      ? FRIENDSHIP_COMPLEMENTARY_DISPLAY_PRIORITY
      : ROMANCE_COMPLEMENTARY_DISPLAY_PRIORITY;
  const priority = priorityMap[trait] ?? 0;

  return priority * 100 + diff * 10;
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
  const traitLabels = getTraitLabels(context.mode, context.version ?? "legacy");
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
    .map((tag) =>
      context.mode === "friendship"
        ? `发现你们都在意“${tag}”，可以先聊聊自己更喜欢什么样的朋友相处感。`
        : `发现你们都在意“${tag}”，可以先聊聊什么样的关系最让你有靠近感。`,
    );
}

function buildV2SemanticOpeners(
  context: MatchContentContext,
  currentUser: UserSummary,
  match: MatchItem,
): string[] {
  if (context.version !== "v2") {
    return [];
  }

  const mode = context.mode as V2ProfileResolverMode;
  const currentProfile = parseProfile(currentUser.personality_profile);
  const matchProfile = parseProfile(match.user.personality_profile);
  const currentResolved = resolveV2ProfileCopy(mode, currentProfile);
  const matchResolved = resolveV2ProfileCopy(mode, matchProfile);

  const results: string[] = [];
  const currentThemeProfile = currentResolved.profile.themeProfile;
  const matchThemeProfile = matchResolved.profile.themeProfile;

  const avoidSet = new Set([
    ...(currentThemeProfile?.avoid ?? []),
    ...(matchThemeProfile?.avoid ?? []),
  ]);

  const sharedCore = (currentThemeProfile?.core ?? []).filter(
    (tag) => (matchThemeProfile?.core ?? []).includes(tag) && !avoidSet.has(tag),
  );
  const sharedSecondary = (currentThemeProfile?.secondary ?? []).filter(
    (tag) =>
      (
        (matchThemeProfile?.core ?? []).includes(tag) ||
        (matchThemeProfile?.secondary ?? []).includes(tag)
      ) && !avoidSet.has(tag),
  );

  if (currentResolved.profile.id === matchResolved.profile.id) {
    results.push(...renderProfileOpeners(context.mode, currentResolved.profile.id));
  }

  if (sharedCore.length > 0) {
    results.push(...renderThemeOpeners(context.mode, sharedCore[0]));
  }

  if (sharedSecondary.length > 0) {
    results.push(...renderThemeOpeners(context.mode, sharedSecondary[0]));
  }

  if (context.complementaryScore >= 0.66) {
    results.push(...renderComplementaryOpeners(context));
  }

  return results.filter(Boolean);
}

function buildV2ProfileThemeHighlights(
  context: MatchContentContext,
  currentUser: UserSummary,
  match: MatchItem,
): string[] {
  if (context.version !== "v2") {
    return [];
  }

  const mode = context.mode as V2ProfileResolverMode;
  const currentProfile = parseProfile(currentUser.personality_profile);
  const matchProfile = parseProfile(match.user.personality_profile);
  const currentResolved = resolveV2ProfileCopy(mode, currentProfile);
  const matchResolved = resolveV2ProfileCopy(mode, matchProfile);

  const results: string[] = [];
  const currentThemeProfile = currentResolved.profile.themeProfile;
  const matchThemeProfile = matchResolved.profile.themeProfile;

  const avoidSet = new Set([
    ...(currentThemeProfile?.avoid ?? []),
    ...(matchThemeProfile?.avoid ?? []),
  ]);

  const sharedCore = (currentThemeProfile?.core ?? []).filter(
    (tag) => (matchThemeProfile?.core ?? []).includes(tag) && !avoidSet.has(tag),
  );
  const sharedSecondary = (currentThemeProfile?.secondary ?? []).filter(
    (tag) =>
      (
        (matchThemeProfile?.core ?? []).includes(tag) ||
        (matchThemeProfile?.secondary ?? []).includes(tag)
      ) && !avoidSet.has(tag),
  );
  const fallbackSharedTags = (currentResolved.profile.signatureTags ?? []).filter(
    (tag) => (matchResolved.profile.signatureTags ?? []).includes(tag) && !avoidSet.has(tag),
  );

  if (currentResolved.profile.id === matchResolved.profile.id) {
    results.push(renderProfileMatchHighlight(context.mode, currentResolved.profile.id, currentResolved.profile.title));
  }

  if (sharedCore.length > 0) {
    results.push(renderThemeHighlight(context.mode, sharedCore[0], "core"));
  }

  if (sharedSecondary.length > 0) {
    results.push(renderThemeHighlight(context.mode, sharedSecondary[0], "secondary"));
  }

  if (results.length < 3 && fallbackSharedTags.length > 0) {
    results.push(
      ...fallbackSharedTags
        .slice(0, 3 - results.length)
        .map((tag) => renderThemeHighlight(context.mode, tag, "signature")),
    );
  }

  return results.filter(Boolean);
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
    results.push(
      context.version === "v2"
        ? context.mode === "friendship"
          ? "友情节奏整体合拍"
          : "关系理解比较接近"
        : MATCH_CONTENT_COPY.derivedHighlights.personalityHigh,
    );
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
    results.push(
      context.version === "v2"
        ? renderComplementaryHighlight(context)
        : MATCH_CONTENT_COPY.derivedHighlights.complementaryHigh,
    );
  }

  return results;
}

function buildBalancedHighlights(
  context: MatchContentContext,
  buckets: Record<HighlightBucket, string[]>,
): string[] {
  const orderedBuckets: HighlightBucket[] = ["profile", "complementary", "shared", "context"];
  const results: string[] = [];

  for (const bucket of orderedBuckets) {
    const candidate = pickFirstNonConflictingHighlight(context, results, buckets[bucket] ?? []);
    if (candidate) {
      results.push(candidate);
    }
  }

  const fallbackCandidates = sortHighlightsByEvidence(context, dedupeHighlightTexts([
    ...(buckets.fallback ?? []),
    ...(buckets.profile ?? []),
    ...(buckets.complementary ?? []),
    ...(buckets.shared ?? []),
    ...(buckets.context ?? []),
  ]));

  for (const candidate of fallbackCandidates) {
    if (results.length >= 4) {
      break;
    }

    if (!isConflictingHighlight(context, results, candidate)) {
      results.push(candidate);
    }
  }

  return dedupeHighlightTexts(results);
}

function collectComplementaryHighlights(context: MatchContentContext, texts: string[]): string[] {
  if (context.complementaryScore < 0.66) {
    return [];
  }

  const keywords = ["互补", "一个更", "节奏有互补", "频率有互补", "方式有互补"];
  return texts.filter((text) => keywords.some((keyword) => text.includes(keyword)));
}

function collectSharedHighlights(context: MatchContentContext, texts: string[]): string[] {
  const keywords = [
    "都",
    "共同兴趣",
    "共同偏好",
    "重视",
    "在意",
    "喜欢",
    "长期",
    "回应",
  ];

  return texts.filter((text) =>
    keywords.some((keyword) => text.includes(keyword)) &&
    !collectComplementaryHighlights(context, [text]).length &&
    !collectContextHighlights(context, [text]).length,
  );
}

function collectContextHighlights(context: MatchContentContext, texts: string[]): string[] {
  const contextualSeeds = [
    MATCH_CONTENT_COPY.derivedHighlights.sameUniversity,
    MATCH_CONTENT_COPY.derivedHighlights.ageClose,
    MATCH_CONTENT_COPY.derivedHighlights.sharedInterestsPrefix,
    "共同偏好：",
  ];

  return texts.filter((text) => contextualSeeds.some((seed) => text.includes(seed)));
}

function pickFirstNonConflictingHighlight(
  context: MatchContentContext,
  existing: string[],
  candidates: string[],
): string {
  for (const candidate of sortHighlightsByEvidence(context, dedupeHighlightTexts(candidates))) {
    if (!isConflictingHighlight(context, existing, candidate)) {
      return candidate;
    }
  }

  return "";
}

function isConflictingHighlight(
  context: MatchContentContext,
  existing: string[],
  candidate: string,
): boolean {
  if (getHighlightEvidenceScore(context, candidate) < 0.35) {
    return true;
  }

  const candidateBucket = inferHighlightBucket(candidate);

  return existing.some((item) => {
    const sameBucket = inferHighlightBucket(item) === candidateBucket;
    const similarMeaning = areHighlightsSemanticallyClose(item, candidate);
    return sameBucket || similarMeaning;
  });
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

function dedupeHighlightTexts(texts: string[]): string[] {
  const results: string[] = [];

  for (const text of dedupeTexts(texts)) {
    const semanticKey = normalizeHighlightSemanticKey(text);
    const hasSimilar = results.some((existing) => {
      const existingKey = normalizeHighlightSemanticKey(existing);
      return (
        existingKey === semanticKey ||
        existingKey.includes(semanticKey) ||
        semanticKey.includes(existingKey)
      );
    });

    if (!hasSimilar) {
      results.push(text);
    }
  }

  return results;
}

function normalizeHighlightSemanticKey(text: string): string {
  return normalizeTextKey(text)
    .replace(/[，。、“”"'\s]/g, "")
    .replace(/比较|整体|都|更|会|也|画像|气质|接近/g, "");
}

function areHighlightsSemanticallyClose(left: string, right: string): boolean {
  const leftKey = normalizeHighlightSemanticKey(left);
  const rightKey = normalizeHighlightSemanticKey(right);

  return (
    leftKey === rightKey ||
    leftKey.includes(rightKey) ||
    rightKey.includes(leftKey)
  );
}

function inferHighlightBucket(text: string): HighlightBucket {
  if (
    text.includes("画像") ||
    text.includes("气质") ||
    text.includes("关系落在") ||
    text.includes("友情") ||
    text.includes("长期理解") ||
    text.includes("认真回应")
  ) {
    return "profile";
  }

  if (
    text.includes("互补") ||
    text.includes("一个更")
  ) {
    return "complementary";
  }

  if (
    text.includes("同校") ||
    text.includes("年龄") ||
    text.includes("共同兴趣") ||
    text.includes("共同偏好") ||
    text.includes(MATCH_CONTENT_COPY.derivedHighlights.sharedInterestsPrefix)
  ) {
    return "context";
  }

  if (
    text.includes("都") ||
    text.includes("重视") ||
    text.includes("在意") ||
    text.includes("愿意") ||
    text.includes("希望")
  ) {
    return "shared";
  }

  return "fallback";
}

function sortHighlightsByEvidence(
  context: MatchContentContext,
  texts: string[],
): string[] {
  return [...texts].sort((left, right) =>
    getHighlightEvidenceScore(context, right) - getHighlightEvidenceScore(context, left),
  );
}

function getHighlightEvidenceScore(context: MatchContentContext, text: string): number {
  const evidenceKey = inferHighlightEvidenceKey(text);
  const baseScore = getBreakdownScoreByKey(context, evidenceKey);

  if (inferHighlightBucket(text) === "fallback") {
    return baseScore - 0.05;
  }

  return baseScore;
}

function inferHighlightEvidenceKey(text: string): BreakdownKey {
  if (
    text.includes("互补") ||
    text.includes("一个更")
  ) {
    return "complementary";
  }

  if (
    text.includes("共同兴趣") ||
    text.includes(MATCH_CONTENT_COPY.derivedHighlights.sharedInterestsPrefix)
  ) {
    return "interests";
  }

  if (
    text.includes("同校") ||
    text.includes("年龄") ||
    text.includes("现实") ||
    text.includes("生活场景") ||
    text.includes("共同偏好：")
  ) {
    return "background";
  }

  return "personality";
}

function getBreakdownScoreByKey(context: MatchContentContext, key: BreakdownKey): number {
  switch (key) {
    case "personality":
      return context.personalityScore;
    case "interests":
      return context.interestsScore;
    case "background":
      return context.backgroundScore;
    case "complementary":
      return context.complementaryScore;
    default:
      return 0;
  }
}

function renderThemeHighlight(
  mode: MatchContentMode,
  tag: string | undefined,
  level: ThemeHighlightLevel,
): string {
  if (!tag) {
    return "";
  }

  const copyMap =
    mode === "friendship" ? FRIENDSHIP_THEME_HIGHLIGHT_COPY : ROMANCE_THEME_HIGHLIGHT_COPY;
  const directCopy = copyMap[tag];

  if (directCopy) {
    return directCopy;
  }

  if (level === "signature") {
    return mode === "friendship" ? `朋友气质里都有「${tag}」` : `关系偏好里都有「${tag}」`;
  }

  return mode === "friendship" ? `都在意「${tag}」这件事` : `都看重「${tag}」这件事`;
}

function renderProfileMatchHighlight(
  mode: MatchContentMode,
  profileId: string | undefined,
  profileTitle: string,
): string {
  if (!profileId) {
    return mode === "friendship" ? `${profileTitle}气质比较接近` : `${profileTitle}画像比较接近`;
  }

  const copyMap =
    mode === "friendship" ? FRIENDSHIP_PROFILE_MATCH_COPY : ROMANCE_PROFILE_MATCH_COPY;

  return copyMap[profileId] ??
    (mode === "friendship" ? `${profileTitle}气质比较接近` : `${profileTitle}画像比较接近`);
}

function renderComplementaryHighlight(context: MatchContentContext): string {
  const primaryTrait = context.complementaryTraits[0];
  const copyMap =
    context.mode === "friendship"
      ? FRIENDSHIP_COMPLEMENTARY_HIGHLIGHT_COPY
      : ROMANCE_COMPLEMENTARY_HIGHLIGHT_COPY;

  if (primaryTrait && copyMap[primaryTrait]) {
    return copyMap[primaryTrait] ?? "";
  }

  return context.mode === "friendship" ? "相处节奏有互补" : "靠近方式有互补";
}

function renderProfileOpeners(mode: MatchContentMode, profileId: string | undefined): string[] {
  if (!profileId) {
    return [];
  }

  const copyMap = mode === "friendship" ? FRIENDSHIP_PROFILE_OPENER_COPY : ROMANCE_PROFILE_OPENER_COPY;
  return copyMap[profileId] ?? [];
}

function renderThemeOpeners(mode: MatchContentMode, tag: string | undefined): string[] {
  if (!tag) {
    return [];
  }

  const copyMap = mode === "friendship" ? FRIENDSHIP_THEME_OPENER_COPY : ROMANCE_THEME_OPENER_COPY;
  return copyMap[tag] ?? [];
}

function renderComplementaryOpeners(context: MatchContentContext): string[] {
  const primaryTrait = context.complementaryTraits[0];
  if (!primaryTrait) {
    return [];
  }

  const copyMap =
    context.mode === "friendship"
      ? FRIENDSHIP_COMPLEMENTARY_OPENER_COPY
      : ROMANCE_COMPLEMENTARY_OPENER_COPY;

  return copyMap[primaryTrait] ?? [];
}

function stableHash(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

