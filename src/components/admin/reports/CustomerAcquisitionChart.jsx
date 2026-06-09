'use client';

import { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function generateData(dateRange) {
  const configs = {
    '7d': {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      new: [12, 18, 9, 21, 24, 32, 15],
      returning: [28, 34, 22, 41, 48, 56, 38],
    },
    '30d': {
      labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
      new: Array.from({ length: 30 }, () => Math.floor(8 + Math.random() * 25)),
      returning: Array.from({ length: 30 }, () => Math.floor(20 + Math.random() * 50)),
    },
    '90d': {
      labels: ['Jan W1','Jan W2','Jan W3','Jan W4','Feb W1','Feb W2','Feb W3','Feb W4','Mar W1','Mar W2','Mar W3','Mar W4','Apr W1'],
      new: [88,94,82,101,96,112,105,128,118,134,142,156,131],
      returning: [210,225,198,248,232,268,254,308,284,322,340,372,315],
    },
    '1y': {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      new: [342,389,418,371,503,467,448,512,488,534,580,621],
      returning: [842,918,984,872,1180,1098,1056,1204,1148,1256,1364,1460],
    },
  };
  const c = configs[dateRange] || configs['30d'];
  return c.labels.map((label, i) => ({
    label,
    new: c.new[i] || 0,
    returning: c.returning[i] || 0,
    retention: Math.round((c.returning[i] / (c.returning[i] + c.new[i])) * 100) || 0,
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 px-4 py-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}{p.dataKey === 'retention' ? '%' : ''}</span>
        </div>
      ))}
    </div>
  );
};

export default function CustomerAcquisitionChart({ dateRange, tall }) {
  const data = useMemo(() => generateData(dateRange), [dateRange]);
  const height = tall ? 360 : 260;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Customer Acquisition</h3>
          <p className="text-xs text-slate-500 mt-0.5">New vs returning customers with retention rate</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-indigo-500" />
            <span className="text-slate-400">New</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-emerald-500" />
            <span className="text-slate-400">Returning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-px bg-amber-400 inline-block" />
            <span className="text-slate-400">Retention %</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 4, right: 30, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={dateRange === '30d' ? 4 : 0}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
            domain={[0, 100]}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <Bar yAxisId="left" dataKey="new" name="New" fill="#6366f1" radius={[2, 2, 0, 0]} maxBarSize={16} />
          <Bar yAxisId="left" dataKey="returning" name="Returning" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={16} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="retention"
            name="Retention"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
