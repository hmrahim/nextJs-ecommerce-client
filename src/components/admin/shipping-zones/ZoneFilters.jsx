// 📁 PATH: src/components/admin/shipping-zones/ZoneFilters.jsx
'use client';
import { useState, useEffect } from 'react';
import { ZONE_TYPES, BD_DIVISIONS } from './_dummyData';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: '✅ Active' },
  { value: 'inactive', label: '⏸️ Inactive' },
];

const SORT_OPTIONS = [
  { value: 'priority:asc',   label: 'Priority (Low → High)' },
  { value: 'priority:desc',  label: 'Priority (High → Low)' },
  { value: 'orders30d:desc', label: 'Most Orders' },
  { value: 'baseRate:asc',   label: 'Cheapest First' },
  { value: 'baseRate:desc',  label: 'Most Expensive' },
  { value: 'name:asc',       label: 'Name A → Z' },
];

const sel = "h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-colors";

export default function ZoneFilters({ filters, onChange }) {
  const [search, setSearch] = useState(filters.search || '');

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== filters.search) onChange({ ...filters, search });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasActive = filters.search || filters.status || filters.type || filters.division;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search zone name, code, region…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors"
        />
      </div>

      <select value={filters.type} onChange={e => onChange({ ...filters, type: e.target.value })} className={sel}>
        <option value="">All Types</option>
        {ZONE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      <select value={filters.division} onChange={e => onChange({ ...filters, division: e.target.value })} className={sel}>
        <option value="">All Divisions</option>
        {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <select value={filters.status} onChange={e => onChange({ ...filters, status: e.target.value })} className={sel}>
        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select value={filters.sort} onChange={e => onChange({ ...filters, sort: e.target.value })} className={sel}>
        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {hasActive && (
        <button
          onClick={() => { setSearch(''); onChange({ search: '', status: '', type: '', division: '', sort: 'priority:asc' }); }}
          className="h-9 px-3 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
