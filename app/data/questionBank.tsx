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
  // 社交媒体与科技（10题）
  {
    id: "social_1",
    text: "Crush 在朋友圈发了和异性的合照（还带了定位在中央大街），你的第一反应是？",
    icon: createIcon(Smartphone, "w-6 h-6 text-blue-500"),
    category: "social",
    answers:[
      {
        text: "化身列文虎克，疯狂分析那个异性是谁",
        traits: { socialStyle: 8, emotionalReadiness: 4, independence: 3 },
        explanation: "你可能容易对社交媒体的内容过度内耗",
      },
      {
        text: "内心毫无波澜，继续刷手机过自己的一天",
        traits: { socialStyle: 6, emotionalReadiness: 7, independence: 7 },
        explanation: "你能保持极其健康的社交媒体边界感",
      },
      {
        text: "很少刷朋友圈，眼不见为净",
        traits: { socialStyle: 4, emotionalReadiness: 6, independence: 8 },
        explanation: "你更重视现实生活中的真实联结",
      },
      {
        text: "有点吃醋泛酸，但默默憋在心里不发作",
        traits: { socialStyle: 5, emotionalReadiness: 5, independence: 5 },
        explanation: "你正在学习管理外界带来的情绪波动",
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
        text: "高强度秒回，同时能和好几个“搭子”谈笑风生",
        traits: { communication: 8, dateStyle: 8, socialStyle: 7 },
        explanation: "你极其适应现代快节奏的线上社交",
      },
      {
        text: "纯爱战神，一次只专注和一个聊得来的人互发消息",
        traits: { communication: 6, dateStyle: 4, commitment: 8 },
        explanation: "你更倾向于专注且有意义的情感连接",
      },
      {
        text: "字斟句酌，喜欢构思走心且有深度的长篇大论",
        traits: { communication: 7, dateStyle: 5, emotionalReadiness: 7 },
        explanation: "你极其重视高质量的思想碰撞",
      },
      {
        text: "网聊不如线下见，赶紧约个食堂或者操场散步",
        traits: { communication: 5, dateStyle: 7, socialStyle: 8 },
        explanation: "你更偏爱真实的线下互动氛围",
      },
    ],
  },

  // 学业/事业平衡（10题）
  {
    id: "career_1",
    text: "期末“绝望周”降临，你打算怎么平衡复习和恋爱？",
    icon: createIcon(Book, "w-6 h-6 text-purple-500"),
    category: "career",
    answers:[
      {
        text: "双管齐下：相约锦绣楼/丹青楼当硬核自习搭子",
        traits: { career: 7, flexibility: 8, dateStyle: 6 },
        explanation: "你善于将学业与陪伴完美融合",
      },
      {
        text: "封心锁爱，考完试之前谁也别想影响我拔剑的速度",
        traits: { career: 9, independence: 8, commitment: 4 },
        explanation: "在你心里，拿高绩点绝对排在第一位",
      },
      {
        text: "学累了在楼下自动贩卖机买杯热饮，见个面充充电",
        traits: { career: 6, flexibility: 7, communication: 7 },
        explanation: "你是时间管理大师，懂得适时调整节奏",
      },
      {
        text: "照常约会，但只能速战速决吃个饭就溜",
        traits: { career: 5, commitment: 7, flexibility: 6 },
        explanation: "你努力在极端压力下维系感情",
      },
    ],
  },

  // 社交生活与约会（10题）
  {
    id: "social_3",
    text: "你的室友/闺蜜/兄弟觉得你现在的交往对象很不靠谱，你会？",
    icon: createIcon(Users, "w-6 h-6 text-yellow-500"),
    category: "social",
    answers:[
      {
        text: "听劝型恋爱脑，立刻相信朋友的判断并重新审视关系",
        traits: { socialStyle: 8, independence: 4, emotionalReadiness: 6 },
        explanation: "你非常依赖并信任自己的核心社交圈",
      },
      {
        text: "继续相处，但会暗中观察室友说的问题是否存在",
        traits: { socialStyle: 6, independence: 7, communication: 8 },
        explanation: "你能理性平衡多方观点，不盲从",
      },
      {
        text: "谈恋爱是我自己的事，把对象和舍友的圈子完全物理隔离",
        traits: { socialStyle: 4, independence: 8, flexibility: 5 },
        explanation: "你拥有极其清晰的人际边界感",
      },
      {
        text: "攒个局请大家去吃顿锅包肉/烧烤，努力消除误会",
        traits: { socialStyle: 7, communication: 8, flexibility: 7 },
        explanation: "你是天生的破冰能手和关系调解员",
      },
    ],
  },

  // 异地恋与科技（5题）
  {
    id: "distance_1",
    text: "如果是跨校区甚至跨省的异地恋，你觉得你能 hold 住吗？",
    icon: createIcon(Globe, "w-6 h-6 text-green-500"),
    category: "commitment",
    answers:[
      {
        text: "每天高强度连麦、疯狂报备日常，靠网线续命",
        traits: { commitment: 9, communication: 8, independence: 4 },
        explanation: "你愿意付出极大的情绪价值来维持联系",
      },
      {
        text: "各自在自己的学校卷，闲下来时再高质量陪伴",
        traits: { commitment: 6, independence: 8, emotionalReadiness: 7 },
        explanation: "你能完美平衡个人独立性与亲密感",
      },
      {
        text: "婉拒异地，恋爱就是要能一起去老食堂干饭才行",
        traits: { commitment: 4, independence: 6, dateStyle: 7 },
        explanation: "你极度重视现实生活中看得见摸得着的陪伴",
      },
      {
        text: "规划好见面频率，把买高铁票/机票当成生活盼头",
        traits: { commitment: 7, flexibility: 8, communication: 7 },
        explanation: "你有极强的适应力和维系感情的韧性",
      },
    ],
  },

  // 经济方面（5题）
  {
    id: "finance_1",
    text: "作为大学生每个月生活费有限，你倾向于怎样的约会消费观？",
    icon: createIcon(DollarSign, "w-6 h-6 text-green-500"),
    category: "lifestyle",
    answers:[
      {
        text: "坚定的 AA 制拥护者，算得清清楚楚",
        traits: { independence: 8, communication: 7, flexibility: 6 },
        explanation: "你追求关系中绝对的经济平等和独立",
      },
      {
        text: "这次你请客看电影，下次我请你吃麻辣拌，有来有回",
        traits: { flexibility: 8, communication: 7, dateStyle: 7 },
        explanation: "你的财务观念灵活且充满人情味",
      },
      {
        text: "主打白嫖校园风光：逛树木园、操场看星星，不花钱也浪漫",
        traits: { dateStyle: 6, flexibility: 7, independence: 7 },
        explanation: "你是个极其务实且有创意的约会大师",
      },
      {
        text: "比较传统，觉得主动发起邀约的人（或男生）应该买单",
        traits: { dateStyle: 7, communication: 6, flexibility: 7 },
        explanation: "你骨子里带着传统的约会骑士精神/淑女礼仪",
      },
    ],
  },

  // 派对/社交场景（5题）
  {
    id: "party_1",
    text: "在社团破冰局或者老乡聚会上，你的 Crush 刚好也在，你会？",
    icon: createIcon(Users, "w-6 h-6 text-purple-500"),
    category: "social",
    answers:[
      {
        text: "假装不经意地凑到 Ta 身边，自然地加入群聊",
        traits: { socialStyle: 7, communication: 6, dateStyle: 7 },
        explanation: "你在社交场合中既有策略又极其从容",
      },
      {
        text: "敌不动我不动，安静如鸡等 Ta 主动来搭话",
        traits: { socialStyle: 4, independence: 7, emotionalReadiness: 5 },
        explanation: "你享受顺其自然，不愿强求",
      },
      {
        text: "疯狂暗示僚机朋友，求助他们帮忙组局制造机会",
        traits: { socialStyle: 6, communication: 5, dateStyle: 6 },
        explanation: "你懂得巧妙借用社交圈子的力量",
      },
      {
        text: "直球出击，直接端着饮料上去打招呼加微信",
        traits: { socialStyle: 8, communication: 8, independence: 7 },
        explanation: "你是令人瞩目的社交悍匪，自信大方",
      },
    ],
  },
  {
    id: "party_2",
    text: "朋友聚餐发现其他人全是一对对的情侣，作为唯一的单身狗你会？",
    icon: createIcon(Users, "w-6 h-6 text-indigo-500"),
    category: "social",
    answers:[
      {
        text: "内心毫无波澜，甚至还想多吃两口锅包肉",
        traits: { independence: 8, socialStyle: 7, emotionalReadiness: 7 },
        explanation: "你拥有极其强大且自洽的单身内核",
      },
      {
        text: "疯狂摇人，硬拉一个单身室友来陪我共苦",
        traits: { socialStyle: 6, independence: 5, flexibility: 7 },
        explanation: "你总能在尴尬的社交场合寻找平衡支点",
      },
      {
        text: "婉拒了哈，找借口推掉这种高强度吃狗粮的局",
        traits: { independence: 4, socialStyle: 4, emotionalReadiness: 5 },
        explanation: "面对恋爱情境主导的氛围，你还在适应中",
      },
      {
        text: "前排围观别人的恋爱状态，暗中收集恋爱素材",
        traits: { emotionalReadiness: 8, communication: 7, dateStyle: 6 },
        explanation: "你是人间清醒的观察家，注重精神成长",
      },
    ],
  },

  // 学业兼容性（5题）
  {
    id: "academic_1",
    text: "找对象时，对方是什么专业/学院的对你来说重要吗？",
    icon: createIcon(Book, "w-6 h-6 text-blue-500"),
    category: "values",
    answers:[
      {
        text: "重要，最好是同专业/近专业的，能一起卷实验和作业",
        traits: { career: 8, dateStyle: 6, commitment: 7 },
        explanation: "你追求步调一致的学术/事业同盟",
      },
      {
        text: "无所谓专业，只要 Ta 对自己的事有上进心就行",
        traits: { flexibility: 8, independence: 7, emotionalReadiness: 7 },
        explanation: "你更看重内在的进取心而非外在标签",
      },
      {
        text: "绝对不要同专业！想找个文理互补的，体验不同的视角",
        traits: { flexibility: 9, communication: 7, independence: 6 },
        explanation: "你热爱多元的灵魂碰撞",
      },
      {
        text: "专业不重要，但不能是个整天旷课打游戏的街溜子",
        traits: { career: 7, commitment: 8, dateStyle: 5 },
        explanation: "你有着明确的底线和专注力要求",
      },
    ],
  },

  // 家庭关系（5题）
  {
    id: "family_1",
    text: "谈恋爱大概多久后，你会考虑把对方介绍给父母/家人？",
    icon: createIcon(Home, "w-6 h-6 text-green-500"),
    category: "commitment",
    answers:[
      {
        text: "确认关系且感情极其稳定后，才会谨慎透露",
        traits: { commitment: 7, emotionalReadiness: 6, dateStyle: 5 },
        explanation: "你对待家庭介入的态度极其慎重负责",
      },
      {
        text: "感觉到了就行，可能刚谈一个月就在视频里自然出镜了",
        traits: { flexibility: 8, emotionalReadiness: 7, independence: 6 },
        explanation: "你跟着直觉走，不受条条框框束缚",
      },
      {
        text: "尽早说，毕竟父母阅人无数，想让他们帮忙把把关",
        traits: { commitment: 8, socialStyle: 7, dateStyle: 4 },
        explanation: "你非常信赖并看重原生家庭的意见",
      },
      {
        text: "大学期间绝对不说！毕业前恋爱和家庭完全隔离",
        traits: { independence: 8, flexibility: 5, commitment: 4 },
        explanation: "你在生活中筑起了极高的防火墙",
      },
    ],
  },

  // 未来规划（5题）
  {
    id: "future_1",
    text: "毕业季，你拿到了北上广的神仙 Offer，但对象决定留老家，你会？",
    icon: createIcon(Map, "w-6 h-6 text-yellow-500"),
    category: "career",
    answers:[
      {
        text: "搞钱/前途最重要，绝不为了对象放弃好 offer",
        traits: { career: 9, independence: 8, commitment: 4 },
        explanation: "你是清醒的搞钱/搞事业脑",
      },
      {
        text: "疯狂沟通，看看能不能找到一个距离适中的城市一起去",
        traits: { flexibility: 8, communication: 7, commitment: 7 },
        explanation: "你总是努力在面包与爱情间寻找最优解",
      },
      {
        text: "只要是对的人，去天涯海角我也愿意追随 Ta开启异地",
        traits: { commitment: 9, emotionalReadiness: 8, communication: 7 },
        explanation: "你是愿为真爱翻山越岭的纯爱战士",
      },
      {
        text: "谁管以后啊！享受当下的校园恋爱，毕业的事毕业再说",
        traits: { flexibility: 6, independence: 7, emotionalReadiness: 4 },
        explanation: "你信奉活在当下，及时行乐",
      },
    ],
  },

  // 生活方式与习惯（5题）
  {
    id: "lifestyle_1",
    text: "完美的周末约会，你脑海中的画面是？",
    icon: createIcon(Calendar, "w-6 h-6 text-orange-500"),
    category: "lifestyle",
    answers:[
      {
        text: "白天和一群朋友去江畔烧烤，晚上两人单独压马路",
        traits: { flexibility: 8, socialStyle: 6, dateStyle: 7 },
        explanation: "你热衷于在喧闹社交与二人世界间自由切换",
      },
      {
        text: "去滑雪、去蹦极、去当显眼包，主打一个刺激新奇",
        traits: { dateStyle: 8, socialStyle: 7, independence: 6 },
        explanation: "你拥有一颗狂野的冒险灵魂",
      },
      {
        text: "找个安静的咖啡馆，各干各的，偶尔对视一笑",
        traits: { dateStyle: 5, socialStyle: 4, emotionalReadiness: 7 },
        explanation: "你视高质量的静谧陪伴为最高级的浪漫",
      },
      {
        text: "白天各自在宿舍躺尸/打游戏，晚上出来约个晚饭",
        traits: { independence: 8, flexibility: 7, commitment: 5 },
        explanation: "你极度需要并捍卫自己的独处充电时间",
      },
    ],
  },

  // 沟通方式（5题）
  {
    id: "comm_1",
    text: "如果你们因为某件小事发生了争吵，你会怎么处理？",
    icon: createIcon(MessageCircle, "w-6 h-6 text-pink-500"),
    category: "communication",
    answers:[
      {
        text: "必须当面立刻说清楚，有雷绝不过夜！",
        traits: { communication: 9, emotionalReadiness: 8, dateStyle: 6 },
        explanation: "你是直击痛点的高效沟通王者",
      },
      {
        text: "先自己冷静两小时消化情绪，然后再理智复盘",
        traits: { communication: 7, emotionalReadiness: 7, independence: 6 },
        explanation: "你在冲突面前克制且深思熟虑",
      },
      {
        text: "能退一步是一步，不想因为一点小事破坏感情",
        traits: { communication: 4, emotionalReadiness: 4, flexibility: 5 },
        explanation: "你习惯性退让，也许需要学会更勇敢地发声",
      },
      {
        text: "立刻跟闺蜜/兄弟疯狂吐槽，听听军师们的建议",
        traits: { socialStyle: 7, communication: 5, independence: 4 },
        explanation: "你习惯在外界的反馈中寻找处理感情的灵感",
      },
    ],
  },

  // 社交媒体边界（5题）
  {
    id: "social_media_1",
    text: "谈了半个月了，对象的朋友圈依然像个高贵的单身人士，连个暗示都没有，你会？",
    icon: createIcon(Camera, "w-6 h-6 text-pink-500"),
    category: "social",
    answers:[
      {
        text: "完全无所谓，我俩自己知道很甜就行了，不用秀给别人看",
        traits: { independence: 8, emotionalReadiness: 7, socialStyle: 4 },
        explanation: "你有着超强的内在自信，不在乎世俗的目光",
      },
      {
        text: "心里有点犯嘀咕，希望能有点被公开认可的安全感",
        traits: { socialStyle: 7, communication: 6, commitment: 7 },
        explanation: "你将社交媒体视为确认关系分量的重要领地",
      },
      {
        text: "瞬间破防，脑补 Ta 是不是还在给别人留机会（养鱼）",
        traits: { independence: 4, emotionalReadiness: 5, communication: 6 },
        explanation: "你容易在虚拟的网络展示中患得患失",
      },
      {
        text: "直接开诚布公地问 Ta 是怎么想的，商量个发圈标准",
        traits: { communication: 8, emotionalReadiness: 8, flexibility: 7 },
        explanation: "你深谙用有效沟通扫清边界盲区的智慧",
      },
    ],
  },

  // 友谊与约会边界（5题）
  {
    id: "friendship_1",
    text: "如果你最好的朋友和你的前任走到了一起，你的反应是？",
    icon: createIcon(Heart, "w-6 h-6 text-red-500"),
    category: "values",
    answers:[
      {
        text: "都已经过去了，如果他俩真合适，我真心送上祝福",
        traits: { emotionalReadiness: 9, flexibility: 8, independence: 7 },
        explanation: "你不仅拿得起放得下，还拥有超凡的心胸",
      },
      {
        text: "刚开始会极其别扭，但时间长了也能慢慢消化",
        traits: { emotionalReadiness: 7, communication: 6, flexibility: 6 },
        explanation: "你能够在感性膈应与理性包容中找到出口",
      },
      {
        text: "立刻双删退群，感觉遭到了双重背叛",
        traits: { emotionalReadiness: 4, independence: 5, flexibility: 4 },
        explanation: "你对忠诚的定义有着眼中揉不得沙子的执念",
      },
      {
        text: "表面上维持体面，但私下里会默默疏远他们",
        traits: { communication: 8, independence: 7, flexibility: 7 },
        explanation: "你是处理复杂修罗场端水大师级别的狠人",
      },
    ],
  },

  // 科技与现代约会（5题）
  {
    id: "tech_1",
    text: "刚在一起没多久，你发现 Ta 的手机里还留着交友软件且偶尔活跃，你会？",
    icon: createIcon(Smartphone, "w-6 h-6 text-blue-500"),
    category: "communication",
    answers:[
      {
        text: "立刻摊牌对峙：“既然确立关系了为什么还要划软件？”",
        traits: { communication: 9, commitment: 8, emotionalReadiness: 7 },
        explanation: "你对感情的排他性有着不可妥协的底线",
      },
      {
        text: "暗中观察，看 Ta 是忘记卸载了还是在真·养鱼",
        traits: { independence: 6, flexibility: 5, communication: 4 },
        explanation: "你习惯于谋定而后动，但也可能错失沟通良机",
      },
      {
        text: "大家都是年轻人，只要没抓到实质出轨，玩玩测试也无妨",
        traits: { independence: 8, dateStyle: 7, emotionalReadiness: 6 },
        explanation: "你对现代约会游戏规则看得很开",
      },
      {
        text: "以牙还牙，当着 Ta 的面我也打开软件划两下",
        traits: { independence: 7, dateStyle: 8, communication: 5 },
        explanation: "你喜欢用魔法打败魔法来维持关系的主导权",
      },
    ],
  },

  // 文化与价值观（5题）
  {
    id: "culture_2",
    text: "作为一所全国招生的大学，面对南方和北方（甚至不同省份）的生活习惯差异，你会？",
    icon: createIcon(Globe, "w-6 h-6 text-green-500"),
    category: "values",
    answers:[
      {
        text: "太好玩了！带南方对象去搓澡，或者跟北方对象学吴侬软语",
        traits: { flexibility: 9, communication: 8, emotionalReadiness: 7 },
        explanation: "你有着一颗拥抱多元文化的无敌包容心",
      },
      {
        text: "还是想找老乡，过年回家、饮食习惯都在一个频道上",
        traits: { dateStyle: 4, flexibility: 4, commitment: 7 },
        explanation: "你极度渴求相似背景带来的零磨合安全感",
      },
      {
        text: "愿意尝试，但确实会担心以后过年回谁家是个大麻烦",
        traits: { flexibility: 6, communication: 7, independence: 5 },
        explanation: "你既有浪漫的冲动，又有被现实牵绊的忧虑",
      },
      {
        text: "地域根本不是问题，三观和人品才是唯一标准",
        traits: { emotionalReadiness: 8, flexibility: 7, independence: 6 },
        explanation: "你能一眼看穿亲密关系中最核心的本质",
      },
    ],
  },

  // 职业抱负（5题）
  {
    id: "career_3",
    text: "为了一个极佳的出国交换/实习机会，需要你异地半年，这如何影响你的决定？",
    icon: createIcon(Briefcase, "w-6 h-6 text-purple-500"),
    category: "career",
    answers:[
      {
        text: "果断去！对的人一定会理解并支持我搞事业",
        traits: { career: 9, independence: 8, commitment: 5 },
        explanation: "你的个人发展雷达永远置顶",
      },
      {
        text: "跟对象好好商量，尝试找到双方都能接受的折中方案",
        traits: { flexibility: 8, communication: 8, commitment: 7 },
        explanation: "你是兼顾理想与现实的平衡术大师",
      },
      {
        text: "优先考虑伴侣的感受，如果 Ta 极力反对我可能就不去了",
        traits: { commitment: 8, communication: 7, flexibility: 7 },
        explanation: "爱情在你的人生天平上占据着极其吃重的分量",
      },
      {
        text: "如果异地意味着大概率分手，那我就不去，守住这段感情",
        traits: { commitment: 9, career: 5, emotionalReadiness: 7 },
        explanation: "你将当下的安稳陪伴视为最高法则",
      },
    ],
  },

  // 数字时代约会（5题）
  {
    id: "digital_1",
    text: "恋爱期间，对于“互相录入对方手机面容/指纹（分享密码）”这件事，你的态度是？",
    icon: createIcon(Lock, "w-6 h-6 text-gray-500"),
    category: "trust",
    answers:[
      {
        text: "绝对达咩！再亲密也必须有 100% 的手机隐私权",
        traits: { independence: 9, communication: 6, commitment: 4 },
        explanation: "神圣不可侵犯的个人边界是你的底线",
      },
      {
        text: "刚开始不行，但等感情进入非常严肃的阶段可以接受",
        traits: { commitment: 7, communication: 7, independence: 6 },
        explanation: "你将隐私让渡视为感情升华的重要信物",
      },
      {
        text: "无所谓啊，随便看，我的手机对 Ta 完全透明",
        traits: { commitment: 8, independence: 4, communication: 7 },
        explanation: "你追求毫无保留的坦诚相见",
      },
      {
        text: "主要看对方态度，Ta 给我看，我也就给 Ta 看",
        traits: { flexibility: 8, communication: 7, independence: 6 },
        explanation: "你深谙人际交往中等价交换的艺术",
      },
    ],
  },

  // 精神健康与关系（5题）
  {
    id: "mental_1",
    text: "如果遇到实验数据作废/期末大概率挂科的崩溃时刻，你会怎么面对伴侣？",
    icon: createIcon(Brain, "w-6 h-6 text-purple-500"),
    category: "lifestyle",
    answers:[
      {
        text: "直接展现脆弱，抱着 Ta 大哭一场求安慰",
        traits: { communication: 8, emotionalReadiness: 8, flexibility: 7 },
        explanation: "你敢于在爱人面前展露最真实的伤疤",
      },
      {
        text: "把自己关起来消化，不想把负能量传染给这段关系",
        traits: { independence: 8, career: 7, emotionalReadiness: 6 },
        explanation: "你习惯独自舔舐伤口，不愿成为别人的负担",
      },
      {
        text: "对 Ta 说：这几天别理我，我要闭关重修，之后再找你",
        traits: { career: 8, independence: 7, commitment: 4 },
        explanation: "在低谷期，你会毫不犹豫地切断社交专心自救",
      },
      {
        text: "互相打气，虽然我崩了，但看到 Ta 好好的我就觉得还有希望",
        traits: { communication: 7, emotionalReadiness: 8, commitment: 7 },
        explanation: "你总能在伴侣的怀抱中汲取重生的力量",
      },
    ],
  },

  // 社交活动（5题）
  {
    id: "social_5",
    text: "对象要带你去参加 Ta 的社团聚餐，整桌人你一个都不认识，你会？",
    icon: createIcon(Brain, "w-6 h-6 text-pink-500"),
    category: "social",
    answers:[
      {
        text: "这不就来活儿了吗！化身社交悍匪，一顿饭下来混成大哥/大姐",
        traits: { socialStyle: 8, flexibility: 7, independence: 6 },
        explanation: "只要给你一个舞台，你就能闪耀全场",
      },
      {
        text: "强烈要求 Ta 推掉，在家陪我就行了",
        traits: { socialStyle: 4, independence: 4, commitment: 7 },
        explanation: "你可能过度依赖伴侣构筑的二人世界",
      },
      {
        text: "去肯定去，但全程粘在对象身边做个安静的挂件",
        traits: { socialStyle: 6, flexibility: 5, independence: 5 },
        explanation: "你在努力学着在陌生的水域里扑腾两下",
      },
      {
        text: "鼓励 Ta 自己去玩得开心，正好我也能回宿舍打把游戏",
        traits: { independence: 8, emotionalReadiness: 7, flexibility: 8 },
        explanation: "你深谙给彼此放风是维系感情的长久之计",
      },
    ],
  },

  // 文化价值观（5题）
  {
    id: "culture_1",
    text: "找对象时，你觉得两人家庭背景、成长环境相似（门当户对）重要吗？",
    icon: createIcon(Globe, "w-6 h-6 text-blue-500"),
    category: "values",
    answers:[
      {
        text: "极其重要，背景相似意味着消费观一致，少很多摩擦",
        traits: { flexibility: 4, dateStyle: 6, commitment: 7 },
        explanation: "你是一个极其看重底层逻辑兼容性的现实主义者",
      },
      {
        text: "更看重个人潜力，家庭背景不同反而能互相开阔眼界",
        traits: { flexibility: 8, communication: 7, emotionalReadiness: 7 },
        explanation: "你拥有包容万象的成长型思维",
      },
      {
        text: "完全无所谓，只要两个人灵魂契合，我不在乎条条框框",
        traits: { flexibility: 9, independence: 7, emotionalReadiness: 8 },
        explanation: "你是脱离了低级趣味的纯粹灵魂捕手",
      },
      {
        text: "心里还是希望别差太多，但如果爱上了，也会去努力适应",
        traits: { flexibility: 6, communication: 7, dateStyle: 6 },
        explanation: "你在感性的冲动与理性的权衡间游刃有余",
      },
    ],
  },

  // 朋友群体动态（5题）
  {
    id: "friends_1",
    text: "如果是你的室友/闺蜜和你的对象互相看不顺眼，夹在中间的你咋办？",
    icon: createIcon(Users, "w-6 h-6 text-orange-500"),
    category: "social",
    answers:[
      {
        text: "帮亲不帮理，室友可是要住四年的，对象惹了他们必须得改",
        traits: { socialStyle: 8, commitment: 4, independence: 5 },
        explanation: "在你心里，铁打的闺蜜兄弟永远大于流水的爱情",
      },
      {
        text: "端水大师上线，两边安抚，努力化解矛盾",
        traits: { communication: 8, flexibility: 7, emotionalReadiness: 8 },
        explanation: "你是深谙外交辞令的和平鸽本鸽",
      },
      {
        text: "物理隔离，以后绝不把对象带到室友面前晃悠",
        traits: { independence: 7, flexibility: 5, socialStyle: 4 },
        explanation: "惹不起躲得起是你应对复杂关系的座右铭",
      },
      {
        text: "拉着双方开诚布公地聊一次，把误会全摆在桌面上解决",
        traits: { communication: 9, socialStyle: 7, emotionalReadiness: 8 },
        explanation: "你拥有直面惨淡人生的勇气和破局手腕",
      },
    ],
  },

  // 校园生活（8题）
  {
    id: "campus_1",
    text: "在图书馆/自习室看到一个长在审美点上的 Crush，你会？",
    icon: createIcon(Book, "w-6 h-6 text-indigo-500"),
    category: "social",
    answers:[
      {
        text: "直接走过去拉开椅子坐下，顺势问个题借机认识",
        traits: { socialStyle: 8, dateStyle: 7, communication: 6 },
        explanation: "你是无所畏惧的校园社交刺客",
      },
      {
        text: "选一个在 Ta 斜对角的位置，假装学习，疯狂散发该死的魅力",
        traits: { socialStyle: 5, dateStyle: 4, independence: 6 },
        explanation: "你深谙欲擒故纵的最高境界是守株待兔",
      },
      {
        text: "想办法知道名字/学院，回去在表白墙上疯狂海底捞",
        traits: { communication: 7, dateStyle: 6, socialStyle: 7 },
        explanation: "你懂得利用互联网的杠杆撬动现实的缘分",
      },
      {
        text: "多看两眼养养眼就行了，学习才是正道，不影响我搞绩点",
        traits: { career: 8, independence: 7, emotionalReadiness: 6 },
        explanation: "心中无女人/男人，拔剑自然神！",
      },
    ],
  },
  {
    id: "campus_2",
    text: "在去俭德园的路上，迎面撞见前任（还牵着新欢），此时相距 10 米，你会？",
    icon: createIcon(School, "w-6 h-6 text-red-500"),
    category: "social",
    answers:[
      {
        text: "毫不闪躲，坦荡地擦肩而过甚至微微点头示意",
        traits: { emotionalReadiness: 8, communication: 7, socialStyle: 7 },
        explanation: "你已经修炼出了百毒不侵的钻石心境",
      },
      {
        text: "立刻掏出手机假装回消息，加快脚步逃离现场",
        traits: { emotionalReadiness: 4, independence: 6, socialStyle: 4 },
        explanation: "逃避虽然可耻但非常管用",
      },
      {
        text: "瞬间破防，拉着旁边的朋友火速转弯绕道走",
        traits: { emotionalReadiness: 5, communication: 4, socialStyle: 5 },
        explanation: "过去的伤疤可能依然需要时间结痂",
      },
      {
        text: "不仅不躲，还要故意笑得很大声，主打一个输人不输阵",
        traits: { emotionalReadiness: 9, communication: 8, flexibility: 7 },
        explanation: "一身傲骨是你最后的倔强",
      },
    ],
  },

  // 季节与假期（7题）
  {
    id: "seasonal_1",
    text: "哈尔滨跨年夜，满大街都是牵手的情侣，单身的你打算怎么过？",
    icon: createIcon(Heart, "w-6 h-6 text-pink-500"),
    category: "lifestyle",
    answers:[
      {
        text: "攒个“孤寡老人跨年局”，一群单身狗去KTV嗨到天明",
        traits: { socialStyle: 8, independence: 7, emotionalReadiness: 7 },
        explanation: "你总能把任何悲伤的节日变成狂欢的派对",
      },
      {
        text: "这不就是普通的星期四吗？回宿舍洗洗睡吧",
        traits: { independence: 8, emotionalReadiness: 7, flexibility: 6 },
        explanation: "你有着不被任何消费主义狂欢裹挟的清醒",
      },
      {
        text: "趁着没人抢座，去买杯奶茶犒劳一下辛苦一年的自己",
        traits: { independence: 7, emotionalReadiness: 8, dateStyle: 6 },
        explanation: "你比任何人都懂得如何心疼并取悦自己",
      },
      {
        text: "不甘寂寞，在表白墙上发帖：‘今晚跨年缺个搭子，懂的来’",
        traits: { socialStyle: 7, dateStyle: 8, independence: 4 },
        explanation: "你不放过任何一个向宇宙散发信号的机会",
      },
    ],
  },

  // 居住情况（6题）
  {
    id: "living_1",
    text: "室友总是把对象带回寝室（或者总在寝室高强度视频连麦），你会？",
    icon: createIcon(Home, "w-6 h-6 text-orange-500"),
    category: "lifestyle",
    answers:[
      {
        text: "直接严肃沟通定规矩：“晚上 10 点后禁止连麦/带人”",
        traits: { communication: 9, independence: 7, flexibility: 6 },
        explanation: "你是宿舍秩序毫不退让的钢铁捍卫者",
      },
      {
        text: "惹不起躲得起，带上电脑去图书馆待到关门再回来",
        traits: { flexibility: 7, independence: 6, communication: 4 },
        explanation: "你习惯于用空间隔离来换取内心的安宁",
      },
      {
        text: "打不过就加入，疯狂跟他们搭话，做个高瓦数电灯泡",
        traits: { socialStyle: 8, flexibility: 7, communication: 6 },
        explanation: "你有着把尴尬局面变成搞笑剧场的魔法",
      },
      {
        text: "疯狂在寝室群里发阴阳怪气的表情包，暗示他们收敛点",
        traits: { communication: 4, independence: 5, flexibility: 4 },
        explanation: "你更偏爱暗戳戳的被动攻击路线",
      },
    ],
  },

  // 数字时代约会（5题）
  {
    id: "digital_2",
    text: "在 DateMatch 上匹配到了同学院/同校的人，下一步准备怎么做？",
    icon: createIcon(Smartphone, "w-6 h-6 text-blue-500"),
    category: "communication",
    answers:[
      {
        text: "网聊不如见面，直接发个：“明晚锦绣楼楼下见？”",
        traits: { dateStyle: 8, socialStyle: 7, communication: 6 },
        explanation: "你是行动力爆表的高效现实主义者",
      },
      {
        text: "先高强度聊三天三夜，摸透了脾气秉性再考虑奔现",
        traits: { communication: 7, emotionalReadiness: 7, dateStyle: 5 },
        explanation: "你更相信水到渠成的灵魂共振",
      },
      {
        text: "侧面打听一下，问问有没有共同好友认识这号人防踩雷",
        traits: { socialStyle: 7, communication: 5, dateStyle: 6 },
        explanation: "你是极具风险防范意识的尽调大师",
      },
      {
        text: "按兵不动，等对方先开口约我",
        traits: { dateStyle: 4, independence: 6, socialStyle: 5 },
        explanation: "你习惯稳坐钓鱼台，等待愿者上钩",
      },
    ],
  },

  // 希腊生活与约会（5题）
  {
    id: "greek_1",
    text: "你对在同一个学生会部门/核心社团里谈恋爱（办公室恋情）怎么看？",
    icon: createIcon(Users, "w-6 h-6 text-blue-500"),
    category: "social",
    answers:[
      {
        text: "绝对达咩！分手了还要开会简直是人间地狱，必须避嫌",
        traits: { independence: 8, socialStyle: 6, dateStyle: 7 },
        explanation: "你对社交圈的隔离有着近乎偏执的清醒",
      },
      {
        text: "挺好的啊，近水楼台先得月，还可以一起做活动",
        traits: { socialStyle: 8, commitment: 7, dateStyle: 6 },
        explanation: "你极度享受革命战友变灵魂伴侣的戏码",
      },
      {
        text: "主要看人，如果真的很心动，这些外部限制都可以克服",
        traits: { flexibility: 8, emotionalReadiness: 7, communication: 7 },
        explanation: "你有着为了爱情随时打破规则的浪漫底色",
      },
      {
        text: "只适合搞点小暧昧，真要谈恋爱绝对不能找同一个圈子的",
        traits: { dateStyle: 8, independence: 7, commitment: 4 },
        explanation: "你将露水情缘与严肃恋爱分得门清",
      },
    ],
  },

  // 运动与 athletics（5题）
  {
    id: "sports_1",
    text: "对象邀请你去田径场看 Ta 参加校园篮球赛/运动会，你会？",
    icon: createIcon(Trophy, "w-6 h-6 text-yellow-500"),
    category: "lifestyle",
    answers:[
      {
        text: "买好脉动和毛巾，站在第一排化身最强啦啦队",
        traits: { commitment: 8, socialStyle: 7, emotionalReadiness: 7 },
        explanation: "你总是毫不吝啬地给予伴侣最高光的托举",
      },
      {
        text: "肯定去，但我会社恐，必须拉着室友陪我一块儿看",
        traits: { socialStyle: 7, independence: 6, flexibility: 7 },
        explanation: "你在支持伴侣与维持自我舒适间疯狂试探",
      },
      {
        text: "找个借口推掉，因为我真的很不喜欢这种喧闹的人多场合",
        traits: { independence: 7, communication: 4, flexibility: 4 },
        explanation: "你对自我能量的消耗有着极为苛刻的保护机制",
      },
      {
        text: "带着书包去，看 Ta 不上场的时候我就背两个单词",
        traits: { career: 8, flexibility: 6, commitment: 5 },
        explanation: "主打一个陪伴与学习并存的无情机器",
      },
    ],
  },

  // 出国交换（5题）
  {
    id: "abroad_1",
    text: "对象为了保研/前途，决定去外校交流一整年，你的真实反应是？",
    icon: createIcon(Plane, "w-6 h-6 text-purple-500"),
    category: "commitment",
    answers:[
      {
        text: "举双手赞成！全力支持搞事业，这点距离根本不算啥",
        traits: { commitment: 8, communication: 8, flexibility: 7 },
        explanation: "你的爱是不折断对方翅膀的旷野之风",
      },
      {
        text: "理智上支持，但感情上提出：“要不我们先把状态改为冷静期？”",
        traits: { independence: 7, emotionalReadiness: 6, commitment: 4 },
        explanation: "你有着近乎冷酷的现实主义止损思维",
      },
      {
        text: "太棒了，我要努力发核心期刊，争取以后和 Ta 去同一个城市",
        traits: { commitment: 9, socialStyle: 7, flexibility: 6 },
        explanation: "你拥有为了并肩前行而将自己重塑的巨大魄力",
      },
      {
        text: "极其焦虑，感觉一整年见不到面，这段关系迟早要完",
        traits: { emotionalReadiness: 4, independence: 4, communication: 5 },
        explanation: "不确定性是悬在你心头最锋利的达摩克利斯之剑",
      },
    ],
  },

  // 职业 networking（5题）
  {
    id: "career_4",
    text: "在学校体育馆的秋招双选会上，跟隔壁专业的帅哥/美女聊得特别投机，你会？",
    icon: createIcon(Briefcase, "w-6 h-6 text-green-500"),
    category: "career",
    answers:[
      {
        text: "加个微信也只聊秋招面经，不越界，专注搞钱找工作",
        traits: { career: 9, independence: 7, dateStyle: 4 },
        explanation: "搞钱是你屏蔽世俗欲望最坚硬的盔甲",
      },
      {
        text: "一边交流面试经验，一边暗戳戳试探对方是不是单身",
        traits: { flexibility: 8, dateStyle: 7, career: 6 },
        explanation: "你拥有鱼与熊掌兼得的海王/海后潜质",
      },
      {
        text: "当然是先找工作！但如果拿了 offer 心情好，也不介意约个饭",
        traits: { career: 8, emotionalReadiness: 6, dateStyle: 5 },
        explanation: "你深谙饱暖思淫欲，先后次序拎得极清",
      },
      {
        text: "管他什么工作，这简直是天降缘分，立刻开启僚机模式要私人微信",
        traits: { dateStyle: 8, communication: 6, career: 5 },
        explanation: "在浪漫邂逅面前，一切世俗功名皆为粪土",
      },
    ],
  },

  // 社团活动（5题）
  {
    id: "club_1",
    text: "如果在校广播台/艺术团里找了对象，你会怎么处理这种集体关系？",
    icon: createIcon(Users, "w-6 h-6 text-indigo-500"),
    category: "social",
    answers:[
      {
        text: "绝不在部员面前秀恩爱，做到公私分明，开会绝不眉来眼去",
        traits: { independence: 8, career: 7, socialStyle: 6 },
        explanation: "你是将个人情感严丝合缝镶嵌进体制框架的狠人",
      },
      {
        text: "这有啥，大家都是朋友，一起聚餐时该秀就秀",
        traits: { socialStyle: 8, dateStyle: 7, communication: 7 },
        explanation: "你天生具有把所有圈子揉碎重组的社交牛逼症",
      },
      {
        text: "会比较克制，主要怕以后万一分手了影响整个部门的氛围",
        traits: { emotionalReadiness: 8, communication: 7, flexibility: 7 },
        explanation: "你总是在走一步时看三步，顾全大局的谋略家",
      },
      {
        text: "我只在乎我的部门 KPI / 评优，谈恋爱绝不能影响我搞学分",
        traits: { career: 9, independence: 7, dateStyle: 4 },
        explanation: "功利主义是你披荆斩棘最趁手的兵器",
      },
    ],
  },

  // 室友动态（4题）
  {
    id: "roommate_1",
    text: "室友吐槽你谈恋爱后总是半夜回寝室，影响了他们休息，你会？",
    icon: createIcon(Home, "w-6 h-6 text-purple-500"),
    category: "lifestyle",
    answers:[
      {
        text: "诚恳道歉，立马和对象商量以后提前结束约会",
        traits: { communication: 8, flexibility: 7, independence: 6 },
        explanation: "你极其珍视集体生活中的风评与和气",
      },
      {
        text: "心里觉得抱歉，以后尽量在他们睡着前轻手轻脚爬上床",
        traits: { independence: 8, flexibility: 6, socialStyle: 5 },
        explanation: "你试图在不惊动他人的前提下最大化自己的快乐",
      },
      {
        text: "大学生活就是丰富多彩的，他们自己睡得早怪我咯？",
        traits: { independence: 9, communication: 4, flexibility: 3 },
        explanation: "你拥有着让全世界都围着你转的迷之骄傲",
      },
      {
        text: "干脆跟对象去校外合租，省得惹人烦",
        traits: { flexibility: 8, communication: 7, independence: 5 },
        explanation: "你习惯于用粗暴的物理切断来解决人际难题",
      },
    ],
  },

  // 学术竞争（3题）
  {
    id: "academic_2",
    text: "你和暧昧对象同时竞争东林仅有的 2 个国家奖学金名额，你的态度？",
    icon: createIcon(Briefcase, "w-6 h-6 text-blue-500"),
    category: "career",
    answers:[
      {
        text: "拔剑吧！考场无父子，更别说暧昧对象了，全力以赴干掉 Ta",
        traits: { career: 9, independence: 8, dateStyle: 4 },
        explanation: "你是天生的竞技场野兽，爱情不值一提",
      },
      {
        text: "共享复习资料，约定好顶峰相见，谁上都请客",
        traits: { communication: 8, flexibility: 7, career: 6 },
        explanation: "你懂得在零和博弈中创造双赢的乌托邦",
      },
      {
        text: "心里很纠结，甚至考虑要不要为了这段感情放弃竞争",
        traits: { flexibility: 8, independence: 7, career: 6 },
        explanation: "你容易在名为爱的泥沼里弄丢自己",
      },
      {
        text: "借着这个机会疯狂约 Ta 一起去图书馆卷，把竞争变情趣",
        traits: { dateStyle: 8, socialStyle: 7, career: 5 },
        explanation: "你是擅长在刀尖上跳双人舞的高端玩家",
      },
    ],
  },

  // 校园活动（4题）
  {
    id: "event_1",
    text: "学校的十佳歌手晚会快到了，你们还在暧昧期拉扯，你会？",
    icon: createIcon(Calendar, "w-6 h-6 text-pink-500"),
    category: "social",
    answers:[
      {
        text: "不主动邀约，叫上铁哥们/好闺蜜一起去前排凑热闹",
        traits: { independence: 8, socialStyle: 7, dateStyle: 5 },
        explanation: "你绝不轻易将主动权拱手让人",
      },
      {
        text: "借机打直球：“我有两张内场票，你要不要跟我一起去？”",
        traits: { communication: 8, commitment: 7, dateStyle: 7 },
        explanation: "你是打直球终结暧昧的绝世高手",
      },
      {
        text: "嫌人多太挤压根不想去，暧昧对象去不去与我无瓜",
        traits: { socialStyle: 4, communication: 4, emotionalReadiness: 5 },
        explanation: "你骨子里有着清心寡欲的老干部作风",
      },
      {
        text: "故意在朋友圈发“有票没人陪”，钓鱼等 Ta 上钩主动约我",
        traits: { socialStyle: 7, flexibility: 8, dateStyle: 6 },
        explanation: "你是深谙愿者上钩套路的满级姜太公",
      },
    ],
  },

  // 假期传统（3题）
  {
    id: "holiday_1",
    text: "十一长假，刚确立关系的你们遇到了第一个考验，大概率是因为什么？",
    icon: createIcon(Plane, "w-6 h-6 text-orange-500"),
    category: "lifestyle",
    answers:[
      {
        text: "我想和室友去特种兵旅游，Ta 却想让我留在学校陪 Ta",
        traits: { independence: 8, commitment: 5, socialStyle: 7 },
        explanation: "你极度抗拒因为恋爱而切断原本的社交网络",
      },
      {
        text: "规划一起去旅游时，在订酒店和做攻略的细节上疯狂摩擦",
        traits: { commitment: 8, communication: 7, flexibility: 6 },
        explanation: "你渴望通过一场硬核磨合来给感情试金",
      },
      {
        text: "因为穷。不想花太多钱出去玩，导致约会质量直线下降",
        traits: { independence: 7, dateStyle: 5, career: 7 },
        explanation: "你是被现实引力死死拽住的贫民窟浪漫主义者",
      },
      {
        text: "异地了一周，双方微信回复速度明显变慢，开始互相猜忌",
        traits: { commitment: 7, communication: 8, independence: 6 },
        explanation: "你的感情电量极度依赖高频的在线充值",
      },
    ],
  },

  // 社交媒体礼仪（3题）
  {
    id: "social_media_2",
    text: "对象在朋友圈发合照，只 P 了 Ta 自己，你看起来像个大冤种，你会？",
    icon: createIcon(Camera, "w-6 h-6 text-red-500"),
    category: "communication",
    answers:[
      {
        text: "火速私信警告：“给你三分钟，删掉重发或者加上狗头！”",
        traits: { communication: 8, independence: 6, socialStyle: 5 },
        explanation: "你是雷厉风行的面子工程捍卫者",
      },
      {
        text: "在评论区开启自黑模式：“照片里左边那个保安是谁？”",
        traits: { flexibility: 8, emotionalReadiness: 7, socialStyle: 7 },
        explanation: "你拥有能够化解一切尴尬的神级自嘲精神",
      },
      {
        text: "气炸了，觉得 Ta 极度自私，开始生闷气不理人",
        traits: { independence: 7, communication: 4, socialStyle: 5 },
        explanation: "你总是在心里给别人加戏，然后自己被气死",
      },
      {
        text: "一报还一报，转头就发一张我美若天仙、Ta 丑若如花的表情包",
        traits: { communication: 4, emotionalReadiness: 4, flexibility: 4 },
        explanation: "你信奉以牙还牙的原始丛林法则",
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
        text: "最好完全别发，我不喜欢自己的私生活被当成看客的谈资",
        traits: { socialStyle: 4, independence: 8, communication: 6 },
        explanation: "你像一条护食的恶龙般捍卫着领地隐私",
      },
      {
        text: "该秀就秀，主打一个光明正大、宣誓主权！",
        traits: { socialStyle: 8, dateStyle: 7, communication: 7 },
        explanation: "你享受被全世界围观和祝福的虚荣与踏实感",
      },
      {
        text: "发不发无所谓，只要 Ta 手机里没有乱七八糟的鱼塘就行",
        traits: { independence: 7, emotionalReadiness: 8, flexibility: 7 },
        explanation: "你拥有一眼看破亲密关系本质的老灵魂",
      },
      {
        text: "一年发个一两次大事件（生日/纪念日）就行，低调点好",
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
        text: "那必须带去长见识，两人一起拓宽人脉不好吗？",
        traits: { career: 7, socialStyle: 8, dateStyle: 7 },
        explanation: "你是将爱情与事业打包经营的最强合伙人",
      },
      {
        text: "绝对不带，我搞事业的时候六亲不认，带对象只会分心",
        traits: { career: 8, independence: 7, flexibility: 5 },
        explanation: "你在温柔乡与角斗场之间砌了一堵叹息之墙",
      },
      {
        text: "带着呗，要是校友是大佬，说不定还能看上我对象呢",
        traits: { career: 6, socialStyle: 8, independence: 7 },
        explanation: "你是个永远对未知的利益保持开放嗅觉的猎手",
      },
      {
        text: "我会全神贯注在交流会上，如果 Ta 非要跟着，只能在一边玩手机",
        traits: { career: 9, independence: 8, dateStyle: 4 },
        explanation: "在搞钱搞前途的赛道上，你是个不近人情的疯子",
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
        text: "算得清清楚楚，精确到毛的 AA，坚决不占对方便宜",
        traits: { independence: 8, communication: 7, flexibility: 6 },
        explanation: "你用冷冰冰的账单铸就了最坚挺的自尊心",
      },
      {
        text: "模糊的 AB 制，你请大头（看电影），我请小头（买奶茶）",
        traits: { flexibility: 8, communication: 7, dateStyle: 7 },
        explanation: "你深谙用金钱的流动来增加感情粘性的玄学",
      },
      {
        text: "基本都是我主动提出来的约会，所以我掏钱心甘情愿",
        traits: { dateStyle: 7, communication: 8, flexibility: 7 },
        explanation: "你愿意为自己制造的浪漫买单到底",
      },
      {
        text: "能不花钱就不花钱，咱们去图书馆坐一天不是挺好吗？",
        traits: { flexibility: 7, dateStyle: 6, independence: 7 },
        explanation: "你是看透消费主义陷阱的铁公鸡/铁母鸡",
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
        text: "大方点赞甚至评论一句“祝好”，主打一个体面前任",
        traits: { emotionalReadiness: 8, communication: 7, socialStyle: 6 },
        explanation: "你已经把过去熬成了滋养情商的鸡汤",
      },
      {
        text: "眼不见为净，火速拉黑屏蔽这条说说",
        traits: { emotionalReadiness: 5, independence: 7, socialStyle: 4 },
        explanation: "你还在用闭关锁国来逃避情绪的海啸",
      },
      {
        text: "表面毫无波澜，其实内心偷偷把那个新对象的条件跟自己比了三百遍",
        traits: { emotionalReadiness: 6, socialStyle: 5, flexibility: 7 },
        explanation: "你那该死的胜负欲总是在奇怪的地方爆棚",
      },
      {
        text: "火速截图发给闺蜜/好兄弟群，开启高强度吃瓜吐槽模式",
        traits: { emotionalReadiness: 9, independence: 8, flexibility: 7 },
        explanation: "你成功地把一出悲剧解构成了一场相声",
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
        text: "提前把社团工作安排妥当，腾出这一天绝对专属陪对象",
        traits: { independence: 7, communication: 8, flexibility: 6 },
        explanation: "你有着堪比瑞士钟表般精准的任务切分能力",
      },
      {
        text: "跟对象撒娇商量能不能改天再过生日，目前工作走不开",
        traits: { flexibility: 8, communication: 7, independence: 7 },
        explanation: "你总是习惯性地让伴侣为你的野心让路",
      },
      {
        text: "集体利益大于一切，让对象自己找朋友玩，我得盯现场",
        traits: { independence: 8, socialStyle: 7, dateStyle: 4 },
        explanation: "在你的剧本里，爱情永远演不了大男主/大女主",
      },
    ],
  },

  {
    id: "future_3",
    text: "刚大二，对象就开始跟你疯狂讨论毕业买房结婚生娃的宏大蓝图，你会？",
    icon: createIcon(Brain, "w-6 h-6 text-blue-500"),
    category: "career",
    answers:[
      {
        text: "太有安全感了！立马一起下载看房软件加入规划",
        traits: { communication: 9, commitment: 8, emotionalReadiness: 8 },
        explanation: "你是个把每一次恋爱都当成最后一次来谈的疯子",
      },
      {
        text: "压力山大，觉得太窒息了，赶紧找借口转移话题",
        traits: { flexibility: 7, independence: 6, emotionalReadiness: 5 },
        explanation: "你是一只听到发令枪就想当逃兵的鸵鸟",
      },
      {
        text: "这饼太大我吃不下，还是先商量下礼拜六去哪吃饭吧",
        traits: { dateStyle: 7, flexibility: 6, commitment: 4 },
        explanation: "你是坚定的只看脚下三寸地面的享乐主义者",
      },
      {
        text: "虽然觉得有点远，但也会认真听 Ta 的想法，适度回应",
        traits: { flexibility: 8, commitment: 7, communication: 7 },
        explanation: "你能在对方的狂热与自己的理智间打出完美的太极",
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
        text: "必须是甜甜的两人世界，牵手溜冰漫步冰雕丛中",
        traits: { socialStyle: 8, dateStyle: 7, commitment: 7 },
        explanation: "你致力于把地球上每一个角落都变成你们的偶像剧片场",
      },
      {
        text: "叫上我俩各自的室友，组成 8 人浩荡旅行团一起疯",
        traits: { flexibility: 8, socialStyle: 7, communication: 7 },
        explanation: "你是热衷于搞大型联谊派对的团建狂魔",
      },
      {
        text: "我比较 i，这种人挤人的场合我宁愿自己在宿舍看直播",
        traits: { independence: 8, socialStyle: 6, flexibility: 5 },
        explanation: "你对喧嚣过敏，只愿在寂静的角落里独自开花",
      },
      {
        text: "看看哪个社团有抽奖或者免票活动，薅完羊毛就走",
        traits: { flexibility: 9, communication: 7, dateStyle: 6 },
        explanation: "你是看透一切虚妄直击物质本质的羊毛党",
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
        text: "绝对的禁区。查手机=不信任=这段感情完蛋了",
        traits: { independence: 9, commitment: 4 },
        explanation: "你在捍卫数字主权的战役中绝不退让半步",
      },
      {
        text: "平时互不干涉，但如果有一方真的缺乏安全感，可以大方给看",
        traits: { commitment: 8, communication: 7 },
        explanation: "你深知在安全感面前，所谓的隐私不堪一击",
      },
      {
        text: "随便查，我连外卖软件的点餐记录都可以给你报备",
        traits: { flexibility: 7, communication: 8 },
        explanation: "你是将坦白从宽贯彻到底的清教徒",
      },
      {
        text: "我不看 Ta 的，Ta 最好也别看我的，主打一个难得糊涂",
        traits: { commitment: 8, independence: 4 },
        explanation: "你深谙“水至清则无鱼”的感情糊弄学",
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
        text: "花重金买礼物、订高档餐厅，搞个极具仪式感的惊喜！",
        traits: { dateStyle: 8, communication: 7, emotionalReadiness: 8 },
        explanation: "你是一个绝不放过任何一个撒钱造作机会的浪漫狂徒",
      },
      {
        text: "买个小蛋糕，在操场散步的时候真诚地给 Ta 一个大大的拥抱",
        traits: { independence: 7, emotionalReadiness: 6, flexibility: 7 },
        explanation: "你偏爱在四下无人的角落里奉上最纯粹的悸动",
      },
      {
        text: "火速在朋友圈发 9 宫格长文炫耀：“这是我那牛逼的对象！”",
        traits: { socialStyle: 8, dateStyle: 7, communication: 6 },
        explanation: "你恨不得向全宇宙广播你中了头彩的狂喜",
      },
      {
        text: "虽然替 Ta 高兴，但内心也会产生同辈压力，暗暗发誓要更卷才行",
        traits: { emotionalReadiness: 8, communication: 7, independence: 6 },
        explanation: "你总能在别人的光芒里照见自己内心的焦虑",
      },
    ],
  },

  {
    id: "travel_2",
    text: "谈了一段时间后，两人第一次计划去省外旅游（比如去延吉/长白山），你的状态是？",
    icon: createIcon(Plane, "w-6 h-6 text-blue-500"),
    category: "lifestyle",
    answers:[
      {
        text: "太棒了，这绝对是一场让感情急速升温的浪漫之旅",
        traits: { dateStyle: 8, commitment: 7, socialStyle: 7 },
        explanation: "你是不可救药的粉色泡泡制造机",
      },
      {
        text: "有点虚，听说“旅游是情侣分手的试金石”，我很怕在路上吵架",
        traits: { independence: 8, socialStyle: 7, dateStyle: 5 },
        explanation: "你对人性经不起折腾有着深刻的悲观预判",
      },
      {
        text: "只要别让我做攻略，我负责当好无情的拎包机器/出片摄影师就行",
        traits: { flexibility: 9, socialStyle: 8, communication: 7 },
        explanation: "你是深谙躺平哲学的最佳旅行挂件",
      },
      {
        text: "旅游太累了，还是在哈尔滨周边逛逛或者找朋友剧本杀比较香",
        traits: { independence: 7, emotionalReadiness: 5, commitment: 4 },
        explanation: "你是个极其厌恶跳出舒适圈的重度宅星人",
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