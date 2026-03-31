---
title: DateMatch Business Workflows
updated: 2026-03-28
scope: 核心业务流程 / 状态流转 / 通知链路
---

# DateMatch 核心工作流

## 1. 问卷到结果页

适用页面：

- `/quiz`
- `/results`

流程：

1. 用户在首页选择 `romance` 或 `friendship`。
2. `/quiz` 根据 `mode` 载入不同问题库：
   - `app/data/questionBank.tsx`
   - `app/data/friendshipQuestionBank.tsx`
3. 用户回答后前端计算 trait 平均值。
4. 前端把人格画像通过 query 参数带到 `/results`。
5. `/results` 不依赖数据库，可以单独展示人格雷达和文案。

说明：

- 问卷结果页是“自我分析层”，不是“匹配结果层”。
- 真实进入匹配池，还需要后续提交档案到 `/api/submit-profile`。

## 2. 档案建立与入池

适用页面：

- `/find-match`
- `/find-friends`

关键接口：

- `POST /api/submit-profile`

流程：

1. 用户填写昵称、年龄、性别、想认识的对象、学校、邮箱、兴趣、理想约会或理想相处方式。
2. 页面把 `mode`、文本字段、标签字段和 `personalityProfile` 提交给 `/api/submit-profile`。
3. 服务端校验必填项和年龄下限。
4. 若邮箱已存在：
   - 更新已存在档案。
   - 保留原来的 `eligible_release_at`，避免重复提交改变入池轮次。
5. 若邮箱不存在：
   - 创建新档案。
   - 根据 `getEligibleReleaseAt()` 写入 `eligible_release_at`。
6. 尝试发送“档案已提交”邮件。

关键规则：

- 展示期外提交：进入当前即将开放的轮次。
- 展示期内提交：进入下一轮。
- 按邮箱去重，默认一邮箱在同一模式下只保留一个当前档案。

## 3. 邮箱登录与会话

适用页面：

- `/login`
- `/email-login`

关键接口：

- `POST /api/auth/email-login/request`
- `POST /api/auth/email-login/verify-token`
- `GET /api/auth/session`
- `POST /api/auth/logout`

当前主流程：

1. 用户在 `/login` 输入提交档案时用过的邮箱。
2. `/api/auth/email-login/request` 按模式查找该邮箱对应档案。
3. 查到后直接写入 `datematch_session` cookie。
4. 前端 `AuthService.loginWithEmail()` 同时把 email、mode、userId 写入 localStorage。
5. 用户跳转到 `/dev-channel-2` 等业务页面。

备用流程：

- `/email-login` 仍支持读取 token 并调用 `/api/auth/email-login/verify-token`。
- `/api/verify-email` 仍保留旧式链接验证逻辑。

会话特点：

- 服务端 cookie 负责受信 session。
- 前端 localStorage 负责页面快速识别当前邮箱和 userId。
- 两者都存在，属于双轨并存设计。

## 4. 匹配轮次与展示期

关键模块：

- `lib/match-schedule.ts`

当前规则：

- 匹配开放时间：每周五 18:00，按北京时间语义计算。
- 展示期：开放后持续 5 天。
- 阶段枚举：
  - `before_release`
  - `display_window`
  - `between_windows`

常用字段：

- `releaseAt`
  - 本轮开放时间。
- `displayEndAt`
  - 本轮展示结束时间。
- `nextReleaseAt`
  - 下一轮开放时间。
- `eligible_release_at`
  - 某个用户最早可参加的轮次。

## 5. 双向互推配对生成

关键模块：

- `lib/matching.ts`
- `lib/friendship-matching.ts`
- `lib/mutual-matching.ts`
- `GET/POST /api/find-matches`

流程：

1. 页面请求 `/api/find-matches?userId=...&mode=...`。
2. 服务端加载当前模式下所有生效档案。
3. 判断当前是否处于展示期。
4. 判断当前用户 `eligible_release_at` 是否已经进入本轮。
5. 如果满足条件，调用 `ensureMutualPairsForRound()`：
   - 先为每个用户算 top N 推荐。
   - 只保留互相进入对方候选的组合。
   - 写入 `match_pairs`。
6. 读取当前用户在本轮的互推配对列表，返回给前端。

重要细节：

- 配对并不是单向候选，而是双向互推。
- `match_pairs` 的唯一键是 `round_key + user_a_id + user_b_id`。
- 如果当前用户还未到本轮，接口不会报错，而是返回：
  - `matches: []`
  - `isQueuedForNextRound: true`

## 6. 退出当前轮次

适用页面：

- `/dev-channel-2`

关键接口：

- `POST /api/match-status`

流程：

1. 用户在展示期内关闭雷达。
2. 前端把 `optOutUntil` 写成当前轮次 `displayEndAt`。
3. 服务端更新 `profiles.match_opt_out_until`。
4. 本轮内该用户被视为已退出，不再展示本轮匹配。

本质：

- 不是删除配对数据。
- 是用时间窗口方式屏蔽当前轮次。

