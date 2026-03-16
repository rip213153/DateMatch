import {
  BatteryWarning,
  Camera,
  Clock,
  Coffee,
  Compass,
  Gamepad2,
  Ghost,
  Laugh,
  MessageCircle,
  MessageSquare,
  Moon,
  Pizza,
  Plane,
  ShieldAlert,
  Smartphone,
  Tent,
  Trophy,
  Users,
  Zap,
  BookOpen,
} from "lucide-react";
import { ReactElement } from "react";
import { LucideIcon } from "lucide-react";
import { FriendshipQuestion } from "./types";

function createIcon(Icon: LucideIcon, className: string = "w-6 h-6"): ReactElement {
  return <Icon className={className} />;
}

export const friendshipQuestionBank: FriendshipQuestion[] = [
  {
    id: "friend_energy_1",
    text: "终于到了没有早八的周末，你最理想的回血社交局是哪种？",
    icon: createIcon(Tent, "w-6 h-6 text-emerald-500"),
    category: "social_energy",
    answers: [
      {
        text: "4 到 6 人热闹组局，玩剧本杀、密室或者唱 K，人多才有意思。",
        traits: { socialEnergy: 9, spontaneity: 7, depth: 4, openness: 6 },
      },
      {
        text: "只约一两个最熟的人，找个安静咖啡馆或江边慢慢聊一下午。",
        traits: { socialEnergy: 4, maintenance: 8, depth: 9, boundaries: 7 },
      },
      {
        text: "各自在寝室待着，连麦打游戏或者在群里疯狂发表情包。",
        traits: { socialEnergy: 5, boundaries: 8, depth: 5, openness: 5 },
      },
      {
        text: "谁喊我、项目又有意思我就去，探店看展 Citywalk 都可以。",
        traits: { socialEnergy: 7, spontaneity: 8, openness: 9, maintenance: 5 },
      },
    ],
  },
  {
    id: "friend_maintenance_1",
    text: "对于好朋友之间的聊天频率，你真实的内心期待更接近哪种？",
    icon: createIcon(MessageSquare, "w-6 h-6 text-sky-500"),
    category: "maintenance",
    answers: [
      {
        text: "最好高频分享日常，吃到好吃的、看到一只猫都想立刻发过去。",
        traits: { maintenance: 9, boundaries: 3, socialEnergy: 7, empathy: 7 },
      },
      {
        text: "不用天天聊，但遇到重要的开心或难过，一定会第一时间找对方。",
        traits: { maintenance: 7, depth: 8, empathy: 8, reliability: 7 },
      },
      {
        text: "互发搞笑视频和沙雕梗图就是常态，很少长篇大论。",
        traits: { maintenance: 5, spontaneity: 8, socialEnergy: 6, depth: 4 },
      },
      {
        text: "可以很久不联系，但一见面还是会立刻回到最熟悉的状态。",
        traits: { maintenance: 2, boundaries: 9, depth: 8, reliability: 8 },
      },
    ],
  },
  {
    id: "friend_role_1",
    text: "在一个超过 5 人的好友群聊里，你通常是什么角色？",
    icon: createIcon(Users, "w-6 h-6 text-violet-500"),
    category: "role",
    answers: [
      {
        text: "话题发起机兼捧哏王，永远冲在吃瓜第一线。",
        traits: { socialEnergy: 9, spontaneity: 8, maintenance: 7, empathy: 6 },
      },
      {
        text: "局长兼行程规划师，大家吃什么什么时候见通常都由我拍板。",
        traits: { reliability: 9, maintenance: 7, boundaries: 6, openness: 6 },
      },
      {
        text: "潜水观察员，话不多，但群里的细节和八卦我都知道。",
        traits: { socialEnergy: 3, boundaries: 7, depth: 6, empathy: 7 },
      },
      {
        text: "白天常失联，半夜突然开始发感悟和网易云链接。",
        traits: { depth: 9, spontaneity: 7, socialEnergy: 4, openness: 7 },
      },
    ],
  },
  {
    id: "friend_empathy_1",
    text: "朋友因为挂科、失恋或者被骂，大半夜打电话来疯狂哭诉，你的第一反应是什么？",
    icon: createIcon(Moon, "w-6 h-6 text-indigo-500"),
    category: "empathy",
    answers: [
      {
        text: "先和 TA 一起骂，情绪要先站在朋友这边，给足安慰。",
        traits: { empathy: 9, maintenance: 7, reliability: 6, boundaries: 3 },
      },
      {
        text: "先耐心听完，再帮 TA 梳理原因和下一步能怎么办。",
        traits: { empathy: 6, reliability: 9, depth: 7, boundaries: 6 },
      },
      {
        text: "别哭了，出来吃点好的或者打几把游戏，用行动把人捞出来。",
        traits: { spontaneity: 8, socialEnergy: 7, empathy: 6, openness: 7 },
      },
      {
        text: "其实会有点不知所措，不太擅长接激烈情绪，但会一直陪着。",
        traits: { boundaries: 8, empathy: 7, depth: 6, reliability: 7 },
      },
    ],
  },
  {
    id: "friend_boundaries_1",
    text: "你已经洗漱完准备躺平了，朋友突然说“10 分钟后到你楼下，出来吃夜宵”，你会？",
    icon: createIcon(Zap, "w-6 h-6 text-amber-500"),
    category: "boundaries",
    answers: [
      {
        text: "马上换衣服下楼，甚至穿着睡衣都能冲。",
        traits: { spontaneity: 9, boundaries: 2, socialEnergy: 8, maintenance: 7 },
      },
      {
        text: "今天真的不行，已经进入休息模式了，下次请提前约。",
        traits: { boundaries: 9, spontaneity: 2, reliability: 7, depth: 5 },
      },
      {
        text: "如果是很好的朋友，稍微收拾一下还是会去。",
        traits: { openness: 7, boundaries: 5, empathy: 7, maintenance: 6 },
      },
      {
        text: "提出折中方案，让 TA 带点吃的来我这里，大家都轻松。",
        traits: { openness: 9, boundaries: 6, reliability: 7, spontaneity: 5 },
      },
    ],
  },
  {
    id: "friend_values_1",
    text: "新认识的朋友和你在兴趣或消费观上差异很大时，你通常会怎么处理？",
    icon: createIcon(Compass, "w-6 h-6 text-teal-500"),
    category: "values",
    answers: [
      {
        text: "觉得很新鲜，反而想让 TA 带我体验我没接触过的东西。",
        traits: { openness: 9, socialEnergy: 7, spontaneity: 7, depth: 5 },
      },
      {
        text: "保持礼貌来往，只在少数同频场景里相处，不会特意深交。",
        traits: { boundaries: 7, reliability: 6, depth: 4, openness: 4 },
      },
      {
        text: "可能慢慢就淡了，我更喜欢和一秒就能懂梗的人在一起。",
        traits: { depth: 8, boundaries: 6, openness: 3, maintenance: 4 },
      },
      {
        text: "只要人品和性格在线，差异完全不是问题，照样能成为死党。",
        traits: { empathy: 8, openness: 8, reliability: 7, depth: 7 },
      },
    ],
  },
  {
    id: "friend_comfort_1",
    text: "和朋友在一个房间里，各玩了 20 分钟手机一句话没说，你心里会怎么想？",
    icon: createIcon(Ghost, "w-6 h-6 text-slate-500"),
    category: "comfort",
    answers: [
      {
        text: "完全不尴尬，真正舒服的朋友本来就能各玩各的。",
        traits: { boundaries: 8, depth: 7, socialEnergy: 4, reliability: 6 },
      },
      {
        text: "会有点冷场感，我多半会主动找话题或者分享个搞笑视频。",
        traits: { socialEnergy: 7, maintenance: 7, empathy: 6, spontaneity: 6 },
      },
      {
        text: "这种情况几乎不会出现，我们凑到一起永远有说不完的话。",
        traits: { socialEnergy: 9, maintenance: 8, boundaries: 2, depth: 5 },
      },
      {
        text: "正好利用这个空档处理自己的消息，甚至睡一会儿也挺好。",
        traits: { boundaries: 7, reliability: 6, openness: 6, socialEnergy: 3 },
      },
    ],
  },
  {
    id: "friend_lifestyle_1",
    text: "月底你和最好的朋友都快没钱了，但周末还是想出去玩，你们最像哪种安排？",
    icon: createIcon(Pizza, "w-6 h-6 text-orange-500"),
    category: "lifestyle",
    answers: [
      {
        text: "骑共享单车乱逛、去公园或者博物馆，快乐不需要门票。",
        traits: { spontaneity: 8, openness: 9, socialEnergy: 6, depth: 5 },
      },
      {
        text: "买点泡面零食窝在寝室看电影、聊天，谁也别嫌谁寒酸。",
        traits: { depth: 8, boundaries: 6, reliability: 7, maintenance: 6 },
      },
      {
        text: "直接上号，游戏里相见，零成本但照样玩得很尽兴。",
        traits: { spontaneity: 7, socialEnergy: 6, boundaries: 5, maintenance: 5 },
      },
      {
        text: "谁卡里还有最后几十块就先请，下个月再请回来，完全不计较。",
        traits: { reliability: 9, empathy: 8, boundaries: 3, depth: 7 },
      },
    ],
  },
  {
    id: "friend_travel_1",
    text: "小长假快到了，你和搭子决定去隔壁城市玩两天，你们的画风通常是？",
    icon: createIcon(Plane, "w-6 h-6 text-sky-500"),
    category: "lifestyle",
    answers: [
      {
        text: "提前半个月拉表格，精确到几点吃哪家、怎么走最省时间。",
        traits: { reliability: 9, spontaneity: 2, boundaries: 8, depth: 6 },
      },
      {
        text: "只定往返车票和住处，到了地方睡到自然醒，走到哪算哪。",
        traits: { spontaneity: 9, openness: 9, boundaries: 5, socialEnergy: 6 },
      },
      {
        text: "分工明确，我做大方向攻略，TA 负责找吃的和带路。",
        traits: { reliability: 8, maintenance: 7, openness: 7, depth: 6 },
      },
      {
        text: "我完全不想动脑子，对方安排什么都行，我负责陪伴和情绪价值。",
        traits: { openness: 8, socialEnergy: 6, reliability: 4, boundaries: 4 },
      },
    ],
  },
  {
    id: "friend_digital_1",
    text: "对于微信或 QQ 聊天里的“语音方阵”，你的真实态度是？",
    icon: createIcon(Smartphone, "w-6 h-6 text-green-500"),
    category: "maintenance",
    answers: [
      {
        text: "极度暴躁，甚至不想点开，有事直接打字或者打电话不行吗？",
        traits: { boundaries: 8, reliability: 6, empathy: 4, depth: 5 },
      },
      {
        text: "如果是好朋友发来的，不仅会听完，还会用同样长的一串语音回过去。",
        traits: { socialEnergy: 8, maintenance: 8, empathy: 8, depth: 6 },
      },
      {
        text: "默默点开语音转文字，只抓核心信息，然后用文字简短回复。",
        traits: { boundaries: 6, reliability: 7, openness: 7, empathy: 5 },
      },
      {
        text: "看情况，在走路或发呆时就当播客听；忙的话就先放着，闲了再回。",
        traits: { openness: 8, boundaries: 5, reliability: 6, maintenance: 5 },
      },
    ],
  },
  {
    id: "friend_study_1",
    text: "期末绝望周降临，大家都复习不完，你希望和搭子怎么度过这段高压期？",
    icon: createIcon(BookOpen, "w-6 h-6 text-indigo-500"),
    category: "maintenance",
    answers: [
      {
        text: "绑定成自习搭子，每天互相夺命连环 call 叫醒、监督去占座。",
        traits: { reliability: 9, maintenance: 8, boundaries: 4, depth: 6 },
      },
      {
        text: "各自闭关，互不打扰，等最后一科考完再出来报复性吃喝。",
        traits: { boundaries: 9, depth: 5, reliability: 7, maintenance: 2 },
      },
      {
        text: "学累了就一起下楼买奶茶吐槽几句老师，然后继续回去卷。",
        traits: { empathy: 8, spontaneity: 6, maintenance: 7, socialEnergy: 6 },
      },
      {
        text: "共享资料库，谁看到重点或押题就立刻无私转给对方。",
        traits: { reliability: 8, maintenance: 7, boundaries: 6, depth: 7 },
      },
    ],
  },
  {
    id: "friend_battery_1",
    text: "参加一个有生人的多人聚会，中途你的社交电量突然耗尽，极度想回宿舍，你会？",
    icon: createIcon(BatteryWarning, "w-6 h-6 text-red-500"),
    category: "social_energy",
    answers: [
      {
        text: "给带我来的朋友疯狂使眼色，或者发微信暗示“救命，想溜了”。",
        traits: { boundaries: 7, empathy: 6, socialEnergy: 4, maintenance: 6 },
      },
      {
        text: "找个完美借口，非常体面自然地告辞。",
        traits: { boundaries: 8, reliability: 7, socialEnergy: 5, openness: 5 },
      },
      {
        text: "为了不扫大家兴，硬撑到散场，回去之后需要自闭三天。",
        traits: { empathy: 9, boundaries: 2, reliability: 7, socialEnergy: 3 },
      },
      {
        text: "直接切成静音模式，缩在角落玩手机吃东西，肉体在场灵魂下班。",
        traits: { openness: 8, boundaries: 7, socialEnergy: 3, depth: 4 },
      },
    ],
  },
  {
    id: "friend_camera_1",
    text: "难得周末和朋友出去吃顿好的或逛街，你对待拍照的态度是？",
    icon: createIcon(Camera, "w-6 h-6 text-pink-500"),
    category: "lifestyle",
    answers: [
      {
        text: "吃饭先让手机吃，而且必须拍满九宫格合照，修半天图再发。",
        traits: { socialEnergy: 8, maintenance: 8, spontaneity: 5, openness: 6 },
      },
      {
        text: "只拍风景和美食，自己懒得出镜，如果朋友想拍我可以当拍照工具人。",
        traits: { depth: 6, boundaries: 6, openness: 7, empathy: 6 },
      },
      {
        text: "极其随性，想起来就随手抓拍一张，想不起来一张也不拍。",
        traits: { spontaneity: 9, openness: 8, boundaries: 5, depth: 4 },
      },
      {
        text: "不喜欢一直举着手机，觉得很影响两个人真实交流的体验。",
        traits: { depth: 8, boundaries: 6, empathy: 7, maintenance: 5 },
      },
    ],
  },
  {
    id: "friend_time_1",
    text: "约好了下午两点在校门口见，现在已经两点一刻了，朋友还没出现，你会？",
    icon: createIcon(Clock, "w-6 h-6 text-yellow-600"),
    category: "boundaries",
    answers: [
      {
        text: "心里有点火大，见面后会认真表达我的不满。",
        traits: { boundaries: 9, reliability: 9, depth: 6, empathy: 4 },
      },
      {
        text: "发个微信催一下，然后在附近找个奶茶店坐着边玩手机边等。",
        traits: { openness: 7, empathy: 6, reliability: 6, boundaries: 5 },
      },
      {
        text: "完全不生气，因为我大概率也才刚出宿舍门，大家都是在路上。",
        traits: { spontaneity: 9, openness: 8, reliability: 3, boundaries: 3 },
      },
      {
        text: "见面后疯狂调侃，顺便让对方请杯咖啡当迟到补偿。",
        traits: { socialEnergy: 8, empathy: 7, reliability: 5, openness: 7 },
      },
    ],
  },
  {
    id: "friend_social_circle_1",
    text: "你把自己最好的两个朋友约出来一起吃饭，结果发现他俩气场不和、聊不到一块，你会？",
    icon: createIcon(ShieldAlert, "w-6 h-6 text-red-400"),
    category: "role",
    answers: [
      {
        text: "疯狂找共同话题，努力凭一己之力把场子热起来。",
        traits: { empathy: 9, socialEnergy: 7, maintenance: 8, reliability: 6 },
      },
      {
        text: "以后坚决不再把他们凑一个局了，把两段友谊放进不同社交抽屉。",
        traits: { boundaries: 8, reliability: 7, depth: 5, openness: 4 },
      },
      {
        text: "觉得顺其自然就好，大家都是成年人，尴尬一点也正常。",
        traits: { openness: 8, boundaries: 6, socialEnergy: 5, depth: 4 },
      },
      {
        text: "干脆自己主导话题，把三人局硬拆成两个 1 对 1 在同一张桌子上进行。",
        traits: { reliability: 8, maintenance: 7, socialEnergy: 6, empathy: 6 },
      },
    ],
  },
  {
    id: "friend_fandom_1",
    text: "最近你疯狂迷上一部新剧、一个游戏或一位歌手，想分享给搭子时你会？",
    icon: createIcon(Gamepad2, "w-6 h-6 text-purple-600"),
    category: "values",
    answers: [
      {
        text: "按头安利，疯狂发链接，恨不得强迫 TA 陪我一起看一起玩。",
        traits: { socialEnergy: 9, maintenance: 8, boundaries: 3, openness: 7 },
      },
      {
        text: "热情推荐一次，如果对方明显不感兴趣，我就立刻收回不再提。",
        traits: { boundaries: 7, depth: 6, openness: 5, empathy: 6 },
      },
      {
        text: "发到朋友圈或空间，对方感兴趣自然会来问我，不强求。",
        traits: { boundaries: 8, openness: 8, maintenance: 4, socialEnergy: 4 },
      },
      {
        text: "除非我知道对方本来就感兴趣，否则平时连提都不会提。",
        traits: { boundaries: 9, depth: 5, openness: 3, reliability: 6 },
      },
    ],
  },
  {
    id: "friend_celebrate_1",
    text: "你最好的朋友拿到了很厉害的奖学金或者大厂 Offer，作为挚友你的第一反应是？",
    icon: createIcon(Trophy, "w-6 h-6 text-yellow-400"),
    category: "empathy",
    answers: [
      {
        text: "激动得像自己拿了一样，立刻发红包或者组局庆祝。",
        traits: { socialEnergy: 9, empathy: 8, maintenance: 8, openness: 7 },
      },
      {
        text: "由衷为 TA 高兴，给 TA 发一段很长很走心的话。",
        traits: { depth: 9, empathy: 9, maintenance: 7, reliability: 7 },
      },
      {
        text: "先调侃一句“苟富贵勿相忘”，用幽默方式帮 TA 开心。",
        traits: { spontaneity: 8, empathy: 7, socialEnergy: 7, openness: 6 },
      },
      {
        text: "为 TA 开心，但也会隐隐被激励到，提醒自己也得加把劲。",
        traits: { reliability: 8, depth: 6, empathy: 5, boundaries: 6 },
      },
    ],
  },
  {
    id: "friend_gossip_1",
    text: "你意外得知了一个关于共同熟人的惊天大瓜，你会？",
    icon: createIcon(MessageCircle, "w-6 h-6 text-pink-400"),
    category: "maintenance",
    answers: [
      {
        text: "根本憋不住，10 秒内这个瓜就会原封不动出现在我和搭子的聊天框里。",
        traits: { spontaneity: 9, socialEnergy: 8, maintenance: 8, boundaries: 3 },
      },
      {
        text: "先自己核实真假，等线下见面吃饭时再绘声绘色细讲。",
        traits: { reliability: 7, maintenance: 6, depth: 6, boundaries: 6 },
      },
      {
        text: "把朋友约出来，先让 TA 发誓绝对不能跟第三个人说。",
        traits: { boundaries: 7, maintenance: 8, depth: 7, empathy: 5 },
      },
      {
        text: "听完就算了，别人的事跟我关系不大，我也懒得专门去讲。",
        traits: { boundaries: 9, maintenance: 2, socialEnergy: 2, depth: 4 },
      },
    ],
  },
  {
    id: "friend_humor_1",
    text: "你觉得一段长久友谊里，什么最能让你觉得“遇到知音了”？",
    icon: createIcon(Laugh, "w-6 h-6 text-orange-400"),
    category: "values",
    answers: [
      {
        text: "一起发疯，随便做点很蠢的事都能笑到直不起腰。",
        traits: { spontaneity: 9, socialEnergy: 8, depth: 3, openness: 7 },
      },
      {
        text: "吐槽功力在线，我刚起个头，对方就能接出最绝妙的下半句。",
        traits: { depth: 7, socialEnergy: 7, openness: 6, maintenance: 6 },
      },
      {
        text: "哪怕很微妙的情绪和冷门感受，对方也能瞬间 get 到。",
        traits: { depth: 9, empathy: 9, boundaries: 5, maintenance: 7 },
      },
      {
        text: "无论我多丢脸或状态多差，都知道总有人给我托底。",
        traits: { reliability: 9, maintenance: 8, boundaries: 4, empathy: 8 },
      },
    ],
  },
  {
    id: "friend_share_1",
    text: "一起出去吃饭或者喝奶茶，你对“尝一口对方碗里东西”这件事的态度是？",
    icon: createIcon(Coffee, "w-6 h-6 text-amber-600"),
    category: "boundaries",
    answers: [
      {
        text: "完全不介意，大家都是好朋友，用同一根吸管都没问题。",
        traits: { boundaries: 2, empathy: 7, socialEnergy: 8, maintenance: 7 },
      },
      {
        text: "对方主动想尝我没问题，但我自己很少主动提。",
        traits: { boundaries: 5, openness: 8, empathy: 6, depth: 5 },
      },
      {
        text: "可以分一点出来给对方尝，但直接就着吃我会有心理障碍。",
        traits: { boundaries: 8, reliability: 6, empathy: 5, depth: 5 },
      },
      {
        text: "极度抗拒，大家点各自爱吃的，井水不犯河水最好。",
        traits: { boundaries: 9, depth: 6, socialEnergy: 3, reliability: 7 },
      },
    ],
  },
];

