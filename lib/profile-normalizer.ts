import type { UserProfile } from "@/app/data/types";
import { profiles } from "@/lib/schema";

type ProfileRow = typeof profiles.$inferSelect;

function normalizeInterests(value: unknown): UserProfile["interests"] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return typeof value === "string" ? value : "";
}

function normalizePersonalityProfile(value: unknown): UserProfile["personality_profile"] {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    return value as NonNullable<UserProfile["personality_profile"]>;
  }

  return undefined;
}

export function normalizeProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    created_at: row.created_at ?? null,
    name: row.name,
    age: row.age,
    gender: row.gender,
    seeking: row.seeking,
    university: row.university,
    email: row.email,
    instagram: row.instagram ?? undefined,
    chat_user_id: row.chat_user_id ?? null,
    interests: normalizeInterests(row.interests),
    ideal_date: row.ideal_date,
    personality_profile: normalizePersonalityProfile(row.personality_profile),
  };
}

export function normalizeProfiles(rows: ProfileRow[]): UserProfile[] {
  return rows.map(normalizeProfile);
}
