// 📁 PATH: src/components/admin/flash-sales/CountdownTimer.jsx
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

'use client';
import { useState, useEffect } from 'react';

export default function CountdownTimer({ endTime, startTime, status }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const calc = () => {
      const target = status === 'upcoming' || status === 'scheduled'
        ? new Date(startTime)
        : new Date(endTime);
      const diff = target - new Date();
      if (diff <= 0) return setTime(null);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ h, m, s });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endTime, startTime, status]);

  if (!time) return <span className="text-xs text-slate-500">—</span>;

  const label = (status === 'upcoming' || status === 'scheduled') ? 'Starts in' : 'Ends in';
  const col   = status === 'active' ? 'text-orange-400' : 'text-blue-400';

  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-slate-500 mr-1">{label}</span>
      {[
        { v: String(time.h).padStart(2,'0'), u: 'h' },
        { v: String(time.m).padStart(2,'0'), u: 'm' },
        { v: String(time.s).padStart(2,'0'), u: 's' },
      ].map(({ v, u }, i) => (
        <span key={u} className="flex items-center gap-0.5">
          {i > 0 && <span className={`text-xs ${col} opacity-60`}>:</span>}
          <span className={`text-xs font-mono font-bold ${col}`}>{v}</span>
          <span className="text-[9px] text-slate-600">{u}</span>
        </span>
      ))}
    </div>
  );
}
