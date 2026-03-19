import type { QuizMode } from "@/app/data/types";
import type { CategorizedTagGroup } from "@/components/profile/CategorizedTagEditor";

const ROMANCE_GROUPS: CategorizedTagGroup[] = [
  {
    id: "scene",
    label: "约会场景",
    description: "你更偏爱的第一次见面或常见约会场景。",
    tags: ["咖啡馆", "散步", "吃饭聊天", "看展", "看电影", "Livehouse", "探店", "户外", "书店", "校园散步", "夜景兜风", "一起逛超市", "下午茶", "小酒馆"],
  },
  {
    id: "pace",
    label: "相处节奏",
    description: "你希望关系推进的速度和联系频率。",
    tags: ["轻松自然", "慢热", "说走就走", "提前计划", "高频见面", "低频高质量", "先聊天熟悉", "先从朋友做起", "稳定输出", "留一点空间", "周末约会", "临时起意也行", "白天见面", "夜晚约会"],
  },
  {
    id: "vibe",
    label: "约会氛围",
    description: "你更看重见面时的感受和情绪浓度。",
    tags: ["有仪式感", "松弛随意", "深度聊天", "安静陪伴", "幽默有趣", "有新鲜感", "浪漫一点", "不尴尬最重要", "有点暧昧感", "轻松不端着", "真诚自然", "一起拍照", "有共同话题", "舒服最重要"],
  },
  {
    id: "interaction",
    label: "互动方式",
    description: "你希望对方怎样和你互动。",
    tags: ["主动一点", "双向奔赴", "真诚直接", "慢慢了解", "会接话", "愿意分享日常", "会表达喜欢", "有来有回", "聊天不消失", "愿意倾听", "会制造惊喜", "边界清晰", "不敷衍", "行动派"],
  },
  {
    id: "expectation",
    label: "关系期待",
    description: "你对关系目标和状态的偏好。",
    tags: ["稳定长期", "顺其自然", "认真了解", "情绪稳定", "价值观契合", "能互相支持", "彼此成长", "尊重边界", "有安全感", "不养鱼", "专一坦诚", "未来感", "不内耗", "成熟沟通"],
  },
  {
    id: "date_style",
    label: "约会风格",
    description: "你更喜欢哪类具体约会体验。",
    tags: ["一起做饭", "一起运动", "边走边聊", "一起看演出", "一起打卡城市角落", "交换歌单", "一起学习", "一起旅行", "一起逛市集", "一起打游戏", "一起看夕阳", "一起逛校园", "一起拍照", "一起吃夜宵"],
  },
];

const FRIENDSHIP_GROUPS: CategorizedTagGroup[] = [
  {
    id: "activity",
    label: "常见活动",
    description: "你更希望先从什么事一起做开始。",
    tags: ["Citywalk", "吃饭", "自习", "运动", "游戏", "看展", "旅行", "拍照", "逛街", "看电影", "探店", "咖啡聊天", "逛书店", "夜跑"],
  },
  {
    id: "pace",
    label: "相处节奏",
    description: "你喜欢怎样的联系频率和搭子节奏。",
    tags: ["随叫随到", "周末限定", "偶尔约", "固定搭子", "高频联系", "低压相处", "临时约也行", "提前约更好", "日常都能聊", "只在线下见面", "长期稳定", "短局不累", "有空就约", "不强求秒回"],
  },
  {
    id: "social",
    label: "社交浓度",
    description: "你更想要热闹局还是小范围陪伴。",
    tags: ["热闹局", "小范围", "一对一", "轻社交", "能接梗", "安静陪伴", "熟了会很吵", "先慢慢熟", "人多也能玩", "更适合小圈子", "线上线下都行", "线下更重要", "不爱硬社交", "主打舒服"],
  },
  {
    id: "style",
    label: "相处风格",
    description: "你最看重的朋友相处体验。",
    tags: ["有边界感", "靠谱不放鸽子", "计划型", "随性型", "不尬聊", "长期同频", "会照顾情绪", "不内耗", "有事直说", "轻松自然", "互相尊重", "不冷场", "做事利落", "温和稳定"],
  },
  {
    id: "support",
    label: "陪伴方式",
    description: "你想要哪种类型的搭子陪伴。",
    tags: ["饭搭子", "学习搭子", "运动搭子", "旅行搭子", "逛展搭子", "拍照搭子", "追星搭子", "看演出搭子", "下班聊天搭子", "周末出门搭子", "游戏搭子", "夜聊搭子", "散步搭子", "探店搭子"],
  },
  {
    id: "boundary",
    label: "边界默契",
    description: "你对朋友边界和相处规则的偏好。",
    tags: ["不查户口", "不强绑定", "各忙各的也行", "需要回应感", "尊重独处", "有事提前说", "不放鸽子", "不情绪勒索", "彼此坦诚", "关系不拧巴", "不夺命连环call", "界限清楚", "松弛但靠谱", "有分寸感"],
  },
];

const MAX_TAGS = 6;

function dedupeTexts(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const text = item.trim();
    const normalized = text.toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(text);
  }

  return result;
}

export function getIdealPreferenceGroups(mode: QuizMode): CategorizedTagGroup[] {
  return mode === "friendship" ? FRIENDSHIP_GROUPS : ROMANCE_GROUPS;
}

export function getIdealPreferenceLabel(mode: QuizMode) {
  return mode === "friendship" ? "理想相处方式" : "理想约会";
}

export function getIdealPreferenceHelperText(mode: QuizMode) {
  return mode === "friendship"
    ? "先从不同的大类里挑选最符合你的相处标签，系统会优先拿这些标签做匹配；也可以在下方补充自己的描述。"
    : "先从不同的大类里挑选最符合你的约会标签，系统会优先拿这些标签做匹配；也可以在下方补充自己的描述。";
}

export function getIdealPreferencePlaceholder(mode: QuizMode) {
  return mode === "friendship"
    ? "选填：比如希望一起自习、周末吃饭聊天，或者更看重边界感、稳定联系。"
    : "选填：比如希望第一次见面轻松自然，或者更喜欢有仪式感、能慢慢了解彼此。";
}

export function getIdealPreferenceMaxTags() {
  return MAX_TAGS;
}

export function normalizeIdealPreferenceTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return dedupeTexts(
      value
        .map((item) => String(item ?? "").trim())
        .filter(Boolean),
    ).slice(0, MAX_TAGS);
  }

  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return [];

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return normalizeIdealPreferenceTags(parsed);
      }
    } catch {
      return dedupeTexts(
        text
          .split(/[\n,，、/]+/)
          .map((item) => item.trim())
          .filter(Boolean),
      ).slice(0, MAX_TAGS);
    }

    return dedupeTexts([text]).slice(0, MAX_TAGS);
  }

  return [];
}

export function serializeIdealPreferenceTags(value: unknown) {
  return JSON.stringify(normalizeIdealPreferenceTags(value));
}

export function summarizeIdealPreference(tags: unknown, description: unknown, fallback: string) {
  const normalizedTags = normalizeIdealPreferenceTags(tags);
  if (normalizedTags.length > 0) {
    return normalizedTags.slice(0, 2).join(" · ");
  }

  const text = String(description ?? "").trim();
  return text || fallback;
}
