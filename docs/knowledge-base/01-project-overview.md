---
title: DateMatch Project Overview
updated: 2026-03-28
scope: 项目介绍 / 页面结构 / 架构 / 环境变量
---

# DateMatch 项目总览

## 1. 项目定位

DateMatch 是一个校园场景下的双模式匹配应用，当前同时支持：

- `romance`
  - 恋爱匹配模式。
- `friendship`
  - 找朋友 / 搭子匹配模式。

两种模式共享统一的产品骨架：

1. 进入首页选择模式。
2. 完成问卷或直接建立档案。
3. 提交档案进入当前轮次或下一轮。
4. 在固定展示期查看本轮匹配结果。
5. 对感兴趣的对象点亮确认。
6. 双方都确认后进入聊天。
7. 通过页面提示、微信通知、邮件提醒和反馈闭环维持产品运转。

## 2. 技术栈

- 前端框架：Next.js 14 App Router
- UI：React 18 + Tailwind CSS + Radix UI + Framer Motion
- 数据库：SQLite + `better-sqlite3`
- ORM：Drizzle ORM
- 邮件：`nodemailer` + SMTP
- 分析：PostHog，可选启用
- 图片生成：`@vercel/og`
- 外部集成：微信服务号、KamaChat

## 3. 目录结构

### 3.1 主要目录

- `app/`
  - 页面路由和 API 路由。
- `components/`
  - 可复用 UI 组件和业务组件。
- `lib/`
  - 核心业务逻辑、数据库访问、匹配逻辑、通知逻辑、hooks、工具函数。
- `app/data/`
  - 问题库、文案、首页公告、结果页配置、标签库。
- `docs/`
  - 产品机制文档、分析计划和本次新增的知识库文档。
- `tests/`
  - Node 原生测试，目前主要覆盖匹配时间表和运营反馈过滤。
- `tmp/`
  - 运行期临时文件，例如运营公告覆盖、反馈日志。

### 3.2 重要文件

- `lib/match-schedule.ts`
  - 轮次开放时间和展示期判定。
- `lib/mutual-matching.ts`
  - 双向互推配对生成与读取。
- `lib/profile-updates.ts`
  - 档案修改的立即生效 / 延迟生效规则。
- `lib/email.ts`
  - SMTP 邮件发送封装和邮件模板。
- `lib/email-jobs.ts`
  - 邮件提醒和自动放榜通知的后台 worker。
- `lib/schema.ts`
  - Drizzle 表结构定义。
- `lib/database.ts`
  - SQLite 初始化、自动补列、按模式分库。
- `instrumentation.ts`
  - Next.js 运行时注册入口，用于启动后台邮件 worker。

## 4. 页面路由地图

## 4.1 用户端页面

- `/`
  - 首页，展示产品入口与模式选择弹窗。
- `/quiz`
  - 问卷页，根据 `mode` 加载恋爱或朋友问题库。
- `/results`
  - 问卷结果分析页，展示人格雷达图、标题和亮点。
- `/find-match`
  - 恋爱档案提交页。
- `/find-friends`
  - 搭子档案提交页。
- `/login`
  - 邮箱登录页，当前主流程是“输入已提交档案的邮箱后直接校验并登录”。
- `/email-login`
  - 基于 token 的邮箱链接登录页，当前更像兼容或备用流程。
- `/dev-channel-2`
  - 匹配展示主页面，包含个人信息、匹配卡片、点亮确认、退出本轮等核心交互。
- `/chat`
  - 聊天页，读取联系人列表、消息列表、确认状态，并支持发送消息。
- `/profile/edit`
  - 档案完整编辑页。
- `/feedback`
  - 用户反馈页。
- `/wechat/connect`
  - 微信服务号绑定页。

## 4.2 运营与辅助页面

- `/ops`
  - 运营后台，支持公告编辑、轮次概览、反馈查看与导出。
- `/find-matches`
  - 服务器动态页，配合匹配结果相关跳转使用。
