'use client';

import { useMemo } from 'react';

function generateKPIs(dateRange, compareEnabled) {
  const base = {
    '7d':  { revenue: 42380,  orders: 318,  customers: 94,  aov: 133.27, refunds: 12, convRate: 3.8 },
    '30d': { revenue: 184200, orders: 1382, customers: 412, aov: 133.28, refunds: 48, convRate: 4.1 },
    '90d': { revenue: 521800, orders: 3910, customers: 1180, aov: 133.45, refunds: 143, convRate: 3.9 },
    '1y':  { revenue: 2148000, orders: 16100, customers: 4870, aov: 133.41, refunds: 580, convRate: 4.2 },
  };
  const prev = {
    '7d':  { revenue: 38100,  orders: 281,  customers: 78,  aov: 135.59, refunds: 9,  convRate: 3.4 },
    '30d': { revenue: 161400, orders: 1208, customers: 360, aov: 133.61, refunds: 41, convRate: 3.7 },
    '90d': { revenue: 478200, orders: 3594, customers: 1060, aov: 133.06, refunds: 128, convRate: 3.6 },
    '1y':  { revenue: 1840000, orders: 14200, customers: 4120, aov: 129.58, refunds: 510, convRate: 3.9 },
  };

  const cur = base[dateRange] || base['30d'];
  const prv = prev[dateRange] || prev['30d'];

  const pct = (a, b) => (((a - b) / b) * 100).toFixed(1);

  return [
    {
      label: 'Total Revenue',
      value: `$${(cur.revenue / 1000).toFixed(1)}k`,
      raw: cur.revenue,
      change: parseFloat(pct(cur.revenue, prv.revenue)),
      prev: `$${(prv.revenue / 1000).toFixed(1)}k`,
      icon: '💰',
      accent: '#6366f1',
      spark: [65, 72, 58, 80, 74, 88, 92, 85, 96, 100],
    },
    {
      label: 'Total Orders',
      value: cur.orders.toLocaleString(),
      raw: cur.orders,
      change: parseFloat(pct(cur.orders, prv.orders)),
      prev: prv.orders.toLocaleString(),
      icon: '📦',
      accent: '#10b981',
      spark: [55, 60, 52, 70, 65, 75, 80, 72, 88, 100],
    },
    {
      label: 'New Customers',
      value: cur.customers.toLocaleString(),
      raw: cur.customers,
      change: parseFloat(pct(cur.customers, prv.customers)),
      prev: prv.customers.toLocaleString(),
      icon: '👤',
      accent: '#f59e0b',
      spark: [40, 55, 48, 60, 58, 72, 66, 80, 90, 100],
    },
    {
      label: 'Avg. Order Value',
      value: `$${cur.aov.toFixed(2)}`,
      raw: cur.aov,
      change: parseFloat(pct(cur.aov, prv.aov)),
      prev: `$${prv.aov.toFixed(2)}`,
      icon: '🧾',
      accent: '#a78bfa',
      spark: [90, 88, 92, 87, 95, 91, 94, 89, 97, 100],
    },
    {
      label: 'Refund Rate',
      value: `${((cur.refunds / cur.orders) * 100).toFixed(1)}%`,
      raw: cur.refunds,
      change: -parseFloat(pct(cur.refunds / cur.orders, prv.refunds / prv.orders)),
      prev: `${((prv.refunds / prv.orders) * 100).toFixed(1)}%`,
      icon: '↩',
      accent: '#f43f5e',
      invertGood: true,
      spark: [70, 75, 68, 72, 65, 60, 58, 62, 55, 50],
    },
    {
      label: 'Conv. Rate',
      value: `${cur.convRate}%`,
      raw: cur.convRate,
      change: parseFloat(pct(cur.convRate, prv.convRate)),
      prev: `${prv.convRate}%`,
      icon: '⚡',
      accent: '#06b6d4',
      spark: [60, 65, 58, 72, 68, 75, 70, 80, 85, 100],
    },
  ];
}

function MiniSpark({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 60, h = 24, pad = 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((1 - (v - min) / range) * (h - pad * 2));
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

export default function ReportKPIStrip({ dateRange, compareEnabled }) {
  const kpis = useMemo(() => generateKPIs(dateRange, compareEnabled), [dateRange, compareEnabled]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map(k => {
        const positive = k.invertGood ? k.change > 0 : k.change > 0;
        const changeColor = positive ? 'text-emerald-400' : 'text-rose-400';
        const changeBg   = positive ? 'bg-emerald-500/10' : 'bg-rose-500/10';

        return (
          <div
            key={k.label}
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col gap-3 hover:border-slate-700 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{k.label}</span>
              <MiniSpark data={k.spark} color={k.accent} />
            </div>

            <div>
              <div className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                {k.value}
              </div>
              {compareEnabled && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${changeBg} ${changeColor}`}>
                    {k.change >= 0 ? '+' : ''}{k.change}%
                  </span>
                  <span className="text-xs text-slate-600">vs {k.prev}</span>
                </div>
              )}
              {!compareEnabled && (
                <div className={`text-xs font-semibold mt-1 ${changeColor}`}>
                  {k.change >= 0 ? '↑' : '↓'} {Math.abs(k.change)}% vs prior period
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
