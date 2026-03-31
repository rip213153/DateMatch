import { and, desc, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { normalizeIdealPreferenceTags } from "@/app/data/idealPreferenceTags";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { INTEREST_TAG_LIMIT, normalizeInterestValues, parseInterestValues } from "@/lib/interest-tags";
import {
  getProfileWithPendingDraft,
  normalizeProfileFormPayload,
  saveProfileUpdates,
} from "@/lib/profile-updates";
import { profiles } from "@/lib/schema";

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
    interests: normalizeInterestValues(profile.interests),
    idealDate: profile.ideal_date,
    idealDateTags: normalizeIdealPreferenceTags(profile.ideal_date_tags),
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

    const interestValues = parseInterestValues(data?.interests);
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
      (payload.ideal_date || payload.ideal_date_tags !== "[]");

    if (interestValues.length > INTEREST_TAG_LIMIT) {
      return NextResponse.json(
        {
          error: `\u5174\u8da3\u7231\u597d\u6700\u591a\u53ea\u80fd\u9009\u62e9 ${INTEREST_TAG_LIMIT} \u4e2a\u6807\u7b7e\u3002`,
        },
        { status: 400 },
      );
    }

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
