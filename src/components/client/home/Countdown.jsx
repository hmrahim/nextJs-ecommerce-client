"use client";
import { useEffect, useState, useCallback } from "react";

function getSecondsRemaining(targetDate) {
  if (!targetDate) return null;
  const end = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = Math.floor((end - now) / 1000);
  return diff > 0 ? diff : 0;
}

function Countdown({ targetDate, hours = 12, onExpire }) {
  const [t, setT] = useState(() => {
    if (targetDate) {
      return getSecondsRemaining(targetDate);
    }
    return hours * 3600;
  });

  useEffect(() => {
    // Recalculate when targetDate changes
    if (targetDate) {
      const remaining = getSecondsRemaining(targetDate);
      setT(remaining);
    }
  }, [targetDate]);

  useEffect(() => {
    if (t === null || t <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const i = setInterval(() => {
      if (targetDate) {
        // Recalculate from actual time to avoid drift
        const remaining = getSecondsRemaining(targetDate);
        setT(remaining);
        if (remaining <= 0) {
          clearInterval(i);
          if (onExpire) onExpire();
        }
      } else {
        setT((s) => {
          if (s <= 1) {
            clearInterval(i);
            if (onExpire) onExpire();
            return 0;
          }
          return s - 1;
        });
      }
    }, 1000);

    return () => clearInterval(i);
  }, [targetDate, onExpire]);

  // Don't render if expired
  if (t === null || t <= 0) return null;

  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 font-mono">
      {[h, m, s].map((v, i) => (
        <span
          key={i}
          className="rounded-md bg-emerald-950 px-2 py-1 text-sm font-bold text-amber-300 tabular-nums"
        >
          {v}
        </span>
      ))}
    </div>
  );
}

export { Countdown };