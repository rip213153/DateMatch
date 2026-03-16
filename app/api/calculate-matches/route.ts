import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { getBestFriendshipMatches } from "@/lib/friendship-matching";
import { getBestMatches } from "@/lib/matching";
import { getProfileRowsForMode } from "@/lib/profile-updates";
import { normalizeProfiles } from "@/lib/profile-normalizer";
import { profiles } from "@/lib/schema";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const userId = Number(data?.userId);
    const mode = resolveQuizMode(data?.mode);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Missing valid userId" }, { status: 400 });
    }

    const db = getDbForMode(mode);
    const allUsers = normalizeProfiles(await getProfileRowsForMode(mode));
    const currentUser = allUsers.find((user) => Number(user.id) === userId);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const matches = mode === "friendship"
      ? getBestFriendshipMatches(currentUser, allUsers, 5)
      : getBestMatches(currentUser, allUsers, 5);

    await db
      .update(profiles)
      .set({
        matching_status: "MATCHED",
        match_at: new Date(),
      })
      .where(eq(profiles.id, userId));

    return NextResponse.json({
      success: true,
      mode,
      matches,
      totalMatches: matches.length,
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        chat_user_id: null,
      },
    });
  } catch (error) {
    console.error("Error calculating matches:", error);
    return NextResponse.json({ error: "Failed to calculate matches" }, { status: 500 });
  }
}
