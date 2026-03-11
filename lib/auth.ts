const AUTH_TOKEN_KEY = "datematch_auth_token";
const AUTH_EXPIRES_AT_KEY = "datematch_auth_expires_at";
const AUTH_IDENTITY_KEY = "datematch_auth_identity";
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthCheckResult = {
  isAuthenticated: boolean;
};

export type AuthLoginResult = {
  success: boolean;
  message?: string;
};

function hasWindow() {
  return typeof window !== "undefined";
}

function clearAuthStorage() {
  if (!hasWindow()) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
  localStorage.removeItem(AUTH_IDENTITY_KEY);
}

function saveAuthSession(identity: string, ttlMs: number = DEFAULT_TTL_MS) {
  if (!hasWindow()) return;
  const token = `dm_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const expiresAt = Date.now() + ttlMs;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt));
  localStorage.setItem(AUTH_IDENTITY_KEY, identity);
}

export class AuthService {
  static async checkAuth(): Promise<AuthCheckResult> {
    if (!hasWindow()) return { isAuthenticated: false };

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const expiresRaw = localStorage.getItem(AUTH_EXPIRES_AT_KEY);
    const expiresAt = Number(expiresRaw);

    if (token && Number.isFinite(expiresAt) && Date.now() < expiresAt) {
      return { isAuthenticated: true };
    }

    clearAuthStorage();

    return { isAuthenticated: false };
  }

  static async loginWithCode(rawCode: string): Promise<AuthLoginResult> {
    const code = rawCode.trim();
    if (!code) {
      return { success: false, message: "请输入缘分码" };
    }

    saveAuthSession(`code:${code}`);
    return { success: true };
  }

  static async loginWithEmail(rawEmail: string): Promise<AuthLoginResult> {
    const email = rawEmail.trim().toLowerCase();
    if (!email) {
      return { success: false, message: "邮箱不能为空" };
    }

    saveAuthSession(`email:${email}`);
    return { success: true };
  }

  static async devLogin(identity: string = "DEV-USER"): Promise<AuthLoginResult> {
    saveAuthSession(identity);
    return { success: true };
  }

  static async logout() {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST", 
        credentials: "include",
        cache: "no-store"
      });
    } catch {
      // noop
    }
    clearAuthStorage();
  }
}
