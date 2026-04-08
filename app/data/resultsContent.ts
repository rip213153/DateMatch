import type { FriendshipTraits, PersonalityTraits, QuizMode } from "@/app/data/types";

export type TraitMetaItem = {
  key: string;
  label: string;
  fillClass: string;
  chipClass: string;
  panelClass: string;
  color: string;
  summaries: [string, string, string];
  details: [string, string, string];
};

export type TitleDescriptionEntry = {
  high: string;
  mid: string;
  low: string;
  highDesc: string;
  midDesc: string;
  lowDesc: string;
};

export const RESULTS_TEXT = {
  retake: "重塑档案",
  traitOverview: "灵魂光谱",
  hoverHintDesktop: "捕捉你的性格粒子",
  hoverHintMobile: "触碰你的性格光谱",
  strengths: "灵魂的回响",
  growth: "与世界和解的间隙",
  saveCard: "留存这段映射",
  generating: "正在重组你的灵魂波段...",
  loading: "潜意识读取中...",
  mobileDetailTitle: "维度哲学",
};

export const ROMANCE_DEFAULT_PROFILE: PersonalityTraits = {
  socialStyle: 5,
  emotionalReadiness: 5,
  dateStyle: 5,
  commitment: 5,
  communication: 5,
  independence: 5,
  career: 5,
  flexibility: 5,
};

export const FRIENDSHIP_DEFAULT_PROFILE: FriendshipTraits = {
  socialEnergy: 5,
  maintenance: 5,
  boundaries: 5,
  spontaneity: 5,
  empathy: 5,
  reliability: 5,
  depth: 5,
  openness: 5,
};

export const ROMANCE_TRAIT_META: TraitMetaItem[] = [
  {
    key: "socialStyle",
    label: "社交",
    fillClass: "bg-sky-500",
    chipClass: "bg-sky-50 text-sky-700 ring-sky-100",
    panelClass: "border-sky-100 bg-sky-50/80 text-sky-900",
    color: "#0ea5e9",
    summaries: ["孤岛守望者", "平衡艺术家", "引力波中心"],
    details: [
      "你习惯在人群边缘审视，虽不轻易喧哗，但每一次开口都带着深思后的温度。你在筛选同类，也在等待着那一声清脆的共鸣。",
      "你游离在热闹与静谧的交界。不过分热烈，也不过分疏离，你像空气一样，让身边的人感到存在，却又不感到压迫。",
      "你是人群中的坐标点。不仅能接住纷繁的热闹，还能从容地引领氛围，你的存在本身，就是一种无声的邀请。",
    ],
  },
  {
    key: "emotionalReadiness",
    label: "情感",
    fillClass: "bg-rose-500",
    chipClass: "bg-rose-50 text-rose-700 ring-rose-100",
    panelClass: "border-rose-100 bg-rose-50/80 text-rose-900",
    color: "#f43f5e",
    summaries: ["潜行观察者", "温柔锚点", "烈火纯粹主义"],
    details: [
      "你在心门之外筑起高墙，并非因为封闭，而是因为敬畏。你在等待那个能徒手拆掉砖墙、且不被碎石所伤的旅人。",
      "你以绝对的理性审视悸动，在心潮澎湃时依然能保持清醒。你是不动声色的温柔锚点，让爱人在风暴中亦有停靠的港湾。",
      "爱对你而言，是毫无保留的倾注。你不屑于试探与博弈，只愿以一颗赤诚之心，去博取另一颗灵魂的对等回响。",
    ],
  },
  {
    key: "dateStyle",
    label: "约会",
    fillClass: "bg-fuchsia-500",
    chipClass: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
    panelClass: "border-fuchsia-100 bg-fuchsia-50/80 text-fuchsia-900",
    color: "#d946ef",
    summaries: ["静谧长谈派", "生活流浪漫", "极致氛围主理人"],
    details: [
      "你对喧闹的约会场景不太感冒，相比于浮华的仪式感，你更贪恋深夜的并肩散步或咖啡馆里的深度灵魂对谈。",
      "你向往“不费力”的约会哲学。无需刻意打卡网红地，即使是周末一起逛个超市、压个马路，只要人在身边，你就能把平凡日子过出质感。",
      "你是天生的浪漫制造机。你极具巧思，愿意花心思去筹备惊喜、营造气氛。和你约会，永远充满仪式感与心动火花。",
    ],
  },
  {
    key: "commitment",
    label: "承诺",
    fillClass: "bg-emerald-500",
    chipClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    panelClass: "border-emerald-100 bg-emerald-50/80 text-emerald-900",
    color: "#10b981",
    summaries: ["逐风体验派", "稳健航行舵手", "未来引航员"],
    details: [
      "你是一阵不羁的风，此刻的快乐比虚无缥缈的永远更真实。你不愿过早被沉重的诺言所绑架，追求的是当下的纯粹。",
      "你在感性与理智中游刃有余。你不会一上来就许下山盟海誓，但会在每一个日常的切片里，用行动将承诺打磨成坚固的基石。",
      "一旦认准了人，你就会毫不犹豫地将对方规划进未来的每一张蓝图中。你的笃定和责任感，能给伴侣带来极大的踏实感。",
    ],
  },
  {
    key: "communication",
    label: "沟通",
    fillClass: "bg-cyan-500",
    chipClass: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    panelClass: "border-cyan-100 bg-cyan-50/80 text-cyan-900",
    color: "#06b6d4",
    summaries: ["无声胜有声", "高情商共鸣者", "直球沟通者"],
    details: [
      "你有时将万千思绪藏进细节里。比起激烈的交锋，你更倾向于用行动或隐喻来表达，你需要一个能读懂你微小暗示的旅人。",
      "你是双向沟通的艺术大师。既懂得倾听对方的弦外之音，又能温柔地表达自己的诉求，在你的场域里，沟通永远是流动且富有温度的。",
      "你讨厌猜忌和内耗，崇尚“打直球”。开心与不悦坦荡摆在桌面上，这种高效透明的相处，能极大地降低关系里的摩擦成本。",
    ],
  },
  {
    key: "independence",
    label: "独立",
    fillClass: "bg-amber-500",
    chipClass: "bg-amber-50 text-amber-700 ring-amber-100",
    panelClass: "border-amber-100 bg-amber-50/80 text-amber-900",
    color: "#f59e0b",
    summaries: ["亲密共生体", "双轨并行者", "清醒独立岛"],
    details: [
      "你渴望与伴侣深度交融，期待高频的分享和黏在一起的温度。在爱里，你是个毫无保留的小孩，期待着对方同等密度的热情回馈。",
      "你们是相交的圆。相聚时耳鬓厮磨，独处时各自闪耀。既不会太黏，也不会让人觉得过度疏离，平衡感极佳。",
      "你有一座属于自己的精神堡垒。爱情是生活的锦上添花，而非救命稻草。你清醒的独立人格，散发着让人无法轻易掌控的高级魅力。",
    ],
  },
  {
    key: "career",
    label: "事业",
    fillClass: "bg-violet-500",
    chipClass: "bg-violet-50 text-violet-700 ring-violet-100",
    panelClass: "border-violet-100 bg-violet-50/80 text-violet-900",
    color: "#8b5cf6",
    summaries: ["生活体验家", "事业爱情平衡派", "硬核攀峰者"],
    details: [
      "比起世俗的 KPI，你更在乎晚风、日落和爱人的怀抱。你是一个温柔的生活家，坚信人生的意义在于体验，而非无止境的追逐。",
      "你既有在职场上披荆斩棘的野心，也有为爱人煲汤的柔情，是个完美的平衡大师。你懂得在忙碌中，为彼此留出一块纯净之地。",
      "你有着极其清晰的未来规划。在现阶段，个人成长与自我实现是宇宙的中心，你需要的是一个能与你并肩作战、在顶峰相见的人。",
    ],
  },
  {
    key: "flexibility",
    label: "适应",
    fillClass: "bg-lime-500",
    chipClass: "bg-lime-50 text-lime-700 ring-lime-100",
    panelClass: "border-lime-100 bg-lime-50/80 text-lime-900",
    color: "#84cc16",
    summaries: ["秩序守护者", "温和折中派", "旷野上的风"],
    details: [
      "你有坚定信奉的生活逻辑。这种对秩序的坚守，虽不宽泛，但却让你在关系里显得格外靠谱和坚定。",
      "你是关系里的润滑剂。面对差异，你不会偏激地捍卫自我，也不会毫无底线地妥协，总能找到让双方都舒服的平衡点。",
      "你拥有极强的包容力和拥抱变化的勇气。即使对方的步调与你相左，你也能将其视为一场新鲜的探险，在差异中发掘出别样的情趣。",
    ],
  },
];

