export type MatchContentMode = "romance" | "friendship";

export type MatchContentContext = {
  mode: MatchContentMode;
  sameUniversity: boolean;
  ageDiff: number;
  sharedInterests: string[];
  sharedPreferenceTags: string[];
  personalityScore: number;
  interestsScore: number;
  backgroundScore: number;
  complementaryScore: number;
  bothHighTraits: string[];
  bothLowTraits: string[];
  complementaryTraits: string[];
};

export type MatchContentCondition = {
  sameUniversity?: boolean;
  ageDiffMax?: number;
  personalityMin?: number;
  interestsMin?: number;
  backgroundMin?: number;
  complementaryMin?: number;
  sharedInterestCountMin?: number;
  bothHighTraitsAny?: string[];
  bothLowTraitsAny?: string[];
  complementaryTraitsAny?: string[];
};

export type HighlightTemplate = {
  id: string;
  modes: MatchContentMode[] | ["all"];
  priority: number;
  when: MatchContentCondition;
  texts: string[];
};

export type IceBreakerTemplate = {
  id: string;
  modes: MatchContentMode[] | ["all"];
  priority: number;
  when: MatchContentCondition;
  texts: string[];
};

export const MATCH_CONTENT_COPY = {
  interestPlaceholder: "兴趣待补充",
  defaultPrimaryInterest: "这个兴趣",
  defaultTraitPair: "相处节奏",
  derivedHighlights: {
    sameUniversity: "同校",
    ageClose: "年龄相近",
    personalityHigh: "性格高度契合",
    sharedInterestsPrefix: "共同兴趣：",
    complementaryHigh: "相处上有互补感",
  },
} as const;

export const ROMANCE_TRAIT_LABELS: Record<string, string> = {
  socialStyle: "社交节奏",
  emotionalReadiness: "情感准备",
  dateStyle: "相处方式",
  commitment: "承诺感",
  communication: "沟通感",
  independence: "独立感",
  career: "生活目标",
  flexibility: "适应感",
};

export const FRIENDSHIP_TRAIT_LABELS: Record<string, string> = {
  socialEnergy: "社交电量",
  maintenance: "关系维护",
  boundaries: "边界感",
  spontaneity: "随性程度",
  empathy: "共情力",
  reliability: "靠谱度",
  depth: "深聊偏好",
  openness: "开放度",
};

export const INTEREST_TOPIC_OPENERS: Record<string, string[]> = {
  咖啡: [
    "看到你也喜欢咖啡，你平时更常点手冲还是奶咖？",
    "学校附近如果只能留一家咖啡店，你会选哪家？",
  ],
  电影: [
    "你最近看完还会回味的一部电影是什么？",
    "如果第一次见面顺便聊电影，你会选剧情片还是氛围片？",
  ],
  音乐: [
    "你最近单曲循环最多的一首歌是什么？",
    "如果要互相推荐一首歌，你会先丢哪首？",
  ],
  散步: [
    "你平时更喜欢白天闲逛还是晚上散步？",
    "学校里有没有一条你会反复走的路线？",
  ],
  跑步: [
    "你跑步是更看配速，还是更看当下的状态？",
    "如果有人陪你跑，你会更容易坚持吗？",
  ],
  健身: [
    "你健身更偏力量训练还是单纯想保持状态？",
    "你会喜欢有人一起练，还是更喜欢自己安排节奏？",
  ],
  羽毛球: [
    "你打羽毛球是偏娱乐局还是会认真研究技术？",
    "如果学校里约一场球，你更喜欢双打还是单打？",
  ],
  篮球: [
    "你平时是更爱看球还是更爱自己上场？",
    "如果突然约你去打球，你会马上出门吗？",
  ],
  旅行: [
    "你最近最想去的一个地方是哪里？",
    "你旅行是会详细做攻略，还是边走边看的人？",
  ],
  摄影: [
    "你拍照更喜欢抓情绪，还是更在意构图？",
    "如果随手留下一张最近的生活照片，你会拍什么？",
  ],
  阅读: [
    "你最近读到过哪一句很喜欢的话？",
    "你更容易被故事吸引，还是被观点打动？",
  ],
  写作: [
    "你写东西时更像整理情绪，还是在记录生活？",
    "如果让你最近写一小段文字，你会写给谁看？",
  ],
  桌游: [
    "你玩桌游更在意赢，还是更享受局里的气氛？",
    "如果第一次一起玩桌游，你会选轻松一点还是烧脑一点？",
  ],
  游戏: [
    "你玩游戏是偏剧情党，还是更享受操作和对抗？",
    "如果一起开黑，你是会认真带队还是纯图开心？",
  ],
  美食: [
    "如果让你带人去吃一家店，你第一反应会想到哪里？",
    "你更容易被味道打动，还是被用餐氛围打动？",
  ],
};

