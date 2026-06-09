'use client';
import { useState } from 'react';
import Link from 'next/link';

/* ── Dummy Data ─────────────────────────────────────────── */
const STATS = [
  {
    key: 'revenue',
    label: 'Total Revenue',
    value: '৳4,82,350',
    change: '+18.4%',
    up: true,
    sub: 'vs last month',
    color: 'violet',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    key: 'orders',
    label: 'Total Orders',
    value: '1,284',
    change: '+9.2%',
    up: true,
    sub: 'vs last month',
    color: 'sky',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    ),
  },
  {
    key: 'customers',
    label: 'New Customers',
    value: '342',
    change: '+5.7%',
    up: true,
    sub: 'vs last month',
    color: 'emerald',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
  {
    key: 'pending',
    label: 'Pending Orders',
    value: '47',
    change: '-3',
    up: false,
    sub: 'needs attention',
    color: 'amber',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
];

const CHART_DATA = [
  { month: 'Jan', revenue: 28000, orders: 84 },
  { month: 'Feb', revenue: 35000, orders: 102 },
  { month: 'Mar', revenue: 31000, orders: 95 },
  { month: 'Apr', revenue: 42000, orders: 128 },
  { month: 'May', revenue: 38000, orders: 115 },
  { month: 'Jun', revenue: 55000, orders: 167 },
  { month: 'Jul', revenue: 48000, orders: 145 },
  { month: 'Aug', revenue: 62000, orders: 189 },
  { month: 'Sep', revenue: 58000, orders: 175 },
  { month: 'Oct', revenue: 71000, orders: 214 },
  { month: 'Nov', revenue: 82000, orders: 248 },
  { month: 'Dec', revenue: 96000, orders: 284 },
];

const RECENT_ORDERS = [
  { id: 'ORD-2841', customer: 'Rahim Uddin', amount: '৳1,250', status: 'pending', time: '2 min ago', items: 3 },
  { id: 'ORD-2840', customer: 'Nusrat Jahan', amount: '৳3,800', status: 'confirmed', time: '14 min ago', items: 1 },
  { id: 'ORD-2839', customer: 'Karim Hossain', amount: '৳720', status: 'processing', time: '1 hr ago', items: 2 },
  { id: 'ORD-2838', customer: 'Farida Begum', amount: '৳5,400', status: 'shipped', time: '3 hr ago', items: 4 },
  { id: 'ORD-2837', customer: 'Sohel Rana', amount: '৳980', status: 'delivered', time: '5 hr ago', items: 1 },
  { id: 'ORD-2836', customer: 'Mitu Akter', amount: '৳2,150', status: 'delivered', time: 'Yesterday', items: 2 },
];

const TOP_PRODUCTS = [
  { name: 'Jamdani Saree', category: 'Clothing', sold: 284, revenue: '৳2,84,000', stock: 42, trend: '+12%' },
  { name: 'Muslin Panjabi', category: 'Clothing', sold: 196, revenue: '৳98,000', stock: 18, trend: '+8%' },
  { name: 'Kantha Quilt', category: 'Home', sold: 143, revenue: '৳71,500', stock: 3, trend: '-2%' },
  { name: 'Nakshi Kantha Bag', category: 'Accessories', sold: 118, revenue: '৳35,400', stock: 27, trend: '+5%' },
  { name: 'Brass Ornament Set', category: 'Decor', sold: 97, revenue: '৳48,500', stock: 61, trend: '+15%' },
];

const ACTIVITY = [
  { type: 'order', msg: 'New order #ORD-2841 placed by Rahim Uddin', time: '2m ago', color: 'violet' },
  { type: 'user', msg: 'Farida Begum registered a new account', time: '18m ago', color: 'sky' },
  { type: 'stock', msg: 'Kantha Quilt low stock alert — 3 units left', time: '1h ago', color: 'amber' },
  { type: 'payment', msg: 'Payment confirmed for #ORD-2839 via bKash', time: '3h ago', color: 'emerald' },
  { type: 'review', msg: '5★ review on Jamdani Saree by a verified buyer', time: '5h ago', color: 'pink' },
  { type: 'coupon', msg: 'Coupon EID2024 used 48 times today', time: '6h ago', color: 'violet' },
];

/* ── Color maps ─────────────────────────────────────────── */
const STATUS_CFG = {
  pending:    { label: 'Pending',    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  confirmed:  { label: 'Confirmed',  cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  processing: { label: 'Processing', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  shipped:    { label: 'Shipped',    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  delivered:  { label: 'Delivered',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const COLOR_MAP = {
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', bar: '#6c63ff' },
  sky:    { bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    text: 'text-sky-400',    bar: '#38bdf8' },
  emerald:{ bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',text: 'text-emerald-400',bar: '#34d399' },
  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400',  bar: '#fbbf24' },
  pink:   { bg: 'bg-pink-500/10',   border: 'border-pink-500/20',   text: 'text-pink-400',   bar: '#f472b6' },
};

/* ── Revenue Chart ─────────────────────────────────────── */
function RevenueChart() {
  const [hovered, setHovered] = useState(null);
  const maxRev = Math.max(...CHART_DATA.map(d => d.revenue));
  const W = 700, H = 180, PAD = { t: 10, r: 20, b: 30, l: 10 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const pts = CHART_DATA.map((d, i) => ({
    x: PAD.l + (i / (CHART_DATA.length - 1)) * chartW,
    y: PAD.t + chartH - (d.revenue / maxRev) * chartH,
    ...d,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = pathD + ` L${pts[pts.length-1].x},${H - PAD.b} L${pts[0].x},${H - PAD.b} Z`;

  return (
    <div className="relative w-full" style={{ paddingBottom: '28%' }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6c63ff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6c63ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <line key={v}
            x1={PAD.l} y1={PAD.t + chartH * (1 - v)}
            x2={PAD.l + chartW} y2={PAD.t + chartH * (1 - v)}
            stroke="#1e1e2e" strokeWidth="1"
          />
        ))}
        {/* Area */}
        <path d={areaD} fill="url(#revGrad)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Points + hover */}
        {pts.map((p, i) => (
          <g key={i}
            onMouseEnter={() => setHovered(i)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={p.x - chartW / CHART_DATA.length / 2}
              y={PAD.t} width={chartW / CHART_DATA.length} height={chartH}
              fill="transparent"
            />
            <circle cx={p.x} cy={p.y} r={hovered === i ? 5 : 3}
              fill={hovered === i ? '#6c63ff' : '#111118'}
              stroke="#6c63ff" strokeWidth="2"
              style={{ transition: 'r 0.15s' }}
            />
          </g>
        ))}
        {/* X labels */}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={H - 4} textAnchor="middle"
            fontSize="10" fill="#475569" fontFamily="DM Sans, sans-serif">
            {p.month}
          </text>
        ))}
        {/* Tooltip */}
        {hovered !== null && (() => {
          const p = pts[hovered];
          const bx = Math.min(Math.max(p.x - 50, 0), W - 110);
          return (
            <g>
              <rect x={bx} y={p.y - 44} width={110} height={40} rx="6"
                fill="#16161f" stroke="#1e1e2e" strokeWidth="1" />
              <text x={bx + 55} y={p.y - 28} textAnchor="middle"
                fontSize="11" fill="#e2e8f0" fontFamily="DM Sans, sans-serif" fontWeight="600">
                ৳{(p.revenue / 1000).toFixed(0)}k
              </text>
              <text x={bx + 55} y={p.y - 14} textAnchor="middle"
                fontSize="9" fill="#64748b" fontFamily="DM Sans, sans-serif">
                {p.orders} orders
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

/* ── Order Bar ─────────────────────────────────────────── */
function OrdersBar() {
  const statuses = [
    { label: 'Delivered', count: 842, color: '#34d399' },
    { label: 'Shipped',   count: 198, color: '#38bdf8' },
    { label: 'Processing',count: 124, color: '#6c63ff' },
    { label: 'Confirmed', count: 73,  color: '#818cf8' },
    { label: 'Pending',   count: 47,  color: '#fbbf24' },
  ];
  const total = statuses.reduce((s, x) => s + x.count, 0);
  return (
    <div className="space-y-3">
      <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
        {statuses.map(s => (
          <div key={s.label} title={`${s.label}: ${s.count}`}
            style={{ width: `${(s.count / total) * 100}%`, background: s.color }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {statuses.map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-slate-400">{s.label}</span>
            <span className="text-xs text-white font-medium">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function DashboardPage() {
  const today = new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Good morning, Admin 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">{today} — Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/orders"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            View Orders
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => {
          const c = COLOR_MAP[s.color];
          return (
            <div key={s.key}
              className={`rounded-xl border ${c.border} ${c.bg} p-5 flex flex-col gap-3 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
                  <svg className={`w-4 h-4 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {s.icon}
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-xs font-semibold ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.change}
                  </span>
                  <span className="text-xs text-slate-500">{s.sub}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Revenue Chart + Order Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Chart */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#111118] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Revenue Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Monthly revenue for 2024</p>
            </div>
            <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full font-medium">
              2024
            </span>
          </div>
          <RevenueChart />
        </div>

        {/* Order breakdown */}
        <div className="rounded-xl border border-white/10 bg-[#111118] p-5 flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Order Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">All-time breakdown</p>
          </div>
          <OrdersBar />
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Total Orders</span>
              <span className="text-sm font-bold text-white">1,284</span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-slate-500">Fulfilment Rate</span>
              <span className="text-sm font-bold text-emerald-400">87.3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#111118] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
            <Link href="/dashboard/orders"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
              View all
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {RECENT_ORDERS.map(o => {
              const s = STATUS_CFG[o.status];
              return (
                <div key={o.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{o.id}</span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-400 truncate">{o.customer}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500">{o.items} items</span>
                      <span className="text-[10px] text-slate-600">·</span>
                      <span className="text-[10px] text-slate-500">{o.time}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-white flex-shrink-0">{o.amount}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${s.cls}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl border border-white/10 bg-[#111118] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Live Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time store events</p>
          </div>
          <div className="divide-y divide-white/5">
            {ACTIVITY.map((a, i) => {
              const c = COLOR_MAP[a.color];
              return (
                <div key={i} className="flex gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.text}`}
                    style={{ background: c.bar }} />
                  <div>
                    <p className="text-xs text-slate-300 leading-snug">{a.msg}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Top Products ── */}
      <div className="rounded-xl border border-white/10 bg-[#111118] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h2 className="text-sm font-semibold text-white">Top Products</h2>
            <p className="text-xs text-slate-500 mt-0.5">Best performing this month</p>
          </div>
          <Link href="/dashboard/products"
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
            View all
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Sold</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {TOP_PRODUCTS.map((p, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 text-slate-600 text-xs">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-5 py-3.5 font-medium text-white text-xs">{p.name}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{p.category}</td>
                  <td className="px-5 py-3.5 text-right text-white text-xs font-medium">{p.sold}</td>
                  <td className="px-5 py-3.5 text-right text-white text-xs font-semibold">{p.revenue}</td>
                  <td className="px-5 py-3.5 text-right text-xs">
                    <span className={p.stock <= 5 ? 'text-red-400 font-semibold' : 'text-slate-400'}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs">
                    <span className={p.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}>
                      {p.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}