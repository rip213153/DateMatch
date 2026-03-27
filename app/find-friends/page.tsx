"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Users } from "lucide-react";
import { getProfileChoiceOptions } from "@/app/data/profileChoiceOptions";
import { IdealPreferenceEditor } from "@/components/profile/IdealPreferenceEditor";
import { InterestTagEditor, mergeInterestInputs } from "@/components/profile/InterestTagEditor";
import { ProfileChoiceGrid } from "@/components/profile/ProfileChoiceGrid";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const GENDER_OPTIONS = getProfileChoiceOptions("friendship", "gender");
const SEEKING_OPTIONS = getProfileChoiceOptions("friendship", "seeking");

export default function FindFriendsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    seeking: "",
    university: "",
    email: "",
    interestsText: "",
    idealHangout: "",
    personalityProfile: JSON.stringify({
      socialEnergy: 7.2,
      maintenance: 6.5,
      boundaries: 7.8,
      spontaneity: 6.9,
      empathy: 7.6,
      reliability: 8.2,
      depth: 7.4,
      openness: 6.8,
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
      setError("请先选择你的性别和想认识的搭子。");
      return;
    }

    if (mergedInterests.length === 0) {
      setError("请至少选择或填写 1 个兴趣爱好。");
      return;
    }

    if (selectedIdealTags.length === 0 && !formData.idealHangout.trim()) {
      setError("请至少选择 1 个理想相处标签，或补充一段描述。");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/submit-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "friendship",
          name: formData.name,
          age,
          gender: formData.gender,
          seeking: formData.seeking,
          university: formData.university,
          email: formData.email,
          interests: mergedInterests.join(", "),
          idealHangout: formData.idealHangout,
          idealHangoutTags: selectedIdealTags,
          personalityProfile: JSON.parse(formData.personalityProfile),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "提交失败，请稍后重试。");
      }

      localStorage.setItem("datematch_auth_identity", `email:friendship:${formData.email.trim().toLowerCase()}`);
      setShowConfirmation(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,#f7fdff_0%,#fff_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
              <Users className="h-3.5 w-3.5" /> 搭子档案
            </div>
            <h1 className="mt-3 text-3xl font-black text-gray-900">先建立你的搭子档案</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              选择更贴近你的兴趣和相处偏好，让彼此在认识前先找到合拍的感觉。
            </p>
          </div>
          <Link href="/" className="text-sm font-medium text-gray-500 transition hover:text-gray-700">
            返回首页
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(14,165,233,0.12)] backdrop-blur sm:p-8">
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
                <ProfileChoiceGrid mode="friendship" options={GENDER_OPTIONS} value={formData.gender} onChange={(gender) => setFormData((prev) => ({ ...prev, gender }))} />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">想认识的搭子</label>
                <ProfileChoiceGrid mode="friendship" options={SEEKING_OPTIONS} value={formData.seeking} onChange={(seeking) => setFormData((prev) => ({ ...prev, seeking }))} />
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
                <Sparkles className="h-4 w-4 text-sky-500" />
                <h2 className="text-lg font-bold text-gray-900">兴趣爱好</h2>
              </div>
              <InterestTagEditor
                mode="friendship"
                selectedTags={selectedInterests}
                onSelectedTagsChange={setSelectedInterests}
                description={formData.interestsText}
                onDescriptionChange={(interestsText) => setFormData((prev) => ({ ...prev, interestsText }))}
              />
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                <h2 className="text-lg font-bold text-gray-900">理想相处方式</h2>
              </div>
              <IdealPreferenceEditor
                mode="friendship"
                selectedTags={selectedIdealTags}
                onSelectedTagsChange={setSelectedIdealTags}
                description={formData.idealHangout}
                onDescriptionChange={(idealHangout) => setFormData((prev) => ({ ...prev, idealHangout }))}
              />
            </section>

            <Button type="submit" disabled={submitting} className="h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-base font-bold text-white shadow-lg shadow-sky-500/20 hover:from-sky-600 hover:to-cyan-600">
              {submitting ? "提交中..." : "提交搭子档案"}
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="border-none bg-white/95 backdrop-blur-xl sm:rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-extrabold text-gray-900">搭子档案已提交</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 px-2 py-4 text-center">
            <p className="text-base leading-relaxed text-gray-600">
              你的兴趣标签、理想相处标签和补充描述都已经保存。
              <br />
              接下来可以登录查看匹配结果，也可以稍后再回来。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setShowConfirmation(false)}>
                继续查看
              </Button>
              <Button type="button" className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600" onClick={() => router.push("/login?redirect=%2Fdev-channel-2%3Fmode%3Dfriendship&mode=friendship")}>
                去登录
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
