import type { PersonalityTraits } from "@/app/data/types";

// 针对不同维度和关系的文案库 
export const ICE_BREAKERS = {
  // 当双方都爱卷学业
  academic: [
    "听说锦绣楼的座位比奶茶还难排？要不要明晚去拼个桌？",
    "同为考研/保研/期末党的战友，要不要交换一下复习资料？",
    "听说你也是丹青楼的常驻选手，这周我有几道题卡住了，求大佬带带！",
    "图书馆占座小分队招募新成员！你负责占座，我负责带零食，怎么样？",
    "听说你也在准备XX考试，要不要组个学习搭子，互相监督？",
  ],
  // 当双方社交风格互补 (e + i)
  social_complementary: [
    "听说你是 i 人，我是 e 人，正好互补！要不要出来喝杯咖啡，我负责分享，你负责倾听？",
    "算法说我们性格完美互补，正好我想找个人带我避开社交恐惧，敢不敢挑战一下？",
    "i人和e人的完美组合！一个负责社交，一个负责观察，一起去参加社团活动怎么样？",
    "听说你有点社恐，别担心，我负责找话题，你只需要微笑就好～",
    "我们性格互补，正好可以一起完成小组作业，你负责深度思考，我负责快速执行！",
  ],
  // 针对共同爱好 (例如都有摄影/Citywalk标签)
  hobby_shared: [
    "刚看你主页也有 photography 标签，东林哪里的光影最好看？求大佬指点！",
    "Citywalk 爱好者集合！这周末哈尔滨没那么冷，要不要一起去暴走？",
    "发现我们都是图书馆常客，要不要一起找个靠窗的位置，各自看书互相陪伴？",
    "听说你也喜欢在XX咖啡馆自习，要不要约个时间，来个'无声的陪伴'？",
    "看到你也喜欢XX（电影/音乐/书籍），最近有什么新发现吗？想听听你的推荐！",
  ],
  // 针对美食爱好者
  foodie: [
    "听说东林新开了家XX餐厅，要不要一起去打卡？我请客，你负责尝鲜！",
    "干饭人集合！看到你也喜欢XX美食，要不要一起组个美食探店小分队？",
    "听说食堂新出了XX菜品，要不要一起去尝尝？我负责拍照，你负责品尝～",
    "美食爱好者集合！看到你也喜欢XX小吃，要不要一起探索东林周边的美食地图？",
    "听说你也是吃货，要不要来个美食交换？我带XX，你带XX？",
  ],
  // 针对运动爱好者
  sports: [
    "看到你也喜欢运动，要不要一起约个健身房？互相监督，一起变瘦！",
    "听说你也喜欢XX运动，要不要找个时间切磋一下？我保证不输太多～",
    "运动搭子招募！看到你也喜欢晨跑/夜跑，要不要一起加入'健康生活'计划？",
    "健身房遇见同好！看到你也喜欢XX器械，要不要一起制定个训练计划？",
    "运动爱好者集合！听说你也喜欢XX运动，要不要找个时间一起挥洒汗水？",
  ],
  // 针对文艺青年
  arts: [
    "看到你也喜欢XX（音乐/电影/书籍），最近有什么新发现吗？想听听你的推荐！",
    "文艺青年集合！看到你也喜欢XX艺术，要不要一起去看场展览/电影？",
    "听说你也喜欢XX（绘画/摄影/写作），要不要找个时间一起创作？",
    "看到你也喜欢XX（博物馆/美术馆/展览），要不要一起去打卡？我负责讲解，你负责拍照～",
    "文艺搭子招募！看到你也喜欢XX，要不要一起参加个文艺活动？",
  ],
  // 针对游戏爱好者
  gaming: [
    "看到你也喜欢XX游戏，要不要来场友谊赛？我保证不坑你～",
    "游戏搭子招募！看到你也喜欢XX游戏，要不要一起开黑？",
    "听说你也喜欢XX游戏，要不要找个时间一起上分？我负责carry，你负责躺～",
    "游戏爱好者集合！看到你也喜欢XX，要不要一起开黑？",
    "看到你也喜欢单机/网游，要不要一起体验XX游戏？我负责攻略，你负责操作！",
  ],
  // 针对旅行爱好者
  travel: [
    "看到你也喜欢旅行，要不要一起规划个短途旅行？我负责攻略，你负责拍照～",
    "旅行搭子招募！看到你也喜欢XX目的地，要不要一起出发？",
    "听说你也喜欢自驾游/徒步/骑行，要不要找个时间一起出发？",
    "看到你也喜欢探索新地方，要不要一起打卡东林周边的景点？",
    "旅行爱好者集合！看到你也喜欢XX，要不要一起计划下一次旅行？",
  ],
  // 针对宠物爱好者
  pets: [
    "看到你也喜欢小动物，要不要一起去看萌宠？我负责投喂，你负责拍照～",
    "宠物搭子招募！看到你也喜欢XX（猫/狗），要不要一起遛弯？",
    "听说你也喜欢小动物，要不要一起参加个宠物活动？",
    "看到你也喜欢XX宠物，要不要一起照顾它？我负责买零食，你负责陪玩～",
    "宠物爱好者集合！看到你也喜欢小动物，要不要一起养一只？",
  ],
};

