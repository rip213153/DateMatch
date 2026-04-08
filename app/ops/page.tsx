import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { serializeHomeAnnouncement } from "@/lib/home-announcement-store";
import { filterOpsFeedbackItems, getOpsDashboardData, normalizeOpsFeedbackFilter } from "@/lib/ops-dashboard";
import { getConfiguredOpsToken, isOpsAuthenticated, isOpsBypassEnabled } from "@/lib/ops-auth";
import {
  clearAnnouncementDraftAction,
  clearPublishedAnnouncementAction,
  loginOpsAction,
  logoutOpsAction,
  publishAnnouncementAction,
  saveAnnouncementDraftAction,
} from "./actions";

export const dynamic = "force-dynamic";

type OpsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const FEEDBACK_PAGE_SIZE = 20;

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readPositivePage(value: string | string[] | undefined) {
  const raw = readSearchParam(value);
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function buildOpsQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const normalized = String(value).trim();
    if (!normalized) continue;
    searchParams.set(key, normalized);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function formatDateTime(value: number | string) {
  const date = typeof value === "number" ? new Date(value) : new Date(value);

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

function getPhaseLabel(phase: string) {
  switch (phase) {
    case "display_window":
      return "展示期";
    case "before_release":
      return "开放前";
    default:
      return "轮次间隔期";
  }
}

function getFeedbackStatusLabel(status: string) {
  switch (status) {
    case "sent":
      return "邮件已发送";
    case "failed":
      return "发送失败";
    default:
      return "已收到";
  }
}

function getFeedbackStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "sent":
      return "default";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

function getAnnouncementSourceLabel(source: "default" | "override") {
  return source === "override" ? "已发布覆盖" : "代码默认";
}

function getAnnouncementEditorSourceLabel(source: "default" | "published" | "draft") {
  switch (source) {
    case "draft":
      return "草稿";
    case "published":
      return "已发布版本";
    default:
      return "默认公告";
  }
}

function getInspectionModeTitle(mode: string) {
  return mode === "friendship" ? "友情模式" : "恋爱模式";
}

function formatPercent(value: number) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}

function getTraceBucketLabel(bucket: string) {
  switch (bucket) {
    case "profile":
      return "画像";
    case "complementary":
      return "互补";
    case "shared":
      return "共同点";
    case "context":
      return "现实入口";
    default:
      return "兜底";
  }
}

function getTraceEvidenceLabel(key: string) {
  switch (key) {
    case "personality":
      return "性格支撑";
    case "interests":
      return "兴趣支撑";
    case "background":
      return "背景支撑";
    default:
      return "互补支撑";
  }
}

function getBannerMessage(searchParams?: OpsPageProps["searchParams"]) {
  const error = readSearchParam(searchParams?.error);
  const saved = readSearchParam(searchParams?.saved);

  if (error) {
    return {
      tone: "error" as const,
      text: error,
    };
  }

  switch (saved) {
    case "announcement_draft":
      return {
        tone: "success" as const,
        text: "公告草稿已保存，尚未影响首页。",
      };
    case "announcement_published":
      return {
        tone: "success" as const,
        text: "公告已发布到首页。",
      };
    case "announcement_cleared":
      return {
        tone: "success" as const,
        text: "已清除发布公告，首页当前回退为默认公告。",
      };
    case "announcement_draft_cleared":
      return {
        tone: "success" as const,
        text: "公告草稿已清除。",
      };
    default:
      return null;
  }
}

export default async function OpsPage({ searchParams }: OpsPageProps) {
  const tokenConfigured = Boolean(getConfiguredOpsToken());
  const bypassEnabled = isOpsBypassEnabled();
  const authenticated = isOpsAuthenticated();
  const banner = getBannerMessage(searchParams);

  if (!authenticated && tokenConfigured) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900 sm:px-8">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>运营后台登录</CardTitle>
              <CardDescription>请输入配置在 `OPS_DASHBOARD_TOKEN` 中的访问令牌。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {banner ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {banner.text}
                </div>
              ) : null}

              <form action={loginOpsAction} className="space-y-3">
                <Input name="token" type="password" placeholder="后台访问令牌" autoComplete="current-password" />
                <Button type="submit" className="w-full">
                  登录
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!authenticated && !bypassEnabled) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>运营后台未启用</CardTitle>
              <CardDescription>在生产环境访问 `/ops` 前，请先配置 `OPS_DASHBOARD_TOKEN`。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-neutral-600">
              <p>建议为运营同学配置一个部署级别的独立令牌，不要在公开渠道中共享。</p>
              <p>在本地开发环境下，如果没有配置令牌，后台会默认自动解锁。</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const dashboard = await getOpsDashboardData();
  const feedbackFilter = normalizeOpsFeedbackFilter({
    status: readSearchParam(searchParams?.feedbackStatus),
    source: readSearchParam(searchParams?.feedbackSource),
    query: readSearchParam(searchParams?.feedbackQuery),
  });
  const feedbackPage = readPositivePage(searchParams?.feedbackPage);
  const filteredFeedbackItems = filterOpsFeedbackItems(dashboard.feedback.items, feedbackFilter);
  const totalFeedbackPages = Math.max(1, Math.ceil(filteredFeedbackItems.length / FEEDBACK_PAGE_SIZE));
  const safeFeedbackPage = Math.min(feedbackPage, totalFeedbackPages);
  const feedbackOffset = (safeFeedbackPage - 1) * FEEDBACK_PAGE_SIZE;
  const pagedFeedbackItems = filteredFeedbackItems.slice(feedbackOffset, feedbackOffset + FEEDBACK_PAGE_SIZE);

  const filterQueryString = buildOpsQueryString({
    feedbackStatus: feedbackFilter.status || undefined,
    feedbackSource: feedbackFilter.source || undefined,
    feedbackQuery: feedbackFilter.query || undefined,
  });
  const previousFeedbackPageHref =
    safeFeedbackPage > 1
      ? `/ops${buildOpsQueryString({
          feedbackStatus: feedbackFilter.status || undefined,
          feedbackSource: feedbackFilter.source || undefined,
          feedbackQuery: feedbackFilter.query || undefined,
          feedbackPage: safeFeedbackPage - 1,
        })}`
      : null;
  const nextFeedbackPageHref =
    safeFeedbackPage < totalFeedbackPages
      ? `/ops${buildOpsQueryString({
          feedbackStatus: feedbackFilter.status || undefined,
          feedbackSource: feedbackFilter.source || undefined,
          feedbackQuery: feedbackFilter.query || undefined,
          feedbackPage: safeFeedbackPage + 1,
        })}`
      : null;
  const feedbackExportHref = `/api/ops/feedback/export${filterQueryString}`;
  const dashboardSnapshotHref = `/api/ops/dashboard${filterQueryString}`;

  const alertToneClassName = {
    info: "border-sky-200 bg-sky-50 text-sky-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
  } as const;

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{bypassEnabled ? "本地直通" : "令牌保护"}</Badge>
              <Badge variant="secondary">{getPhaseLabel(dashboard.schedule.phase)}</Badge>
              <Badge variant={dashboard.announcement.source === "override" ? "default" : "outline"}>
                首页生效：{getAnnouncementSourceLabel(dashboard.announcement.source)}
              </Badge>
              {dashboard.announcement.hasDraft ? <Badge variant="secondary">存在草稿</Badge> : null}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">DateMatch 运营后台</h1>
            <p className="text-sm text-neutral-600">
              生成时间：{formatDateTime(dashboard.generatedAt)}，用于查看公告、排期、反馈和模式健康度。
            </p>
          </div>

          {!bypassEnabled ? (
            <form action={logoutOpsAction}>
              <Button type="submit" variant="outline">
                退出登录
              </Button>
            </form>
          ) : null}
        </section>

        {banner ? (
          <div
            className={
              banner.tone === "error"
                ? "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                : "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            }
          >
            {banner.text}
          </div>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-xl border bg-white px-4 py-4">
            <p className="text-xs text-neutral-500">档案总数</p>
            <p className="mt-1 text-2xl font-semibold">{dashboard.overview.totalProfiles}</p>
          </div>
          <div className="rounded-xl border bg-white px-4 py-4">
            <p className="text-xs text-neutral-500">本轮配对数</p>
            <p className="mt-1 text-2xl font-semibold">{dashboard.overview.totalCurrentRoundPairs}</p>
          </div>
          <div className="rounded-xl border bg-white px-4 py-4">
            <p className="text-xs text-neutral-500">双向确认数</p>
            <p className="mt-1 text-2xl font-semibold">{dashboard.overview.totalFullyConfirmedPairs}</p>
          </div>
          <div className="rounded-xl border bg-white px-4 py-4">
            <p className="text-xs text-neutral-500">待发送通知</p>
            <p className="mt-1 text-2xl font-semibold">{dashboard.overview.totalPendingNotifications}</p>
          </div>
          <div className="rounded-xl border bg-white px-4 py-4">
            <p className="text-xs text-neutral-500">失败通知</p>
            <p className="mt-1 text-2xl font-semibold">{dashboard.overview.totalFailedNotifications}</p>
          </div>
          <div className="rounded-xl border bg-white px-4 py-4">
            <p className="text-xs text-neutral-500">反馈记录数</p>
            <p className="mt-1 text-2xl font-semibold">{dashboard.overview.totalFeedback}</p>
          </div>
        </section>

        {dashboard.alerts.length > 0 ? (
          <section className="space-y-3">
            {dashboard.alerts.map((alert) => (
              <div
                key={`${alert.level}-${alert.title}`}
                className={`rounded-lg border px-4 py-3 text-sm ${alertToneClassName[alert.level]}`}
              >
                <p className="font-medium">{alert.title}</p>
                <p className="mt-1 leading-6">{alert.message}</p>
              </div>
            ))}
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>公告配置</CardTitle>
              <CardDescription>保存草稿不会影响首页，只有点击“发布到首页”后才会正式生效。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm text-neutral-600 sm:grid-cols-3">
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="font-medium text-neutral-900">默认配置文件</p>
                  <p className="mt-1 break-all font-mono text-xs">{dashboard.announcement.defaultPath}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="font-medium text-neutral-900">已发布文件</p>
                  <p className="mt-1 break-all font-mono text-xs">{dashboard.announcement.overridePath}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="font-medium text-neutral-900">草稿文件</p>
                  <p className="mt-1 break-all font-mono text-xs">{dashboard.announcement.draftPath}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-white px-4 py-3 text-sm text-neutral-700">
                  <p className="font-medium text-neutral-900">首页当前生效公告</p>
                  <p className="mt-2">来源：{getAnnouncementSourceLabel(dashboard.announcement.source)}</p>
                  <p>标题：{dashboard.announcement.data.title}</p>
                  <p>更新时间：{dashboard.announcement.data.updatedAt}</p>
                  <p>内容块数：{dashboard.announcement.data.blocks.length}</p>
                  <p>是否启用：{dashboard.announcement.data.enabled ? "是" : "否"}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3 text-sm text-neutral-700">
                  <p className="font-medium text-neutral-900">编辑器当前内容</p>
                  <p className="mt-2">来源：{getAnnouncementEditorSourceLabel(dashboard.announcement.editorSource)}</p>
                  <p>存在草稿：{dashboard.announcement.hasDraft ? "是" : "否"}</p>
                  <p>已发布覆盖：{dashboard.announcement.hasPublishedOverride ? "是" : "否"}</p>
                  <p>标题：{dashboard.announcement.editorData.title}</p>
                  <p>更新时间：{dashboard.announcement.editorData.updatedAt}</p>
                </div>
              </div>

              <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                推荐流程：先保存草稿，自查无误后再点击“发布到首页”。即使草稿格式有问题，也不会直接影响线上首页。
              </div>

              {dashboard.announcement.warning ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  公告文件读取异常，系统已自动回退到可用配置：{dashboard.announcement.warning}
                </div>
              ) : null}

              <form className="space-y-3">
                <Textarea
                  name="payload"
                  defaultValue={serializeHomeAnnouncement(dashboard.announcement.editorData)}
                  className="min-h-[360px] font-mono text-sm"
                />
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" formAction={saveAnnouncementDraftAction}>
                    保存草稿
                  </Button>
                  <Button type="submit" formAction={publishAnnouncementAction}>
                    发布到首页
                  </Button>
                  <Button type="submit" variant="outline" formAction={clearPublishedAnnouncementAction}>
                    恢复默认公告
                  </Button>
                  <Button type="submit" variant="outline" formAction={clearAnnouncementDraftAction}>
                    清除草稿
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>匹配排期</CardTitle>
              <CardDescription>查看当前匹配阶段和关键时间点。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-neutral-700">
              <div className="rounded-lg border bg-white px-4 py-3">
                <p className="font-medium text-neutral-900">当前阶段</p>
                <p className="mt-1">{getPhaseLabel(dashboard.schedule.phase)}</p>
              </div>
              <div className="rounded-lg border bg-white px-4 py-3">
                <p className="font-medium text-neutral-900">本轮开放时间</p>
                <p className="mt-1">{formatDateTime(dashboard.schedule.releaseAt)}</p>
              </div>
              <div className="rounded-lg border bg-white px-4 py-3">
                <p className="font-medium text-neutral-900">展示期结束时间</p>
                <p className="mt-1">{formatDateTime(dashboard.schedule.displayEndAt)}</p>
              </div>
              <div className="rounded-lg border bg-white px-4 py-3">
                <p className="font-medium text-neutral-900">下轮开放时间</p>
                <p className="mt-1">{formatDateTime(dashboard.schedule.nextReleaseAt)}</p>
              </div>
              <div className="rounded-lg border bg-white px-4 py-3">
                <p className="font-medium text-neutral-900">轮次标识</p>
                <p className="mt-1 break-all font-mono text-xs">{dashboard.schedule.roundKey}</p>
              </div>
              <div className="rounded-lg border bg-white px-4 py-3">
                <p className="font-medium text-neutral-900">排期参数</p>
                <p className="mt-1">
                  每周在星期 {dashboard.schedule.matchDay} 的{" "}
                  {String(dashboard.schedule.matchHour).padStart(2, "0")}:
                  {String(dashboard.schedule.matchMinute).padStart(2, "0")} 开放匹配，展示期持续{" "}
                  {dashboard.schedule.displayDays} 天
                </p>
              </div>
              <div className="rounded-lg border bg-white px-4 py-3">
                <p className="font-medium text-neutral-900">首页公告预览</p>
                <div className="mt-2 space-y-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {dashboard.announcement.data.badge}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">{dashboard.announcement.data.title}</p>
                    <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-600">
                      {dashboard.announcement.data.summary}
                    </p>
                  </div>
                  {dashboard.announcement.data.blocks.slice(0, 2).map((block) => (
                    <div key={block.title} className="rounded-lg border border-slate-200 px-3 py-2">
                      <p className="text-sm font-medium text-slate-900">{block.title}</p>
                      <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600">{block.content}</p>
                    </div>
                  ))}
                  {dashboard.announcement.data.blocks.length > 2 ? (
                    <p className="text-xs text-neutral-500">
                      另外还有 {dashboard.announcement.data.blocks.length - 2} 个内容块未展示
                    </p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {dashboard.modes.map((modeStats) => (
            <Card key={modeStats.mode}>
              <CardHeader>
                <CardTitle>{modeStats.mode === "romance" ? "恋爱模式" : "找朋友模式"}</CardTitle>
                <CardDescription>展示该模式下当前人池和本轮匹配的核心运营数据。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="text-xs text-neutral-500">档案数</p>
                  <p className="mt-1 text-2xl font-semibold">{modeStats.totalProfiles}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="text-xs text-neutral-500">本轮可参与人数</p>
                  <p className="mt-1 text-2xl font-semibold">{modeStats.eligibleForCurrentRound}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="text-xs text-neutral-500">排入下一轮人数</p>
                  <p className="mt-1 text-2xl font-semibold">{modeStats.queuedForNextRound}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="text-xs text-neutral-500">本轮退出人数</p>
                  <p className="mt-1 text-2xl font-semibold">{modeStats.optedOutForCurrentRound}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="text-xs text-neutral-500">近 7 天新增档案</p>
                  <p className="mt-1 text-2xl font-semibold">{modeStats.profilesCreatedInLast7Days}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="text-xs text-neutral-500">待处理资料草稿</p>
                  <p className="mt-1 text-2xl font-semibold">{modeStats.pendingDrafts}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="text-xs text-neutral-500">本轮配对数</p>
                  <p className="mt-1 text-2xl font-semibold">{modeStats.currentRoundPairs}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="text-xs text-neutral-500">双向确认数</p>
                  <p className="mt-1 text-2xl font-semibold">{modeStats.fullyConfirmedPairs}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="text-xs text-neutral-500">近 24 小时消息数</p>
                  <p className="mt-1 text-2xl font-semibold">{modeStats.messagesLast24Hours}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="text-xs text-neutral-500">待发送通知</p>
                  <p className="mt-1 text-2xl font-semibold">{modeStats.pendingNotifications}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="text-xs text-neutral-500">失败通知</p>
                  <p className="mt-1 text-2xl font-semibold">{modeStats.failedNotifications}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-3">
                  <p className="text-xs text-neutral-500">微信绑定 / 通知开启</p>
                  <p className="mt-1 text-lg font-semibold">
                    {modeStats.wechatBoundProfiles} / {modeStats.wechatNoticeOptInProfiles}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-6">
          {dashboard.inspections.map((inspection) => (
            <Card key={inspection.mode}>
              <CardHeader>
                <CardTitle>{getInspectionModeTitle(inspection.mode)} · V2 样本巡检</CardTitle>
                <CardDescription>
                  当前轮次 {inspection.roundKey}，抽取 {inspection.sampleCount} 个真实用户视角样本，用来查看 opener /
                  highlight / trace / 结果页末尾画像延伸是否一致。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {inspection.samples.length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-white px-4 py-8 text-center text-sm text-neutral-500">
                    当前轮次还没有可巡检的配对样本。
                  </div>
                ) : (
                  inspection.samples.map((sample) => (
                    <div key={sample.id} className="rounded-xl border bg-white p-4">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{sample.perspective.profileTitle}</Badge>
                            <Badge variant="outline">pair {formatPercent(sample.pairScore)}</Badge>
                            <Badge variant="outline">overall {formatPercent(sample.overallScore)}</Badge>
                          </div>
                          <div className="text-sm leading-6 text-neutral-700">
                            <span className="font-medium text-neutral-900">
                              {sample.perspective.name} ({sample.perspective.age})
                            </span>
                            <span className="mx-2 text-neutral-400">→</span>
                            <span className="font-medium text-neutral-900">
                              {sample.target.name} ({sample.target.age})
                            </span>
                            <span className="ml-2 text-neutral-500">
                              {sample.perspective.university} / {sample.target.university}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500">
                            目标画像：{sample.target.profileTitle}
                          </p>
                        </div>

                        <div className="grid gap-2 text-xs text-neutral-600 sm:grid-cols-2 xl:min-w-[320px]">
                          <div className="rounded-lg border bg-neutral-50 px-3 py-2">
                            <p className="font-medium text-neutral-900">关系理解</p>
                            <p className="mt-1">{formatPercent(sample.breakdown.personality)}</p>
                          </div>
                          <div className="rounded-lg border bg-neutral-50 px-3 py-2">
                            <p className="font-medium text-neutral-900">话题入口</p>
                            <p className="mt-1">{formatPercent(sample.breakdown.interests)}</p>
                          </div>
                          <div className="rounded-lg border bg-neutral-50 px-3 py-2">
                            <p className="font-medium text-neutral-900">现实落点</p>
                            <p className="mt-1">{formatPercent(sample.breakdown.background)}</p>
                          </div>
                          <div className="rounded-lg border bg-neutral-50 px-3 py-2">
                            <p className="font-medium text-neutral-900">节奏互补</p>
                            <p className="mt-1">{formatPercent(sample.breakdown.complementary)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                              Highlights
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {sample.highlights.map((item) => (
                                <Badge key={item} variant="secondary" className="rounded-full">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                              Openers
                            </p>
                            <div className="mt-2 space-y-2">
                              {sample.iceBreakers.map((item) => (
                                <div key={item} className="rounded-lg border bg-neutral-50 px-3 py-2 text-sm leading-6 text-neutral-700">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                              Trace
                            </p>
                            <div className="mt-2 space-y-2">
                              {sample.trace.map((item) => (
                                <div key={`${sample.id}:${item.text}`} className="rounded-lg border bg-neutral-50 px-3 py-3 text-sm text-neutral-700">
                                  <p className="font-medium text-neutral-900">{item.text}</p>
                                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500">
                                    <span>{getTraceBucketLabel(item.bucket)}</span>
                                    <span>·</span>
                                    <span>{getTraceEvidenceLabel(item.evidenceKey)}</span>
                                    <span>·</span>
                                    <span>支撑 {formatPercent(item.evidenceScore)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border bg-emerald-50/60 px-3 py-3">
                              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                                结果页末尾卡片 · 更容易被吸引 / 留住
                              </p>
                              <ul className="mt-2 space-y-1 text-sm leading-6 text-neutral-700">
                                {sample.bestMatches.map((item) => (
                                  <li key={item}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-lg border bg-rose-50/60 px-3 py-3">
                              <p className="text-xs font-medium uppercase tracking-wide text-rose-700">
                                结果页末尾卡片 · 更容易卡住 / 觉得费力
                              </p>
                              <ul className="mt-2 space-y-1 text-sm leading-6 text-neutral-700">
                                {sample.challengingMatches.map((item) => (
                                  <li key={item}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>最近反馈</CardTitle>
            <CardDescription>
              反馈日志文件：<span className="font-mono text-xs">{dashboard.feedback.filePath}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action="/ops" method="get" className="grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-4">
              <div className="space-y-2">
                <label htmlFor="feedbackStatus" className="text-xs font-medium text-neutral-600">
                  状态
                </label>
                <select
                  id="feedbackStatus"
                  name="feedbackStatus"
                  defaultValue={feedbackFilter.status || "all"}
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="all">全部</option>
                  <option value="received">已收到</option>
                  <option value="sent">邮件已发送</option>
                  <option value="failed">发送失败</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="feedbackSource" className="text-xs font-medium text-neutral-600">
                  来源
                </label>
                <Input
                  id="feedbackSource"
                  name="feedbackSource"
                  defaultValue={feedbackFilter.source}
                  placeholder="例如 home / chat"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="feedbackQuery" className="text-xs font-medium text-neutral-600">
                  关键词
                </label>
                <Input
                  id="feedbackQuery"
                  name="feedbackQuery"
                  defaultValue={feedbackFilter.query}
                  placeholder="昵称、来源或反馈内容"
                />
              </div>
              <div className="sm:col-span-4 flex flex-wrap items-center gap-3">
                <Button type="submit">应用筛选</Button>
                <Button asChild type="button" variant="outline">
                  <a href="/ops">重置</a>
                </Button>
                <Button asChild type="button" variant="outline">
                  <a href={feedbackExportHref}>导出 CSV</a>
                </Button>
                <Button asChild type="button" variant="outline">
                  <a href={dashboardSnapshotHref}>导出 JSON 快照</a>
                </Button>
                <span className="text-xs text-neutral-500">
                  当前显示 {filteredFeedbackItems.length} / {dashboard.feedback.items.length} 条已加载记录
                </span>
              </div>
            </form>

            {dashboard.feedback.sources.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {dashboard.feedback.sources.slice(0, 8).map((source) => (
                  <Badge key={source.source} variant="outline">
                    {source.source} ({source.count})
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border bg-white px-4 py-3">
                <p className="text-xs text-neutral-500">总数</p>
                <p className="mt-1 text-2xl font-semibold">{dashboard.feedback.total}</p>
              </div>
              <div className="rounded-lg border bg-white px-4 py-3">
                <p className="text-xs text-neutral-500">邮件已发送</p>
                <p className="mt-1 text-2xl font-semibold">{dashboard.feedback.sent}</p>
              </div>
              <div className="rounded-lg border bg-white px-4 py-3">
                <p className="text-xs text-neutral-500">待处理</p>
                <p className="mt-1 text-2xl font-semibold">{dashboard.feedback.pending}</p>
              </div>
              <div className="rounded-lg border bg-white px-4 py-3">
                <p className="text-xs text-neutral-500">失败</p>
                <p className="mt-1 text-2xl font-semibold">{dashboard.feedback.failed}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm text-neutral-600">
              <span>
                第 {safeFeedbackPage} / {totalFeedbackPages} 页
              </span>
              <div className="flex items-center gap-3">
                {previousFeedbackPageHref ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={previousFeedbackPageHref}>上一页</a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    上一页
                  </Button>
                )}
                {nextFeedbackPageHref ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={nextFeedbackPageHref}>下一页</a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    下一页
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {pagedFeedbackItems.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-white px-4 py-8 text-center text-sm text-neutral-500">
                  当前筛选条件下没有匹配到反馈记录。
                </div>
              ) : (
                pagedFeedbackItems.map((item) => (
                  <div key={item.id} className="rounded-lg border bg-white px-4 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={getFeedbackStatusVariant(item.status)}>
                            {getFeedbackStatusLabel(item.status)}
                          </Badge>
                          <span className="text-xs text-neutral-500">{formatDateTime(item.submittedAt)}</span>
                        </div>
                        <p className="text-sm text-neutral-600">
                          来源：{item.source} / 昵称：{item.nickname}
                        </p>
                      </div>
                      {item.emailId ? (
                        <span className="font-mono text-xs text-neutral-500">emailId: {item.emailId}</span>
                      ) : null}
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-neutral-800">{item.content}</p>
                    {item.error ? (
                      <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {item.error}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
