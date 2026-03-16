"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Heart, RefreshCcw, Sparkles, Users } from "lucide-react";
import { INTEREST_TAG_LIBRARY, type InterestTagCategoryId } from "@/app/data/interestTagLibrary";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const INTEREST_BATCH_SIZE = 12;
const DEFAULT_CATEGORY = INTEREST_TAG_LIBRARY[0] ?? null;
const CHOICE_OPTIONS = [
  { value: "male", label: "男" },
  { value: "female", label: "女" },
  { value: "any", label: "都可以" },
];

function rotateList<T>(items: T[], offset: number) {
  if (items.length === 0) return [];
  const normalizedOffset = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(normalizedOffset), ...items.slice(0, normalizedOffset)];
}

function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (nextValue: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative flex items-center justify-center rounded-2xl border-2 px-4 py-4 text-sm font-semibold transition-all duration-300 active:scale-[0.97] ${
              isActive
                ? "border-sky-300 bg-sky-50 text-sky-700 shadow-[0_0_15px_rgba(14,165,233,0.12)]"
                : "border-transparent bg-[#f8fafc] text-gray-500 hover:bg-sky-50/60 hover:text-sky-600"
            }`}
          >
            {isActive ? <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-sky-400 opacity-60" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FindFriendsContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    seeking: "",
    university: "",
    email: "",
    interests: "",
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
  const [interestOffset, setInterestOffset] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<InterestTagCategoryId>(DEFAULT_CATEGORY?.id ?? "sports");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedCategory = useMemo(
    () => INTEREST_TAG_LIBRARY.find((category) => category.id === selectedCategoryId) ?? DEFAULT_CATEGORY,
    [selectedCategoryId]
  );

  const visibleInterests = useMemo(
    () => rotateList(selectedCategory?.tags ?? [], interestOffset).slice(0, INTEREST_BATCH_SIZE),
    [interestOffset, selectedCategory]
  );

  const inputClassName =
    "h-12 rounded-xl border-transparent bg-[#f8fafc] focus:border-sky-300 focus:ring-4 focus:ring-sky-500/10";

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) => {
      const next = current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest];
      setFormData((prev) => ({ ...prev, interests: next.join(", ") }));
      return next;
    });
  };

  const handleShuffleInterests = () => {
    if (!selectedCategory || selectedCategory.tags.length === 0) return;
    setInterestOffset((current) => current + INTEREST_BATCH_SIZE);
  };

  const handleCategoryChange = (categoryId: InterestTagCategoryId) => {
    setSelectedCategoryId(categoryId);
    setInterestOffset(0);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const age = parseInt(formData.age, 10);
    if (Number.isNaN(age) || age < 18) {
      alert("你需要年满 18 岁才能使用该功能。");
      return;
    }

    if (!formData.gender || !formData.seeking) {
      alert("请先选择你的性别和想找的搭子性别。");
      return;
    }

    if (selectedInterests.length === 0) {
      alert("请至少选择一个兴趣标签。");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/submit-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "friendship",
          ...formData,
          interests: selectedInterests.join(", "),
          idealHangout: formData.idealHangout,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        alert(data?.error || "提交失败，请稍后重试。");
        return;
      }

      setShowConfirmation(true);
      window.setTimeout(() => router.push("/"), 2600);
    } catch (error) {
      console.error("submit friendship profile failed", error);
      alert("提交失败，请检查网络连接。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef7ff] via-[#f8fbff] to-[#eef2ff] px-4 py-8 sm:py-12">
      <motion.div
        className="mb-8 flex justify-center sm:absolute sm:left-8 sm:top-8 sm:mb-0"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/" className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm backdrop-blur-md">
          <Heart className="h-5 w-5 text-pink-500" />
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-lg font-bold text-transparent">
            DateMatch
          </span>
        </Link>
      </motion.div>

      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] border border-white/70 bg-white/80 p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-12"
        >
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-600">
              <Users className="h-4 w-4" />
              朋友搭子档案
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              生成你的专属
              <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">朋友匹配档案</span>
            </h1>
            <p className="mt-3 text-gray-500">
              完善你的社交节奏、搭子性别偏好和兴趣标签，我们会在朋友池里为你寻找更同频的人。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">怎么称呼你？</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className={inputClassName}
                    placeholder="你的昵称或名字"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">年龄</label>
                  <Input
                    required
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(event) => setFormData({ ...formData, age: event.target.value })}
                    className={inputClassName}
                    placeholder="需要年满 18 岁"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">你的性别</label>
                  <ChoiceGrid
                    options={CHOICE_OPTIONS}
                    value={formData.gender}
                    onChange={(gender) => setFormData({ ...formData, gender })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">想找的搭子性别</label>
                  <ChoiceGrid
                    options={CHOICE_OPTIONS}
                    value={formData.seeking}
                    onChange={(seeking) => setFormData({ ...formData, seeking })}
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">学校</label>
                  <Input
                    required
                    value={formData.university}
                    onChange={(event) => setFormData({ ...formData, university: event.target.value })}
                    className={inputClassName}
                    placeholder="当前或最近就读的学校"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">邮箱</label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    className={inputClassName}
                    placeholder="用于接收匹配结果"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">兴趣标签</h3>
                  <p className="text-sm text-gray-500">先选分类，再挑出最像你的兴趣标签。</p>
                </div>
                <button
                  type="button"
                  onClick={handleShuffleInterests}
                  className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-600 shadow-sm hover:bg-sky-50"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  换一批
                </button>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {INTEREST_TAG_LIBRARY.map((category) => {
                  const isActive = category.id === selectedCategory?.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryChange(category.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                        isActive
                          ? "border-sky-300 bg-sky-50 shadow-sm"
                          : "border-gray-100 bg-white hover:border-sky-200 hover:bg-sky-50/40"
                      }`}
                    >
                      <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${category.chipClassName}`}>
                        {category.label}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-gray-500">{category.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#fafcff] p-5">
                <div className="flex flex-wrap gap-2.5">
                  {visibleInterests.map((interest) => {
                    const isActive = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-500/20"
                            : "border border-gray-200 bg-white text-gray-600 hover:border-sky-300 hover:text-sky-600"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedInterests.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold text-gray-500">已选标签 ({selectedInterests.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map((interest) => (
                      <span key={interest} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-500" />
                <h3 className="text-lg font-bold text-gray-800">理想相处方式</h3>
              </div>
              <p className="mb-3 text-sm text-gray-500">如果周末和新朋友第一次线下见面，你最想一起做什么？</p>
              <Textarea
                required
                value={formData.idealHangout}
                onChange={(event) => setFormData({ ...formData, idealHangout: event.target.value })}
                className="h-32 resize-none rounded-xl border-transparent bg-[#f8fafc] focus:border-sky-300 focus:ring-4 focus:ring-sky-500/10"
                placeholder="比如一起 Citywalk、看展、打游戏、去图书馆、喝咖啡闲聊..."
              />
            </section>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 py-7 text-lg font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.01] hover:from-sky-600 hover:to-cyan-600 disabled:opacity-70"
            >
              {submitting ? "提交中..." : "生成朋友匹配档案"}
            </Button>
          </form>
        </motion.div>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="border-none bg-white/95 backdrop-blur-xl sm:rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text pb-2 text-center text-3xl font-extrabold text-transparent">
              档案提交成功
            </DialogTitle>
          </DialogHeader>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50">
              <Users className="h-10 w-10 text-sky-500" />
            </div>
            <p className="text-lg font-medium leading-relaxed text-gray-700">
              朋友雷达已经收到你的信号，
              <br />
              我们会在朋友池里为你寻找更同频的搭子。
            </p>
            <p className="text-sm text-gray-400">后续请留意邮箱和匹配页更新。</p>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FindFriendsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-500">加载中...</div>}>
      <FindFriendsContent />
    </Suspense>
  );
}
