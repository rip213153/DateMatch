"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock3, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type EditableProfile = {
  id: number;
  name: string;
  age: number;
  gender: string;
  seeking: string;
  university: string;
  email: string;
  interests: string[];
  idealDate: string;
  bio: string;
  personalityProfile?: unknown;
};

type SaveResult = {
  changedImmediateFields: string[];
  changedDeferredFields: string[];
  deferredToNextRound: boolean;
  effectiveAt: number | null;
};

function toPositiveInt(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function formatScheduleTime(value: number | null) {
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

function buildEmptyProfile(): EditableProfile {
  return {
    id: 0,
    name: "",
    age: 18,
    gender: "",
    seeking: "",
    university: "",
    email: "",
    interests: [],
    idealDate: "",
    bio: "",
  };
}

export default function EditProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = useMemo(() => toPositiveInt(searchParams.get("userId")), [searchParams]);
  const mode = searchParams.get("mode") === "friendship" ? "friendship" : "romance";

  const [profile, setProfile] = useState<EditableProfile>(buildEmptyProfile());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError("缺少合法的用户信息，请从匹配页进入完整资料编辑。");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/profile?userId=${userId}&mode=${mode}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "加载资料失败");
        }

        const nextProfile = (data?.previewProfile ?? data?.profile) as EditableProfile;
        setProfile(nextProfile);
      })
      .catch((fetchError) => {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "加载资料失败");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [mode, userId]);

  const handleFieldChange = (field: keyof EditableProfile, value: string | string[]) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!userId || saving) return;

    setSaving(true);
    setError(null);
    setSaveResult(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          mode,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          seeking: profile.seeking,
          university: profile.university,
          email: profile.email,
          interests: profile.interests,
          idealDate: profile.idealDate,
          bio: profile.bio,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "保存资料失败");
      }

      localStorage.setItem("datematch_auth_identity", `email:${mode}:${profile.email.trim().toLowerCase()}`);

      setProfile((data?.previewProfile ?? data?.profile) as EditableProfile);
      setSaveResult({
        changedImmediateFields: Array.isArray(data?.changedImmediateFields) ? data.changedImmediateFields : [],
        changedDeferredFields: Array.isArray(data?.changedDeferredFields) ? data.changedDeferredFields : [],
        deferredToNextRound: Boolean(data?.deferredToNextRound),
        effectiveAt: typeof data?.effectiveAt === "number" ? data.effectiveAt : null,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存资料失败");
    } finally {
      setSaving(false);
    }
  };

  const backHref = mode === "friendship" ? "/dev-channel-2?mode=friendship" : "/dev-channel-2";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#fffafc_0%,#fff_100%)] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(backHref)}
          className="mb-4 rounded-full text-gray-600 hover:bg-white/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回匹配页
        </Button>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(236,72,153,0.12)] backdrop-blur sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-bold text-pink-600">
                完整资料编辑
              </div>
              <h1 className="mt-3 text-3xl font-black text-gray-900">更新你的个人资料</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
                昵称、简介、邮箱、兴趣和理想约会会立刻更新；年龄、性别、想找谁、学校等影响匹配的内容，在展示期内会顺延到下一轮生效。
              </p>
            </div>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading || saving}
              className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "保存中..." : "保存资料"}
            </Button>
          </div>

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          {saveResult ? (
            <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <div className="font-semibold text-emerald-800">资料已保存</div>
              <div className="mt-1">
                立即更新字段：{saveResult.changedImmediateFields.length > 0 ? saveResult.changedImmediateFields.join("、") : "无"}
              </div>
              <div className="mt-1">
                下轮生效字段：{saveResult.changedDeferredFields.length > 0 ? saveResult.changedDeferredFields.join("、") : "无"}
              </div>
              {saveResult.deferredToNextRound && saveResult.effectiveAt ? (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700">
                  <Clock3 className="h-3.5 w-3.5" />
                  影响匹配的改动将在 {formatScheduleTime(saveResult.effectiveAt)} 生效
                </div>
              ) : null}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-2xl border border-dashed border-pink-100 bg-pink-50/60 px-4 py-12 text-center text-sm text-gray-500">
              正在加载你的资料...
            </div>
          ) : (
            <div className="grid gap-6">
              <section className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">昵称</label>
                  <input
                    value={profile.name}
                    onChange={(event) => handleFieldChange("name", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">邮箱</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(event) => handleFieldChange("email", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">年龄</label>
                  <input
                    type="number"
                    min={18}
                    value={profile.age}
                    onChange={(event) => handleFieldChange("age", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">学校</label>
                  <input
                    value={profile.university}
                    onChange={(event) => handleFieldChange("university", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">性别</label>
                  <select
                    value={profile.gender}
                    onChange={(event) => handleFieldChange("gender", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                  >
                    <option value="">请选择</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">想找谁</label>
                  <select
                    value={profile.seeking}
                    onChange={(event) => handleFieldChange("seeking", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                  >
                    <option value="">请选择</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                    <option value="都可以">都可以</option>
                    <option value="M">M</option>
                    <option value="F">F</option>
                    <option value="ANY">ANY</option>
                  </select>
                </div>
              </section>

              <section className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">兴趣标签</label>
                <input
                  value={profile.interests.join(", ")}
                  onChange={(event) => handleFieldChange("interests", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
                  placeholder="例如：咖啡、电影、散步、羽毛球"
                  className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                />
              </section>

              <section className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  {mode === "friendship" ? "理想相处方式" : "理想约会"}
                </label>
                <textarea
                  value={profile.idealDate}
                  onChange={(event) => handleFieldChange("idealDate", event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                />
              </section>

              <section className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">自我介绍</label>
                <textarea
                  value={profile.bio}
                  onChange={(event) => handleFieldChange("bio", event.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                />
              </section>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
