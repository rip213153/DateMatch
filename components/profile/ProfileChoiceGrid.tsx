"use client";

import { CheckCircle2 } from "lucide-react";
import type { ProfileChoiceOption } from "@/app/data/profileChoiceOptions";
import type { QuizMode } from "@/app/data/types";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<
  QuizMode,
  {
    active: string;
    inactive: string;
    icon: string;
  }
> = {
  romance: {
    active: "border-purple-300 bg-purple-50 text-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.12)]",
    inactive: "border-transparent bg-[#f8f9fa] text-gray-500 hover:bg-purple-50/50 hover:text-purple-600",
    icon: "text-purple-400 opacity-50",
  },
  friendship: {
    active: "border-sky-300 bg-sky-50 text-sky-700 shadow-[0_0_15px_rgba(14,165,233,0.12)]",
    inactive: "border-transparent bg-[#f8fafc] text-gray-500 hover:bg-sky-50/60 hover:text-sky-600",
    icon: "text-sky-400 opacity-60",
  },
};

type ProfileChoiceGridProps = {
  options: ProfileChoiceOption[];
  value: string;
  onChange: (nextValue: string) => void;
  mode: QuizMode;
  className?: string;
};

export function ProfileChoiceGrid({ options, value, onChange, mode, className }: ProfileChoiceGridProps) {
  const tone = TONE_STYLES[mode];
  const gridClassName = options.length <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className={cn("grid gap-3", gridClassName, className)}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex items-center justify-center rounded-2xl border-2 px-4 py-4 text-sm font-semibold transition-all duration-300 active:scale-[0.97]",
              isActive ? tone.active : tone.inactive,
            )}
          >
            {isActive ? <CheckCircle2 className={cn("absolute right-2 top-2 h-4 w-4", tone.icon)} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
