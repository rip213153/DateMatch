"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BellRing, CheckCircle2, Loader2, MessageCircleMore, QrCode, Smartphone } from "lucide-react";
import type { QuizMode } from "@/app/data/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function toPositiveInt(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function WeChatConnectContent() {
  const searchParams = useSearchParams();
  const mode = useMemo<QuizMode>(
    () => (searchParams.get("mode") === "friendship" ? "friendship" : "romance"),
    [searchParams]
  );
  const userId = useMemo(() => toPositiveInt(searchParams.get("userId")), [searchParams]);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const [connectUrl, setConnectUrl] = useState<string | null>(null);
  const [followUrl, setFollowUrl] = useState<string | null>(null);
  const [oauthReady, setOauthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [binding, setBinding] = useState(false);
  const [manualOpenId, setManualOpenId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const theme = mode === "friendship"
    ? {
        accent: "from-sky-500 to-cyan-500",
        soft: "bg-sky-50 text-sky-700 border-sky-100",
        text: "text-sky-700",
        button: "bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600",
      }
    : {
        accent: "from-pink-500 to-rose-500",
        soft: "bg-rose-50 text-rose-700 border-rose-100",
        text: "text-rose-700",
        button: "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600",
      };

  useEffect(() => {
    if (code && state) {
      setLoading(false);
      return;
    }

    if (!userId) {
      setError("缺少可绑定的用户信息，请从聊天页重新进入。");
      setLoading(false);
      return;
    }

    let active = true;

    const run = async () => {
      try {
        const response = await fetch(`/api/wechat/connect-url?userId=${userId}&mode=${mode}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!active) return;

        if (!response.ok) {
          setError(data?.error || "获取微信授权信息失败");
          return;
        }

        setConnectUrl(data.connectUrl ?? null);
        setFollowUrl(data.followUrl ?? null);
        setOauthReady(Boolean(data.oauthReady));
      } catch {
        if (active) {
          setError("获取微信授权信息失败，请稍后再试");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [code, mode, state, userId]);

  useEffect(() => {
    if (!code || !state) return;

    let active = true;

    const run = async () => {
      setBinding(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch("/api/wechat/bind", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state, noticeOptIn: true }),
        });
        const data = await response.json();

        if (!active) return;

        if (!response.ok) {
          setError(data?.error || "微信授权绑定失败");
          return;
        }

        setSuccess("公众号提醒已开启，后续有新消息会优先走微信提醒。");
      } catch {
        if (active) {
          setError("微信授权绑定失败，请稍后重试。");
        }
      } finally {
        if (active) {
          setBinding(false);
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [code, state]);

  const handleManualBind = async () => {
    if (!userId || !manualOpenId.trim()) {
      setError("请先填写 openId 再继续。");
      return;
    }

    setBinding(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/wechat/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          mode,
          openId: manualOpenId.trim(),
          noticeOptIn: true,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "绑定失败");
        return;
      }

      setSuccess("测试绑定已完成，后续可以直接处理微信提醒事件。");
      setManualOpenId("");
    } catch {
      setError("绑定失败，请稍后重试。");
    } finally {
      setBinding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_40%,#ffffff_100%)] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <Link href={userId ? `/chat?userId=${userId}&mode=${mode}` : "/"} className={`text-sm font-medium ${theme.text}`}>
            返回聊天
          </Link>
          <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.soft}`}>
            微信提醒接入
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.accent} text-white shadow-lg`}>
            <BellRing className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-gray-900">开启公众号消息提醒</h1>
          <p className="mt-3 text-sm leading-7 text-gray-500">
            页面内我们已经做了底部 Toast 提醒。这里补的是“离开网页后”的提醒能力，让新消息能通过公众号继续触达你。
          </p>

          <div className="mt-6 space-y-3 rounded-3xl bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <MessageCircleMore className="mt-0.5 h-5 w-5 text-gray-400" />
              <p className="text-sm text-gray-600">如果你已经在微信里打开当前页面，推荐直接走公众号授权，一步完成绑定。</p>
            </div>
            <div className="flex items-start gap-3">
              <QrCode className="mt-0.5 h-5 w-5 text-gray-400" />
              <p className="text-sm text-gray-600">如果还没配正式公众号，这页也支持手动填 openId 做开发联调。</p>
            </div>
            <div className="flex items-start gap-3">
              <Smartphone className="mt-0.5 h-5 w-5 text-gray-400" />
              <p className="text-sm text-gray-600">真正处理提醒时，后端会消费待发送事件并投递到微信，不会再耦合聊天主流程。</p>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          {success ? (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{success}</span>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 flex items-center gap-3 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在准备微信连接信息...
            </div>
          ) : code && state ? (
            <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Loader2 className={`h-4 w-4 ${binding ? "animate-spin" : ""}`} />
                {binding ? "正在完成微信授权绑定..." : "微信授权流程已返回。"}
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-white p-5">
                <div className="mb-3 text-sm font-semibold text-gray-800">方式 1：公众号正式授权</div>
                <p className="text-sm leading-7 text-gray-500">
                  适合线上环境。用户关注公众号后，通过微信授权拿到 openId，后续即可由后端直接推送模板消息。
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    disabled={!oauthReady || binding}
                    className={`text-white ${theme.button}`}
                    onClick={() => {
                      if (connectUrl) {
                        window.location.href = connectUrl;
                      }
                    }}
                  >
                    {oauthReady ? "去微信授权" : "尚未配置公众号 OAuth"}
                  </Button>
                  {followUrl ? (
                    <a
                      href={followUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      查看公众号入口
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/80 p-5">
                <div className="mb-3 text-sm font-semibold text-gray-800">方式 2：开发联调手动绑定</div>
                <p className="text-sm leading-7 text-gray-500">
                  如果你还没接好公众号，可以先手动录一个 openId，把整条提醒链路跑通。
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={manualOpenId}
                    onChange={(event) => setManualOpenId(event.target.value)}
                    placeholder="输入用于联调的 openId"
                    className="h-11 rounded-2xl border-gray-200 bg-white"
                  />
                  <Button type="button" disabled={binding} variant="outline" className="h-11 rounded-2xl" onClick={handleManualBind}>
                    {binding ? "绑定中..." : "手动绑定"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WeChatConnectPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-500">加载中...</div>}>
      <WeChatConnectContent />
    </Suspense>
  );
}
