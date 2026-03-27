import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { chatMessages } from "@/lib/schema";

export async function POST() {
  try {
    await db.delete(chatMessages).run();

    return NextResponse.json({ success: true, message: "所有聊天记录已清理" });
  } catch (error) {
    console.error("Error clearing chat messages:", error);
    return NextResponse.json({ error: "清理失败" }, { status: 500 });
  }
}