// 匹配亮点文案库
export const HIGHLIGHTS = {
  personality: [
    "性格高度契合，像是从同一个模具刻出来的",
    "灵魂频率共振，你们的相处模式会非常舒适",
    "互补张力强，一个负责整活一个负责稳住",
    "默契值爆表，一个眼神就能懂对方在想什么",
    "性格互补又互补，简直是天造地设的一对",
    "性格相似度高，相处起来毫无压力",
    "性格互补，一个负责主导一个负责配合",
  ],
  lifestyle: [
    "生活节奏神同步，都是不熬夜的养生派",
    "干饭搭子首选，吃得到一起才能聊得到一起",
    "周末作息一致，简直是为周末约会而生",
    "作息规律，都喜欢早睡早起，健康生活从今天开始",
    "生活态度一致，都追求简单而美好的日常",
    "生活节奏相似，都懂得平衡工作和生活",
    "生活方式相近，都注重生活的品质",
  ],
  interests: [
    "兴趣爱好高度重合，一起玩永远不会腻",
    "共同话题满满，聊几天几夜都不会冷场",
    "兴趣互补，一个负责尝试一个负责精通",
    "兴趣爱好相似，一起探索新事物永远不会腻",
    "共同兴趣广泛，从XX到XX都有共同话题",
    "兴趣爱好相似，总能找到一起做的事情",
    "共同话题多，从兴趣爱好聊到人生理想",
    "兴趣重合度高，一起玩永远不会无聊",
    "共同兴趣多，总能找到一起做的事情",
    "兴趣爱好相似，一起探索新事物永远不会腻",
  ],
  values: [
    "价值观高度一致，看问题的角度都差不多",
    "人生观相似，都追求简单而有意义的生活",
    "价值观互补，一个负责理想一个负责现实",
    "人生目标一致，都希望过上简单而幸福的生活",
    "价值观契合，都重视真诚和信任",
    "价值观相似，对生活有相似的理解",
    "人生观一致，都追求简单而充实的生活",
    "价值观相近，对生活有相似的期待",
    "人生观相似，都追求简单而美好的日常",
    "价值观一致，对生活有相似的理解",
  ],
  compatibility: [
    "综合匹配度高达XX%，简直是天作之合",
    " compatibility score: XX%，算法说你们很配",
    "匹配度爆表，简直是为彼此而生",
    "综合评估：完美搭档，适合长期发展",
    "匹配度极高，建议尽快开始互动",
    "综合匹配度高，是难得的合适人选",
    "匹配度优秀，是理想的约会对象",
    "匹配度超高，简直是为彼此而生",
    "综合评估：天作之合，适合长期发展",
    "匹配度极高，建议尽快开始互动",
  ],
};

