const AUTH_TOKEN_KEY = "datematch_auth_token";
const AUTH_EXPIRES_AT_KEY = "datematch_auth_expires_at";
const AUTH_IDENTITY_KEY = "datematch_auth_identity";
const AUTH_USER_ID_KEY = "datematch_auth_user_id";
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthMode = "romance" | "friendship";

export type AuthCheckResult = {
  isAuthenticated: boolean;
  email?: string;
  mode?: AuthMode;
  userId?: number | null;
  expiresAt?: number | null;
};

export type AuthLoginResult = {
  success: boolean;
  message?: string;
};

function hasWindow() {
  return typeof window !== "undefined";
}

function buildEmailIdentity(email: string, mode: AuthMode) {
  return `email:${mode}:${email.trim().toLowerCase()}`;
}

function clearAuthStorage() {
  if (!hasWindow()) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
  localStorage.removeItem(AUTH_IDENTITY_KEY);
  localStorage.removeItem(AUTH_USER_ID_KEY);
}

function saveAuthSession(identity: string, ttlMs: number = DEFAULT_TTL_MS, userId?: number) {
  if (!hasWindow()) return;
  const token = `dm_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const expiresAt = Date.now() + ttlMs;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt));
  localStorage.setItem(AUTH_IDENTITY_KEY, identity);

  if (Number.isInteger(userId) && Number(userId) > 0) {
    localStorage.setItem(AUTH_USER_ID_KEY, String(userId));
  } else {
    localStorage.removeItem(AUTH_USER_ID_KEY);
  }
}

function syncEmailSession(email: string, mode: AuthMode, expiresAtSeconds?: number | null, userId?: number | null) {
  const ttlMs =
    typeof expiresAtSeconds === "number" && Number.isFinite(expiresAtSeconds)
      ? Math.max(0, expiresAtSeconds * 1000 - Date.now())
      : DEFAULT_TTL_MS;

  saveAuthSession(
    buildEmailIdentity(email, mode),
    ttlMs || DEFAULT_TTL_MS,
    Number.isInteger(userId) && Number(userId) > 0 ? Number(userId) : undefined,
  );
}

function hasValidStoredSession() {
  if (!hasWindow()) return false;

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const expiresRaw = localStorage.getItem(AUTH_EXPIRES_AT_KEY);
  const expiresAt = Number(expiresRaw);

  if (token && Number.isFinite(expiresAt) && Date.now() < expiresAt) {
    return true;
  }

  clearAuthStorage();
  return false;
}

function readStoredMode(): AuthMode | null {
  if (!hasWindow()) return null;

  const identity = localStorage.getItem(AUTH_IDENTITY_KEY);
  if (!identity?.startsWith("email:")) {
    return null;
  }

  const [, storedMode] = identity.split(":");
  return storedMode === "friendship" ? "friendship" : "romance";
}

export class AuthService {
  static async checkAuth(): Promise<AuthCheckResult> {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.isAuthenticated || !data?.email || !data?.mode) {
        clearAuthStorage();
        return { isAuthenticated: false };
      }

      const mode = data.mode === "friendship" ? "friendship" : "romance";
      const userId = Number(data.userId);
      const expiresAt = Number(data.expiresAt);

      syncEmailSession(
        String(data.email),
        mode,
        Number.isFinite(expiresAt) ? expiresAt : null,
        Number.isInteger(userId) && userId > 0 ? userId : null,
      );

      return {
        isAuthenticated: true,
        email: String(data.email),
        mode,
        userId: Number.isInteger(userId) && userId > 0 ? userId : null,
        expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
      };
    } catch {
      return { isAuthenticated: hasValidStoredSession() };
    }
  }

  static async loginWithCode(rawCode: string): Promise<AuthLoginResult> {
    const code = rawCode.trim();
    if (!code) {
      return { success: false, message: "请输入缘分码" };
    }

    saveAuthSession(`code:${code}`);
    return { success: true };
  }

  static async loginWithEmail(rawEmail: string, mode: AuthMode = "romance", userId?: number): Promise<AuthLoginResult> {
    const email = rawEmail.trim().toLowerCase();
    if (!email) {
      return { success: false, message: "邮箱不能为空" };
    }

    saveAuthSession(buildEmailIdentity(email, mode), DEFAULT_TTL_MS, userId);
    return { success: true };
  }

  static async devLogin(identity: string = "DEV-USER"): Promise<AuthLoginResult> {
    saveAuthSession(identity);
    return { success: true };
  }

  static getStoredUserId(mode?: AuthMode): number | null {
    if (!hasValidStoredSession()) {
      return null;
    }

    if (mode) {
      const storedMode = readStoredMode();
      if (storedMode && storedMode !== mode) {
        return null;
      }
    }

    const userId = Number(localStorage.getItem(AUTH_USER_ID_KEY));
    return Number.isInteger(userId) && userId > 0 ? userId : null;
  }

  static async logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // noop
    }
    clearAuthStorage();
  }
}
