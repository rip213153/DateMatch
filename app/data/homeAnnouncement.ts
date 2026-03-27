export type HomeAnnouncementBlock = {
  title: string;
  content: string;
};

export type HomeAnnouncement = {
  enabled: boolean;
  badge: string;
  title: string;
  updatedAt: string;
  summary: string;
  blocks: HomeAnnouncementBlock[];
  ctaText?: string;
  ctaHref?: string;
};

export const homeAnnouncement: HomeAnnouncement = {
  enabled: true,
  badge: "更新公告",
  title: "DateMatch 最新更新",
  updatedAt: "2026-03-26",
  summary:
    `收到了大家陆陆续续的反馈，结合我们团队这段时间的想法与调整，DateMatch 做了一轮比较集中的更新。
下面是这次更新的主要内容。如果有任何问题或建议，可以关注DateMatch的同名微信公众号或者QQ联系2151220641`,
  blocks: [
    {
      title: "1. 反馈按钮支持双端长按滑动",
      content: `现在移动端和桌面端都支持反馈按钮长按拖动。
如果按钮遮挡页面内容，可以直接移动到更顺手的位置。`,
    },
    {
      title: "2. 匹配算法改为双向匹配",
      content: `之前团队更倾向于单向匹配，所以会出现“你的匹配列表里没有对方，但你却能收到对方消息”的情况。
我们的本意是想多给大家一个认识彼此的机会。
这次我们重写了相关逻辑，正式改为双向匹配。
之后大家看到的匹配关系会更明确，整体体验也会更自然、更舒服。`,
    },
    {
      title: "3. 匹配界面更新",
      content: `I. 加入了“点亮对方”功能
现在大家可以看到对方是否点亮了自己，这样在发起消息时会更有信心。
II. 补充了更完整的资料修改能力
提交后依然可以修改昵称、兴趣爱好、理想约会方式 / 相处方式等内容，不过问卷题目的回答暂时还不能修改。`,
    },
    {
      title: "4. 新增“找朋友”模式",
      content: `世界那么大，我们终其一生都在寻找一个真正能够说话的人。
这个人可以是伴侣，也可以是朋友。
所以这次我们新增了“找朋友”模式，希望可以帮助大家遇见更多真正聊得来的人。`,
    },
    {
      title: "5. 一些 UI 和文本优化",
      content: `I. 首页做了一定的视觉升级
II. 提交测试相关文案进行了重新打磨
III. 提交档案时加入了标签选择，同时保留了自我描述的选项
IV. 每次匹配开放后会有一个持续五天的展示期，在匹配开放后提交档案的用户会被分到下一轮匹配
V. 现在关闭雷达会退出本轮匹配，请大家留意`,
    },
    {
      title: "6. 还在继续打磨的内容",
      content: `关于消息提醒、邮箱通知，以及问题深度的继续优化，我们还需要一些时间。
大家的每一条反馈我们都在认真看。
如果愿意的话，也欢迎在反馈时留下联系方式，方便我们进一步交流。`,
    },
  ],
};