// 破冰文案库 - 情感准备度
export const ICE_BREAKERS_EMOTIONAL = {
  mature: [
    "看到我们都对感情比较认真，不如先聊聊最近让你感到温暖的一件事？",
    "感情观相似，不如聊聊你对理想关系的期待？",
    "都比较成熟，不如来场深度对话，交换彼此的故事？",
    "感情观一致，不如聊聊你最近在忙什么？",
    "都重视感情，不如聊聊你对未来生活的规划？",
  ],
  slow: [
    "看来我们都比较慢热，不如先从朋友做起，慢慢了解？",
    "慢热型选手集合！不如先从简单的自我介绍开始？",
    "都比较慢热，不如来个'慢慢了解'计划？",
    "慢热但认真，不如聊聊你最近看的一本书？",
    "都习惯慢慢了解，不如先交换一下兴趣爱好？",
  ],
};

// 破冰文案库 - 约会风格
export const ICE_BREAKERS_DATE = {
  natural: [
    "看来我们都喜欢自然轻松的约会氛围，要不要找个安静的地方，边走边聊？",
    "都喜欢自然派，不如来个'说走就走'的散步约会？",
    "自然派约会爱好者集合！不如聊聊你理想中的约会场景？",
    "都喜欢轻松自然，不如来个'无目的'的散步？",
    "自然派约会，不如聊聊你最近发现的好地方？",
  ],
  active: [
    "看到我们都喜欢主动制造火花，不如来个'谁先发起邀约'挑战？",
    "主动型选手集合！不如来个'谁先发起邀约'挑战？",
    "都喜欢主动，不如来个'谁先发起邀约'挑战？",
    "主动制造火花，不如聊聊你最近想尝试的新事物？",
    "都喜欢主动，不如来个'谁先发起邀约'挑战？",
  ],
};

// 破冰文案库 - 承诺倾向
export const ICE_BREAKERS_COMMITMENT = {
  serious: [
    "看到我们都重视承诺，不如聊聊你对未来理想关系的期待？",
    "都重视承诺，不如聊聊你对长期关系的看法？",
    "承诺观一致，不如聊聊你对未来生活的规划？",
    "都重视承诺，不如聊聊你最近在努力的目标？",
    "承诺感强，不如聊聊你对未来伴侣的期待？",
  ],
};

// 破冰文案库 - 沟通能力
export const ICE_BREAKERS_COMMUNICATION = {
  good: [
    "听说我们都善于沟通，不如来场深度对话，交换最近的一首好听的歌？",
    "都善于沟通，不如来场'深度对话'挑战？",
    "沟通能力在线，不如聊聊你最近看的一部电影？",
    "都善于表达，不如来个'交换故事'时间？",
    "沟通顺畅，不如聊聊你最近在忙什么？",
  ],
};

// 破冰文案库 - 独立性
export const ICE_BREAKERS_INDEPENDENCE = {
  independent: [
    "看到我们都比较独立，不如一起制定个'独立但不孤单'计划？",
    "独立型选手集合！不如聊聊你最近独立完成的一件事？",
    "都比较独立，不如来个'独立但不孤单'计划？",
    "独立但不孤单，不如聊聊你最近的独立生活？",
    "都习惯独立，不如聊聊你最近的独立时光？",
  ],
};

// 破冰文案库 - 事业心
export const ICE_BREAKERS_CAREER = {
  career: [
    "看到我们都比较有事业心，不如聊聊你最近在忙什么项目？",
    "事业心爆棚！不如聊聊你最近在努力的目标？",
    "都比较有事业心，不如聊聊你对未来职业的规划？",
    "事业型选手集合！不如聊聊你最近在忙什么？",
    "都重视事业，不如聊聊你最近的职场经历？",
  ],
};