## 7. 点亮确认与聊天解锁

关键接口：

- `GET/POST /api/match-confirmations`

关键模块：

- `lib/mutual-matching.ts`
- `lib/use-match-confirmations.ts`

流程：

1. 匹配展示页批量读取当前用户对每个推荐对象的确认状态。
2. 状态由 `match_pairs.user_a_confirmed_at / user_b_confirmed_at` 组合而成。
3. 用户点亮某人时，写入自己对应一侧的确认时间。
4. 只有双方都已确认时，`canMessage` 才为 `true`。

状态语义：

- `selfConfirmed`
  - 自己已点亮对方。
- `otherConfirmed`
  - 对方已点亮自己。
- `canMessage`
  - 双方都完成确认，可以聊天。

## 8. 聊天会话与历史会话

关键接口：

- `GET /api/chat/contacts`
- `GET /api/chat/messages`
- `POST /api/chat/messages`

关键模块：

- `lib/chat-conversations.ts`

流程：

1. 聊天页先读取联系人列表。
2. 联系人来自两部分：
   - 当前展示期内的当前轮次互推对象
   - 曾经聊过的历史对象
3. 打开会话时，服务端先解析会话作用域：
   - 如果当前仍是本轮互推对象，则读当前 `roundKey`
   - 否则回退到历史最后一次聊天所在的 `round_key`
4. 发送消息时：
   - 只能给当前可访问的互推对象发
   - 在对方回复前，自己最多只能连续发 1 条开场消息

## 9. 消息通知链路

通知分两条：

- 微信通知
- 邮件提醒

### 9.1 微信通知

关键接口：

- `POST /api/wechat/process-notifications`

关键模块：

- `lib/chat-notification-events.ts`
- `lib/wechat.ts`

流程：

1. 新聊天消息写入 `chat_messages` 后，创建 `chat_notification_events` 记录。
2. 通知处理接口读取 `status = PENDING` 的事件。
3. 若接收方已绑定微信且开启提醒，则发送公众号模板消息或 webhook。
4. 成功后把事件标成 `PROCESSED`，失败则标成 `FAILED`。

### 9.2 邮件提醒

关键模块：

- `lib/email-jobs.ts`
- `lib/email.ts`

流程：

1. 新聊天消息同样会留下通知事件，但邮件走 `email_status` 这条状态线。
2. 后台 worker 每分钟扫描 `email_status = PENDING` 的事件。
3. 若接收方有邮箱、SMTP 已配置、且不在 2 小时冷却窗口内，则发送提醒邮件。
4. 成功后更新：
   - 事件 `email_status = PROCESSED`
   - `chat_email_reminder_windows.last_sent_at`
5. 若 2 小时内已提醒过，则标为 `SKIPPED`。

## 10. 匹配结果自动放榜邮件

关键模块：

- `lib/email-jobs.ts`
- `lib/email.ts`

流程：

1. 后台 worker 每分钟检查当前是否处于展示期。
2. 如果处于展示期，则确保当前轮次配对已生成。
3. 对每个符合条件的用户判断：
   - 有邮箱
   - 未退出本轮
   - 已进入本轮
   - 本轮至少有一个配对
   - 本轮还没发过结果邮件
4. 满足条件则发送匹配结果邮件，并写入 `profiles.email_sent_at`。

关键字段：

- `email_sent_at`
  - 不是“历史上发过”这么简单，而是要结合 `releaseAt` 和 `nextReleaseAt` 判断是否本轮已发。

## 11. 档案编辑与延迟生效

适用页面：

- `/profile/edit`

关键接口：

- `GET /api/profile`
- `POST /api/profile`

关键模块：

- `lib/profile-updates.ts`

字段分两类：

- 立即生效字段
  - `name`
  - `bio`
  - `email`
  - `ideal_date`
  - `ideal_date_tags`
  - `interests`
- 延迟生效字段
  - `age`
  - `gender`
  - `seeking`
  - `university`
  - `personality_profile`

规则：

- 展示期内改延迟字段：
  - 不直接改 `profiles`
  - 写入 `profile_update_drafts`
  - 到下一轮开始时自动应用
- 展示期外改延迟字段：
  - 直接落库
  - 同时把草稿状态标成已应用

## 12. 反馈与运营后台

关键接口：

- `POST /api/feedback`
- `GET /api/home-announcement`
- `GET /api/ops/dashboard`
- `GET /api/ops/feedback/export`

流程：

1. 用户提交反馈后，先写入 `tmp/feedback/feedback-submissions.ndjson`。
2. 服务端尝试把反馈邮件发到固定收件地址。
3. 运营后台汇总：
   - 轮次状态
   - 用户规模
   - 配对数
   - 通知失败数
   - 反馈记录
   - 首页公告当前生效内容

首页公告有三层来源：

1. `app/data/homeAnnouncement.ts` 默认值
2. `tmp/ops/home-announcement.override.json` 已发布覆盖值
3. `tmp/ops/home-announcement.draft.json` 草稿值，仅后台编辑态可见
