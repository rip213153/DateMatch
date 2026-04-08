import {
  BellRing,
  CalendarClock,
  Compass,
  HeartHandshake,
  Hourglass,
  MessageCircleHeart,
  Orbit,
  Scale,
  ShieldCheck,
  Sparkles,
  Speech,
  TimerReset,
  Trees,
  Waypoints,
} from "lucide-react";
import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import type { RomanceQuestionV2, RomanceTraitsV2 } from "./types";

function createIcon(Icon: LucideIcon, className: string = "h-6 w-6"): ReactElement {
  return <Icon className={className} />;
}

export const ROMANCE_V2_DEFAULT_PROFILE: RomanceTraitsV2 = {
  approachPace: 5,
  reassuranceNeed: 5,
  boundaryAutonomy: 5,
  emotionalExpression: 5,
  conflictEngagement: 5,
  futureOrientation: 5,
  jealousyRegulation: 5,
  stabilityPreference: 5,
};

export const ROMANCE_V2_TRAIT_KEYS: Array<keyof RomanceTraitsV2> = [
  "approachPace",
  "reassuranceNeed",
  "boundaryAutonomy",
  "emotionalExpression",
  "conflictEngagement",
  "futureOrientation",
  "jealousyRegulation",
  "stabilityPreference",
];

