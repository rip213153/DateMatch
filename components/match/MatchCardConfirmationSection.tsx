"use client";

import { Button } from "@/components/ui/button";

interface MatchCardConfirmationSectionProps {
  title: string;
  description: string;
  actionLabel: string;
  actionDisabled: boolean;
  confirmationUpdating: boolean;
  onToggleConfirm: () => void;
}

export function MatchCardConfirmationSection({
  title,
  description,
  actionLabel,
  actionDisabled,
  confirmationUpdating,
  onToggleConfirm,
}: MatchCardConfirmationSectionProps) {
  return (
    <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-emerald-800">{title}</div>
          <div className="mt-1 text-xs leading-relaxed text-emerald-700">{description}</div>
        </div>
        <Button
          type="button"
          variant={actionDisabled ? "outline" : "default"}
          onClick={onToggleConfirm}
          disabled={actionDisabled || confirmationUpdating}
          className={
            actionDisabled
              ? "h-10 rounded-xl border-emerald-200 bg-white text-emerald-600"
              : "h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
          }
        >
          {confirmationUpdating ? "处理中..." : actionLabel}
        </Button>
      </div>
    </div>
  );
}
