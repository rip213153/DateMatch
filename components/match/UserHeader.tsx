"use client";//这是登陆后头部展示信息的界面

import { Button } from "@/components/ui/button";
import type { UserSummary } from "@/components/match/types";

interface UserHeaderProps {
  user?: UserSummary;
  onEditEmail?: () => void;
  onLogout: () => void;
}

export function UserHeader({ onEditEmail, onLogout }: UserHeaderProps) {
  return (
    <div className="absolute right-6 top-6 z-20 flex items-center gap-3">
      {onEditEmail && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEditEmail}
          className="text-gray-600 hover:text-pink-600"
        >
          修改邮箱
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onLogout}
        className="text-gray-600 hover:text-rose-600"
      >
        退出登录
      </Button>
    </div>
  );
}
