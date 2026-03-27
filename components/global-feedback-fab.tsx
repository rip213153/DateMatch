"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { AnnouncementDialog } from "@/components/feedback/announcement-dialog";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";
import { FloatingActionGroup } from "@/components/feedback/floating-action-group";
import type { FeedbackItem } from "@/components/feedback/types";
import { useDraggableFloatingGroup } from "@/components/feedback/use-draggable-floating-group";
import { useHomeAnnouncement } from "@/lib/use-home-announcement";

function getSourceLabel(pathname: string): string {
  if (pathname === "/") return "首页";
  if (pathname === "/results") return "测评结果页";
  if (pathname === "/find-matches") return "匹配结果页";
  if (pathname === "/dev-channel-2") return "开发中控台";
  return pathname || "unknown";
}

export default function GlobalFeedbackFab() {
  const pathname = usePathname() || "";
  const hidden = pathname === "/feedback" || pathname === "/chat";
  const isHome = pathname === "/";
  const { announcement } = useHomeAnnouncement(isHome);
  const showAnnouncement = isHome && announcement.enabled;
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const sourceLabel = useMemo(() => getSourceLabel(pathname), [pathname]);
  const {
    containerRef,
    position,
    dragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    consumeSuppressedClick,
  } = useDraggableFloatingGroup({ hidden, showAnnouncement });

  useEffect(() => {
    if (!showAnnouncement && announcementOpen) {
      setAnnouncementOpen(false);
    }
  }, [announcementOpen, showAnnouncement]);

  const handleSubmit = async () => {
    const clean = content.trim();
    if (!clean) return;

    const item: FeedbackItem = {
      id: Date.now(),
      source: pathname || "/",
      nickname: nickname.trim() || "匿名",
      content: clean,
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem("datematch_feedback_items");
      const list = raw ? (JSON.parse(raw) as FeedbackItem[]) : [];
      const next = [item, ...list].slice(0, 300);
      localStorage.setItem("datematch_feedback_items", JSON.stringify(next));
    } catch (error) {
      console.error("save feedback failed", error);
    }

    setSubmitted(true);
    setContent("");

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: pathname || "/",
          nickname: nickname.trim() || "匿名",
          content: clean,
        }),
      });
    } catch (error) {
      console.error("send feedback failed:", error);
    }
  };

  const handleFeedbackOpenChange = (next: boolean) => {
    setFeedbackOpen(next);
    if (!next) setSubmitted(false);
  };

  const handleAnnouncementOpenChange = (next: boolean) => {
    setAnnouncementOpen(next);
  };

  const handleFeedbackClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (consumeSuppressedClick(event)) return;
    setFeedbackOpen(true);
  };

  const handleAnnouncementClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (consumeSuppressedClick(event)) return;
    setAnnouncementOpen(true);
  };

  if (hidden) return null;

  return (
    <>
      <FloatingActionGroup
        containerRef={containerRef}
        position={position}
        dragging={dragging}
        showAnnouncement={showAnnouncement}
        onFeedbackClick={handleFeedbackClick}
        onAnnouncementClick={handleAnnouncementClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      <FeedbackDialog
        open={feedbackOpen}
        sourceLabel={sourceLabel}
        nickname={nickname}
        content={content}
        submitted={submitted}
        onOpenChange={handleFeedbackOpenChange}
        onNicknameChange={setNickname}
        onContentChange={(value) => {
          setContent(value);
          if (submitted) setSubmitted(false);
        }}
        onSubmit={handleSubmit}
      />

      <AnnouncementDialog
        open={announcementOpen}
        onOpenChange={handleAnnouncementOpenChange}
        announcement={announcement}
      />
    </>
  );
}
