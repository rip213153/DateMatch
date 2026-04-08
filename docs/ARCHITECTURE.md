# DateMatch 架构说明

这份文档面向维护者，重点讲清楚项目现在是怎么跑的、关键边界在哪里、接下来应该优先优化什么。

## 1. 总体架构

项目是一个 `Next.js 14 + App Router` 的全栈应用。

分层大致如下：

- 页面层：`app/`
- API 层：`app/api/`
- 业务层：`lib/`
- 组件层：`components/`
- 静态配置层：`app/data/`
- 运行时文档和运营配置：`docs/`、`tmp/`

当前不是前后端分离项目，而是同仓一体化结构。

## 2. 双模式设计

系统核心有两个业务模式：

- `romance`
- `friendship`

它们共用页面骨架和大部分逻辑，但数据完全分库：

- [datematch.db](/E:/code/datematch-main/datematch.db)
- [datematch-friendship.db](/E:/code/datematch-main/datematch-friendship.db)

模式路由入口：

- [lib/database.ts](/E:/code/datematch-main/lib/database.ts)

调用方式通常是：

- `resolveQuizMode(...)`
- `getDbForMode(mode)`

## 3. 登录态与鉴权

### 当前机制

当前主登录方式不是验证码，而是“邮箱存在即登录”：

1. 用户在 `/login` 输入已提交档案的邮箱
2. 服务端校验档案存在
3. 服务端写入 `datematch_session`
4. 前端再同步一份 localStorage 作为页面辅助缓存

核心文件：

- [app/api/auth/email-login/request/route.ts](/E:/code/datematch-main/app/api/auth/email-login/request/route.ts)
- [lib/session.ts](/E:/code/datematch-main/lib/session.ts)
- [lib/server-auth.ts](/E:/code/datematch-main/lib/server-auth.ts)
- [lib/auth.ts](/E:/code/datematch-main/lib/auth.ts)

### 当前边界

现在核心业务接口已改成：

- 服务端从 cookie 识别真实用户
- 前端传来的 `userId` 只作为一致性校验
- 模式不匹配时直接拒绝

已接入守卫的主链路包括：

- `/api/users`
- `/api/profile`
- `/api/find-matches`
- `/api/chat/contacts`
- `/api/chat/messages`
- `/api/match-confirmations`
- `/api/match-status`
- `/api/update-name`
- `/api/update-email`
- `/api/update-bio`
- `/api/update-ideal-date`
- `/api/wechat/connect-url`
- `/api/wechat/bind`

### 当前鉴权回归覆盖

目前已经把一批高风险接口的“门口验票”逻辑拆成了可单测的 helper，并补了对应回归测试。

已覆盖的主链路包括：

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

当前这组回归主要防 4 类问题：

- 未登录请求被误放行
- `romance` / `friendship` 模式串用
- 前端伪造 `userId`、`senderId`、`targetUserId`
- 鉴权错误被误包装成普通业务状态，例如“空列表”“当前轮关闭”“等待中”

相关测试文件当前包括：

- `tests/session.test.ts`
- `tests/auth-session-route.test.ts`
- `tests/profile-users-auth.test.ts`
- `tests/chat-findmatches-auth.test.ts`
- `tests/contacts-confirmations-auth.test.ts`
- `tests/matchstatus-wechat-auth.test.ts`
- `tests/update-profile-fields-auth.test.ts`

维护约定建议继续保持：

- 新增需要登录的接口时，优先把“参数解析 + 鉴权入口”抽成独立 helper
- 先测“不是本人不能访问”，再测“本人请求不被误伤”
- 业务状态判断不要吞掉鉴权错误
- 如果接口同时接受 `mode` 和 `userId`，回归里要覆盖 mode 错配和 userId 伪造两类情况

## 4. 提交档案到进入匹配池

用户提交入口：

- [app/find-match/page.tsx](/E:/code/datematch-main/app/find-match/page.tsx)
- [app/find-friends/page.tsx](/E:/code/datematch-main/app/find-friends/page.tsx)

服务端入口：

- [app/api/submit-profile/route.ts](/E:/code/datematch-main/app/api/submit-profile/route.ts)

当前行为：

1. 校验必填字段
2. 用邮箱判断是新增还是更新
3. 决定 `eligible_release_at`
4. 先把资料写入数据库
5. 提交成功后异步发确认邮件

这里已经做过一次性能优化：

- 确认邮件异步化
- 邮箱查重路径收敛

## 5. 匹配结果生成与放榜

核心规则入口：

- [lib/match-schedule.ts](/E:/code/datematch-main/lib/match-schedule.ts)

当前业务规则：

- 每周五 18:00 放榜
- 展示 5 天
- 展示期内新用户进入下一轮

匹配主链路：

- [app/api/find-matches/route.ts](/E:/code/datematch-main/app/api/find-matches/route.ts)
- [lib/mutual-matching.ts](/E:/code/datematch-main/lib/mutual-matching.ts)

当前实现已经不是最初的“纯前端拼全表结果”，但还没有彻底轻量化。

### 第二阶段优化已做部分

- 提交档案接口已提速
- 匹配接口已收敛成更聚焦的数据读取方式
- 一部分联系人查询已不再依赖全量用户对象流转

### 第二阶段还没做完的部分

- 仍有较重的资料读取路径
- 冷启动时数据库初始化副作用偏重
- 某些旧接口还保留旧式计算思路

## 6. 资料编辑机制

资料编辑入口：

- [app/profile/edit/page.tsx](/E:/code/datematch-main/app/profile/edit/page.tsx)
- [app/api/profile/route.ts](/E:/code/datematch-main/app/api/profile/route.ts)

底层规则：

