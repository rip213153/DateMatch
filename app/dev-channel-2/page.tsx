"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Clock3, Mail, MapPin, Radar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/auth";
import { useMatchData } from "@/lib/use-match-data";
import { MatchCard } from "@/components/match/MatchCard";
import { UserHeader } from "@/components/match/UserHeader";
import { ProfileDialog } from "@/components/match/ProfileDialog";
import { EditDialogs } from "@/components/match/EditDialogs";
import { generateIceBreakers, getHighlights } from "@/lib/match-helpers";
import type { MatchConfirmationStatus, UserSummary } from "@/components/match/types";

function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#faf8f9]" />
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-pink-300/40 blur-[100px] mix-blend-multiply"
      />
      <motion.div
        animate={{ x: [0, -40, 30, 0], y: [0, 50, -20, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-10%] top-[20%] h-[60%] w-[40%] rounded-full bg-purple-300/40 blur-[100px] mix-blend-multiply"
      />
    </div>
  );
}

function maskEmail(email: string | null): string {
  if (!email) return "";
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return email;
  
  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex);
  
  if (localPart.length <= 2) {
    return email;
  }
  
  const maskedLocal = localPart.substring(0, 2) + "*".repeat(Math.min(localPart.length - 2, 4)) + localPart.substring(localPart.length - 1);
  return maskedLocal + domainPart;
}

function formatScheduleTime(value: number | null): string {
  if (!value) return "";

  return new Date(value).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  });
}

function buildEmptyConfirmationStatus(): MatchConfirmationStatus {
  return {
    selfConfirmed: false,
    otherConfirmed: false,
    canMessage: false,
  };
}

