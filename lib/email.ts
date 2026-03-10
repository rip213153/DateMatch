import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailSendResponse = {
  data: { id: string } | null;
  error: { message?: string } | null;
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function assertEmailSent(response: EmailSendResponse, context: string) {
  if (response.error) {
    throw new Error(`${context}: ${response.error.message || "unknown email provider error"}`);
  }

  if (!response.data?.id) {
    throw new Error(`${context}: missing email id`);
  }

  return response.data;
}

export async function sendConfirmationEmail(email: string) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await resend.emails.send({
    from: "DateMatch <onboarding@resend.dev>",
    to: email,
    subject: "Welcome to DateMatch",
    html: `
      <h1>欢迎加入 DateMatch</h1>
      <p>我们已经收到你的资料，后续有匹配结果会第一时间通知你。</p>
      <p>祝你早日遇见同频的人。</p>
    `,
    text: "欢迎加入 DateMatch。我们已经收到你的资料，后续有匹配结果会第一时间通知你。祝你早日遇见同频的人。",
  });

  return assertEmailSent(response, "confirmation email send failed");
}

export async function sendFeedbackEmail(params: {
  source: string;
  nickname: string;
  content: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const { source, nickname, content } = params;
  const submittedAt = new Date().toLocaleString("zh-CN", { hour12: false });
  const safeContent = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const response = await resend.emails.send({
    from: "DateMatch <onboarding@resend.dev>",
    to: ["2151220641@qq.com"],
    subject: `DateMatch 反馈 - ${source}`,
    html: `
      <div style="max-width:640px;margin:0 auto;padding:24px;background:#fff7fb;font-family:Arial,sans-serif;color:#1f2937;">
        <h1 style="margin:0 0 16px;color:#db2777;font-size:28px;">DateMatch 用户反馈</h1>
        <p style="margin:0 0 8px;"><strong>来源：</strong>${source}</p>
        <p style="margin:0 0 8px;"><strong>昵称：</strong>${nickname}</p>
        <p style="margin:0 0 8px;"><strong>提交时间：</strong>${submittedAt}</p>
        <div style="margin-top:18px;padding:16px;border-radius:16px;background:#ffffff;border:1px solid #fbcfe8;line-height:1.8;white-space:pre-wrap;">
          ${safeContent}
        </div>
      </div>
    `,
    text: `DateMatch 用户反馈\n来源: ${source}\n昵称: ${nickname}\n提交时间: ${submittedAt}\n\n${content}`,
  });

  return assertEmailSent(response, "feedback email send failed");
}

export async function sendLoginVerificationEmail(params: {
  email: string;
  verifyUrl: string;
  expiresHours?: number;
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const { email, verifyUrl, expiresHours = 24 } = params;

  const response = await resend.emails.send({
    from: "DateMatch <onboarding@resend.dev>",
    to: email,
    subject: "DateMatch 邮箱验证登录",
    html: `
      <div style="max-width:640px;margin:0 auto;padding:24px;background:#f7f3f1;font-family:Georgia,'Times New Roman',serif;color:#2b1a1f;">
        <h1 style="margin:0 0 8px;font-size:56px;line-height:1;color:#7a1f4d;">date match.</h1>
        <p style="margin:0 0 20px;font-size:34px;line-height:1;color:#7a1f4d;">relationship dna quiz</p>

        <div style="background:#fff;border:1px solid #eee;border-radius:22px;padding:30px 28px;">
          <h2 style="margin:0 0 16px;font-size:42px;line-height:1.2;color:#1f1f1f;">你的问卷已收到</h2>
          <p style="margin:0 0 20px;font-size:28px;line-height:1.4;color:#5b4b52;">点击下方按钮验证邮箱，验证后自动登录参与每周匹配。</p>

          <a href="${verifyUrl}" style="display:inline-block;padding:16px 38px;border-radius:999px;background:#8d1f5f;color:#fff;text-decoration:none;font-size:30px;font-weight:700;">
            验证邮箱
          </a>

          <p style="margin:22px 0 8px;font-size:20px;color:#8c7a80;">若按钮无效，请复制此链接到浏览器：</p>
          <p style="margin:0 0 16px;word-break:break-all;font-size:18px;color:#6f5e65;">${verifyUrl}</p>
          <p style="margin:0;font-size:18px;color:#8c7a80;">链接 ${expiresHours} 小时内有效，且仅可使用一次。</p>
        </div>
      </div>
    `,
    text: `你的问卷已收到。请打开以下链接验证邮箱并自动登录：${verifyUrl}。链接 ${expiresHours} 小时内有效，且仅可使用一次。`,
  });

  return assertEmailSent(response, "login verification email send failed");
}

export { getBaseUrl };