export const FRIENDSHIP_TRAIT_META: TraitMetaItem[] = [
  {
    key: "socialEnergy",
    label: "电量",
    fillClass: "bg-sky-500",
    chipClass: "bg-sky-50 text-sky-700 ring-sky-100",
    panelClass: "border-sky-100 bg-sky-50/80 text-sky-900",
    color: "#0ea5e9",
    summaries: ["小圈子守望者", "动态平衡大师", "派对发电机"],
    details: [
      "你更适合低压力、小规模的互动。比起热闹的群聚，熟人间的深度共鸣更能为你回血。",
      "你像一个可调节的开关，既能融入热闹的局，也能享受片刻的安静。这种社交弹性让你在不同圈子里都游刃有余。",
      "人群是你的终极充电宝。只要把你扔进热闹的局里，你就能瞬间满血复活，是朋友聚会中当之无愧的气氛担当。",
    ],
  },
  {
    key: "maintenance",
    label: "维护",
    fillClass: "bg-rose-500",
    chipClass: "bg-rose-50 text-rose-700 ring-rose-100",
    panelClass: "border-rose-100 bg-rose-50/80 text-rose-900",
    color: "#f43f5e",
    summaries: ["精神共振型", "关键节点在场", "生活切片分享者"],
    details: [
      "你信奉“君子之交淡如水”，哪怕长久不见，只要重逢便能回到当下。默契，无需高频的寒暄来证明。",
      "日常也许各忙各的，但在朋友真正需要救援的时刻，你永远是那个第一个站出来撑场子的人。",
      "你喜欢把生活中的琐碎打包邮寄给对方，虽然只言片语，但那是你对这平庸世界最深情的“我也在经历”的见证。",
    ],
  },
  {
    key: "boundaries",
    label: "边界",
    fillClass: "bg-emerald-500",
    chipClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    panelClass: "border-emerald-100 bg-emerald-50/80 text-emerald-900",
    color: "#10b981",
    summaries: ["命运共同体", "弹性结界拥有者", "社交防火墙"],
    details: [
      "你在朋友面前几乎没有防御值，习惯把“我的”变成“我们的”。你赴汤蹈火的仗义，是友谊里最硬的通货。",
      "你既会照顾关系，也会照顾自己。在亲近和边界之间拿捏得恰到好处，让相处既有温暖，又有留白。",
      "你极其珍视个人空间。虽然有时显得有些清冷，但却滤掉了所有无效的内耗，保证了友谊纯度。",
    ],
  },
  {
    key: "spontaneity",
    label: "随性",
    fillClass: "bg-amber-500",
    chipClass: "bg-amber-50 text-amber-700 ring-amber-100",
    panelClass: "border-amber-100 bg-amber-50/80 text-emerald-900",
    color: "#f59e0b",
    summaries: ["J 人计划通", "顺势而为者", "P 人天花板"],
    details: [
      "你拒绝意外带来的焦虑，确定的行程会给你极大的安全感，你是朋友出行最依赖的大脑。",
      "你既不排斥计划的有序，也不抗拒意外的发现。这种平衡感让你无论在什么局里都显得从容不迫。",
      "随时随地来一场说走就走的旅行，只要目的地有趣，过程无需设定。你拥有把一切未知变成惊喜的能力。",
    ],
  },
  {
    key: "empathy",
    label: "共情",
    fillClass: "bg-fuchsia-500",
    chipClass: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
    panelClass: "border-fuchsia-100 bg-fuchsia-50/80 text-fuchsia-900",
    color: "#d946ef",
    summaries: ["温情疗愈师", "清醒解题人", "深渊共鸣者"],
    details: [
      "你能捕捉所有细微的失落，无条件地提供强大的情绪托底。你是朋友低谷期最想拨通的那通电话。",
      "你能在共情与冷静间随时切换。当朋友发泄完后，你会温和地帮其拆解痛点，你是情绪与逻辑并存的智者。",
      "你擅长用理智的逻辑为朋友披荆斩棘。比起温言软语的安慰，你精准的问题拆解往往更能触及问题的核心。",
    ],
  },
  {
    key: "reliability",
    label: "靠谱",
    fillClass: "bg-cyan-500",
    chipClass: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    panelClass: "border-cyan-100 bg-cyan-50/80 text-cyan-900",
    color: "#06b6d4",
    summaries: ["灵动赛博搭子", "言出必行", "朋友圈锚点"],
    details: [
      "你主打一个随心所欲，虽然偶尔会在非正式的小局上失踪，但和你做搭子绝对能体验到最真实、不做作的快乐。",
      "你不轻易给出承诺，但只要点头，便是覆水难收。你在友谊里有着极强的契约精神，是那种能把心交给对方的人。",
      "你是整个圈子的定海神针。无论遇到什么烂摊子，大家的第一反应永远是“找你商量”，因为你永远值得信任。",
    ],
  },
  {
    key: "depth",
    label: "深聊",
    fillClass: "bg-violet-500",
    chipClass: "bg-violet-50 text-violet-700 ring-violet-100",
    panelClass: "border-violet-100 bg-violet-50/80 text-violet-900",
    color: "#8b5cf6",
    summaries: ["单纯快乐制造者", "进可深聊退可玩", "灵魂镜像探索者"],
    details: [
      "你拒绝沉重的负担，人生已如此艰难，朋友在一起就是要没心没肺地虚度光阴。快乐，是你们友谊的唯一通货。",
      "你拥有在雅俗之间跳跃的能力。既能在路边摊聊八卦，也能在午夜聊人生，这种全能感让每一种关系都有深浅两面。",
      "在这个孤独的宇宙里，你一直在寻找那个能听懂你所有弦外之音的镜像。遇见你，便意味着一场灵魂的共鸣。",
    ],
  },
  {
    key: "openness",
    label: "包容",
    fillClass: "bg-lime-500",
    chipClass: "bg-lime-50 text-lime-700 ring-lime-100",
    panelClass: "border-lime-100 bg-lime-50/80 text-lime-900",
    color: "#84cc16",
    summaries: ["同温层原住民", "求同存异者", "世界盲盒玩家"],
    details: [
      "你深知友谊的磨合成本。只在那些和你三观、审美高度同频的同温层里深耕，虽然圈子窄，但纯度极高。",
      "即使对方和你生活轨道完全不同，你也能从他们的故事里听出不一样的色彩。你是友谊世界里的外交家，总能找到彼此交织的线。",
      "你永远对未知的个体抱有极大的好奇。你把交友看作一场盲盒收集，每一个不同的人，都是为你展示世界侧面的窗口。",
    ],
  },
];

export const ROMANCE_TITLE_MAP: Record<string, TitleDescriptionEntry> = {
  socialStyle: {
    high: "社交秩序的观察者",
    mid: "温和的连接者",
    low: "深度的独行者",
    highDesc: "你不仅是社交的参与者，更是深刻的观察者。你善于在复杂关系中洞悉人心，并总能给予恰如其分的应对。",
    midDesc: "你追求人与人之间自然的流动。不刻意迎合，亦不疏离，这使得你在任何社交语境下都显得从容而得体。",
    lowDesc: "你保留着一份难得的清醒与矜持。你将深度的精神交流视作社交的终极追求，而非单纯的热闹。",
  },
  emotionalReadiness: {
    high: "克制的热忱者",
    mid: "稳定的情感承托者",
    low: "理性的情感审视者",
    highDesc: "你拥有极高浓度的情感能量，但你懂得克制。这种有节制的投入，让你的爱意如同细水长流，厚重而持久。",
    midDesc: "你拥有极佳的情绪调节能力，既能给予温暖的陪伴，也能在冲突中保持理性的中枢，让关系在风浪中平稳航行。",
    lowDesc: "你在交付真心前会有严谨的理性筛选。这种对关系的尊重，保证了每一份情感的投入都具备稳固的基石。",
  },
  dateStyle: {
    high: "生活质感的雕琢者",
    mid: "真实的相处践行者",
    low: "知性的灵魂共振者",
    highDesc: "你擅长在平凡的生活里提炼仪式感。在你看来，约会不仅是相处，更是一次对美好生活共鸣的深度策展。",
    midDesc: "你排斥刻意而虚浮的表演。比起浪漫的辞藻，你更看重约会时那份朴素却真实的默契与舒适感。",
    lowDesc: "你寻求的是思想上的高阶共振。如果约会无法触及灵魂的深度，宁愿将时间交付给独处。",
  },
  commitment: {
    high: "长期的价值守望者",
    mid: "稳健的关系经营者",
    low: "当下的笃行者",
    highDesc: "你将关系视为长期的人生投资。你以审慎的态度对待承诺，一旦认定，便会倾注全部的责任与信念。",
    midDesc: "你深谙经营之道，不急于盖棺定论，在与对方的磨合中，将承诺一步步铸就为坚固的基石。",
    lowDesc: "你拒绝被远方的蓝图所绑架。你认为，每一个真实的当下心动，都具备等同于永远的价值。",
  },
  communication: {
    high: "明澈的沟通者",
    mid: "坦诚的对话者",
    low: "深邃的内敛者",
    highDesc: "你拥有极其高效且透明的沟通风格。这并非冰冷，而是一种极度尊重对方、不留误会的相处智慧。",
    midDesc: "你擅长在倾听与表达之间寻找平衡，能够让对方在感受到尊重的同时，也深刻理解你的边界与诉求。",
    lowDesc: "你习惯以深邃的内省代替言辞的堆砌。你相信，唯有在足够安全和信任的土壤里，真正的真心才会吐露芬芳。",
  },
  independence: {
    high: "边界感的高贵持守者",
    mid: "亲密与独立的协调者",
    low: "深情的奉献者",
    highDesc: "你拥有不可侵犯的精神领地。这种清醒的独立不仅保护了你自己，也赋予了伴侣欣赏你独特人格的余地。",
    midDesc: "你精准地把握着亲密关系的尺度，既保留了个人的思想独特性，又具备与对方合二为一的融合能力。",
    lowDesc: "你并不吝啬于付出，你的深情往往伴随着极高的参与度，能在关系中给予对方极大的被接纳感与温暖。",
  },
  career: {
    high: "卓越的攀登者",
    mid: "人生的统筹规划者",
    low: "生活哲学的追随者",
    highDesc: "你有极为明确的个人目标和强悍的执行力。在与你并肩的路上，对方感受到的不仅是爱，更是你所引领的成长。",
    midDesc: "你是一位兼顾事业与情感的统筹大师。你不仅追求自身的进取，更期待与伴侣达成共同进步的愿景。",
    lowDesc: "你更倾向于将生命交付给当下的体验。对你而言，人生的成功定义不在于外界的勋章，而在于内心感受的深度。",
  },
  flexibility: {
    high: "从容的化解者",
    mid: "平衡的稳健者",
    low: "原则的捍卫者",
    highDesc: "你具备极佳的心智弹性，面对变故与差异，你总能以从容的姿态化解，表现出高超的处世智慧。",
    midDesc: "你懂得如何在坚持底线与接纳对方之间游走。这种平衡的艺术，让你在磨合中既不丢掉自己，也不让关系僵化。",
    lowDesc: "你拥有坚固的内心秩序。这种对原则的捍卫，让你显得稳健而可靠，但也为你的关系设定了极高的筛选门槛。",
  },
};

