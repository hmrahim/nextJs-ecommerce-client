// 📁 PATH: src/components/admin/customers/CustomerFilters.jsx
// ⚠️  NEW FILE

'use client';
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_OPTIONS = [
  { value: '',           label: 'All Statuses' },
  { value: 'active',     label: '✅ Active' },
  { value: 'inactive',   label: '⛔ Inactive' },
  { value: 'banned',     label: '🚫 Banned' },
  { value: 'unverified', label: '📧 Unverified' },
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc',  label: 'Newest first' },
  { value: 'createdAt:asc',   label: 'Oldest first' },
  { value: 'totalSpent:desc', label: 'Top spenders' },
  { value: 'totalOrders:desc',label: 'Most orders' },
  { value: 'lastOrderAt:desc',label: 'Recent activity' },
  { value: 'ltv:desc',        label: 'Highest LTV' },
];

const TAG_OPTIONS = ['VIP', 'New', 'At Risk', 'B2B', 'Inactive', 'Top Spender', 'Repeat Buyer'];

export default function CustomerFilters({ filters, onChange, totalCount }) {
  const [search, setSearch]         = useState(filters.search || '');
  const [showAdvanced, setAdvanced] = useState(false);
  const [tagMenu, setTagMenu]       = useState(false);
  const tagRef = useRef(null);
  const debounced = useDebounce(search, 380);

  useEffect(() => {
    if (debounced !== filters.search) onChange({ ...filters, search: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Close tag menu on outside click
  useEffect(() => {
    const h = (e) => { if (tagRef.current && !tagRef.current.contains(e.target)) setTagMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const set  = (k, v)   => onChange({ ...filters, [k]: v });
  const has  = (k)      => filters[k] && filters[k] !== '';
  const activeCount = ['status', 'tag', 'dateFrom', 'dateTo'].filter(has).length + (filters.search ? 1 : 0);

  const toggleTag = (tag) => {
    set('tag', filters.tag === tag ? '' : tag);
    setTagMenu(false);
  };

  const clearAll = () => {
    setSearch('');
    onChange({ search: '', status: '', tag: '', dateFrom: '', dateTo: '', sort: 'createdAt:desc' });
  };

  return (
    <div className="space-y-3">
      {/* Row 1 — primary controls */}
      <div className="flex flex-wrap items-center gap-2.5">

        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Name, email, phone…"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* Status */}
        <select value={filters.status} onChange={e => set('status', e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-violet-500/60 transition-colors">
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Sort */}
        <select value={filters.sort} onChange={e => set('sort', e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-violet-500/60 transition-colors">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Advanced toggle */}
        <button onClick={() => setAdvanced(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-colors ${showAdvanced ? 'border-violet-500/40 text-violet-400 bg-violet-500/10' : 'border-[#1e1e2e] text-slate-500 hover:text-slate-300 hover:border-slate-600'}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          Filters {activeCount > 0 && <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center">{activeCount}</span>}
        </button>

        {/* Clear */}
        {activeCount > 0 && (
          <button onClick={clearAll} className="px-3 py-2 rounded-xl border border-[#1e1e2e] text-slate-500 hover:text-slate-300 text-sm transition-colors">
            Clear all
          </button>
        )}

        {/* Count */}
        {totalCount != null && (
          <span className="ml-auto text-xs text-slate-600">{totalCount} customer{totalCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Row 2 — advanced filters */}
      {showAdvanced && (
        <div className="flex flex-wrap items-center gap-2.5 pt-1 pl-1 border-l-2 border-violet-500/20">
          {/* Tag filter */}
          <div className="relative" ref={tagRef}>
            <button onClick={() => setTagMenu(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-colors ${filters.tag ? 'border-violet-500/40 text-violet-400 bg-violet-500/10' : 'border-[#1e1e2e] text-slate-400 hover:text-slate-200'}`}>
              🏷️ {filters.tag || 'Tag'} <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {tagMenu && (
              <div className="absolute top-full mt-1 left-0 z-30 bg-[#16161f] border border-[#1e1e2e] rounded-xl shadow-2xl p-1 min-w-[150px]">
                {filters.tag && <button onClick={() => { set('tag', ''); setTagMenu(false); }} className="block w-full px-3 py-2 text-left text-xs text-slate-500 hover:bg-white/5 rounded-lg">Clear tag</button>}
                {TAG_OPTIONS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`block w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${filters.tag === tag ? 'text-violet-400 bg-violet-500/10' : 'text-slate-300 hover:bg-white/5'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600">Joined:</span>
            <input type="date" value={filters.dateFrom} onChange={e => set('dateFrom', e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-[#16161f] border border-[#1e1e2e] text-slate-400 text-xs focus:outline-none focus:border-violet-500/50" />
            <span className="text-slate-700 text-xs">→</span>
            <input type="date" value={filters.dateTo} onChange={e => set('dateTo', e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-[#16161f] border border-[#1e1e2e] text-slate-400 text-xs focus:outline-none focus:border-violet-500/50" />
          </div>
        </div>
      )}
    </div>
  );
}
