'use client';
import { useAnalytics } from '@/hooks/useAnalytics';
import Link from 'next/link';

function StatMini({ label, value, change, color = '#6c63ff' }) {
  const pos = change >= 0;
  return (
    <div style={{
      background: 'var(--adm-surface2)', border: '1px solid var(--adm-border)',
      borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: '#fff' }}>{value}</div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11.5, fontWeight: 600,
        color: pos ? '#4ade80' : '#f87171',
        background: pos ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
        border: `1px solid ${pos ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
        borderRadius: 20, padding: '2px 8px', width: 'fit-content',
      }}>
        {pos ? '▲' : '▼'} {Math.abs(change).toFixed(1)}% vs last period
      </div>
    </div>
  );
}

function MiniBarChart({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.revenue));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
      {data.map((d, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: '3px 3px 0 0',
          height: `${Math.max(8, (d.revenue / max) * 100)}%`,
          background: i === data.length - 1
            ? 'linear-gradient(180deg, #6c63ff, #a78bfa)'
            : 'rgba(108,99,255,0.25)',
          transition: 'height 0.4s ease',
        }} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading } = useAnalytics('30d');
  const o = data?.overview;

  const recentOrders = [
    { id: '#ORD-4821', customer: 'Sarah K.', amount: '$128.00', status: 'Delivered', statusColor: '#22c55e' },
    { id: '#ORD-4820', customer: 'James M.', amount: '$74.50',  status: 'Shipped',   statusColor: '#3b82f6' },
    { id: '#ORD-4819', customer: 'Layla A.', amount: '$320.00', status: 'Processing',statusColor: '#f59e0b' },
    { id: '#ORD-4818', customer: 'Omar R.',  amount: '$55.00',  status: 'Pending',   statusColor: '#94a3b8' },
    { id: '#ORD-4817', customer: 'Nour H.',  amount: '$210.00', status: 'Delivered', statusColor: '#22c55e' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: '#fff' }}>
            Dashboard
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--adm-muted)' }}>
            Store overview — last 30 days
          </p>
        </div>
        <Link href="/dashboard/analytics" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 16px', borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(108,99,255,0.7), rgba(167,139,250,0.5))',
          border: '1px solid rgba(108,99,255,0.4)',
          color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none',
        }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Full Analytics
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ background: 'var(--adm-surface2)', border: '1px solid var(--adm-border)', borderRadius: 12, padding: '16px 18px', height: 110 }} />
          ))
        ) : o && (
          <>
            <StatMini label="Revenue"         value={`$${(o.totalRevenue / 1000).toFixed(1)}k`} change={o.revenueChange} />
            <StatMini label="Orders"          value={o.totalOrders.toLocaleString()}             change={o.ordersChange} />
            <StatMini label="Customers"       value={o.totalCustomers.toLocaleString()}          change={o.customersChange} />
            <StatMini label="Conversion"      value={`${o.conversionRate}%`}                     change={o.conversionChange} />
          </>
        )}
      </div>

      {/* Revenue sparkline + Recent orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 14 }}>
        {/* Revenue mini chart */}
        <div style={{ background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: '#fff' }}>Revenue Trend</div>
              <div style={{ fontSize: 11.5, color: 'var(--adm-muted)', marginTop: 2 }}>Last 30 days</div>
            </div>
            {o && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'Syne,sans-serif' }}>
                  ${(o.totalRevenue / 1000).toFixed(1)}k
                </div>
                <div style={{ fontSize: 11, color: '#4ade80' }}>+{o.revenueChange}%</div>
              </div>
            )}
          </div>
          <MiniBarChart data={data?.revenue?.slice(-14)} />
          <Link href="/dashboard/analytics" style={{
            display: 'block', marginTop: 14, textAlign: 'center', fontSize: 12,
            color: '#a78bfa', textDecoration: 'none', fontWeight: 500,
          }}>
            View detailed analytics →
          </Link>
        </div>

        {/* Recent Orders */}
        <div style={{ background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: '#fff' }}>Recent Orders</div>
              <div style={{ fontSize: 11.5, color: 'var(--adm-muted)', marginTop: 2 }}>Latest activity</div>
            </div>
            <Link href="/dashboard/orders" style={{
              fontSize: 12, color: '#a78bfa', textDecoration: 'none', fontWeight: 500,
            }}>View all →</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Order', 'Customer', 'Amount', 'Status'].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i > 1 ? 'right' : 'left',
                    padding: '0 8px 10px', fontSize: 10, fontWeight: 600,
                    color: 'var(--adm-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: '1px solid var(--adm-border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '9px 8px', color: '#a78bfa', fontWeight: 600, fontSize: 12.5 }}>{order.id}</td>
                  <td style={{ padding: '9px 8px', color: 'var(--adm-text)' }}>{order.customer}</td>
                  <td style={{ padding: '9px 8px', textAlign: 'right', fontWeight: 600, color: '#fff' }}>{order.amount}</td>
                  <td style={{ padding: '9px 8px', textAlign: 'right' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: order.statusColor,
                      background: `${order.statusColor}18`,
                      border: `1px solid ${order.statusColor}33`,
                      borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap',
                    }}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {[
          { label: 'Manage Orders',    href: '/dashboard/orders',    icon: '📦' },
          { label: 'Products',         href: '/dashboard/products',  icon: '🛍️' },
          { label: 'Customers',        href: '/dashboard/customers', icon: '👥' },
          { label: 'Full Analytics',   href: '/dashboard/analytics', icon: '📊' },
          { label: 'Coupons',          href: '/dashboard/coupons',   icon: '🎫' },
          { label: 'Inventory',        href: '/dashboard/inventory', icon: '🏭' },
        ].map(q => (
          <Link key={q.href} href={q.href} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--adm-surface)', border: '1px solid var(--adm-border)',
            borderRadius: 11, padding: '12px 14px', textDecoration: 'none',
            color: 'var(--adm-text)', fontSize: 13, fontWeight: 500,
            transition: 'border-color 0.2s, background 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)'; e.currentTarget.style.background = 'rgba(108,99,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--adm-border)'; e.currentTarget.style.background = 'var(--adm-surface)'; }}
          >
            <span style={{ fontSize: 18 }}>{q.icon}</span>
            {q.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
