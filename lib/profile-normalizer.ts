import type { UserProfile } from "@/app/data/types";
import { normalizeIdealPreferenceTags } from "@/app/data/idealPreferenceTags";
import type { ProfileRow } from "@/lib/db/schema-types";

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

function normalizeCreatedAt(value: ProfileRow["created_at"]): UserProfile["created_at"] {
  if (typeof value === "number") {
    const date = new Date(value > 1_000_000_000_000 ? value : value * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return value ?? null;
}

export function normalizeProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    created_at: normalizeCreatedAt(row.created_at),
    name: row.name,
    age: row.age,
    gender: row.gender,
    seeking: row.seeking,
    university: row.university,
    email: row.email,
    wechat_open_id: row.wechat_open_id ?? null,
    wechat_union_id: row.wechat_union_id ?? null,
    wechat_notice_opt_in: row.wechat_notice_opt_in ?? false,
    wechat_bound_at: row.wechat_bound_at ?? null,
    interests: normalizeInterests(row.interests),
    ideal_date: row.ideal_date,
    ideal_date_tags: normalizeIdealPreferenceTags(row.ideal_date_tags),
    bio: row.bio ?? undefined,
    personality_profile: normalizePersonalityProfile(row.personality_profile),
    match_opt_out_until: row.match_opt_out_until ?? null,
  };
}

export function normalizeProfiles(rows: ProfileRow[]): UserProfile[] {
  return rows.map(normalizeProfile);
}
