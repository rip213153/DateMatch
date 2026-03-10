"use client";

import { ReactNode, Suspense, isValidElement, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Answer, PersonalityTraits, Question } from "@/app/data/types";
import { getRandomQuestions } from "@/app/data/questionBank";

function renderQuestionIcon(icon: unknown): ReactNode {
  if (isValidElement(icon)) return icon;

  if (typeof icon === "function") {
    const IconComp = icon as (props: { className?: string }) => ReactNode;
    return <IconComp className="h-6 w-6 text-pink-500" />;
  }

  return <Sparkles className="h-6 w-6 text-pink-500" />;
}

function QuizContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [completedProfile, setCompletedProfile] = useState<PersonalityTraits | null>(null);
  const router = useRouter();

  useEffect(() => {
    setQuestions(getRandomQuestions(20));
  }, []);

  const totalQuestions = Math.max(questions.length, 1);
  const progress = questions.length ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  const activeQuestion = questions[currentQuestion];

  const goToResults = (profile: PersonalityTraits) => {
    router.push(`/results?profile=${encodeURIComponent(JSON.stringify(profile))}`);
  };

  const handleAnswer = (answer: Answer) => {
    if (isCompletedModalOpen || !activeQuestion) return;

    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      return;
    }

    const profile = calculatePersonalityProfile(nextAnswers);
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
    if (!activeQuestion) return "题目加载异常";
    return activeQuestion.text;
  }, [activeQuestion]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-100 to-purple-100 px-3 py-8 sm:px-4 sm:py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white/90 p-6 text-center shadow-xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">加载中...</h2>
        </div>
      </div>
    );
  }

  if (!activeQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-100 to-purple-100 px-3 py-8 sm:px-4 sm:py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white/90 p-6 text-center shadow-xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">题目加载异常</h2>
          <p className="mb-5 text-sm text-gray-600">当前题目未成功生成，请返回首页重试。</p>
          <Button onClick={() => router.push("/")} className="w-full">
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-100 to-purple-100 px-3 py-8 sm:px-4 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="rounded-full bg-white/80 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 上一题
          </Button>
          <div className="text-sm font-medium text-gray-600">
            第 {currentQuestion + 1} / {questions.length} 题
          </div>
        </div>

        <Progress value={progress} className="mb-8" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="overflow-hidden rounded-lg bg-white p-4 shadow-xl sm:p-6">
              <div className="mb-6 flex items-center justify-center">{renderQuestionIcon(activeQuestion.icon)}</div>
              <h2 className="mb-6 break-words px-1 text-center text-xl font-bold leading-snug text-gray-800 sm:text-2xl">{title}</h2>
              <div className="space-y-4">
                {activeQuestion.answers.map((answer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className="h-auto min-h-[56px] w-full whitespace-normal break-words px-4 py-3 text-left leading-relaxed text-gray-700 hover:bg-pink-50"
                      onClick={() => handleAnswer(answer)}
                    >
                      {answer.text}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isCompletedModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="quiz-complete-title"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 id="quiz-complete-title" className="mb-2 text-xl font-semibold text-gray-900">
                测试已完成
              </h3>
              <p className="mb-5 text-sm text-gray-600">你的结果已经生成，点击下方按钮查看匹配分析。</p>
              <Button className="w-full" onClick={handleViewResults}>
                查看结果
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function calculatePersonalityProfile(answers: Answer[]): PersonalityTraits {
  const initialProfile: PersonalityTraits = {
    socialStyle: 5,
    emotionalReadiness: 5,
    dateStyle: 5,
    commitment: 5,
    communication: 5,
    independence: 5,
    career: 5,
    flexibility: 5,
  };

  const traitCounts: Record<keyof PersonalityTraits, number> = {
    socialStyle: 0,
    emotionalReadiness: 0,
    dateStyle: 0,
    commitment: 0,
    communication: 0,
    independence: 0,
    career: 0,
    flexibility: 0,
  };

  const profile = answers.reduce((acc, answer) => {
    Object.entries(answer.traits).forEach(([trait, value]) => {
      const key = trait as keyof PersonalityTraits;
      acc[key] += Number(value ?? 0);
      traitCounts[key] += 1;
    });
    return acc;
  }, initialProfile);

  (Object.keys(profile) as (keyof PersonalityTraits)[]).forEach((traitKey) => {
    if (traitCounts[traitKey] > 0) {
      profile[traitKey] = profile[traitKey] / traitCounts[traitKey];
    }
  });

  return profile;
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
