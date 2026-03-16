import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { sendConfirmationEmail } from "@/lib/email";
import { getEligibleReleaseAt, getMatchSchedule } from "@/lib/match-schedule";
import { profiles } from "@/lib/schema";

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const mode = resolveQuizMode(data?.mode);
    const db = getDbForMode(mode);
    const now = new Date();
    const payload = {
      name: String(data?.name ?? "").trim(),
      age: parseInt(String(data?.age ?? ""), 10),
      gender: String(data?.gender ?? "").trim(),
      seeking: String(data?.seeking ?? "").trim(),
      university: String(data?.university ?? "").trim(),
      email: normalizeEmail(data?.email),
      interests: String(data?.interests ?? "").trim(),
      ideal_date: String(data?.idealDate ?? data?.idealHangout ?? "").trim(),
      personality_profile: data?.personalityProfile,
    };

    const hasRequiredFields =
      payload.name &&
      Number.isInteger(payload.age) &&
      payload.age >= 18 &&
      payload.university &&
      payload.email &&
      payload.interests &&
      payload.ideal_date &&
      payload.personality_profile;

    if (!hasRequiredFields || !payload.gender || !payload.seeking) {
      return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });
    }

    const existingProfiles = await db
      .select({ id: profiles.id, eligible_release_at: profiles.eligible_release_at })
      .from(profiles)
      .where(sql`lower(${profiles.email}) = ${payload.email}`)
      .orderBy(desc(profiles.id));

    let profile;

    if (existingProfiles.length > 0) {
      const keeper = existingProfiles[0];
      const fallbackReleaseAt = getMatchSchedule(now).releaseAt;

      await db
        .update(profiles)
        .set({
          ...payload,
          // 老用户在展示期内改资料时，继续保留原轮次；老数据没有该字段时，默认仍归当前轮。
          eligible_release_at: keeper.eligible_release_at ?? new Date(fallbackReleaseAt),
        })
        .where(eq(profiles.id, keeper.id));

      const keeperId = keeper.id;
      [profile] = await db.select().from(profiles).where(eq(profiles.id, keeperId)).limit(1);
    } else {
      const eligibleReleaseAt = getEligibleReleaseAt(now);
      [profile] = await db
        .insert(profiles)
        .values({
          ...payload,
          // 新用户在展示期内提交时，归入下一轮；非展示期则归最近待开放轮次。
          eligible_release_at: new Date(eligibleReleaseAt),
        })
        .returning();
    }

    try {
      await sendConfirmationEmail(payload.email);
    } catch (emailError) {
      console.warn("Confirmation email skipped:", emailError);
    }

    return NextResponse.json({
      success: true,
      profile,
      mode: existingProfiles.length > 0 ? "updated" : "created",
      quizMode: mode,
    });
  } catch (error) {
    console.error("Error submitting profile:", error);
    return NextResponse.json({ error: "Failed to submit profile" }, { status: 500 });
  }
}
