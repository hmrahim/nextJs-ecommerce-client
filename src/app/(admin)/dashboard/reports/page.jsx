'use client';

import { useState } from 'react';
import ReportKPIStrip from '@/components/admin/reports/ReportKPIStrip';
import RevenueReportChart from '@/components/admin/reports/RevenueReportChart';
import OrdersReportChart from '@/components/admin/reports/OrdersReportChart';
import TopProductsReport from '@/components/admin/reports/TopProductsReport';
import CustomerAcquisitionChart from '@/components/admin/reports/CustomerAcquisitionChart';
import CategoryRevenueChart from '@/components/admin/reports/CategoryRevenueChart';
import SalesHeatmap from '@/components/admin/reports/SalesHeatmap';
import ReportExportPanel from '@/components/admin/reports/ReportExportPanel';
import ReportScheduler from '@/components/admin/reports/ReportScheduler';

const DATE_PRESETS = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This Year', value: '1y' },
];

const REPORT_TABS = [
  { id: 'overview',  label: 'Overview',   icon: '⬡' },
  { id: 'revenue',   label: 'Revenue',    icon: '↗' },
  { id: 'orders',    label: 'Orders',     icon: '◫' },
  { id: 'customers', label: 'Customers',  icon: '◎' },
  { id: 'products',  label: 'Products',   icon: '▦' },
  { id: 'export',    label: 'Export',     icon: '↓' },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [schedulerOpen, setSchedulerOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Analytics</span>
            <span className="w-1 h-1 rounded-full bg-indigo-500/50 inline-block" />
            <span className="text-xs text-slate-500">Live data</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Reports &amp; Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Full-spectrum business analytics — revenue, orders, customers, and product performance.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setCompareEnabled(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
              compareEnabled
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="w-3 h-3 rounded-sm border border-current inline-flex items-center justify-center">
              {compareEnabled && <span className="w-1.5 h-1.5 rounded-sm bg-current" />}
            </span>
            Compare periods
          </button>

          <button
            onClick={() => setSchedulerOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Schedule
          </button>

          <div className="flex items-center bg-slate-900/80 border border-slate-700/50 rounded-lg p-0.5 gap-0.5">
            {DATE_PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => setDateRange(p.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  dateRange === p.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ReportKPIStrip dateRange={dateRange} compareEnabled={compareEnabled} />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800">
        {REPORT_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-xs">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview'  && <OverviewTab  dateRange={dateRange} compareEnabled={compareEnabled} />}
      {activeTab === 'revenue'   && <RevenueTab   dateRange={dateRange} compareEnabled={compareEnabled} />}
      {activeTab === 'orders'    && <OrdersTab    dateRange={dateRange} />}
      {activeTab === 'customers' && <CustomersTab dateRange={dateRange} />}
      {activeTab === 'products'  && <ProductsTab  dateRange={dateRange} />}
      {activeTab === 'export'    && <ReportExportPanel />}

      {schedulerOpen && <ReportScheduler onClose={() => setSchedulerOpen(false)} />}
    </div>
  );
}

function OverviewTab({ dateRange, compareEnabled }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <RevenueReportChart dateRange={dateRange} compareEnabled={compareEnabled} />
        </div>
        <CategoryRevenueChart dateRange={dateRange} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <OrdersReportChart dateRange={dateRange} />
        </div>
        <TopProductsReport dateRange={dateRange} limit={6} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <CustomerAcquisitionChart dateRange={dateRange} />
        <SalesHeatmap dateRange={dateRange} />
      </div>
    </div>
  );
}

function RevenueTab({ dateRange, compareEnabled }) {
  return (
    <div className="space-y-5">
      <RevenueReportChart dateRange={dateRange} compareEnabled={compareEnabled} tall />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <CategoryRevenueChart dateRange={dateRange} />
        <RevenueBreakdownTable />
      </div>
    </div>
  );
}

function OrdersTab({ dateRange }) {
  return (
    <div className="space-y-5">
      <OrdersReportChart dateRange={dateRange} tall />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <OrderStatusBreakdown />
        <SalesHeatmap dateRange={dateRange} />
      </div>
    </div>
  );
}

function CustomersTab({ dateRange }) {
  return (
    <div className="space-y-5">
      <CustomerAcquisitionChart dateRange={dateRange} tall />
      <CustomerCohortTable />
    </div>
  );
}

function ProductsTab({ dateRange }) {
  return (
    <div className="space-y-5">
      <TopProductsReport dateRange={dateRange} limit={20} expanded />
    </div>
  );
}

function RevenueBreakdownTable() {
  const rows = [
    { channel: 'Direct Sales',    amount: 142850, pct: 48, change: +12.4 },
    { channel: 'Organic Search',  amount: 71200,  pct: 24, change: +8.1  },
    { channel: 'Social Media',    amount: 44500,  pct: 15, change: +21.3 },
    { channel: 'Email Campaigns', amount: 22100,  pct: 7,  change: -3.2  },
    { channel: 'Referral',        amount: 17800,  pct: 6,  change: +5.7  },
  ];
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Revenue by Channel</h3>
      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.channel} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">{r.channel}</span>
              <div className="flex items-center gap-3">
                <span className={`font-medium ${r.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {r.change >= 0 ? '+' : ''}{r.change}%
                </span>
                <span className="text-slate-400 font-mono">${r.amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: `${r.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderStatusBreakdown() {
  const statuses = [
    { label: 'Delivered',   count: 1842, color: '#10b981', pct: 58 },
    { label: 'Shipped',     count: 420,  color: '#6366f1', pct: 13 },
    { label: 'Processing',  count: 310,  color: '#a78bfa', pct: 10 },
    { label: 'Pending',     count: 228,  color: '#f59e0b', pct:  7 },
    { label: 'Cancelled',   count: 186,  color: '#f43f5e', pct:  6 },
    { label: 'Refunded',    count: 194,  color: '#94a3b8', pct:  6 },
  ];
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Order Status Breakdown</h3>
      <div className="space-y-2.5">
        {statuses.map(s => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <div className="flex-1 h-1.5 rounded-full bg-slate-800">
              <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
            </div>
            <span className="text-xs text-slate-400 w-20 text-right">{s.label}</span>
            <span className="text-xs font-mono text-slate-300 w-10 text-right">{s.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerCohortTable() {
  const months = ['Month 0', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5'];
  const cohorts = [
    { cohort: 'Jan 2024', size: 342, retention: [100, 42, 31, 28, 24, 21] },
    { cohort: 'Feb 2024', size: 289, retention: [100, 44, 33, 29, 25, null] },
    { cohort: 'Mar 2024', size: 418, retention: [100, 38, 30, 27, null, null] },
    { cohort: 'Apr 2024', size: 371, retention: [100, 46, 35, null, null, null] },
    { cohort: 'May 2024', size: 503, retention: [100, 41, null, null, null, null] },
    { cohort: 'Jun 2024', size: 467, retention: [100, null, null, null, null, null] },
  ];
  function cellClass(v) {
    if (v === null) return 'bg-slate-800/30 text-slate-700';
    if (v === 100)  return 'bg-indigo-500/30 text-indigo-300';
    if (v >= 40)    return 'bg-emerald-500/20 text-emerald-400';
    if (v >= 30)    return 'bg-teal-500/20 text-teal-400';
    if (v >= 20)    return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-rose-500/15 text-rose-400';
  }
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Customer Retention Cohorts</h3>
        <span className="text-xs text-slate-500">% retained by month after acquisition</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-slate-500 font-medium pb-3 pr-4">Cohort</th>
              <th className="text-slate-500 font-medium pb-3 px-2">Size</th>
              {months.map(m => (
                <th key={m} className="text-slate-500 font-medium pb-3 px-1 text-center whitespace-nowrap">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map(c => (
              <tr key={c.cohort}>
                <td className="text-slate-300 pr-4 py-1.5 whitespace-nowrap">{c.cohort}</td>
                <td className="text-slate-400 px-2 text-center font-mono">{c.size}</td>
                {c.retention.map((v, i) => (
                  <td key={i} className="px-1 py-1.5">
                    <span className={`px-2 py-0.5 rounded font-mono font-semibold block text-center ${cellClass(v)}`}>
                      {v !== null ? `${v}%` : '—'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