const FRIENDSHIP_CORE_CATEGORIES: FriendshipQuestion["category"][] = [
  "social_energy",
  "maintenance",
  "role",
  "empathy",
  "boundaries",
  "values",
  "comfort",
  "lifestyle",
];

const FRIENDSHIP_TRAIT_KEYS: Array<keyof NonNullable<FriendshipQuestion["answers"][number]["traits"]>> = [
  "socialEnergy",
  "maintenance",
  "boundaries",
  "spontaneity",
  "empathy",
  "reliability",
  "depth",
  "openness",
];

export function getRandomFriendshipQuestions(count: number): FriendshipQuestion[] {
  const shuffled = [...friendshipQuestionBank].sort(() => 0.5 - Math.random());
  const selected: FriendshipQuestion[] = [];

  FRIENDSHIP_CORE_CATEGORIES.forEach((category) => {
    const questionFromCategory = shuffled.find((question) => question.category === category && !selected.includes(question));
    if (questionFromCategory) {
      selected.push(questionFromCategory);
    }
  });

  FRIENDSHIP_TRAIT_KEYS.forEach((trait) => {
    if (selected.length >= count) {
      return;
    }

    const questionForTrait = shuffled.find(
      (question) => !selected.includes(question) && question.answers.some((answer) => trait in answer.traits)
    );

    if (questionForTrait) {
      selected.push(questionForTrait);
    }
  });

  while (selected.length < count) {
    const nextQuestion = shuffled.find((question) => !selected.includes(question));
    if (!nextQuestion) {
      break;
    }
    selected.push(nextQuestion);
  }

  return selected.slice(0, count);
}
