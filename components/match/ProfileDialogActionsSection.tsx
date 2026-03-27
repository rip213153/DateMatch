"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileDialogActionsSectionProps {
  actionDisabled: boolean;
  actionLabel: string;
  confirmationUpdating: boolean;
  onClose: () => void;
  onToggleConfirm: () => void;
  onStartChat: () => void;
}

export function ProfileDialogActionsSection({
  actionDisabled,
  actionLabel,
  confirmationUpdating,
  onClose,
  onToggleConfirm,
  onStartChat,
}: ProfileDialogActionsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
      <Button type="button" variant="outline" onClick={onClose} className="h-11 rounded-xl">
        关闭
      </Button>
      <Button
        type="button"
        variant={actionDisabled ? "outline" : "default"}
        onClick={onToggleConfirm}
        disabled={actionDisabled || confirmationUpdating}
        className={
          actionDisabled
            ? "h-11 rounded-xl border-emerald-200 bg-white text-emerald-600"
            : "h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
        }
      >
        {confirmationUpdating ? "处理中..." : actionLabel}
      </Button>
      <Button
        type="button"
        onClick={onStartChat}
        className="h-11 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        开始聊天
      </Button>
    </div>
  );
}
