# DateMatch 产品机制文档

## 1. 产品模式

- `romance`：恋爱匹配模式。
- `friendship`：找朋友模式。
- 两种模式共用整体流程，但题库、匹配维度、结果文案和用户预期不同。

## 2. 核心用户流程

1. 用户进入首页，查看公告与产品说明。
2. 用户选择模式并完成测试，提交个人档案。
3. 系统根据提交时间判断用户进入当前轮还是下一轮匹配。
4. 匹配开放后，用户在展示期内查看结果。
5. 用户可点亮对方；双方都点亮后开放聊天。
6. 用户可在全局反馈入口提交意见，运营侧统一查看与跟进。

## 3. 匹配轮次机制

### 3.1 固定节奏

- 每周固定开放一轮匹配。
- 当前代码约定为北京时间每周五 `18:00` 开放。
- 展示期持续 `5` 天。

对应实现见：

- `E:\code\datematch-main\lib\match-schedule.ts`

### 3.2 展示期语义

- `before_release`：还没到本轮开放时间。
- `display_window`：当前轮结果可查看、可互动。
- `between_windows`：展示期结束，等待下一次开放。

### 3.3 档案进入哪一轮

- 如果用户在展示期外提交档案，默认进入当前即将开放的一轮。
- 如果用户在展示期内提交档案，则进入下一轮。
- 这部分依赖 `eligible_release_at` 字段判断。

## 4. 匹配规则机制

### 4.1 双向匹配

- 当前逻辑已从单向机会式展示改为双向匹配。
- 每位用户会先计算自己的 Top 3 候选。
- 只有双方互相进入对方 Top 3，才会形成最终匹配结果。
- 当前轮匹配对会落到 `match_pairs`，并带有 `round_key`。

对应实现见：

- `E:\code\datematch-main\lib\mutual-matching.ts`
- `E:\code\datematch-main\app\api\find-matches\route.ts`

### 4.2 点亮与聊天权限

- 单方点亮：只代表自己表达意愿。
- 双方点亮：`canMessage = true`，开放聊天。
- 聊天权限依赖当轮 `match_pairs` 的确认状态。

对应实现见：

- `E:\code\datematch-main\app\api\match-confirmations\route.ts`
- `E:\code\datematch-main\lib\use-match-confirmations.ts`

## 5. 雷达与退出当前轮

- 用户关闭雷达，本质上是退出当前轮匹配。
- 当前实现会把 `match_opt_out_until` 设置到本轮展示结束时间。
- 在该时间之前，用户被视为已退出本轮，不再展示本轮结果。

对应实现见：

- `E:\code\datematch-main\app\dev-channel-2\page.tsx`
- `E:\code\datematch-main\lib\match-schedule.ts`

## 6. 档案编辑边界

- 当前支持修改：昵称、邮箱、自我描述、兴趣、理想约会或相处方式等资料类字段。
- 当前不支持修改：问卷原始回答。
- 档案修改通过 `profile_update_drafts` 管理生效时机，避免直接破坏当前轮结果。

对应实现见：

- `E:\code\datematch-main\app\profile\edit\page.tsx`
- `E:\code\datematch-main\lib\profile-updates.ts`

## 7. 公告与反馈机制

### 7.1 公告

- 首页公告是运营内容的一部分。
- 代码默认配置位于：
  - `E:\code\datematch-main\app\data\homeAnnouncement.ts`
- 运行时可选覆盖配置由运营后台写入：
  - `E:\code\datematch-main\tmp\ops\home-announcement.override.json`

### 7.2 反馈

- 全局悬浮入口负责收集用户反馈。
- 服务端会把反馈追加到本地日志，并尝试发送邮件通知。
- 当前反馈日志路径：
  - `E:\code\datematch-main\tmp\feedback\feedback-submissions.ndjson`

对应实现见：

- `E:\code\datematch-main\components\global-feedback-fab.tsx`
- `E:\code\datematch-main\app\api\feedback\route.ts`

## 8. 运营后台首版范围

当前首版运营后台优先解决四件事：

1. 查看当前公告实际生效内容。
2. 在线覆盖公告配置，不改默认代码文件。
3. 查看当前轮次节奏与模式数据概览。
4. 查看最近反馈及处理状态。

后台入口：

- `E:\code\datematch-main\app\ops\page.tsx`

## 9. 后续建议

- 把公告、首页文案、展示期说明继续统一到可运营配置层。
- 补齐事件埋点，覆盖首页进入、模式选择、提交档案、进入匹配、点亮、发出首条消息、留下反馈。
- 为消息提醒、微信绑定、邮件通知建立更清晰的状态流转说明。

## 10. V2 结果页文案迁移

