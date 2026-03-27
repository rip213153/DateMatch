# DateMatch 产品机制文档

## 1. 产品模式

- `romance`：恋爱匹配模式。
- `friendship`：找朋友模式。
- 两种模式共用整体流程，但数据分库、匹配池、文案和用户预期不同。

## 2. 核心用户流程

1. 用户进入首页，查看公告与产品说明。
2. 用户选择模式并完成测试 / 档案提交。
3. 系统根据提交时间决定用户进入当前轮还是下一轮匹配。
4. 匹配开放后，用户在展示期内查看结果。
5. 用户可点亮对方；双方都点亮后开放聊天。
6. 用户可在全局反馈入口提交意见，运营侧统一查看与跟进。

## 3. 匹配轮次机制

### 3.1 固定节奏

- 每周固定开放一次匹配。
- 当前代码约定为 **北京时间每周五 18:00** 开放。
- 展示期持续 **5 天**。

对应实现见：

- `E:\code\datematch-main\lib\match-schedule.ts`

### 3.2 展示期语义

- `before_release`：还没到本轮开放时间。
- `display_window`：当前轮结果可查看、可互动。
- `between_windows`：展示期结束，等待下一次开放。

### 3.3 档案进入哪一轮

- 如果用户在展示期外提交档案，默认进入当前即将开放的一轮。
- 如果用户在展示期内提交档案，则进入下一轮。
- 这部分依赖 `eligible_release_at` 字段判定。

## 4. 匹配规则机制

### 4.1 双向匹配

- 当前逻辑已从单向机会式展示改为 **双向匹配**。
- 展示给用户的结果需要建立在双方互相进入候选关系之上。
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

- 当前支持修改：昵称、邮箱、自我描述、兴趣、理想约会 / 相处方式等资料类字段。
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
