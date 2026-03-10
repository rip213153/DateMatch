import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { sendConfirmationEmail } from "@/lib/email";
import { profiles } from "@/lib/schema";

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const payload = {
      name: String(data?.name ?? "").trim(),
      age: parseInt(String(data?.age ?? ""), 10),
      gender: String(data?.gender ?? "").trim(),
      seeking: String(data?.seeking ?? "").trim(),
      university: String(data?.university ?? "").trim(),
      email: normalizeEmail(data?.email),
      instagram: String(data?.instagram ?? "").trim() || null,
      interests: String(data?.interests ?? "").trim(),
      ideal_date: String(data?.idealDate ?? "").trim(),
      personality_profile: data?.personalityProfile,
    };

    if (
      !payload.name ||
      !Number.isInteger(payload.age) ||
      payload.age < 18 ||
      !payload.gender ||
      !payload.seeking ||
      !payload.university ||
      !payload.email ||
      !payload.interests ||
      !payload.ideal_date ||
      !payload.personality_profile
    ) {
      return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });
    }

    const existingProfiles = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(sql`lower(${profiles.email}) = ${payload.email}`)
      .orderBy(desc(profiles.id));

    let profile;

    if (existingProfiles.length > 0) {
      const keeperId = existingProfiles[0].id;
      await db.update(profiles).set(payload).where(eq(profiles.id, keeperId));
      [profile] = await db.select().from(profiles).where(eq(profiles.id, keeperId)).limit(1);
    } else {
      [profile] = await db.insert(profiles).values(payload).returning();
    }

    try {
      await sendConfirmationEmail(payload.email);
    } catch (emailError) {
      console.warn("Confirmation email skipped:", emailError);
    }

    return NextResponse.json({ success: true, profile, mode: existingProfiles.length > 0 ? "updated" : "created" });
  } catch (error) {
    console.error("Error submitting profile:", error);
    return NextResponse.json({ error: "Failed to submit profile" }, { status: 500 });
  }
}