import { sql } from "drizzle-orm";
import {
  apiSuccess,
  assertApi,
  handleApiRouteError,
  readJsonBody,
  readLowercaseEmail,
} from "@/lib/api-route";
import { getDbForMode, resolveQuizMode } from "@/lib/database";
import { setSessionCookie } from "@/lib/server-auth";
import { profiles } from "@/lib/schema";

export const dynamic = "force-dynamic";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function findProfileByEmail(email: string, mode: "romance" | "friendship") {
  const db = getDbForMode(mode);
  const rows = await db
    .select({ id: profiles.id, email: profiles.email })
    .from(profiles)
    .where(sql`lower(${profiles.email}) = lower(${email})`)
    .limit(1);

  return rows[0] ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const email = readLowercaseEmail(body.email);
    const requestedMode = resolveQuizMode(body.mode);

    assertApi(isValidEmail(email), "请输入有效邮箱", {
      status: 400,
      code: "INVALID_EMAIL",
    });

    const matched = await findProfileByEmail(email, requestedMode);

    assertApi(matched, "邮箱未找到，请先完成测试并提交资料", {
      status: 404,
      code: "PROFILE_NOT_FOUND",
    });

    const response = apiSuccess({
      message: "验证通过，正在登录",
      email: matched.email,
      userId: matched.id,
      mode: requestedMode,
    });

    setSessionCookie(response, matched.email, requestedMode);

    return response;
  } catch (error) {
    return handleApiRouteError(error, {
      message: "验证失败，请稍后重试",
      code: "DIRECT_EMAIL_LOGIN_FAILED",
      logMessage: "direct email login failed:",
    });
  }
}
