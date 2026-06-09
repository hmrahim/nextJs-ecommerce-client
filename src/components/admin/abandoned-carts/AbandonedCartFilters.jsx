// 📁 PATH: src/components/admin/abandoned-carts/AbandonedCartFilters.jsx
'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS = [
  { value: '', label: 'All Status' },
  { value: 'new',          label: '🆕 New' },
  { value: 'email_sent',   label: '📧 Email Sent' },
  { value: 'reminded',     label: '🔔 Reminded' },
  { value: 'recovered',    label: '✅ Recovered' },
  { value: 'lost',         label: '❌ Lost' },
];
const AGE = [
  { value: '', label: 'Any age' },
  { value: '1h',  label: '< 1 hour' },
  { value: '24h', label: '< 24 hours' },
  { value: '7d',  label: '< 7 days' },
  { value: '30d', label: '< 30 days' },
];
const sel = 'h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-slate-300 focus:outline-none focus:border-orange-500/50';

export default function AbandonedCartFilters({ filters, onChange }) {
  const [search, setSearch] = useState(filters.search || '');
  const debounced = useDebounce(search, 400);
  useEffect(() => { if (debounced !== filters.search) onChange({ ...filters, search: debounced }); }, [debounced]);
  const hasActive = filters.search || filters.status || filters.age;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer name, email, phone…" className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50" />
      </div>
      <select value={filters.status} onChange={e => onChange({ ...filters, status: e.target.value })} className={sel}>{STATUS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      <select value={filters.age}    onChange={e => onChange({ ...filters, age: e.target.value })}    className={sel}>{AGE.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      {hasActive && <button onClick={() => { setSearch(''); onChange({ search: '', status: '', age: '' }); }} className="h-9 px-3 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5">Clear</button>}
    </div>
  );
}
