"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UserSummary } from "@/components/match/types";
import { useState } from "react";

interface EditDialogsProps {
  currentUser: UserSummary | null;
  mode: "romance" | "friendship";
  showEditBio: boolean;
  setShowEditBio: (open: boolean) => void;
  showEditEmail: boolean;
  setShowEditEmail: (open: boolean) => void;
  showEditName: boolean;
  setShowEditName: (open: boolean) => void;
  onReload: () => void;
}

export function EditDialogs({
  currentUser,
  mode,
  showEditBio,
  setShowEditBio,
  showEditEmail,
  setShowEditEmail,
  showEditName,
  setShowEditName,
  onReload,
}: EditDialogsProps) {
  const [newBio, setNewBio] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const handleUpdateBio = async () => {
    if (!currentUser) return;
    
    setEditingBio(true);
    try {
      const res = await fetch("/api/update-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          userId: currentUser.id,
          newBio: newBio.trim(),
        }),
      });
      
      if (res.ok) {
        onReload();
        setShowEditBio(false);
        setNewBio("");
      } else {
        alert("修改失败，请稍后重试");
      }
    } catch (error) {
      console.error("Failed to update bio:", error);
      alert("修改失败，请稍后重试");
    } finally {
      setEditingBio(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim() || !currentUser) return;
    
    setEditingEmail(true);
    try {
      const res = await fetch("/api/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          userId: currentUser.id,
          newEmail: newEmail.trim().toLowerCase(),
        }),
      });
      
      if (res.ok) {
        localStorage.setItem("datematch_auth_identity", `email:${mode}:${newEmail.trim().toLowerCase()}`);
        onReload();
        setShowEditEmail(false);
        setNewEmail("");
      } else {
        alert("修改失败，请稍后重试");
      }
    } catch (error) {
      console.error("Failed to update email:", error);
      alert("修改失败，请稍后重试");
    } finally {
      setEditingEmail(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || !currentUser) return;
    
    setEditingName(true);
    try {
      const res = await fetch("/api/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          userId: currentUser.id,
          newName: newName.trim(),
        }),
      });
      
      if (res.ok) {
        onReload();
        setShowEditName(false);
        setNewName("");
      } else {
        alert("修改失败，请稍后重试");
      }
    } catch (error) {
      console.error("Failed to update name:", error);
      alert("修改失败，请稍后重试");
    } finally {
      setEditingName(false);
    }
  };

  return (
    <>
      {/* 编辑自我介绍 */}
      <Dialog open={showEditBio} onOpenChange={(open) => {
        setShowEditBio(open);
        if (!open) setNewBio("");
      }}>
        <DialogContent className="border-white/70 bg-white/95 p-0 shadow-2xl sm:max-w-md">
          <DialogHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5 text-left">
            <DialogTitle className="text-2xl font-extrabold text-gray-900">编辑自我介绍</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">简单介绍一下自己。</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">自我介绍</label>
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="例如：喜欢咖啡、阅读和周末散步..."
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 resize-none"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => setShowEditBio(false)} className="text-gray-600">取消</Button>
            <Button
              type="button"
              onClick={handleUpdateBio}
              disabled={editingBio}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
            >
              {editingBio ? "保存中..." : "保存修改"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑邮箱 */}
      <Dialog open={showEditEmail} onOpenChange={(open) => {
        setShowEditEmail(open);
        if (!open) setNewEmail("");
      }}>
        <DialogContent className="border-white/70 bg-white/95 p-0 shadow-2xl sm:max-w-md">
          <DialogHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5 text-left">
            <DialogTitle className="text-2xl font-extrabold text-gray-900">修改邮箱</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">修改邮箱后将同步到数据库。</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">当前邮箱</label>
                <div className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-gray-600">
                  {currentUser?.email ?? "未设置"}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">新邮箱</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="请输入新邮箱"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => setShowEditEmail(false)} className="text-gray-600">取消</Button>
            <Button
              type="button"
              onClick={handleUpdateEmail}
              disabled={editingEmail || !newEmail.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
            >
              {editingEmail ? "保存中..." : "保存修改"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑昵称 */}
      <Dialog open={showEditName} onOpenChange={(open) => {
        setShowEditName(open);
        if (!open) setNewName("");
      }}>
        <DialogContent className="border-white/70 bg-white/95 p-0 shadow-2xl sm:max-w-md">
          <DialogHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5 text-left">
            <DialogTitle className="text-2xl font-extrabold text-gray-900">修改昵称</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">修改昵称后将同步到数据库。</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">当前昵称</label>
                <div className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-gray-600">
                  {currentUser?.name ?? "未设置"}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">新昵称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="请输入新昵称"
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => setShowEditName(false)} className="text-gray-600">取消</Button>
            <Button
              type="button"
              onClick={handleUpdateName}
              disabled={editingName || !newName.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
            >
              {editingName ? "保存中..." : "保存修改"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
