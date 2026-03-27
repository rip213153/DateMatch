"use client";

import type { UserSummary } from "@/components/match/types";
import { useState } from "react";
import { EditBioDialog } from "@/components/match/EditBioDialog";
import { EditEmailDialog } from "@/components/match/EditEmailDialog";
import { EditNameDialog } from "@/components/match/EditNameDialog";

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
      <EditBioDialog
        open={showEditBio}
        value={newBio}
        editing={editingBio}
        onOpenChange={(open) => {
          setShowEditBio(open);
          if (!open) setNewBio("");
        }}
        onChange={setNewBio}
        onSave={handleUpdateBio}
      />

      <EditEmailDialog
        open={showEditEmail}
        currentEmail={currentUser?.email ?? "未设置"}
        value={newEmail}
        editing={editingEmail}
        onOpenChange={(open) => {
          setShowEditEmail(open);
          if (!open) setNewEmail("");
        }}
        onChange={setNewEmail}
        onSave={handleUpdateEmail}
      />

      <EditNameDialog
        open={showEditName}
        currentName={currentUser?.name ?? "未设置"}
        value={newName}
        editing={editingName}
        onOpenChange={(open) => {
          setShowEditName(open);
          if (!open) setNewName("");
        }}
        onChange={setNewName}
        onSave={handleUpdateName}
      />
    </>
  );
}
