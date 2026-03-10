"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, MailWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/auth";

type Status = "verifying" | "success" | "error";

function normalizeRedirect(value: string | null) {
  if (!value || !value.startsWith("/")) return "/results";
  return value;
}

export default function EmailLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("正在验证邮箱...");

  const token = searchParams.get("token")?.trim() ?? "";
  const redirectTo = useMemo(() => normalizeRedirect(searchParams.get("redirect")), [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!token) {
        if (!cancelled) {
          setStatus("error");
          setMessage("缺少验证参数，请从邮箱中的按钮重新进入");
        }
        return;
      }

      const res = await fetch("/api/auth/email-login/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success || !data?.email) {
        if (!cancelled) {
          setStatus("error");
          setMessage(data?.error || "验证链接无效或已过期");
        }
        return;
      }

      await AuthService.loginWithEmail(String(data.email));

      if (!cancelled) {
        setStatus("success");
        setMessage("验证成功，正在无感登录...");
        window.setTimeout(() => {
          router.replace(redirectTo);
        }, 500);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, token, redirectTo]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <h1 className="mb-3 text-2xl font-bold text-gray-900">邮箱验证登录</h1>
        <p className="mb-6 text-sm text-gray-600">无需输入验证码，点击邮件按钮即可直接登录。</p>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 text-center">
          {status === "verifying" ? <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-pink-600" /> : null}
          {status === "success" ? <CheckCircle2 className="mx-auto mb-3 h-6 w-6 text-green-600" /> : null}
          {status === "error" ? <MailWarning className="mx-auto mb-3 h-6 w-6 text-rose-600" /> : null}
          <p className="text-sm text-gray-700">{message}</p>
        </div>

        {status === "error" ? (
          <div className="mt-5 space-y-2">
            <Button asChild className="h-11 w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              <Link href="/login">返回登录页</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full rounded-xl border-pink-200 text-pink-600">
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
