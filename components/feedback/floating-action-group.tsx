"use client";

import type { MouseEvent, PointerEvent, RefObject } from "react";
import { Megaphone, MessageCircle } from "lucide-react";
import type { FabPosition } from "@/components/feedback/types";
import { Button } from "@/components/ui/button";

type FloatingActionGroupProps = {
  containerRef: RefObject<HTMLDivElement>;
  position: FabPosition | null;
  dragging: boolean;
  showAnnouncement: boolean;
  onFeedbackClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onAnnouncementClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
};

export function FloatingActionGroup({
  containerRef,
  position,
  dragging,
  showAnnouncement,
  onFeedbackClick,
  onAnnouncementClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: FloatingActionGroupProps) {
  return (
    <div
      ref={containerRef}
      className="fixed z-40 flex flex-col items-end gap-2"
      style={{
        left: position?.x,
        top: position?.y,
        transform: dragging ? "scale(1.05)" : "scale(1)",
        opacity: position ? 1 : 0,
      }}
    >
      {showAnnouncement ? (
        <Button
          type="button"
          onClick={onAnnouncementClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          title="点击查看公告，长按可拖动"
          aria-label="公告，长按可拖动"
          className="h-11 select-none rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-4 text-white shadow-lg transition-transform hover:from-sky-600 hover:to-cyan-600"
          style={{
            touchAction: "none",
            cursor: dragging ? "grabbing" : "grab",
          }}
        >
          <Megaphone className="h-4 w-4" />
          公告
        </Button>
      ) : null}

      <Button
        type="button"
        onClick={onFeedbackClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        title="点击反馈，长按可拖动"
        aria-label="反馈，长按可拖动"
        className="h-11 select-none rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 text-white shadow-lg transition-transform hover:from-pink-600 hover:to-purple-700"
        style={{
          touchAction: "none",
          cursor: dragging ? "grabbing" : "grab",
        }}
      >
        <MessageCircle className="h-4 w-4" />
        反馈
      </Button>
    </div>
  );
}
