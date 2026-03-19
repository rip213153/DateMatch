import { NextResponse } from "next/server";
import { normalizeIdealPreferenceTags } from "@/app/data/idealPreferenceTags";
import { resolveQuizMode } from "@/lib/database";
import { getProfileRowsForMode } from "@/lib/profile-updates";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = resolveQuizMode(searchParams.get("mode"));
    const allUsersRaw = await getProfileRowsForMode(mode);

    return NextResponse.json({
      success: true,
      mode,
      users: allUsersRaw.map((user) => ({
        id: user.id,
        name: user.name,
        age: user.age,
        university: user.university,
        email: user.email,
        gender: user.gender,
        seeking: user.seeking,
        ideal_date: user.ideal_date,
        ideal_date_tags: normalizeIdealPreferenceTags(user.ideal_date_tags),
        bio: user.bio ?? undefined,
        interests:
          typeof user.interests === "string"
            ? user.interests.split(",").map((item) => item.trim()).filter(Boolean)
            : Array.isArray(user.interests)
              ? user.interests
              : [],
        personality_profile: user.personality_profile,
        chat_user_id: user.chat_user_id ?? null,
        matching_status: user.matching_status ?? "WAITING",
        match_at: user.match_at ? new Date(user.match_at).toISOString() : null,
        match_opt_out_until: user.match_opt_out_until ? new Date(user.match_opt_out_until).toISOString() : null,
        created_at: user.created_at,
      })),
    });
  } catch (error: any) {
    console.error("API /api/users failed:", error.message);
    return NextResponse.json({ error: "获取用户列表失败", details: error.message }, { status: 500 });
  }
}
