// 📁 PATH: src/components/admin/gift-cards/GiftCardFilters.jsx

'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_OPTIONS = [
  { value: '',         label: 'All Status' },
  { value: 'active',   label: '✅ Active' },
  { value: 'inactive', label: '⏸️ Inactive' },
  { value: 'redeemed', label: '💸 Fully Redeemed' },
  { value: 'expired',  label: '⏰ Expired' },
];

const TYPE_OPTIONS = [
  { value: '',         label: 'All Types' },
  { value: 'digital',  label: '✉️ Digital' },
  { value: 'physical', label: '📦 Physical' },
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc',   label: 'Newest First' },
  { value: 'createdAt:asc',    label: 'Oldest First' },
  { value: 'balance:desc',     label: 'Highest Balance' },
  { value: 'initialValue:desc',label: 'Highest Value' },
  { value: 'expiresAt:asc',    label: 'Expiring Soon' },
];

const sel = "h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-colors";

export default function GiftCardFilters({ filters, onChange }) {
  const [search, setSearch] = useState(filters.search || '');
  const debounced = useDebounce(search, 400);

  useEffect(() => {
    if (debounced !== filters.search) onChange({ ...filters, search: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const hasActive = filters.search || filters.status || filters.type;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by code, recipient name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      <select value={filters.status} onChange={e => onChange({ ...filters, status: e.target.value })} className={sel}>
        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select value={filters.type} onChange={e => onChange({ ...filters, type: e.target.value })} className={sel}>
        {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select value={filters.sort} onChange={e => onChange({ ...filters, sort: e.target.value })} className={sel}>
        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {hasActive && (
        <button
          onClick={() => { setSearch(''); onChange({ search: '', status: '', type: '', sort: 'createdAt:desc' }); }}
          className="h-9 px-3 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