export const FRIENDSHIP_TITLE_MAP: Record<string, TitleDescriptionEntry> = {
  socialEnergy: {
    high: "人群中的定标者",
    mid: "灵活的能量切换者",
    low: "深度的灵魂默契者",
    highDesc: "你在复杂的社交场域中总能精准定位，是朋友聚会中当之无愧的主心骨，引领着群体的节奏。",
    midDesc: "你具备极强的社交韧性，能够根据场景灵活切换状态，既能接纳喧嚣，也能独自深思。",
    lowDesc: "你从不追求广度，唯独倾力经营深度。对于你而言，拥有几个灵魂同频的知己，胜过千百个泛泛之交。",
  },
  maintenance: {
    high: "情感的持续供养者",
    mid: "关键时刻的守望者",
    low: "淡泊的长久知己",
    highDesc: "你非常珍视情感的连接，并愿意通过持续的分享与互动，将这段缘分像艺术品一样长久维护。",
    midDesc: "你深谙友谊的本质不在于频率，而在于关键节点的陪伴。在对方最需要你的时刻，你永远在那里。",
    lowDesc: "你们的友谊纯净且不依赖于琐碎的联络。哪怕各自散落天涯，只要重逢，便是高山流水遇知音。",
  },
  boundaries: {
    high: "清醒的原则守护者",
    mid: "分寸的把握者",
    low: "豁达的仗义之人",
    highDesc: "你深知尊重是友谊的底色。你有着清晰的原则，这种边界不仅保护了自己，也让这段友谊始终维持着得体的体面。",
    midDesc: "你极其擅长把握亲疏远近。既不会疏离到形同陌路，也不会黏连到失去自我，你赋予了友谊一种优雅的距离。",
    lowDesc: "你以真诚换真诚，从不计算得失。那份赴汤蹈火的仗义，是你人格中最闪耀的勋章，也是朋友最坚实的靠山。",
  },
  spontaneity: {
    high: "秩序的构建者",
    mid: "灵活的同行者",
    low: "未知的探索者",
    highDesc: "你是一位极具责任感的规划师。你所构建的秩序感，为朋友的每一次出行、聚会提供了可靠的保障。",
    midDesc: "你不抗拒计划的合理，也接纳意外的美好。你这种进退自如的特质，让你成为所有人都青睐的最佳搭子。",
    lowDesc: "你渴望逃离规则，寻找不可预知的生命体验。你所追求的不仅是玩乐，更是那种把现实变作未知的勇气。",
  },
  empathy: {
    high: "温暖的情绪托底者",
    mid: "睿智的共情专家",
    low: "理性的解决者",
    highDesc: "你拥有极佳的情绪触角，能完美接住朋友每一个细微的脆弱。你存在的本身，就是一种无声的治愈。",
    midDesc: "你将共情与理智结合得恰到好处。既能让对方感受到被理解，又能引导对方走出思维的迷宫。",
    lowDesc: "你信奉逻辑优于情绪。比起苍白的安抚，你更倾向于用实质性的建议和精准的分析，帮朋友彻底摆脱困境。",
  },
  reliability: {
    high: "坚固的情谊支柱",
    mid: "诚信的践行者",
    low: "随性的人间真性情",
    highDesc: "你对友谊有着近乎神圣的责任感。你是朋友圈里的定海神针，这份笃定感是友谊中最昂贵的奢侈品。",
    midDesc: "你不轻易给予承诺，但一旦应允，必然全心交付。你所践行的诚信，构成了这段友谊最坚实的底座。",
    lowDesc: "你并不在意世俗的规训，你用一种极致的真诚与洒脱与人相处。那种不做作的真实，反而拥有最强大的感染力。",
  },
  depth: {
    high: "哲思型的知音",
    mid: "多元的平衡者",
    low: "纯粹的快乐制造者",
    highDesc: "你们的友谊触及灵魂。那些关于存在、关于人性、关于未来的深刻交谈，构成了你们友谊最璀璨的碎片。",
    midDesc: "你们在雅俗之间游刃有余。既能一起在大排档里畅谈八卦，也能在深夜的星空下聊起人生的迷茫，这是友谊的最高版本。",
    lowDesc: "你追求的是纯粹的欢愉。不需要深度的剖析，只需要在一起的那一刻，世界是简单的、快乐的、充满多巴胺的。",
  },
  openness: {
    high: "海纳百川的探索者",
    mid: "睿智的求同存异者",
    low: "纯粹的同温层守护者",
    highDesc: "你将世界视为一座巨大的盲盒，而每一个不同的人，都是为你开启一个未知的世界。你拥抱所有差异，亦兼容所有性格。",
    midDesc: "你对差异保持着理性而温和的态度。在保持自我的同时，能够以开放的心态去欣赏那些与你截然不同的灵魂。",
    lowDesc: "你极度珍视同频的价值。你深知三观的契合是一段友谊的基石，因此你更愿意在那个志同道合的领域里，深耕出一片纯粹的乐土。",
  },
};

export const RESULTS_MODE_CONFIG = {
  friendship: {
    titlePrefix: "友情同频图谱",
    badgeText: "DateMatch 搭子人格档案",
    compatibilityTitle: "社交舒适区",
    bestMatchTitle: "你的天选搭子",
    challengeTitle: "容易消耗你的类型",
    bestMatches: [
      "懂得尊重你的能量边界，相处时无需刻意找话题的人",
      "能接住你的奇奇怪怪，甚至陪你一起在深夜发疯的人",
      "在彼此的荒原上，能识别出对方灵魂频率的同路人",
    ],
    challengingMatches: [
      "极度缺乏分寸感，喜欢对你的私生活指手画脚的人",
      "把你的付出视为理所当然，只索取不提供情绪价值的能量吸血鬼",
      "将计划视为铁律，无法接纳任何临时变动的人",
    ],
    primaryActionLabel: "去提交搭子档案",
    primaryActionHref: "/find-friends",
  },
  romance: {
    titlePrefix: "恋爱多维波段",
    badgeText: "DateMatch 恋爱人格档案",
    compatibilityTitle: "灵魂兼容性指南",
    bestMatchTitle: "最契合你的正缘",
    challengeTitle: "需要避雷的磁场",
    bestMatches: [
      "内核极其稳定，能在你陷入情绪旋涡时给你托底的人",
      "拥有自己的精神世界，既能深度交融又能保持独立边界的人",
      "在发生冲突时，愿意不带情绪地与你复盘并解决问题的人",
    ],
    challengingMatches: [
      "习惯用冷暴力解决问题，或是情绪极度不稳定的人",
      "试图通过打压来掌控你的生活节奏和交友圈的人",
      "承诺张口就来，却从未用实际行动落地的“口嗨型”玩家",
    ],
    primaryActionLabel: "去遇见灵魂伴侣",
    primaryActionHref: "/find-match",
  },
} as const satisfies Record<
  QuizMode,
  {
    titlePrefix: string;
    badgeText: string;
    compatibilityTitle: string;
    bestMatchTitle: string;
    challengeTitle: string;
    bestMatches: string[];
    challengingMatches: string[];
    primaryActionLabel: string;
    primaryActionHref: string;
  }
>;

export type V2TraitCopyLevel = {
  title: string;
  subtitle: string;
  description: string;
};

export type V2TraitCopy = {
  key: string;
  label: string;
  hint: string;
  levels: {
    high: V2TraitCopyLevel;
    mid: V2TraitCopyLevel;
    low: V2TraitCopyLevel;
  };
};

export type V2ResultsPageCopy = {
  pageTitle: string;
  pageSubtitle: string;
  radarTitle: string;
  radarHint: string;
  strengthsTitle: string;
  growthTitle: string;
  summaryTitle: string;
  summaryText: string;
  closingText: string;
};

export type V2ProfileTraitRule = {
  key: string;
  min?: number;
  max?: number;
};

export type V2ProfileCopy = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  strengths: string;
  underStress: string;
  compatibility?: {
    bestMatches: string[];
    challengingMatches: string[];
  };
  signatureTags: string[];
  themeProfile: {
    core: string[];
    secondary: string[];
    avoid: string[];
  };
  rules: {
    primary: V2ProfileTraitRule[];
    secondary?: V2ProfileTraitRule[];
  };
};

export const ROMANCE_PROFILE_THEMES = {
  stableResponse: "稳定回应",
  longTermIntent: "长期投入",
  reassurance: "确认感",
  slowWarmup: "慢热靠近",
  carefulObservation: "先看再进",
  personalBoundary: "边界清楚",
  selfPacedCloseness: "自主节奏",
  spaceRespect: "尊重空间",
  emotionalCandor: "愿意表达",
  directRepair: "把话说开",
  problemFacing: "正面处理问题",
  gentleRepair: "温和修复",
  emotionalCare: "照顾感受",
  keepConnection: "留住关系",
  presentFeeling: "先有感觉",
  aliveness: "关系要活着",
  flowSense: "当下流动感",
  explicitReassurance: "需要明确回应",
  sensitivityToSignals: "在意细节变化",
  settledAfterConfirmation: "确认后才安心",
  futurePlanning: "未来感",
  sharedPlanning: "一起规划",
  directionSense: "长期方向",
} as const;

export const FRIENDSHIP_PROFILE_THEMES = {
  reliablePresence: "靠谱在场",
  showUpWhenNeeded: "关键时刻靠得住",
  steadySupport: "稳定托底",
  lowPressureCompany: "低压陪伴",
  comfortOverHeat: "舒服长久",
  canStayWithoutNoise: "放着也不断",
  emotionalHolding: "情绪接住",
  stayWithFragility: "愿意留下来",
  gentleContainment: "温柔承接",
  clearBoundary: "边界清楚",
  mutualEase: "彼此舒服",
  respectMeasure: "尊重分寸",
  proactiveContact: "主动联系",
  proactiveRepair: "主动修复",
  keepFriendshipAlive: "把关系留在生活里",
  tolerateDifference: "能容纳不同",
  approachAcrossDifference: "差异也能靠近",
  relationalElasticity: "关系有弹性",
  holdComplexity: "能容纳复杂",
  staySteadyInComparison: "比较中稳住自己",
  notOverIdealize: "关系不用理想化",
  longTermUnderstanding: "长期理解",
  deepCompanionship: "深度同行",
  qualityMatters: "重视关系质量",
} as const;

export type V2ProfileResolverMode = QuizMode;

export type V2ProfileResolverInput = Record<string, number>;

export type V2ResolvedProfile = {
  profile: V2ProfileCopy;
  score: number;
  matchedPrimaryRules: number;
  matchedSecondaryRules: number;
  usedFallback: boolean;
};

export const ROMANCE_PROFILE_COMPATIBILITY_V2: Record<
  string,
  { bestMatches: string[]; challengingMatches: string[] }