- `/dev-channel-2`
  - 虽然路径名像测试页，但现在已承载正式匹配展示链路。

## 5. 运行架构

## 5.1 双模式双数据库

项目按模式拆成两套 SQLite 数据：

- `datematch.db`
  - `romance` 模式数据库。
- `datematch-friendship.db`
  - `friendship` 模式数据库。

代码通过 `getDbForMode(mode)` 自动路由到对应库。

## 5.2 Node 运行时后台任务

邮件后台 worker 启动链路如下：

1. `next.config.mjs` 开启 `experimental.instrumentationHook`
2. `instrumentation.ts` 在 Node runtime 下加载 `register.node.ts`
3. `register.node.ts` 调用 `ensureEmailBackgroundWorkersStarted()`
4. `lib/email-jobs.ts` 启动两个定时循环：
   - 聊天提醒邮件循环，默认每 1 分钟跑一次
   - 放榜结果邮件循环，默认每 1 分钟跑一次

注意：

- `next build` 期间 worker 不会启动。
- `NODE_ENV === "test"` 时 worker 不启动。

## 5.3 前后端职责分层

- 页面层 `app/`
  - 负责展示、输入、调用 API。
- API 层 `app/api/`
  - 负责请求验证、权限边界、组合业务逻辑。
- 业务层 `lib/`
  - 负责匹配算法、通知状态推进、数据库封装、规则计算。
- 数据层 `lib/schema.ts` + `lib/database.ts`
  - 负责表定义和本地 SQLite 初始化。

## 6. 环境变量

## 6.1 必填或强相关变量

- `AUTH_SESSION_SECRET`
  - 服务端 session 和微信 state 的签名密钥。
- `OPS_DASHBOARD_TOKEN`
  - 运营后台登录口令。
- `NEXT_PUBLIC_APP_URL`
  - 前端公开访问地址，用于构造页面跳转链接。
- `APP_URL`
  - 服务端兜底基础地址。

## 6.2 邮件 SMTP 相关

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

用途：

- 档案提交确认邮件
- 用户反馈通知邮件
- 匹配结果自动放榜邮件
- 聊天提醒邮件

## 6.3 微信相关

- `WECHAT_OFFICIAL_APP_ID`
- `WECHAT_OFFICIAL_APP_SECRET`
- `WECHAT_TEMPLATE_ID`
- `WECHAT_OAUTH_REDIRECT_URI`
- `WECHAT_NOTIFICATION_WEBHOOK_URL`
- `WECHAT_TEMPLATE_TARGET_URL`
- `WECHAT_TEMPLATE_FIELD_INTRO`
- `WECHAT_TEMPLATE_FIELD_SENDER`
- `WECHAT_TEMPLATE_FIELD_PREVIEW`
- `WECHAT_TEMPLATE_FIELD_REMARK`
- `NEXT_PUBLIC_WECHAT_FOLLOW_URL`

用途：

- 公众号 OAuth 绑定
- 模板消息发送
- 或改走 webhook 方式投递通知

## 6.4 其他可选变量

- `KAMACHAT_API_URL`
- `NEXT_PUBLIC_KAMACHAT_WEB_URL`
  - KamaChat 会话桥接。
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
  - 行为分析埋点。
- `VERCEL_URL`
  - 部署平台自动提供时会被用作基础地址兜底。
- `NEXTAUTH_SECRET`
  - `AUTH_SESSION_SECRET` 的备用来源。

## 7. 当前实现特点

- 匹配开放时间固定为每周五 18:00，展示期 5 天。
- 展示期内新提交档案不会加入当前轮，而是进入下一轮。
- 当前主登录链路不再强依赖邮件 token，而是输入邮箱后直接校验档案并写入 session。
- 匹配是双向互推，不再是单向推荐。
- 聊天提醒邮件和匹配放榜邮件是后台自动触发，不依赖用户刷新页面。
- 首页公告支持代码默认值和运行时覆盖两层来源。
