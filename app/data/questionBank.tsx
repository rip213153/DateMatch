
import {
  Heart,
  Smartphone,
  Briefcase,
  Book,
  Users,
  Calendar,
  Home,
  MessageCircle,
  Globe,
  School,
  Camera,
  DollarSign,
  Map,
  Plane,
  Lock,
  Brain,
  Trophy,
} from "lucide-react";
import { Question } from "./types";
import { ReactElement } from "react";
import { LucideIcon } from "lucide-react";

function createIcon(
  Icon: LucideIcon,
  className: string = "w-6 h-6"
): ReactElement {
  return <Icon className={className} />;
}

export const questionBank: Question[] =[
  // 社交媒体与科技
  {
    id: "social_1",
    text: "Crush 在朋友圈发了和异性的合照（还带了定位在中央大街），你的第一反应是？",
    icon: createIcon(Smartphone, "w-6 h-6 text-blue-500"),
    category: "social",
    answers:[
      {
        text: "化身列文虎克，忍不住点进主页多看两眼分析一下对方是谁",
        traits: { socialStyle: 8, emotionalReadiness: 4, independence: 3 },
        explanation: "你可能在感情中比较在意细节，容易产生内耗",
      },
      {
        text: "随手点个赞，继续该干嘛干嘛，不过度脑补",
        traits: { socialStyle: 6, emotionalReadiness: 7, independence: 7 },
        explanation: "你能保持极其健康的社交媒体边界感和情绪稳定",
      },
      {
        text: "顺其自然吧，可能只是普通的同学或朋友聚会",
        traits: { socialStyle: 4, emotionalReadiness: 6, independence: 8 },
        explanation: "你心态较为佛系，更重视现实生活中的真实联结",
      },
      {
        text: "心里有点泛酸，但会提醒自己保持理智不冲动发作",
        traits: { socialStyle: 5, emotionalReadiness: 5, independence: 5 },
        explanation: "你正在学习如何更好地管理外界带来的情绪波动",
      },
    ],
  },
  {
    id: "social_2",
    text: "在 DateMatch 或者交友软件上匹配到人后，你的聊天模式是？",
    icon: createIcon(MessageCircle, "w-6 h-6 text-pink-500"),
    category: "communication",
    answers:[
      {
        text: "回复比较积极，能同时和几个聊得来的同学保持友好交流",
        traits: { communication: 8, dateStyle: 8, socialStyle: 7 },
        explanation: "你极其适应现代快节奏的线上社交",
      },
      {
        text: "一次习惯只专注和一个人深度交流，慢慢了解",
        traits: { communication: 6, dateStyle: 4, commitment: 8 },
        explanation: "你更倾向于专注且有意义的情感连接",
      },
      {
        text: "字斟句酌，喜欢构思走心且有深度的长篇大论",
        traits: { communication: 7, dateStyle: 5, emotionalReadiness: 7 },
        explanation: "你极其重视高质量的思想碰撞",
      },
      {
        text: "网聊不如线下见，倾向于赶紧约去操场散散步或者喝杯奶茶",
        traits: { communication: 5, dateStyle: 7, socialStyle: 8 },
        explanation: "你更偏爱真实的线下互动氛围",
      },
    ],
  },

  // 学业/事业平衡
  {
    id: "career_1",
    text: "期末“绝望周”降临，你打算怎么平衡复习和恋爱？",
    icon: createIcon(Book, "w-6 h-6 text-purple-500"),
    category: "career",
    answers:[
      {
        text: "双管齐下：相约锦绣/丹青/成栋楼当硬核自习搭子",
        traits: { career: 7, flexibility: 8, dateStyle: 6 },
        explanation: "你善于将学业与陪伴完美融合",
      },
      {
        text: "学业优先，跟对方商量好等考完高数/大物再好好约会",
        traits: { career: 9, independence: 8, commitment: 4 },
        explanation: "在你心里，拿高绩点和个人前途有着较高优先级",
      },
      {
        text: "学累了去楼下买杯热饮，或者去颐丰园吃顿夜宵见一面充充电",
        traits: { career: 6, flexibility: 7, communication: 7 },
        explanation: "你是时间管理大师，懂得适时调整节奏",
      },
      {
        text: "照常约会，但可能会适当缩短时间，提高效率",
        traits: { career: 5, commitment: 7, flexibility: 6 },
        explanation: "你努力在极端压力下依然维系着感情的温度",
      },
    ],
  },

  // 社交生活与约会
  {
    id: "social_3",
    text: "你的室友/闺蜜/兄弟觉得你现在的交往对象不太靠谱，你会？",
    icon: createIcon(Users, "w-6 h-6 text-yellow-500"),
    category: "social",
    answers:[
      {
        text: "会在意朋友的看法，找机会悄悄重新审视一下这段关系",
        traits: { socialStyle: 8, independence: 4, emotionalReadiness: 6 },
        explanation: "你比较看重核心社交圈的反馈和意见",
      },
      {
        text: "继续相处，但会客观观察朋友们说的问题是否真的存在",
        traits: { socialStyle: 6, independence: 7, communication: 8 },
        explanation: "你能理性平衡多方观点，不盲从",
      },
      {
        text: "觉得感情如人饮水，尽量避免对象和室友的圈子产生硬摩擦",
        traits: { socialStyle: 4, independence: 8, flexibility: 5 },
        explanation: "你拥有比较清晰的人际边界感",
      },
      {
        text: "攒个局请大家去林大周边的烧烤店搓一顿，努力拉近距离",
        traits: { socialStyle: 7, communication: 8, flexibility: 7 },
        explanation: "你是天生的破冰能手和关系调解员",
      },
    ],
  },

  // 异地恋与科技
  {
    id: "distance_1",
    text: "如果是跨校区甚至跨省的异地恋，你觉得你能 hold 住吗？",
    icon: createIcon(Globe, "w-6 h-6 text-green-500"),
    category: "commitment",
    answers:[
      {
        text: "尽量保持高频分享日常，通过视频连麦给彼此安全感",
        traits: { commitment: 9, communication: 8, independence: 4 },
        explanation: "你愿意付出极大的情绪价值来维持联系",
      },
      {
        text: "各自在自己的学校卷学业，闲下来时再高质量陪伴",
        traits: { commitment: 6, independence: 8, emotionalReadiness: 7 },
        explanation: "你能完美平衡个人独立性与亲密感",
      },
      {
        text: "会有顾虑，毕竟更向往能随时一起去树木园散步的真实陪伴",
        traits: { commitment: 4, independence: 6, dateStyle: 7 },
        explanation: "你极度重视现实生活中看得见摸得着的陪伴",
      },
      {
        text: "规划好见面频率，把买高铁票/机票当成平淡生活的盼头",
        traits: { commitment: 7, flexibility: 8, communication: 7 },
        explanation: "你有极强的适应力和维系感情的韧性",
      },
    ],
  },

  // 派对/社交场景
  {
    id: "party_1",
    text: "在社团破冰局或者老乡聚会上，你的 Crush 刚好也在，你会？",
    icon: createIcon(Users, "w-6 h-6 text-purple-500"),
    category: "social",
    answers:[
      {
        text: "找个合适的话题，自然地端着饮料上去打个招呼加个微信",
        traits: { socialStyle: 7, communication: 6, dateStyle: 7 },
        explanation: "你在社交场合中既有策略又显得从容",
      },
      {
        text: "敌不动我不动，安静如鸡等 Ta 主动来搭话",
        traits: { socialStyle: 4, independence: 7, emotionalReadiness: 5 },
        explanation: "你享受顺其自然，不愿在感情中强求",
      },
      {
        text: "向僚机朋友递眼神，求助他们帮忙组局制造一点接触机会",
        traits: { socialStyle: 6, communication: 5, dateStyle: 6 },
        explanation: "你懂得巧妙借用社交圈子的力量",
      },
      {
        text: "主动大方地加入 Ta 所在的群聊，表现出自己有趣的一面",
        traits: { socialStyle: 8, communication: 8, independence: 7 },
        explanation: "你是令人瞩目的社交达人，自信大方",
      },
    ],
  },
  {
    id: "party_2",
    text: "朋友聚餐发现其他人全是一对对的情侣，作为唯一的单身人士你会？",
    icon: createIcon(Users, "w-6 h-6 text-indigo-500"),
    category: "social",
    answers:[
      {
        text: "内心毫无波澜，甚至还想多吃两口林大周边的铁锅炖",
        traits: { independence: 8, socialStyle: 7, emotionalReadiness: 7 },
        explanation: "你拥有极其强大且自洽的单身内核",
      },
      {
        text: "偷偷给单身室友发消息求助，希望能来个人一起转移注意力",
        traits: { socialStyle: 6, independence: 5, flexibility: 7 },
        explanation: "你总能在略显尴尬的社交场合寻找平衡支点",
      },
      {
        text: "提前找个恰当的借口，委婉推掉这种容易产生落差感的局",
        traits: { independence: 4, socialStyle: 4, emotionalReadiness: 5 },
        explanation: "面对恋爱情境主导的氛围，你倾向于自我保护",
      },
      {
        text: "前排围观别人的恋爱状态，暗中收集恋爱素材当乐子看",
        traits: { emotionalReadiness: 8, communication: 7, dateStyle: 6 },
        explanation: "你是人间清醒的观察家，注重精神成长",
      },
    ],
  },

  // 学业兼容性
  {
    id: "academic_1",
    text: "找对象时，对方是什么专业/学院的对你来说重要吗？",
    icon: createIcon(Book, "w-6 h-6 text-blue-500"),
    category: "values",
    answers:[
      {
        text: "挺加分的，同专业能一起卷实验、去帽儿山实习，有共同话题",
        traits: { career: 8, dateStyle: 6, commitment: 7 },
        explanation: "你追求步调一致的学术与事业同盟",
      },
      {
        text: "无所谓专业，只要 Ta 对自己的事有上进心和基本规划就行",
        traits: { flexibility: 8, independence: 7, emotionalReadiness: 7 },
        explanation: "你更看重内在的进取心而非外在标签",
      },
      {
        text: "更倾向于不同专业，文理互补能碰撞出不一样的思维火花",
        traits: { flexibility: 9, communication: 7, independence: 6 },
        explanation: "你热爱多元视角的灵魂碰撞",
      },
      {
        text: "专业不重要，但至少两人要能互相督促，不能整天躺平",
        traits: { career: 7, commitment: 8, dateStyle: 5 },
        explanation: "你对伴侣有着明确的底线和专注力要求",
      },
    ],
  },

  // 家庭关系
  {
    id: "family_1",
    text: "谈恋爱大概多久后，你会考虑把对方介绍给父母/家人？",
    icon: createIcon(Home, "w-6 h-6 text-green-500"),
    category: "commitment",
    answers:[
      {
        text: "确认关系且感情极其稳定后，才会谨慎地跟家里透露",
        traits: { commitment: 7, emotionalReadiness: 6, dateStyle: 5 },
        explanation: "你对待家庭介入的态度极其慎重且负责",
      },
      {
        text: "感觉到了就行，可能刚谈一个月就在和父母视频里自然出镜了",
        traits: { flexibility: 8, emotionalReadiness: 7, independence: 6 },
        explanation: "你跟着直觉走，不受条条框框束缚",
      },
      {
        text: "尽早沟通，毕竟父母阅人无数，想听听他们理性的建议",
        traits: { commitment: 8, socialStyle: 7, dateStyle: 4 },
        explanation: "你非常信赖并看重原生家庭的意见",
      },
      {
        text: "倾向于顺其自然，可能等毕业或有了明确未来规划后再正式介绍",
        traits: { independence: 8, flexibility: 5, commitment: 4 },
        explanation: "你习惯在生活中保留清晰的个人节奏",
      },
    ],
  },

  // 未来规划
  {
    id: "future_1",
    text: "毕业季，你拿到了北上广的神仙 Offer，但对象决定留老家，你会？",
    icon: createIcon(Map, "w-6 h-6 text-yellow-500"),
    category: "career",
    answers:[
      {
        text: "事业优先，会诚实地告诉对方自己的选择，不轻易妥协好Offer",
        traits: { career: 9, independence: 8, commitment: 4 },
        explanation: "你是清醒的个人发展主导者",
      },
      {
        text: "充分沟通，看看能不能找到一个距离适中、双方都能接受的折中方案",
        traits: { flexibility: 8, communication: 7, commitment: 7 },
        explanation: "你总是努力在面包与爱情间寻找最优解",
      },
      {
        text: "只要是对的人，去天涯海角我也愿意考虑追随 Ta 开启异地或调整规划",
        traits: { commitment: 9, emotionalReadiness: 8, communication: 7 },
        explanation: "你是愿意为了深切羁绊做出让步的纯爱战神",
      },
      {
        text: "未来变数太多，暂时不想那么远，先把眼下的校园恋爱谈好",
        traits: { flexibility: 6, independence: 7, emotionalReadiness: 4 },
        explanation: "你信奉活在当下，不愿过早陷入未来的焦虑",
      },
    ],
  },

  // 生活方式与习惯
  {
    id: "lifestyle_1",
    text: "完美的周末约会，你脑海中的画面是？",
    icon: createIcon(Calendar, "w-6 h-6 text-orange-500"),
    category: "lifestyle",
    answers:[
      {
        text: "白天一起去太阳岛或江畔逛逛，晚上在中央大街单独压马路",
        traits: { flexibility: 8, socialStyle: 6, dateStyle: 7 },
        explanation: "你热衷于在喧闹的人间烟火与二人世界间自由切换",
      },
      {
        text: "去滑雪、去体验密室逃脱，主打一个刺激新奇、拒绝平庸",
        traits: { dateStyle: 8, socialStyle: 7, independence: 6 },
        explanation: "你拥有一颗充满活力的冒险灵魂",
      },
      {
        text: "找个安静的自习室或咖啡馆，各干各的，偶尔对视一笑",
        traits: { dateStyle: 5, socialStyle: 4, emotionalReadiness: 7 },
        explanation: "你视高质量的静谧陪伴为最高级的浪漫",
      },
      {
        text: "白天各自在宿舍休息/打游戏，晚上出来约个晚饭交流一下",
        traits: { independence: 8, flexibility: 7, commitment: 5 },
        explanation: "你极度需要并捍卫自己的独处充电时间",
      },
    ],
  },

  // 沟通方式
  {
    id: "comm_1",
    text: "如果你们因为某件小事发生了争吵，你会怎么处理？",
    icon: createIcon(MessageCircle, "w-6 h-6 text-pink-500"),
    category: "communication",
    answers:[
      {
        text: "倾向于当天解决，趁热打铁当面沟通清楚，尽量不把情绪留到过夜",
        traits: { communication: 9, emotionalReadiness: 8, dateStyle: 6 },
        explanation: "你是直击痛点的高效沟通王者",
      },
      {
        text: "先自己冷静两小时消化情绪，然后再理智地找对方复盘",
        traits: { communication: 7, emotionalReadiness: 7, independence: 6 },
        explanation: "你在冲突面前克制且深思熟虑",
      },
      {
        text: "视情况而定，如果不是原则性问题，愿意先主动递个台阶",
        traits: { communication: 4, emotionalReadiness: 4, flexibility: 5 },
        explanation: "你懂得在关系中柔软退让，但也需要注意自我表达",
      },
      {
        text: "可能会先找闺蜜/兄弟吐槽一下，听听局外人的建议再做打算",
        traits: { socialStyle: 7, communication: 5, independence: 4 },
        explanation: "你习惯在外界的反馈中寻找处理感情的灵感",
      },
    ],
  },

  // 友谊与约会边界
  {
    id: "friendship_1",
    text: "如果你最好的朋友和你的前任走到了一起，你的反应是？",
    icon: createIcon(Heart, "w-6 h-6 text-red-500"),
    category: "values",
    answers:[
      {
        text: "如果都已经彻底放下了，而且他俩真合适，我愿意送上祝福",
        traits: { emotionalReadiness: 9, flexibility: 8, independence: 7 },
        explanation: "你不仅拿得起放得下，还拥有超凡的心胸",
      },
      {
        text: "刚开始肯定会极其别扭，但随着时间推移也许能慢慢消化",
        traits: { emotionalReadiness: 7, communication: 6, flexibility: 6 },
        explanation: "你能够在感性的膈应与理性的包容中找到出口",
      },
      {
        text: "心里很难过，可能会选择默默远离他们的圈子，避免尴尬",
        traits: { emotionalReadiness: 4, independence: 5, flexibility: 4 },
        explanation: "你对人际关系的情感洁癖有着一定的执念",
      },
      {
        text: "表面上维持体面，但私下里交往会比以前更加谨慎适度",
        traits: { communication: 8, independence: 7, flexibility: 7 },
        explanation: "你是处理复杂修罗场时能够维持体面的端水大师",
      },
    ],
  },

  // 科技与现代约会
  {
    id: "tech_1",
    text: "刚在一起没多久，你发现 Ta 的手机里还留着交友软件且偶尔活跃，你会？",
    icon: createIcon(Smartphone, "w-6 h-6 text-blue-500"),
    category: "communication",
    answers:[
      {
        text: "找个机会严肃认真地问问对方的想法，表达自己的不适",
        traits: { communication: 9, commitment: 8, emotionalReadiness: 7 },
        explanation: "你对感情的排他性有着清晰的底线与沟通能力",
      },
      {
        text: "先暗中观察一下，看 Ta 是忘记卸载了还是在四处撒网",
        traits: { independence: 6, flexibility: 5, communication: 4 },
        explanation: "你习惯于谋定而后动，但也可能错失尽早解决的良机",
      },
      {
        text: "尽量放宽心，只要没抓到实质性的越界行为，可能只是无聊刷刷",
        traits: { independence: 8, dateStyle: 7, emotionalReadiness: 6 },
        explanation: "你对现代约会的灰色地带有着较为宽松的容忍度",
      },
      {
        text: "会通过半开玩笑的方式点醒对方，试探 Ta 的反应",
        traits: { independence: 7, dateStyle: 8, communication: 5 },
        explanation: "你喜欢用较为迂回、带有测试意味的方式掌握主导权",
      },
    ],
  },

  // 文化与价值观
  {
    id: "culture_2",
    text: "作为一所全国招生的大学，面对南方和北方（甚至不同省份）的生活习惯差异，你会？",
    icon: createIcon(Globe, "w-6 h-6 text-green-500"),
    category: "values",
    answers:[
      {
        text: "觉得挺有意思，带南方对象体验东北大澡堂，或者跟对方学两句家乡话",
        traits: { flexibility: 9, communication: 8, emotionalReadiness: 7 },
        explanation: "你有着一颗拥抱多元文化的极强包容心",
      },
      {
        text: "还是偏向找老乡，过年回家、饮食口味都在一个频道上比较踏实",
        traits: { dateStyle: 4, flexibility: 4, commitment: 7 },
        explanation: "你极度渴求相似背景带来的零磨合安全感",
      },
      {
        text: "愿意尝试，但确实会客观担心以后过年回谁家、在哪定居等现实问题",
        traits: { flexibility: 6, communication: 7, independence: 5 },
        explanation: "你既有浪漫的冲动，又保持着对现实的理性考量",
      },
      {
        text: "地域差异根本不是核心问题，三观契合和人品才是唯一标准",
        traits: { emotionalReadiness: 8, flexibility: 7, independence: 6 },
        explanation: "你能一眼看穿亲密关系中最核心的本质",
      },
    ],
  },

  // 职业抱负
  {
    id: "career_3",
    text: "为了一个极佳的出国交换/实习机会，需要你异地半年，这如何影响你的决定？",
    icon: createIcon(Briefcase, "w-6 h-6 text-purple-500"),
    category: "career",
    answers:[
      {
        text: "果断争取机会！相信真正契合的伴侣一定会理解并支持我搞事业",
        traits: { career: 9, independence: 8, commitment: 5 },
        explanation: "你的个人发展雷达永远置顶",
      },
      {
        text: "跟对象好好商量，尝试找到双方都能接受的异地维护方案",
        traits: { flexibility: 8, communication: 8, commitment: 7 },
        explanation: "你是兼顾理想与现实的平衡术大师",
      },
      {
        text: "理智上想去，但内心确实会担忧长期异地对感情的消耗，会坦诚沟通顾虑",
        traits: { commitment: 8, communication: 7, flexibility: 7 },
        explanation: "爱情在你的人生天平上占据着极其吃重的分量",
      },
      {
        text: "会非常纠结，如果出国意味着感情破裂，可能会在机会和感情间重新衡量",
        traits: { commitment: 9, career: 5, emotionalReadiness: 7 },
        explanation: "你将当下的安稳陪伴视为非常核心的需求",
      },
    ],
  },

  // 数字时代隐私
  {
    id: "digital_1",
    text: "恋爱期间，对于“互相录入对方手机面容/指纹（分享密码）”这件事，你的态度是？",
    icon: createIcon(Lock, "w-6 h-6 text-gray-500"),
    category: "trust",
    answers:[
      {
        text: "希望能保留一点个人空间，恋爱不代表要完全交出手机隐私",
        traits: { independence: 9, communication: 6, commitment: 4 },
        explanation: "你对个人边界的划分十分清晰且坚持",
      },
      {
        text: "刚开始不行，但等感情进入非常严肃稳定的阶段可以考虑接受",
        traits: { commitment: 7, communication: 7, independence: 6 },
        explanation: "你将隐私的部分让渡视为感情升华的信物",
      },
      {
        text: "看对方的态度，如果双方都觉得没问题，互相录个面容也挺方便的",
        traits: { commitment: 8, independence: 4, communication: 7 },
        explanation: "你追求毫无保留且讲求对等的坦诚相见",
      },
      {
        text: "主要看当下的气氛和需求，顺其自然，不刻意强求也不设防",
        traits: { flexibility: 8, communication: 7, independence: 6 },
        explanation: "你深谙人际交往中自然流动的艺术",
      },
    ],
  },

  // 精神健康与关系
  {
    id: "mental_1",
    text: "如果遇到实验数据作废/期末大概率挂科的崩溃时刻，你会怎么面对伴侣？",
    icon: createIcon(Brain, "w-6 h-6 text-purple-500"),
    category: "lifestyle",
    answers:[
      {
        text: "愿意展露脆弱，向 Ta 倾诉自己的挫败感并寻求安慰",
        traits: { communication: 8, emotionalReadiness: 8, flexibility: 7 },
        explanation: "你敢于在爱人面前展现真实的低谷情绪",
      },
      {
        text: "把自己关起来消化，不想把负面情绪大面积传染给对方",
        traits: { independence: 8, career: 7, emotionalReadiness: 6 },
        explanation: "你习惯独立处理情绪，尽量不成为别人的负担",
      },
      {
        text: "会提前告知对方自己状态不好需要空间，短暂闭关调整一下",
        traits: { career: 8, independence: 7, commitment: 4 },
        explanation: "在低谷期，你会选择理智沟通并切断无效社交专心自救",
      },
      {
        text: "互相打气，虽然自己心态有点崩，但看到 Ta 的陪伴就会好很多",
        traits: { communication: 7, emotionalReadiness: 8, commitment: 7 },
        explanation: "你总能在伴侣的怀抱中汲取重整旗鼓的力量",
      },
    ],
  },

  // 社交活动
  {
    id: "social_5",
    text: "对象要带你去参加 Ta 的社团聚餐，整桌人你几乎都不认识，你会？",
    icon: createIcon(Brain, "w-6 h-6 text-pink-500"),
    category: "social",
    answers:[
      {
        text: "欣然前往，尽量融入气氛，当个好捧哏给对象挣足面子",
        traits: { socialStyle: 8, flexibility: 7, independence: 6 },
        explanation: "只要给你一个舞台，你就能自如应对社交场合",
      },
      {
        text: "会比较抗拒，婉拒对方的邀约，让 Ta 自己去跟朋友玩就好",
        traits: { socialStyle: 4, independence: 4, commitment: 7 },
        explanation: "你可能更享受可控的二人世界，对陌生社交有压力",
      },
      {
        text: "去肯定去，但全程粘在对象身边，安静吃饭不怎么主动说话",
        traits: { socialStyle: 6, flexibility: 5, independence: 5 },
        explanation: "你在努力学着适应陌生水域，但仍需伴侣的庇护",
      },
      {
        text: "会有点发怵，跟对象商量要是实在尴尬能不能中途找个借口溜走",
        traits: { independence: 8, emotionalReadiness: 7, flexibility: 8 },
        explanation: "你懂得在迎合他人与自我舒适之间寻找缓冲地带",
      },
    ],
  },

  // 文化价值观
  {
    id: "culture_1",
    text: "找对象时，你觉得两人家庭背景、成长环境相似（门当户对）重要吗？",
    icon: createIcon(Globe, "w-6 h-6 text-blue-500"),
    category: "values",
    answers:[
      {
        text: "比较重要，背景相似往往意味着消费观一致，未来能少很多摩擦",
        traits: { flexibility: 4, dateStyle: 6, commitment: 7 },
        explanation: "你是一个极其看重底层逻辑兼容性的现实主义者",
      },
      {
        text: "更看重两个人的性格三观和奋斗潜力，家庭背景是其次",
        traits: { flexibility: 8, communication: 7, emotionalReadiness: 7 },
        explanation: "你拥有包容万象的成长型思维",
      },
      {
        text: "不太看重这些，只要两个人灵魂契合、互相喜欢就行",
        traits: { flexibility: 9, independence: 7, emotionalReadiness: 8 },
        explanation: "你是脱离了传统框架束缚的纯粹灵魂捕手",
      },
      {
        text: "心里还是希望别差太多，但如果真的爱上了，也会去努力适应",
        traits: { flexibility: 6, communication: 7, dateStyle: 6 },
        explanation: "你在感性的冲动与理性的权衡间游刃有余",
      },
    ],
  },

  // 朋友群体动态
  {
    id: "friends_1",
    text: "如果是你的室友/闺蜜和你的对象互相看不顺眼，夹在中间的你咋办？",
    icon: createIcon(Users, "w-6 h-6 text-orange-500"),
    category: "social",
    answers:[
      {
        text: "会偏向室友一点，毕竟低头不见抬头见，会私下劝对象多包容",
        traits: { socialStyle: 8, commitment: 4, independence: 5 },
        explanation: "在你心里，稳固的同性情谊和生活圈占有极高权重",
      },
      {
        text: "化身端水大师，两边安抚，努力化解他们之间的误会",
        traits: { communication: 8, flexibility: 7, emotionalReadiness: 8 },
        explanation: "你是深谙外交辞令的和平鸽本鸽",
      },
      {
        text: "尽量减少他们直接接触的机会，将恋爱圈和生活圈适度隔离",
        traits: { independence: 7, flexibility: 5, socialStyle: 4 },
        explanation: "你倾向于用物理隔离来应对复杂的人际难题",
      },
      {
        text: "找个合适的机会，拉着双方开诚布公地聊一次解开心结",
        traits: { communication: 9, socialStyle: 7, emotionalReadiness: 8 },
        explanation: "你拥有直面难题的勇气和出色的破局手腕",
      },
    ],
  },

  // 校园生活
  {
    id: "campus_1",
    text: "在锦绣/丹青楼自习时看到一个完全长在审美点上的 Crush，你会？",
    icon: createIcon(Book, "w-6 h-6 text-indigo-500"),
    category: "social",
    answers:[
      {
        text: "找机会坐到附近，看准时机以借笔或者问问题的方式自然搭话",
        traits: { socialStyle: 8, dateStyle: 7, communication: 6 },
        explanation: "你在校园社交中充满自信且行动力极强",
      },
      {
        text: "选一个在 Ta 斜对角的位置，假装学习，疯狂散发该死的魅力",
        traits: { socialStyle: 5, dateStyle: 4, independence: 6 },
        explanation: "你深谙欲擒故纵的最高境界是守株待兔",
      },
      {
        text: "记住一些特征，回去在东林表白墙上发个措辞得体的海底捞",
        traits: { communication: 7, dateStyle: 6, socialStyle: 7 },
        explanation: "你懂得利用网络杠杆含蓄地撬动现实的缘分",
      },
      {
        text: "多看两眼养养眼就行了，毕竟是来上自习的，不影响我刷题",
        traits: { career: 8, independence: 7, emotionalReadiness: 6 },
        explanation: "在你心中，搞好当下的学业远比一场浪漫邂逅重要",
      },
    ],
  },
  {
    id: "campus_2",
    text: "在去俭德园干饭的路上，迎面撞见前任（还牵着新欢），此时相距 10 米，你会？",
    icon: createIcon(School, "w-6 h-6 text-red-500"),
    category: "social",
    answers:[
      {
        text: "表面上波澜不惊，跟身边的朋友继续聊天，主打一个体面淡定",
        traits: { emotionalReadiness: 8, communication: 7, socialStyle: 7 },
        explanation: "你已经修炼出了百毒不侵的成熟心境",
      },
      {
        text: "立刻掏出手机假装回消息，加快脚步自然地走开",
        traits: { emotionalReadiness: 4, independence: 6, socialStyle: 4 },
        explanation: "面对过去的尴尬，战术性回避是你最本能的保护机制",
      },
      {
        text: "心里有点破防，拉着旁边的朋友火速转弯绕道走",
        traits: { emotionalReadiness: 5, communication: 4, socialStyle: 5 },
        explanation: "过去的伤疤可能依然需要一些时间来彻底结痂",
      },
      {
        text: "毫不闪躲，坦荡地擦肩而过，甚至能大方地点个头算是打招呼",
        traits: { emotionalReadiness: 9, communication: 8, flexibility: 7 },
        explanation: "你拥有能够直面任何过往的豁达与勇气",
      },
    ],
  },

  // 季节与假期
  {
    id: "seasonal_1",
    text: "哈尔滨冰雪节跨年夜，满大街都是牵手的情侣，单身的你打算怎么过？",
    icon: createIcon(Heart, "w-6 h-6 text-pink-500"),
    category: "lifestyle",
    answers:[
      {
        text: "约上三五好友去冰雪大世界或者聚餐搓一顿，单身也要有过节的仪式感",
        traits: { socialStyle: 8, independence: 7, emotionalReadiness: 7 },
        explanation: "你总能把任何喧嚣的节日变成属于自己的快乐派堆",
      },
      {
        text: "这不就是普通的星期四吗？回宿舍洗洗睡吧",
        traits: { independence: 8, emotionalReadiness: 7, flexibility: 6 },
        explanation: "你有着不被任何消费主义或节日狂欢裹挟的清醒",
      },
      {
        text: "趁着没人抢座，去买杯热奶茶犒劳一下辛苦一年的自己",
        traits: { independence: 7, emotionalReadiness: 8, dateStyle: 6 },
        explanation: "你比任何人都懂得如何心疼并取悦自己",
      },
      {
        text: "有点小孤单，在表白墙上发帖：‘今晚跨年缺个搭子，有人一起去压马路吗’",
        traits: { socialStyle: 7, dateStyle: 8, independence: 4 },
        explanation: "你不放过任何一个向宇宙散发社交信号的机会",
      },
    ],
  },

  // 居住情况
  {
    id: "living_1",
    text: "室友总是总在寝室高强度视频连麦，你会？",
    icon: createIcon(Home, "w-6 h-6 text-orange-500"),
    category: "lifestyle",
    answers:[
      {
        text: "找个气氛融洽的时候，跟室友委婉表达一下希望晚上能留点安静的休息时间",
        traits: { communication: 9, independence: 7, flexibility: 6 },
        explanation: "你是宿舍秩序温和而坚定的捍卫者",
      },
      {
        text: "惹不起躲得起，带上电脑去图书馆待到关门再回来",
        traits: { flexibility: 7, independence: 6, communication: 4 },
        explanation: "你习惯于用空间隔离来换取内心的安宁",
      },
      {
        text: "打不过就加入，适度跟他们搭话开两句玩笑，化解尴尬",
        traits: { socialStyle: 8, flexibility: 7, communication: 6 },
        explanation: "你有着把尴尬局面变得轻松自如的社交润滑能力",
      },
      {
        text: "在寝室群里发个幽默的表情包半开玩笑地提醒一句，避免正面冲突",
        traits: { communication: 4, independence: 5, flexibility: 4 },
        explanation: "你更偏爱用委婉、带有暗示性的方式解决摩擦",
      },
    ],
  },

  // 数字时代约会
  {
    id: "digital_2",
    text: "在 DateMatch 上匹配到了同学院/同校的人，下一步准备怎么做？",
    icon: createIcon(Smartphone, "w-6 h-6 text-blue-500"),
    category: "communication",
    answers:[
      {
        text: "觉得挺有缘分的，聊得好的话顺水推舟约个专家公寓下的咖啡厅见一面",
        traits: { dateStyle: 8, socialStyle: 7, communication: 6 },
        explanation: "你是行动力爆表、乐于把网络联系拉进现实的人",
      },
      {
        text: "先保持线上交流几天，摸透了脾气秉性再考虑要不要奔现",
        traits: { communication: 7, emotionalReadiness: 7, dateStyle: 5 },
        explanation: "你更相信水到渠成、有一定了解基础的相处",
      },
      {
        text: "侧面打听一下，问问有没有共同好友认识这号人，防踩雷",
        traits: { socialStyle: 7, communication: 5, dateStyle: 6 },
        explanation: "你是极具风险防范意识的背景调查大师",
      },
      {
        text: "按兵不动，继续保持友好的聊天节奏，等对方先开口约我",
        traits: { dateStyle: 4, independence: 6, socialStyle: 5 },
        explanation: "你习惯稳坐钓鱼台，在试探中等待对方的主动",
      },
    ],
  },

  // 希腊生活与约会
  {
    id: "greek_1",
    text: "你对在同一个学生会部门/核心社团里谈恋爱（办公室恋情）怎么看？",
    icon: createIcon(Users, "w-6 h-6 text-blue-500"),
    category: "social",
    answers:[
      {
        text: "会有点顾虑，毕竟如果分手了还要一起办活动会比较尴尬",
        traits: { independence: 8, socialStyle: 6, dateStyle: 7 },
        explanation: "你对社交圈的重合带来的风险有着清晰的预判",
      },
      {
        text: "挺好的啊，近水楼台先得月，还可以一起为了同一场活动努力",
        traits: { socialStyle: 8, commitment: 7, dateStyle: 6 },
        explanation: "你极度享受革命战友变灵魂伴侣的浪漫戏码",
      },
      {
        text: "主要看人，如果真的很心动，这种外部小尴尬都可以克服",
        traits: { flexibility: 8, emotionalReadiness: 7, communication: 7 },
        explanation: "你有着为了真诚的感情随时打破常规的感性底色",
      },
      {
        text: "倾向于避免，觉得谈恋爱还是不要找同一个利益圈子的好",
        traits: { dateStyle: 8, independence: 7, commitment: 4 },
        explanation: "你将个人情感圈与集体工作圈分得非常明确",
      },
    ],
  },

  // 运动与 athletics
  {
    id: "sports_1",
    text: "对象邀请你去田径场看 Ta 参加校园篮球赛/运动会，你会？",
    icon: createIcon(Trophy, "w-6 h-6 text-yellow-500"),
    category: "lifestyle",
    answers:[
      {
        text: "买好水和毛巾，提前去占个好位置，化身最强啦啦队",
        traits: { commitment: 8, socialStyle: 7, emotionalReadiness: 7 },
        explanation: "你总是毫不吝啬地给予伴侣最高光的托举和支持",
      },
      {
        text: "肯定去，但我会社恐，大概率会拉着室友陪我一块儿在看台看",
        traits: { socialStyle: 7, independence: 6, flexibility: 7 },
        explanation: "你在支持伴侣与维持自我舒适感之间不断磨合",
      },
      {
        text: "委婉推掉，说明自己真的不喜欢去人声嘈杂的场合，等 Ta 比完赛再去庆祝",
        traits: { independence: 7, communication: 4, flexibility: 4 },
        explanation: "你对自我能量的消耗有着较为明确的保护机制",
      },
      {
        text: "带本书或者iPad去，Ta 上场就加油，休息时自己在一边背两个单词",
        traits: { career: 8, flexibility: 6, commitment: 5 },
        explanation: "主打一个陪伴与个人学习进度并存的硬核平衡",
      },
    ],
  },

  // 出国交换
  {
    id: "abroad_1",
    text: "对象为了保研/前途，决定去外校交流一整年，你的真实反应是？",
    icon: createIcon(Plane, "w-6 h-6 text-purple-500"),
    category: "commitment",
    answers:[
      {
        text: "真心赞成！全力支持对方追求更好的未来，异地一年可以克服",
        traits: { commitment: 8, communication: 8, flexibility: 7 },
        explanation: "你的爱是不折断对方翅膀的旷野之风",
      },
      {
        text: "理智上理解，但内心确实会担忧长期异地对感情的消耗，会坦诚沟通顾虑",
        traits: { independence: 7, emotionalReadiness: 6, commitment: 4 },
        explanation: "你有着兼具人情味与现实考量的清醒思维",
      },
      {
        text: "受到激励，自己也要努力发核心期刊/实习，争取以后在更高处顶峰相见",
        traits: { commitment: 9, socialStyle: 7, flexibility: 6 },
        explanation: "你拥有为了并肩前行而将自己重塑的巨大魄力",
      },
      {
        text: "极其焦虑，感觉一整年见不到面变数太大，对这段关系的未来感到迷茫",
        traits: { emotionalReadiness: 4, independence: 4, communication: 5 },
        explanation: "不确定性是悬在你心头容易让你失去安全感的一把剑",
      },
    ],
  },

  // 职业 networking
  {
    id: "career_4",
    text: "学校体育馆的秋招双选会上，和隔壁专业的同学相谈甚欢，你会?",
    icon: createIcon(Briefcase, "w-6 h-6 text-green-500"),
    category: "career",
    answers:[
      {
        text: "加个微信也只聊秋招面经，守住边界，专注找工作",
        traits: { career: 9, independence: 7, dateStyle: 4 },
        explanation: "在关键节点，个人前途是你屏蔽外界干扰的坚硬盔甲",
      },
      {
        text: "一边交流面试经验，一边不经意地试探对方是否单身",
        traits: { flexibility: 8, dateStyle: 7, career: 6 },
        explanation: "你能在严肃的竞争场合中敏锐捕捉浪漫信号",
      },
      {
        text: "当然是先互通有无找工作！如果拿了 offer 心情好，也不介意约个饭",
        traits: { career: 8, emotionalReadiness: 6, dateStyle: 5 },
        explanation: "你深谙先后次序，事业优先但也保留着浪漫的余地",
      },
      {
        text: "工作当然要找，但如果真的聊得极其投缘，顺其自然留个微信也未尝不可",
        traits: { dateStyle: 8, communication: 6, career: 5 },
        explanation: "在偶然的邂逅面前，你持有随缘且开放的态度",
      },
    ],
  },

  // 社团活动
  {
    id: "club_1",
    text: "如果在校广播台/艺术团里找了对象，你会怎么处理这种集体关系？",
    icon: createIcon(Users, "w-6 h-6 text-indigo-500"),
    category: "social",
    answers:[
      {
        text: "在部员面前适度保持距离，公私分明，开会或办活动时不秀恩爱",
        traits: { independence: 8, career: 7, socialStyle: 6 },
        explanation: "你能很好地将个人情感与集体体制框架分离开来",
      },
      {
        text: "觉得这很正常，大家都是朋友，一起聚餐时该照顾就照顾",
        traits: { socialStyle: 8, dateStyle: 7, communication: 7 },
        explanation: "你具有把各种圈子揉碎重组、大方得体的社交能力",
      },
      {
        text: "会比较克制，主要怕万一以后出现矛盾会影响整个部门的氛围",
        traits: { emotionalReadiness: 8, communication: 7, flexibility: 7 },
        explanation: "你总是在走一步时看三步，是一个顾全大局的人",
      },
      {
        text: "觉得部门工作和个人学业更重要，尽量低调处理，不影响团队运转",
        traits: { career: 9, independence: 7, dateStyle: 4 },
        explanation: "责任感和集体目标导向是你处理校园事务的核心兵器",
      },
    ],
  },

  // 室友动态
  {
    id: "roommate_1",
    text: "室友吐槽你谈恋爱后总是半夜回寝室，影响了他们休息，你会？",
    icon: createIcon(Home, "w-6 h-6 text-purple-500"),
    category: "lifestyle",
    answers:[
      {
        text: "诚恳道歉，立马和对象商量以后提前结束约会",
        traits: { communication: 8, flexibility: 7, independence: 6 },
        explanation: "你极其珍视集体生活中的风评与人际和气",
      },
      {
        text: "觉得大家作息不同难以避免，但自己以后会尽量轻手轻脚，互相体谅",
        traits: { independence: 8, flexibility: 6, socialStyle: 5 },
        explanation: "你试图在不惊动他人的前提下温和地坚持自己的生活节奏",
      },
      {
        text: "心里有点觉得委屈，认为大学生活偶尔晚归很正常，但也只能忍让",
        traits: { independence: 9, communication: 4, flexibility: 3 },
        explanation: "你在集体规则与个人自由的碰撞中感到一定的不适",
      },
      {
        text: "如果实在作息磨合不来，可能会考虑减少约会频率或另寻平衡点",
        traits: { flexibility: 8, communication: 7, independence: 5 },
        explanation: "你倾向于用实际的行程调整来切断潜在的人际矛盾",
      },
    ],
  },

  // 学术竞争
  {
    id: "academic_2",
    text: "你和暧昧对象同时竞争东林某项含金量极高的奖学金名额，你的态度是？",
    icon: createIcon(Briefcase, "w-6 h-6 text-blue-500"),
    category: "career",
    answers:[
      {
        text: "一码归一码，学习上各自拼尽全力公平竞争，私底下感情照旧",
        traits: { career: 9, independence: 8, dateStyle: 4 },
        explanation: "在学业竞争中，你能保持高度的理智与专注，不掺杂私人感情",
      },
      {
        text: "大方共享复习资料，约定好顶峰相见，谁拿了都得请吃顿大餐",
        traits: { communication: 8, flexibility: 7, career: 6 },
        explanation: "你懂得在竞争中创造良性互动与双赢的局面",
      },
      {
        text: "心里有点纠结，甚至会偶尔闪过要不要为了不伤感情而稍作退让的念头",
        traits: { flexibility: 8, independence: 7, career: 6 },
        explanation: "你在面对情感与利益冲突时，容易体现出讨好或顾虑重重的一面",
      },
      {
        text: "借着这个机会多约 Ta 一起去图书馆卷，把竞争压力转化为共同奋斗的情趣",
        traits: { dateStyle: 8, socialStyle: 7, career: 5 },
        explanation: "你是擅长在压力环境下寻找浪漫互动机会的高端玩家",
      },
    ],
  },

  // 校园活动
  {
    id: "event_1",
    text: "学校的十佳歌手晚会快到了，你们还在暧昧期拉扯，你会？",
    icon: createIcon(Calendar, "w-6 h-6 text-pink-500"),
    category: "social",
    answers:[
      {
        text: "先按兵不动，跟自己的朋友约好去凑热闹，不轻易暴露需求感",
        traits: { independence: 8, socialStyle: 7, dateStyle: 5 },
        explanation: "你绝不轻易将感情节奏的主动权拱手让人",
      },
      {
        text: "借机打个直球：“我有两张晚会的票，你要不要跟我一起去？”",
        traits: { communication: 8, commitment: 7, dateStyle: 7 },
        explanation: "你是用直球终结暧昧的绝世高手",
      },
      {
        text: "对这种人多的晚会本来就不感冒，暧昧对象去不去都不太影响我的安排",
        traits: { socialStyle: 4, communication: 4, emotionalReadiness: 5 },
        explanation: "你骨子里有着清心寡欲且不易被外界氛围带偏的定力",
      },
      {
        text: "在朋友圈发个隐晦的动态：“听说今年十佳歌手很精彩”，看对方会不会接茬",
        traits: { socialStyle: 7, flexibility: 8, dateStyle: 6 },
        explanation: "你是深谙抛砖引玉、等待对方上钩的钓鱼系玩家",
      },
    ],
  },

  // 假期传统
  {
    id: "holiday_1",
    text: "十一长假，刚确立关系的你们遇到了第一个考验，大概率是因为什么？",
    icon: createIcon(Plane, "w-6 h-6 text-orange-500"),
    category: "lifestyle",
    answers:[
      {
        text: "我想和原来的朋友去特种兵旅游，Ta 却想让我留在学校单陪 Ta",
        traits: { independence: 8, commitment: 5, socialStyle: 7 },
        explanation: "你比较抗拒因为恋爱而迅速切断原本的社交网络",
      },
      {
        text: "规划一起去旅游时，在订酒店和做攻略的细节分工上出现了摩擦",
        traits: { commitment: 8, communication: 7, flexibility: 6 },
        explanation: "你想通过一场结伴出行来检验彼此的默契度",
      },
      {
        text: "在花销观念上出现分歧，一个想玩得舒服点，一个觉得作为学生应该穷游",
        traits: { independence: 7, dateStyle: 5, career: 7 },
        explanation: "在浪漫与现实的交界处，你常常被现实的引力拽回地面",
      },
      {
        text: "各回各家异地了一周，因为信息回复速度变慢而产生了些许误会",
        traits: { commitment: 7, communication: 8, independence: 6 },
        explanation: "你的感情电量对高频的在线陪伴有一定依赖",
      },
    ],
  },

  // 社交媒体礼仪
  {
    id: "social_media_2",
    text: "对象在朋友圈发合照，只 P 了 Ta 自己，你看起来像个大冤种，你会？",
    icon: createIcon(Camera, "w-6 h-6 text-red-500"),
    category: "communication",
    answers:[
      {
        text: "私聊对方撒个娇或者半开玩笑地抗议：“这张拍得不好看啦，能不能换一张”",
        traits: { communication: 8, independence: 6, socialStyle: 5 },
        explanation: "你懂得用轻松但不失态度的沟通捍卫自己的面子",
      },
      {
        text: "在评论区开启自黑模式：“照片里左边那个路人甲是谁？”",
        traits: { flexibility: 8, emotionalReadiness: 7, socialStyle: 7 },
        explanation: "你拥有能够化解一切尴尬的神级自嘲精神与高情商",
      },
      {
        text: "心里略微不爽，觉得对方只顾自己好看，暗自生一会闷气",
        traits: { independence: 7, communication: 4, socialStyle: 5 },
        explanation: "你总是在心里给细节加戏，却不太愿意直接表达不满",
      },
      {
        text: "转头在自己的账号发一张我美若天仙、Ta 稍显逊色的表情包回击",
        traits: { communication: 4, emotionalReadiness: 4, flexibility: 4 },
        explanation: "你信奉在小打小闹中以牙还牙的欢喜冤家模式",
      },
    ],
  },

  // 新问题
  {
    id: "social_8",
    text: "你希望对象在各种社交软件（朋友圈/小红书）上怎么对待你们的感情？",
    icon: createIcon(Smartphone, "w-6 h-6 text-blue-500"),
    category: "social",
    answers:[
      {
        text: "倾向于低调，觉得感情是两个人自己的事，没必要过度暴露在社交网络上",
        traits: { socialStyle: 4, independence: 8, communication: 6 },
        explanation: "你像捍卫领地一般极其珍视私生活的边界感",
      },
      {
        text: "大方自然地公开，主打一个光明正大，给足彼此安全感",
        traits: { socialStyle: 8, dateStyle: 7, communication: 7 },
        explanation: "你享受被周围人认可与见证的踏实感",
      },
      {
        text: "发不发无所谓，只要现实中彼此真诚相待、没有越界行为就行",
        traits: { independence: 7, emotionalReadiness: 8, flexibility: 7 },
        explanation: "你拥有能看破亲密关系本质的老灵魂，不拘泥于形式",
      },
      {
        text: "一年发个一两次大事件（如生日/纪念日）留个纪念就行，细水长流",
        traits: { socialStyle: 3, independence: 7, emotionalReadiness: 6 },
        explanation: "你是深谙细水长流之道的清流派",
      },
    ],
  },

  {
    id: "career_5",
    text: "如果你们学院举办了很重要的校友/大厂 HR 交流会，你会带对象去吗？",
    icon: createIcon(Briefcase, "w-6 h-6 text-gray-500"),
    category: "career",
    answers:[
      {
        text: "会带去长见识，两人一起拓宽人脉、规划未来挺好的",
        traits: { career: 7, socialStyle: 8, dateStyle: 7 },
        explanation: "你是将爱情与共同成长打包经营的最强合伙人",
      },
      {
        text: "倾向于自己去，觉得这种场合需要专注求职和建立联系，带着对象可能会分心",
        traits: { career: 8, independence: 7, flexibility: 5 },
        explanation: "你在感情与个人前途之间划分出了非常明晰的界限",
      },
      {
        text: "带着去看看也行，说不定能碰上什么意想不到的实习机会",
        traits: { career: 6, socialStyle: 8, independence: 7 },
        explanation: "你是个永远对未知的机遇保持开放嗅觉的人",
      },
      {
        text: "如果对方感兴趣可以一起去，但提前说好到了现场可能要各自去听关心的讲座",
        traits: { career: 9, independence: 8, dateStyle: 4 },
        explanation: "在搞钱搞前途的赛道上，你能保持绝对的理智与目标导向",
      },
    ],
  },

  {
    id: "lifestyle_5",
    text: "大学生活费紧巴巴，你们平时的花销怎么解决？",
    icon: createIcon(DollarSign, "w-6 h-6 text-green-500"),
    category: "lifestyle",
    answers:[
      {
        text: "尽量保持 AA 或设立恋爱基金，觉得学生阶段经济独立对感情更好",
        traits: { independence: 8, communication: 7, flexibility: 6 },
        explanation: "你用清晰的账单边界铸就了平等的自尊心",
      },
      {
        text: "模糊的 AB 制，你请大头（吃饭），我请小头（买奶茶看电影）",
        traits: { flexibility: 8, communication: 7, dateStyle: 7 },
        explanation: "你深谙用双向奔赴的付出增加感情粘性的道理",
      },
      {
        text: "谁主动提出去消费较高的场所，谁就多承担一点，不计较太多",
        traits: { dateStyle: 7, communication: 8, flexibility: 7 },
        explanation: "你愿意为自己制造的浪漫买单，性格较为大方",
      },
      {
        text: "能省则省，去图书馆坐一天或者绕着林大夜跑一圈不也挺好吗？",
        traits: { flexibility: 7, dateStyle: 6, independence: 7 },
        explanation: "你是看透消费主义陷阱的务实派代表",
      },
    ],
  },

  {
    id: "social_9",
    text: "在东林表白墙上看到前任找新对象的海底捞帖子，你的反应是？",
    icon: createIcon(Map, "w-6 h-6 text-red-500"),
    category: "social",
    answers:[
      {
        text: "随手划过，如果看到了可能还会心如止水地祝 Ta 顺利",
        traits: { emotionalReadiness: 8, communication: 7, socialStyle: 6 },
        explanation: "你已经把过去熬成了滋养情商的鸡汤",
      },
      {
        text: "眼不见为净，火速拉黑屏蔽，避免不必要的情绪波动",
        traits: { emotionalReadiness: 5, independence: 7, socialStyle: 4 },
        explanation: "你还在用物理屏蔽来抵御潜在的情绪海啸",
      },
      {
        text: "表面毫无波澜，其实内心偷偷把那个新捞的条件跟自己对比了一下",
        traits: { emotionalReadiness: 6, socialStyle: 5, flexibility: 7 },
        explanation: "你那该死的胜负欲总是在奇怪的地方复苏",
      },
      {
        text: "随手截图发给朋友群里当个乐子聊两句，算是枯燥期末周的一点八卦调剂",
        traits: { emotionalReadiness: 9, independence: 8, flexibility: 7 },
        explanation: "你成功地把一段略带唏嘘的过往解构成了轻松的谈资",
      },
    ],
  },

  {
    id: "academic_4",
    text: "你是社团骨干，周末要办招新大战，但刚好赶上对象生日，你会？",
    icon: createIcon(Users, "w-6 h-6 text-purple-500"),
    category: "lifestyle",
    answers:[
      {
        text: "拉着对象一起去招新现场帮忙，晚上再连轴转庆祝生日",
        traits: { socialStyle: 8, dateStyle: 7, flexibility: 7 },
        explanation: "你是企图把 24 小时掰成 48 小时用的时间魔术师",
      },
      {
        text: "提前把社团工作交接安排妥当，腾出这一天绝对专属陪对象",
        traits: { independence: 7, communication: 8, flexibility: 6 },
        explanation: "你有着堪比瑞士钟表般精准的任务切分与平衡能力",
      },
      {
        text: "跟对象温柔商量能不能改天再补办生日，目前工作确实走不开",
        traits: { flexibility: 8, communication: 7, independence: 7 },
        explanation: "你有时会习惯性地希望伴侣为你的工作重心做出理解和让步",
      },
      {
        text: "尽量权衡，白天忙招新，晚上哪怕晚一点也要买个小蛋糕好好补过一下",
        traits: { independence: 8, socialStyle: 7, dateStyle: 4 },
        explanation: "你在集体责任与私人情感的夹缝中努力做着不完美的缝补者",
      },
    ],
  },

  {
    id: "future_3",
    text: "刚大二，对象就开始跟你讨论毕业买房结婚等宏大的未来蓝图，你会？",
    icon: createIcon(Brain, "w-6 h-6 text-blue-500"),
    category: "career",
    answers:[
      {
        text: "觉得很有安全感！愿意和 Ta 一起畅想并规划那些美好的未来",
        traits: { communication: 9, commitment: 8, emotionalReadiness: 8 },
        explanation: "你对待感情极其认真负责，且有着极强的长远期盼",
      },
      {
        text: "觉得有点太早了，会有一定的现实压力，试着用轻松的方式把话题拉回当下",
        traits: { flexibility: 7, independence: 6, emotionalReadiness: 5 },
        explanation: "面对过早的重压承诺，你更倾向于谨慎缓冲",
      },
      {
        text: "这饼太大我吃不下，还是先商量下礼拜六去哪吃好吃的吧",
        traits: { dateStyle: 7, flexibility: 6, commitment: 4 },
        explanation: "你是坚定的活在当下、享受眼前三寸快乐的乐天派",
      },
      {
        text: "虽然觉得有点远，但也会认真倾听 Ta 的想法，给予适度的正面回应",
        traits: { flexibility: 8, commitment: 7, communication: 7 },
        explanation: "你能在对方的热忱与自己的理智间打出极佳的太极",
      },
    ],
  },

  {
    id: "social_10",
    text: "学校举办了盛大的冬奥冰雪嘉年华，大家都出来玩了，你倾向于？",
    icon: createIcon(Calendar, "w-6 h-6 text-yellow-500"),
    category: "social",
    answers:[
      {
        text: "肯定是甜甜的两人世界，牵手溜冰、漫步冰雕丛中",
        traits: { socialStyle: 8, dateStyle: 7, commitment: 7 },
        explanation: "你致力于把校园里每一个浪漫角落都变成你们的偶像剧片场",
      },
      {
        text: "叫上我俩各自的室友，组成热闹的小旅行团一起去打雪仗",
        traits: { flexibility: 8, socialStyle: 7, communication: 7 },
        explanation: "你是热衷于搞大型联谊派对、喜爱热闹氛围的社交好手",
      },
      {
        text: "我比较 i，这种人挤人的场合我宁愿自己在宿舍透过窗户看",
        traits: { independence: 8, socialStyle: 6, flexibility: 5 },
        explanation: "你对喧嚣过敏，只愿在寂静的角落里独自开花",
      },
      {
        text: "主打一个随性，顺便看看现场有没有东林特色的文创抽奖，薅完羊毛再去散步",
        traits: { flexibility: 9, communication: 7, dateStyle: 6 },
        explanation: "你是看透一切虚妄、直击生活本质的羊毛党",
      },
    ],
  },

  {
    id: "tech_4",
    text: "关于互相查手机聊天记录这件事，你的底线是？",
    icon: createIcon(Lock, "w-6 h-6 text-gray-500"),
    category: "trust",
    answers:[
      {
        text: "比较介意，觉得查手机本质上是一种不信任，会让人觉得不舒服",
        traits: { independence: 9, commitment: 4, communication: 5 },
        explanation: "你在捍卫数字主权的战役中有着很强的原则性",
      },
      {
        text: "平时互不干涉，但如果有一方真的因为某件事缺乏安全感，可以大方给看",
        traits: { commitment: 8, communication: 7, emotionalReadiness: 7 },
        explanation: "你深知在给足安全感面前，偶尔的隐私让渡是必要的妥协",
      },
      {
        text: "没什么不能看的，我连外卖软件的点餐记录都可以给你报备",
        traits: { flexibility: 7, communication: 8, independence: 5 },
        explanation: "你是将坦诚相待贯彻到底的透明星人",
      },
      {
        text: "我不看 Ta 的，Ta 最好也别看我的，主打一个难得糊涂",
        traits: { flexibility: 8, independence: 6, commitment: 5 },
        explanation: "你深谙“水至清则无鱼”的感情糊弄学和边界哲学",
      },
    ],
  },

  {
    id: "achievement_2",
    text: "对象成功保研到了心仪的 985/拿到了大厂 Offer，你会怎么给 Ta 庆祝？",
    icon: createIcon(Trophy, "w-6 h-6 text-yellow-500"),
    category: "support",
    answers:[
      {
        text: "买一份精心的礼物、订家不错的餐厅，搞个极具仪式感的惊喜！",
        traits: { dateStyle: 8, communication: 7, emotionalReadiness: 8 },
        explanation: "你是一个绝不放过任何一个制造浪漫和仪式感机会的人",
      },
      {
        text: "买个小蛋糕，在操场散步的时候真诚地给 Ta 一个大大的拥抱",
        traits: { independence: 7, emotionalReadiness: 6, flexibility: 7 },
        explanation: "你偏爱在四下无人的角落里奉上最纯粹的温情悸动",
      },
      {
        text: "由衷为 Ta 高兴，可能会发个朋友圈或者请教 Ta 的经验沾沾喜气",
        traits: { socialStyle: 8, dateStyle: 7, communication: 6 },
        explanation: "你乐于向周围的世界分享伴侣带来的喜悦与光环",
      },
      {
        text: "虽然替 Ta 高兴，但内心也会产生同辈压力，暗暗发誓自己也要更卷才行",
        traits: { emotionalReadiness: 8, communication: 7, independence: 6 },
        explanation: "你总能在伴侣的光芒中看到自己的努力方向并保持上进",
      },
    ],
  },

  {
    id: "travel_2",
    text: "谈了一段时间后，两人第一次计划去省外旅游（比如去延吉/长白山看雪，或者飞去南方看海），你的状态是？",
    icon: createIcon(Plane, "w-6 h-6 text-blue-500"),
    category: "lifestyle",
    answers:[
      {
        text: "太棒了，这绝对是一场让感情急速升温、留下美好回忆的浪漫之旅",
        traits: { dateStyle: 8, commitment: 7, socialStyle: 7 },
        explanation: "你是不可救药的粉色泡泡制造机和旅行爱好者",
      },
      {
        text: "心里有点忐忑，怕旅途中在做攻略或订酒店等琐事上出现分歧",
        traits: { independence: 8, socialStyle: 7, dateStyle: 5 },
        explanation: "你对旅行中潜在的摩擦有着较为理性的防备与预判",
      },
      {
        text: "只要别让我主导做攻略，我负责当好拎包机器/出片摄影师就行",
        traits: { flexibility: 9, socialStyle: 8, communication: 7 },
        explanation: "你是深谙配合哲学的最佳旅行挂件",
      },
      {
        text: "旅游太累了，还是在学校周边逛逛或者找朋友玩玩剧本杀比较香",
        traits: { independence: 7, emotionalReadiness: 5, commitment: 4 },
        explanation: "你是个极其厌恶跳出舒适圈、嫌麻烦的重度宅星人",
      },
    ],
  },
];

