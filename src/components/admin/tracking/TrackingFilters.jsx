// 📁 PATH: src/components/admin/tracking/TrackingFilters.jsx
'use client';
import { useState, useEffect } from 'react';
import { TRACKING_STATUSES } from './_dummyData';

const sel = "h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-colors";

export default function TrackingFilters({ filters, onChange, couriers }) {
  const [search, setSearch] = useState(filters.search || '');
  useEffect(() => {
    const t = setTimeout(() => { if (search !== filters.search) onChange({ ...filters, search }); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasActive = filters.search || filters.status || filters.courier || filters.priority || filters.cod;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[260px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text" placeholder="Tracking #, Order ID, customer name or phone…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors"
        />
      </div>

      <select value={filters.status} onChange={e => onChange({ ...filters, status: e.target.value })} className={sel}>
        <option value="">All Statuses</option>
        {Object.entries(TRACKING_STATUSES).map(([k, v]) => (
          <option key={k} value={k}>{v.icon} {v.label}</option>
        ))}
      </select>

      <select value={filters.courier} onChange={e => onChange({ ...filters, courier: e.target.value })} className={sel}>
        <option value="">All Couriers</option>
        {couriers.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select value={filters.priority} onChange={e => onChange({ ...filters, priority: e.target.value })} className={sel}>
        <option value="">All Priorities</option>
        <option value="high">🔴 High</option>
        <option value="medium">🟡 Medium</option>
        <option value="low">🟢 Low</option>
      </select>

      <select value={filters.cod} onChange={e => onChange({ ...filters, cod: e.target.value })} className={sel}>
        <option value="">Payment: Any</option>
        <option value="cod">💵 COD</option>
        <option value="prepaid">💳 Prepaid</option>
      </select>

      {hasActive && (
        <button
          onClick={() => { setSearch(''); onChange({ search: '', status: '', courier: '', priority: '', cod: '' }); }}
          className="h-9 px-3 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors"
        >Clear</button>
      )}
    </div>
  );
}
