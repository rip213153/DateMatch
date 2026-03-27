"use client";

import { Mail } from "lucide-react";

interface ProfileDialogEmailSectionProps {
  checkingEmailAccess: boolean;
  emailUnlocked: boolean;
  email?: string;
}

export function ProfileDialogEmailSection({
  checkingEmailAccess,
  emailUnlocked,
  email,
}: ProfileDialogEmailSectionProps) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-700">
        <Mail className="h-4 w-4 text-pink-500" />
        <span className="font-medium">邮箱</span>
      </div>
      <div className="mt-2 break-all text-sm text-gray-600">
        {checkingEmailAccess ? (
          "正在检查是否满足展示条件..."
        ) : emailUnlocked ? (
          email || "暂未填写"
        ) : (
          <div className="space-y-1">
            <div>只有当双方都互相发过消息后，这里才会显示邮箱。</div>
            <div className="text-xs text-gray-400">邮箱仅用于登录验证，默认不会直接公开。</div>
          </div>
        )}
      </div>
    </div>
  );
}
