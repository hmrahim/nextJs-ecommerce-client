"use client";
import { useEffect, useState } from "react";
function Countdown({ hours = 12 }) {
  const [t, setT] = useState(hours * 3600);
  useEffect(() => {
    const i = setInterval(() => setT((s2) => s2 > 0 ? s2 - 1 : 0), 1e3);
    return () => clearInterval(i);
  }, []);
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor(t % 3600 / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return <div className="flex items-center gap-1.5 font-mono">
      {[h, m, s].map((v, i) => <span key={i} className="rounded-md bg-emerald-950 px-2 py-1 text-sm font-bold text-amber-300 tabular-nums">{v}</span>)}
    </div>;
}
export {
  Countdown
};