export const romanceQuestionBankV2: RomanceQuestionV2[] = [
  {
    id: "romance_v2_initiation_1",
    text: "当你对一个人开始有好感时，你通常更像哪一种节奏？",
    category: "initiation",
    icon: createIcon(Sparkles, "h-6 w-6 text-pink-500"),
    answers: [
      {
        text: "会主动制造一点真实接触，边靠近边确认感觉。",
        traits: { approachPace: 8, emotionalExpression: 7, conflictEngagement: 6 },
      },
      {
        text: "先自然互动一阵子，不急着定义，也不会完全停住。",
        traits: { approachPace: 6, boundaryAutonomy: 5, stabilityPreference: 6 },
      },
      {
        text: "会先观察对方是不是稳定可靠，再决定要不要靠近。",
        traits: { approachPace: 3, stabilityPreference: 8, reassuranceNeed: 6 },
      },
      {
        text: "除非对方也给出很明确的信号，不然我通常按兵不动。",
        traits: { approachPace: 2, reassuranceNeed: 7, jealousyRegulation: 4 },
      },
    ],
  },
  {
    id: "romance_v2_initiation_2",
    text: "关系刚开始升温时，你更舒服的推进方式是？",
    category: "initiation",
    icon: createIcon(Compass, "h-6 w-6 text-rose-500"),
    answers: [
      {
        text: "只要彼此聊得来，就可以顺势多见面、多相处。",
        traits: { approachPace: 8, futureOrientation: 4, stabilityPreference: 5 },
      },
      {
        text: "我愿意推进，但会给双方留一点感受和调整空间。",
        traits: { approachPace: 6, boundaryAutonomy: 6, conflictEngagement: 5 },
      },
      {
        text: "我更偏向慢慢来，先看看热度能不能变成稳定感。",
        traits: { approachPace: 3, stabilityPreference: 8, futureOrientation: 6 },
      },
      {
        text: "如果节奏太快，我会本能退一下，先确认自己有没有被压到。",
        traits: { approachPace: 2, boundaryAutonomy: 8, reassuranceNeed: 5 },
      },
    ],
  },
  {
    id: "romance_v2_security_1",
    text: "如果对方突然回复变慢了，你通常最在意的是？",
    category: "security",
    icon: createIcon(BellRing, "h-6 w-6 text-amber-500"),
    answers: [
      {
        text: "会明显在意，我需要知道是不是关系哪里变了。",
        traits: { reassuranceNeed: 8, jealousyRegulation: 4, stabilityPreference: 7 },
      },
      {
        text: "会留意，但会先看整体状态，不会立刻下结论。",
        traits: { reassuranceNeed: 5, jealousyRegulation: 6, stabilityPreference: 6 },
      },
      {
        text: "我更看重长期表现，单次波动不会让我太快紧张。",
        traits: { reassuranceNeed: 3, jealousyRegulation: 7, boundaryAutonomy: 6 },
      },
      {
        text: "如果平时一直稳定，我会默认对方只是忙，不会过度解读。",
        traits: { reassuranceNeed: 2, stabilityPreference: 7, jealousyRegulation: 8 },
      },
    ],
  },
  {
    id: "romance_v2_security_2",
    text: "你通常通过什么最容易判断一段关系值不值得继续投入？",
    category: "security",
    icon: createIcon(ShieldCheck, "h-6 w-6 text-emerald-500"),
    answers: [
      {
        text: "对方有没有持续回应我、把我放在心上。",
        traits: { reassuranceNeed: 8, stabilityPreference: 7, futureOrientation: 5 },
      },
      {
        text: "相处是不是稳定舒服，问题出现时能不能修回来。",
        traits: { stabilityPreference: 8, conflictEngagement: 6, futureOrientation: 6 },
      },
      {
        text: "我能不能在这段关系里完整做自己，而不是一直被关系带着走。",
        traits: { boundaryAutonomy: 8, reassuranceNeed: 4, jealousyRegulation: 6 },
      },
      {
        text: "关系是不是有生命力，见面和互动时能不能让我真实心动。",
        traits: { approachPace: 7, stabilityPreference: 4, futureOrientation: 4 },
      },
    ],
  },
  {
    id: "romance_v2_autonomy_1",
    text: "进入亲密关系后，你更舒服的个人空间是？",
    category: "autonomy",
    icon: createIcon(Orbit, "h-6 w-6 text-sky-500"),
    answers: [
      {
        text: "黏一点没关系，我喜欢高密度陪伴带来的联结感。",
        traits: { boundaryAutonomy: 2, reassuranceNeed: 7, emotionalExpression: 6 },
      },
      {
        text: "既能亲近也能各自生活，最好不用反复拉扯这个问题。",
        traits: { boundaryAutonomy: 6, stabilityPreference: 7, futureOrientation: 6 },
      },
      {
        text: "我很需要保留自己的节奏、社交和独处空间。",
        traits: { boundaryAutonomy: 8, reassuranceNeed: 4, jealousyRegulation: 6 },
      },
      {
        text: "我希望关系很亲密，但不要默认我所有时间都要向关系让位。",
        traits: { boundaryAutonomy: 7, emotionalExpression: 5, conflictEngagement: 6 },
      },
    ],
  },
  {
    id: "romance_v2_autonomy_2",
    text: "如果对方希望你把更多时间放在关系里，你更常见的反应是？",
    category: "autonomy",
    icon: createIcon(Trees, "h-6 w-6 text-green-500"),
    answers: [
      {
        text: "只要是喜欢的人，我通常愿意把优先级往关系上放。",
        traits: { boundaryAutonomy: 3, reassuranceNeed: 7, futureOrientation: 6 },
      },
      {
        text: "我会配合，但也会看自己最近的状态和承受范围。",
        traits: { boundaryAutonomy: 6, emotionalExpression: 5, conflictEngagement: 5 },
      },
      {
        text: "如果这种期待太持续，我会开始需要重新划边界。",
        traits: { boundaryAutonomy: 8, emotionalExpression: 6, conflictEngagement: 6 },
      },
      {
        text: "我会先退一步，确认这是不是在让我慢慢失去自己。",
        traits: { boundaryAutonomy: 9, reassuranceNeed: 3, jealousyRegulation: 6 },
      },
    ],
  },
  {
    id: "romance_v2_expression_1",
    text: "当你对关系里某件事不舒服时，你更像哪一种人？",
    category: "expression",
    icon: createIcon(Speech, "h-6 w-6 text-fuchsia-500"),
    answers: [
      {
        text: "会比较快说出来，不想让在意的事一直闷着。",
        traits: { emotionalExpression: 8, conflictEngagement: 7, reassuranceNeed: 6 },
      },
      {
        text: "会先整理一下自己的感受，再找合适时机表达。",
        traits: { emotionalExpression: 6, conflictEngagement: 6, jealousyRegulation: 6 },
      },
      {
        text: "很多时候我会先自己消化，看这件事值不值得讲。",
        traits: { emotionalExpression: 3, boundaryAutonomy: 7, conflictEngagement: 4 },
      },
      {
        text: "如果我不确定对方接不接得住，我通常不会轻易摊开讲。",
        traits: { emotionalExpression: 2, reassuranceNeed: 7, jealousyRegulation: 4 },
      },
    ],
  },
  {
    id: "romance_v2_expression_2",
    text: "你更相信哪一种“被理解”的方式？",
    category: "expression",
    icon: createIcon(MessageCircleHeart, "h-6 w-6 text-pink-600"),
    answers: [
      {
        text: "把话讲清楚，让彼此都知道真实感受。",
        traits: { emotionalExpression: 8, conflictEngagement: 7, futureOrientation: 6 },
      },
      {
        text: "不用每次都摊开讲，但重要时刻要能认真沟通。",
        traits: { emotionalExpression: 6, stabilityPreference: 7, conflictEngagement: 6 },
      },
      {
        text: "很多理解是从相处里慢慢长出来的，不一定非得说满。",
        traits: { emotionalExpression: 4, reassuranceNeed: 4, stabilityPreference: 6 },
      },
      {
        text: "真正懂我的人，应该能读到我没直接说出口的部分。",
        traits: { emotionalExpression: 2, reassuranceNeed: 8, jealousyRegulation: 4 },
      },
    ],
  },
  {
    id: "romance_v2_conflict_1",
    text: "如果关系里出现误会或摩擦，你更常见的动作是？",
    category: "conflict",
    icon: createIcon(HeartHandshake, "h-6 w-6 text-red-500"),
    answers: [
      {
        text: "会主动把问题拉到台面上，尽量当下处理。",
        traits: { conflictEngagement: 8, emotionalExpression: 7, stabilityPreference: 6 },
      },
      {
        text: "我会处理，但更在意方式和情绪是否适合开口。",
        traits: { conflictEngagement: 6, emotionalExpression: 6, jealousyRegulation: 6 },
      },
      {
        text: "我通常会先冷静，不太想在情绪高的时候碰硬。",
        traits: { conflictEngagement: 4, jealousyRegulation: 6, boundaryAutonomy: 6 },
      },
      {
        text: "如果对抗感太强，我会先退开，等风平一点再说。",
        traits: { conflictEngagement: 2, boundaryAutonomy: 7, emotionalExpression: 3 },
      },
    ],
  },
  {
    id: "romance_v2_conflict_2",
    text: "你怎么看待一段关系里的争执？",
    category: "conflict",
    icon: createIcon(Scale, "h-6 w-6 text-violet-500"),
    answers: [
      {
        text: "能不能修复，比有没有争执更重要。",
        traits: { conflictEngagement: 8, stabilityPreference: 8, futureOrientation: 6 },
      },
      {
        text: "争执正常，但我不希望关系总靠高张力维持真实。",
        traits: { conflictEngagement: 6, jealousyRegulation: 6, stabilityPreference: 7 },
      },
      {
        text: "我不喜欢经常争执，安稳和舒服对我更重要。",
        traits: { conflictEngagement: 3, stabilityPreference: 8, reassuranceNeed: 5 },
      },
      {
        text: "只要一进入对抗氛围，我就会觉得自己不太想留在里面。",
        traits: { conflictEngagement: 2, boundaryAutonomy: 7, jealousyRegulation: 4 },
      },
    ],
  },
  {
    id: "romance_v2_future_1",
    text: "当你喜欢一个人时，你会不会自然把对方放进未来里考虑？",
    category: "future",
    icon: createIcon(CalendarClock, "h-6 w-6 text-indigo-500"),
    answers: [
      {
        text: "会，我很难只停在当下感觉，不去想关系有没有方向。",
        traits: { futureOrientation: 8, stabilityPreference: 7, reassuranceNeed: 6 },
      },
      {
        text: "会想，但我更希望未来感是慢慢长出来的。",
        traits: { futureOrientation: 6, approachPace: 5, stabilityPreference: 6 },
      },
      {
        text: "我不会太早想很远，先把现在相处好更重要。",
        traits: { futureOrientation: 4, approachPace: 6, stabilityPreference: 5 },
      },
      {
        text: "太早谈未来会让我有点重，我更相信先活在当下。",
        traits: { futureOrientation: 2, approachPace: 7, boundaryAutonomy: 7 },
      },
    ],
  },
  {
    id: "romance_v2_future_2",
    text: "你更愿意把哪一种状态当成“关系认真起来了”？",
    category: "future",
    icon: createIcon(Waypoints, "h-6 w-6 text-blue-500"),
    answers: [
      {
        text: "开始讨论现实安排和长期打算，而不只是感觉。",
        traits: { futureOrientation: 8, stabilityPreference: 7, conflictEngagement: 6 },
      },
      {
        text: "彼此态度越来越稳定，很多事不用反复试探。",
        traits: { stabilityPreference: 8, reassuranceNeed: 6, futureOrientation: 6 },
      },
      {
        text: "互动越来越自然真实，未来这件事不用急着说满。",
        traits: { futureOrientation: 4, approachPace: 6, emotionalExpression: 5 },
      },
      {
        text: "只要当下活着、有吸引力，我不会太快用规划定义它。",
        traits: { futureOrientation: 2, approachPace: 7, stabilityPreference: 4 },
      },
    ],
  },
  {
    id: "romance_v2_regulation_1",
    text: "当你感觉到不安或吃醋时，你更接近哪种状态？",
    category: "regulation",
    icon: createIcon(TimerReset, "h-6 w-6 text-cyan-500"),
    answers: [
      {
        text: "会先分辨发生了什么，再决定要不要表达。",
        traits: { jealousyRegulation: 8, emotionalExpression: 6, conflictEngagement: 6 },
      },
      {
        text: "会有波动，但我还能提醒自己别太快脑补。",
        traits: { jealousyRegulation: 6, reassuranceNeed: 5, stabilityPreference: 6 },
      },
      {
        text: "会明显被触发，需要一点外部回应才能稳下来。",
        traits: { jealousyRegulation: 3, reassuranceNeed: 8, emotionalExpression: 5 },
      },
      {
        text: "如果信息模糊，我很容易反复猜和自己推演。",
        traits: { jealousyRegulation: 2, reassuranceNeed: 8, conflictEngagement: 3 },
      },
    ],
  },
  {
    id: "romance_v2_regulation_2",
    text: "面对关系里的不确定感，你更常用什么让自己稳住？",
    category: "regulation",
    icon: createIcon(Hourglass, "h-6 w-6 text-teal-500"),
    answers: [
      {
        text: "先观察事实，不让情绪立刻接管判断。",
        traits: { jealousyRegulation: 8, boundaryAutonomy: 6, reassuranceNeed: 3 },
      },
      {
        text: "找个合适的时间问清楚，不让误会发酵太久。",
        traits: { jealousyRegulation: 6, conflictEngagement: 7, emotionalExpression: 6 },
      },
      {
        text: "我需要从对方那里感受到明确态度，才比较容易安定。",
        traits: { jealousyRegulation: 3, reassuranceNeed: 8, stabilityPreference: 6 },
      },
      {
        text: "我会先自己扛着，但心里其实会越想越多。",
        traits: { jealousyRegulation: 2, emotionalExpression: 3, reassuranceNeed: 7 },
      },
    ],
  },
  {
    id: "romance_v2_stability_1",
    text: "你更容易被哪种关系状态打动？",
    category: "stability",
    icon: createIcon(ShieldCheck, "h-6 w-6 text-lime-500"),
    answers: [
      {
        text: "稳定、持续、遇到问题还能一起修的人。",
        traits: { stabilityPreference: 8, futureOrientation: 7, conflictEngagement: 6 },
      },
      {
        text: "有感觉也有现实感，不冷也不过度上头的人。",
        traits: { stabilityPreference: 6, futureOrientation: 6, approachPace: 5 },
      },
      {
        text: "互动里有活力、有心动、不会太快变沉重的人。",
        traits: { stabilityPreference: 4, approachPace: 7, futureOrientation: 4 },
      },
      {
        text: "当下很真、很有火花、能让我立刻感受到关系活着的人。",
        traits: { stabilityPreference: 2, approachPace: 8, emotionalExpression: 6 },
      },
    ],
  },
  {
    id: "romance_v2_stability_2",
    text: "如果一段关系很有感觉，但长期方向始终不清楚，你会怎样？",
    category: "stability",
    icon: createIcon(Scale, "h-6 w-6 text-orange-500"),
    answers: [
      {
        text: "我会慢慢失去耐心，因为关系对我来说需要方向。",
        traits: { stabilityPreference: 8, futureOrientation: 8, reassuranceNeed: 6 },
      },
      {
        text: "我会给一点时间，但不会无限期停在模糊里。",
        traits: { stabilityPreference: 7, futureOrientation: 6, conflictEngagement: 6 },
      },
      {
        text: "如果当下相处够真实，我愿意再多感受一阵子。",
        traits: { stabilityPreference: 4, approachPace: 6, futureOrientation: 4 },
      },
      {
        text: "我不太排斥模糊期，只要关系本身还让我觉得有生命力。",
        traits: { stabilityPreference: 2, approachPace: 7, futureOrientation: 2 },
      },
    ],
  },
];

