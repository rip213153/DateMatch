import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { profiles } from "@/lib/schema";

// 强制动态执行，确保不使用缓存
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. 检查数据库连接是否正常
    if (!db) {
      console.error("数据库连接对象不存在");
      return NextResponse.json({ error: "数据库连接未初始化" }, { status: 500 });
    }

    // 2. 执行查询
    console.log("正在查询 profiles 表...");
    const allUsersRaw = await db.select().from(profiles);
    console.log(`查询成功，获取到 ${allUsersRaw.length} 条记录`);

    return NextResponse.json({
      success: true,
      users: allUsersRaw.map((user) => ({
        id: user.id,
        name: user.name,
        age: user.age,
        university: user.university,
        email: user.email,
        gender: user.gender,
        seeking: user.seeking,
        ideal_date: user.ideal_date,
        bio: user.bio ?? undefined,
        // 处理 interests 字段：如果是字符串，按逗号分割;如果已经是数组，直接使用
        interests: typeof user.interests === "string" 
          ? user.interests.split(",").map((s) => s.trim()).filter(Boolean)
          : Array.isArray(user.interests) 
            ? user.interests 
            : [],
        personality_profile: user.personality_profile,
        chat_user_id: user.chat_user_id ?? null,
        matching_status: user.matching_status ?? "WAITING",
        match_at: user.match_at && !isNaN(new Date(user.match_at).getTime()) 
          ? new Date(user.match_at).toISOString() 
          : null,
        created_at: user.created_at,
      })),
    });
  } catch (error: any) {
    // 3. 打印完整错误堆栈
    console.error("API /api/users 发生致命错误:", error.message);
    console.error(error.stack);
    return NextResponse.json(
      { error: "获取用户列表失败", details: error.message }, 
      { status: 500 }
    );
  }
}