"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FeedbackDialogProps = {
  open: boolean;
  sourceLabel: string;
  nickname: string;
  content: string;
  submitted: boolean;
  onOpenChange: (next: boolean) => void;
  onNicknameChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: () => void;
};

export function FeedbackDialog({
  open,
  sourceLabel,
  nickname,
  content,
  submitted,
  onOpenChange,
  onNicknameChange,
  onContentChange,
  onSubmit,
}: FeedbackDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>反馈</DialogTitle>
          <DialogDescription>{`当前来源：${sourceLabel}`}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
            placeholder="称呼（选填）"
          />
          <Textarea
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder="请输入你的建议，比如：卡片布局已经很好，希望资料页再补充更多筛选条件。"
            className="min-h-[130px]"
          />
          <Button
            type="button"
            onClick={onSubmit}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
          >
            <Send className="h-4 w-4" />
            提交反馈
          </Button>
          {submitted ? (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              已提交，感谢反馈。
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
