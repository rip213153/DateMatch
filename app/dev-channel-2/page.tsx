"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BellRing,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Radar,
  RefreshCcw,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthService } from "@/lib/auth";

type UserSummary = {
  id: number;
  name: string;
  age: number;
  university: string;
  email?: string;
};

type MatchItem = {
  user: {
    id: number;
    name: string;
    age: number;
    university: string;
    email: string;
    ideal_date: string;
    interests: unknown;
  };
  match: {
    overallScore: number;
    breakdown: {
      personality: number;
      interests: number;
      background: number;
      complementary: number;
    };
    matches: string[];
    recommendations: string[];
  };
};

type Phase = "paused" | "scanning" | "result";

const glassCardClass =
  "relative z-10 overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_8px_32px_0_rgba(236,72,153,0.08)] backdrop-blur-xl sm:p-8";

function toPositiveInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

function formatInterests(interests: unknown): string {
  if (Array.isArray(interests)) {
    const clean = interests.map((item) => String(item).trim()).filter(Boolean);
    return clean.length ? clean.join("、") : "兴趣待补充";
  }

  if (typeof interests === "string") {
    const text = interests.trim();
    if (!text) return "兴趣待补充";

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const clean = parsed.map((item) => String(item).trim()).filter(Boolean);
        return clean.length ? clean.join("、") : "兴趣待补充";
      }
    } catch {
      return text;
    }

    return text;
  }

  return "兴趣待补充";
}

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

function ProgressBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-end justify-between text-xs font-bold text-gray-600">
        <span>{label}</span>
        <span className="text-sm text-gray-700">{percentage}%</span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
}

