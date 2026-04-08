"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles } from "lucide-react";
import { getProfileChoiceOptions } from "@/app/data/profileChoiceOptions";
import { IdealPreferenceEditor } from "@/components/profile/IdealPreferenceEditor";
import { InterestTagEditor, mergeInterestInputs } from "@/components/profile/InterestTagEditor";
import { ProfileChoiceGrid } from "@/components/profile/ProfileChoiceGrid";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const GENDER_OPTIONS = getProfileChoiceOptions("romance", "gender");
const SEEKING_OPTIONS = getProfileChoiceOptions("romance", "seeking");

export default function FindMatchPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    seeking: "",
    university: "",
    email: "",
    interestsText: "",
    idealDate: "",
    personalityProfile: JSON.stringify({
      approachPace: 6.8,
      reassuranceNeed: 7.2,
      boundaryAutonomy: 6.1,
      emotionalExpression: 7.4,
      conflictEngagement: 6.9,
      futureOrientation: 7.8,
      jealousyRegulation: 6.2,
      stabilityPreference: 8.1,
    }),
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedIdealTags, setSelectedIdealTags] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mergedInterests = useMemo(
    () => mergeInterestInputs(selectedInterests, formData.interestsText),
    [formData.interestsText, selectedInterests],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const age = parseInt(formData.age, 10);
    if (Number.isNaN(age) || age < 18) {
      setError("你的年龄需满 18 岁。");
      return;
    }

    if (!formData.gender || !formData.seeking) {
      setError("请先选择你的性别和想认识的对象。");
      return;
    }

    if (mergedInterests.length === 0) {
      setError("请至少选择或填写 1 个兴趣爱好。");
      return;
    }

    if (selectedIdealTags.length === 0 && !formData.idealDate.trim()) {
      setError("请至少选择 1 个理想约会标签，或补充一段描述。");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/submit-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "romance",
          name: formData.name,
          age,
          gender: formData.gender,
          seeking: formData.seeking,
          university: formData.university,
          email: formData.email,
          interests: mergedInterests.join(", "),
          idealDate: formData.idealDate,
          idealDateTags: selectedIdealTags,
          personalityProfile: JSON.parse(formData.personalityProfile),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "提交失败，请稍后重试。");
      }

      localStorage.setItem("datematch_auth_identity", `email:romance:${formData.email.trim().toLowerCase()}`);
      setShowConfirmation(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_28%),linear-gradient(180deg,#fff7fb_0%,#fff_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-bold text-pink-600">
              <Heart className="h-3.5 w-3.5" /> 恋爱档案
            </div>
            <h1 className="mt-3 text-3xl font-black text-gray-900">先建立你的恋爱档案</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              选择更贴近你的兴趣和约会偏好，让彼此在见面前先多一点了解。
            </p>
          </div>
          <Link href="/" className="text-sm font-medium text-gray-500 transition hover:text-gray-700">
            返回首页
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(236,72,153,0.12)] backdrop-blur sm:p-8">
          <div className="grid gap-6">
            {error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">昵称</label>
                <Input value={formData.name} onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))} placeholder="怎么称呼你" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">年龄</label>
                <Input value={formData.age} onChange={(event) => setFormData((prev) => ({ ...prev, age: event.target.value }))} inputMode="numeric" placeholder="18" />
              </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">你的性别</label>
                <ProfileChoiceGrid mode="romance" options={GENDER_OPTIONS} value={formData.gender} onChange={(gender) => setFormData((prev) => ({ ...prev, gender }))} />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">想认识的对象</label>
                <ProfileChoiceGrid mode="romance" options={SEEKING_OPTIONS} value={formData.seeking} onChange={(seeking) => setFormData((prev) => ({ ...prev, seeking }))} />
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">学校</label>
                <Input value={formData.university} onChange={(event) => setFormData((prev) => ({ ...prev, university: event.target.value }))} placeholder="你的学校 / 校区" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">邮箱</label>
                <Input type="email" value={formData.email} onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))} placeholder="用于登录和找回" />
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-500" />
                <h2 className="text-lg font-bold text-gray-900">兴趣爱好</h2>
              </div>
              <InterestTagEditor
                mode="romance"
                selectedTags={selectedInterests}
                onSelectedTagsChange={setSelectedInterests}
                description={formData.interestsText}
                onDescriptionChange={(interestsText) => setFormData((prev) => ({ ...prev, interestsText }))}
              />
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <h2 className="text-lg font-bold text-gray-900">理想约会</h2>
              </div>
              <IdealPreferenceEditor
                mode="romance"
                selectedTags={selectedIdealTags}
                onSelectedTagsChange={setSelectedIdealTags}
                description={formData.idealDate}
                onDescriptionChange={(idealDate) => setFormData((prev) => ({ ...prev, idealDate }))}
              />
            </section>

            <Button type="submit" disabled={submitting} className="h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-base font-bold text-white shadow-lg shadow-pink-500/20 hover:from-pink-600 hover:to-purple-700">
              {submitting ? "正在保存档案..." : "提交恋爱档案"}
            </Button>
            {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
            {submitting ? (
              <p className="text-sm text-gray-500" aria-live="polite">
                正在提交你的恋爱档案，保存完成后会自动弹出确认窗口。
              </p>
            ) : null}
          </div>
        </form>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="border-none bg-white/95 backdrop-blur-xl sm:rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-extrabold text-gray-900">恋爱档案已提交</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 px-2 py-4 text-center">
            <p className="text-base leading-relaxed text-gray-600">
              你的兴趣标签、理想约会标签和补充描述都已经保存。
              <br />
              接下来可以登录查看匹配结果，也可以稍后再回来。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setShowConfirmation(false)}>
                继续查看
              </Button>
              <Button type="button" className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700" onClick={() => router.push("/login?redirect=%2Fdev-channel-2&mode=romance")}>
                去登录
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