export const MATCH_HIGHLIGHT_TEMPLATES: HighlightTemplate[] = [
  {
    id: "same-university",
    modes: ["all"],
    priority: 100,
    when: { sameUniversity: true },
    texts: ["同校同频", "校园生活场景重合", "你们离彼此的日常很近"],
  },
  {
    id: "age-close",
    modes: ["all"],
    priority: 95,
    when: { ageDiffMax: 2 },
    texts: ["年龄接近", "生活阶段相近", "当下节奏容易对齐"],
  },
  {
    id: "shared-interests",
    modes: ["all"],
    priority: 92,
    when: { sharedInterestCountMin: 1 },
    texts: [
      "共同兴趣：{sharedInterests}",
      "你们已经有现成的话题入口",
      "共同标签让破冰更自然",
    ],
  },
  {
    id: "shared-interests-strong",
    modes: ["all"],
    priority: 90,
    when: { sharedInterestCountMin: 2, interestsMin: 0.32 },
    texts: [
      "兴趣重合度很舒服",
      "共同偏好不止一个",
      "一起做点什么会比硬聊更自然",
    ],
  },
  {
    id: "personality-high",
    modes: ["all"],
    priority: 88,
    when: { personalityMin: 0.8 },
    texts: ["性格节奏高度契合", "互动方式很合拍", "你们很容易聊到同一频道"],
  },
  {
    id: "complementary-high",
    modes: ["all"],
    priority: 84,
    when: { complementaryMin: 0.66 },
    texts: [
      "互补感很强",
      "{traitPair}上有舒服的互补",
      "一静一动也能形成配合感",
    ],
  },
  {
    id: "background-strong",
    modes: ["all"],
    priority: 82,
    when: { backgroundMin: 0.58 },
    texts: ["生活背景接近", "熟悉的场景感会让关系更快落地", "相似环境更容易建立默契"],
  },
  {
    id: "romance-commitment",
    modes: ["romance"],
    priority: 80,
    when: { bothHighTraitsAny: ["commitment", "communication"] },
    texts: ["都认真看待关系", "都重视回应与承诺", "关系推进会偏稳，而不是偏飘"],
  },
  {
    id: "romance-slow-burn",
    modes: ["romance"],
    priority: 78,
    when: { bothLowTraitsAny: ["socialStyle", "emotionalReadiness"] },
    texts: ["都偏慢热，更适合轻松熟起来", "不需要太用力，慢慢来反而更顺", "你们都不像会硬冲关系的人"],
  },
  {
    id: "romance-warm-start",
    modes: ["romance"],
    priority: 74,
    when: { bothHighTraitsAny: ["dateStyle", "emotionalReadiness"] },
    texts: ["都愿意投入相处", "暧昧和推进不会只有一方在用力", "你们对关系的温度感比较接近"],
  },
  {
    id: "friendship-reliable",
    modes: ["friendship"],
    priority: 80,
    when: { bothHighTraitsAny: ["reliability", "empathy"] },
    texts: ["都属于会认真接住朋友的人", "互相能给到情绪价值", "你们都不是表面热闹型朋友"],
  },
  {
    id: "friendship-depth",
    modes: ["friendship"],
    priority: 78,
    when: { bothHighTraitsAny: ["depth", "boundaries"] },
    texts: ["适合建立长期稳定的朋友关系", "既能深聊，也知道彼此边界", "舒服的朋友感比热闹更重要"],
  },
  {
    id: "friendship-social-balance",
    modes: ["friendship"],
    priority: 74,
    when: { complementaryTraitsAny: ["socialEnergy", "spontaneity"] },
    texts: ["社交节奏上有互补空间", "一个发起，一个接球，局会很好组", "不同电量反而更容易形成搭配"],
  },
];

