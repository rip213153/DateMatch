import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { profiles } from "@/lib/schema";

export async function GET() {
  try {
    const allUsersRaw = await db.select().from(profiles);

    return NextResponse.json({
      success: true,
      users: allUsersRaw.map((user) => ({
        id: user.id,
        name: user.name,
        age: user.age,
        university: user.university,
        email: user.email,
        chat_user_id: user.chat_user_id ?? null,
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "获取用户列表失败" }, { status: 500 });
  }
}