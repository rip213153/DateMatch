# DateMatch

DateMatch 是一个面向校园场景的双模式匹配产品，支持恋爱匹配与搭子 / 朋友匹配两条链路。项目已经有真实在线版本，不是静态 demo，也不是只展示界面的作品集仓库。

## 在线状态

- 这是一个真实可访问、持续迭代的在线产品
- 当前仓库包含核心前后端实现，而不只是页面展示
- 如果后续你愿意公开线上地址，可以在这里直接补 `Live Site`

## 核心亮点

- 双模式并行运行：`romance` 和 `friendship` 使用独立数据链路
- 固定时间窗口放榜，支持轮次与展示期规则
- 从问卷、建档、匹配、双向确认到聊天形成完整闭环
- 核心接口走服务端 session 校验，而不是纯前端状态模拟
- 支持邮件、微信提醒、公告、反馈和运营后台

## 技术栈

- Next.js 14 App Router
- React 18
- Tailwind CSS
- Radix UI
- Framer Motion
- Drizzle ORM
- 本地开发：SQLite + `better-sqlite3`
- 线上部署：Supabase PostgreSQL
- 通知能力：Nodemailer / SMTP / 微信通知链路

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 `.env.local`

最小本地配置：

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
AUTH_SESSION_SECRET=replace-with-a-long-random-string
OPS_DASHBOARD_TOKEN=replace-with-a-secure-token
```

邮件配置见：

- [SMTP_EMAIL.md](/E:/code/datematch-main/SMTP_EMAIL.md)

### 3. 启动项目

```bash
npm run dev
```

Windows 下也可以用后台启动：

```bash
npm run dev:hidden
```

### 4. 常用检查命令

```bash
npm run typecheck
npm test
npm run build
```

## 数据库说明

### 本地默认模式

本地开发默认继续使用 SQLite：

- `datematch.db`
- `datematch-friendship.db`

如果没有配置 PostgreSQL 连接串，项目会自动回退到这两份本地数据库文件。

### 线上推荐模式

Vercel 线上部署推荐使用 Supabase 托管 PostgreSQL，并按双模式使用两条连接串：

```bash
ROMANCE_DATABASE_URL=postgresql://...
FRIENDSHIP_DATABASE_URL=postgresql://...
```

推荐做法：

1. 在 Supabase 创建两个项目
2. 一个用于 `romance`
3. 一个用于 `friendship`
4. 在 Vercel 环境变量中分别配置两条 URL

因为当前项目本身就是双库模型，这样改动最小，也最适合先把线上稳定跑起来。

## Supabase 接入与迁移

仓库已经内置了 PostgreSQL 初始化和 SQLite 导入脚本。

### 1. 初始化 PostgreSQL 表结构

```bash
npm run db:init:pg
```

只初始化单个模式也可以：

```bash
node --loader ts-node/esm scripts/init-postgres-schema.ts romance
node --loader ts-node/esm scripts/init-postgres-schema.ts friendship
```

### 2. 将本地 SQLite 数据导入 PostgreSQL

```bash
npm run db:import:pg
```

这个脚本会：

- 读取 `datematch.db`
- 读取 `datematch-friendship.db`
- 自动初始化 PostgreSQL 表结构
- 分模式导入数据到对应的 Supabase 项目
- 自动重置各表自增序列

脚本内已经处理了当前仓库历史数据里“秒 / 毫秒混用”的时间字段兼容问题。

## 部署提示

如果你准备把项目部署到 Vercel，建议按这个顺序：

1. 在 Supabase 创建两个 PostgreSQL 项目
2. 本地配置 `ROMANCE_DATABASE_URL` 和 `FRIENDSHIP_DATABASE_URL`
3. 运行 `npm run db:import:pg`
4. 在 Vercel 配同名环境变量
5. 重新部署

这样 `/ops`、聊天、资料编辑、登录 token、通知事件等服务端读写链路都会走 PostgreSQL，而不是依赖部署包里的本地 SQLite 文件。

## 文档导航

- [docs/ARCHITECTURE.md](/E:/code/datematch-main/docs/ARCHITECTURE.md)
- [SMTP_EMAIL.md](/E:/code/datematch-main/SMTP_EMAIL.md)
- [docs/product-mechanism.md](/E:/code/datematch-main/docs/product-mechanism.md)
- [docs/knowledge-base/README.md](/E:/code/datematch-main/docs/knowledge-base/README.md)

## 开源边界

这个仓库对应的是一个真实在线产品，但不会包含完整生产环境凭据。

- 邮件、微信、运营后台等能力依赖私有配置
- 仓库不会内置敏感密钥或后台令牌
- 代码可以帮助理解整体实现，但不等于一键复制线上环境

## 推荐 GitHub 仓库短描述

`A live campus matching platform with romance and friendship modes, scheduled releases, chat, notifications, and ops tooling.`
