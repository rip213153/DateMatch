"use client";

import { ReactNode, Suspense, isValidElement, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Heart, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getRandomFriendshipQuestions } from "@/app/data/friendshipQuestionBank";
import { getRandomQuestions } from "@/app/data/questionBank";
import {
  type Answer,
  type FriendshipAnswer,
  type FriendshipQuestion,
  type FriendshipTraits,
  type PersonalityTraits,
  type Question,
  type QuizMode,
} from "@/app/data/types";

const ROMANCE_DEFAULT_PROFILE: PersonalityTraits = {
  socialStyle: 5,
  emotionalReadiness: 5,
  dateStyle: 5,
  commitment: 5,
  communication: 5,
  independence: 5,
  career: 5,
  flexibility: 5,
};

const FRIENDSHIP_DEFAULT_PROFILE: FriendshipTraits = {
  socialEnergy: 5,
  maintenance: 5,
  boundaries: 5,
  spontaneity: 5,
  empathy: 5,
  reliability: 5,
  depth: 5,
  openness: 5,
};

const ROMANCE_TRAIT_KEYS: Array<keyof PersonalityTraits> = [
  "socialStyle",
  "emotionalReadiness",
  "dateStyle",
  "commitment",
  "communication",
  "independence",
  "career",
  "flexibility",
];

const FRIENDSHIP_TRAIT_KEYS: Array<keyof FriendshipTraits> = [
  "socialEnergy",
  "maintenance",
  "boundaries",
  "spontaneity",
  "empathy",
  "reliability",
  "depth",
  "openness",
];

type AnyQuestion = Question | FriendshipQuestion;
type AnyAnswer = Answer | FriendshipAnswer;
type AnyProfile = PersonalityTraits | FriendshipTraits;

function renderQuestionIcon(icon: unknown): ReactNode {
  if (isValidElement(icon)) return icon;

  if (typeof icon === "function") {
    const IconComp = icon as (props: { className?: string }) => ReactNode;
    return <IconComp className="h-7 w-7" />;
  }

  return <Sparkles className="h-7 w-7" />;
}

function BackgroundEffects() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#faf8f9]" />
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-pink-300/35 blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -40, 30, 0], y: [0, 50, -20, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-10%] top-[20%] h-[60%] w-[40%] rounded-full bg-purple-300/35 blur-[100px]"
      />
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}

function detectQuizMode(value: string | null): QuizMode {
  return value === "friendship" ? "friendship" : "romance";
}