- [lib/profile-updates.ts](/E:/code/datematch-main/lib/profile-updates.ts)

当前设计：

- 立即生效字段直接更新 `profiles`
- 延迟生效字段写入 `profile_update_drafts`
- 到下一轮开放时自动应用草稿

这个设计的目标是避免展示期内改核心画像，破坏当前轮匹配结果。

## 7. 聊天与确认机制

聊天开放前提：

- 双方互相点亮确认

相关入口：

- [app/api/match-confirmations/route.ts](/E:/code/datematch-main/app/api/match-confirmations/route.ts)
- [app/api/chat/contacts/route.ts](/E:/code/datematch-main/app/api/chat/contacts/route.ts)
- [app/api/chat/messages/route.ts](/E:/code/datematch-main/app/api/chat/messages/route.ts)
- [app/chat/page.tsx](/E:/code/datematch-main/app/chat/page.tsx)

当前聊天机制特点：

- 当前轮和历史轮会话是隔离的
- 首条消息有限流，防止连续轰炸
- 联系人列表由“当前轮匹配对象 + 有历史消息的人”组合而成
- 聊天页消息已加内存缓存、并发请求去重和轮询退避
- 联系人列表已加内存缓存和 `sessionStorage` 短期缓存
- 确认状态已加内存缓存，并在切联系人时优先显示当前联系人自己的加载态

### 这里的主要性能问题

- 联系人列表当前还是进入页面即拉取，不是按需增量刷新
- 确认状态仍然会随联系人切换重新请求
- 资料弹窗里的聊天可见性判断仍依赖消息读取结果

这会是第三阶段的重点。

### 第三阶段已做部分

- 页面不可见或窗口失焦时，聊天消息轮询会暂停
- 恢复可见后会主动做一次静默刷新，再重新启动轮询
- 同一会话的消息请求会合并，避免轮询、切换联系人、资料弹窗同时打重复请求
- 消息轮询已改成按会话状态退避：
  - 最近 2 分钟内有活跃消息时，约 `3s`
  - 普通活跃会话，约 `6s`
  - 已发送首条消息、等待对方回复时，约 `10s`
  - 空会话时，约 `15s`
- 联系人列表已增加约 `30s` 的短期缓存，并复用进行中的联系人请求
- 切换联系人时，如果旧会话已有消息，会保留原消息布局并叠加轻量遮罩，而不是整块闪回“加载中”
- 仅在首次进入空会话时展示完整消息加载态，减少联系人切换时的跳屏感
- 切换联系人时，确认状态卡片会先进入当前联系人的专属 loading 文案，避免短暂显示上一个人的描述和按钮
- 切换中的输入框和发送按钮会暂时禁用，避免消息发到错误联系人

当前主要实现位置：

- [app/chat/page.tsx](/E:/code/datematch-main/app/chat/page.tsx)
- [lib/chat-page-state.ts](/E:/code/datematch-main/lib/chat-page-state.ts)
- [lib/use-chat-contacts.ts](/E:/code/datematch-main/lib/use-chat-contacts.ts)
- [lib/use-chat-messages.ts](/E:/code/datematch-main/lib/use-chat-messages.ts)
- [lib/use-chat-confirmation-status.ts](/E:/code/datematch-main/lib/use-chat-confirmation-status.ts)
- `tests/chat-page-state.test.ts`
## 8. 邮件与后台 worker

邮件主入口：

- [lib/email.ts](/E:/code/datematch-main/lib/email.ts)

后台任务入口：

- [lib/email-jobs.ts](/E:/code/datematch-main/lib/email-jobs.ts)
- [instrumentation.ts](/E:/code/datematch-main/instrumentation.ts)
- [register.node.ts](/E:/code/datematch-main/register.node.ts)

当前邮件场景：

- 档案提交确认
- 匹配结果放榜
- 聊天提醒
- 反馈通知

当前已支持双 SMTP 账号：

- 主账号 / 副账号按场景路由
- 账号失败时自动兜底到下一个
- 匹配结果邮件支持日限额阈值切换

详细规则见：

- [SMTP_EMAIL.md](/E:/code/datematch-main/SMTP_EMAIL.md)

## 9. 微信通知链路

主要文件：

- [app/api/wechat/connect-url/route.ts](/E:/code/datematch-main/app/api/wechat/connect-url/route.ts)
- [app/api/wechat/bind/route.ts](/E:/code/datematch-main/app/api/wechat/bind/route.ts)
- [app/api/wechat/process-notifications/route.ts](/E:/code/datematch-main/app/api/wechat/process-notifications/route.ts)

当前作用：

- 用户绑定公众号身份
- 后台根据聊天事件决定是否发微信提醒

目前绑定接口也已经收口到 session 鉴权，不再允许只传 `userId` 绑定别人的微信。

## 10. 运营后台

页面入口：

- [app/ops/page.tsx](/E:/code/datematch-main/app/ops/page.tsx)

当前主要负责：

- 查看公告
- 管理公告覆盖
- 查看轮次概况
- 查看反馈记录

运行时覆盖文件主要在：

- `tmp/ops/`

## 11. 当前主要风险

目前最值得注意的风险和技术债：

- 匹配性能还没有彻底优化完
- 聊天轮询频率高
- 数据库初始化副作用偏重
- 自动化测试覆盖不足
- 仓库中仍有一些历史接口和历史文档
- 部分旧文档存在乱码或信息重复

## 12. 下一步建议顺序

建议继续按这个顺序推进：

1. 完成第二阶段性能优化，先盯匹配接口链路
2. 完成第三阶段聊天轮询优化
3. 补接口级鉴权测试
4. 清理旧接口和重复逻辑
5. 统一整理 `docs/knowledge-base`，修正文档乱码和重复说明