> = {
  stable_connector: {
    bestMatches: [
      "能持续回应你的人，会让你更容易安心靠近。",
      "愿意认真经营关系、对长期有想法的人，通常更能打动你。",
      "在表达和态度上比较清楚的人，会让你少很多内耗。",
    ],
    challengingMatches: [
      "忽冷忽热、长期不给明确信号的人，最容易让你悬着。",
      "只享受当下感觉、回避现实落点的人，容易让你慢慢失去安全感。",
      "总把重要问题拖着不谈的人，会消耗你对关系的信心。",
    ],
  },
  slow_observer: {
    bestMatches: [
      "节奏稳定、不会催你的人，更容易让你放下戒备。",
      "愿意用时间和一致性证明自己的人，会让你慢慢信任。",
      "边界清楚但不冷淡的人，通常和你更容易走深。",
    ],
    challengingMatches: [
      "推进太快、情绪太满的人，容易让你本能后退。",
      "只给热度不给稳定的人，会让你越看越不确定。",
      "不断逼你立刻表态的人，会让关系卡在靠近之前。",
    ],
  },
  clear_autonomy: {
    bestMatches: [
      "尊重边界、又不把距离误读成冷淡的人，往往更容易让你放心靠近。",
      "有自己生活重心的人，通常更能和你并肩而不是互相吞没。",
      "亲近里仍保留分寸感的人，会让你更愿意长期靠近。",
    ],
    challengingMatches: [
      "高频确认、强推进的人，容易让你想先退一步。",
      "把亲密理解成时时黏在一起的人，通常会让你感到压迫。",
      "情绪一来就越界索取的人，最容易触发你的防御。",
    ],
  },
  direct_expressor: {
    bestMatches: [
      "愿意正面沟通的人，会让你觉得关系是活的。",
      "不怕谈需求、也能接住情绪的人，和你更容易靠近。",
      "遇到问题愿意一起修复的人，通常更能激发你的投入。",
    ],
    challengingMatches: [
      "习惯回避冲突、长期模糊表达的人，最容易让你挫败。",
      "总让你靠猜的人，会快速消耗你的耐心。",
      "把诚实表达当成压力的人，很难和你真正走近。",
    ],
  },
  gentle_repair: {
    bestMatches: [
      "能理解关系需要慢慢修的人，更容易和你走久。",
      "情绪不粗暴、愿意留在关系里的人，通常更容易让你把心放下来。",
      "既温和又肯负责的人，会让你更愿意投入。",
    ],
    challengingMatches: [
      "遇到问题只想赢、不想修的人，容易让你心累。",
      "把你的温和当成退让的人，会慢慢消耗你。",
      "关系一有波动就抽身的人，很难给你稳定感。",
    ],
  },
  present_experience: {
    bestMatches: [
      "有生命力、相处真实的人，更容易让你心动。",
      "不急着给关系下定义、能一起把当下过舒服的人，通常更容易让你愿意继续靠近。",
      "能把日常过出感觉的人，会让你更想靠近。",
    ],
    challengingMatches: [
      "过早把关系拉进沉重规划里的人，容易让你想放慢。",
      "结构感太强、什么都要先定好的人，可能让你觉得失去呼吸感。",
      "把关系经营得只剩任务感的人，很难留下你的投入。",
    ],
  },
  deep_reassurance: {
    bestMatches: [
      "回应明确、态度稳定的人，会让你很快安定下来。",
      "能看见你细节敏感度的人，更容易真正打动你。",
      "愿意持续确认彼此位置的人，通常和你更合拍。",
    ],
    challengingMatches: [
      "长期模糊、忽近忽远的人，最容易放大你的不安。",
      "把回应延后、把重要事说得含糊的人，会让你反复揣测。",
      "需要你一再确认对方心意的关系，通常会很消耗你。",
    ],
  },
  long_term_builder: {
    bestMatches: [
      "对长期关系有方向感的人，更容易让你真正投入。",
      "能把喜欢落到现实规划里的人，通常最能吸引你。",
      "既有情感温度又有现实感的人，会让你更有信心继续。",
    ],
    challengingMatches: [
      "只谈感觉、不谈方向的人，容易让你慢慢失去耐心。",
      "长期停在模糊阶段的人，很难满足你对关系落点的需要。",
      "逃避现实讨论的人，通常会让你觉得关系悬着。",
    ],
  },
};

export const FRIENDSHIP_PROFILE_COMPATIBILITY_V2: Record<
  string,
  { bestMatches: string[]; challengingMatches: string[] }
> = {
  steady_anchor: {
    bestMatches: [
      "靠谱、关键时候会出现的人，更容易和你走近。",
      "把友情放进现实生活里的人，通常更让你安心。",
      "说到做到、让人有托底感的人，很适合和你长期同频。",
    ],
    challengingMatches: [
      "总失约、总敷衍的人，最容易让你失望。",
      "只在需要你时才出现的人，会让你很快看淡关系。",
      "把朋友关系维持在表面热闹的人，很难真正靠近你。",
    ],
  },
  low_pressure_long_flow: {
    bestMatches: [
      "不需要高频联系也能自然不断线的人，很适合你。",
      "舒服、稳定、不制造压力的人，更容易和你走久。",
      "能接受人生阶段变化、又不轻易否定关系的人，通常更合拍。",
    ],
    challengingMatches: [
      "高频索取回应的人，容易让你觉得有负担。",
      "把联系频率等同于关系浓度的人，可能会让你想拉开距离。",
      "总想立刻确认朋友位置的人，会让你觉得相处变重。",
    ],
  },
  gentle_holder: {
    bestMatches: [
      "能接情绪、也愿意留在脆弱时刻的人，更容易被你珍惜。",
      "温和、不急着评判的人，通常和你更容易建立深层信任。",
      "愿意真正听见别人状态的人，很适合和你走近。",
    ],
    challengingMatches: [
      "总把情绪当麻烦、急着下结论的人，容易让你失去靠近感。",
      "只会讲道理、不愿意承接感受的人，很难和你深交。",
      "长期只索取倾听、却从不顾及你状态的人，会慢慢耗空你。",
    ],
  },
  clear_boundary: {
    bestMatches: [
      "懂分寸、会尊重彼此节奏的人，更适合和你长期相处。",
      "既愿意亲近、又不会越界的人，通常最能让你舒服。",
      "能把边界感理解成关系保护的人，更容易和你走近。",
    ],
    challengingMatches: [
      "把亲近建立在越界和索取上的人，容易让你想后退。",
      "需要你不断迁就的人，会很快触发你的防御。",
      "不尊重生活节奏和距离感的人，很难和你稳定同行。",
    ],
  },
  active_maintainer: {
    bestMatches: [
      "愿意主动回应、一起把友情留在生活里的人，更容易和你走近。",
      "不把关系全交给时间运气的人，通常最能接住你的热情。",
      "出问题愿意修、关系淡了愿意拉回来的人，和你更合拍。",
    ],
    challengingMatches: [
      "长期只等你维系、自己很少回应的人，会让你觉得心累。",
      "总在关系快淡掉时也不补位的人，很难让你保持投入。",
      "把你的主动当成理所当然的人，容易让你慢慢失去热情。",
    ],
  },
  difference_friendly: {
    bestMatches: [
      "愿意接住差异、又不急着把人归类的人，更容易和你成为朋友。",
      "有弹性、能接受不同节奏和表达方式的人，通常和你很合拍。",
      "能把新鲜感和尊重一起带进关系的人，更适合和你走近。",
    ],
    challengingMatches: [
      "过度追求一致、稍有不同就疏远的人，容易让你觉得关系太窄。",
      "表面说包容、实际很快否定差异的人，很难和你长期同频。",
      "对不同的人和生活方式缺少耐心的人，会让你慢慢抽离。",
    ],
  },
  balanced_realist: {
    bestMatches: [
      "能接受关系复杂度、又不轻易理想化的人，通常更容易让你觉得这段友情是稳的。",
      "面对比较、变化和不完美仍能稳住关系的人，更容易和你把友情放长。",
      "真实、不戏剧化的人，更容易和你建立成熟友情。",
    ],
    challengingMatches: [
      "把友情理想化得过满的人，容易让你感到失真和疲惫。",
      "遇到一点复杂就放大成关系问题的人，很难让你放松。",
      "总把比较感带进关系的人，会慢慢消耗你在关系里的松弛感。",
    ],
  },
  deep_companion: {
    bestMatches: [
      "重视长期理解、愿意慢慢走深的人，更容易被你珍惜。",
      "不只停留在热闹表面的人，通常更能和你建立深层连接。",
      "能一起穿过人生阶段变化的人，很适合和你长期同行。",
    ],
    challengingMatches: [
      "只维持表面热络、不愿真正理解彼此的人，很难让你继续投入。",
      "把朋友关系停在功能性往来的人，容易让你觉得关系变浅了。",
      "只追求局部热闹、却缺少长期心力的人，很难和你走远。",
    ],
  },
};

type V2RuleEvaluation = {
  matched: boolean;
  closeness: number;
};

function clampV2TraitScore(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 5;
  return Math.max(0, Math.min(10, numeric));
}

function evaluateV2ProfileRule(rule: V2ProfileTraitRule, traits: V2ProfileResolverInput): V2RuleEvaluation {
  const value = clampV2TraitScore(traits[rule.key]);
  const min = rule.min;
  const max = rule.max;

  if (min !== undefined && max !== undefined) {
    const matched = value >= min && value <= max;
    const center = (min + max) / 2;
    const halfSpan = Math.max((max - min) / 2, 0.5);
    const closeness = matched ? 1 + Math.max(0, 1 - Math.abs(value - center) / halfSpan) : Math.max(0, 1 - Math.min(Math.abs(value - center) / 10, 1));
    return { matched, closeness };
  }

  if (min !== undefined) {
    const matched = value >= min;
    const closeness = matched ? 1 + Math.min((value - min) / 3, 1) : Math.max(0, 1 - (min - value) / 10);
    return { matched, closeness };
  }

  if (max !== undefined) {
    const matched = value <= max;
    const closeness = matched ? 1 + Math.min((max - value) / 3, 1) : Math.max(0, 1 - (value - max) / 10);
    return { matched, closeness };
  }

  return { matched: true, closeness: 1 };
}

function scoreV2ProfileCopy(profile: V2ProfileCopy, traits: V2ProfileResolverInput) {
  const primaryEvaluations = profile.rules.primary.map((rule) => evaluateV2ProfileRule(rule, traits));
  const secondaryEvaluations = (profile.rules.secondary ?? []).map((rule) => evaluateV2ProfileRule(rule, traits));

  const matchedPrimaryRules = primaryEvaluations.filter((rule) => rule.matched).length;
  const matchedSecondaryRules = secondaryEvaluations.filter((rule) => rule.matched).length;
  const primaryPassed = matchedPrimaryRules === primaryEvaluations.length;
  const secondaryPassed =
    secondaryEvaluations.length === 0 || matchedSecondaryRules === secondaryEvaluations.length;

  const primaryCloseness = primaryEvaluations.reduce((sum, rule) => sum + rule.closeness, 0);
  const secondaryCloseness = secondaryEvaluations.reduce((sum, rule) => sum + rule.closeness, 0);

  const score =
    (primaryPassed ? 1000 : 0) +
    matchedPrimaryRules * 100 +
    (secondaryPassed ? 40 : 0) +
    matchedSecondaryRules * 10 +
    primaryCloseness * 3 +
    secondaryCloseness;

  return {
    score,
    matchedPrimaryRules,
    matchedSecondaryRules,
    primaryRuleCount: primaryEvaluations.length,
    secondaryRuleCount: secondaryEvaluations.length,
    primaryPassed,
  };
}

