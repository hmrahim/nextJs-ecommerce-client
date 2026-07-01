'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { orderService } from '@/services/orderService';
import { analyticsService } from '@/services/analyticsService';
import notificationService from '@/services/notificationService';
import { useOrderSocket } from '@/hooks/useOrderSocket';
import toast from 'react-hot-toast';

/* ── Color maps ─────────────────────────────────────────── */
const STATUS_CFG = {
  pending:    { label: 'Pending',    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  confirmed:  { label: 'Confirmed',  cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  processing: { label: 'Processing', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  shipped:    { label: 'Shipped',    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  delivered:  { label: 'Delivered',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  refunded:   { label: 'Refunded',   cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const COLOR_MAP = {
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', bar: '#6c63ff' },
  sky:    { bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    text: 'text-sky-400',    bar: '#38bdf8' },
  emerald:{ bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',text: 'text-emerald-400',bar: '#34d399' },
  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400',  bar: '#fbbf24' },
  pink:   { bg: 'bg-pink-500/10',   border: 'border-pink-500/20',   text: 'text-pink-400',   bar: '#f472b6' },
};

const STATUS_COLORS = {
  'Delivered': '#34d399',
  'Shipped': '#38bdf8',
  'Processing': '#6c63ff',
  'Confirmed': '#818cf8',
  'Pending': '#fbbf24',
  'Cancelled': '#ef4444',
  'Refunded': '#f97316'
};

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} d ago`;
  return date.toLocaleDateString();
}

/* ── Revenue Chart ─────────────────────────────────────── */
function RevenueChart({ data = [] }) {
  const [hovered, setHovered] = useState(null);
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[180px] text-slate-500 text-xs">No chart data available</div>;
  }
  const maxRev = Math.max(1, ...data.map(d => d.revenue));
  const W = 700, H = 180, PAD = { t: 10, r: 20, b: 30, l: 10 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const pts = data.map((d, i) => ({
    x: PAD.l + (i / (data.length - 1)) * chartW,
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
              x={p.x - chartW / data.length / 2}
              y={PAD.t} width={chartW / data.length} height={chartH}
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
                SAR {(p.revenue / 1000).toFixed(0)}k
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
function OrdersBar({ data = [] }) {
  const total = data.reduce((s, x) => s + x.count, 0);
  if (total === 0) {
    return <div className="text-slate-500 text-xs py-4">No order status data available</div>;
  }
  return (
    <div className="space-y-3">
      <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
        {data.map(s => (
          <div key={s.label} title={`${s.label}: ${s.count}`}
            style={{ width: `${(s.count / total) * 100}%`, background: s.color }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {data.map(s => (
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


const INITIAL_STATS = [
  {
    key: 'revenue',
    label: 'Total Revenue',
    value: 'SAR 0',
    change: '0%',
    up: true,
    sub: 'vs last period',
    color: 'violet',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    key: 'orders',
    label: 'Total Orders',
    value: '0',
    change: '0%',
    up: true,
    sub: 'vs last period',
    color: 'sky',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    ),
  },
  {
    key: 'customers',
    label: 'New Customers',
    value: '0',
    change: '0%',
    up: true,
    sub: 'vs last period',
    color: 'emerald',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
  {
    key: 'pending',
    label: 'Pending Orders',
    value: '0',
    change: '0',
    up: false,
    sub: 'needs attention',
    color: 'amber',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
];

/* ── Main Page ─────────────────────────────────────────── */
export default function DashboardPage() {
  const today = new Date().toLocaleDateString('en-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentYear = new Date().getFullYear();

  const [stats, setStats] = useState(INITIAL_STATS);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [usingDummy, setUsingDummy] = useState(false);

  const totalStatusCount = useMemo(() => orderStatuses.reduce((acc, curr) => acc + curr.count, 0), [orderStatuses]);
  const deliveredCount = useMemo(() => orderStatuses.find(s => s.label === 'Delivered')?.count || 0, [orderStatuses]);
  const fulfillmentRate = useMemo(() => totalStatusCount > 0 ? ((deliveredCount / totalStatusCount) * 100).toFixed(1) : '0.0', [totalStatusCount, deliveredCount]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [
        statsRes,
        ordersRes,
        overviewRes,
        topProductsRes,
        ordersByStatusRes,
        revenueRes,
        notifRes
      ] = await Promise.all([
        orderService.adminStats(),
        orderService.adminGetAll({ page: 1, limit: 6, sort: 'placedAt:desc' }),
        analyticsService.getOverview({ range: '30d' }),
        analyticsService.getTopProducts({ limit: 5 }),
        analyticsService.getOrdersByStatus({ range: '30d' }),
        analyticsService.getRevenue({ range: '1y' }),
        notificationService.getAdminNotifications()
      ]);

      // 1. Overview KPIs
      const o = overviewRes?.data?.data;
      const s = statsRes?.data?.data || statsRes?.data;
      if (o) {
        setStats([
          {
            key: 'revenue',
            label: 'Total Revenue',
            value: `SAR ${Number(o.totalRevenue).toLocaleString('en-SA')}`,
            change: `${o.revenueChange >= 0 ? '+' : ''}${o.revenueChange}%`,
            up: o.revenueChange >= 0,
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
            value: Number(o.totalOrders).toLocaleString('en-SA'),
            change: `${o.ordersChange >= 0 ? '+' : ''}${o.ordersChange}%`,
            up: o.ordersChange >= 0,
            sub: 'vs last month',
            color: 'sky',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            ),
          },
          {
            key: 'customers',
            label: 'Total Customers',
            value: Number(o.totalCustomers).toLocaleString('en-SA'),
            change: `${o.customersChange >= 0 ? '+' : ''}${o.customersChange}%`,
            up: o.customersChange >= 0,
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
            value: String(s?.pending ?? 0),
            change: s?.pending > 0 ? `+${s.pending}` : '0',
            up: s?.pending > 0,
            sub: 'needs attention',
            color: 'amber',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            ),
          },
        ]);
      }

      // 2. Recent Orders
      const orders = ordersRes?.data?.orders || ordersRes?.data?.data || [];
      if (Array.isArray(orders)) {
        setRecentOrders(orders.map(o => ({
          id: o.orderNumber || o._id,
          customer: o.customerName || o.customer?.name || 'Customer',
          amount: `SAR ${Number(o.totalAmount || 0).toLocaleString('en-SA')}`,
          status: o.status || 'pending',
          time: formatTimeAgo(o.placedAt || o.createdAt),
          items: o.items?.length || 0,
        })));
      }

      // 3. Chart Data
      const revenueData = revenueRes?.data?.data || [];
      if (Array.isArray(revenueData) && revenueData.length) {
        setChartData(revenueData.map(r => ({
          month: r.label,
          revenue: r.revenue,
          orders: r.orders
        })));
      }

      // 4. Top Products
      const topProductsData = topProductsRes?.data?.data || [];
      if (Array.isArray(topProductsData)) {
        setTopProducts(topProductsData.map(p => ({
          name: p.name,
          category: p.sku !== 'default' ? `SKU: ${p.sku}` : 'General',
          sold: p.orders,
          revenue: `SAR ${Number(p.revenue).toLocaleString('en-SA')}`,
          stock: '—',
          trend: `${p.trend >= 0 ? '+' : ''}${p.trend}%`
        })));
      }

      // 5. Order Status Breakdown
      const statusData = ordersByStatusRes?.data?.data || [];
      if (Array.isArray(statusData)) {
        setOrderStatuses(statusData.map(s => ({
          label: s.status,
          count: s.count,
          color: STATUS_COLORS[s.status] || s.color || '#94a3b8'
        })));
      }

      // 6. Live Activity Feed (from backend notifications)
      const rawNotifs = notifRes?.notifications || [];
      if (Array.isArray(rawNotifs)) {
        setActivity(rawNotifs.slice(0, 6).map(n => {
          let color = 'violet';
          if (n.type === 'user') color = 'sky';
          else if (n.type === 'stock') color = 'amber';
          else if (n.type === 'payment' || n.type === 'review') color = 'emerald';

          return {
            type: n.type,
            msg: n.message,
            time: formatTimeAgo(n.createdAt),
            color: color
          };
        }));
      }

      setUsingDummy(false);
    } catch (err) {
      console.error('[fetchDashboardData]', err);
      setUsingDummy(true);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // ── Realtime: new order if comes or order update If dashboard instantly refresh will be ──
  const handleOrderEvent = useCallback((type, payload) => {
    if (type === 'order_created') {
      toast.success(`New order received${payload?.orderNumber ? ` — ${payload.orderNumber}` : ''}`);
    }
    fetchDashboardData();
  }, [fetchDashboardData]);

  useOrderSocket(handleOrderEvent);

  return (
    <div className="space-y-6">

      {/* Demo notice */}
      {usingDummy && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Showing demo data — backend API not connected yet. Live updates will activate once connected.
        </div>
      )}

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
        {stats.map(s => {
          const c = COLOR_MAP[s.color] || COLOR_MAP.violet;
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
              <p className="text-xs text-slate-500 mt-0.5">Monthly revenue for {currentYear}</p>
            </div>
            <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full font-medium">
              {currentYear}
            </span>
          </div>
          <RevenueChart data={chartData} />
        </div>

        {/* Order breakdown */}
        <div className="rounded-xl border border-white/10 bg-[#111118] p-5 flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Order Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">All-time breakdown</p>
          </div>
          <OrdersBar data={orderStatuses} />
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Total Orders</span>
              <span className="text-sm font-bold text-white">{totalStatusCount.toLocaleString('en-SA')}</span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-slate-500">Fulfilment Rate</span>
              <span className="text-sm font-bold text-emerald-400">{fulfillmentRate}%</span>
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
            {recentOrders.length > 0 ? (
              recentOrders.map(o => {
                const s = STATUS_CFG[o.status] || STATUS_CFG.pending;
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
              })
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">No recent orders found</div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl border border-white/10 bg-[#111118] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Live Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time store events</p>
          </div>
          <div className="divide-y divide-white/5">
            {activity.length > 0 ? (
              activity.map((a, i) => {
                const c = COLOR_MAP[a.color] || COLOR_MAP.violet;
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
              })
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">No live activities found</div>
            )}
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
              {topProducts.length > 0 ? (
                topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-slate-600 text-xs">{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-5 py-3.5 font-medium text-white text-xs">{p.name}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{p.category}</td>
                    <td className="px-5 py-3.5 text-right text-white text-xs font-medium">{p.sold}</td>
                    <td className="px-5 py-3.5 text-right text-white text-xs font-semibold">{p.revenue}</td>
                    <td className="px-5 py-3.5 text-right text-xs">
                      <span className="text-slate-400">{p.stock}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs">
                      <span className={p.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}>
                        {p.trend}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 text-xs">No top products recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}