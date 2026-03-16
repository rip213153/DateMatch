"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, RefreshCcw, User, GraduationCap, Sparkles, Coffee, CheckCircle2 } from "lucide-react";
import { INTEREST_TAG_LIBRARY, type InterestTagCategoryId } from "@/app/data/interestTagLibrary";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const GENDER_OPTIONS =[
  { value: "male", label: "男生" },
  { value: "female", label: "女生" },
  { value: "non-binary", label: "非二元" },
  { value: "other", label: "其他" },
];

const SEEKING_OPTIONS =[
  { value: "male", label: "男生" },
  { value: "female", label: "女生" },
  { value: "non-binary", label: "非二元" },
  { value: "any", label: "不限" },
];

const INTEREST_BATCH_SIZE = 12;
const DEFAULT_CATEGORY = INTEREST_TAG_LIBRARY[0] ?? null;
const FALLBACK_CATEGORY_ID: InterestTagCategoryId = "sports";

// 优化的选择网格：去除生硬边框，增加点击阻尼感和柔和光晕
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative overflow-hidden rounded-2xl border-2 px-4 py-4 text-sm font-semibold transition-all duration-300 active:scale-[0.97] flex items-center justify-center ${
              isActive
                ? "border-purple-300 bg-purple-50 text-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.12)]"
                : "border-transparent bg-[#f8f9fa] text-gray-500 hover:bg-purple-50/50 hover:text-purple-600"
            }`}
          >
            {isActive && <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-purple-400 opacity-50" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function rotateList<T>(items: T[], offset: number) {
  if (items.length === 0) return[];
  const normalizedOffset = ((offset % items.length) + items.length) % items.length;
  return[...items.slice(normalizedOffset), ...items.slice(0, normalizedOffset)];
}

function FindMatchContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    seeking: "",
    university: "",
    email: "",
    interests: "",
    idealDate: "",
    personalityProfile: JSON.stringify({
      socialStyle: 7.5,
      emotionalReadiness: 8.5,
      dateStyle: 6.86,
      commitment: 10,
      communication: 8,
      independence: 8.6,
      career: 10.5,
      flexibility: 8.5,
    }),
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestOffset, setInterestOffset] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<InterestTagCategoryId>(
    DEFAULT_CATEGORY?.id ?? FALLBACK_CATEGORY_ID
  );
  const[showConfirmation, setShowConfirmation] = useState(false);

  const selectedCategory = useMemo(
    () => INTEREST_TAG_LIBRARY.find((c) => c.id === selectedCategoryId) ?? DEFAULT_CATEGORY,
    [selectedCategoryId]
  );

  const visibleInterests = useMemo(
    () => rotateList(selectedCategory?.tags ?? [], interestOffset).slice(0, INTEREST_BATCH_SIZE),
    [interestOffset, selectedCategory]
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) => {
      const next = current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest];

      setFormData((prev) => ({ ...prev, interests: next.join(", ") }));
      return next;
    });
  };

  const handleShuffleInterests = () => {
    if (!selectedCategory || selectedCategory.tags.length === 0) return;
    setInterestOffset((current) => current + INTEREST_BATCH_SIZE);
  };

  const handleCategoryChange = (categoryId: InterestTagCategoryId) => {
    setSelectedCategoryId(() => categoryId);
    setInterestOffset(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(formData.age, 10);
    if (Number.isNaN(age) || age < 18) {
      alert("你必须年满 18 岁才能使用此服务。");
      return;
    }
    if (selectedInterests.length === 0) {
      alert("请至少选择一个兴趣标签。");
      return;
    }

    try {
      const response = await fetch("/api/submit-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "romance", ...formData }),
      });

      if (response.ok) {
        setShowConfirmation(true);
        setTimeout(() => router.push("/"), 3000);
      } else {
        alert("提交失败，请重试。");
      }
    } catch (error) {
      console.error(error);
      alert("提交失败，请检查网络连接。");
    }
  };

  // 定制输入框样式
  const inputClassName = "w-full rounded-xl border-transparent bg-[#f8f9fa] px-4 py-3 text-gray-700 transition-all focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-500/10 hover:bg-[#f1f3f5]";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff0f3] via-[#f8f9ff] to-[#f3e8ff] px-4 py-8 sm:py-12 font-sans">
      
      {/* 顶部 Logo */}
      <motion.div className="mb-8 flex justify-center sm:absolute sm:left-8 sm:top-8 sm:mb-0" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/" className="flex items-center space-x-2 rounded-full bg-white/50 px-4 py-2 backdrop-blur-md shadow-sm">
          <Heart className="h-5 w-5 text-pink-500" />
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-lg font-bold text-transparent tracking-wide">
            DateMatch
          </span>
        </Link>
      </motion.div>

      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="overflow-hidden rounded-[2.5rem] bg-white/80 p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-12 border border-white/60"
        >
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              生成你的专属<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">匹配档案</span>
            </h1>
            <p className="text-gray-500 font-medium">完善以下信息，让我们为你寻找最契合的灵魂伴侣</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* 模块 1：基本信息 */}
            <section>
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500"><User size={18} /></div>
                <h3 className="text-lg font-bold text-gray-800">基本信息</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">怎么称呼你？</label>
                  <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClassName} placeholder="你的昵称或名字" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">年龄</label>
                  <Input required type="number" min="18" max="100" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className={inputClassName} placeholder="需满18岁" />
                </div>
              </div>
              
              <div className="mt-6 space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">你的性别</label>
                  <ChoiceGrid options={GENDER_OPTIONS} value={formData.gender} onChange={(gender) => setFormData({ ...formData, gender })} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">你希望遇见</label>
                  <ChoiceGrid options={SEEKING_OPTIONS} value={formData.seeking} onChange={(seeking) => setFormData({ ...formData, seeking })} />
                </div>
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* 模块 2：校园与联络 */}
            <section>
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500"><GraduationCap size={18} /></div>
                <h3 className="text-lg font-bold text-gray-800">校园档案</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">就读院校</label>
                  <Input required value={formData.university} onChange={(e) => setFormData({ ...formData, university: e.target.value })} className={inputClassName} placeholder="当前或最近就读的大学" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">联络邮箱</label>
                  <Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClassName} placeholder="用于接收匹配结果" />
                </div>
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* 模块 3：兴趣标签 (重点重构区) */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-500"><Sparkles size={18} /></div>
                  <h3 className="text-lg font-bold text-gray-800">灵魂标签</h3>
                </div>
              </div>
              
              <p className="mb-4 text-sm text-gray-500 font-medium">从下方选择最能代表你的爱好（多选）</p>

              {/* 大类选择器 - 更加扁平精致 */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {INTEREST_TAG_LIBRARY.map((category) => {
                  const isActive = category.id === selectedCategory?.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryChange(category.id)}
                      className={`relative flex flex-col items-start rounded-2xl border px-4 py-3 transition-all ${
                        isActive
                          ? "border-pink-300 bg-pink-50/50 shadow-sm"
                          : "border-gray-100 bg-white hover:border-pink-200 hover:bg-gray-50/50"
                      }`}
                    >
                      <span className={`text-[13px] font-bold ${isActive ? 'text-pink-600' : 'text-gray-700'}`}>
                        {category.label}
                      </span>
                      <span className="mt-1 text-xs text-gray-400 truncate w-full text-left">{category.description}</span>
                    </button>
                  );
                })}
              </div>

              {/* 标签池与换一批 */}
              <div className="rounded-2xl bg-[#fafafa] p-5 border border-gray-100">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">选择 {selectedCategory?.label} 标签</span>
                  <button
                    type="button"
                    onClick={handleShuffleInterests}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-pink-500 shadow-sm ring-1 ring-gray-200 hover:bg-pink-50 transition-colors"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" /> 换一批
                  </button>
                </div>
                
                {/* 真正的标签样式 (Pill shape) */}
                <div className="flex flex-wrap gap-2.5">
                  {visibleInterests.map((interest) => {
                    const isActive = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-full px-5 py-2 text-[14px] font-medium transition-all active:scale-95 ${
                          isActive
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-500/20"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:text-pink-500 shadow-sm"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 已选标签展示槽 */}
              {selectedInterests.length > 0 && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <p className="mb-2 text-xs font-semibold text-gray-500">已选标签 ({selectedInterests.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map((interest) => (
                      <span key={interest} className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        {interest}
                        <button type="button" onClick={() => toggleInterest(interest)} className="ml-1 rounded-full p-0.5 hover:bg-purple-200">
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <hr className="border-gray-100" />

            {/* 模块 4：理想约会 */}
            <section>
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-400"><Coffee size={18} /></div>
                <h3 className="text-lg font-bold text-gray-800">理想约会</h3>
              </div>
              <p className="mb-3 text-sm text-gray-500 font-medium">如果周末见面，你梦想中的第一次约会是什么样的？</p>
              <Textarea
                required
                value={formData.idealDate}
                onChange={(e) => setFormData({ ...formData, idealDate: e.target.value })}
                className="h-32 w-full resize-none rounded-xl border-transparent bg-[#f8f9fa] px-4 py-4 text-gray-700 transition-all focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-500/10 hover:bg-[#f1f3f5]"
                placeholder="比如：一起去喝杯咖啡，去江边散步，或者去听一场Livehouse..."
              />
            </section>

            <Button
              type="submit"
              className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-7 text-[1.1rem] font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_40px_-10px_rgba(236,72,153,0.6)]"
            >
              <span className="relative z-10 flex items-center justify-center">
                生成匹配档案
                <Heart className="ml-2 h-5 w-5 animate-pulse group-hover:fill-white" />
              </span>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-pink-600 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Button>
          </form>
        </motion.div>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="border-none bg-white/95 backdrop-blur-xl sm:rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-center text-3xl font-extrabold text-transparent pb-2">
              档案投递成功！
            </DialogTitle>
          </DialogHeader>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-50">
               <Heart className="h-10 w-10 animate-pulse text-pink-500 fill-pink-500" />
            </div>
            <p className="text-lg font-medium text-gray-700 leading-relaxed">
              宇宙已经收到你的信号。<br />我们正在为你计算最佳的缘分坐标...
            </p>
            <p className="text-sm text-gray-400">请留意您的邮箱，缘分随时降临。</p>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FindMatch() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-500">加载中...</div>}>
      <FindMatchContent />
    </Suspense>
  );
}
