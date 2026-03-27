"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Radar } from "lucide-react";
import { BackgroundEffects } from "@/components/match/BackgroundEffects";
import { MatchStagePanel } from "@/components/match/MatchStagePanel";
import { ProfileOverviewCard } from "@/components/match/ProfileOverviewCard";
import { UserHeader } from "@/components/match/UserHeader";
import { ProfileDialog } from "@/components/match/ProfileDialog";
import { EditDialogs } from "@/components/match/EditDialogs";
import { generateIceBreakers, getHighlights } from "@/lib/match-helpers";
import { AuthService } from "@/lib/auth";
import type { AuthMode } from "@/lib/auth";
import { useDevChannelUsers } from "@/lib/use-dev-channel-users";
import { useMatchConfirmations } from "@/lib/use-match-confirmations";
import { useMatchData } from "@/lib/use-match-data";
import type { MatchItem, UserSummary } from "@/components/match/types";

function maskEmail(email: string | null): string {
  if (!email) return "";

  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return email;

  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex);

  if (localPart.length <= 2) {
    return email;
  }

  const maskedLocal =
    localPart.substring(0, 2) +
    "*".repeat(Math.min(localPart.length - 2, 4)) +
    localPart.substring(localPart.length - 1);

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

const FALLBACK_CURRENT_USER: UserSummary = {
  id: 0,
  name: "加载中",
  age: 0,
  university: "",
};

const FALLBACK_MATCH: MatchItem = {
  user: {
    id: 0,
    name: "",
    age: 0,
    university: "",
    email: "",
    ideal_date: "",
    interests: null,
  },
  match: {
    overallScore: 0,
    breakdown: {
      personality: 0,
      interests: 0,
      background: 0,
      complementary: 0,
    },
    matches: [],
    recommendations: [],
  },
};

export default function DevChannel2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode: AuthMode = searchParams.get("mode") === "friendship" ? "friendship" : "romance";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedMatchUser, setSelectedMatchUser] = useState<UserSummary | null>(null);
  const [radarOn, setRadarOn] = useState(true);
  const [updatingRadar, setUpdatingRadar] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [storedUserId, setStoredUserId] = useState<number | null>(null);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showEditBio, setShowEditBio] = useState(false);
  const [showEditName, setShowEditName] = useState(false);

  const { currentUser, loadingUsers, error, setError, reloadUsers } = useDevChannelUsers({
    mode,
    checkingAuth,
    isAuthenticated,
  });

  const effectiveUserId = currentUser?.id ?? storedUserId;
  const { matches, availability, loading, error: matchError, refresh } = useMatchData(effectiveUserId, isAuthenticated, mode);

  const { loadingConfirmations, updatingConfirmationUserId, getConfirmationStatus, toggleConfirmation } =
    useMatchConfirmations({
      currentUser,
      matches,
      mode,
      isInDisplayWindow: availability.isInDisplayWindow,
      setError,
    });

  const checkAuthentication = useCallback(async () => {
    const result = await AuthService.checkAuth();
    setIsAuthenticated(result.isAuthenticated);
    setCheckingAuth(false);

    if (!result.isAuthenticated) {
      const redirect = mode === "friendship" ? "/dev-channel-2?mode=friendship" : "/dev-channel-2";
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}&mode=${mode}`);
      return;
    }

    setStoredUserId(AuthService.getStoredUserId(mode));
  }, [mode, router]);

  useEffect(() => {
    void checkAuthentication();
  }, [checkAuthentication]);

  useEffect(() => {
    setRadarOn(!availability.isOptedOutForRound);
  }, [availability.isOptedOutForRound, currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      setStoredUserId(currentUser.id);
    }
  }, [currentUser?.id]);

  const openProfile = (targetUser: UserSummary) => {
    setSelectedMatchUser(targetUser);
    setProfileOpen(true);
  };

  const startChat = (targetUserId: number) => {
    if (!currentUser) return;
    router.push(`/chat?userId=${currentUser.id}&targetUserId=${targetUserId}&mode=${mode}`);
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

  const activeMatch = matches[activeCardIndex] ?? null;
  const activeMatchUserId = activeMatch?.user.id ?? null;
  const iceBreakers = generateIceBreakers(currentUser ?? FALLBACK_CURRENT_USER, activeMatch ?? FALLBACK_MATCH);
  const highlights = getHighlights(currentUser ?? FALLBACK_CURRENT_USER, activeMatch ?? FALLBACK_MATCH);
  const activeConfirmationStatus =
    activeMatchUserId !== null ? getConfirmationStatus(activeMatchUserId) : null;
  const activeConfirmationUpdating =
    loadingConfirmations || (activeMatchUserId !== null && updatingConfirmationUserId === activeMatchUserId);

  useEffect(() => {
    if (!currentUser?.id) return;

    router.prefetch(`/profile/edit?userId=${currentUser.id}&mode=${mode}`);

    if (activeMatchUserId !== null) {
      router.prefetch(`/chat?userId=${currentUser.id}&targetUserId=${activeMatchUserId}&mode=${mode}`);
    }
  }, [activeMatchUserId, currentUser?.id, mode, router]);

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
        <ProfileOverviewCard
          currentUser={currentUser}
          mode={mode}
          maskedEmail={currentUser?.email ? maskEmail(currentUser.email) : ""}
          onOpenFullEdit={() => {
            if (currentUser) {
              router.push(`/profile/edit?userId=${currentUser.id}&mode=${mode}`);
            }
          }}
          onEditName={() => setShowEditName(true)}
          onEditBio={() => setShowEditBio(true)}
          onEditEmail={() => setShowEditEmail(true)}
        />

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
          <MatchStagePanel
            radarOn={radarOn}
            loading={loading}
            updatingRadar={updatingRadar}
            availability={availability}
            matchError={matchError}
            activeMatch={activeMatch}
            activeIndex={activeCardIndex}
            totalMatches={matches.length}
            panelError={error}
            confirmationStatus={activeConfirmationStatus}
            confirmationUpdating={activeConfirmationUpdating}
            iceBreakers={iceBreakers}
            highlights={highlights}
            optedOutNextReleaseTime={formatScheduleTime(availability.nextReleaseAt || availability.matchAt)}
            displayWindowScheduleTime={formatScheduleTime(
              availability.nextReleaseAt || availability.eligibleReleaseAt || availability.matchAt
            )}
            onToggleRadar={() => void handleRadarToggle()}
            onNextMatch={() => setActiveCardIndex((prev) => (prev + 1) % matches.length)}
            onPrevMatch={() => setActiveCardIndex((prev) => (prev - 1 + matches.length) % matches.length)}
            onOpenProfile={() => {
              if (activeMatch) {
                openProfile(activeMatch.user);
              }
            }}
            onStartChat={() => {
              if (activeMatch) {
                startChat(activeMatch.user.id);
              }
            }}
            onToggleConfirm={() => {
              if (activeMatch) {
                void toggleConfirmation(activeMatch.user.id);
              }
            }}
          />
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
