import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { profiles } from "@/lib/schema";
import { getBestMatches } from "@/lib/matching";
import type { UserProfile } from "@/app/data/types";
import { normalizeProfiles } from "@/lib/profile-normalizer";

export const dynamic = "force-dynamic";

function toPositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

function buildCurrentUserPayload(user: Pick<UserProfile, "id" | "name" | "chat_user_id">) {
  return {
    id: user.id,
    name: user.name,
    chat_user_id: user.chat_user_id ?? null,
  };
}

async function findMatchesByUserId(userId: number) {
  const allUsers = normalizeProfiles(await db.select().from(profiles));
  const currentUser = allUsers.find((user) => Number(user.id) === userId);

  if (!currentUser) {
    return null;
  }

  const matches = getBestMatches(currentUser, allUsers, 5);

  return {
    currentUser,
    matches,
  };
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const userId = toPositiveInt(data.userId);

    if (!userId) {
      return NextResponse.json({ error: "缺少合法的用户 ID" }, { status: 400 });
    }

    const result = await findMatchesByUserId(userId);

    if (!result) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      matches: result.matches,
      totalMatches: result.matches.length,
      currentUser: buildCurrentUserPayload(result.currentUser),
    });
  } catch (error) {
    console.error("Error finding matches:", error);
    return NextResponse.json({ error: "匹配失败，请重试" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = toPositiveInt(searchParams.get("userId"));

    if (!userId) {
      return NextResponse.json({ error: "缺少合法的 userId 参数" }, { status: 400 });
    }

    const result = await findMatchesByUserId(userId);

    if (!result) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      matches: result.matches,
      totalMatches: result.matches.length,
      currentUser: buildCurrentUserPayload(result.currentUser),
    });
  } catch (error) {
    console.error("Error finding matches:", error);
    return NextResponse.json({ error: "匹配失败，请重试" }, { status: 500 });
  }
}
