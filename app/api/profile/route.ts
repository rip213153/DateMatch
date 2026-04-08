import { and, desc, ne, sql } from "drizzle-orm";
import { normalizeIdealPreferenceTags } from "@/app/data/idealPreferenceTags";
import {
  apiSuccess,
  handleApiRouteError,
  readJsonBody,
  readPositiveInt,
} from "@/lib/api-route";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { INTEREST_TAG_LIMIT, parseInterestValues } from "@/lib/interest-tags";
import {
  getProfileWithPendingDraft,
  normalizeProfileFormPayload,
  saveProfileUpdates,
  syncProfileUpdateDrafts,
} from "@/lib/profile-updates";
import { getProfileRouteAuthContext, postProfileRouteAuthContext } from "@/lib/profile-route-core";
import { requireAuthenticatedProfile, setSessionCookie } from "@/lib/server-auth";
import { profiles } from "@/lib/schema";

export const dynamic = "force-dynamic";

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
        ? profile.interests.split(",").map((item) => item.trim()).filter(Boolean)
        : Array.isArray(profile.interests)
          ? profile.interests
          : [],
    idealDate: profile.ideal_date,
    idealDateTags: normalizeIdealPreferenceTags(profile.ideal_date_tags),
    bio: profile.bio ?? "",
    personalityProfile: profile.personality_profile,
  };
}

export async function GET(request: Request) {
  try {
    const { mode, authenticatedProfile } = await getProfileRouteAuthContext(request, {
      readPositiveInt,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });

    await syncProfileUpdateDrafts(mode);
    const result = await getProfileWithPendingDraft(Number(authenticatedProfile.id), mode);
    if (!result) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    return apiSuccess({
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
    return handleApiRouteError(error, {
      message: "Failed to fetch profile",
      code: "FETCH_PROFILE_FAILED",
      logMessage: "Error fetching profile:",
    });
  }
}

export async function POST(request: Request) {
  try {
    const { data, mode, authenticatedProfile } = await postProfileRouteAuthContext(request, {
      readJsonBody,
      readPositiveInt,
      resolveQuizMode,
      requireAuthenticatedProfile,
    });
    const userId = Number(authenticatedProfile.id);

    const interestValues = parseInterestValues(data?.interests);
    const payload = normalizeProfileFormPayload(data);
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
      return Response.json(
        {
          error: `兴趣爱好最多只能选择 ${INTEREST_TAG_LIMIT} 个标签。`,
        },
        { status: 400 },
      );
    }

    if (!hasRequiredFields) {
      return Response.json({ error: "Invalid profile payload" }, { status: 400 });
    }

    const db = getDbForMode(mode);
    const duplicateEmail = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(and(sql`lower(${profiles.email}) = ${payload.email}`, ne(profiles.id, userId)))
      .orderBy(desc(profiles.id))
      .limit(1);

    if (duplicateEmail.length > 0) {
      return Response.json({ error: "邮箱已被其他用户使用" }, { status: 409 });
    }

    const result = await saveProfileUpdates(userId, mode, payload);

    const response = apiSuccess({
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

    if (result.profile.email) {
      setSessionCookie(response, result.profile.email, mode);
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "PROFILE_NOT_FOUND") {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    return handleApiRouteError(error, {
      message: "Failed to update profile",
      code: "UPDATE_PROFILE_FAILED",
      logMessage: "Error updating profile:",
    });
  }
}
