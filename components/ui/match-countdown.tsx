"use client";

import { useState, useEffect } from "react";

interface MatchCountdownProps {
  targetTime: Date;
  onEnd?: () => void;
}

export function MatchCountdown({ targetTime, onEnd }: MatchCountdownProps) {
  const [isClient, setIsClient] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("--:--:--");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetTime.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft("00:00:00");
        onEnd?.();
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetTime, isClient, onEnd]);

  if (!isClient) {
    return <span className="font-mono text-lg font-bold text-gray-600">--:--:--</span>;
  }

  return (
    <span className="font-mono text-lg font-bold text-purple-600">
      {timeLeft}
    </span>
  );
}
