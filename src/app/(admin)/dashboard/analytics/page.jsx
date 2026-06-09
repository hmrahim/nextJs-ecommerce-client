'use client';
import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import KpiCard from '@/components/admin/analytics/KpiCard';
import RevenueAreaChart from '@/components/admin/analytics/RevenueAreaChart';
import FunnelChart from '@/components/admin/analytics/FunnelChart';
import DonutChart from '@/components/admin/analytics/DonutChart';
import CustomerGrowthChart from '@/components/admin/analytics/CustomerGrowthChart';
import CategoryShareChart from '@/components/admin/analytics/CategoryShareChart';
import TopProductsTable from '@/components/admin/analytics/TopProductsTable';
import CouponStatsTable from '@/components/admin/analytics/CouponStatsTable';
import AnalyticsCard from '@/components/admin/analytics/AnalyticsCard';

const RANGES = [
  { label: '7D',  value: '7d'  },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y',  value: '1y'  },
];

function Skeleton({ h = 20, w = '100%', r = 8 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite linear',
    }} />
  );
}

function IconRevenue() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconOrders() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}
function IconCustomers() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IconConv() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
function IconAOV() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
function IconReturn() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}
function IconProducts() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const { data, loading } = useAnalytics(range);

  const o = data?.overview;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @media (max-width: 900px) {
          .analytics-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .analytics-mid-grid { grid-template-columns: 1fr !important; }
          .analytics-bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .analytics-kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: '#fff' }}>
            Analytics
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--adm-muted)' }}>
            Revenue, orders, customers &amp; funnel — full store intelligence.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', gap: 2,
            background: 'var(--adm-surface)', border: '1px solid var(--adm-border)',
            borderRadius: 10, padding: 3,
          }}>
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                style={{
                  padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif',
                  background: range === r.value
                    ? 'linear-gradient(135deg, rgba(108,99,255,0.8), rgba(167,139,250,0.6))'
                    : 'transparent',
                  color: range === r.value ? '#fff' : 'var(--adm-muted)',
                  transition: 'all 0.2s',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 10, border: '1px solid var(--adm-border)',
              background: 'var(--adm-surface)', color: 'var(--adm-text)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'DM Sans,sans-serif',
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div
        className="analytics-kpi-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}
      >
        {loading
          ? Array(8).fill(0).map((_, i) => (
            <div key={i} style={{
              background: 'var(--adm-surface)', border: '1px solid var(--adm-border)',
              borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <Skeleton h={12} w="60%" />
              <Skeleton h={28} w="75%" />
              <Skeleton h={10} w="50%" />
            </div>
          ))
          : o && (
            <>
              <KpiCard title="Total Revenue"    value={o.totalRevenue}    change={o.revenueChange}    type="currency" icon={<IconRevenue />}  accent />
              <KpiCard title="Total Orders"     value={o.totalOrders}     change={o.ordersChange}     type="number"   icon={<IconOrders />} />
              <KpiCard title="Customers"        value={o.totalCustomers}  change={o.customersChange}  type="number"   icon={<IconCustomers />} />
              <KpiCard title="Conversion Rate"  value={o.conversionRate}  change={o.conversionChange} type="percent"  icon={<IconConv />} />
              <KpiCard title="Avg. Order Value" value={o.avgOrderValue}   change={o.aovChange}        type="currency" icon={<IconAOV />} />
              <KpiCard title="Active Products"  value={o.activeProducts}  change={0.8}                type="number"   icon={<IconProducts />} />
              <KpiCard title="Return Rate"      value={o.returnRate}      change={o.returnChange}     type="percent"  icon={<IconReturn />} />
              <KpiCard title="Refund Rate"      value={o.refundRate}      change={o.refundChange}     type="percent"  icon={<IconReturn />} />
            </>
          )
        }
      </div>

      {/* Revenue Chart */}
      <AnalyticsCard
        title="Revenue Over Time"
        subtitle="Daily revenue for selected period — hover to inspect data points"
        action={
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
            borderRadius: 8, padding: '4px 10px',
            fontSize: 12, fontWeight: 600, color: '#a78bfa',
          }}>
            <div style={{ width: 8, height: 3, background: 'linear-gradient(90deg, #6c63ff, #a78bfa)', borderRadius: 2 }} />
            Revenue
          </div>
        }
      >
        {loading
          ? <Skeleton h={240} r={10} />
          : <RevenueAreaChart data={data?.revenue ?? []} height={240} />
        }
      </AnalyticsCard>

      {/* Funnel + Donut */}
      <div
        className="analytics-mid-grid"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
      >
        <AnalyticsCard title="Conversion Funnel" subtitle="Visitor to purchase drop-off analysis">
          {loading
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{Array(5).fill(0).map((_, i) => <Skeleton key={i} h={32} r={8} />)}</div>
            : <FunnelChart data={data?.funnel ?? []} />
          }
        </AnalyticsCard>

        <AnalyticsCard title="Orders by Status" subtitle="Current distribution of all orders">
          {loading
            ? <Skeleton h={180} r={10} />
            : <DonutChart data={data?.ordersByStatus ?? []} />
          }
        </AnalyticsCard>
      </div>

      {/* Customer Growth */}
      <AnalyticsCard
        title="New Customer Acquisition"
        subtitle="New registrations per day / week / month based on selected range"
        action={
          loading ? null : (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: '#fff' }}>
                +{data?.customerGrowth?.reduce((s, d) => s + d.new, 0)?.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--adm-muted)' }}>new this period</div>
            </div>
          )
        }
      >
        {loading
          ? <Skeleton h={140} r={10} />
          : <CustomerGrowthChart data={data?.customerGrowth ?? []} height={140} />
        }
      </AnalyticsCard>

      {/* Top Products + Category Share */}
      <div
        className="analytics-bottom-grid"
        style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14 }}
      >
        <AnalyticsCard title="Top Products" subtitle="Best performers by revenue this period">
          {loading
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{Array(6).fill(0).map((_, i) => <Skeleton key={i} h={40} r={8} />)}</div>
            : <TopProductsTable data={data?.topProducts ?? []} />
          }
        </AnalyticsCard>

        <AnalyticsCard title="Revenue by Category" subtitle="Share of total revenue per category">
          {loading
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{Array(5).fill(0).map((_, i) => <Skeleton key={i} h={36} r={8} />)}</div>
            : <CategoryShareChart data={data?.topCategories ?? []} />
          }
        </AnalyticsCard>
      </div>

      {/* Coupon Performance */}
      <AnalyticsCard
        title="Coupon & Promo Performance"
        subtitle="Top coupons by usage — discount given vs. revenue driven"
      >
        {loading
          ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{Array(5).fill(0).map((_, i) => <Skeleton key={i} h={40} r={8} />)}</div>
          : <CouponStatsTable data={data?.couponStats ?? []} />
        }
      </AnalyticsCard>

      {/* Low stock alert */}
      {!loading && o?.lowStockCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(251,146,60,0.08)',
          border: '1px solid rgba(251,146,60,0.25)',
          borderRadius: 12, padding: '12px 18px',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'rgba(251,146,60,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" fill="none" stroke="#fb923c" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fb923c' }}>
              {o.lowStockCount} products are running low on stock
            </div>
            <div style={{ fontSize: 12, color: 'var(--adm-muted)', marginTop: 2 }}>
              Review inventory levels to avoid lost sales
            </div>
          </div>
          <a href="/dashboard/inventory" style={{
            marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#fb923c',
            textDecoration: 'none', flexShrink: 0,
            background: 'rgba(251,146,60,0.1)',
            border: '1px solid rgba(251,146,60,0.25)',
            borderRadius: 8, padding: '5px 14px',
          }}>
            View Inventory
          </a>
        </div>
      )}
    </div>
  );
}
