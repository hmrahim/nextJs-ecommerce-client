'use client';

import { useState } from 'react';

const REPORT_TYPES = [
  {
    id: 'revenue',
    title: 'Revenue Report',
    description: 'Complete revenue breakdown by channel, category, and time period with YoY comparison.',
    icon: '💹',
    formats: ['CSV', 'XLSX', 'PDF'],
    badge: 'Popular',
  },
  {
    id: 'orders',
    title: 'Orders Report',
    description: 'All order data with status history, fulfillment times, and return/refund analysis.',
    icon: '📦',
    formats: ['CSV', 'XLSX', 'PDF'],
    badge: null,
  },
  {
    id: 'customers',
    title: 'Customer Report',
    description: 'Customer acquisition, lifetime value, segments, and retention cohort data.',
    icon: '👥',
    formats: ['CSV', 'XLSX', 'PDF'],
    badge: null,
  },
  {
    id: 'products',
    title: 'Product Performance',
    description: 'SKU-level sales data, inventory turnover, margin analysis, and review scores.',
    icon: '📊',
    formats: ['CSV', 'XLSX'],
    badge: null,
  },
  {
    id: 'inventory',
    title: 'Inventory Snapshot',
    description: 'Current stock levels, reserved quantities, low-stock alerts, and warehouse breakdown.',
    icon: '🏭',
    formats: ['CSV', 'XLSX', 'PDF'],
    badge: 'New',
  },
  {
    id: 'tax',
    title: 'Tax & Accounting',
    description: 'Tax collected by region, VAT breakdown, and accounting-ready transaction ledger.',
    icon: '🧮',
    formats: ['CSV', 'XLSX', 'PDF'],
    badge: null,
  },
  {
    id: 'marketing',
    title: 'Marketing Attribution',
    description: 'Coupon performance, discount usage, conversion funnels, and campaign ROI.',
    icon: '🎯',
    formats: ['CSV', 'PDF'],
    badge: null,
  },
  {
    id: 'audit',
    title: 'Audit Log Export',
    description: 'Full admin activity log with user, timestamp, action type, and entity changes.',
    icon: '🔍',
    formats: ['CSV', 'JSON'],
    badge: 'Admin only',
  },
];

export default function ReportExportPanel() {
  const [selectedReports, setSelectedReports] = useState(new Set());
  const [dateRange, setDateRange]   = useState({ start: '', end: '' });
  const [format, setFormat]         = useState('XLSX');
  const [downloading, setDownloading] = useState(null);

  function toggleReport(id) {
    setSelectedReports(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleExport(reportId, fmt) {
    const key = `${reportId}-${fmt}`;
    setDownloading(key);
    setTimeout(() => {
      setDownloading(null);
      // In production: trigger actual download via orderService.adminExport(...)
    }, 1800);
  }

  const formatColors = {
    CSV:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    XLSX: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    PDF:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
    JSON: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const badgeColors = {
    Popular:    'bg-indigo-500/20 text-indigo-300',
    New:        'bg-emerald-500/20 text-emerald-400',
    'Admin only': 'bg-rose-500/15 text-rose-400',
  };

  return (
    <div className="space-y-6">
      {/* Batch export bar */}
      {selectedReports.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-5 py-3">
          <p className="text-sm text-indigo-300 font-medium">
            {selectedReports.size} report{selectedReports.size > 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {['CSV', 'XLSX', 'PDF'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-2.5 py-1 text-xs rounded font-medium border transition-all ${
                    format === f
                      ? formatColors[f]
                      : 'border-slate-700 text-slate-500'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleExport('batch', format)}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export all as {format}
            </button>
            <button onClick={() => setSelectedReports(new Set())} className="text-xs text-slate-400 hover:text-white transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Date range filter */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Date Range</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400">From</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400">To</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex gap-2 ml-auto">
            {['Last 7 days', 'Last 30 days', 'This month', 'This year'].map(preset => (
              <button
                key={preset}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
                onClick={() => {
                  const now = new Date();
                  const end = now.toISOString().split('T')[0];
                  const days = preset === 'Last 7 days' ? 7 : preset === 'Last 30 days' ? 30 : 365;
                  const start = new Date(now - days * 86400000).toISOString().split('T')[0];
                  setDateRange({ start, end });
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TYPES.map(r => {
          const isSelected = selectedReports.has(r.id);
          return (
            <div
              key={r.id}
              className={`rounded-xl border p-5 transition-all duration-200 cursor-pointer group ${
                isSelected
                  ? 'border-indigo-500/50 bg-indigo-500/8'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
              onClick={() => toggleReport(r.id)}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                  isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600'
                }`}>
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{r.icon}</span>
                    <span className="text-sm font-semibold text-white">{r.title}</span>
                    {r.badge && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${badgeColors[r.badge]}`}>
                        {r.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">{r.description}</p>

                  {/* Format buttons */}
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {r.formats.map(f => {
                      const key = `${r.id}-${f}`;
                      const isLoading = downloading === key;
                      return (
                        <button
                          key={f}
                          onClick={() => handleExport(r.id, f)}
                          disabled={isLoading}
                          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium border transition-all hover:opacity-80 ${formatColors[f]}`}
                        >
                          {isLoading ? (
                            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          )}
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
