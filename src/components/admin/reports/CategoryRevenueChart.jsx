'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORIES = [
  { name: 'Electronics',    value: 48200, color: '#6366f1' },
  { name: 'Clothing',       value: 31400, color: '#10b981' },
  { name: 'Home & Living',  value: 22800, color: '#f59e0b' },
  { name: 'Sports',         value: 18600, color: '#a78bfa' },
  { name: 'Beauty',         value: 14200, color: '#06b6d4' },
  { name: 'Books',          value: 9100,  color: '#f43f5e' },
];

const total = CATEGORIES.reduce((s, c) => s + c.value, 0);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-xl">
      <p className="text-white font-semibold">{d.name}</p>
      <p className="text-slate-300 font-mono mt-0.5">${d.value.toLocaleString()}</p>
      <p className="text-slate-500">{((d.value / total) * 100).toFixed(1)}% of total</p>
    </div>
  );
};

export default function CategoryRevenueChart() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 h-full">
      <h3 className="text-sm font-semibold text-white mb-4">Revenue by Category</h3>

      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={CATEGORIES}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={78}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {CATEGORIES.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-base font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              ${(total / 1000).toFixed(1)}k
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-2">
        {CATEGORIES.map((c, i) => (
          <div
            key={c.name}
            className={`flex items-center justify-between text-xs transition-opacity duration-150 ${
              activeIndex !== null && activeIndex !== i ? 'opacity-40' : 'opacity-100'
            }`}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
              <span className="text-slate-300">{c.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500">{((c.value / total) * 100).toFixed(0)}%</span>
              <span className="text-slate-300 font-mono">${(c.value / 1000).toFixed(1)}k</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
