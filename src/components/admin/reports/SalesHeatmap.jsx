'use client';

import { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['12a','2a','4a','6a','8a','10a','12p','2p','4p','6p','8p','10p'];

// Simulated order intensity data [day][hour]
const RAW = [
  [2,1,1,3,8,14,18,22,26,30,24,12],  // Mon
  [3,1,1,2,9,16,20,25,28,32,26,14],  // Tue
  [2,1,1,3,7,12,17,21,25,28,22,10],  // Wed
  [3,2,1,4,10,18,22,28,32,36,29,15], // Thu
  [4,2,1,4,11,19,24,30,36,40,33,18], // Fri
  [6,3,2,3,8,12,20,34,48,54,48,32],  // Sat
  [5,2,2,3,6,10,18,30,42,46,38,24],  // Sun
];

const maxVal = Math.max(...RAW.flat());

function intensityColor(v) {
  const ratio = v / maxVal;
  if (ratio === 0)  return { bg: 'bg-slate-800/40', opacity: 1 };
  if (ratio < 0.15) return { bg: 'bg-indigo-900/60', opacity: 1 };
  if (ratio < 0.3)  return { bg: 'bg-indigo-700/70', opacity: 1 };
  if (ratio < 0.5)  return { bg: 'bg-indigo-600', opacity: 1 };
  if (ratio < 0.7)  return { bg: 'bg-indigo-500', opacity: 1 };
  if (ratio < 0.85) return { bg: 'bg-violet-400', opacity: 1 };
  return { bg: 'bg-violet-300', opacity: 1 };
}

export default function SalesHeatmap() {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Sales Activity Heatmap</h3>
          <p className="text-xs text-slate-500 mt-0.5">Order volume by day &amp; time of day</p>
        </div>
        {hovered && (
          <div className="text-right">
            <p className="text-xs text-slate-400">{DAYS[hovered.day]} at {HOURS[hovered.hour]}</p>
            <p className="text-sm font-bold text-white">{RAW[hovered.day][hovered.hour]} orders</p>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Hour labels */}
          <div className="flex items-center gap-1 mb-1.5 ml-10">
            {HOURS.map(h => (
              <div key={h} className="w-7 text-center text-xs text-slate-600 font-medium">{h}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="space-y-1">
            {DAYS.map((day, di) => (
              <div key={day} className="flex items-center gap-1">
                <div className="w-8 text-xs text-slate-500 font-medium text-right pr-2">{day}</div>
                {RAW[di].map((val, hi) => {
                  const { bg } = intensityColor(val);
                  const isHovered = hovered?.day === di && hovered?.hour === hi;
                  return (
                    <div
                      key={hi}
                      className={`w-7 h-7 rounded-sm cursor-pointer transition-all duration-100 ${bg} ${
                        isHovered ? 'ring-2 ring-white/30 scale-110' : 'hover:ring-1 hover:ring-white/20'
                      }`}
                      onMouseEnter={() => setHovered({ day: di, hour: hi })}
                      onMouseLeave={() => setHovered(null)}
                      title={`${day} ${HOURS[hi]}: ${val} orders`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 ml-10">
            <span className="text-xs text-slate-600">Low</span>
            {['bg-slate-800/40','bg-indigo-900/60','bg-indigo-700/70','bg-indigo-600','bg-indigo-500','bg-violet-400','bg-violet-300'].map((bg, i) => (
              <div key={i} className={`w-4 h-4 rounded-sm ${bg}`} />
            ))}
            <span className="text-xs text-slate-600">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
