"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock3, Save } from "lucide-react";
import { INTEREST_TAG_LIBRARY } from "@/app/data/interestTagLibrary";
import { IdealPreferenceEditor } from "@/components/profile/IdealPreferenceEditor";
import { InterestTagEditor, mergeInterestInputs } from "@/components/profile/InterestTagEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  idealDateTags: string[];
  bio: string;
  personalityProfile?: unknown;
};

type SaveResult = {
  changedImmediateFields: string[];
  changedDeferredFields: string[];
  deferredToNextRound: boolean;
  effectiveAt: number | null;
};

const GENDER_OPTIONS = [
  { value: "male", label: "男生" },
  { value: "female", label: "女生" },
  { value: "non-binary", label: "非二元" },
  { value: "other", label: "其他" },
  { value: "any", label: "都可以" },
];

const KNOWN_INTEREST_TAGS = new Set(INTEREST_TAG_LIBRARY.flatMap((group) => group.tags));

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
    idealDateTags: [],
    bio: "",
  };
}

function splitLoadedInterests(values: string[]) {
  const selectedTags: string[] = [];
  const customTexts: string[] = [];

  for (const item of values) {
    const text = item.trim();
    if (!text) continue;
    if (KNOWN_INTEREST_TAGS.has(text)) {
      if (!selectedTags.includes(text)) selectedTags.push(text);
    } else if (!customTexts.includes(text)) {
      customTexts.push(text);
    }
  }

  return {
    selectedTags,
    customText: customTexts.join("、"),
  };
}

function getFieldLabel(field: string, mode: "romance" | "friendship") {
  const fieldLabels: Record<string, string> = {
    name: "昵称",
    bio: "自我介绍",
    email: "邮箱",
    ideal_date: mode === "friendship" ? "理想相处描述" : "理想约会描述",
    ideal_date_tags: mode === "friendship" ? "理想相处标签" : "理想约会标签",
    interests: "兴趣爱好",
    age: "年龄",
    gender: "性别",
    seeking: mode === "friendship" ? "想认识的搭子" : "想认识的对象",
    university: "学校",
    personality_profile: "性格画像",
  };

  return fieldLabels[field] ?? field;
}

function renderFieldList(fields: string[], mode: "romance" | "friendship") {
  if (fields.length === 0) return "无";
  return fields.map((field) => getFieldLabel(field, mode)).join("、");
}

