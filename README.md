# DateMatch

DateMatch 是一个校园场景下的双模式匹配项目，当前同时支持：

- `romance`：恋爱匹配
- `friendship`：搭子 / 朋友匹配

项目已经包含问卷、档案提交、定时匹配、结果展示、点亮确认、聊天、邮件提醒、微信提醒和运营后台等核心链路。

## 项目现状

当前版本重点特征：

- 双模式分库运行，恋爱和搭子数据彼此隔离
- 匹配结果按固定时间窗口放榜
- 资料支持“立即生效”和“下一轮生效”两类修改
- 聊天提醒支持微信和邮件两条链路
- 邮件支持双 SMTP 账号切换和单场景限额兜底
- 核心业务接口已接入服务端 session 校验

## 快速开始

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

如果要启用邮件发送，还需要配置 SMTP。当前项目已支持单账号和双账号两种方式，详情见：

- [SMTP_EMAIL.md](/E:/code/datematch-main/SMTP_EMAIL.md)

### 3. 启动开发环境

```bash
npm run dev
```

Windows 下如果你更习惯后台启动，也可以使用：

```bash
npm run dev:hidden
```

### 4. 常用检查命令

```bash
npm run typecheck
npm test
npm run build
```

## 目录说明

- `app/`：页面路由和 API 路由
- `components/`：通用组件和业务组件
- `lib/`：核心业务逻辑、数据库访问、匹配和通知逻辑
- `docs/`：机制说明、架构文档、知识库资料
- `tests/`：当前自动化测试
- `public/`：静态资源
- `scripts/`：开发和启动辅助脚本
- `tmp/`：本地运行时输出、运营覆盖文件、日志

## 核心业务流程

### 1. 用户进入方式

主要页面路径：

- `/`：首页
- `/quiz`：问卷
- `/results`：问卷结果页
- `/find-match`：恋爱档案提交
- `/find-friends`：搭子档案提交
- `/login`：邮箱登录
- `/dev-channel-2`：匹配结果主页面
- `/chat`：聊天页
- `/profile/edit`：资料编辑页
- `/ops`：运营后台

### 2. 匹配放榜机制

当前规则：

- 每周五 18:00，按北京时间开放匹配结果
- 展示期持续 5 天
- 展示期内新提交档案，自动进入下一轮
- 当前结果按双向 Top 3 互选生成
- 最近 2 周内已展示过的配对不会重复进入新一轮结果

关键实现：

- [lib/match-schedule.ts](/E:/code/datematch-main/lib/match-schedule.ts)
- [app/api/find-matches/route.ts](/E:/code/datematch-main/app/api/find-matches/route.ts)

### 3. 档案编辑机制

当前分两类字段：

- 立即生效：昵称、邮箱、自我介绍、兴趣、理想约会/相处方式
- 下一轮生效：年龄、性别、想认识的对象、学校、人格画像

关键实现：

- [lib/profile-updates.ts](/E:/code/datematch-main/lib/profile-updates.ts)
- [app/api/profile/route.ts](/E:/code/datematch-main/app/api/profile/route.ts)

### 4. 聊天与提醒

当前聊天链路包含：

- 点亮确认后开放聊天
- 聊天事件写入通知队列表
- 微信提醒和邮件提醒由后台 worker 轮询处理
- 邮件提醒有 2 小时冷却窗口

关键实现：

- [app/api/chat/messages/route.ts](/E:/code/datematch-main/app/api/chat/messages/route.ts)
- [lib/chat-notification-events.ts](/E:/code/datematch-main/lib/chat-notification-events.ts)
- [lib/email-jobs.ts](/E:/code/datematch-main/lib/email-jobs.ts)

## 邮件机制

当前邮件能力包括：

- 档案提交确认邮件
- 匹配结果放榜邮件
- 聊天提醒邮件
- 反馈通知邮件

双账号策略已支持：

- 主账号 / 副账号按场景路由
- 主账号达到日限额时，按配置自动切到下一个账号
- 单账号配置仍兼容

详细配置见：

- [SMTP_EMAIL.md](/E:/code/datematch-main/SMTP_EMAIL.md)

## 登录与安全

当前登录策略：

- 用户在 `/login` 输入已提交档案的邮箱
- 服务端校验档案存在后签发 `datematch_session`
- 前端只把 localStorage 当作辅助缓存
- 核心接口以服务端 session 为准

关键实现：

- [lib/session.ts](/E:/code/datematch-main/lib/session.ts)
- [lib/server-auth.ts](/E:/code/datematch-main/lib/server-auth.ts)
- [app/api/auth/session/route.ts](/E:/code/datematch-main/app/api/auth/session/route.ts)

当前已经补上的鉴权回归测试主要覆盖：

- `/api/auth/session`
- `/api/profile`
- `/api/users`
- `/api/find-matches`
- `/api/chat/contacts`
- `/api/chat/messages`
- `/api/match-confirmations`
- `/api/match-status`
- `/api/wechat/connect-url`
- `/api/wechat/bind`
- `/api/update-name`
- `/api/update-email`
- `/api/update-bio`
- `/api/update-ideal-date`

这些回归主要用于防止未登录放行、模式串用、伪造 `userId` / `senderId` / `targetUserId`，以及把鉴权错误误处理成普通业务状态。

## 数据存储

当前默认使用本地 SQLite：

- `datematch.db`：恋爱模式
- `datematch-friendship.db`：搭子模式

数据库结构定义见：

- [lib/schema.ts](/E:/code/datematch-main/lib/schema.ts)

数据库初始化入口见：

- [lib/database.ts](/E:/code/datematch-main/lib/database.ts)

## 已知维护重点

目前最值得持续关注的几块：

- 匹配链路还有进一步提速空间
- 聊天页轮询仍偏频繁
- `lib/database.ts` 冷启动副作用偏重
- 自动化测试覆盖还不够完整
- 运营、机制、技术文档之前比较分散，正在逐步收束

## 推荐阅读顺序

如果你是维护者，建议按这个顺序看：

1. [README.md](/E:/code/datematch-main/README.md)
2. [docs/ARCHITECTURE.md](/E:/code/datematch-main/docs/ARCHITECTURE.md)
3. [SMTP_EMAIL.md](/E:/code/datematch-main/SMTP_EMAIL.md)
4. [docs/product-mechanism.md](/E:/code/datematch-main/docs/product-mechanism.md)
5. [docs/knowledge-base/README.md](/E:/code/datematch-main/docs/knowledge-base/README.md)

## 当前版本

- 应用版本：`v1.0.4`
