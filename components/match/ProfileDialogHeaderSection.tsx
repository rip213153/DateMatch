"use client";

import type { QuizMode } from "@/app/data/types";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProfileDialogHeaderSectionProps {
  name: string;
  mode: QuizMode;
}

export function ProfileDialogHeaderSection({
  name,
  mode,
}: ProfileDialogHeaderSectionProps) {
  return (
    <DialogHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5 text-left">
      <DialogTitle className="text-2xl font-extrabold text-gray-900">{name} 的资料</DialogTitle>
      <DialogDescription className="text-sm text-gray-500">
        {mode === "friendship"
          ? "看看对方的相处偏好，确认合适再继续聊天。"
          : "看看对方的约会偏好，确认有感觉再继续了解。"}
      </DialogDescription>
    </DialogHeader>
  );
}
