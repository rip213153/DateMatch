import { and, desc, eq, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { resolveQuizMode } from "@/lib/database";
import {
  getProfileWithPendingDraft,
  normalizeProfileFormPayload,
  saveProfileUpdates,
} from "@/lib/profile-updates";
import { profiles } from "@/lib/schema";
import { getDbForMode } from "@/lib/database";

export const dynamic = "force-dynamic";

function toPositiveInt(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

function toResponseProfile(profile: typeof profiles.$inferSelect) {
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    seeking: profile.seeking,
    university: profile.university,
    email: profile.email,
    interests:
      typeof profile.interests === "string"
        ? profile.interests
            .split(/[\n,，、;；|]+/)
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    idealDate: profile.ideal_date,
    bio: profile.bio ?? "",
    personalityProfile: profile.personality_profile,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = toPositiveInt(searchParams.get("userId"));
    const mode = resolveQuizMode(searchParams.get("mode"));

    if (!userId) {
      return NextResponse.json({ error: "Missing valid userId" }, { status: 400 });
    }

    const result = await getProfileWithPendingDraft(userId, mode);
    if (!result) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mode,
      profile: toResponseProfile(result.profile),
      previewProfile: toResponseProfile(result.previewProfile),
      pendingDraft: result.pendingDraft
        ? {
            effectiveAt: result.pendingDraft.effective_at,
            status: result.pendingDraft.status,
            payload: result.pendingDraft.draft_payload,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const userId = toPositiveInt(data?.userId);
    const mode = resolveQuizMode(data?.mode);

    if (!userId) {
      return NextResponse.json({ error: "Missing valid userId" }, { status: 400 });
    }

    const payload = normalizeProfileFormPayload(data ?? {});
    const hasRequiredFields =
      payload.name &&
      Number.isInteger(payload.age) &&
      (payload.age ?? 0) >= 18 &&
      payload.gender &&
      payload.seeking &&
      payload.university &&
      payload.email &&
      payload.interests &&
      payload.ideal_date;

    if (!hasRequiredFields) {
      return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });
    }

    const db = getDbForMode(mode);
    const duplicateEmail = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(and(sql`lower(${profiles.email}) = ${payload.email}`, ne(profiles.id, userId)))
      .orderBy(desc(profiles.id))
      .limit(1);

    if (duplicateEmail.length > 0) {
      return NextResponse.json({ error: "邮箱已被其他用户使用" }, { status: 409 });
    }

    const result = await saveProfileUpdates(userId, mode, payload);

    return NextResponse.json({
      success: true,
      mode,
      profile: toResponseProfile(result.profile),
      previewProfile: toResponseProfile(result.previewProfile),
      pendingDraft: result.pendingDraft
        ? {
            effectiveAt: result.pendingDraft.effective_at,
            status: result.pendingDraft.status,
            payload: result.pendingDraft.draft_payload,
          }
        : null,
      effectiveAt: result.effectiveAt?.getTime() ?? null,
      changedImmediateFields: result.changedImmediateFields,
      changedDeferredFields: result.changedDeferredFields,
      deferredToNextRound: result.deferredToNextRound,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PROFILE_NOT_FOUND") {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
