import { access, mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import {
  homeAnnouncement as defaultHomeAnnouncement,
  type HomeAnnouncement,
  type HomeAnnouncementBlock,
} from "@/app/data/homeAnnouncement";
import { ApiRouteError, assertApi, readBoolean, readTrimmedString } from "@/lib/api-route";

export const HOME_ANNOUNCEMENT_PUBLISHED_PATH = path.join(
  process.cwd(),
  "tmp",
  "ops",
  "home-announcement.override.json"
);

export const HOME_ANNOUNCEMENT_OVERRIDE_PATH = HOME_ANNOUNCEMENT_PUBLISHED_PATH;

export const HOME_ANNOUNCEMENT_DRAFT_PATH = path.join(
  process.cwd(),
  "tmp",
  "ops",
  "home-announcement.draft.json"
);

export const HOME_ANNOUNCEMENT_DEFAULT_PATH = path.join(
  process.cwd(),
  "app",
  "data",
  "homeAnnouncement.ts"
);

export type HomeAnnouncementSource = "default" | "override";

export type ResolvedHomeAnnouncement = {
  announcement: HomeAnnouncement;
  source: HomeAnnouncementSource;
  warning: string | null;
};

export type HomeAnnouncementEditorState = {
  announcement: HomeAnnouncement;
  source: "default" | "published" | "draft";
  warning: string | null;
  hasDraft: boolean;
  hasPublishedOverride: boolean;
};

function readRequiredString(value: unknown, label: string) {
  const text = readTrimmedString(value);
  assertApi(text.length > 0, `公告字段 ${label} 不能为空`, {
    status: 400,
    code: "INVALID_HOME_ANNOUNCEMENT",
  });
  return text;
}

function normalizeBlock(value: unknown, index: number): HomeAnnouncementBlock {
  assertApi(value && typeof value === "object" && !Array.isArray(value), `公告第 ${index + 1} 项格式不正确`, {
    status: 400,
    code: "INVALID_HOME_ANNOUNCEMENT_BLOCK",
  });

  const record = value as Record<string, unknown>;

  return {
    title: readRequiredString(record.title, `blocks[${index}].title`),
    content: readRequiredString(record.content, `blocks[${index}].content`),
  };
}

export function normalizeHomeAnnouncement(value: unknown): HomeAnnouncement {
  assertApi(value && typeof value === "object" && !Array.isArray(value), "公告配置格式不正确", {
    status: 400,
    code: "INVALID_HOME_ANNOUNCEMENT",
  });

  const record = value as Record<string, unknown>;
  const blocks = Array.isArray(record.blocks) ? record.blocks.map(normalizeBlock) : [];
  const ctaText = readTrimmedString(record.ctaText);
  const ctaHref = readTrimmedString(record.ctaHref);

  return {
    enabled: readBoolean(record.enabled, true),
    badge: readRequiredString(record.badge, "badge"),
    title: readRequiredString(record.title, "title"),
    updatedAt: readRequiredString(record.updatedAt, "updatedAt"),
    summary: readRequiredString(record.summary, "summary"),
    blocks,
    ...(ctaText ? { ctaText } : {}),
    ...(ctaHref ? { ctaHref } : {}),
  };
}

export function serializeHomeAnnouncement(announcement: HomeAnnouncement) {
  return JSON.stringify(announcement, null, 2);
}

export function parseHomeAnnouncementEditorPayload(raw: string) {
  const trimmed = raw.trim();
  assertApi(trimmed.length > 0, "公告 JSON 不能为空", {
    status: 400,
    code: "EMPTY_HOME_ANNOUNCEMENT_PAYLOAD",
  });
  assertApi(trimmed.length <= 50000, "公告 JSON 过长，请精简后再保存", {
    status: 400,
    code: "HOME_ANNOUNCEMENT_PAYLOAD_TOO_LARGE",
  });

  try {
    return normalizeHomeAnnouncement(JSON.parse(trimmed));
  } catch (error) {
    if (error instanceof ApiRouteError) {
      throw error;
    }

    throw new ApiRouteError(400, "公告 JSON 解析失败，请检查格式", "INVALID_HOME_ANNOUNCEMENT_JSON");
  }
}

async function readAnnouncementFile(filePath: string) {
  try {
    await access(filePath);
  } catch {
    return null;
  }

  return readFile(filePath, "utf8");
}

async function writeAnnouncementFile(filePath: string, raw: string) {
  const announcement = parseHomeAnnouncementEditorPayload(raw);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, serializeHomeAnnouncement(announcement), "utf8");
  return announcement;
}

async function removeAnnouncementFile(filePath: string) {
  await rm(filePath, { force: true });
}

function getDefaultAnnouncement() {
  return normalizeHomeAnnouncement(defaultHomeAnnouncement);
}

export async function getResolvedHomeAnnouncement(): Promise<ResolvedHomeAnnouncement> {
  const defaultAnnouncement = getDefaultAnnouncement();
  const raw = await readAnnouncementFile(HOME_ANNOUNCEMENT_PUBLISHED_PATH);

  if (!raw) {
    return {
      announcement: defaultAnnouncement,
      source: "default",
      warning: null,
    };
  }

  try {
    return {
      announcement: parseHomeAnnouncementEditorPayload(raw),
      source: "override",
      warning: null,
    };
  } catch (error) {
    return {
      announcement: defaultAnnouncement,
      source: "default",
      warning: error instanceof Error ? error.message : "公告已发布配置读取失败",
    };
  }
}

export async function getHomeAnnouncementEditorState(): Promise<HomeAnnouncementEditorState> {
  const defaultAnnouncement = getDefaultAnnouncement();
  const published = await getResolvedHomeAnnouncement();
  const draftRaw = await readAnnouncementFile(HOME_ANNOUNCEMENT_DRAFT_PATH);

  if (!draftRaw) {
    return {
      announcement: published.announcement,
      source: published.source === "override" ? "published" : "default",
      warning: published.warning,
      hasDraft: false,
      hasPublishedOverride: published.source === "override",
    };
  }

  try {
    return {
      announcement: parseHomeAnnouncementEditorPayload(draftRaw),
      source: "draft",
      warning: published.warning,
      hasDraft: true,
      hasPublishedOverride: published.source === "override",
    };
  } catch (error) {
    return {
      announcement: published.announcement ?? defaultAnnouncement,
      source: published.source === "override" ? "published" : "default",
      warning: error instanceof Error ? error.message : "公告草稿读取失败",
      hasDraft: true,
      hasPublishedOverride: published.source === "override",
    };
  }
}

export async function saveHomeAnnouncementDraft(raw: string) {
  return writeAnnouncementFile(HOME_ANNOUNCEMENT_DRAFT_PATH, raw);
}

export async function publishHomeAnnouncement(raw: string) {
  return writeAnnouncementFile(HOME_ANNOUNCEMENT_PUBLISHED_PATH, raw);
}

export async function clearHomeAnnouncementDraft() {
  await removeAnnouncementFile(HOME_ANNOUNCEMENT_DRAFT_PATH);
}

export async function clearPublishedHomeAnnouncement() {
  await removeAnnouncementFile(HOME_ANNOUNCEMENT_PUBLISHED_PATH);
}

export async function saveHomeAnnouncementOverride(raw: string) {
  return publishHomeAnnouncement(raw);
}

export async function clearHomeAnnouncementOverride() {
  await clearPublishedHomeAnnouncement();
}