// 破冰文案库 - 灵活性
export const ICE_BREAKERS_FLEXIBILITY = {
  flexible: [
    "看到我们都比较灵活，不如来个'说走就走'的小冒险？",
    "灵活型选手集合！不如聊聊你最近的即兴计划？",
    "都比较灵活，不如来个'说走就走'的小冒险？",
    "都善于变通，不如聊聊你最近的即兴经历？",
    "灵活应变，不如聊聊你最近的即兴计划？",
  ],
};

// 破冰文案库 - 社交风格
export const ICE_BREAKERS_SOCIAL = {
  quiet: [
    "看到我们都比较安静，不如找个安静的地方，来场深度对话？",
    "安静型选手集合！不如聊聊你最近看的一本书？",
    "都比较安静，不如来个'深度对话'时间？",
    "都喜欢安静，不如聊聊你最近的独处时光？",
    "安静但有趣，不如聊聊你最近的思考？",
  ],
  active: [
    "看到我们都比较外向，不如来个'社交挑战'？",
    "外向型选手集合！不如聊聊你最近的社交经历？",
    "都比较外向，不如来个'社交挑战'？",
    "都喜欢社交，不如聊聊你最近认识的新朋友？",
    "都善于社交，不如聊聊你最近的社交活动？",
  ],
};

// 核心函数：根据 profile 动态生成破冰文案
export function getIceBreaker(
  pA: PersonalityTraits,
  pB: PersonalityTraits,
  tagsA: string[],
  tagsB: string[]
): string {
  void tagsA;
  void tagsB;
  // 1. 检测性格互补（社交风格差异大）
  if (Math.abs(pA.socialStyle - pB.socialStyle) > 3) {
    return ICE_BREAKERS.social_complementary[Math.floor(Math.random() * ICE_BREAKERS.social_complementary.length)];
  }

  // 2. 检测情感准备度（都比较成熟）
  if (pA.emotionalReadiness >= 7 && pB.emotionalReadiness >= 7) {
    return "看到我们都对感情比较认真，不如先聊聊最近让你感到温暖的一件事？";
  }

  // 3. 检测约会风格（都喜欢自然派）
  if (pA.dateStyle <= 5 && pB.dateStyle <= 5) {
    return "看来我们都喜欢自然轻松的约会氛围，要不要找个安静的地方，边走边聊？";
  }

  // 4. 检测承诺倾向（都比较认真）
  if (pA.commitment >= 7 && pB.commitment >= 7) {
    return "看到我们都重视承诺，不如聊聊你对未来理想关系的期待？";
  }

  // 5. 检测沟通能力（都善于沟通）
  if (pA.communication >= 7 && pB.communication >= 7) {
    return "听说我们都善于沟通，不如来场深度对话，交换最近的一首好听的歌？";
  }

  // 6. 检测独立性（都比较独立）
  if (pA.independence >= 7 && pB.independence >= 7) {
    return "看到我们都比较独立，不如一起制定个'独立但不孤单'计划？";
  }

  // 7. 检测事业心（都比较有事业心）
  if (pA.career >= 7 && pB.career >= 7) {
    return "看到我们都比较有事业心，不如聊聊你最近在忙什么项目？";
  }

  // 8. 检测灵活性（都比较灵活）
  if (pA.flexibility >= 7 && pB.flexibility >= 7) {
    return "看到我们都比较灵活，不如来个'说走就走'的小冒险？";
  }

  // 9. 检测情感准备度低（都比较慢热）
  if (pA.emotionalReadiness <= 4 && pB.emotionalReadiness <= 4) {
    return "看来我们都比较慢热，不如先从朋友做起，慢慢了解？";
  }

  // 10. 检测社交风格（都喜欢安静）
  if (pA.socialStyle <= 4 && pB.socialStyle <= 4) {
    return "看到我们都比较安静，不如找个安静的地方，来场深度对话？";
  }

  // 11. 检测约会风格（都喜欢主动）
  if (pA.dateStyle >= 7 && pB.dateStyle >= 7) {
    return "看到我们都喜欢主动制造火花，不如来个'谁先发起邀约'挑战？";
  }

  // 12. 兜底返回
  return "既然匹配度这么高，说明咱们审美很像，先从交换最近的一首好听的歌开始吧？";
}

