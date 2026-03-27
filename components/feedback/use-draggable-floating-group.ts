"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import type { FabPosition } from "@/components/feedback/types";

const FAB_STORAGE_KEY = "datematch_feedback_fab_position";
const FAB_EDGE_MARGIN = 12;
const LONG_PRESS_DELAY = 280;
const DRAG_CANCEL_DISTANCE = 10;

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
    height,
  );
}

export function useDraggableFloatingGroup({
  hidden,
  showAnnouncement,
}: {
  hidden: boolean;
  showAnnouncement: boolean;
}) {
  const [position, setPosition] = useState<FabPosition | null>(null);
  const [dragging, setDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startPointerRef = useRef<{ x: number; y: number } | null>(null);
  const startPositionRef = useRef<FabPosition | null>(null);
  const dragActiveRef = useRef(false);
  const suppressClickRef = useRef(false);

  const getGroupSize = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    return {
      width: rect?.width || 112,
      height: rect?.height || (showAnnouncement ? 96 : 44),
    };
  }, [showAnnouncement]);

  useEffect(() => {
    if (hidden) return;

    const syncPosition = () => {
      const { width, height } = getGroupSize();

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
  }, [getGroupSize, hidden]);

  useEffect(() => {
    if (!position) return;

    try {
      window.localStorage.setItem(FAB_STORAGE_KEY, JSON.stringify(position));
    } catch (error) {
      console.error("save feedback button position failed", error);
    }
  }, [position]);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const stopDragging = (event?: PointerEvent<HTMLButtonElement>) => {
    clearLongPressTimer();

    if (
      event?.currentTarget &&
      pointerIdRef.current !== null &&
      event.currentTarget.hasPointerCapture(pointerIdRef.current)
    ) {
      event.currentTarget.releasePointerCapture(pointerIdRef.current);
    }

    pointerIdRef.current = null;
    startPointerRef.current = null;
    startPositionRef.current = null;
    dragActiveRef.current = false;
    setDragging(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
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

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (
      pointerIdRef.current !== event.pointerId ||
      !startPointerRef.current ||
      !startPositionRef.current
    ) {
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

    const { width, height } = getGroupSize();

    setPosition(
      clampFabPosition(
        {
          x: startPositionRef.current.x + deltaX,
          y: startPositionRef.current.y + deltaY,
        },
        width,
        height,
      ),
    );

    suppressClickRef.current = true;
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;

    if (dragActiveRef.current) {
      suppressClickRef.current = true;
    }

    stopDragging(event);
  };

  const consumeSuppressedClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
      return true;
    }

    return false;
  };

  return {
    containerRef,
    position,
    dragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    consumeSuppressedClick,
  };
}
