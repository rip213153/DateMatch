"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/lib/auth";

function normalizeRedirect(value: string | null) {
  if (!value || !value.startsWith("/")) return "/results";
  return value;
}

function applyModeToRedirect(redirect: string, mode: "romance" | "friendship") {
  const [pathname, query = ""] = redirect.split("?");
  const params = new URLSearchParams(query);

  if (mode === "friendship") {
    params.set("mode", "friendship");
  } else {
    params.delete("mode");
  }

  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(() => normalizeRedirect(searchParams.get("redirect")), [searchParams]);
  const loginMode = useMemo(
    () => (searchParams.get("mode") === "friendship" || redirectTo.includes("mode=friendship") ? "friendship" : "romance"),
    [redirectTo, searchParams]
  );

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const targets = new Set<string>(["/", redirectTo, applyModeToRedirect(redirectTo, loginMode)]);
    targets.forEach((target) => {
      router.prefetch(target);
    });
  }, [loginMode, redirectTo, router]);

  const handleLogin = async () => {
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/email-login/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, mode: loginMode }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        setError(data?.error || "验证失败，请稍后重试");
        setSubmitting(false);
        return;
      }

      const resolvedMode = String(data?.mode || loginMode) === "friendship" ? "friendship" : "romance";
      const resolvedUserId = Number(data?.userId);
      const nextRedirect = applyModeToRedirect(redirectTo, resolvedMode);

      await AuthService.loginWithEmail(
        String(data?.email || email),
        resolvedMode,
        Number.isInteger(resolvedUserId) && resolvedUserId > 0 ? resolvedUserId : undefined
      );

      router.prefetch(nextRedirect);
      router.replace(nextRedirect);
    } catch (err) {
      console.error("Login error:", err);
      setError("网络错误，请重试");
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="rounded-xl border border-pink-100 bg-white p-2 shadow-sm">
            <Heart className="h-5 w-5 text-pink-500" fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-gray-900">邮箱登录</span>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          输入你提交资料时填写的邮箱，系统会自动匹配对应档案并直接登录。
        </p>

        <label className="mb-2 block text-sm font-medium text-gray-700">邮箱</label>
        <Input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          placeholder="name@example.com"
          className="h-11"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleLogin();
            }
          }}
        />

        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}

        <div className="mt-5 space-y-3">
          <Button
            type="button"
            disabled={submitting}
            onClick={handleLogin}
            className="h-12 w-full rounded-full bg-[#8d1f5f] text-base font-bold text-white hover:bg-[#7a1b52]"
          >
            <MailCheck className="h-4 w-4" />
            {submitting ? "验证中..." : "验证并登录"}
          </Button>

          <Button asChild type="button" variant="ghost" className="h-10 w-full text-gray-600">
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