export default function EditProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = useMemo(() => toPositiveInt(searchParams.get("userId")), [searchParams]);
  const mode = searchParams.get("mode") === "friendship" ? "friendship" : "romance";

  const [profile, setProfile] = useState<EditableProfile>(buildEmptyProfile());
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestsText, setInterestsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);

  const mergedInterests = useMemo(
    () => mergeInterestInputs(selectedInterests, interestsText),
    [interestsText, selectedInterests],
  );

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError("缺少有效 userId，请从匹配页进入编辑。");
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
          throw new Error(data?.error || "加载资料失败，请稍后重试。");
        }

        const nextProfile = (data?.previewProfile ?? data?.profile) as EditableProfile;
        const splitInterests = splitLoadedInterests(Array.isArray(nextProfile.interests) ? nextProfile.interests : []);
        setProfile(nextProfile);
        setSelectedInterests(splitInterests.selectedTags);
        setInterestsText(splitInterests.customText);
      })
      .catch((fetchError) => {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "加载资料失败，请稍后重试。");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [mode, userId]);

  const handleFieldChange = (field: keyof EditableProfile, value: string | string[] | number | unknown) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!userId || saving) return;

    if (mergedInterests.length === 0) {
      setError("请至少选择或填写 1 个兴趣爱好。");
      return;
    }

    if (profile.idealDateTags.length === 0 && !profile.idealDate.trim()) {
      setError(mode === "friendship" ? "请至少选择 1 个理想相处标签，或补充描述。" : "请至少选择 1 个理想约会标签，或补充描述。");
      return;
    }

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
          interests: mergedInterests,
          idealDate: profile.idealDate,
          idealDateTags: profile.idealDateTags,
          bio: profile.bio,
          personalityProfile: profile.personalityProfile,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "保存资料失败，请稍后重试。");
      }

      localStorage.setItem("datematch_auth_identity", `email:${mode}:${profile.email.trim().toLowerCase()}`);

      const nextProfile = (data?.previewProfile ?? data?.profile) as EditableProfile;
      const splitInterests = splitLoadedInterests(Array.isArray(nextProfile.interests) ? nextProfile.interests : []);
      setProfile(nextProfile);
      setSelectedInterests(splitInterests.selectedTags);
      setInterestsText(splitInterests.customText);
      setSaveResult({
        changedImmediateFields: Array.isArray(data?.changedImmediateFields) ? data.changedImmediateFields : [],
        changedDeferredFields: Array.isArray(data?.changedDeferredFields) ? data.changedDeferredFields : [],
        deferredToNextRound: Boolean(data?.deferredToNextRound),
        effectiveAt: typeof data?.effectiveAt === "number" ? data.effectiveAt : null,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存资料失败，请稍后重试。");
    } finally {
      setSaving(false);
    }
  };

  const backHref = mode === "friendship" ? "/dev-channel-2?mode=friendship" : "/dev-channel-2";
  const modeTitle = mode === "friendship" ? "编辑搭子档案" : "编辑恋爱档案";
  const idealLabel = mode === "friendship" ? "理想相处方式" : "理想约会";

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
                编辑资料
              </div>
              <h1 className="mt-3 text-3xl font-black text-gray-900">{modeTitle}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
                兴趣爱好和“{idealLabel}”都已改成分类标签编辑，保存后会按即时生效和下一轮生效分别提示。
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
              <div className="font-semibold text-emerald-800">保存成功</div>
              <div className="mt-1">立即生效：{renderFieldList(saveResult.changedImmediateFields, mode)}</div>
              <div className="mt-1">下一轮生效：{renderFieldList(saveResult.changedDeferredFields, mode)}</div>
              {saveResult.deferredToNextRound && saveResult.effectiveAt ? (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700">
                  <Clock3 className="h-3.5 w-3.5" />
                  下一轮生效时间：{formatScheduleTime(saveResult.effectiveAt)}
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
                  <Input value={profile.name} onChange={(event) => handleFieldChange("name", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">年龄</label>
                  <Input inputMode="numeric" value={String(profile.age)} onChange={(event) => handleFieldChange("age", Number(event.target.value || 0))} />
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">性别</label>
                  <select
                    value={profile.gender}
                    onChange={(event) => handleFieldChange("gender", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-500/10"
                  >
                    <option value="">请选择</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">{mode === "friendship" ? "想认识的搭子" : "想认识的对象"}</label>
                  <select
                    value={profile.seeking}
                    onChange={(event) => handleFieldChange("seeking", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-500/10"
                  >
                    <option value="">请选择</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">学校</label>
                  <Input value={profile.university} onChange={(event) => handleFieldChange("university", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">邮箱</label>
                  <Input type="email" value={profile.email} onChange={(event) => handleFieldChange("email", event.target.value)} />
                </div>
              </section>

              <section>
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-gray-900">兴趣爱好</h2>
                  <p className="mt-1 text-sm text-gray-500">从不同兴趣分类里挑选更贴近你的标签，也可以补充自己的兴趣。</p>
                </div>
                <InterestTagEditor
                  mode={mode}
                  selectedTags={selectedInterests}
                  onSelectedTagsChange={setSelectedInterests}
                  description={interestsText}
                  onDescriptionChange={setInterestsText}
                />
              </section>

              <section>
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-gray-900">{idealLabel}</h2>
                  <p className="mt-1 text-sm text-gray-500">现在和兴趣爱好一样，支持分类切换、换一批和清空已选标签。</p>
                </div>
                <IdealPreferenceEditor
                  mode={mode}
                  selectedTags={profile.idealDateTags}
                  onSelectedTagsChange={(idealDateTags) => handleFieldChange("idealDateTags", idealDateTags)}
                  description={profile.idealDate}
                  onDescriptionChange={(idealDate) => handleFieldChange("idealDate", idealDate)}
                />
              </section>

              <section className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">自我介绍</label>
                <Textarea
                  value={profile.bio}
                  onChange={(event) => handleFieldChange("bio", event.target.value)}
                  className="min-h-[120px] rounded-2xl border-transparent bg-[#f8f9fa] focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10"
                  placeholder="介绍一下你的性格、最近的生活状态，或者你希望别人先认识到的部分。"
                />
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