const ROMANCE_V2_CORE_CATEGORIES: RomanceQuestionV2["category"][] = [
  "initiation",
  "security",
  "autonomy",
  "expression",
  "conflict",
  "future",
  "regulation",
  "stability",
];

export function getRandomRomanceQuestionsV2(count: number): RomanceQuestionV2[] {
  const shuffled = [...romanceQuestionBankV2].sort(() => 0.5 - Math.random());
  const selected: RomanceQuestionV2[] = [];

  ROMANCE_V2_CORE_CATEGORIES.forEach((category) => {
    const questionFromCategory = shuffled.find((question) => question.category === category && !selected.includes(question));
    if (questionFromCategory) {
      selected.push(questionFromCategory);
    }
  });

  ROMANCE_V2_TRAIT_KEYS.forEach((trait) => {
    if (selected.length >= count) return;

    const questionForTrait = shuffled.find(
      (question) => !selected.includes(question) && question.answers.some((answer) => trait in answer.traits)
    );

    if (questionForTrait) {
      selected.push(questionForTrait);
    }
  });

  while (selected.length < count) {
    const nextQuestion = shuffled.find((question) => !selected.includes(question));
    if (!nextQuestion) break;
    selected.push(nextQuestion);
  }

  return selected.slice(0, count);
}