export const MATCH_ICEBREAKER_TEMPLATES: IceBreakerTemplate[] = [
  {
    id: "same-university-opener",
    modes: ["all"],
    priority: 100,
    when: { sameUniversity: true },
    texts: [
      "如果在学校里临时约半小时见面，你会选咖啡、散步还是随便坐坐？",
      "你在学校里有没有一个会反复去的地方？",
      "同校的话题先来一个：你最喜欢学校里哪个时段的氛围？",
    ],
  },
  {
    id: "shared-interest-opener",
    modes: ["all"],
    priority: 96,
    when: { sharedInterestCountMin: 1 },
    texts: [
      "看到你也喜欢 {primaryInterest}，你是怎么入坑的？",
      "你和 {primaryInterest} 更像长期爱好，还是最近突然上头？",
      "如果第一次见面从 {primaryInterest} 聊起，应该挺自然的。",
    ],
  },
  {
    id: "personality-high-opener",
    modes: ["all"],
    priority: 90,
    when: { personalityMin: 0.8 },
    texts: [
      "感觉你们聊天节奏会挺合拍，可以先从最近的小日常聊起。",
      "你最近有没有一件小事，明明不大，却让你心情很好？",
      "如果要选一种最舒服的相处感，你会更偏轻松陪伴还是深度交流？",
    ],
  },
  {
    id: "complementary-opener",
    modes: ["all"],
    priority: 88,
    when: { complementaryMin: 0.66 },
    texts: [
      "你们在 {traitPair} 上挺互补的，可以聊聊各自最舒服的相处节奏。",
      "感觉你们一个偏主动一个偏接球，适合从轻一点的问题开始聊。",
      "如果一个人负责发起，一个人负责接住，你更像哪一种？",
    ],
  },
  {
    id: "background-opener",
    modes: ["all"],
    priority: 84,
    when: { backgroundMin: 0.56 },
    texts: [
      "你们生活场景挺近的，可以聊聊最近各自最常待的地方。",
      "如果从你最近的一天开始介绍自己，你会怎么讲？",
      "你最近校园生活里最舒服的一小段时刻是什么？",
    ],
  },
  {
    id: "romance-slow-burn-opener",
    modes: ["romance"],
    priority: 82,
    when: { bothLowTraitsAny: ["socialStyle", "emotionalReadiness"] },
    texts: [
      "你们都偏慢热，先从低压力的问题开始会更舒服。",
      "如果第一次聊天不想太有压力，你会更想从兴趣、日常还是学校开始？",
      "慢热的人之间，其实一句轻一点的问候就够了。",
    ],
  },
  {
    id: "romance-serious-opener",
    modes: ["romance"],
    priority: 80,
    when: { bothHighTraitsAny: ["commitment", "communication"] },
    texts: [
      "你们都挺认真，可以聊聊你认为什么样的关系最让人安心。",
      "如果一段关系让你觉得舒服，通常是因为哪一点？",
      "你会更在意聊天频率，还是回应时的稳定感？",
    ],
  },
  {
    id: "romance-date-style",
    modes: ["romance"],
    priority: 76,
    when: { bothHighTraitsAny: ["dateStyle"] },
    texts: [
      "如果第一次见面，你会更偏咖啡、散步还是一起吃点东西？",
      "理想里的第一次约会，什么感觉最重要？",
      "你更喜欢有点安排感的见面，还是顺着感觉慢慢来？",
    ],
  },
  {
    id: "friendship-reliable-opener",
    modes: ["friendship"],
    priority: 82,
    when: { bothHighTraitsAny: ["reliability", "empathy"] },
    texts: [
      "你们都挺会接住朋友，可以从“最近一次被温柔到”聊起。",
      "如果朋友状态不好，你通常会更偏陪伴还是给建议？",
      "你会更喜欢那种热闹型朋友，还是稳定型朋友？",
    ],
  },
  {
    id: "friendship-depth-opener",
    modes: ["friendship"],
    priority: 78,
    when: { bothHighTraitsAny: ["depth"] },
    texts: [
      "你们都不像只聊表面的人，可以试试从最近的真实感受切进去。",
      "如果今天只能认真聊一个问题，你最想聊什么？",
      "你会觉得什么样的人最容易慢慢聊深？",
    ],
  },
  {
    id: "friendship-easygoing-opener",
    modes: ["friendship"],
    priority: 74,
    when: { complementaryTraitsAny: ["socialEnergy", "spontaneity"] },
    texts: [
      "你们节奏有互补，可以先聊“临时起意”和“提前安排”谁更像自己。",
      "如果周末突然空出半天，你一般会计划一下还是直接出门？",
      "你更喜欢别人临时约你，还是提前说好更舒服？",
    ],
  },
  {
    id: "generic-warm-opener",
    modes: ["all"],
    priority: 60,
    when: {},
    texts: [
      "你最近有哪件小事，明明不大，但想起来还是会笑一下？",
      "如果这周只留一次轻松见面的机会，你会怎么安排？",
      "你会觉得一个人“好相处”的关键通常是什么？",
      "如果用一个词形容你最近的生活状态，你会选什么？",
      "你最近最愿意反复投入时间的一件事是什么？",
    ],
  },
];
