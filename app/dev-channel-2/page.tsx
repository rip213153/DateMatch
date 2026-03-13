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
import type { PersonalityTraits } from "@/app/data/types";
import { ICE_BREAKERS, HIGHLIGHTS, getIceBreakerByTraits, getHighlightText } from "@/lib/ice-breaker";
import { useMatchStatus } from "@/lib/use-match-status";

type UserSummary = {
  id: number;
  name: string;
  age: number;
  university: string;
  email?: string;
  gender?: string;
  seeking?: string;
  ideal_date?: string;
  bio?: string;
  interests?: unknown;
  personality_profile?: string | PersonalityTraits;
};

type MatchItem = {
  user: {
    id: number;
    name: string;
    age: number;
    university: string;
    email: string;
    ideal_date: string;
    bio?: string;
    interests: unknown;
    personality_profile?: string | PersonalityTraits;
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

const MATCH_DAY = 5; // 周五
const MATCH_HOUR = 18;
const MATCH_MINUTE = 0;
const DISPLAY_DAYS = 5; // 匹配结果展示 5 天

function getNextMatchTime(now: Date = new Date()): number {
  // 计算本周三的时间
  const thisWednesday = new Date(now);
  const daysSinceWednesday = (now.getDay() - MATCH_DAY + 7) % 7;
  thisWednesday.setDate(now.getDate() - daysSinceWednesday);
  thisWednesday.setHours(MATCH_HOUR, MATCH_MINUTE, 0, 0);
  
  // 计算下周三的时间
  const nextWednesday = new Date(thisWednesday);
  nextWednesday.setDate(nextWednesday.getDate() + 7);
  
  // 匹配时间 = 本周三 18:00
  const matchTime = thisWednesday.getTime();
  
  // 展示结束时间 = 匹配时间 + 5 天
  const displayEndTime = matchTime + (DISPLAY_DAYS * 24 * 60 * 60 * 1000);
  
  // 如果当前时间还没到本周三匹配时间，返回本周三
  if (now.getTime() < matchTime) {
    return thisWednesday.getTime();
  }
  
  // 如果当前时间已经超过展示期，返回下周三
  if (now.getTime() >= displayEndTime) {
    return nextWednesday.getTime();
  }
  
  // 如果当前时间在展示期内，仍然返回下周三（因为这是下一轮匹配）
  return nextWednesday.getTime();
}

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
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedMatchUser, setSelectedMatchUser] = useState<MatchItem["user"] | null>(null);
  const [checkingEmailAccess, setCheckingEmailAccess] = useState(false);
  const [emailUnlocked, setEmailUnlocked] = useState(false);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [showEditBio, setShowEditBio] = useState(false);
  const [newBio, setNewBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);

  // 强制使用前端统一计算的时间，保证和首页完全一致
  const targetTime = useMemo(() => getNextMatchTime(), []);
  
  // 实时感知时间流逝的定时器
  const [now, setNow] = useState(new Date().getTime());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date().getTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // 强制返回 true，直接显示匹配结果
  const isMatchReady = useMemo(() => {
    return true;
  }, []);

  // 核心：如果时间没到，activeMatch 永远是 null，无论 matches 里有什么数据
  const activeMatch = useMemo(() => {
    // 增加一个 loading 状态判断，确保数据真正加载回来前，不会提前渲染卡片
    if ( loadingMatches) return null;
    return matches[activeCardIndex] ?? null;
  }, [matches, activeCardIndex, loadingMatches]);

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

  // 获取破冰文案
  const iceBreakers = useMemo(() => {
    if (!activeMatch || !currentUser) return [];

    // 解析 personality_profile
    let currentUserProfile;
    try {
      currentUserProfile = typeof currentUser.personality_profile === "string"
        ? JSON.parse(currentUser.personality_profile)
        : currentUser.personality_profile;
    } catch {
      currentUserProfile = null;
    }

    let matchUserProfile;
    try {
      matchUserProfile = typeof activeMatch.user.personality_profile === "string"
        ? JSON.parse(activeMatch.user.personality_profile)
        : activeMatch.user.personality_profile;
    } catch {
      matchUserProfile = null;
    }

    if (!currentUserProfile || !matchUserProfile) {
      console.log("破冰文案：缺少 personality_profile", { currentUserProfile, matchUserProfile });
      return [];
    }

    // 生成多条破冰文案
    const results: string[] = [];
    
    // 1. 性格互补
    if (Math.abs(currentUserProfile.socialStyle - matchUserProfile.socialStyle) > 3) {
      results.push("性格互补，一个负责整活一个负责稳住，要不要试试看？");
    }
    
    // 2. 情感准备度
    if (currentUserProfile.emotionalReadiness >= 7 && matchUserProfile.emotionalReadiness >= 7) {
      results.push("都对感情比较认真，不如先聊聊最近让你感到温暖的一件事？");
    }
    
    // 3. 约会风格
    if (currentUserProfile.dateStyle <= 5 && matchUserProfile.dateStyle <= 5) {
      results.push("都喜欢自然轻松的约会氛围，要不要找个安静的地方，边走边聊？");
    }
    
    // 4. 承诺倾向
    if (currentUserProfile.commitment >= 7 && matchUserProfile.commitment >= 7) {
      results.push("都重视承诺，不如聊聊你对未来理想关系的期待？");
    }
    
    // 5. 沟通能力
    if (currentUserProfile.communication >= 7 && matchUserProfile.communication >= 7) {
      results.push("都善于沟通，不如来场深度对话，交换最近的一首好听的歌？");
    }
    
    // 6. 独立性
    if (currentUserProfile.independence >= 7 && matchUserProfile.independence >= 7) {
      results.push("都比较独立，不如一起制定个'独立但不孤单'计划？");
    }
    
    // 7. 事业心
    if (currentUserProfile.career >= 7 && matchUserProfile.career >= 7) {
      results.push("都比较有事业心，不如聊聊你最近在忙什么项目？");
    }
    
    // 8. 灵活性
    if (currentUserProfile.flexibility >= 7 && matchUserProfile.flexibility >= 7) {
      results.push("都比较灵活，不如来个'说走就走'的小冒险？");
    }
    
    // 9. 慢热型
    if (currentUserProfile.emotionalReadiness <= 4 && matchUserProfile.emotionalReadiness <= 4) {
      results.push("都比较慢热，不如先从朋友做起，慢慢了解？");
    }
    
    // 10. 安静型
    if (currentUserProfile.socialStyle <= 4 && matchUserProfile.socialStyle <= 4) {
      results.push("都比较安静，不如找个安静的地方，来场深度对话？");
    }
    
    // 11. 主动型
    if (currentUserProfile.dateStyle >= 7 && matchUserProfile.dateStyle >= 7) {
      results.push("都喜欢主动制造火花，不如来个'谁先发起邀约'挑战？");
    }
    
    // 兜底
    if (results.length === 0) {
      results.push("匹配度这么高，说明咱们审美很像，先从交换最近的一首好听的歌开始吧？");
    }
    
    return results.slice(0, 5);
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

  const loadMatches = async () => {
    if (!currentUser || checkingAuth || !isAuthenticated) return;
    
    setLoadingMatches(true);
    setError(null);

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

  useEffect(() => {
    if (!currentUser || checkingAuth || !isAuthenticated) return;
    
    // 只要时间到了，就尝试去加载
    
      void loadMatches();
    
  }, [currentUser, isAuthenticated, checkingAuth]);

  const nextCard = () => {
    if (matches.length <= 1) return;
    setActiveCardIndex((prev) => (prev + 1) % matches.length);
  };

  const prevCard = () => {
    if (matches.length <= 1) return;
    setActiveCardIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const reloadUsers = async () => {
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

  const openProfile = async (targetUser: MatchItem["user"]) => {
    setSelectedMatchUser(targetUser);
    setProfileOpen(true);
    setEmailUnlocked(false);

    if (!currentUser) return;

    const controller = new AbortController();
    setCheckingEmailAccess(true);
    try {
      const response = await fetch(
        `/api/chat/messages?userId=${encodeURIComponent(currentUser.id)}&targetUserId=${encodeURIComponent(targetUser.id)}`,
        { cache: "no-store", signal: controller.signal }
      );
      if (!response.ok) throw new Error("fetch failed");
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
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 py-6 font-sans sm:px-8">
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

          <motion.div className="absolute right-6 top-6 z-20 flex items-center gap-3" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEditEmail(true)}
              className="text-gray-600 hover:text-pink-600"
            >
              修改邮箱
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                AuthService.logout();
                router.push("/");
              }}
              className="text-gray-600 hover:text-rose-600"
            >
              退出登录
            </Button>
          </motion.div>

          <div className="relative z-10 mx-auto w-full max-w-4xl space-y-4 pb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${glassCardClass} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-rose-400 text-xl font-bold text-white shadow-md">
                  {currentUser?.name?.slice(0, 1) ?? "U"}
                </div>
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-800">
                    {currentUser?.name ?? "加载中"}
                    <span className="rounded-full bg-white/50 px-2 py-0.5 text-sm font-medium text-gray-500">{currentUser?.age ?? "-"}岁</span>
                    {currentUser?.gender && (
                      <span className="rounded-full bg-white/50 px-2 py-0.5 text-sm font-medium text-gray-500">{currentUser.gender}</span>
                    )}
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{currentUser?.university ?? "未设置学校"}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
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
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowEditBio(true)} className="h-6 text-[10px] text-pink-600 hover:text-pink-700">
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
                <div className="flex items-center gap-2 rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-2">
                  <Mail className="h-4 w-4 text-pink-500" />
                  <span className="flex-1 text-sm text-gray-700">
                    {maskEmail(currentUser?.email ?? null)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">•</span> 邮箱仅用于登录验证，保护您的隐私
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
                  <p className="text-xs text-gray-500">{radarOn ? "" : "重新打开雷达，继续查看新的匹配结果。"}</p>
                </div>
              </div>

              <button type="button" aria-label="toggle matching" onClick={() => { setRadarOn((prev) => !prev); setActiveCardIndex(0); }} className={`flex h-8 w-14 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ${radarOn ? "bg-gradient-to-r from-pink-400 to-purple-400 shadow-inner" : "bg-gray-200"}`}>
                <motion.div layout className="h-6 w-6 rounded-full bg-white shadow-sm" animate={{ x: radarOn ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${glassCardClass} min-h-[430px]`}>
              {error ? <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

              <AnimatePresence mode="wait">
                {/* 1. 雷达已关闭 */}
                {!radarOn ? (
                  <motion.div key="paused" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex min-h-[320px] flex-col items-center justify-center py-10 text-center opacity-70">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"><User className="h-8 w-8 text-gray-400" /></div>
                    <h3 className="mb-2 text-lg font-bold text-gray-600">雷达已关闭</h3>
                    <p className="max-w-xs text-sm text-gray-400">打开上方雷达开关，就能继续查看你当前的五个匹配位。</p>
                  </motion.div>
                ) : loadingUsers || loadingMatches ? (
                  /* 2. 正在加载数据 */
                  <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative flex min-h-[320px] flex-col items-center justify-center py-10">
                    <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
                      <Radar className="h-16 w-16 animate-spin-slow text-pink-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-800">正在计算匹配结果...</h3>
                  </motion.div>
                ) : !isMatchReady ? (
                  /* 3. 时间未到 - 强制拦截 */
                  <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[400px] flex-col items-center justify-center py-10 text-center">
                    <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
                      <Radar className="h-16 w-16 animate-pulse text-pink-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-800">正在为你寻找最佳匹配</h3>
                    <p className="text-sm text-gray-500">系统每周运行匹配算法，发现契合对象后将通知你。</p>
                  </motion.div>
                ) : !activeMatch ? (
                  /* 4. 时间到了但没结果 */
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[320px] flex-col items-center justify-center py-10 text-center">
                    <User className="mb-3 h-10 w-10 text-gray-300" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-600">暂时没有匹配对象</h3>
                    <p className="text-sm text-gray-500">换一个用户试试，或者点击重新匹配。</p>
                  </motion.div>
                ) : (
                  /* 5. 时间到了且有数据，渲染卡片 */
                  <motion.div key={`result-${activeMatch.user.id}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex flex-col">
                        <motion.div
                          drag={matches.length > 1 ? "x" : false}
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.25}
                          onDragEnd={(_, info) => {
                            const distance = info.offset.x;
                            const speed = info.velocity.x;
                            if (Math.abs(distance) < 70 && Math.abs(speed) < 500) return;
                            if (distance < 0 || speed < 0) nextCard();
                            else prevCard();
                          }}
                          className="rounded-[1.6rem] border border-white/70 bg-white/80 p-5 shadow-[0_12px_40px_rgba(236,72,153,0.12)]"
                        >
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
                        <div className="mb-3 flex items-center gap-1.5 text-sm font-bold text-purple-800"><Sparkles className="h-4 w-4 text-purple-500" />专属破冰建议</div>
                        <div className="space-y-2">
                          {iceBreakers.length > 0 ? (
                            iceBreakers.map((line, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-purple-700 leading-relaxed">
                                <span className="mt-0.5 flex h-1.5 w-1.5 shrink-0 items-center justify-center rounded-full bg-purple-400" />
                                <span>{line}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-purple-700 leading-relaxed">
                              匹配度这么高，说明咱们审美很像，先从交换最近的一首好听的歌开始吧？
                            </div>
                          )}
                        </div>
                      </div>

                      {activeMatch.user.bio ? (
                        <div className="mb-6 rounded-xl border border-pink-100 bg-pink-50/50 p-4">
                          <div className="mb-1 text-xs font-bold text-pink-700">自我介绍</div>
                          <div className="text-xs text-pink-600 leading-relaxed">{activeMatch.user.bio}</div>
                        </div>
                      ) : (
                        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                          <div className="mb-1 text-xs font-bold text-gray-600">自我介绍</div>
                          <div className="text-xs text-gray-500 italic">该用户暂未填写自我介绍</div>
                        </div>
                      )}

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
                    <div className="mt-2 break-all text-sm text-gray-600">
                      {checkingEmailAccess ? (
                        "正在检查解锁条件..."
                      ) : emailUnlocked ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">•</span> {maskEmail(selectedMatchUser.email)}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500">•</span> 双方都发送过消息后，这里才会显示邮箱
                          <span className="text-xs text-gray-400">邮箱仅用于登录验证，保护您的隐私</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                    <Button variant="outline" onClick={() => setProfileOpen(false)} className="h-11 rounded-xl">关闭</Button>
                    <Button onClick={() => startChat(selectedMatchUser.id)} className="h-11 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"><MessageCircle className="mr-2 h-4 w-4" />直接发起消息</Button>
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>

          <Dialog open={showEditBio} onOpenChange={(open) => {
            setShowEditBio(open);
            if (!open) {
              setNewBio("");
            }
          }}>
            <DialogContent className="border-white/70 bg-white/95 p-0 shadow-2xl sm:max-w-md">
              <DialogHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5 text-left">
                <DialogTitle className="text-2xl font-extrabold text-gray-900">编辑自我介绍</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">简单介绍一下自己。</DialogDescription>
              </DialogHeader>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">自我介绍</label>
                    <textarea
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      placeholder="例如：喜欢咖啡、阅读和周末散步..."
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 resize-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <Button type="button" variant="ghost" onClick={() => setShowEditBio(false)} className="text-gray-600">取消</Button>
                <Button
                  type="button"
                  onClick={async () => {
                    if (!currentUser) return;
                    
                    setEditingBio(true);
                    try {
                      const res = await fetch("/api/update-bio", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: currentUser.id,
                          newBio: newBio.trim(),
                        }),
                      });
                      
                      if (res.ok) {
                        await reloadUsers();
                        setShowEditBio(false);
                        setNewBio("");
                      } else {
                        alert("修改失败，请稍后重试");
                      }
                    } catch (error) {
                      console.error("Failed to update bio:", error);
                      alert("修改失败，请稍后重试");
                    } finally {
                      setEditingBio(false);
                    }
                  }}
                  disabled={editingBio}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                >
                  {editingBio ? "保存中..." : "保存修改"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showEditEmail} onOpenChange={(open) => {
            setShowEditEmail(open);
            if (!open) {
              setNewEmail("");
            }
          }}>
            <DialogContent className="border-white/70 bg-white/95 p-0 shadow-2xl sm:max-w-md">
              <DialogHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5 text-left">
                <DialogTitle className="text-2xl font-extrabold text-gray-900">修改邮箱</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">修改邮箱后将同步到数据库。</DialogDescription>
              </DialogHeader>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">当前邮箱</label>
                    <div className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-gray-600">
                      {currentUser?.email ?? "未设置"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">新邮箱</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="请输入新邮箱"
                      className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <Button type="button" variant="ghost" onClick={() => setShowEditEmail(false)} className="text-gray-600">取消</Button>
                <Button
                  type="button"
                  onClick={async () => {
                    if (!newEmail.trim()) return;
                    if (!currentUser) return;
                    
                    setEditingEmail(true);
                    try {
                      const res = await fetch("/api/update-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: currentUser.id,
                          newEmail: newEmail.trim().toLowerCase(),
                        }),
                      });
                      
                      if (res.ok) {
                        localStorage.setItem("datematch_auth_identity", `email:${newEmail.trim().toLowerCase()}`);
                        await reloadUsers();
                        setShowEditEmail(false);
                        setNewEmail("");
                      } else {
                        alert("修改失败，请稍后重试");
                      }
                    } catch (error) {
                      console.error("Failed to update email:", error);
                      alert("修改失败，请稍后重试");
                    } finally {
                      setEditingEmail(false);
                    }
                  }}
                  disabled={editingEmail || !newEmail.trim()}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                >
                  {editingEmail ? "保存中..." : "保存修改"}
                </Button>
              </div>
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
