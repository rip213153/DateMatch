import nodemailer from "nodemailer";

type EmailSendResponse = {
  id: string;
};

type EmailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

type EmailScene =
  | "confirmation"
  | "feedback"
  | "login_verification"
  | "match_result"
  | "chat_reminder";

type SmtpAccount = "primary" | "secondary";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

type EmailSendCounterKey = `${EmailScene}:${SmtpAccount}`;

type EmailSendCountState = {
  dateKey: string;
  counts: Partial<Record<EmailSendCounterKey, number>>;
};

type GlobalEmailState = typeof globalThis & {
  __datematchEmailSendCountState?: EmailSendCountState;
};

const DEFAULT_APP_URL = "http://39.107.110.145:3000";
const DEFAULT_EMAIL_LIMIT_TIMEZONE = "Asia/Shanghai";
const transporterCache = new Map<SmtpAccount, nodemailer.Transporter>();
const SMTP_ACCOUNTS: SmtpAccount[] = ["primary", "secondary"];
const DEFAULT_ROUTE_BY_SCENE: Record<EmailScene, SmtpAccount[]> = {
  confirmation: ["primary", "secondary"],
  feedback: ["secondary", "primary"],
  login_verification: ["primary", "secondary"],
  match_result: ["primary", "secondary"],
  chat_reminder: ["secondary", "primary"],
};
const ROUTE_ENV_BY_SCENE: Record<EmailScene, string> = {
  confirmation: "EMAIL_ROUTE_CONFIRMATION",
  feedback: "EMAIL_ROUTE_FEEDBACK",
  login_verification: "EMAIL_ROUTE_LOGIN_VERIFICATION",
  match_result: "EMAIL_ROUTE_MATCH_RESULT",
  chat_reminder: "EMAIL_ROUTE_CHAT_REMINDER",
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return DEFAULT_APP_URL;
}

function readEnv(name: string) {
  return process.env[name]?.trim() || "";
}

function readEnvWithFallback(name: string, fallbackName?: string) {
  return readEnv(name) || (fallbackName ? readEnv(fallbackName) : "");
}

function readRawEnvWithFallback(name: string, fallbackName?: string) {
  if (process.env[name] !== undefined) {
    return process.env[name];
  }

  return fallbackName ? process.env[fallbackName] : undefined;
}

function getDailyLimitTimeZone() {
  return readEnv("EMAIL_DAILY_LIMIT_TIMEZONE") || DEFAULT_EMAIL_LIMIT_TIMEZONE;
}

function toBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  return fallback;
}