### 10.1 迁移背景

- 现有结果页文案建立在旧题库 trait 体系之上，整体语气偏“人格判词”和“人设包装”。
- 新一轮题库重构已经转向“关系风格”而不是“情境反应”，结果页文案也需要同步切换。
- 本轮迁移先沉淀 V2 结果页的文案骨架和映射规则，不急着一次性改完前端逻辑。

### 10.2 V2 文案原则

- 不做能力评判：结果页不再暗示“高分更成熟、低分更差”。
- 不做人设包装：避免“灵魂捕手”“纯爱战神”这类强标签化表达。
- 先解释关系风格，再解释压力下容易卡住的位置。
- 保持用户可读性：优先使用“接近节奏”“边界自主”“低压陪伴”这类能直接理解的名称。

### 10.3 第一阶段交付

- 在 `app/data/resultsContent.ts` 中新增 V2 结果页草稿常量：
  - `RESULTS_TEXT_V2`
  - `ROMANCE_TRAIT_COPY_V2`
  - `FRIENDSHIP_TRAIT_COPY_V2`
- 这一阶段先把 V2 语言系统放进代码常量层，不直接替换现有结果页消费逻辑。
- 这样可以先把结果页的语言方向定下来，再逐步切换页面实现。

### 10.4 第二阶段交付

- 在 `app/data/resultsContent.ts` 中新增总画像草稿常量：
  - `ROMANCE_PROFILE_COPY_V2`
  - `FRIENDSHIP_PROFILE_COPY_V2`
- 每个画像草稿包含：
  - `title`
  - `subtitle`
  - `summary`
  - `strengths`
  - `underStress`
  - `rules`
- 总画像标题方向改为更可读、更关系化的命名，例如“稳定靠近型”“清醒自主型”“低压长流型”，不再使用过度包装的人设标签。

### 10.5 当前新增的解析基础设施

- 新增 `resolveV2ProfileCopy(mode, traits)` 纯函数，用于根据 V2 trait 分数从画像库中选出最匹配的一组标题与说明。
- `rules.primary` 用于定义画像的主判定条件，`rules.secondary` 用于细化同类画像之间的区分。
- 当没有画像完全满足主规则时，解析器会退回到“最接近的画像”，保证页面始终有稳定输出。
- 这一层目前仍属于迁移基础设施，不直接影响线上结果页展示。

### 10.6 推荐迁移顺序

1. 先定结果页固定文案、维度中文名和高/中/低解释。
2. 再接总画像标题、副标题、摘要和压力提示。
3. 再统一匹配页亮点文案、推荐语和破冰话术。
4. 最后回收底层打分和匹配算法里的旧 trait 假设。

### 10.7 下一步建议

- 优先改 `E:\code\datematch-main\app\results\page.tsx`，让结果页切到 V2 数据源。
- 结果页顶部优先消费 `resolveV2ProfileCopy` 的输出，再替换 trait 卡片和总结区文案。
- 页面切换完成后，再继续处理匹配页文案与算法权重校正。

### 10.7 当前迁移状态

- `E:\code\datematch-main\app\results\page.tsx` 已完成双栈兼容：
  - 传入旧 trait 时继续走旧版展示。
  - 传入 V2 trait 时切到新的总画像、雷达文案和风格解释。
- `E:\code\datematch-main\app\quiz\page.tsx` 已切换到：
  - `E:\code\datematch-main\app\data\questionBankV2.tsx`
  - `E:\code\datematch-main\app\data\friendshipQuestionBankV2.tsx`
- 当前主链路已经可以生成 V2 trait 结果，下一步应继续处理匹配页文案与底层匹配算法权重校正。
- 匹配文案层已补充 V2 标签与模板：`app/data/matchContent.ts` 现在包含 V2 trait label、匹配亮点模板和破冰建议模板。
- `lib/match-helpers.ts` 已支持自动识别 `legacy / v2`，V2 数据会优先走新的匹配文案模板，旧数据仍兼容旧模板。
- 匹配算法层已做 V2 适配：`lib/matching.ts` 与 `lib/friendship-matching.ts` 现在会先识别 trait 版本，再分别使用 `legacy / v2` 的维度集合、权重和互补策略。
- 恋爱 V2 更强调：`stabilityPreference`、`futureOrientation`、`reassuranceNeed`、`conflictEngagement` 等长期关系核心维度，并把 `approachPace`、`boundaryAutonomy` 作为可适度互补的维度。
- 友情 V2 更强调：`dependability`、`lowPressureCompanionship`、`emotionalHolding`、`repairInitiative` 等长期陪伴维度，并把 `connectionFrequency` 与 `lowPressureCompanionship` 视为可适度互补的节奏变量。