function calculateAverageProfile(
  answers: Array<{ traits: Record<string, number | undefined> }>,
  initialProfile: Record<string, number>,
  traitKeys: string[]
) {
  const traitCounts = traitKeys.reduce<Record<string, number>>((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  const profile = answers.reduce((acc, answer) => {
    Object.entries(answer.traits).forEach(([trait, value]) => {
      if (!(trait in acc)) {
        return;
      }

      acc[trait] += Number(value ?? 0);
      traitCounts[trait] += 1;
    });
    return acc;
  }, { ...initialProfile });

  traitKeys.forEach((traitKey) => {
    if (traitCounts[traitKey] > 0) {
      profile[traitKey] = profile[traitKey] / traitCounts[traitKey];
    }
  });

  return profile;
}

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = detectQuizMode(searchParams.get("mode"));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AnyAnswer[]>([]);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [completedProfile, setCompletedProfile] = useState<AnyProfile | null>(null);

  const quizConfig = useMemo(
    () =>
      mode === "friendship"
        ? {
            mode,
            badge: "FRIENDSHIP QUIZ",
            title: "测测你的友情连接方式",
            subtitle: "看看你更适合高频热闹局，还是边界感清晰的长期搭子。",
            icon: <Users className="h-6 w-6" />,
            iconWrapClassName: "border-sky-100 bg-white/85 text-sky-500",
            progressClassName: "bg-sky-100/70",
            progressIndicatorClassName: "bg-gradient-to-r from-sky-500 to-cyan-500 duration-500",
            questions: getRandomFriendshipQuestions(10) as AnyQuestion[],
            completeTitle: "友情档案已生成",
            completeDescription: "你的社交电量、边界感和搭子默契已经分析完成。",
            ctaText: "查看友情分析",
            emptyTitle: "题目加载异常",
          }
        : {
            mode,
            badge: "PERSONALITY QUIZ",
            title: "找到你的恋爱人格节奏",
            subtitle: "从依恋方式到沟通偏好，看看你在亲密关系里最有魅力的样子。",
            icon: <Heart className="h-6 w-6" fill="currentColor" />,
            iconWrapClassName: "border-pink-100 bg-white/85 text-pink-500",
            progressClassName: "bg-pink-100/70",
            progressIndicatorClassName: "bg-gradient-to-r from-pink-500 to-purple-600 duration-500",
            questions: getRandomQuestions(20) as AnyQuestion[],
            completeTitle: "恋爱档案已生成",
            completeDescription: "你的灵魂匹配档案已经生成，准备好看看谁会和你更同频了吗？",
            ctaText: "查看匹配分析",
            emptyTitle: "题目加载异常",
          },
    [mode]
  );

  const questions = quizConfig.questions;
  const totalQuestions = Math.max(questions.length, 1);
  const progress = questions.length ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  const activeQuestion = questions[currentQuestion];

  const goToResults = (profile: AnyProfile) => {
    router.push(`/results?mode=${mode}&profile=${encodeURIComponent(JSON.stringify(profile))}`);
  };

  const handleAnswer = (answer: AnyAnswer) => {
    if (isCompletedModalOpen || !activeQuestion) return;

    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      return;
    }

    const profile =
      mode === "friendship"
        ? (calculateAverageProfile(
            nextAnswers as Array<{ traits: Record<string, number | undefined> }>,
            FRIENDSHIP_DEFAULT_PROFILE as unknown as Record<string, number>,
            FRIENDSHIP_TRAIT_KEYS as string[]
          ) as unknown as FriendshipTraits)
        : (calculateAverageProfile(
            nextAnswers as Array<{ traits: Record<string, number | undefined> }>,
            ROMANCE_DEFAULT_PROFILE as unknown as Record<string, number>,
            ROMANCE_TRAIT_KEYS as string[]
          ) as unknown as PersonalityTraits);

    setCompletedProfile(profile);
    setIsCompletedModalOpen(true);
  };

  const handlePrevious = () => {
    if (currentQuestion === 0 || isCompletedModalOpen) return;
    setAnswers((prev) => prev.slice(0, -1));
    setCurrentQuestion((prev) => Math.max(0, prev - 1));
  };

  const handleViewResults = () => {
    if (!completedProfile) return;
    setIsCompletedModalOpen(false);
    goToResults(completedProfile);
  };

  const title = useMemo(() => {
    if (!activeQuestion) return quizConfig.emptyTitle;
    return activeQuestion.text;
  }, [activeQuestion, quizConfig.emptyTitle]);

  if (questions.length === 0 || !activeQuestion) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-3 py-8 sm:px-4 sm:py-12">
        <BackgroundEffects />
        <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/70 bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${quizConfig.iconWrapClassName}`}>
            {quizConfig.icon}
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-800">{questions.length === 0 ? "加载中..." : quizConfig.emptyTitle}</h2>
          {questions.length > 0 ? (
            <>
              <p className="text-sm leading-relaxed text-gray-500">当前题目未成功生成，请返回首页后重新开始测试。</p>
              <Button
                onClick={() => router.push("/")}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-pink-500/20 hover:from-pink-600 hover:to-purple-700"
              >
                返回首页
              </Button>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-10 sm:px-8">
      <BackgroundEffects />

      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between gap-3"
        >
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="rounded-full bg-white/80 text-gray-700 shadow-sm backdrop-blur-md disabled:opacity-40"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 上一题
          </Button>
          <div className="rounded-full border border-white/70 bg-white/70 px-4 py-1.5 text-sm font-semibold text-gray-500 shadow-sm backdrop-blur-md">
            第 {currentQuestion + 1} / {questions.length} 题
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/70 bg-white/60 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border shadow-sm ${quizConfig.iconWrapClassName}`}>
                {renderQuestionIcon(activeQuestion.icon)}
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-pink-500">{quizConfig.badge}</p>
                <h1 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">{quizConfig.title}</h1>
                <p className="mt-1 max-w-lg text-sm leading-6 text-gray-500">{quizConfig.subtitle}</p>
              </div>
            </div>
          </div>

          <Progress
            value={progress}
            className={`mb-8 h-2 overflow-hidden rounded-full ${quizConfig.progressClassName}`}
            indicatorClassName={quizConfig.progressIndicatorClassName}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${currentQuestion}`}
              initial={{ opacity: 0, x: 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-6 shadow-sm sm:p-8">
                <h2 className="mb-8 break-words text-center text-[1.35rem] font-semibold leading-relaxed tracking-[0.01em] text-gray-900 sm:mb-10 sm:px-4 sm:text-[1.8rem]">
                  {title}
                </h2>

                <div className="space-y-4">
                  {activeQuestion.answers.map((answer, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, ease: "easeOut" }}
                    >
                      <button
                        type="button"
                        onClick={() => handleAnswer(answer)}
                        className="group w-full rounded-[1.35rem] border border-gray-100 bg-white px-6 py-5 text-left text-[15px] leading-relaxed text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-pink-200 hover:bg-pink-50/40 hover:text-gray-900 hover:shadow-[0_16px_36px_rgba(236,72,153,0.10)] focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-300 active:scale-[0.985] active:bg-pink-50 sm:text-base"
                      >
                        <span className="block">{answer.text}</span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.section>
      </div>

      <AnimatePresence>
        {isCompletedModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="quiz-complete-title"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              className="w-full max-w-sm rounded-[2rem] border border-white/80 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-xl"
            >
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 text-pink-500 shadow-sm`}>
                {quizConfig.mode === "friendship" ? <Users className="h-8 w-8" /> : <Sparkles className="h-8 w-8" />}
              </div>
              <h3 id="quiz-complete-title" className="mb-3 text-2xl font-bold text-gray-900">
                {quizConfig.completeTitle}
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-gray-500">{quizConfig.completeDescription}</p>
              <Button
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 py-6 text-base font-semibold shadow-lg shadow-pink-500/20 transition-all hover:-translate-y-0.5 hover:from-pink-600 hover:to-purple-700"
                onClick={handleViewResults}
              >
                {quizConfig.ctaText}
              </Button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function Quiz() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg text-gray-600">加载中...</div>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
