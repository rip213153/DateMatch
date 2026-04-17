import { eq } from "drizzle-orm";
import { serializeIdealPreferenceTags } from "@/app/data/idealPreferenceTags";
import {
  apiSuccess,
  assertApi,
  handleApiRouteError,
  readJsonBody,
  readLowercaseEmail,
  readTrimmedString,
} from "@/lib/api-route";
import { getDatabaseContextForMode, resolveQuizMode } from "@/lib/database";
import { sendConfirmationEmail } from "@/lib/email";
import { INTEREST_TAG_LIMIT, parseInterestValues, serializeInterestValues } from "@/lib/interest-tags";
import { getEligibleReleaseAt, getMatchSchedule } from "@/lib/match-schedule";

export const dynamic = "force-dynamic";

function queueConfirmationEmail(email: string) {
  void sendConfirmationEmail(email).catch((emailError) => {
    console.warn("Confirmation email skipped:", emailError);
  });
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const mode = resolveQuizMode(body.mode);
    const { db, tables: { profiles } } = getDatabaseContextForMode(mode);
    const now = new Date();
    const interestValues = parseInterestValues(body.interests);
    const payload = {
      name: readTrimmedString(body.name),
      age: Number.parseInt(readTrimmedString(body.age), 10),
      gender: readTrimmedString(body.gender),
      seeking: readTrimmedString(body.seeking),
      university: readTrimmedString(body.university),
      email: readLowercaseEmail(body.email),
      interests: serializeInterestValues(interestValues),
      ideal_date: readTrimmedString(body.idealDate ?? body.idealHangout),
      ideal_date_tags: serializeIdealPreferenceTags(body.idealDateTags ?? body.idealHangoutTags),
      personality_profile: body.personalityProfile,
    };

    const hasRequiredFields =
      payload.name &&
      Number.isInteger(payload.age) &&
      payload.age >= 18 &&
      payload.university &&
      payload.email &&
      payload.interests &&
      (payload.ideal_date || payload.ideal_date_tags !== "[]") &&
      payload.personality_profile;

    assertApi(
      interestValues.length <= INTEREST_TAG_LIMIT,
      `\u5174\u8da3\u7231\u597d\u6700\u591a\u53ea\u80fd\u9009\u62e9 ${INTEREST_TAG_LIMIT} \u4e2a\u6807\u7b7e\u3002`,
      {
        status: 400,
        code: "INTEREST_TAG_LIMIT_EXCEEDED",
      },
    );

    assertApi(hasRequiredFields && payload.gender && payload.seeking, "Invalid profile payload", {
      status: 400,
      code: "INVALID_PROFILE_PAYLOAD",
    });

    const existingProfiles = await db
      .select({ id: profiles.id, eligible_release_at: profiles.eligible_release_at })
      .from(profiles)
      .where(eq(profiles.email, payload.email))
      .limit(1);

    let profile;

    if (existingProfiles.length > 0) {
      const keeper = existingProfiles[0];
      const fallbackReleaseAt = getMatchSchedule(now).releaseAt;

      await db
        .update(profiles)
        .set({
          ...payload,
          eligible_release_at: keeper.eligible_release_at ?? new Date(fallbackReleaseAt),
        })
        .where(eq(profiles.id, keeper.id));

      [profile] = await db.select().from(profiles).where(eq(profiles.id, keeper.id)).limit(1);
    } else {
      const eligibleReleaseAt = getEligibleReleaseAt(now);
      [profile] = await db
        .insert(profiles)
        .values({
          ...payload,
          eligible_release_at: new Date(eligibleReleaseAt),
        })
        .returning();
    }

    queueConfirmationEmail(payload.email);

    return apiSuccess({
      profile,
      mode: existingProfiles.length > 0 ? "updated" : "created",
      quizMode: mode,
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to submit profile",
      code: "SUBMIT_PROFILE_FAILED",
      logMessage: "Error submitting profile:",
    });
  }
}
