import {
  AlarmClockCheck,
  Cable,
  HandHeart,
  MessageCircleMore,
  MessagesSquare,
  Scale,
  Shield,
  Sparkles,
  Telescope,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import type { FriendshipQuestionV2, FriendshipTraitsV2 } from "./types";

function createIcon(Icon: LucideIcon, className: string = "h-6 w-6"): ReactElement {
  return <Icon className={className} />;
}

export const FRIENDSHIP_V2_DEFAULT_PROFILE: FriendshipTraitsV2 = {
  connectionFrequency: 5,
  emotionalHolding: 5,
  boundaryClarity: 5,
  repairInitiative: 5,
  dependability: 5,
  differenceOpenness: 5,
  comparisonTolerance: 5,
  lowPressureCompanionship: 5,
};

export const FRIENDSHIP_V2_TRAIT_KEYS: Array<keyof FriendshipTraitsV2> = [
  "connectionFrequency",
  "emotionalHolding",
  "boundaryClarity",
  "repairInitiative",
  "dependability",
  "differenceOpenness",
  "comparisonTolerance",
  "lowPressureCompanionship",
];

export const friendshipQuestionBankV2: FriendshipQuestionV2[] = [
  {
    id: "friendship_v2_frequency_1",
    text: "你更容易通过什么感受到一段友情还在？",
    category: "frequency",
    icon: createIcon(Cable, "h-6 w-6 text-sky-500"),
    answers: [
      {
        text: "日常有来有往地分享，关系才比较有在场感。",
        traits: { connectionFrequency: 8, repairInitiative: 6, emotionalHolding: 6 },
      },
      {
        text: "不用天天聊，但重要时刻会自然想到彼此。",
        traits: { connectionFrequency: 6, dependability: 7, lowPressureCompanionship: 6 },
      },
      {
        text: "联系频率没那么重要，见面时的自然感更重要。",
        traits: { connectionFrequency: 3, lowPressureCompanionship: 8, boundaryClarity: 6 },
      },
      {
        text: "哪怕很久不联系，只要关系没变味我就觉得还在。",
        traits: { connectionFrequency: 2, lowPressureCompanionship: 9, differenceOpenness: 5 },
      },
    ],
  },
  {
    id: "friendship_v2_frequency_2",
    text: "如果一个朋友最近明显联系变少了，你通常会怎样理解？",
    category: "frequency",
    icon: createIcon(MessagesSquare, "h-6 w-6 text-cyan-500"),
    answers: [
      {
        text: "会有点在意，我通常会主动问问是不是哪里变了。",
        traits: { connectionFrequency: 8, repairInitiative: 7, comparisonTolerance: 4 },
      },
      {
        text: "会留意，但我更想先看对方是不是最近真的很忙。",
        traits: { connectionFrequency: 5, emotionalHolding: 6, lowPressureCompanionship: 6 },
      },
      {
        text: "节奏变化很正常，我不太会立刻把它理解成关系降温。",
        traits: { connectionFrequency: 3, lowPressureCompanionship: 8, comparisonTolerance: 7 },
      },
      {
        text: "如果平时关系一直稳，我会默认只是阶段变化。",
        traits: { connectionFrequency: 2, dependability: 7, lowPressureCompanionship: 8 },
      },
    ],
  },
  {
    id: "friendship_v2_support_1",
    text: "朋友情绪很重地来找你时，你更像哪一种人？",
    category: "support",
    icon: createIcon(HandHeart, "h-6 w-6 text-rose-500"),
    answers: [
      {
        text: "会先接住情绪，让对方知道此刻不用一个人扛。",
        traits: { emotionalHolding: 8, dependability: 6, boundaryClarity: 4 },
      },
      {
        text: "会听，也会帮对方整理问题和下一步。",
        traits: { emotionalHolding: 6, dependability: 8, repairInitiative: 6 },
      },
      {
        text: "我会关心，但通常需要一点距离才比较能稳住自己。",
        traits: { emotionalHolding: 4, boundaryClarity: 7, lowPressureCompanionship: 6 },
      },
      {
        text: "我不是不在乎，只是不太擅长立刻进入高浓度情绪场。",
        traits: { emotionalHolding: 2, boundaryClarity: 7, dependability: 4 },
      },
    ],
  },
  {
    id: "friendship_v2_boundaries_1",
    text: "当朋友开始频繁越过你的舒服范围时，你通常会怎么做？",
    category: "boundaries",
    icon: createIcon(Shield, "h-6 w-6 text-emerald-500"),
    answers: [
      {
        text: "会比较直接说出来，不想让关系靠猜来维护边界。",
        traits: { boundaryClarity: 8, repairInitiative: 6, dependability: 6 },
      },
      {
        text: "会先看关系深浅和场景，再决定怎么讲比较合适。",
        traits: { boundaryClarity: 6, emotionalHolding: 6, differenceOpenness: 6 },
      },
      {
        text: "很多时候我会先忍一下，等真的累了再拉开距离。",
        traits: { boundaryClarity: 3, lowPressureCompanionship: 5, emotionalHolding: 5 },
      },
      {
        text: "我通常会先后退，把自己的空间守住再说。",
        traits: { boundaryClarity: 8, lowPressureCompanionship: 7, repairInitiative: 3 },
      },
    ],
  },
  {
    id: "friendship_v2_boundaries_2",
    text: "在友情里，你更认可哪种边界状态？",
    category: "boundaries",
    icon: createIcon(Scale, "h-6 w-6 text-green-600"),
    answers: [
      {
        text: "关系再好也应该知道彼此什么能给、什么不能给。",
        traits: { boundaryClarity: 8, dependability: 6, lowPressureCompanionship: 6 },
      },
      {
        text: "边界重要，但不需要每件事都讲成规则。",
        traits: { boundaryClarity: 6, differenceOpenness: 7, emotionalHolding: 6 },
      },
      {
        text: "我更看重自然亲近，太强调边界会有点生硬。",
        traits: { boundaryClarity: 3, connectionFrequency: 7, emotionalHolding: 6 },
      },
      {
        text: "舒服比热闹重要，很多边界我会默默守住而不是反复解释。",
        traits: { boundaryClarity: 7, lowPressureCompanionship: 8, connectionFrequency: 3 },
      },
    ],
  },
  {
    id: "friendship_v2_repair_1",
    text: "一段友情有点卡住了，你通常会怎么做？",
    category: "repair",
    icon: createIcon(MessageCircleMore, "h-6 w-6 text-violet-500"),
    answers: [
      {
        text: "我会主动发起联系，不想让误会自己发酵。",
        traits: { repairInitiative: 8, connectionFrequency: 7, dependability: 6 },
      },
      {
        text: "我愿意修，但会先选一个比较合适的时机。",
        traits: { repairInitiative: 6, boundaryClarity: 6, emotionalHolding: 6 },
      },
      {
        text: "如果对方也没有动作，我通常会先观察一下。",
        traits: { repairInitiative: 4, comparisonTolerance: 5, lowPressureCompanionship: 6 },
      },
      {
        text: "很多关系卡住后，我会默认彼此需要一点距离。",
        traits: { repairInitiative: 2, lowPressureCompanionship: 7, boundaryClarity: 7 },
      },
    ],
  },
  {
    id: "friendship_v2_dependability_1",
    text: "你最看重朋友身上的哪种“靠谱感”？",
    category: "dependability",
    icon: createIcon(UserRoundCheck, "h-6 w-6 text-indigo-500"),
    answers: [
      {
        text: "关键时刻能出现，答应的事基本能做到。",
        traits: { dependability: 8, boundaryClarity: 6, repairInitiative: 6 },
      },
      {
        text: "平时不一定高热，但真正需要时不会掉线。",
        traits: { dependability: 7, lowPressureCompanionship: 7, connectionFrequency: 4 },
      },
      {
        text: "我更看重相处真实自然，不一定非得很有条理。",
        traits: { dependability: 4, differenceOpenness: 6, emotionalHolding: 5 },
      },
      {
        text: "只要彼此懂得尊重边界，我不要求朋友随叫随到。",
        traits: { dependability: 3, boundaryClarity: 8, lowPressureCompanionship: 7 },
      },
    ],
  },
  {
    id: "friendship_v2_difference_1",
    text: "面对和自己很不一样的人，你在建立友情时更常见的反应是？",
    category: "difference",
    icon: createIcon(Telescope, "h-6 w-6 text-fuchsia-500"),
    answers: [
      {
        text: "会有兴趣，我愿意先看看差异里有没有新的连接方式。",
        traits: { differenceOpenness: 8, emotionalHolding: 6, boundaryClarity: 5 },
      },
      {
        text: "我能接受差异，但底层相处逻辑不能差太远。",
        traits: { differenceOpenness: 6, boundaryClarity: 6, comparisonTolerance: 6 },
      },
      {
        text: "我更容易和节奏相近的人慢慢建立稳定关系。",
        traits: { differenceOpenness: 4, lowPressureCompanionship: 7, dependability: 6 },
      },
      {
        text: "差异太大我会比较谨慎，因为长期相处成本可能很高。",
        traits: { differenceOpenness: 2, boundaryClarity: 7, comparisonTolerance: 5 },
      },
    ],
  },
  {
    id: "friendship_v2_comparison_1",
    text: "当朋友的发展明显比你更顺时，你更可能出现哪种感受？",
    category: "comparison",
    icon: createIcon(Sparkles, "h-6 w-6 text-amber-500"),
    answers: [
      {
        text: "我通常能稳住自己，真心为对方高兴。",
        traits: { comparisonTolerance: 8, differenceOpenness: 6, lowPressureCompanionship: 7 },
      },
      {
        text: "会有一点复杂，但我知道这很正常，不会因此否定友情。",
        traits: { comparisonTolerance: 6, emotionalHolding: 6, boundaryClarity: 6 },
      },
      {
        text: "会明显触发我，让我重新评估自己和关系里的位置。",
        traits: { comparisonTolerance: 3, connectionFrequency: 6, repairInitiative: 4 },
      },
      {
        text: "如果差距拉太大，我会本能地想退一点，先处理自己的感受。",
        traits: { comparisonTolerance: 2, boundaryClarity: 7, lowPressureCompanionship: 6 },
      },
    ],
  },
  {
    id: "friendship_v2_low_pressure_1",
    text: "你能不能接受一种不高频、但一直没断掉的友情？",
    category: "low_pressure",
    icon: createIcon(UsersRound, "h-6 w-6 text-orange-500"),
    answers: [
      {
        text: "不太能，我还是更容易通过互动热度感受到关系存在。",
        traits: { lowPressureCompanionship: 2, connectionFrequency: 8, repairInitiative: 6 },
      },
      {
        text: "能接受一些留白，但我还是希望关系里有明确在场感。",
        traits: { lowPressureCompanionship: 5, connectionFrequency: 6, dependability: 6 },
      },
      {
        text: "能，我觉得很多稳的关系本来就不是靠高频维持的。",
        traits: { lowPressureCompanionship: 8, connectionFrequency: 3, comparisonTolerance: 7 },
      },
      {
        text: "很能，真正舒服的友情就算安静一阵子也不会轻易断。",
        traits: { lowPressureCompanionship: 9, connectionFrequency: 2, boundaryClarity: 7 },
      },
    ],
  },
  {
    id: "friendship_v2_dependability_2",
    text: "如果朋友找你帮忙，你更接近哪种模式？",
    category: "dependability",
    icon: createIcon(AlarmClockCheck, "h-6 w-6 text-lime-500"),
    answers: [
      {
        text: "只要答应了，我通常会尽量把这件事托到底。",
        traits: { dependability: 8, emotionalHolding: 6, boundaryClarity: 5 },
      },
      {
        text: "我会根据自己的状态来答应，但答应了就会认真做。",
        traits: { dependability: 7, boundaryClarity: 7, lowPressureCompanionship: 6 },
      },
      {
        text: "我愿意帮，但不会默认自己一直是那个必须补位的人。",
        traits: { dependability: 5, boundaryClarity: 8, repairInitiative: 4 },
      },
      {
        text: "我更在意相处轻松，不太想把友情变成责任压力。",
        traits: { dependability: 3, lowPressureCompanionship: 7, differenceOpenness: 5 },
      },
    ],
  },
];

const FRIENDSHIP_V2_CORE_CATEGORIES: FriendshipQuestionV2["category"][] = [
  "frequency",
  "support",
  "boundaries",
  "repair",
  "dependability",
  "difference",
  "comparison",
  "low_pressure",
];

export function getRandomFriendshipQuestionsV2(count: number): FriendshipQuestionV2[] {
  const shuffled = [...friendshipQuestionBankV2].sort(() => 0.5 - Math.random());
  const selected: FriendshipQuestionV2[] = [];

  FRIENDSHIP_V2_CORE_CATEGORIES.forEach((category) => {
    const questionFromCategory = shuffled.find((question) => question.category === category && !selected.includes(question));
    if (questionFromCategory) {
      selected.push(questionFromCategory);
    }
  });

  FRIENDSHIP_V2_TRAIT_KEYS.forEach((trait) => {
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
