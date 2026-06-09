'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function generateRevData(dateRange) {
  const configs = {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      base:  [5800, 6400, 4900, 7200, 8100, 9400, 6700],
      prev:  [5200, 5900, 4400, 6600, 7300, 8100, 5900],
    },
    '30d': {
      labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
      base:  Array.from({ length: 30 }, () => Math.floor(4000 + Math.random() * 5000)),
      prev:  Array.from({ length: 30 }, () => Math.floor(3500 + Math.random() * 4500)),
    },
    '90d': {
      labels: ['Jan W1','Jan W2','Jan W3','Jan W4','Feb W1','Feb W2','Feb W3','Feb W4','Mar W1','Mar W2','Mar W3','Mar W4','Apr W1'],
      base:  [38000,42000,39000,44000,41000,47000,45000,52000,49000,55000,58000,62000,54000],
      prev:  [32000,36000,33000,38000,35000,40000,39000,45000,42000,48000,50000,54000,47000],
    },
    '1y': {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      base:  [142000,158000,171000,164000,182000,195000,188000,210000,198000,215000,230000,245000],
      prev:  [120000,134000,145000,138000,155000,164000,159000,178000,167000,181000,195000,208000],
    },
  };
  const c = configs[dateRange] || configs['30d'];
  return c.labels.map((label, i) => ({
    label,
    revenue: c.base[i] || 0,
    prevRevenue: c.prev[i] || 0,
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 backdrop-blur px-4 py-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-semibold font-mono">
            ${(p.value / 1000).toFixed(1)}k
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RevenueReportChart({ dateRange, compareEnabled, tall }) {
  const [metric, setMetric] = useState('revenue');
  const data = useMemo(() => generateRevData(dateRange), [dateRange]);
  const height = tall ? 360 : 260;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Revenue Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {compareEnabled ? 'Current vs previous period' : 'Total revenue over time'}
          </p>
        </div>
        <div className="flex gap-1">
          {['revenue', 'orders'].map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                metric === m
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={dateRange === '30d' ? 4 : 0}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} />
          {compareEnabled && (
            <Area
              type="monotone"
              dataKey="prevRevenue"
              name="Prev Period"
              stroke="#a78bfa"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              fill="url(#prevGrad)"
              dot={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#revGrad)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: '#6366f1' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
