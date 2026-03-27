# DateMatch

DateMatch 是一个面向校园场景的匹配应用，当前同时支持「恋爱模式」与「找朋友模式」。
项目围绕问卷测试、资料提交、双向匹配、展示期、点亮确认、聊天互动、反馈收集与运营公告等核心流程构建。

## 当前能力

- 首页展示匹配倒计时、运营公告与模式入口
- 支持恋爱 / 找朋友双模式独立匹配
- 匹配规则已切换为双向匹配
- 支持展示期机制与“关闭雷达退出本轮匹配”
- 支持资料补充与部分资料修改
- 支持点亮对方、确认匹配与聊天
- 支持全局反馈浮窗与首页公告弹窗
- 支持基础运营后台 `/ops`

## 技术栈

- `Next.js 14` + App Router
- `React 18`
- `TypeScript`
- `Tailwind CSS`
- `Radix UI`
- `Framer Motion`
- `Drizzle ORM`
- `better-sqlite3`
- `Resend`
- `PostHog`

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local`。

最小建议配置：

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
AUTH_SESSION_SECRET=replace-with-a-long-random-string
OPS_DASHBOARD_TOKEN=replace-with-a-secure-token
```

按需配置的能力：

- 邮件登录 / 通知：`RESEND_API_KEY`
- 公众号 / 模板消息：`WECHAT_OFFICIAL_APP_ID`、`WECHAT_OFFICIAL_APP_SECRET`、`WECHAT_TEMPLATE_ID` 等
- 埋点：`NEXT_PUBLIC_POSTHOG_KEY`、`NEXT_PUBLIC_POSTHOG_HOST`
- 外部聊天能力：`KAMACHAT_API_URL`、`NEXT_PUBLIC_KAMACHAT_WEB_URL`

### 3. 启动开发环境

常规启动：

```bash
npm run dev
```

如果当前 Windows / 桌面环境里遇到终端权限或启动稳定性问题，也可以使用：

```bash
npm run dev:hidden
```

### 4. 常用检查命令

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 数据与存储

- 本地开发默认使用 SQLite
- 项目会自动创建两个数据库文件：
  - `datematch.db`：恋爱模式
  - `datematch-friendship.db`：找朋友模式
- 构建时会自动检查并补齐必要表结构

## 目录说明

- `app`：页面、路由与 API
- `components`：通用组件与业务组件
- `lib`：数据库访问、业务逻辑、hooks、工具函数
- `app/data`：首页公告、结果文案、选项配置等静态内容
- `docs`：产品机制文档与埋点方案
- `tests`：规则测试与基础测试
- `scripts`：开发与构建辅助脚本
- `public`：静态资源
- `tmp`：本地运行产物、运营覆盖文件与日志

## 运营与配置

### 首页公告

- 默认公告配置：`app/data/homeAnnouncement.ts`
- 运营后台覆盖文件：`tmp/ops/home-announcement.override.json`

### 运营后台

- 路由：`/ops`
- 访问依赖环境变量：`OPS_DASHBOARD_TOKEN`
- 当前后台主要支持：
  - 查看公告当前生效内容
  - 在线覆盖首页公告
  - 查看匹配轮次与模式概览
  - 查看最近反馈与处理状态

## 文档

- 产品机制：`docs/product-mechanism.md`
- 埋点方案：`docs/analytics-plan.md`

## 发布前建议

- 上传前至少执行一次 `npm run build`
- 不要把 `.env.local`、`.next`、`tmp` 日志文件、本地 SQLite 数据库一起提交到线上
- 生产环境请在服务器或平台环境变量中配置 `OPS_DASHBOARD_TOKEN`、`AUTH_SESSION_SECRET` 等敏感项
- 如果线上数据库结构已与当前仓库保持一致，代码更新通常不会影响线上已有数据

## 维护建议

- 修改匹配规则时，同时检查展示期、聊天权限、雷达状态与资料编辑边界
- 修改公告、首页文案、活动说明时，优先走配置层，不要散落在页面里硬编码
- 新功能合入前，优先保持 `lint`、`typecheck`、`test`、`build` 全绿
