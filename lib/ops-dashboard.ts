import { gte, eq, sql } from "drizzle-orm";
import { readFile } from "fs/promises";
import path from "path";
import type { QuizMode } from "@/app/data/types";
import {
  HOME_ANNOUNCEMENT_DEFAULT_PATH,
  HOME_ANNOUNCEMENT_DRAFT_PATH,
  HOME_ANNOUNCEMENT_OVERRIDE_PATH,
  getHomeAnnouncementEditorState,
  getResolvedHomeAnnouncement,
} from "@/lib/home-announcement-store";
import { getDbForMode } from "@/lib/database";
import { buildMutualRoundKey } from "@/lib/mutual-matching";
import { DISPLAY_DAYS, MATCH_DAY, MATCH_HOUR, MATCH_MINUTE, getMatchSchedule, isOptedOutForRound } from "@/lib/match-schedule";
import { chatMessages, chatNotificationEvents, matchPairs, profileUpdateDrafts, profiles } from "@/lib/schema";
import {
  filterOpsFeedbackItems,
  normalizeOpsFeedbackFilter,
  type FeedbackLogStatus,
  type OpsFeedbackFilter,
  type OpsFeedbackItem,
  type OpsFeedbackSourceStat,
} from "@/lib/ops-feedback";

export { filterOpsFeedbackItems, normalizeOpsFeedbackFilter };
export type { OpsFeedbackFilter, OpsFeedbackItem, OpsFeedbackSourceStat };

const DAY_MS = 24 * 60 * 60 * 1000;
const FEEDBACK_LOG_PATH = path.join(process.cwd(), "tmp", "feedback", "feedback-submissions.ndjson");

type FeedbackLogRecord = {
  submittedAt?: string;
  source?: string;
  nickname?: string;
  content?: string;
  status?: FeedbackLogStatus;
  emailId?: string;
  error?: string;
};

export type OpsModeStats = {
  mode: QuizMode;
  totalProfiles: number;
  eligibleForCurrentRound: number;
  queuedForNextRound: number;
  optedOutForCurrentRound: number;
  profilesCreatedInLast7Days: number;
  wechatBoundProfiles: number;
  wechatNoticeOptInProfiles: number;
  pendingDrafts: number;
  currentRoundPairs: number;
  fullyConfirmedPairs: number;
  messagesLast24Hours: number;
  pendingNotifications: number;
  failedNotifications: number;
};

export type OpsAlert = {
  level: "info" | "warning" | "error";
  title: string;
  message: string;
};

export type OpsDashboardData = {
  generatedAt: string;
  overview: {
    totalProfiles: number;
    totalCurrentRoundPairs: number;
    totalFullyConfirmedPairs: number;
    totalPendingNotifications: number;
    totalFailedNotifications: number;
    totalFeedback: number;
  };
  alerts: OpsAlert[];
  announcement: {
    source: "default" | "override";
    warning: string | null;
    defaultPath: string;
    overridePath: string;
    draftPath: string;
    data: Awaited<ReturnType<typeof getResolvedHomeAnnouncement>>["announcement"];
    editorData: Awaited<ReturnType<typeof getHomeAnnouncementEditorState>>["announcement"];
    editorSource: Awaited<ReturnType<typeof getHomeAnnouncementEditorState>>["source"];
    hasDraft: boolean;
    hasPublishedOverride: boolean;
  };
  schedule: {
    phase: ReturnType<typeof getMatchSchedule>["phase"];
    now: number;
    releaseAt: number;
    displayEndAt: number;
    nextReleaseAt: number;
    displayDays: number;
    matchDay: number;
    matchHour: number;
    matchMinute: number;
    roundKey: string;
  };
  feedback: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    items: OpsFeedbackItem[];
    sources: OpsFeedbackSourceStat[];
    filePath: string;
  };
  modes: OpsModeStats[];
};