export default function DevChannel2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "friendship" ? "friendship" : "romance";
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedMatchUser, setSelectedMatchUser] = useState<UserSummary | null>(null);
  const [radarOn, setRadarOn] = useState(true);
  const [updatingRadar, setUpdatingRadar] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showEditBio, setShowEditBio] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [confirmationStatuses, setConfirmationStatuses] = useState<Record<string, MatchConfirmationStatus>>({});
  const [loadingConfirmations, setLoadingConfirmations] = useState(false);
  const [updatingConfirmationUserId, setUpdatingConfirmationUserId] = useState<number | null>(null);

  const { matches, availability, loading, error: matchError, refresh } = useMatchData(currentUser, isAuthenticated, mode);

  const checkAuthentication = async () => {
    const result = await AuthService.checkAuth();
    setIsAuthenticated(result.isAuthenticated);
    setCheckingAuth(false);
    if (!result.isAuthenticated) {
      const redirect = mode === "friendship" ? "/dev-channel-2?mode=friendship" : "/dev-channel-2";
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}&mode=${mode}`);
    }
  };

  const loadUsers = async () => {
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
  };

  const reloadUsers = async () => {
    try {
      const res = await fetch(`/api/users?mode=${mode}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.users)) {
        setUsers(data.users as UserSummary[]);
      }
    } catch (error) {
      console.error("Failed to reload users:", error);
    }
  };

  const loadCurrentUser = () => {
    if (!users.length) return;

    const authIdentity = localStorage.getItem("datematch_auth_identity");
    const emailMatch = Boolean(authIdentity?.startsWith("email:"));
    const identityParts = emailMatch && authIdentity ? authIdentity.split(":") : [];
    const storedMode = identityParts.length >= 3 ? identityParts[1] : "romance";
    const email = emailMatch
      ? (identityParts.length >= 3 ? identityParts.slice(2).join(":") : identityParts.slice(1).join(":")).toLowerCase()
      : null;

    let resolved: UserSummary | null = null;

    if (email && storedMode !== mode) {
      setError(mode === "friendship" ? "当前登录态还是恋爱模式，请重新用朋友档案登录。" : "当前登录态还是朋友模式，请重新用恋爱档案登录。");
      setCurrentUser(null);
      return;
    }

    if (email && storedMode === mode) {
      resolved = users.find((u) => u.email?.toLowerCase() === email) ?? null;
    }

    if (email && storedMode === mode && !resolved) {
      setError(mode === "friendship" ? "当前邮箱还没有朋友档案，请先提交朋友档案再登录。" : "当前邮箱还没有恋爱档案，请先提交恋爱档案再登录。");
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
  };

  useEffect(() => {
    void checkAuthentication();
  }, [router, mode]);

  useEffect(() => {
    if (checkingAuth || !isAuthenticated) return;
    void loadUsers();
  }, [checkingAuth, isAuthenticated, mode]);

  useEffect(() => {
    if (!users.length) return;
    loadCurrentUser();
  }, [users]);

  useEffect(() => {
    setRadarOn(!availability.isOptedOutForRound);
  }, [availability.isOptedOutForRound, currentUser?.id]);

  useEffect(() => {
    if (!currentUser || matches.length === 0 || !availability.isInDisplayWindow) {
      setConfirmationStatuses({});
      setLoadingConfirmations(false);
      return;
    }

    const controller = new AbortController();
    const targetUserIds = matches.map((item) => item.user.id).join(",");
    setLoadingConfirmations(true);

    fetch(
      `/api/match-confirmations?userId=${currentUser.id}&targetUserIds=${encodeURIComponent(targetUserIds)}&mode=${mode}`,
      {
        cache: "no-store",
        signal: controller.signal,
      }
    )
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "加载点亮状态失败");
        }

        setConfirmationStatuses((data?.statuses ?? {}) as Record<string, MatchConfirmationStatus>);
      })
      .catch((fetchError) => {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        console.error("Failed to load match confirmations:", fetchError);
        setConfirmationStatuses({});
      })
      .finally(() => {
        setLoadingConfirmations(false);
      });

    return () => controller.abort();
  }, [availability.isInDisplayWindow, currentUser, matches, mode]);

  const openProfile = (targetUser: UserSummary) => {
    setSelectedMatchUser(targetUser);
    setProfileOpen(true);
  };

  const getConfirmationStatus = (targetUserId: number) =>
    confirmationStatuses[String(targetUserId)] ?? null;

  const startChat = (targetUserId: number) => {
    if (!currentUser) return;
      router.push(`/chat?userId=${currentUser.id}&targetUserId=${targetUserId}&mode=${mode}`);
  };

  const toggleConfirmation = async (targetUserId: number) => {
    if (!currentUser || updatingConfirmationUserId === targetUserId) return;

    const currentStatus = getConfirmationStatus(targetUserId) ?? buildEmptyConfirmationStatus();
    if (currentStatus.canMessage && currentStatus.selfConfirmed && currentStatus.otherConfirmed) {
      return;
    }

    const nextConfirmed = !currentStatus.selfConfirmed;
    setUpdatingConfirmationUserId(targetUserId);

    try {
      const response = await fetch("/api/match-confirmations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          targetUserId,
          confirmed: nextConfirmed,
          mode,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "更新点亮状态失败");
      }

      if (data?.status) {
        setConfirmationStatuses((current) => ({
          ...current,
          [String(targetUserId)]: data.status as MatchConfirmationStatus,
        }));
      }
    } catch (toggleError) {
      console.error("Failed to update match confirmation:", toggleError);
      setError(toggleError instanceof Error ? toggleError.message : "更新点亮状态失败");
    } finally {
      setUpdatingConfirmationUserId(null);
    }
  };

  const handleRadarToggle = async () => {
    if (!currentUser || updatingRadar) return;
    if (availability.isOptedOutForRound || !radarOn) return;
    if (!availability.displayEndAt) return;

    setUpdatingRadar(true);
    setError(null);

    try {
      const response = await fetch("/api/match-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          userId: currentUser.id,
          status: "WAITING",
          matchAt: availability.releaseAt ?? availability.matchAt,
          optOutUntil: availability.displayEndAt,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "退出本轮匹配失败");
      }

      setRadarOn(false);
      setActiveCardIndex(0);
      await Promise.all([refresh(), reloadUsers()]);
    } catch (toggleError) {
      console.error("Failed to exit current match round:", toggleError);
      setError(toggleError instanceof Error ? toggleError.message : "退出本轮匹配失败，请稍后重试");
    } finally {
      setUpdatingRadar(false);
    }
  };

  const iceBreakers = generateIceBreakers(currentUser || { id: 0, name: "加载中", age: 0, university: "" }, matches[activeCardIndex] || { user: { id: 0, name: "", age: 0, university: "", ideal_date: "", interests: null, email: "" }, match: { overallScore: 0, breakdown: { personality: 0, interests: 0, background: 0, complementary: 0 }, matches: [], recommendations: [] } });
  const highlights = getHighlights(currentUser || { id: 0, name: "加载中", age: 0, university: "" }, matches[activeCardIndex] || { user: { id: 0, name: "", age: 0, university: "", ideal_date: "", interests: null, email: "" }, match: { overallScore: 0, breakdown: { personality: 0, interests: 0, background: 0, complementary: 0 }, matches: [], recommendations: [] } });

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
          <Radar className="h-8 w-8 animate-spin text-pink-600" />
        </div>
        <p className="mt-4 text-gray-600">正在验证你的身份...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 py-6 font-sans sm:px-8">
      <BackgroundEffects />

      <UserHeader
        onLogout={() => {
          AuthService.logout();
          router.push("/");
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_8px_32px_0_rgba(236,72,153,0.08)] backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-rose-400 text-xl font-bold text-white shadow-md">
                {currentUser?.name?.slice(0, 1) ?? "U"}
              </div>
              <div>
                <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-800">
                  {currentUser?.name ?? "加载中"}
                  <span className="rounded-full bg-white/50 px-2 py-0.5 text-sm font-medium text-gray-500">
                    {currentUser?.age ?? "-"}岁
                  </span>
                  {currentUser?.gender && (
                    <span className="rounded-full bg-white/50 px-2 py-0.5 text-sm font-medium text-gray-500">
                      {currentUser.gender}
                    </span>
                  )}
                  {currentUser && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/profile/edit?userId=${currentUser.id}&mode=${mode}`)}
                      className="h-6 text-[10px] text-rose-600 hover:text-rose-700"
                    >
                      完整编辑
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditName(true)}
                    className="h-6 text-[10px] text-pink-600 hover:text-pink-700"
                  >
                    修改昵称
                  </Button>
                </h2>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{currentUser?.university ?? "未设置学校"}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span className={`rounded-lg px-2 py-1 font-medium ${mode === "friendship" ? "bg-sky-50 text-sky-600" : "bg-pink-50 text-pink-600"}`}>
                    {mode === "friendship" ? "朋友模式" : "恋爱模式"}
                  </span>
                  {currentUser?.seeking && (
                    <span className="rounded-lg bg-purple-50 px-2 py-1">
                      <span className="font-medium text-purple-600">寻找：</span>
                      {currentUser.seeking}
                    </span>
                  )}
                </div>
                {currentUser && (
                  <div className="mt-3 rounded-xl bg-gradient-to-r from-pink-50/50 to-purple-50/50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-gray-700">自我介绍</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditBio(true)}
                        className="h-6 text-[10px] text-pink-600 hover:text-pink-700"
                      >
                        编辑
                      </Button>
                    </div>
                    <div className="mt-1 text-xs text-gray-600 leading-relaxed">
                      {currentUser.bio ? currentUser.bio : <span className="text-gray-400 italic">该用户暂未填写自我介绍</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-[300px]">
                <div className="flex items-center justify-between rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-pink-500" />
                    <span className="flex-1 text-sm text-gray-700">
                      {currentUser?.email ? maskEmail(currentUser.email) : ""}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditEmail(true)}
                    className="h-6 text-[10px] text-pink-600 hover:text-pink-700"
                  >
                    修改
                  </Button>
                </div>
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">•</span> 邮箱仅用于登录验证，保护您的隐私
                </div>
              </div>
          </div>
        </motion.div>

        {loadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
              <Radar className="h-8 w-8 animate-spin text-pink-600" />
            </div>
            <p className="ml-4 text-gray-600">正在加载用户列表...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between rounded-[2rem] border border-white/60 bg-white/60 px-6 py-4 shadow-[0_8px_32px_0_rgba(236,72,153,0.08)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 transition-colors ${radarOn ? "bg-pink-100 text-pink-500" : "bg-gray-100 text-gray-400"}`}>
                  <Radar className={`h-5 w-5 ${radarOn ? "animate-spin-slow" : ""}`} />
                </div>
                <div className="hidden">
                  <h3 className="font-bold text-gray-800">{radarOn ? "校园雷达已开启" : "校园雷达已暂停"}</h3>
                  <p className="text-xs text-gray-500">{radarOn ? "" : "重新打开雷达，继续查看新的匹配结果。"}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{radarOn ? "校园雷达已开启" : "已退出本轮匹配"}</h3>
                  <p className="text-xs text-gray-500">
                    {radarOn ? "关闭雷达后，将退出本轮匹配并在下一轮自动恢复。" : "本轮不会再展示你的匹配卡片，下一轮会自动恢复参与。"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="toggle matching"
                onClick={() => void handleRadarToggle()}
                disabled={loading || updatingRadar || availability.isOptedOutForRound || !availability.displayEndAt}
                className={`flex h-8 w-14 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ${
                  radarOn ? "bg-gradient-to-r from-pink-400 to-purple-400 shadow-inner" : "bg-gray-200"
                } ${loading || updatingRadar || availability.isOptedOutForRound || !availability.displayEndAt ? "cursor-not-allowed opacity-70" : ""}`}
                title={
                  availability.isOptedOutForRound
                    ? "你已退出本轮匹配，下轮自动恢复"
                    : !availability.displayEndAt
                      ? "正在同步匹配轮次"
                      : "关闭雷达即退出本轮匹配"
                }
              >
                <motion.div
                  layout
                  className="h-6 w-6 rounded-full bg-white shadow-sm"
                  animate={{ x: radarOn ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </motion.div>

            {!radarOn ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_8px_32px_0_rgba(236,72,153,0.08)] backdrop-blur-xl sm:p-8"
              >
                <div className="hidden min-h-[320px] flex-col items-center justify-center py-10 text-center opacity-70">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-600">雷达已关闭</h3>
                  <p className="max-w-xs text-sm text-gray-400">打开上方雷达开关，就能继续查看你当前的匹配位。</p>
                </div>
                <div className="flex min-h-[320px] flex-col items-center justify-center py-10 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-700">你已退出本轮匹配</h3>
                  <p className="max-w-sm text-sm text-gray-500">本轮匹配卡片和你的曝光都会关闭，系统会在下一轮自动恢复你的雷达状态。</p>
                  <p className="mt-3 rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600">
                    下轮恢复时间：{formatScheduleTime(availability.nextReleaseAt || availability.matchAt)}
                  </p>
                </div>
              </motion.div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                  <Radar className="h-8 w-8 animate-spin text-pink-600" />
                </div>
                <p className="ml-4 text-gray-600">正在计算匹配...</p>
              </div>
            ) : matchError ? (
              <div className="rounded-lg bg-red-50 p-4 text-red-600">{matchError}</div>
            ) : !availability.isInDisplayWindow ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_8px_32px_0_rgba(236,72,153,0.08)] backdrop-blur-xl sm:p-8"
              >
                <div className="flex min-h-[320px] flex-col items-center justify-center py-10 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
                    <Clock3 className="h-8 w-8 text-pink-500" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-700">
                    {availability.isQueuedForNextRound ? "你已进入下一轮匹配" : "当前不在匹配展示期"}
                  </h3>
                  <p className="max-w-sm text-sm text-gray-500">
                    {availability.isQueuedForNextRound
                      ? "你是在本轮展示期内提交的档案，因此会自动归入下一轮；等下一次倒计时结束后，就能看到你的匹配卡片。"
                      : "匹配卡片会在开放时间后展示，关闭期内会自动隐藏。"}
                  </p>
                  <p className="mt-3 rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600">
                    {availability.isQueuedForNextRound ? "你的可见时间：" : "下一轮开放时间："}
                    {formatScheduleTime(availability.nextReleaseAt || availability.eligibleReleaseAt || availability.matchAt)}
                  </p>
                </div>
              </motion.div>
            ) : matches.length === 0 ? (
              <div className="rounded-lg bg-yellow-50 p-4 text-yellow-600">暂无匹配对象，请稍后再试</div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_8px_32px_0_rgba(236,72,153,0.08)] backdrop-blur-xl sm:p-8"
              >
                {error && <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
                
                <MatchCard
                  match={matches[activeCardIndex]}
                  onNext={() => setActiveCardIndex((prev) => (prev + 1) % matches.length)}
                  onPrev={() => setActiveCardIndex((prev) => (prev - 1 + matches.length) % matches.length)}
                  activeIndex={activeCardIndex}
                  totalMatches={matches.length}
                  onOpenProfile={() => openProfile(matches[activeCardIndex].user)}
                  onStartChat={() => startChat(matches[activeCardIndex].user.id)}
                  confirmationStatus={getConfirmationStatus(matches[activeCardIndex].user.id)}
                  onToggleConfirm={() => void toggleConfirmation(matches[activeCardIndex].user.id)}
                  confirmationUpdating={
                    loadingConfirmations || updatingConfirmationUserId === matches[activeCardIndex].user.id
                  }
                  iceBreakers={iceBreakers}
                  highlights={highlights}
                />
              </motion.div>
            )}
          </>
        )}
      </div>

      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        match={selectedMatchUser}
        currentUser={currentUser}
        mode={mode}
        confirmationStatus={selectedMatchUser ? getConfirmationStatus(selectedMatchUser.id) : null}
        confirmationUpdating={
          loadingConfirmations ||
          (selectedMatchUser ? updatingConfirmationUserId === selectedMatchUser.id : false)
        }
        onToggleConfirm={() => {
          if (selectedMatchUser) {
            void toggleConfirmation(selectedMatchUser.id);
          }
        }}
      />

      <EditDialogs
        currentUser={currentUser}
        mode={mode}
        showEditBio={showEditBio}
        setShowEditBio={setShowEditBio}
        showEditEmail={showEditEmail}
        setShowEditEmail={setShowEditEmail}
        showEditName={showEditName}
        setShowEditName={setShowEditName}
        onReload={reloadUsers}
      />
    </div>
  );
}