// 增强的随机问题选择以确保更好的特质覆盖
export function getRandomQuestions(count: number): Question[] {
  const shuffled = [...questionBank].sort(() => 0.5 - Math.random());

  // 定义我们希望确保覆盖的核心类别
  const coreCategories =[
    "social",
    "career",
    "communication",
    "commitment",
    "lifestyle",
  ];
  const selected: Question[] =[];

  // 首先，确保我们至少有一个来自每个核心类别的问题
  coreCategories.forEach((category) => {
    const questionFromCategory = shuffled.find(
      (q) => q.category === category && !selected.includes(q)
    );
    if (questionFromCategory) {
      selected.push(questionFromCategory);
    }
  });

  // 然后添加确保覆盖所有特质的问题
  const traits =[
    "socialStyle",
    "emotionalReadiness",
    "dateStyle",
    "commitment",
    "communication",
    "independence",
    "career",
    "flexibility",
  ];

  traits.forEach((trait) => {
    if (selected.length < count) {
      const questionForTrait = shuffled.find(
        (q) =>
          !selected.includes(q) &&
          Object.keys(q.answers[0].traits).includes(trait)
      );
      if (questionForTrait) {
        selected.push(questionForTrait);
      }
    }
  });

  // 用随机问题填充剩余槽位
  while (selected.length < count) {
    const nextQuestion = shuffled.find((q) => !selected.includes(q));
    if (nextQuestion) {
      selected.push(nextQuestion);
    } else {
      break;
    }
  }

  return selected;
}