function getV2ProfileLibrary(mode: V2ProfileResolverMode): V2ProfileCopy[] {
  return mode === "friendship" ? FRIENDSHIP_PROFILE_COPY_V2 : ROMANCE_PROFILE_COPY_V2;
}

export function resolveV2ProfileCopy(
  mode: V2ProfileResolverMode,
  traits: V2ProfileResolverInput
): V2ResolvedProfile {
  const library = getV2ProfileLibrary(mode);

  const rankedProfiles = library
    .map((profile) => {
      const scored = scoreV2ProfileCopy(profile, traits);
      return { profile, ...scored };
    })
    .sort((left, right) => {
      if (left.primaryPassed !== right.primaryPassed) {
        return left.primaryPassed ? -1 : 1;
      }
      if (left.matchedPrimaryRules !== right.matchedPrimaryRules) {
        return right.matchedPrimaryRules - left.matchedPrimaryRules;
      }
      if (left.matchedSecondaryRules !== right.matchedSecondaryRules) {
        return right.matchedSecondaryRules - left.matchedSecondaryRules;
      }
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.profile.id.localeCompare(right.profile.id);
    });

  const winner = rankedProfiles[0];

  return {
    profile: winner.profile,
    score: winner.score,
    matchedPrimaryRules: winner.matchedPrimaryRules,
    matchedSecondaryRules: winner.matchedSecondaryRules,
    usedFallback: !winner.primaryPassed,
  };
}

export const RESULTS_TEXT_V2 = {
  romance: {
    pageTitle: "你的亲密关系画像",
    pageSubtitle: "这不是恋爱能力评分，而是你的关系风格分布",
    radarTitle: "关系风格分布",
    radarHint: "每个维度都不是“越高越好”，只代表你更偏向哪一种相处方式。",
    strengthsTitle: "你更自然的靠近方式",
    growthTitle: "你在压力下更容易卡住的地方",
    summaryTitle: "一句话看你在关系里的样子",
    summaryText: "你不是不会爱，而是你需要用适合自己的节奏去建立安全和连接。",
    closingText: "真正适合你的关系，不一定最热烈，但会让你不需要反复怀疑自己该怎么爱。",
  },
  friendship: {
    pageTitle: "你的友情相处风格",
    pageSubtitle: "这不是社交能力评分，而是你的友情节奏和边界分布",
    radarTitle: "友情风格分布",
    radarHint: "每个维度都没有标准答案，只代表你更习惯怎样建立和维持关系。",
    strengthsTitle: "你更自然的相处方式",
    growthTitle: "你在人际压力下更容易在意的地方",
    summaryTitle: "一句话看你怎么做朋友",
    summaryText: "你不是不会做朋友，只是你更习惯用自己的方式理解陪伴、边界和在场。",
    closingText: "真正舒服的友情，不一定最热闹，但会让你不用勉强自己也能留在关系里。",
  },
} as const satisfies Record<QuizMode, V2ResultsPageCopy>;

export const ROMANCE_TRAIT_COPY_V2: V2TraitCopy[] = [
  {
    key: "approachPace",
    label: "接近节奏",
    hint: "你会多快让关系开始发生",
    levels: {
      high: {
        title: "更愿意主动靠近",
        subtitle: "你不太害怕把好感变成真实互动",
        description:
          "你通常相信，很多关系不是想清楚才开始，而是开始了才慢慢变清楚。这样的你更容易抓住连接发生的时机，也更容易推动关系往前走。",
      },
      mid: {
        title: "会按自己的节奏推进",
        subtitle: "你不会太快，也不会一直停在原地",
        description:
          "你通常会边感受边观察，在舒服和确定之间找一个适合自己的节奏。这样的你比较灵活，也更容易根据不同的人调整步调。",
      },
      low: {
        title: "更习惯先观察",
        subtitle: "你不会轻易让自己进入太深的期待",
        description:
          "你更看重稳定的态度和持续的感觉，而不是短时间的热度。这样的你通常更谨慎，也更不容易因为一时冲动投入过深。",
      },
    },
  },
  {
    key: "reassuranceNeed",
    label: "确认需求",
    hint: "你需要多少回应来感到安心",
    levels: {
      high: {
        title: "很在意关系是否有回应",
        subtitle: "对你来说，安心感需要被真实感受到",
        description:
          "你很在意关系里有没有明确回应、稳定在场和被放在心上的感觉。这样的你在关系里通常很认真，也很珍惜双向确认。",
      },
      mid: {
        title: "既需要确认，也保留余地",
        subtitle: "你不会完全依赖外部回应来判断关系",
        description:
          "你能感受到自己对稳定连接的需要，同时也保留了自我调节的空间。这样的你比较平衡，不容易因为一点波动就失去判断。",
      },
      low: {
        title: "不太依赖高频确认",
        subtitle: "你更相信整体相处的质感和长期表现",
        description:
          "比起反复证明，你更相信关系会通过长期表现慢慢显现。这样的你通常比较稳，也更能给彼此空间，不会轻易被短期波动牵着走。",
      },
    },
  },
  {
    key: "boundaryAutonomy",
    label: "边界自主",
    hint: "你需要多少空间来保持自己",
    levels: {
      high: {
        title: "很重视个人空间",
        subtitle: "亲密不等于失去边界",
        description:
          "你很重视关系里的个人空间和自主节奏。这样的你通常更清楚自己需要什么、不需要什么，也更适合进入既亲密又彼此尊重的关系。",
      },
      mid: {
        title: "会在亲密和独立之间找平衡",
        subtitle: "你希望两者能协调共存",
        description:
          "你既重视关系，也重视自己的完整性。这样的你通常比较稳，既能靠近，也不会轻易把自己放丢。",
      },
      low: {
        title: "更容易通过高密度连接感受亲近",
        subtitle: "你会把持续在场视为关系的重要部分",
        description:
          "你享受共享、陪伴和持续在场带来的联结感。这样的你通常投入感很强，也更容易让关系升温。",
      },
    },
  },
  {
    key: "emotionalExpression",
    label: "情绪表达",
    hint: "你会不会把真实感受说出来",
    levels: {
      high: {
        title: "更愿意把感受说出来",
        subtitle: "你相信表达会让关系更真实",
        description:
          "你比较愿意把自己的感受、失落和需要说出来。这样的你更容易被看见，也更容易推动关系向深处发展。",
      },
      mid: {
        title: "会先整理，再表达",
        subtitle: "你在意时机，也在意分寸",
        description:
          "你通常会在整理之后再说，希望自己的表达既真实又不过量。这样的你比较有分寸，也比较会照顾双方的承受力。",
      },
      low: {
        title: "更习惯先自己消化",
        subtitle: "你不会轻易把脆弱和需求摊开给别人看",
        description:
          "你通常希望先想清楚，再决定值不值得说。这样的你很能自我承受，但有时候也会让别人看不见你真正需要的东西。",
      },
    },
  },
  {
    key: "conflictEngagement",
    label: "冲突处理",
    hint: "遇到问题时你更靠近还是退开",
    levels: {
      high: {
        title: "愿意面对问题并修复",
        subtitle: "你不把冲突等同于关系失败",
        description:
          "遇到问题时，你更愿意进入沟通和修复，而不是靠回避维持表面平静。这样的你通常比较有修复力，也更能面对真实关系里的摩擦。",
      },
      mid: {
        title: "会看方式和时机",
        subtitle: "你不会硬碰硬，也不会一直拖着不管",
        description:
          "你通常会在适当的时候把问题带回来。这样的你比较成熟，也更懂得给关系和情绪都留空间。",
      },
      low: {
        title: "更容易先退开",
        subtitle: "你不喜欢高张力的对抗场面",
        description:
          "你通常不喜欢高强度冲突，也不想把很多小事都升级成关系危机。这样的你比较会自我保护，但有些该被处理的感受也可能因此被放久。",
      },
    },
  },
  {
    key: "futureOrientation",
    label: "未来投入",
    hint: "你会不会自然把关系放进未来",
    levels: {
      high: {
        title: "会自然把关系放进长期视角",
        subtitle: "你在意方向感，而不只是当下感觉",
        description:
          "对你来说，喜欢不只是当下开心，也包括愿不愿意一起面对现实、做选择、走得更远。这样的你通常很认真，也更在意关系有没有方向。",
      },
      mid: {
        title: "能谈未来，但不急着压重",
        subtitle: "你希望未来感随着相处慢慢长出来",
        description:
          "你更愿意让未来感随着相处慢慢长出来，而不是靠设想先把关系撑大。这样的你比较现实，也比较有节奏感。",
      },
      low: {
        title: "更重视当下是否真实舒服",
        subtitle: "你不喜欢太早进入过重的未来想象",
        description:
          "你会觉得很多事需要等关系更稳之后再谈。这样的你通常比较清醒，也不容易被空泛的蓝图带着走。",
      },
    },
  },
  {
    key: "jealousyRegulation",
    label: "不安调节",
    hint: "被触发时你能不能稳住自己",
    levels: {
      high: {
        title: "更能先分辨发生了什么",
        subtitle: "你不会立刻被情绪带着跑",
        description:
          "当你被触发、吃醋或不安时，你更有能力先分辨发生了什么。这样的你通常比较稳，也更容易把情绪转化成沟通。",
      },
      mid: {
        title: "会波动，但还能提醒自己别太快下判断",
        subtitle: "你会在情绪和理智之间来回调整",
        description:
          "你会在意，也会波动，但通常还能提醒自己不要只凭一瞬间的感觉做结论。这样的你很真实，也保留了自我修复的能力。",
      },
      low: {
        title: "更容易被模糊和不确定触发",
        subtitle: "你的敏感需要被稳定和诚实接住",
        description:
          "当关系里的信息不足、节奏变化或界限模糊时，你更容易进入反复猜测和情绪卷入。这样的你往往也更认真、更在意关系的细节。",
      },
    },
  },
  {
    key: "stabilityPreference",
    label: "稳定偏好",
    hint: "你更想要热烈还是可依赖",
    levels: {
      high: {
        title: "更偏好长期、稳定、可依赖",
        subtitle: "你更容易被持续在场和可修复打动",
        description:
          "比起一时热烈，你更在意持续的回应、稳定的陪伴和出现问题后还能继续修复的能力。这样的你通常更适合经营深关系。",
      },
      mid: {
        title: "既能欣赏热烈，也能理解稳定",
        subtitle: "你要的是有温度也有现实感的关系",
        description:
          "你不会只追求感觉，也不会把关系变成过度结构化的安排。这样的你比较有弹性，既有温度，也有现实感。",
      },
      low: {
        title: "更容易被即时的流动感打动",
        subtitle: "你会通过感觉判断关系是不是活着",
        description:
          "你不一定排斥稳定，只是你感受到关系活着，往往不是靠规则，而是靠感觉。这样的你通常更有活力，也更看重关系里的真实流动。",
      },
    },
  },
];

