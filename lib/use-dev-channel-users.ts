import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AuthMode } from "@/lib/auth";
import type { UserSummary } from "@/components/match/types";

interface UseDevChannelUsersOptions {
  mode: AuthMode;
  checkingAuth: boolean;
  isAuthenticated: boolean;
}

interface UseDevChannelUsersResult {
  currentUser: UserSummary | null;
  users: UserSummary[];
  loadingUsers: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  reloadUsers: () => Promise<void>;
}

function parseStoredEmailIdentity(identity: string | null) {
  const emailMatch = Boolean(identity?.startsWith("email:"));
  const identityParts = emailMatch && identity ? identity.split(":") : [];
  const storedMode = identityParts.length >= 3 ? identityParts[1] : "romance";
  const email = emailMatch
    ? (identityParts.length >= 3 ? identityParts.slice(2).join(":") : identityParts.slice(1).join(":")).toLowerCase()
    : null;

  return {
    email,
    storedMode: storedMode as AuthMode,
  };
}

export function useDevChannelUsers({
  mode,
  checkingAuth,
  isAuthenticated,
}: UseDevChannelUsersOptions): UseDevChannelUsersResult {
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);

    try {
      const res = await fetch(`/api/users?mode=${mode}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !Array.isArray(data.users) || data.users.length === 0) {
        setError(data?.error || "暂无可用用户，无法进行匹配演示");
        setUsers([]);
        return;
      }

      setUsers(data.users as UserSummary[]);
    } catch {
      setError("加载用户列表失败，请稍后重试");
    } finally {
      setLoadingUsers(false);
    }
  }, [mode]);

  const reloadUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/users?mode=${mode}`, { cache: "no-store" });
      const data = await res.json();

      if (res.ok && Array.isArray(data.users)) {
        setUsers(data.users as UserSummary[]);
      }
    } catch (reloadError) {
      console.error("Failed to reload users:", reloadError);
    }
  }, [mode]);

  const loadCurrentUser = useCallback(() => {
    if (!users.length) return;

    const authIdentity = localStorage.getItem("datematch_auth_identity");
    const { email, storedMode } = parseStoredEmailIdentity(authIdentity);

    let resolved: UserSummary | null = null;

    if (email && storedMode !== mode) {
      setError(
        mode === "friendship"
          ? "当前登录态还是恋爱模式，请重新用朋友档案登录。"
          : "当前登录态还是朋友模式，请重新用恋爱档案登录。"
      );
      setCurrentUser(null);
      return;
    }

    if (email && storedMode === mode) {
      resolved = users.find((user) => user.email?.toLowerCase() === email) ?? null;
    }

    if (email && storedMode === mode && !resolved) {
      setError(
        mode === "friendship"
          ? "当前邮箱还没有朋友档案，请先提交朋友档案再登录。"
          : "当前邮箱还没有恋爱档案，请先提交恋爱档案再登录。"
      );
      setCurrentUser(null);
      return;
    }

    if (!resolved && !email) {
      resolved = users[0] ?? null;
    }

    if (resolved) {
      setError(null);
      setCurrentUser(resolved);
    }
  }, [mode, users]);

  useEffect(() => {
    if (checkingAuth || !isAuthenticated) return;
    void loadUsers();
  }, [checkingAuth, isAuthenticated, loadUsers]);

  useEffect(() => {
    if (!users.length) return;
    loadCurrentUser();
  }, [loadCurrentUser, users.length]);

  return {
    currentUser,
    users,
    loadingUsers,
    error,
    setError,
    reloadUsers,
  };
}
