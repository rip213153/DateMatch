"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type EditEmailDialogProps = {
  open: boolean;
  currentEmail: string;
  value: string;
  editing: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
  onSave: () => void;
};

export function EditEmailDialog({
  open,
  currentEmail,
  value,
  editing,
  onOpenChange,
  onChange,
  onSave,
}: EditEmailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/70 bg-white/95 p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5 text-left">
          <DialogTitle className="text-2xl font-extrabold text-gray-900">修改邮箱</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">修改邮箱后将同步到数据库。</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">当前邮箱</label>
              <div className="flex h-10 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
                {currentEmail}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">新邮箱</label>
              <input
                type="email"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="请输入新邮箱"
                className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-600">
            取消
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={editing || !value.trim()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
          >
            {editing ? "保存中..." : "保存修改"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
