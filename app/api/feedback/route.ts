import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { sendFeedbackEmail } from "@/lib/email";
import {
  apiSuccess,
  assertApi,
  handleApiRouteError,
  readJsonBody,
  readTrimmedString,
} from "@/lib/api-route";

export const dynamic = "force-dynamic";

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
    const body = await readJsonBody(request);
    source = readTrimmedString(body.source) || "unknown";
    nickname = readTrimmedString(body.nickname) || "匿名";
    content = readTrimmedString(body.content);

    assertApi(content, "反馈内容不能为空", {
      status: 400,
      code: "EMPTY_FEEDBACK_CONTENT",
    });
    assertApi(content.length <= 2000, "反馈内容不能超过 2000 字", {
      status: 400,
      code: "FEEDBACK_CONTENT_TOO_LONG",
    });

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

    return apiSuccess({ emailId: emailResult.id });
  } catch (error) {
    await appendFeedbackLog({
      submittedAt,
      source,
      nickname,
      content,
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    }).catch(() => undefined);

    return handleApiRouteError(error, {
      message: "反馈发送失败，请稍后重试",
      code: "FEEDBACK_SUBMIT_FAILED",
      logMessage: "send feedback failed:",
    });
  }
}
