"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type FeedbackSource = "home" | "results" | "find-matches" | "unknown";

const SOURCE_LABEL: Record<FeedbackSource, string> = {
  home: "首页",
  results: "测评结果页",
  "find-matches": "匹配结果页",
  unknown: "未知入口",
};

function normalizeSource(value: string | null): FeedbackSource {
  if (value === "home" || value === "results" || value === "find-matches") {
    return value;
  }
  return "unknown";
}

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const source = useMemo<FeedbackSource>(() => normalizeSource(searchParams.get("from")), [searchParams]);

  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const cleanContent = content.trim();
    if (!cleanContent || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source,
          nickname: nickname.trim() || "匿名",
          content: cleanContent,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "反馈发送失败，请稍后重试");
        return;
      }

      setSubmitted(true);
      setContent("");
      setNickname("");
    } catch (submitError) {
      console.error("submit feedback failed", submitError);
      setError("反馈发送失败，请检查网络后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-pink-100 p-2 text-pink-600">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">反馈</h1>
            <p className="text-sm text-gray-600">
              当前来自：
              <span className="font-semibold text-pink-600">{SOURCE_LABEL[source]}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">称呼（选填）</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例如：张三"
              className="h-11 w-full rounded-xl border border-pink-100 bg-white px-3 text-gray-900 outline-none transition focus:border-pink-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">反馈内容</span>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (submitted) setSubmitted(false);
                if (error) setError(null);
              }}
              placeholder="例如：匹配卡片展示很好，希望增加在线时间权重"
              className="min-h-[140px] w-full rounded-xl border border-pink-100 bg-white p-3 text-gray-900 outline-none transition focus:border-pink-400"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="h-11 flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
            >
              <Send className="h-4 w-4" />
              {submitting ? "发送中..." : "提交反馈"}
            </Button>
            <Button asChild type="button" variant="outline" className="h-11 rounded-xl border-pink-200 text-pink-600">
              <Link href="/">返回首页</Link>
            </Button>
          </div>

          {submitted ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              已提交，反馈会发送到 2151220641@qq.com。
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
          <Heart className="h-3.5 w-3.5 text-pink-500" fill="currentColor" />
          <span>你的反馈会用于继续优化匹配算法和页面体验。</span>
        </div>
      </div>
    </main>
  );
}
