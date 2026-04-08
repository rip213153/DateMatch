import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { UserSummary } from "@/components/match/types";
import type { AuthMode } from "@/lib/auth";

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

type UsersResponse = {
  currentUser?: UserSummary | null;
  users?: UserSummary[];
  error?: string;
};

export function useDevChannelUsers({
  mode,
  checkingAuth,
  isAuthenticated,
}: UseDevChannelUsersOptions): UseDevChannelUsersResult {
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyResponse = useCallback((data: UsersResponse) => {
    const nextCurrentUser = data.currentUser ?? (Array.isArray(data.users) ? data.users[0] ?? null : null);
    const nextUsers = Array.isArray(data.users)
      ? data.users
      : nextCurrentUser
        ? [nextCurrentUser]
        : [];

    setCurrentUser(nextCurrentUser);
    setUsers(nextUsers);
    setError(nextCurrentUser ? null : data.error || "暂无可用用户，无法进行匹配演示");
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);

    try {
      const res = await fetch(`/api/users?mode=${mode}`, { cache: "no-store" });
      const data = (await res.json()) as UsersResponse;

      if (!res.ok) {
        setCurrentUser(null);
        setUsers([]);
        setError(data?.error || "加载用户资料失败，请稍后重试");
        return;
      }

      applyResponse(data);
    } catch {
      setCurrentUser(null);
      setUsers([]);
      setError("加载用户资料失败，请稍后重试");
    } finally {
      setLoadingUsers(false);
    }
  }, [applyResponse, mode]);

  const reloadUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/users?mode=${mode}`, { cache: "no-store" });
      const data = (await res.json()) as UsersResponse;

      if (res.ok) {
        applyResponse(data);
      }
    } catch (reloadError) {
      console.error("Failed to reload users:", reloadError);
    }
  }, [applyResponse, mode]);

  useEffect(() => {
    if (checkingAuth || !isAuthenticated) return;
    void loadUsers();
  }, [checkingAuth, isAuthenticated, loadUsers]);

  return {
    currentUser,
    users,
    loadingUsers,
    error,
    setError,
    reloadUsers,
  };
}
