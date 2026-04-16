# DateMatch

DateMatch 是一个面向校园场景的双模式匹配产品，支持恋爱匹配与搭子 / 朋友匹配两条链路。项目已经提供真实可访问的在线版本，并持续迭代问卷分析、档案提交、定时放榜、双向确认、聊天、邮件 / 微信提醒和运营后台等核心能力。

## 在线状态

该项目已有真实在线版本，并不是静态 demo 或只展示界面的作品集仓库。

- 当前仓库包含核心前后端实现
- 在线版本正在持续迭代和维护
- 若后续需要公开访问地址，可以直接在此处补充 `Live Site`

## 产品亮点

- 双模式匹配并行运行：同时支持 `romance` 和 `friendship`，并按模式分库隔离数据
- 固定时间窗口放榜：支持轮次、展示期和下一轮生效规则
- 完整交互闭环：从问卷、建档、匹配、双向确认到聊天和提醒都已打通
- 真实会话鉴权：核心接口已收口到服务端 session，而不是只依赖前端状态
- 运营与通知能力：支持公告、反馈、邮件提醒、微信提醒和后台轮询 worker

## 为什么这个项目值得看

这不是一个只做了首页或问卷页的演示项目，而是一个真实可访问、具备完整业务闭环的校园匹配产品。仓库中同时包含：

- 面向用户的页面和交互
- 面向运营的后台入口
- 面向服务端的匹配、通知和鉴权逻辑
- 面向维护者的测试与架构文档

如果你关心“一个小而完整的真实产品如何把前端、后端、通知和运营串起来”，这个项目会比较有参考价值。

## 核心能力

### 双模式匹配

- `romance`：恋爱匹配
- `friendship`：搭子 / 朋友匹配

两种模式共享主要产品骨架，但使用独立数据库，避免数据串用。

### 匹配与放榜

- 按固定时间窗口放榜
- 展示期内的新提交自动进入下一轮
- 当前结果基于双向匹配逻辑生成
- 近期已展示的配对可按规则避免重复出现

### 资料编辑与状态控制

- 一部分资料字段立即生效
- 一部分核心画像字段延迟到下一轮生效
- 目标是在展示期内保持当前轮结果稳定

### 聊天与提醒

- 双向确认后开放聊天
- 支持聊天联系人、消息轮询和确认状态展示
- 聊天提醒支持邮件和微信链路
- 后台 worker 会轮询处理通知任务

### 运营后台

- 公告管理
- 反馈查看与导出
- 轮次概况查看
- 运营覆盖能力

## 技术栈

- 前端与全栈框架：Next.js 14 App Router、React 18
- UI：Tailwind CSS、Radix UI、Framer Motion
- 数据层：SQLite、better-sqlite3、Drizzle ORM
- 通知：Nodemailer、SMTP、微信通知链路
- 分析与扩展：PostHog、`@vercel/og`

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local`。

最小可运行配置：

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
AUTH_SESSION_SECRET=replace-with-a-long-random-string
OPS_DASHBOARD_TOKEN=replace-with-a-secure-token
```

如果要启用邮件发送，还需要额外配置 SMTP。详细说明见：

- [SMTP_EMAIL.md](/E:/code/datematch-main/SMTP_EMAIL.md)

### 3. 启动开发环境

```bash
npm run dev
```

Windows 下也可以使用后台启动方式：

```bash
npm run dev:hidden
```

### 4. 常用检查命令

```bash
npm run typecheck
npm test
npm run build
```

## 项目结构

- `app/`：页面路由与 API 路由
- `components/`：通用组件与业务组件
- `lib/`：匹配、通知、鉴权、数据库访问等核心逻辑
- `docs/`：架构说明、机制说明和维护文档
- `tests/`：当前自动化测试
- `scripts/`：开发和运行辅助脚本
- `public/`：静态资源

## 文档导航

- [docs/ARCHITECTURE.md](/E:/code/datematch-main/docs/ARCHITECTURE.md)：维护者视角的当前运行架构
- [SMTP_EMAIL.md](/E:/code/datematch-main/SMTP_EMAIL.md)：SMTP 与邮件通知配置
- [docs/product-mechanism.md](/E:/code/datematch-main/docs/product-mechanism.md)：产品机制说明
- [docs/knowledge-base/README.md](/E:/code/datematch-main/docs/knowledge-base/README.md)：知识库入口

## 线上状态与开源边界

这个仓库对应的产品已有真实在线版本，但仓库默认仍按本地开发方式组织。

- 在线版本可访问，不代表仓库内包含完整线上运营配置
- 邮件、微信、运营后台等能力依赖私有环境变量和外部服务
- 仓库不会包含敏感凭据、后台口令或完整生产配置
- 开源代码可以帮助理解整体实现，但不能直接等价为线上环境的一键复刻

## 当前状态

当前版本已经打通主要业务链路，重点集中在：

- 继续优化匹配链路性能
- 收敛聊天页轮询与加载体验
- 完善接口鉴权与自动化测试
- 逐步统一和整理历史文档

## 仓库短描述建议

如果你准备上传到 GitHub，仓库简介可以使用这句：

`A live campus matching platform with romance and friendship modes, timed releases, chat, notifications, and ops tooling.`
