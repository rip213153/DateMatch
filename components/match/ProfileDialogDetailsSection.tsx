"use client";

import type { QuizMode } from "@/app/data/types";
import { IdealPreferenceDisplay } from "@/components/profile/IdealPreferenceDisplay";

interface ProfileDialogDetailsSectionProps {
  age: number;
  university: string;
  formattedInterests: string;
  mode: QuizMode;
  idealDateTags?: string[];
  idealDate?: string;
  bio?: string;
}

export function ProfileDialogDetailsSection({
  age,
  university,
  formattedInterests,
  mode,
  idealDateTags,
  idealDate,
  bio,
}: ProfileDialogDetailsSectionProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="text-gray-500">年龄</div>
          <div className="font-semibold text-gray-900">{age} 岁</div>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="text-gray-500">学校</div>
          <div className="font-semibold text-gray-900">{university}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-gray-50 p-4">
        <div className="mb-1 text-gray-500">兴趣爱好</div>
        <div className="leading-relaxed text-gray-800">{formattedInterests}</div>
      </div>

      <div className="rounded-2xl bg-gray-50 p-4">
        <div className="mb-2 text-gray-500">{mode === "friendship" ? "理想相处方式" : "理想约会"}</div>
        <IdealPreferenceDisplay mode={mode} tags={idealDateTags} description={idealDate} />
      </div>

      <div className="rounded-2xl bg-gray-50 p-4">
        <div className="mb-1 text-gray-500">自我介绍</div>
        <div className="leading-relaxed text-gray-800">{bio?.trim() || "暂未填写"}</div>
      </div>
    </>
  );
}
