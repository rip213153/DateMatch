import { and, eq, lte } from "drizzle-orm";
import type { QuizMode } from "@/app/data/types";
import { serializeIdealPreferenceTags } from "@/app/data/idealPreferenceTags";
import { getDbForMode } from "@/lib/database";
import { getMatchSchedule } from "@/lib/match-schedule";
import { profileUpdateDrafts, profiles } from "@/lib/schema";

const IMMEDIATE_PROFILE_KEYS = ["name", "bio", "email", "ideal_date", "ideal_date_tags", "interests"] as const;
const DEFERRED_PROFILE_KEYS = [
  "age",
  "gender",
  "seeking",
  "university",
  "personality_profile",
] as const;

type ImmediateProfileKey = (typeof IMMEDIATE_PROFILE_KEYS)[number];
type DeferredProfileKey = (typeof DEFERRED_PROFILE_KEYS)[number];

type ImmediateProfileUpdate = Partial<Record<ImmediateProfileKey, string | null>>;
type DeferredProfileUpdate = Partial<
  Record<DeferredProfileKey, string | number | object | null | undefined>
>;

type ProfileRow = typeof profiles.$inferSelect;
type DraftRow = typeof profileUpdateDrafts.$inferSelect;

function normalizeString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown) {
  return normalizeString(value).toLowerCase();
}

function normalizeInterests(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeString(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,，、;；|]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");
  }

  return "";
}

function normalizeInteger(value: unknown) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) ? parsed : null;
}

export function normalizeProfileFormPayload(input: Record<string, unknown>) {
  const normalized = {
    name: normalizeString(input.name),
    age: normalizeInteger(input.age),
    gender: normalizeString(input.gender),
    seeking: normalizeString(input.seeking),
    university: normalizeString(input.university),
    email: normalizeEmail(input.email),
    interests: normalizeInterests(input.interests),
    ideal_date: normalizeString(input.idealDate ?? input.ideal_date ?? input.idealHangout),
    ideal_date_tags: serializeIdealPreferenceTags(
      input.idealDateTags ?? input.ideal_date_tags ?? input.idealHangoutTags,
    ),
    bio: normalizeString(input.bio) || null,
    personality_profile: input.personalityProfile ?? input.personality_profile ?? undefined,
  };

  return normalized;
}

export function splitProfileUpdates(payload: ReturnType<typeof normalizeProfileFormPayload>) {
  const immediateUpdates: ImmediateProfileUpdate = {
    name: payload.name,
    bio: payload.bio,
    email: payload.email,
    ideal_date: payload.ideal_date,
    ideal_date_tags: payload.ideal_date_tags,
    interests: payload.interests,
  };

  const deferredUpdates: DeferredProfileUpdate = {
    age: payload.age,
    gender: payload.gender,
    seeking: payload.seeking,
    university: payload.university,
    personality_profile: payload.personality_profile,
  };

  return {
    immediateUpdates,
    deferredUpdates,
  };
}

