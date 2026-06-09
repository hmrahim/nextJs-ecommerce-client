'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

function generateData(dateRange) {
  const configs = {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      orders: [42, 58, 37, 64, 71, 88, 54],
    },
    '30d': {
      labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
      orders: Array.from({ length: 30 }, () => Math.floor(30 + Math.random() * 80)),
    },
    '90d': {
      labels: ['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6','Wk7','Wk8','Wk9','Wk10','Wk11','Wk12','Wk13'],
      orders: [280,310,295,340,315,370,355,410,388,430,460,490,420],
    },
    '1y': {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      orders: [1050,1180,1280,1220,1360,1450,1400,1560,1480,1600,1710,1820],
    },
  };
  const c = configs[dateRange] || configs['30d'];
  return c.labels.map((label, i) => ({ label, orders: c.orders[i] || 0 }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 px-4 py-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      <p className="text-white font-semibold">
        {payload[0].value.toLocaleString()} orders
      </p>
    </div>
  );
};

export default function OrdersReportChart({ dateRange, tall }) {
  const data = useMemo(() => generateData(dateRange), [dateRange]);
  const maxVal = Math.max(...data.map(d => d.orders));
  const height = tall ? 360 : 260;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Order Volume</h3>
          <p className="text-xs text-slate-500 mt-0.5">Number of orders placed</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            {data.reduce((s, d) => s + d.orders, 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">total orders</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="30%">
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
            width={32}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="orders" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.orders === maxVal ? '#6366f1' : '#334155'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
