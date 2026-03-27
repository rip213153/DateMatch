"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearHomeAnnouncementDraft,
  clearPublishedHomeAnnouncement,
  publishHomeAnnouncement,
  saveHomeAnnouncementDraft,
} from "@/lib/home-announcement-store";
import { OPS_AUTH_COOKIE_NAME, getConfiguredOpsToken, isOpsAuthenticated } from "@/lib/ops-auth";

function redirectWithError(message: string) {
  redirect(`/ops?error=${encodeURIComponent(message)}`);
}

export async function loginOpsAction(formData: FormData) {
  const configuredToken = getConfiguredOpsToken();

  if (!configuredToken) {
    redirect("/ops");
  }

  const submittedToken = String(formData.get("token") ?? "").trim();

  if (!submittedToken || submittedToken !== configuredToken) {
    redirectWithError("后台访问令牌错误");
  }

  cookies().set(OPS_AUTH_COOKIE_NAME, configuredToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/ops",
    maxAge: 60 * 60 * 12,
  });

  redirect("/ops");
}

export async function logoutOpsAction() {
  cookies().delete(OPS_AUTH_COOKIE_NAME);
  redirect("/ops");
}

function readPayload(formData: FormData) {
  return String(formData.get("payload") ?? "");
}

function assertOpsAuthenticated() {
  if (!isOpsAuthenticated()) {
    redirectWithError("请先登录后台");
  }
}

export async function saveAnnouncementDraftAction(formData: FormData) {
  assertOpsAuthenticated();

  try {
    await saveHomeAnnouncementDraft(readPayload(formData));
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "保存公告草稿失败");
  }

  redirect("/ops?saved=announcement_draft");
}

export async function publishAnnouncementAction(formData: FormData) {
  assertOpsAuthenticated();

  try {
    await publishHomeAnnouncement(readPayload(formData));
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "发布公告失败");
  }

  redirect("/ops?saved=announcement_published");
}

export async function clearPublishedAnnouncementAction() {
  assertOpsAuthenticated();
  await clearPublishedHomeAnnouncement();
  redirect("/ops?saved=announcement_cleared");
}

export async function clearAnnouncementDraftAction() {
  assertOpsAuthenticated();
  await clearHomeAnnouncementDraft();
  redirect("/ops?saved=announcement_draft_cleared");
}