function toTimestamp(value: unknown): number | null {
  if (!value) return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const timestamp = new Date(String(value)).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isEligibleForRelease(value: unknown, releaseAt: number) {
  const timestamp = toTimestamp(value);
  if (timestamp === null) return true;
  return timestamp <= releaseAt;
}

function getFeedbackStatusRank(status: FeedbackLogStatus) {
  switch (status) {
    case "failed":
      return 3;
    case "sent":
      return 2;
    default:
      return 1;
  }
}


export async function getFeedbackSummary(limit: number = 200) {
  try {
    const raw = await readFile(FEEDBACK_LOG_PATH, "utf8");
    const lines = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const items = new Map<string, OpsFeedbackItem>();

    for (const line of lines) {
      try {
        const record = JSON.parse(line) as FeedbackLogRecord;
        const submittedAt = record.submittedAt ?? new Date(0).toISOString();
        const source = record.source ?? "unknown";
        const nickname = record.nickname ?? "鍖垮悕";
        const content = record.content ?? "";
        const status = record.status ?? "received";
        const key = [submittedAt, source, nickname, content].join("::");
        const nextItem: OpsFeedbackItem = {
          id: key,
          submittedAt,
          source,
          nickname,
          content,
          status,
          emailId: record.emailId ?? null,
          error: record.error ?? null,
        };
        const current = items.get(key);

        if (!current || getFeedbackStatusRank(status) >= getFeedbackStatusRank(current.status)) {
          items.set(key, nextItem);
        }
      } catch (error) {
        console.error("Failed to parse feedback record:", error);
      }
    }

    const sortedItems = Array.from(items.values()).sort((a, b) => {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
    const sources = Array.from(
      sortedItems.reduce((map, item) => {
        map.set(item.source, (map.get(item.source) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
    )
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source));

    return {
      total: sortedItems.length,
      sent: sortedItems.filter((item) => item.status === "sent").length,
      failed: sortedItems.filter((item) => item.status === "failed").length,
      pending: sortedItems.filter((item) => item.status === "received").length,
      items: limit > 0 ? sortedItems.slice(0, limit) : sortedItems,
      sources,
      filePath: FEEDBACK_LOG_PATH,
    };
  } catch {
    return {
      total: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      items: [] as OpsFeedbackItem[],
      sources: [] as OpsFeedbackSourceStat[],
      filePath: FEEDBACK_LOG_PATH,
    };
  }
}

function buildOpsAlerts(
  schedule: ReturnType<typeof getMatchSchedule>,
  modes: OpsModeStats[],
  feedback: Awaited<ReturnType<typeof getFeedbackSummary>>,
  announcement: Awaited<ReturnType<typeof getResolvedHomeAnnouncement>>
): OpsAlert[] {
  const alerts: OpsAlert[] = [];
  const getModeLabel = (mode: QuizMode) => (mode === "romance" ? "恋爱模式" : "找朋友模式");

  if (announcement.warning) {
    alerts.push({
      level: "warning",
      title: "公告覆盖已回退",
      message: "运行时公告覆盖文件无效，系统已自动回退到代码默认配置。",
    });
  }

  if (feedback.failed > 0) {
    alerts.push({
      level: "warning",
      title: "反馈邮件发送失败",
      message: `当前有 ${feedback.failed} 条反馈在发送邮件通知时失败。`,
    });
  }

  const totalFailedNotifications = modes.reduce((sum, mode) => sum + mode.failedNotifications, 0);
  if (totalFailedNotifications > 0) {
    alerts.push({
      level: "warning",
      title: "消息通知失败",
      message: `当前有 ${totalFailedNotifications} 条聊天通知事件被标记为失败。`,
    });
  }

  if (schedule.phase === "display_window") {
    const zeroPairModes = modes.filter((mode) => mode.currentRoundPairs === 0);
    if (zeroPairModes.length > 0) {
      alerts.push({
        level: "error",
        title: "展示期内无配对数据",
        message: `${zeroPairModes.map((mode) => getModeLabel(mode.mode)).join("、")} 当前处于展示期，但本轮没有生成配对数据。`,
      });
    }
  }

  const lowEligibleModes = modes.filter((mode) => mode.eligibleForCurrentRound <= 1 && mode.totalProfiles > 0);
  if (lowEligibleModes.length > 0) {
    alerts.push({
      level: "info",
      title: "可匹配人池偏小",
      message: `${lowEligibleModes.map((mode) => getModeLabel(mode.mode)).join("、")} 当前轮次的可参与人数偏少，请留意匹配池健康度。`,
    });
  }

  return alerts;
}

async function getModeStats(mode: QuizMode, now: Date, releaseAt: number): Promise<OpsModeStats> {
  const db = getDbForMode(mode);
  const profilesRows = await db
    .select({
      eligibleReleaseAt: profiles.eligible_release_at,
      matchOptOutUntil: profiles.match_opt_out_until,
      createdAt: profiles.created_at,
      wechatOpenId: profiles.wechat_open_id,
      wechatNoticeOptIn: profiles.wechat_notice_opt_in,
    })
    .from(profiles);

  const pendingDraftRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(profileUpdateDrafts)
    .where(eq(profileUpdateDrafts.status, "PENDING"));

  const pairRows = await db
    .select({
      userAConfirmedAt: matchPairs.user_a_confirmed_at,
      userBConfirmedAt: matchPairs.user_b_confirmed_at,
    })
    .from(matchPairs)
    .where(eq(matchPairs.round_key, buildMutualRoundKey(mode, releaseAt)));

  const messageRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(chatMessages)
    .where(gte(chatMessages.created_at, new Date(now.getTime() - DAY_MS)));

  const notificationRows = await db
    .select({
      status: chatNotificationEvents.status,
    })
    .from(chatNotificationEvents);

  return {
    mode,
    totalProfiles: profilesRows.length,
    eligibleForCurrentRound: profilesRows.filter((row) => isEligibleForRelease(row.eligibleReleaseAt, releaseAt)).length,
    queuedForNextRound: profilesRows.filter((row) => !isEligibleForRelease(row.eligibleReleaseAt, releaseAt)).length,
    optedOutForCurrentRound: profilesRows.filter((row) => isOptedOutForRound(row.matchOptOutUntil, now)).length,
    profilesCreatedInLast7Days: profilesRows.filter((row) => {
      const timestamp = toTimestamp(row.createdAt);
      return timestamp !== null && timestamp >= now.getTime() - 7 * DAY_MS;
    }).length,
    wechatBoundProfiles: profilesRows.filter((row) => Boolean(row.wechatOpenId)).length,
    wechatNoticeOptInProfiles: profilesRows.filter((row) => Boolean(row.wechatNoticeOptIn)).length,
    pendingDrafts: Number(pendingDraftRows[0]?.count ?? 0),
    currentRoundPairs: pairRows.length,
    fullyConfirmedPairs: pairRows.filter((row) => Boolean(row.userAConfirmedAt) && Boolean(row.userBConfirmedAt)).length,
    messagesLast24Hours: Number(messageRows[0]?.count ?? 0),
    pendingNotifications: notificationRows.filter((row) => row.status === "PENDING").length,
    failedNotifications: notificationRows.filter((row) => row.status === "FAILED").length,
  };
}

export async function getOpsDashboardData(now: Date = new Date()): Promise<OpsDashboardData> {
  const schedule = getMatchSchedule(now);
  const [announcement, editorAnnouncement, romanceStats, friendshipStats, feedback] = await Promise.all([
    getResolvedHomeAnnouncement(),
    getHomeAnnouncementEditorState(),
    getModeStats("romance", now, schedule.releaseAt),
    getModeStats("friendship", now, schedule.releaseAt),
    getFeedbackSummary(500),
  ]);
  const modes = [romanceStats, friendshipStats];
  const alerts = buildOpsAlerts(schedule, modes, feedback, announcement);

  return {
    generatedAt: now.toISOString(),
    overview: {
      totalProfiles: modes.reduce((sum, mode) => sum + mode.totalProfiles, 0),
      totalCurrentRoundPairs: modes.reduce((sum, mode) => sum + mode.currentRoundPairs, 0),
      totalFullyConfirmedPairs: modes.reduce((sum, mode) => sum + mode.fullyConfirmedPairs, 0),
      totalPendingNotifications: modes.reduce((sum, mode) => sum + mode.pendingNotifications, 0),
      totalFailedNotifications: modes.reduce((sum, mode) => sum + mode.failedNotifications, 0),
      totalFeedback: feedback.total,
    },
    alerts,
    announcement: {
      source: announcement.source,
      warning: editorAnnouncement.warning ?? announcement.warning,
      defaultPath: HOME_ANNOUNCEMENT_DEFAULT_PATH,
      overridePath: HOME_ANNOUNCEMENT_OVERRIDE_PATH,
      data: announcement.announcement,
      draftPath: HOME_ANNOUNCEMENT_DRAFT_PATH,
      editorData: editorAnnouncement.announcement,
      editorSource: editorAnnouncement.source,
      hasDraft: editorAnnouncement.hasDraft,
      hasPublishedOverride: editorAnnouncement.hasPublishedOverride,
    },
    schedule: {
      phase: schedule.phase,
      now: schedule.now,
      releaseAt: schedule.releaseAt,
      displayEndAt: schedule.displayEndAt,
      nextReleaseAt: schedule.nextReleaseAt,
      displayDays: DISPLAY_DAYS,
      matchDay: MATCH_DAY,
      matchHour: MATCH_HOUR,
      matchMinute: MATCH_MINUTE,
      roundKey: buildMutualRoundKey("romance", schedule.releaseAt),
    },
    feedback,
    modes,
  };
}


