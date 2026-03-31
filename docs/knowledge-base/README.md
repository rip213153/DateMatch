---
title: DateMatch Knowledge Base Index
updated: 2026-03-28
purpose: 团队知识库 / RAG 检索入口
---

# DateMatch 知识库索引

本目录用于给团队内部的 DateMatch 问答系统、RAG 检索系统和新成员 onboarding 使用。

设计原则：

- 按主题拆分，避免一篇文档混入过多不同领域内容。
- 尽量使用稳定的代码路径、字段名、接口名，便于向代码回溯。
- 优先回答“业务怎么跑”“数据落在哪里”“这个功能应该改哪一层”。

## 文档清单

1. [01-project-overview.md](./01-project-overview.md)
   - 项目定位、技术栈、页面结构、运行架构、环境变量。
2. [02-business-workflows.md](./02-business-workflows.md)
   - 从问卷、档案、匹配、确认、聊天到通知和运营后台的完整工作流。
3. [03-api-spec.md](./03-api-spec.md)
   - API 路由分组说明、关键请求字段、关键响应字段、注意事项。
4. [04-core-libraries.md](./04-core-libraries.md)
   - `lib/` 目录核心模块职责、主要导出、常见改动入口。
5. [05-data-model-and-ops.md](./05-data-model-and-ops.md)
   - 数据库表、文件型状态、后台任务、环境变量、测试覆盖、运维关注点。

## 推荐 RAG 切块方式

- 以“文件 + 二级标题”为第一层 chunk。
- 路由类内容按接口路径切块，例如 `POST /api/submit-profile`。
- 数据模型类内容按表名切块，例如 `profiles`、`match_pairs`、`chat_notification_events`。
- 工具库类内容按模块切块，例如 `lib/mutual-matching.ts`、`lib/profile-updates.ts`。

## 核心术语

- `mode`
  - 业务模式。只允许 `romance` 或 `friendship`。
  - 两种模式共用大部分流程，但数据完全分库。
- `releaseAt`
  - 当前轮次正式开放匹配结果的时间。
- `display window`
  - 展示期。当前实现为每周五 18:00 开始，持续 5 天，时区语义为北京时间。
- `eligible_release_at`
  - 用户档案最早可进入的轮次时间点。
  - 在展示期内提交的新档案会自动排到下一轮。
- `roundKey`
  - 当前轮次唯一标识，格式为 `${mode}:${releaseAt}`。
  - 配对、聊天、通知都依赖这个概念做轮次隔离。
- `mutual pair`
  - 双向互选配对。
  - 只有 A 的推荐列表里有 B，同时 B 的推荐列表里也有 A，才会生成配对对。
- `match_opt_out_until`
  - 用户退出当前轮次的截止时间。
  - 展示期内关闭雷达，本质上是把这个字段写到本轮展示结束时间。
- `profile_update_drafts`
  - 展示期内的延迟生效档案修改。
  - 部分字段立即改，部分字段下轮生效。
- `chat_notification_events`
  - 聊天消息触发的通知事件表。
  - 微信通知和邮件提醒都依赖这里的事件状态推进。

## 非直觉但很重要的事实

- DateMatch 不是单库项目，而是 `romance` 和 `friendship` 两个 SQLite 库并行运行。
- 当前匹配结果不是离线批任务提前全量算好，而是通过 `ensureMutualPairsForRound()` 在需要时确保本轮配对存在。
- 聊天权限不是“有配对就能聊”，而是“处在当前可见互推关系里”并且聊天消息按当前轮次或历史轮次隔离。
- 邮件提醒不是接口请求内同步完成，而是由 `lib/email-jobs.ts` 的后台 worker 按分钟轮询处理。
- 聊天提醒邮件有 2 小时冷却窗口，同一发送者对同一接收者不会在 2 小时内重复发提醒。
- 运营公告不是只存在代码里，运行时也可能被 `tmp/ops/home-announcement.override.json` 覆盖。

## 建议的提问方式

如果团队成员要在知识库里提问，推荐明确带上下面这些关键词：

- 功能域：`匹配` / `聊天` / `档案编辑` / `邮件` / `微信通知` / `运营后台`
- 模式：`romance` 或 `friendship`
- 目标层：`页面` / `API` / `lib` / `数据表`
- 精确对象：接口路径、表名、文件名、字段名

例如：

- “展示期内修改年龄为什么不立即生效？”
- “聊天提醒邮件是哪个 worker 发的？”
- “匹配结果页为什么有时返回空数组但不是报错？”
- “微信绑定 openId 的状态 token 在哪里生成和校验？”
