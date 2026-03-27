"use client";

import { Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { UserSummary } from "@/components/match/types";
import { Button } from "@/components/ui/button";

type ProfileOverviewCardProps = {
  currentUser: UserSummary | null;
  mode: "romance" | "friendship";
  maskedEmail: string;
  onOpenFullEdit: () => void;
  onEditName: () => void;
  onEditBio: () => void;
  onEditEmail: () => void;
};

export function ProfileOverviewCard({
  currentUser,
  mode,
  maskedEmail,
  onOpenFullEdit,
  onEditName,
  onEditBio,
  onEditEmail,
}: ProfileOverviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_8px_32px_0_rgba(236,72,153,0.08)] backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-rose-400 text-xl font-bold text-white shadow-md">
            {currentUser?.name?.slice(0, 1) ?? "U"}
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-800">
              {currentUser?.name ?? "加载中"}
              <span className="rounded-full bg-white/50 px-2 py-0.5 text-sm font-medium text-gray-500">
                {currentUser?.age ?? "-"}岁
              </span>
              {currentUser?.gender ? (
                <span className="rounded-full bg-white/50 px-2 py-0.5 text-sm font-medium text-gray-500">
                  {currentUser.gender}
                </span>
              ) : null}
              {currentUser ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onOpenFullEdit}
                  className="h-6 text-[10px] text-rose-600 hover:text-rose-700"
                >
                  完整编辑
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onEditName}
                className="h-6 text-[10px] text-pink-600 hover:text-pink-700"
              >
                修改昵称
              </Button>
            </h2>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              <span>{currentUser?.university ?? "未设置学校"}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className={`rounded-lg px-2 py-1 font-medium ${mode === "friendship" ? "bg-sky-50 text-sky-600" : "bg-pink-50 text-pink-600"}`}>
                {mode === "friendship" ? "朋友模式" : "恋爱模式"}
              </span>
              {currentUser?.seeking ? (
                <span className="rounded-lg bg-purple-50 px-2 py-1">
                  <span className="font-medium text-purple-600">寻找：</span>
                  {currentUser.seeking}
                </span>
              ) : null}
            </div>
            {currentUser ? (
              <div className="mt-3 rounded-xl bg-gradient-to-r from-pink-50/50 to-purple-50/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-gray-700">自我介绍</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onEditBio}
                    className="h-6 text-[10px] text-pink-600 hover:text-pink-700"
                  >
                    编辑
                  </Button>
                </div>
                <div className="mt-1 text-xs leading-relaxed text-gray-600">
                  {currentUser.bio ? currentUser.bio : <span className="italic text-gray-400">该用户暂未填写自我介绍</span>}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-[300px]">
          <div className="flex items-center justify-between rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-pink-500" />
              <span className="flex-1 text-sm text-gray-700">{maskedEmail}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEditEmail}
              className="h-6 text-[10px] text-pink-600 hover:text-pink-700"
            >
              修改
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            <span className="text-gray-400">·</span> 邮箱仅用于登录验证，保护您的隐私
          </div>
        </div>
      </div>
    </motion.div>
  );
}
