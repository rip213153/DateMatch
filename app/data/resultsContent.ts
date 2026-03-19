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