function shallowEqual(left: unknown, right: unknown) {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

export function getChangedProfileFields(
  currentProfile: ProfileRow,
  nextImmediateUpdates: ImmediateProfileUpdate,
  nextDeferredUpdates: DeferredProfileUpdate
) {
  const changedImmediateFields = IMMEDIATE_PROFILE_KEYS.filter(
    (key) => !shallowEqual(currentProfile[key], nextImmediateUpdates[key])
  );
  const changedDeferredFields = DEFERRED_PROFILE_KEYS.filter(
    (key) => !shallowEqual(currentProfile[key], nextDeferredUpdates[key])
  );

  return {
    changedImmediateFields,
    changedDeferredFields,
  };
}

function getPendingDraftPayload(draftRow: DraftRow | null) {
  if (!draftRow?.draft_payload || typeof draftRow.draft_payload !== "object") {
    return {};
  }

  return draftRow.draft_payload as Record<string, unknown>;
}

function applyDraftPayloadToProfile(profileRow: ProfileRow, draftRow: DraftRow | null) {
  if (!draftRow) return profileRow;

  return {
    ...profileRow,
    ...getPendingDraftPayload(draftRow),
  };
}

export async function syncProfileUpdateDrafts(mode: QuizMode, now: Date = new Date()) {
  const db = getDbForMode(mode);
  const dueDrafts = await db
    .select()
    .from(profileUpdateDrafts)
    .where(
      and(
        eq(profileUpdateDrafts.status, "PENDING"),
        lte(profileUpdateDrafts.effective_at, now)
      )
    );

  for (const draftRow of dueDrafts) {
    const draftPayload = getPendingDraftPayload(draftRow);

    if (Object.keys(draftPayload).length > 0) {
      await db
        .update(profiles)
        .set(draftPayload)
        .where(eq(profiles.id, draftRow.user_id));
    }

    await db
      .update(profileUpdateDrafts)
      .set({
        status: "APPLIED",
        updated_at: now,
      })
      .where(eq(profileUpdateDrafts.id, draftRow.id));
  }
}

export async function getProfileRowsForMode(mode: QuizMode, now: Date = new Date()) {
  await syncProfileUpdateDrafts(mode, now);
  return getDbForMode(mode).select().from(profiles);
}

export async function getProfileWithPendingDraft(userId: number, mode: QuizMode, now: Date = new Date()) {
  const db = getDbForMode(mode);
  await syncProfileUpdateDrafts(mode, now);

  const [profileRow] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  if (!profileRow) {
    return null;
  }

  const [draftRow] = await db
    .select()
    .from(profileUpdateDrafts)
    .where(and(eq(profileUpdateDrafts.user_id, userId), eq(profileUpdateDrafts.status, "PENDING")))
    .limit(1);

  return {
    profile: profileRow,
    pendingDraft: draftRow ?? null,
    previewProfile: applyDraftPayloadToProfile(profileRow, draftRow ?? null),
  };
}

export async function saveProfileUpdates(
  userId: number,
  mode: QuizMode,
  payload: ReturnType<typeof normalizeProfileFormPayload>,
  now: Date = new Date()
) {
  const db = getDbForMode(mode);
  const schedule = getMatchSchedule(now);
  const current = await getProfileWithPendingDraft(userId, mode, now);

  if (!current) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  const { immediateUpdates, deferredUpdates } = splitProfileUpdates(payload);
  const { changedImmediateFields, changedDeferredFields } = getChangedProfileFields(
    current.profile,
    immediateUpdates,
    deferredUpdates
  );

  if (changedImmediateFields.length > 0) {
    const immediatePatch = Object.fromEntries(
      changedImmediateFields.map((field) => [field, immediateUpdates[field]])
    );
    await db.update(profiles).set(immediatePatch).where(eq(profiles.id, userId));
  }

  let pendingDraft: DraftRow | null = current.pendingDraft;
  let effectiveAt: Date | null = null;

  if (changedDeferredFields.length > 0) {
    if (schedule.isInDisplayWindow) {
      const mergedDraftPayload = {
        ...getPendingDraftPayload(current.pendingDraft),
        ...Object.fromEntries(changedDeferredFields.map((field) => [field, deferredUpdates[field]])),
      };
      effectiveAt = new Date(schedule.nextReleaseAt);

      await db
        .insert(profileUpdateDrafts)
        .values({
          user_id: userId,
          mode,
          draft_payload: mergedDraftPayload,
          effective_at: effectiveAt,
          status: "PENDING",
          created_at: now,
          updated_at: now,
        })
        .onConflictDoUpdate({
          target: [profileUpdateDrafts.user_id],
          set: {
            mode,
            draft_payload: mergedDraftPayload,
            effective_at: effectiveAt,
            status: "PENDING",
            updated_at: now,
          },
        });

      [pendingDraft] = await db
        .select()
        .from(profileUpdateDrafts)
        .where(eq(profileUpdateDrafts.user_id, userId))
        .limit(1);
    } else {
      const deferredPatch = Object.fromEntries(
        changedDeferredFields.map((field) => [field, deferredUpdates[field]])
      );
      await db.update(profiles).set(deferredPatch).where(eq(profiles.id, userId));

      await db
        .insert(profileUpdateDrafts)
        .values({
          user_id: userId,
          mode,
          draft_payload: {},
          effective_at: now,
          status: "APPLIED",
          created_at: now,
          updated_at: now,
        })
        .onConflictDoUpdate({
          target: [profileUpdateDrafts.user_id],
          set: {
            draft_payload: {},
            effective_at: now,
            status: "APPLIED",
            updated_at: now,
          },
        });

      pendingDraft = null;
    }
  }

  const [updatedProfile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);

  return {
    profile: updatedProfile,
    pendingDraft,
    previewProfile: applyDraftPayloadToProfile(updatedProfile, pendingDraft ?? null),
    effectiveAt,
    changedImmediateFields,
    changedDeferredFields,
    deferredToNextRound: changedDeferredFields.length > 0 && schedule.isInDisplayWindow,
  };
}