export const FRIENDSHIP_TRAIT_COPY_V2: V2TraitCopy[] = [
  {
    key: "connectionFrequency",
    label: "联结频率",
    hint: "你需要多高频的互动来感到关系在",
    levels: {
      high: {
        title: "需要持续的互动感",
        subtitle: "没有分享和交集时，你会自然感觉变远",
        description:
          "你比较需要持续的互动和在场感，来感受一段友情是活着的。这样的你通常很有关系感，也很愿意维系重要的人。",
      },
      mid: {
        title: "既享受联系，也能接受波动",
        subtitle: "你不会把高频当成友情成立的唯一证明",
        description:
          "你既能享受日常分享，也能接受关系因为阶段变化而出现波动。这样的你比较平衡，不容易因为一阵子安静就立刻否定关系。",
      },
      low: {
        title: "不太依赖高频互动判断亲疏",
        subtitle: "你更在意关系有没有变味，而不只是联系多少",
        description:
          "比起联系有多密，你更在意见面时的自然感、关键时刻的在场，以及关系整体有没有变味。这样的你通常更能承受节奏变化。",
      },
    },
  },
  {
    key: "emotionalHolding",
    label: "情绪承接",
    hint: "你能不能接住朋友的情绪",
    levels: {
      high: {
        title: "很能接住别人的情绪重量",
        subtitle: "你愿意在朋友难的时候留下来",
        description:
          "你面对朋友情绪时，通常更有能力停下来、理解、陪伴。这样的你很容易成为别人心里那个“难的时候可以找”的人。",
      },
      mid: {
        title: "会在陪伴和现实建议之间找平衡",
        subtitle: "你不只是安慰，也会考虑怎样帮得上",
        description:
          "你不一定总是最会安慰的那个，但你大多能用适合自己的方式让对方感觉到你在。这样的你比较稳，也比较不容易被情绪完全卷走。",
      },
      low: {
        title: "更需要一点距离来保持稳定",
        subtitle: "你不是不在乎，只是面对强烈情绪时更容易先不知所措",
        description:
          "你通常不太擅长直接进入高强度的情绪场，更习惯在缓下来之后重新靠近。这样的你边界感更清楚，但也需要让别人知道你的在乎方式。",
      },
    },
  },
  {
    key: "boundaryClarity",
    label: "边界清晰",
    hint: "你对距离和分寸有多明确",
    levels: {
      high: {
        title: "对分寸和投入范围很明确",
        subtitle: "你知道什么是自己舒服的关系方式",
        description:
          "你对友情里的时间、空间、身体感受、隐私和投入程度都有比较清楚的界限。这样的你通常不容易在人际关系里把自己耗空。",
      },
      mid: {
        title: "会根据关系和情境灵活调整",
        subtitle: "你不是按死规则来的人",
        description:
          "你理解边界的重要性，但通常会根据关系和情境做调整。这样的你比较灵活，也更有人情味。",
      },
      low: {
        title: "更容易先顺着关系走",
        subtitle: "你不会很快把边界说得很明白",
        description:
          "你更在意关系是不是自然、是不是亲近，而不是每件事都先讲清楚。这样的你通常很有亲近感，但也可能在累了之后才发现自己已经退得太后。",
      },
    },
  },
  {
    key: "repairInitiative",
    label: "修复主动",
    hint: "关系卡住时你会不会主动修回来",
    levels: {
      high: {
        title: "愿意把卡住的关系接回来",
        subtitle: "你知道深关系离不开修复意愿",
        description:
          "当关系变别扭、误会堆积或节奏卡住时，你更愿意主动把关系接回来。这样的你通常更有关系韧性，也更适合深关系。",
      },
      mid: {
        title: "会修复，但更看方式和时机",
        subtitle: "你不会立刻冲，也不会完全放着不管",
        description:
          "你不是不修复，而是更讲究方式和时机。这样的你比较稳，也更懂得拿捏彼此的承受力。",
      },
      low: {
        title: "更容易先观察或退开",
        subtitle: "你不喜欢高张力的人际处理",
        description:
          "当友情出问题时，你更容易先观察、退开，或者顺着沉默把距离拉开。这样的你比较会自我保护，但也可能让一些本来能修回来的关系慢慢散掉。",
      },
    },
  },
  {
    key: "dependability",
    label: "可靠托底",
    hint: "你在现实层面有多让人放心",
    levels: {
      high: {
        title: "把靠谱和在场看得很重",
        subtitle: "对你来说，重要的人是关键时刻靠得住的人",
        description:
          "你在友情里很重视靠谱、稳定、说到做到和现实层面的在场。这样的你很容易给别人安全感，也更容易积累深的信任。",
      },
      mid: {
        title: "有责任感，也知道不用什么都扛",
        subtitle: "你更倾向于在能力范围内稳定地在场",
        description:
          "你愿意在重要时刻出现，但不会把“永远撑住别人”变成自己的默认职责。这样的你比较健康，也比较可持续。",
      },
      low: {
        title: "更看重相处里的自然和感觉",
        subtitle: "你表达友情的方式未必是最规整的",
        description:
          "你未必会把稳定回应、明确承诺和现实托底放在最前面。这样的你通常更轻盈，但对更需要确定性的人来说，他们可能不容易第一时间读懂你的在意。",
      },
    },
  },
  {
    key: "differenceOpenness",
    label: "差异开放",
    hint: "你能不能和不同的人舒服相处",
    levels: {
      high: {
        title: "不会因为不一样就立刻关上门",
        subtitle: "你愿意先看看差异会带来什么",
        description:
          "你比较能容纳人与人之间在兴趣、消费、表达方式和生活节奏上的差异。这样的你通常更包容，也更容易遇到意料之外但很珍贵的人。",
      },
      mid: {
        title: "能开放，也保留判断",
        subtitle: "你不会什么都接，也不会一点不同就退开",
        description:
          "你能接受差异，但也保留自己的判断。这样的你比较实际，既能开放，也能保护自己的舒适区。",
      },
      low: {
        title: "更倾向于在相似的节奏里建立关系",
        subtitle: "你会把底层相处逻辑看得比较重要",
        description:
          "你通常会觉得，真正能走远的友情不一定完全一样，但底层相处逻辑不能差太远。这样的你筛选感会更强，也更容易保护自己的舒适区。",
      },
    },
  },
  {
    key: "comparisonTolerance",
    label: "比较承受",
    hint: "朋友比你走得快时你能不能稳住",
    levels: {
      high: {
        title: "更能在比较感里稳住自己",
        subtitle: "你能区分对方的光和自己的价值",
        description:
          "当朋友变得更耀眼、更顺利、更被看见时，你通常比较能稳住自己。这样的你通常比较从容，也更不容易被比较感吞掉。",
      },
      mid: {
        title: "能祝福，也知道复杂感受很正常",
        subtitle: "你不会要求自己永远只剩一种感觉",
        description:
          "你通常会在开心、复杂、被提醒和重新整理自己之间找到平衡。这样的你很真实，不会假装自己完全没感觉。",
      },
      low: {
        title: "更容易被差距和位置变化触发",
        subtitle: "你会比较认真看待关系里的平等感",
        description:
          "当朋友明显走得比你快、比你顺时，你更容易被触发、失落，或者重新评估自己和这段关系的位置。你不是小气，只是你对差距和位置变化更敏感。",
      },
    },
  },
  {
    key: "lowPressureCompanionship",
    label: "低压陪伴",
    hint: "不高频、不高热时你还能不能舒服亲近",
    levels: {
      high: {
        title: "很能接受关系里的安静和留白",
        subtitle: "不需要高热，也能感觉友情在",
        description:
          "你很能接受关系里的安静、低频和阶段性变化。对你来说，真正稳的关系往往是自然的，而不是用力维系出来的。",
      },
      mid: {
        title: "既享受互动，也能接受低压陪伴",
        subtitle: "你不需要时时黏在一起，但希望关系里仍有在场感",
        description:
          "你既能享受有来有往的互动，也能接受关系不总是高浓度。这样的你比较平衡。",
      },
      low: {
        title: "更容易通过热度感受到关系存在",
        subtitle: "低频和留白对你来说未必自然",
        description:
          "你更容易通过互动热度、分享欲和持续回应来感受到友情的存在。这样的你通常更有联结感，也更愿意主动维系重要的人。",
      },
    },
  },
];

