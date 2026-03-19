"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FeedbackItem = {
  id: number;
  source: string;
  nickname: string;
  content: string;
  createdAt: string;
};

type FabPosition = {
  x: number;
  y: number;
};

const FAB_STORAGE_KEY = "datematch_feedback_fab_position";
const FAB_EDGE_MARGIN = 12;
const LONG_PRESS_DELAY = 280;
const DRAG_CANCEL_DISTANCE = 10;

function getSourceLabel(pathname: string): string {
  if (pathname === "/") return "\u9996\u9875";
  if (pathname === "/results") return "\u6d4b\u8bc4\u7ed3\u679c\u9875";
  if (pathname === "/find-matches") return "\u5339\u914d\u7ed3\u679c\u9875";
  if (pathname === "/dev-channel-2") return "\u5f00\u53d1\u4e2d\u63a7\u53f0";
  return pathname || "unknown";
}

function clampFabPosition(position: FabPosition, width: number, height: number): FabPosition {
  const maxX = Math.max(FAB_EDGE_MARGIN, window.innerWidth - width - FAB_EDGE_MARGIN);
  const maxY = Math.max(FAB_EDGE_MARGIN, window.innerHeight - height - FAB_EDGE_MARGIN);

  return {
    x: Math.min(Math.max(position.x, FAB_EDGE_MARGIN), maxX),
    y: Math.min(Math.max(position.y, FAB_EDGE_MARGIN), maxY),
  };
}

function getDefaultFabPosition(width: number, height: number): FabPosition {
  const mobile = window.innerWidth < 640;
  const rightInset = mobile ? 16 : 20;
  const bottomInset = mobile ? 96 : 24;

  return clampFabPosition(
    {
      x: window.innerWidth - width - rightInset,
      y: window.innerHeight - height - bottomInset,
    },
    width,
    height
  );
}

export default function GlobalFeedbackFab() {
  const pathname = usePathname() || "";
  const hidden = pathname === "/feedback" || pathname === "/chat";
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState<FabPosition | null>(null);
  const [dragging, setDragging] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startPointerRef = useRef<{ x: number; y: number } | null>(null);
  const startPositionRef = useRef<FabPosition | null>(null);
  const dragActiveRef = useRef(false);
  const suppressClickRef = useRef(false);

  const sourceLabel = useMemo(() => getSourceLabel(pathname), [pathname]);

  useEffect(() => {
    const syncPosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      const width = rect?.width || 104;
      const height = rect?.height || 44;

      try {
        const saved = window.localStorage.getItem(FAB_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<FabPosition>;
          if (typeof parsed.x === "number" && typeof parsed.y === "number") {
            setPosition(clampFabPosition({ x: parsed.x, y: parsed.y }, width, height));
            return;
          }
        }
      } catch (error) {
        console.error("restore feedback button position failed", error);
      }

      setPosition(getDefaultFabPosition(width, height));
    };

    syncPosition();
    window.addEventListener("resize", syncPosition);

    return () => {
      window.removeEventListener("resize", syncPosition);
    };
  }, []);

  useEffect(() => {
    if (!position) return;

    try {
      window.localStorage.setItem(FAB_STORAGE_KEY, JSON.stringify(position));
    } catch (error) {
      console.error("save feedback button position failed", error);
    }
  }, [position]);

  const handleSubmit = async () => {
    const clean = content.trim();
    if (!clean) return;

    const item: FeedbackItem = {
      id: Date.now(),
      source: pathname || "/",
      nickname: nickname.trim() || "\u533f\u540d",
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

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSubmitted(false);
  };

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const stopDragging = (event?: React.PointerEvent<HTMLButtonElement>) => {
    clearLongPressTimer();

    if (event?.currentTarget && pointerIdRef.current !== null && event.currentTarget.hasPointerCapture(pointerIdRef.current)) {
      event.currentTarget.releasePointerCapture(pointerIdRef.current);
    }

    pointerIdRef.current = null;
    startPointerRef.current = null;
    startPositionRef.current = null;
    dragActiveRef.current = false;
    setDragging(false);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !position) return;

    const target = event.currentTarget;

    pointerIdRef.current = event.pointerId;
    startPointerRef.current = { x: event.clientX, y: event.clientY };
    startPositionRef.current = position;
    suppressClickRef.current = false;

    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      dragActiveRef.current = true;
      setDragging(true);
      target.setPointerCapture(event.pointerId);
    }, LONG_PRESS_DELAY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== event.pointerId || !startPointerRef.current || !startPositionRef.current) {
      return;
    }

    const deltaX = event.clientX - startPointerRef.current.x;
    const deltaY = event.clientY - startPointerRef.current.y;

    if (!dragActiveRef.current) {
      if (Math.hypot(deltaX, deltaY) > DRAG_CANCEL_DISTANCE) {
        clearLongPressTimer();
      }
      return;
    }

    event.preventDefault();

    const rect = buttonRef.current?.getBoundingClientRect();
    const width = rect?.width || 104;
    const height = rect?.height || 44;

    setPosition(
      clampFabPosition(
        {
          x: startPositionRef.current.x + deltaX,
          y: startPositionRef.current.y + deltaY,
        },
        width,
        height
      )
    );

    suppressClickRef.current = true;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;

    if (dragActiveRef.current) {
      suppressClickRef.current = true;
    }

    stopDragging(event);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
      return;
    }

    setOpen(true);
  };

  if (hidden) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        title="\u70b9\u51fb\u53cd\u9988\uff0c\u957f\u6309\u53ef\u62d6\u52a8"
        aria-label="\u53cd\u9988\uff0c\u957f\u6309\u53ef\u62d6\u52a8"
        className="fixed z-40 h-11 select-none rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 text-white shadow-lg transition-transform hover:from-pink-600 hover:to-purple-700"
        style={{
          left: position?.x,
          top: position?.y,
          touchAction: "none",
          transform: dragging ? "scale(1.05)" : "scale(1)",
          cursor: dragging ? "grabbing" : "grab",
          opacity: position ? 1 : 0,
        }}
      >
        <MessageCircle className="h-4 w-4" />
        {"\u53cd\u9988"}
      </Button>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{"\u53cd\u9988"}</DialogTitle>
          <DialogDescription>{`\u5f53\u524d\u6765\u6e90\uff1a${sourceLabel}`}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={"\u79f0\u547c\uff08\u9009\u586b\uff09"}
          />
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (submitted) setSubmitted(false);
            }}
            placeholder={"\u8bf7\u8f93\u5165\u4f60\u7684\u5efa\u8bae\uff0c\u6bd4\u5982\uff1a\u5361\u7247\u5e03\u5c40\u5df2\u7ecf\u5f88\u597d\uff0c\u5e0c\u671b\u8d44\u6599\u9875\u518d\u8865\u5145\u66f4\u591a\u7b5b\u9009\u6761\u4ef6\u3002"}
            className="min-h-[130px]"
          />
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
          >
            <Send className="h-4 w-4" />
            {"\u63d0\u4ea4\u53cd\u9988"}
          </Button>
          {submitted ? (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {"\u5df2\u63d0\u4ea4\uff0c\u611f\u8c22\u53cd\u9988\u3002"}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