export default function DevChannel2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [radarOn, setRadarOn] = useState(true);
  const [phase, setPhase] = useState<Phase>("scanning");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedMatchUser, setSelectedMatchUser] = useState<MatchItem["user"] | null>(null);
  const [checkingEmailAccess, setCheckingEmailAccess] = useState(false);
  const [emailUnlocked, setEmailUnlocked] = useState(false);

  const activeMatch = matches[activeCardIndex] ?? null;

  const displayHighlights = useMemo(() => {
    if (!activeMatch) return [] as string[];

    const derivedHighlights: string[] = [];
    if (currentUser && currentUser.university === activeMatch.user.university) derivedHighlights.push("同校");
    if (currentUser && Math.abs(currentUser.age - activeMatch.user.age) <= 2) derivedHighlights.push("年龄相近");
    if (toPercent(activeMatch.match.breakdown.personality) >= 80) derivedHighlights.push("性格高度契合");

    const interestPreview = formatInterests(activeMatch.user.interests)
      .split("、")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (interestPreview.length) {
      derivedHighlights.push(`共同兴趣：${interestPreview.join("、")}`);
    }

    const merged = [...activeMatch.match.matches, ...derivedHighlights]
      .map((item) => item.trim())
      .filter(Boolean);

    return Array.from(new Set(merged)).slice(0, 4);
  }, [activeMatch, currentUser]);

  const displayRecommendations = useMemo(() => {
    if (!activeMatch) return [] as string[];

    const tips = activeMatch.match.recommendations
      .map((item) => item.trim())
      .filter(Boolean);

    if (tips.length) {
      return Array.from(new Set(tips)).slice(0, 3);
    }

    return [
      "先从校园日常聊起，比如最近的课程、食堂、图书馆或常去的小店。",
      "如果你们有共同兴趣，可以直接从最近在做的事切入，会更自然。",
      "第一句别太重，轻松一点，给对方留下继续接话的空间。",
    ];
  }, [activeMatch]);

  useEffect(() => {
    const checkAuthentication = async () => {
      const result = await AuthService.checkAuth();
      setIsAuthenticated(result.isAuthenticated);
      setCheckingAuth(false);
      if (!result.isAuthenticated) router.replace("/login?redirect=/dev-channel-2");
    };

    void checkAuthentication();
  }, [router]);

  useEffect(() => {
    if (checkingAuth || !isAuthenticated) return;

    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch("/api/users", { cache: "no-store" });
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

    void loadUsers();
  }, [checkingAuth, isAuthenticated]);

  useEffect(() => {
    if (!users.length) return;

    const authIdentity = localStorage.getItem("datematch_auth_identity");
    const emailMatch = authIdentity?.startsWith("email:");
    const email = emailMatch ? authIdentity?.substring(6).toLowerCase() : null;

    let resolved: UserSummary | null = null;

    if (email) {
      resolved = users.find((u) => u.email?.toLowerCase() === email) ?? null;
    }

    if (!resolved) {
      resolved = users[0] ?? null;
    }

    if (resolved) {
      setCurrentUser(resolved);
    }
  }, [users]);

  useEffect(() => {
    if (!currentUser || checkingAuth || !isAuthenticated) return;

    const loadMatches = async () => {
      setLoadingMatches(true);
      setError(null);
      if (radarOn) setPhase("scanning");

      try {
        const res = await fetch(`/api/find-matches?userId=${currentUser.id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || "获取匹配结果失败");
          setMatches([]);
          return;
        }

        const nextMatches = Array.isArray(data.matches) ? (data.matches as MatchItem[]) : [];
        setMatches(nextMatches);
        setActiveCardIndex(0);
      } catch {
        setError("获取匹配结果失败，请稍后重试");
        setMatches([]);
        setActiveCardIndex(0);
      } finally {
        setLoadingMatches(false);
      }
    };

    void loadMatches();
  }, [currentUser, radarOn, checkingAuth, isAuthenticated]);

  useEffect(() => {
    if (!radarOn) {
      setPhase("paused");
      return;
    }

    if (loadingUsers || loadingMatches) {
      setPhase("scanning");
      return;
    }

    setPhase("result");
  }, [radarOn, loadingUsers, loadingMatches, matches.length]);

  const nextCard = () => {
    if (matches.length <= 1) return;
    setActiveCardIndex((prev) => (prev + 1) % matches.length);
  };

  const prevCard = () => {
    if (matches.length <= 1) return;
    setActiveCardIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const restart = () => {
    if (!radarOn) setRadarOn(true);
    setPhase("scanning");
    setActiveCardIndex(0);
  };

  const openProfile = async (targetUser: MatchItem["user"]) => {
    setSelectedMatchUser(targetUser);
    setProfileOpen(true);
    setEmailUnlocked(false);

    if (!currentUser) return;

    setCheckingEmailAccess(true);
    try {
      const response = await fetch(`/api/chat/messages?userId=${currentUser.id}&targetUserId=${targetUser.id}`, {
        cache: "no-store",
      });
      const data = await response.json();
      const chatMessages: Array<{ senderId: number }> = Array.isArray(data.messages) ? data.messages : [];
      const sentByCurrentUser = chatMessages.some((message) => message.senderId === currentUser.id);
      const sentByTargetUser = chatMessages.some((message) => message.senderId === targetUser.id);
      setEmailUnlocked(sentByCurrentUser && sentByTargetUser);
    } catch {
      setEmailUnlocked(false);
    } finally {
      setCheckingEmailAccess(false);
    }
  };

  const startChat = (targetUserId: number) => {
    if (!currentUser) return;
    router.push(`/chat?userId=${currentUser.id}&targetUserId=${targetUserId}`);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 py-12 font-sans sm:px-8">
      {checkingAuth ? (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
            <Radar className="h-8 w-8 animate-spin text-pink-600" />
          </div>
          <p className="mt-4 text-gray-600">正在验证你的身份...</p>
        </div>
      ) : !isAuthenticated ? null : (
        <>
          <BackgroundEffects />

          <motion.div className="absolute left-6 top-6 z-20 flex items-center gap-3" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/" className="flex items-center gap-2 rounded-xl border border-pink-100 bg-white/80 px-2 py-1.5 shadow-sm backdrop-blur-md">
              <ArrowLeft className="h-4 w-4 text-gray-600" />
              <Heart className="h-5 w-5 text-pink-500" fill="currentColor" />
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-base font-bold tracking-tight text-transparent">DateMatch</span>
            </Link>
          </motion.div>

          <div className="relative z-10 mx-auto w-full max-w-4xl space-y-6 pt-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${glassCardClass} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-rose-400 text-xl font-bold text-white shadow-md">
                  {currentUser?.name?.slice(0, 1) ?? "U"}
                </div>
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-800">
                    {currentUser?.name ?? "加载中"}
                    <span className="rounded-full bg-white/50 px-2 py-0.5 text-sm font-medium text-gray-500">{currentUser?.age ?? "-"}岁</span>
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{currentUser?.university ?? "未设置学校"}</span>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-[300px]">
                <div className="flex items-center gap-2">
                  <div className="h-10 flex-1 rounded-xl border border-pink-100 bg-white px-3 text-sm text-gray-700 flex items-center">
                    <span className="text-gray-500">当前用户</span>
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  <span className="font-semibold text-pink-600">已登录用户：</span>
                  {currentUser?.name}（{currentUser?.age}岁）
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`${glassCardClass} flex items-center justify-between !py-4 bg-gradient-to-r from-white/60 to-pink-50/40`}>
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 transition-colors ${radarOn ? "bg-pink-100 text-pink-500" : "bg-gray-100 text-gray-400"}`}>
                  <Radar className={`h-5 w-5 ${radarOn ? "animate-spin-slow" : ""}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{radarOn ? "校园雷达已开启" : "校园雷达已暂停"}</h3>
                  <p className="text-xs text-gray-500">{radarOn ? "只在真实加载时显示扫描，不再额外等待。" : "重新打开雷达，继续查看新的匹配结果。"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={restart} className="h-8 rounded-full border-pink-200 bg-white/70 text-pink-600 hover:bg-pink-50">
                  <RefreshCcw className="mr-1 h-3.5 w-3.5" />
                  重新匹配
                </Button>
                <button type="button" aria-label="toggle matching" onClick={() => { setRadarOn((prev) => !prev); setActiveCardIndex(0); }} className={`flex h-8 w-14 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ${radarOn ? "bg-gradient-to-r from-pink-400 to-purple-400 shadow-inner" : "bg-gray-200"}`}>
                  <motion.div layout className="h-6 w-6 rounded-full bg-white shadow-sm" animate={{ x: radarOn ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${glassCardClass} min-h-[430px]`}>
              {error ? <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

              <AnimatePresence mode="wait">
                {phase === "paused" ? (
                  <motion.div key="paused" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex min-h-[320px] flex-col items-center justify-center py-10 text-center opacity-70">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"><User className="h-8 w-8 text-gray-400" /></div>
                    <h3 className="mb-2 text-lg font-bold text-gray-600">雷达已关闭</h3>
                    <p className="max-w-xs text-sm text-gray-400">打开上方雷达开关，就能继续查看你当前的五个匹配位。</p>
                  </motion.div>
                ) : phase === "scanning" ? (
                  <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative flex min-h-[320px] flex-col items-center justify-center py-10">
                    <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
                      <motion.div animate={{ scale: [1, 2.5], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} className="absolute inset-0 rounded-full bg-pink-400" />
                      <motion.div animate={{ scale: [1, 2], opacity: [0.8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }} className="absolute inset-0 rounded-full bg-purple-400" />
                      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-300/50"><Radar className="h-8 w-8 animate-spin-slow text-white" /></div>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-800">正在计算匹配结果...</h3>
                    <p className="flex items-center gap-1.5 text-sm text-gray-500"><Sparkles className="h-4 w-4 animate-pulse text-pink-400" />{loadingUsers || loadingMatches ? "正在同步用户与匹配数据" : `已找到 ${matches.length} 位候选对象`}</p>
                  </motion.div>
                ) : !activeMatch ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[320px] flex-col items-center justify-center py-10 text-center">
                    <User className="mb-3 h-10 w-10 text-gray-300" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-600">暂时没有匹配对象</h3>
                    <p className="text-sm text-gray-500">换一个用户试试，或者点击重新匹配。</p>
                  </motion.div>
                ) : (
                  <motion.div key={`result-${activeMatch.user.id}-${activeCardIndex}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex flex-col">
                    <motion.div drag={matches.length > 1 ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25} onDragEnd={(_, info) => {
                      const distance = info.offset.x;
                      const speed = info.velocity.x;
                      if (Math.abs(distance) < 70 && Math.abs(speed) < 500) return;
                      if (distance < 0 || speed < 0) nextCard();
                      else prevCard();
                    }} className="rounded-[1.6rem] border border-white/70 bg-white/80 p-5 shadow-[0_12px_40px_rgba(236,72,153,0.12)]">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-bold text-green-600"><BellRing className="h-3.5 w-3.5" />已锁定高潜力对象</div>
                          <h2 className="mb-2 flex items-end gap-2 text-2xl font-extrabold text-gray-900">{activeMatch.user.name}<span className="text-lg font-medium text-gray-500">{activeMatch.user.age}岁</span></h2>
                          <p className="flex items-center gap-1.5 text-sm text-gray-600"><MapPin className="h-4 w-4 text-pink-400" />{activeMatch.user.university} · {activeMatch.user.ideal_date || "适合从轻松自然的见面开始"}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-xl font-black text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                            {toPercent(activeMatch.match.overallScore)}%
                            <svg className="absolute inset-0 h-full w-full animate-spin-slow" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="30 10" /></svg>
                          </div>
                          <span className="mt-2 text-xs font-bold text-pink-600">本轮推荐</span>
                        </div>
                      </div>

                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800"><Heart className="h-4 w-4 text-rose-500" fill="currentColor" />匹配亮点</div>
                        {matches.length > 1 ? (
                          <div className="flex items-center gap-2">
                            <span className="hidden text-xs text-gray-400 sm:inline">左右滑动切换卡片</span>
                            <Button type="button" variant="outline" size="sm" onClick={nextCard} className="h-8 rounded-full border-pink-200 bg-white text-pink-600 hover:bg-pink-50">换一位</Button>
                          </div>
                        ) : null}
                      </div>

                      <div className="mb-6 flex flex-wrap gap-2">
                        {displayHighlights.map((tag) => <span key={tag} className="rounded-md border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">{tag}</span>)}
                      </div>

                      <div className="mb-6 rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
                        <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-purple-800"><Sparkles className="h-4 w-4 text-purple-500" />专属破冰建议</div>
                        <ul className="space-y-1.5">
                          {displayRecommendations.map((text, idx) => <li key={idx} className="text-xs text-purple-700">{text}</li>)}
                        </ul>
                      </div>

                      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6">
                        <ProgressBar label="性格匹配" percentage={toPercent(activeMatch.match.breakdown.personality)} color="from-blue-400 to-indigo-500" />
                        <ProgressBar label="兴趣重叠" percentage={toPercent(activeMatch.match.breakdown.interests)} color="from-emerald-400 to-teal-500" />
                        <ProgressBar label="背景相似" percentage={toPercent(activeMatch.match.breakdown.background)} color="from-amber-400 to-orange-500" />
                        <ProgressBar label="性格互补" percentage={toPercent(activeMatch.match.breakdown.complementary)} color="from-purple-400 to-fuchsia-500" />
                      </div>

                      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row">
                        <Button type="button" onClick={() => startChat(activeMatch.user.id)} className="group relative h-12 flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-200 transition-all hover:-translate-y-0.5 hover:from-pink-600 hover:to-purple-700">
                          <span className="relative z-10 flex items-center justify-center gap-2"><MessageCircle className="h-4 w-4" />开启聊天并确认</span>
                          <div className="absolute inset-0 -translate-x-full skew-x-[-45deg] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                        </Button>
                        <Button type="button" variant="outline" onClick={() => openProfile(activeMatch.user)} className="h-12 flex-1 rounded-xl border-pink-200 bg-white/50 font-bold text-pink-600 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-pink-50">
                          <User className="mr-2 h-4 w-4" />查看资料
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <Dialog open={profileOpen} onOpenChange={(open) => {
            setProfileOpen(open);
            if (!open) {
              setCheckingEmailAccess(false);
              setEmailUnlocked(false);
            }
          }}>
            <DialogContent className="border-white/70 bg-white/95 p-0 shadow-2xl sm:max-w-lg">
              <DialogHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5 text-left">
                <DialogTitle className="text-2xl font-extrabold text-gray-900">{selectedMatchUser?.name ?? "对方"}的资料</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">查看资料后，可以直接发起聊天。</DialogDescription>
              </DialogHeader>

              {selectedMatchUser ? (
                <div className="space-y-4 px-6 py-5 text-sm text-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gray-50 p-4"><div className="text-gray-500">年龄</div><div className="font-semibold text-gray-900">{selectedMatchUser.age} 岁</div></div>
                    <div className="rounded-2xl bg-gray-50 p-4"><div className="text-gray-500">学校</div><div className="font-semibold text-gray-900">{selectedMatchUser.university}</div></div>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4"><div className="mb-1 text-gray-500">兴趣爱好</div><div className="leading-relaxed text-gray-800">{formatInterests(selectedMatchUser.interests)}</div></div>
                  <div className="rounded-2xl bg-gray-50 p-4"><div className="mb-1 text-gray-500">理想约会</div><div className="leading-relaxed text-gray-800">{selectedMatchUser.ideal_date || "暂未填写"}</div></div>

                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-700"><Mail className="h-4 w-4 text-pink-500" /><span className="font-medium">邮箱</span></div>
                    <div className="mt-2 break-all text-sm text-gray-600">{checkingEmailAccess ? "正在检查解锁条件..." : emailUnlocked ? selectedMatchUser.email : "双方都发送过消息后，这里才会显示邮箱"}</div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                    <Button variant="outline" onClick={() => setProfileOpen(false)} className="h-11 rounded-xl">关闭</Button>
                    <Button onClick={() => startChat(selectedMatchUser.id)} className="h-11 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"><MessageCircle className="mr-2 h-4 w-4" />直接发起消息</Button>
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes shimmer { 100% { transform: translateX(200%); } }
            @keyframes spin-slow { to { transform: rotate(360deg); } }
            .animate-spin-slow { animation: spin-slow 3s linear infinite; }
          ` }} />
        </>
      )}
    </div>
  );
}