export const ROMANCE_PROFILE_COPY_V2: V2ProfileCopy[] = [
  {
    id: "stable_connector",
    title: "稳定靠近型",
    subtitle: "你在关系里追求可依赖的在场感",
    summary: "你更容易被稳定回应、长期陪伴和清晰态度打动，关系对你来说不仅要有感觉，还要有落点。",
    strengths:
      "你通常很重视回应、修复和持续在场的感觉，也更容易在长期关系里给出认真和稳定的投入。",
    underStress:
      "当关系变得忽近忽远、节奏不稳定，或者很多事一直说不清时，你会比别人更容易感到悬着。",
    signatureTags: [
      ROMANCE_PROFILE_THEMES.stableResponse,
      ROMANCE_PROFILE_THEMES.longTermIntent,
      ROMANCE_PROFILE_THEMES.reassurance,
    ],
    themeProfile: {
      core: [ROMANCE_PROFILE_THEMES.stableResponse, ROMANCE_PROFILE_THEMES.longTermIntent],
      secondary: [ROMANCE_PROFILE_THEMES.reassurance],
      avoid: [ROMANCE_PROFILE_THEMES.aliveness, ROMANCE_PROFILE_THEMES.spaceRespect],
    },
    rules: {
      primary: [
        { key: "stabilityPreference", min: 7 },
        { key: "reassuranceNeed", min: 6 },
      ],
      secondary: [{ key: "futureOrientation", min: 5 }],
    },
  },
  {
    id: "slow_observer",
    title: "慢热观察型",
    subtitle: "你会在确认安全之后认真靠近",
    summary: "你不会轻易进入一段关系，但一旦决定靠近，通常是认真想过的。",
    strengths:
      "你更重视稳定感、持续性和对方长期的表现，不容易因为一时热度就把自己放进过深的期待里。",
    underStress:
      "如果你观察得太久、确认得太久，关系有时会停在“还差一点”的地方，错过自然展开的时机。",
    signatureTags: [
      ROMANCE_PROFILE_THEMES.slowWarmup,
      ROMANCE_PROFILE_THEMES.carefulObservation,
      ROMANCE_PROFILE_THEMES.stableResponse,
    ],
    themeProfile: {
      core: [ROMANCE_PROFILE_THEMES.slowWarmup, ROMANCE_PROFILE_THEMES.carefulObservation],
      secondary: [ROMANCE_PROFILE_THEMES.stableResponse],
      avoid: [ROMANCE_PROFILE_THEMES.emotionalCandor, ROMANCE_PROFILE_THEMES.aliveness],
    },
    rules: {
      primary: [
        { key: "approachPace", max: 4 },
        { key: "stabilityPreference", min: 6 },
      ],
      secondary: [{ key: "boundaryAutonomy", min: 5 }],
    },
  },
  {
    id: "clear_autonomy",
    title: "清醒自主型",
    subtitle: "你需要亲密，也需要完整地做自己",
    summary: "你很在意亲密关系里的自由感和完整性，不会为了靠近就轻易失去自己。",
    strengths:
      "你知道亲密不等于无边界，也知道喜欢一个人不应该以失去自己的节奏和生活重心为代价。",
    underStress:
      "当别人用高浓度陪伴、强确认或过快推进来要求你时，你可能会本能后退，先把自己收回来。",
    signatureTags: [
      ROMANCE_PROFILE_THEMES.personalBoundary,
      ROMANCE_PROFILE_THEMES.selfPacedCloseness,
      ROMANCE_PROFILE_THEMES.spaceRespect,
    ],
    themeProfile: {
      core: [ROMANCE_PROFILE_THEMES.personalBoundary, ROMANCE_PROFILE_THEMES.selfPacedCloseness],
      secondary: [ROMANCE_PROFILE_THEMES.spaceRespect],
      avoid: [ROMANCE_PROFILE_THEMES.explicitReassurance, ROMANCE_PROFILE_THEMES.reassurance],
    },
    rules: {
      primary: [
        { key: "boundaryAutonomy", min: 7 },
        { key: "reassuranceNeed", max: 5 },
      ],
      secondary: [{ key: "jealousyRegulation", min: 5 }],
    },
  },
  {
    id: "direct_expressor",
    title: "直接表达型",
    subtitle: "你相信说出来比猜来猜去更接近爱",
    summary: "你更愿意把感受带进关系里，而不是让重要情绪长期积在心里。",
    strengths:
      "你愿意表达需要、失落、在意和不舒服，也更愿意进入修复。对你来说，沟通不是关系的风险，而是关系变真实的方式。",
    underStress:
      "当对方总是回避、模糊或拖延，你会比别人更容易感到挫败，因为你真正想要的是问题被认真面对。",
    signatureTags: [
      ROMANCE_PROFILE_THEMES.emotionalCandor,
      ROMANCE_PROFILE_THEMES.directRepair,
      ROMANCE_PROFILE_THEMES.problemFacing,
    ],
    themeProfile: {
      core: [ROMANCE_PROFILE_THEMES.emotionalCandor, ROMANCE_PROFILE_THEMES.directRepair],
      secondary: [ROMANCE_PROFILE_THEMES.problemFacing],
      avoid: [ROMANCE_PROFILE_THEMES.carefulObservation, ROMANCE_PROFILE_THEMES.spaceRespect],
    },
    rules: {
      primary: [
        { key: "emotionalExpression", min: 7 },
        { key: "conflictEngagement", min: 7 },
      ],
    },
  },
  {
    id: "gentle_repair",
    title: "温柔修复型",
    subtitle: "你愿意把重要的关系慢慢修回来",
    summary: "你很在意关系里的气氛和感受，也愿意为了重要的人把断掉的部分重新接起来。",
    strengths:
      "你不是那种凡事硬碰硬的人，但通常会在合适的时候、用不伤人的方式把问题带回来，让关系继续往前走。",
    underStress:
      "当你一边顾及关系、一边顾及感受、一边还在找合适时机时，也可能把自己放得太后面。",
    signatureTags: [
      ROMANCE_PROFILE_THEMES.gentleRepair,
      ROMANCE_PROFILE_THEMES.emotionalCare,
      ROMANCE_PROFILE_THEMES.keepConnection,
    ],
    themeProfile: {
      core: [ROMANCE_PROFILE_THEMES.gentleRepair, ROMANCE_PROFILE_THEMES.keepConnection],
      secondary: [ROMANCE_PROFILE_THEMES.emotionalCare],
      avoid: [ROMANCE_PROFILE_THEMES.problemFacing, ROMANCE_PROFILE_THEMES.aliveness],
    },
    rules: {
      primary: [
        { key: "conflictEngagement", min: 6 },
        { key: "emotionalExpression", min: 5, max: 8 },
      ],
      secondary: [{ key: "stabilityPreference", min: 6 }],
    },
  },
  {
    id: "present_experience",
    title: "当下体验型",
    subtitle: "你更相信关系要先活起来，再慢慢长出来",
    summary: "你很看重关系里的真实感觉和生命力，喜欢让连接在相处里自然长出来。",
    strengths:
      "你不太会被过重的框架和定义绑住，更容易感受到关系里的活力、流动和即时互动的魅力。",
    underStress:
      "当关系逐渐进入现实、承诺和长期结构时，你可能会本能地把节奏放慢，想先确认自己有没有被压得太重。",
    signatureTags: [
      ROMANCE_PROFILE_THEMES.presentFeeling,
      ROMANCE_PROFILE_THEMES.aliveness,
      ROMANCE_PROFILE_THEMES.flowSense,
    ],
    themeProfile: {
      core: [ROMANCE_PROFILE_THEMES.presentFeeling, ROMANCE_PROFILE_THEMES.aliveness],
      secondary: [ROMANCE_PROFILE_THEMES.flowSense],
      avoid: [ROMANCE_PROFILE_THEMES.longTermIntent, ROMANCE_PROFILE_THEMES.futurePlanning],
    },
    rules: {
      primary: [
        { key: "approachPace", min: 6 },
        { key: "futureOrientation", max: 5 },
      ],
      secondary: [{ key: "stabilityPreference", max: 6 }],
    },
  },
  {
    id: "deep_reassurance",
    title: "深度确认型",
    subtitle: "你不是不敢爱，你只是需要更明确的回应",
    summary: "对你来说，被认真对待和被放在心上很重要，你会通过回应、态度和持续性来判断关系值不值得继续放进去。",
    strengths:
      "你对关系里的温差、细节和回应变化通常比较敏锐，也因此更认真、更珍惜双向确认。",
    underStress:
      "当信息不足、回应变少或关系状态模糊时，你会更容易自己反复推演，需要稳定和诚实来接住这种敏感。",
    signatureTags: [
      ROMANCE_PROFILE_THEMES.explicitReassurance,
      ROMANCE_PROFILE_THEMES.sensitivityToSignals,
      ROMANCE_PROFILE_THEMES.settledAfterConfirmation,
    ],
    themeProfile: {
      core: [ROMANCE_PROFILE_THEMES.explicitReassurance, ROMANCE_PROFILE_THEMES.settledAfterConfirmation],
      secondary: [ROMANCE_PROFILE_THEMES.sensitivityToSignals],
      avoid: [ROMANCE_PROFILE_THEMES.spaceRespect, ROMANCE_PROFILE_THEMES.aliveness],
    },
    rules: {
      primary: [
        { key: "reassuranceNeed", min: 7 },
        { key: "stabilityPreference", min: 6 },
      ],
      secondary: [{ key: "jealousyRegulation", max: 6 }],
    },
  },
  {
    id: "long_term_builder",
    title: "长线共建型",
    subtitle: "你会自然地把喜欢放进未来里考虑",
    summary: "你在关系里更看重方向感，而不只是感觉，喜欢会自然延伸成现实层面的共同规划。",
    strengths:
      "你对关系的认真，不只体现在情绪上，也体现在长期视角、现实判断和共同生活的想象力上。",
    underStress:
      "如果对方始终停留在模糊、回避或只谈当下的状态里，你可能会慢慢失去耐心，因为你需要关系有方向。",
    signatureTags: [
      ROMANCE_PROFILE_THEMES.futurePlanning,
      ROMANCE_PROFILE_THEMES.sharedPlanning,
      ROMANCE_PROFILE_THEMES.directionSense,
    ],
    themeProfile: {
      core: [ROMANCE_PROFILE_THEMES.futurePlanning, ROMANCE_PROFILE_THEMES.directionSense],
      secondary: [ROMANCE_PROFILE_THEMES.sharedPlanning],
      avoid: [ROMANCE_PROFILE_THEMES.presentFeeling, ROMANCE_PROFILE_THEMES.flowSense],
    },
    rules: {
      primary: [
        { key: "futureOrientation", min: 7 },
        { key: "stabilityPreference", min: 6 },
      ],
      secondary: [{ key: "conflictEngagement", min: 5 }],
    },
  },
];