function parsePort(value: string | undefined) {
  const parsed = Number.parseInt(value?.trim() || "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 465;
}

function parseNonNegativeInt(value: string | undefined) {
  const parsed = Number.parseInt(value?.trim() || "", 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function getDateKey(now: Date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: getDailyLimitTimeZone(),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(now);
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.warn("email daily limit timezone fallback:", error);
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCounterKey(scene: EmailScene, account: SmtpAccount): EmailSendCounterKey {
  return `${scene}:${account}`;
}

function getEmailSendCountState(now: Date = new Date()) {
  const globalState = globalThis as GlobalEmailState;
  const dateKey = getDateKey(now);

  if (
    !globalState.__datematchEmailSendCountState ||
    globalState.__datematchEmailSendCountState.dateKey !== dateKey
  ) {
    globalState.__datematchEmailSendCountState = {
      dateKey,
      counts: {},
    };
  }

  return globalState.__datematchEmailSendCountState;
}

function getDailyLimit(scene: EmailScene, account: SmtpAccount) {
  return parseNonNegativeInt(
    process.env[`EMAIL_DAILY_LIMIT_${scene.toUpperCase()}_${account.toUpperCase()}`]
  );
}

function hasReachedDailyLimit(scene: EmailScene, account: SmtpAccount, now: Date = new Date()) {
  const limit = getDailyLimit(scene, account);
  if (limit === null) {
    return false;
  }

  const state = getEmailSendCountState(now);
  return (state.counts[getCounterKey(scene, account)] ?? 0) >= limit;
}

function recordSuccessfulSend(scene: EmailScene, account: SmtpAccount, now: Date = new Date()) {
  const state = getEmailSendCountState(now);
  const key = getCounterKey(scene, account);
  state.counts[key] = (state.counts[key] ?? 0) + 1;
}

function getSmtpConfig(account: SmtpAccount): SmtpConfig {
  const isPrimary = account === "primary";
  const prefix = isPrimary ? "SMTP_PRIMARY_" : "SMTP_SECONDARY_";
  const host = isPrimary
    ? readEnvWithFallback(`${prefix}HOST`, "SMTP_HOST")
    : readEnv(`${prefix}HOST`);
  const port = parsePort(
    isPrimary
      ? readRawEnvWithFallback(`${prefix}PORT`, "SMTP_PORT")
      : process.env[`${prefix}PORT`]
  );
  const user = isPrimary
    ? readEnvWithFallback(`${prefix}USER`, "SMTP_USER")
    : readEnv(`${prefix}USER`);
  const pass = isPrimary
    ? readEnvWithFallback(`${prefix}PASS`, "SMTP_PASS")
    : readEnv(`${prefix}PASS`);
  const secure = toBoolean(
    isPrimary
      ? readRawEnvWithFallback(`${prefix}SECURE`, "SMTP_SECURE")
      : process.env[`${prefix}SECURE`],
    port === 465
  );
  const from = isPrimary
    ? readEnvWithFallback(`${prefix}FROM`, "SMTP_FROM")
    : readEnv(`${prefix}FROM`);

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
  };
}

function isSmtpConfigReady(config: SmtpConfig) {
  return Boolean(config.host && config.user && config.pass);
}

function parseSmtpAccount(value: string): SmtpAccount | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "primary") return "primary";
  if (normalized === "secondary") return "secondary";
  return null;
}

function dedupeAccounts(accounts: SmtpAccount[]) {
  return accounts.filter((account, index) => accounts.indexOf(account) === index);
}

function getConfiguredAccounts() {
  return SMTP_ACCOUNTS.filter((account) => isSmtpConfigReady(getSmtpConfig(account)));
}

function getSceneRoute(scene: EmailScene) {
  const fallbackRoute = DEFAULT_ROUTE_BY_SCENE[scene];
  const override = process.env[ROUTE_ENV_BY_SCENE[scene]];
  const preferredRoute = override
    ? dedupeAccounts(
        override
          .split(",")
          .map((part) => parseSmtpAccount(part))
          .filter((account): account is SmtpAccount => Boolean(account))
      )
    : fallbackRoute;

  const configuredPreferredRoute = preferredRoute.filter((account) =>
    isSmtpConfigReady(getSmtpConfig(account))
  );
  if (configuredPreferredRoute.length > 0) {
    return configuredPreferredRoute;
  }

  const configuredAccounts = getConfiguredAccounts();
  if (configuredAccounts.length > 0) {
    return configuredAccounts;
  }

  throw new Error("SMTP is not fully configured");
}

function getFromAddress(account: SmtpAccount) {
  const config = getSmtpConfig(account);
  if (config.from) return config.from;
  if (config.user) return `DateMatch <${config.user}>`;
  throw new Error(`${account} SMTP FROM address is not configured`);
}

function getTransporter(account: SmtpAccount) {
  const cachedTransporter = transporterCache.get(account);
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const config = getSmtpConfig(account);
  if (!isSmtpConfigReady(config)) {
    throw new Error(`${account} SMTP is not fully configured`);
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  transporterCache.set(account, transporter);
  return transporter;
}

export function isEmailDeliveryConfigured() {
  return getConfiguredAccounts().length > 0;
}

async function sendEmail(message: EmailMessage, context: string, scene: EmailScene) {
  const route = getSceneRoute(scene);
  const failures: string[] = [];

  for (const account of route) {
    const dailyLimit = getDailyLimit(scene, account);
    if (hasReachedDailyLimit(scene, account)) {
      failures.push(`${account}: daily limit ${dailyLimit} reached`);
      console.warn(`email send skipped (${scene}/${account}): daily limit ${dailyLimit} reached`);
      continue;
    }

    try {
      const info = await getTransporter(account).sendMail({
        from: getFromAddress(account),
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });

      if (!info.messageId) {
        throw new Error("missing email id");
      }

      recordSuccessfulSend(scene, account);
      return { id: info.messageId } satisfies EmailSendResponse;
    } catch (error) {
      transporterCache.delete(account);
      const errorMessage = error instanceof Error ? error.message : String(error);
      failures.push(`${account}: ${errorMessage}`);
      console.warn(`email send attempt failed (${scene}/${account}):`, error);
    }
  }

  throw new Error(`${context}: ${failures.join(" | ")}`);
}

export async function sendConfirmationEmail(email: string) {
  return sendEmail(
    {
      to: email,
      subject: "Welcome to DateMatch",
      html: `
        <h1>欢迎加入 DateMatch</h1>
        <p>我们已经收到你的资料，后续有匹配结果会第一时间通知你。</p>
        <p>祝你早日遇见同频的人。</p>
      `,
      text: "欢迎加入 DateMatch。我们已经收到你的资料，后续有匹配结果会第一时间通知你。祝你早日遇见同频的人。",
    },
    "confirmation email send failed",
    "confirmation"
  );
}

export async function sendFeedbackEmail(params: {
  source: string;
  nickname: string;
  content: string;
}) {
  const { source, nickname, content } = params;
  const submittedAt = new Date().toLocaleString("zh-CN", { hour12: false });
  const safeContent = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return sendEmail(
    {
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
    },
    "feedback email send failed",
    "feedback"
  );
}

export async function sendLoginVerificationEmail(params: {
  email: string;
  verifyUrl: string;
  expiresHours?: number;
}) {
  const { email, verifyUrl, expiresHours = 24 } = params;

  return sendEmail(
    {
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
    },
    "login verification email send failed",
    "login_verification"
  );
}

export async function sendMatchResultEmail(params: {
  email: string;
  name: string;
  matchCount: number;
  viewUrl: string;
}) {
  const { email, name, matchCount, viewUrl } = params;

  return sendEmail(
    {
      to: email,
      subject: `你的本周匹配结果已出炉 · 共 ${matchCount} 位`,
      html: `
        <div style="max-width:640px;margin:0 auto;padding:24px;background:#fff0f6;font-family:Georgia,'Times New Roman',serif;color:#2b1a1f;">
          <h1 style="margin:0 0 8px;font-size:48px;line-height:1;color:#db2777;">匹配结果出炉</h1>
          <p style="margin:0 0 20px;font-size:24px;line-height:1.4;color:#5b4b52;">亲爱的 ${name}，你的本周匹配对象已生成</p>

          <div style="background:#fff;border:1px solid #fbcfe8;border-radius:22px;padding:30px 28px;">
            <h2 style="margin:0 0 16px;font-size:32px;line-height:1.2;color:#1f1f1f;">遇见契合的你</h2>
            <p style="margin:0 0 20px;font-size:20px;line-height:1.6;color:#5b4b52;">系统已完成本周匹配计算，为你找到 <strong style="color:#db2777;">${matchCount} 位</strong> 高潜力对象。</p>

            <p style="margin:0 0 20px;font-size:20px;line-height:1.6;color:#5b4b52;">每个人都是独特的存在，愿你在相遇中发现共鸣，在对话中感受温度。</p>

            <div style="margin:30px 0;padding:20px;background:#fff8fb;border-radius:12px;border:1px dashed #db2777;">
              <p style="margin:0 0 8px;font-size:18px;color:#db2777;font-weight:bold;">请复制以下链接到浏览器查看结果：</p>
              <p style="margin:0;word-break:break-all;font-size:18px;color:#1f1f1f;font-weight:bold;">${viewUrl}</p>
            </div>

            <p style="margin:20px 0 0;font-size:16px;color:#8c7a80;">匹配结果将在 5 天内有效，请及时查看。</p>
          </div>

          <p style="margin:24px 0 0;font-size:16px;color:#8c7a80;text-align:center;">祝你遇见美好 · DateMatch 团队</p>
        </div>
      `,
      text: `亲爱的 ${name}，你的本周匹配结果已出炉，共找到 ${matchCount} 位高潜力对象。请复制以下链接到浏览器查看：${viewUrl}`,
    },
    "match result email send failed",
    "match_result"
  );
}

export async function sendChatReminderEmail(params: {
  email: string;
  senderName: string;
  chatUrl: string;
  mode: "romance" | "friendship";
}) {
  const { email, senderName, chatUrl, mode } = params;
  const safeSenderName = senderName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const heading = mode === "friendship" ? "你有新的搭子消息" : "你有新的联系人消息";
  const intro = mode === "friendship" ? "有人在 DateMatch 给你发来了新的搭子消息。" : "有人在 DateMatch 给你发来了新的联系人消息。";

  return sendEmail(
    {
      to: email,
      subject: `DateMatch 提醒：${heading}`,
      html: `
        <div style="max-width:640px;margin:0 auto;padding:24px;background:#fff7fb;font-family:Georgia,'Times New Roman',serif;color:#2b1a1f;">
          <h1 style="margin:0 0 8px;font-size:48px;line-height:1;color:#db2777;">${heading}</h1>
          <p style="margin:0 0 20px;font-size:22px;line-height:1.5;color:#5b4b52;">${intro}</p>

          <div style="background:#fff;border:1px solid #fbcfe8;border-radius:22px;padding:30px 28px;">
            <p style="margin:0 0 14px;font-size:20px;line-height:1.6;color:#5b4b52;">发送人：<strong style="color:#db2777;">${safeSenderName}</strong></p>
            <p style="margin:0 0 22px;font-size:18px;line-height:1.7;color:#5b4b52;">出于隐私保护，这封邮件只做提醒，不展示聊天内容。点击下方按钮进入 DateMatch 查看消息。</p>
            <a href="${chatUrl}" style="display:inline-block;padding:16px 38px;border-radius:999px;background:#8d1f5f;color:#fff;text-decoration:none;font-size:22px;font-weight:700;">
              查看消息
            </a>
            <p style="margin:22px 0 8px;font-size:16px;color:#8c7a80;">如果按钮无法打开，请复制下面的地址到浏览器：</p>
            <p style="margin:0;word-break:break-all;font-size:16px;color:#6f5e65;">${chatUrl}</p>
          </div>
        </div>
      `,
      text: `${heading}\n${senderName} 在 DateMatch 给你发来了新的消息。\n出于隐私保护，邮件不展示聊天内容，请打开以下链接查看：${chatUrl}`,
    },
    "chat reminder email send failed",
    "chat_reminder"
  );
}

export { getBaseUrl };
