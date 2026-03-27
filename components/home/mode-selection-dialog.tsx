"use client";

import Link from "next/link";
import { Heart, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ModeSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ModeSelectionDialog({ open, onOpenChange }: ModeSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/80 bg-white/90 p-0 shadow-2xl backdrop-blur-xl sm:max-w-2xl">
        <DialogHeader className="px-6 pt-6 sm:px-8 sm:pt-8">
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">选择你的测试模式</DialogTitle>
          <p className="text-center text-sm leading-6 text-gray-500">
            恋爱模式更关注亲密关系节奏，朋友模式更关注社交电量、边界感与同频默契。
          </p>
        </DialogHeader>

        <div className="grid gap-4 px-6 pb-6 pt-2 sm:grid-cols-2 sm:px-8 sm:pb-8">
          <Link href="/quiz?mode=romance" onClick={() => onOpenChange(false)} className="block">
            <div className="group w-full rounded-[1.75rem] border border-pink-100 bg-gradient-to-br from-white to-pink-50 p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-pink-300 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                <Heart className="h-6 w-6 transition-transform group-hover:scale-110" fill="currentColor" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">遇见心动正缘</h3>
              <p className="text-sm leading-6 text-gray-500">
                测试依恋倾向、沟通方式与关系节奏，看看你在亲密关系里更吸引什么样的人。
              </p>
            </div>
          </Link>

          <Link href="/quiz?mode=friendship" onClick={() => onOpenChange(false)} className="block">
            <div className="group w-full rounded-[1.75rem] border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                <Users className="h-6 w-6 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">寻找灵魂搭子</h3>
              <p className="text-sm leading-6 text-gray-500">
                测试社交电量、维护成本和边界感，看看你更适合和什么样的朋友长期同频。
              </p>
            </div>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