export const FRIENDSHIP_PROFILE_COPY_V2: V2ProfileCopy[] = [
  {
    id: "steady_anchor",
    title: "稳定托底型",
    subtitle: "你把靠谱和在场看得很重",
    summary: "对你来说，真正重要的人不只是聊得来而已，而是关键时刻靠得住。",
    strengths:
      "你通常有责任感，也愿意在现实层面为关系留位置。你的友情不一定最热闹，但常常最让人安心。",
    underStress:
      "当别人反复失约、敷衍、只索取不回应时，你会比别人更容易失望，因为你在乎的从来不只是感觉。",
    signatureTags: [
      FRIENDSHIP_PROFILE_THEMES.reliablePresence,
      FRIENDSHIP_PROFILE_THEMES.showUpWhenNeeded,
      FRIENDSHIP_PROFILE_THEMES.steadySupport,
    ],
    themeProfile: {
      core: [FRIENDSHIP_PROFILE_THEMES.reliablePresence, FRIENDSHIP_PROFILE_THEMES.steadySupport],
      secondary: [FRIENDSHIP_PROFILE_THEMES.showUpWhenNeeded],
      avoid: [FRIENDSHIP_PROFILE_THEMES.canStayWithoutNoise, FRIENDSHIP_PROFILE_THEMES.approachAcrossDifference],
    },
    rules: {
      primary: [
        { key: "dependability", min: 7 },
        { key: "boundaryClarity", min: 5 },
      ],
    },
  },
  {
    id: "low_pressure_long_flow",
    title: "低压长流型",
    subtitle: "你相信舒服比热闹更能留住关系",
    summary: "你不需要高频热闹来证明友情成立，真正舒服的关系在你这里往往是自然、松弛、能放着也不会断的。",
    strengths:
      "你很能容纳人生阶段变化，也比较不容易因为联系波动就立刻否定关系，适合那种安静但稳的长期陪伴。",
    underStress:
      "你有时太能理解变化，也太能给空间，结果把一些本来值得被说清楚的失落也一起放过去了。",
    signatureTags: [
      FRIENDSHIP_PROFILE_THEMES.lowPressureCompany,
      FRIENDSHIP_PROFILE_THEMES.comfortOverHeat,
      FRIENDSHIP_PROFILE_THEMES.canStayWithoutNoise,
    ],
    themeProfile: {
      core: [FRIENDSHIP_PROFILE_THEMES.lowPressureCompany, FRIENDSHIP_PROFILE_THEMES.canStayWithoutNoise],
      secondary: [FRIENDSHIP_PROFILE_THEMES.comfortOverHeat],
      avoid: [FRIENDSHIP_PROFILE_THEMES.proactiveContact, FRIENDSHIP_PROFILE_THEMES.steadySupport],
    },
    rules: {
      primary: [
        { key: "lowPressureCompanionship", min: 7 },
        { key: "connectionFrequency", max: 5 },
      ],
    },
  },
  {
    id: "gentle_holder",
    title: "温柔接住型",
    subtitle: "你愿意在别人脆弱的时候留下来",
    summary: "你很能感受到别人情绪里的重量，也愿意在对方难的时候停下来陪着。",
    strengths:
      "你面对朋友的脆弱时，通常不会急着转移、教育或下结论，而更愿意先接住。这样的你会让人觉得自己是被看见的。",
    underStress:
      "如果你长期接住很多人的情绪，却没有自己的出口，也可能在不知不觉中变得疲惫。",
    signatureTags: [
      FRIENDSHIP_PROFILE_THEMES.emotionalHolding,
      FRIENDSHIP_PROFILE_THEMES.stayWithFragility,
      FRIENDSHIP_PROFILE_THEMES.gentleContainment,
    ],
    themeProfile: {
      core: [FRIENDSHIP_PROFILE_THEMES.emotionalHolding, FRIENDSHIP_PROFILE_THEMES.gentleContainment],
      secondary: [FRIENDSHIP_PROFILE_THEMES.stayWithFragility],
      avoid: [FRIENDSHIP_PROFILE_THEMES.clearBoundary, FRIENDSHIP_PROFILE_THEMES.notOverIdealize],
    },
    rules: {
      primary: [
        { key: "emotionalHolding", min: 7 },
        { key: "dependability", min: 5 },
      ],
    },
  },
  {
    id: "clear_boundary",
    title: "边界清明型",
    subtitle: "你重视亲近，也重视彼此舒服",
    summary: "你对友情里的距离、投入和可承受范围通常比较清楚，不会因为关系亲近就自动取消边界。",
    strengths:
      "你知道什么是你能给的，什么是你不能给的，也知道尊重别人和保护自己并不冲突。",
    underStress:
      "有些人可能会觉得你冷静、克制，甚至不够黏，但其实你只是希望关系在舒服和尊重里长久。",
    signatureTags: [
      FRIENDSHIP_PROFILE_THEMES.clearBoundary,
      FRIENDSHIP_PROFILE_THEMES.mutualEase,
      FRIENDSHIP_PROFILE_THEMES.respectMeasure,
    ],
    themeProfile: {
      core: [FRIENDSHIP_PROFILE_THEMES.clearBoundary, FRIENDSHIP_PROFILE_THEMES.respectMeasure],
      secondary: [FRIENDSHIP_PROFILE_THEMES.mutualEase],
      avoid: [FRIENDSHIP_PROFILE_THEMES.proactiveContact, FRIENDSHIP_PROFILE_THEMES.emotionalHolding],
    },
    rules: {
      primary: [
        { key: "boundaryClarity", min: 7 },
        { key: "lowPressureCompanionship", min: 5 },
      ],
    },
  },
  {
    id: "active_maintainer",
    title: "主动维系型",
    subtitle: "你会用行动把重要关系留在生活里",
    summary: "你对关系有明显的在场感，也愿意用行动、联系和修复把友情留在生活里。",
    strengths:
      "你通常不是等关系自己运转的人。你会主动联系、主动接话、主动递台阶，也更愿意把卡住的关系重新接起来。",
    underStress:
      "当你总在维系，而别人长期不接、不回、不补位时，你会比别人更容易觉得心累。",
    signatureTags: [
      FRIENDSHIP_PROFILE_THEMES.proactiveContact,
      FRIENDSHIP_PROFILE_THEMES.proactiveRepair,
      FRIENDSHIP_PROFILE_THEMES.keepFriendshipAlive,
    ],
    themeProfile: {
      core: [FRIENDSHIP_PROFILE_THEMES.proactiveContact, FRIENDSHIP_PROFILE_THEMES.proactiveRepair],
      secondary: [FRIENDSHIP_PROFILE_THEMES.keepFriendshipAlive],
      avoid: [FRIENDSHIP_PROFILE_THEMES.canStayWithoutNoise, FRIENDSHIP_PROFILE_THEMES.clearBoundary],
    },
    rules: {
      primary: [
        { key: "connectionFrequency", min: 7 },
        { key: "repairInitiative", min: 7 },
      ],
    },
  },
  {
    id: "difference_friendly",
    title: "差异包容型",
    subtitle: "你愿意让不同的人慢慢走近你",
    summary: "你不太急着按相似度筛人，而更愿意看看一个不同的人能不能慢慢走近。",
    strengths:
      "你对差异有耐心，也愿意在不完全同频的前提下寻找新的连接方式，更容易拥有来源不同、气质不同的朋友。",
    underStress:
      "如果你一直接受差异、迁就差异，也可能偶尔忽略一个事实：有些差异是新鲜，有些差异会长期消耗你。",
    signatureTags: [
      FRIENDSHIP_PROFILE_THEMES.tolerateDifference,
      FRIENDSHIP_PROFILE_THEMES.approachAcrossDifference,
      FRIENDSHIP_PROFILE_THEMES.relationalElasticity,
    ],
    themeProfile: {
      core: [FRIENDSHIP_PROFILE_THEMES.tolerateDifference, FRIENDSHIP_PROFILE_THEMES.relationalElasticity],
      secondary: [FRIENDSHIP_PROFILE_THEMES.approachAcrossDifference],
      avoid: [FRIENDSHIP_PROFILE_THEMES.clearBoundary, FRIENDSHIP_PROFILE_THEMES.steadySupport],
    },
    rules: {
      primary: [{ key: "differenceOpenness", min: 7 }],
    },
  },
  {
    id: "balanced_realist",
    title: "真实平衡型",
    subtitle: "你能容纳友情里的复杂和变化",
    summary: "你对友情没有特别理想化，也不会把复杂情绪当成关系失败。",
    strengths:
      "当朋友发展得比你好、阶段比你顺、生活比你亮时，你通常能承认心里不止一种感觉，也会慢慢把自己放回平衡的位置。",
    underStress:
      "如果你长期处在失衡期，比较感还是可能慢慢侵入关系，这时候你同样需要被自己的节奏和价值感接住。",
    signatureTags: [
      FRIENDSHIP_PROFILE_THEMES.holdComplexity,
      FRIENDSHIP_PROFILE_THEMES.staySteadyInComparison,
      FRIENDSHIP_PROFILE_THEMES.notOverIdealize,
    ],
    themeProfile: {
      core: [FRIENDSHIP_PROFILE_THEMES.holdComplexity, FRIENDSHIP_PROFILE_THEMES.staySteadyInComparison],
      secondary: [FRIENDSHIP_PROFILE_THEMES.notOverIdealize],
      avoid: [FRIENDSHIP_PROFILE_THEMES.proactiveContact, FRIENDSHIP_PROFILE_THEMES.gentleContainment],
    },
    rules: {
      primary: [
        { key: "comparisonTolerance", min: 7 },
        { key: "boundaryClarity", min: 5 },
      ],
    },
  },
  {
    id: "deep_companion",
    title: "深度同行型",
    subtitle: "你要的不是热络，而是长期理解",
    summary: "对你来说，真正重要的友情不是热不热闹，而是彼此能不能在很长时间里互相看见、互相理解。",
    strengths:
      "你珍惜的不是很多人，而是少数那些能跟你一起走过不同阶段的人。这样的你更适合深关系，而不是只停留在表层热络。",
    underStress:
      "因为你对友情的质量要求高，所以一旦关系只剩礼貌、表面和功能性联系，你会比别人更快感觉到已经不是原来的那种在一起了。",
    signatureTags: [
      FRIENDSHIP_PROFILE_THEMES.longTermUnderstanding,
      FRIENDSHIP_PROFILE_THEMES.deepCompanionship,
      FRIENDSHIP_PROFILE_THEMES.qualityMatters,
    ],
    themeProfile: {
      core: [FRIENDSHIP_PROFILE_THEMES.longTermUnderstanding, FRIENDSHIP_PROFILE_THEMES.deepCompanionship],
      secondary: [FRIENDSHIP_PROFILE_THEMES.qualityMatters],
      avoid: [FRIENDSHIP_PROFILE_THEMES.comfortOverHeat, FRIENDSHIP_PROFILE_THEMES.approachAcrossDifference],
    },
    rules: {
      primary: [
        { key: "dependability", min: 6 },
        { key: "emotionalHolding", min: 6 },
      ],
      secondary: [{ key: "lowPressureCompanionship", min: 5 }],
    },
  },
];