// 根据八维属性获取破冰文案
export function getIceBreakerByTraits(
  pA: PersonalityTraits,
  pB: PersonalityTraits
): string {
  // 1. 检测性格互补（社交风格差异大）
  if (Math.abs(pA.socialStyle - pB.socialStyle) > 3) {
    return ICE_BREAKERS.social_complementary[Math.floor(Math.random() * ICE_BREAKERS.social_complementary.length)];
  }

  // 2. 检测情感准备度（都比较成熟）
  if (pA.emotionalReadiness >= 7 && pB.emotionalReadiness >= 7) {
    return ICE_BREAKERS_EMOTIONAL.mature[Math.floor(Math.random() * ICE_BREAKERS_EMOTIONAL.mature.length)];
  }

  // 3. 检测约会风格（都喜欢自然派）
  if (pA.dateStyle <= 5 && pB.dateStyle <= 5) {
    return ICE_BREAKERS_DATE.natural[Math.floor(Math.random() * ICE_BREAKERS_DATE.natural.length)];
  }

  // 4. 检测承诺倾向（都比较认真）
  if (pA.commitment >= 7 && pB.commitment >= 7) {
    return ICE_BREAKERS_COMMITMENT.serious[Math.floor(Math.random() * ICE_BREAKERS_COMMITMENT.serious.length)];
  }

  // 5. 检测沟通能力（都善于沟通）
  if (pA.communication >= 7 && pB.communication >= 7) {
    return ICE_BREAKERS_COMMUNICATION.good[Math.floor(Math.random() * ICE_BREAKERS_COMMUNICATION.good.length)];
  }

  // 6. 检测独立性（都比较独立）
  if (pA.independence >= 7 && pB.independence >= 7) {
    return ICE_BREAKERS_INDEPENDENCE.independent[Math.floor(Math.random() * ICE_BREAKERS_INDEPENDENCE.independent.length)];
  }

  // 7. 检测事业心（都比较有事业心）
  if (pA.career >= 7 && pB.career >= 7) {
    return ICE_BREAKERS_CAREER.career[Math.floor(Math.random() * ICE_BREAKERS_CAREER.career.length)];
  }

  // 8. 检测灵活性（都比较灵活）
  if (pA.flexibility >= 7 && pB.flexibility >= 7) {
    return ICE_BREAKERS_FLEXIBILITY.flexible[Math.floor(Math.random() * ICE_BREAKERS_FLEXIBILITY.flexible.length)];
  }

  // 9. 检测情感准备度低（都比较慢热）
  if (pA.emotionalReadiness <= 4 && pB.emotionalReadiness <= 4) {
    return ICE_BREAKERS_EMOTIONAL.slow[Math.floor(Math.random() * ICE_BREAKERS_EMOTIONAL.slow.length)];
  }

  // 10. 检测社交风格（都喜欢安静）
  if (pA.socialStyle <= 4 && pB.socialStyle <= 4) {
    return ICE_BREAKERS_SOCIAL.quiet[Math.floor(Math.random() * ICE_BREAKERS_SOCIAL.quiet.length)];
  }

  // 11. 检测约会风格（都喜欢主动）
  if (pA.dateStyle >= 7 && pB.dateStyle >= 7) {
    return ICE_BREAKERS_DATE.active[Math.floor(Math.random() * ICE_BREAKERS_DATE.active.length)];
  }

  // 12. 兜底返回
  return "既然匹配度这么高，说明咱们审美很像，先从交换最近的一首好听的歌开始吧？";
}

// 根据匹配维度获取亮点文案
export function getHighlightText(type: "personality" | "lifestyle" | "interests" | "values" | "compatibility", index: number = 0): string {
  const texts = HIGHLIGHTS[type];
  return texts[index % texts.length];
}
