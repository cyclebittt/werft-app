"use client";

import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/utils/time";

interface TimerProps {
  startTime: Date | string;
  className?: string;
}

export function Timer({ startTime, className = "" }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [ticking, setTicking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const start = typeof startTime === "string" ? new Date(startTime) : startTime;

    function update() {
      const elapsed = Math.floor((Date.now() - start.getTime()) / 1000);
      setSeconds(elapsed);
      setTicking(true);
      setTimeout(() => setTicking(false), 100);
    }

    update();
    intervalRef.current = setInterval(update, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTime]);

  return (
    <span
      className={[
        "font-mono tabular-nums",
        ticking ? "tick-anim" : "",
        className,
      ].join(" ")}
    >
      {formatDuration(seconds)}
    </span>
  );
}
