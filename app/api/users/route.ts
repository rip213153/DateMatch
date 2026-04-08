import { normalizeIdealPreferenceTags } from "@/app/data/idealPreferenceTags";
import { apiSuccess, handleApiRouteError } from "@/lib/api-route";
import { resolveQuizMode } from "@/lib/database";
import { requireAuthenticatedProfile } from "@/lib/server-auth";
import { getUsersRouteAuthContext } from "@/lib/users-route-core";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { mode, authenticatedProfile: profile } = await getUsersRouteAuthContext(request, {
      resolveQuizMode,
      requireAuthenticatedProfile,
    });

    const currentUser = {
      id: profile.id,
      name: profile.name,
      age: profile.age,
      university: profile.university,
      email: profile.email,
      gender: profile.gender,
      seeking: profile.seeking,
      ideal_date: profile.ideal_date,
      ideal_date_tags: normalizeIdealPreferenceTags(profile.ideal_date_tags),
      bio: profile.bio ?? undefined,
      interests:
        typeof profile.interests === "string"
          ? profile.interests.split(",").map((item) => item.trim()).filter(Boolean)
          : Array.isArray(profile.interests)
            ? profile.interests
            : [],
      personality_profile: profile.personality_profile,
      chat_user_id: profile.chat_user_id ?? null,
      matching_status: profile.matching_status ?? "WAITING",
      match_at: profile.match_at ? new Date(profile.match_at).toISOString() : null,
      match_opt_out_until: profile.match_opt_out_until ? new Date(profile.match_opt_out_until).toISOString() : null,
      created_at: profile.created_at,
    };

    return apiSuccess({
      mode,
      currentUser,
      users: [currentUser],
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "获取用户资料失败",
      code: "FETCH_CURRENT_USER_FAILED",
      logMessage: "API /api/users failed:",
    });
  }
}
