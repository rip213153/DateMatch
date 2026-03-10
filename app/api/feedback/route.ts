import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { sendFeedbackEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

async function appendFeedbackLog(record: Record<string, unknown>) {
  const dir = path.join(process.cwd(), "tmp", "feedback");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, "feedback-submissions.ndjson");
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

export async function POST(request: Request) {
  let source = "unknown";
  let nickname = "匿名";
  let content = "";
  const submittedAt = new Date().toISOString();

  try {
    const body = await request.json();
    source = normalizeText(body?.source) || "unknown";
    nickname = normalizeText(body?.nickname) || "匿名";
    content = normalizeText(body?.content);

    if (!content) {
      return NextResponse.json({ success: false, error: "反馈内容不能为空" }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ success: false, error: "反馈内容不能超过 2000 字" }, { status: 400 });
    }

    await appendFeedbackLog({
      submittedAt,
      source,
      nickname,
      content,
      status: "received",
    });

    const emailResult = await sendFeedbackEmail({ source, nickname, content });

    await appendFeedbackLog({
      submittedAt,
      source,
      nickname,
      content,
      status: "sent",
      emailId: emailResult.id,
    });

    return NextResponse.json({ success: true, emailId: emailResult.id });
  } catch (error) {
    await appendFeedbackLog({
      submittedAt,
      source,
      nickname,
      content,
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    }).catch(() => undefined);

    console.error("send feedback failed:", error);
    return NextResponse.json({ success: false, error: "反馈发送失败，请稍后重试" }, { status: 500 });
  }
}
