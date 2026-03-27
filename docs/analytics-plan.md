# DateMatch 业务埋点方案

## 1. 目标

用最少但关键的事件，回答下面四类问题：

1. 用户从首页到提交档案，在哪一步流失最多？
2. 用户进入匹配后，是否真的看到了结果？
3. “点亮”和“首条消息”之间的转化率如何？
4. 反馈、公告、模式切换对留存和互动有没有帮助？

## 2. 事件命名原则

- 统一使用英文事件名，便于 PostHog 与导出分析。
- 统一带上 `mode`、`source`、`page` 这类核心上下文。
- 对结果类事件补充 `success`、`error_code`、`count` 等字段。

## 3. 推荐事件清单

### 3.1 首页与模式选择

- `home_viewed`
  - 字段：`has_announcement`
- `announcement_opened`
  - 字段：`source`, `announcement_source`
- `mode_selector_opened`
  - 字段：`source_page`
- `mode_selected`
  - 字段：`mode`

### 3.2 测试与档案提交

- `quiz_started`
  - 字段：`mode`
- `quiz_submitted`
  - 字段：`mode`, `tag_count`
- `profile_submitted`
  - 字段：`mode`, `eligible_release_at`, `queued_for_next_round`
- `profile_updated`
  - 字段：`mode`, `field_group`

### 3.3 匹配结果与展示期

- `match_page_viewed`
  - 字段：`mode`, `phase`, `is_in_display_window`, `match_count`
- `match_card_switched`
  - 字段：`mode`, `index`, `total_matches`
- `match_profile_opened`
  - 字段：`mode`, `target_user_id`
- `radar_opted_out`
  - 字段：`mode`, `release_at`, `display_end_at`

### 3.4 点亮与聊天

- `match_confirm_toggled`
  - 字段：`mode`, `target_user_id`, `confirmed`
- `mutual_match_unlocked`
  - 字段：`mode`, `target_user_id`
- `chat_opened`
  - 字段：`mode`, `target_user_id`
- `chat_first_message_sent`
  - 字段：`mode`, `target_user_id`, `content_length`

### 3.5 反馈

- `feedback_opened`
  - 字段：`page`, `source`
- `feedback_submitted`
  - 字段：`page`, `source`, `has_nickname`

## 4. 推荐漏斗

### 4.1 首次转化漏斗

`home_viewed` → `mode_selected` → `quiz_started` → `quiz_submitted` → `profile_submitted`

### 4.2 匹配互动漏斗

`match_page_viewed` → `match_profile_opened` → `match_confirm_toggled` → `chat_opened` → `chat_first_message_sent`

### 4.3 公告影响观察

- 对比 `announcement_opened` 用户与未打开用户的：
  - `quiz_started`
  - `profile_submitted`
  - `feedback_submitted`

## 5. 属性建议

所有关键事件建议统一补齐：

- `mode`
- `page`
- `release_at`
- `phase`
- `user_id`（如可安全使用内部 ID）
- `is_authenticated`

## 6. 实施建议

- 第一阶段先接首页、匹配页、反馈、点亮、首条消息。
- 第二阶段再接资料修改、微信绑定、消息通知链路。
- 所有事件都应在 `NEXT_PUBLIC_POSTHOG_KEY` 存在时才发送。

现有 PostHog Provider 位于：

- `E:\code\datematch-main\app\providers\PostHogProvider.tsx`
