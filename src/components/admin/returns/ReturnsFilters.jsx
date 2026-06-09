// 📁 PATH: src/components/admin/returns/ReturnsFilters.jsx
// ⚠️  NEW FILE

'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending_review',   label: '🕐 Pending Review' },
  { value: 'approved',         label: '✅ Approved' },
  { value: 'rejected',         label: '❌ Rejected' },
  { value: 'item_received',    label: '📦 Item Received' },
  { value: 'refund_processed', label: '💚 Refund Processed' },
  { value: 'closed',           label: '🔒 Closed' },
];
const TYPE_OPTS = [
  { value: '', label: 'All Types' },
  { value: 'return_refund', label: '↩️ Return & Refund' },
  { value: 'refund_only',   label: '💰 Refund Only' },
  { value: 'exchange',      label: '🔄 Exchange' },
];
const SORT_OPTS = [
  { value: 'createdAt:desc',  label: 'Newest first' },
  { value: 'createdAt:asc',   label: 'Oldest first' },
  { value: 'refundAmount:desc', label: 'Highest value' },
  { value: 'updatedAt:desc',  label: 'Recently updated' },
];

export default function ReturnsFilters({ filters, onChange, total }) {
  const [search, setSearch] = useState(filters.search || '');
  const [showAdv, setAdv] = useState(false);
  const deb = useDebounce(search, 380);

  useEffect(() => {
    if (deb !== filters.search) onChange({ ...filters, search: deb });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deb]);

  const set = (k, v) => onChange({ ...filters, [k]: v });
  const active = ['status','type','dateFrom','dateTo'].filter(k => filters[k]).length + (filters.search ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="RET# or customer name…"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"/>
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>}
        </div>

        <select value={filters.status} onChange={e => set('status', e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-violet-500/60 transition-colors">
          {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select value={filters.type} onChange={e => set('type', e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-violet-500/60 transition-colors">
          {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select value={filters.sort} onChange={e => set('sort', e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-violet-500/60 transition-colors">
          {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button onClick={() => setAdv(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-colors ${showAdv ? 'border-violet-500/40 text-violet-400 bg-violet-500/10' : 'border-[#1e1e2e] text-slate-500 hover:text-slate-300'}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
          Filters {active > 0 && <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center">{active}</span>}
        </button>

        {active > 0 && (
          <button onClick={() => { setSearch(''); onChange({ search:'', status:'', type:'', dateFrom:'', dateTo:'', sort:'createdAt:desc' }); }}
            className="px-3 py-2 rounded-xl border border-[#1e1e2e] text-slate-500 hover:text-slate-300 text-sm transition-colors">
            Clear
          </button>
        )}

        {total != null && <span className="ml-auto text-xs text-slate-600">{total} request{total !== 1 ? 's' : ''}</span>}
      </div>

      {showAdv && (
        <div className="flex flex-wrap items-center gap-2.5 pl-1 pt-1 border-l-2 border-violet-500/20">
          <span className="text-xs text-slate-600">Date range:</span>
          <input type="date" value={filters.dateFrom} onChange={e => set('dateFrom', e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-[#16161f] border border-[#1e1e2e] text-slate-400 text-xs focus:outline-none focus:border-violet-500/50"/>
          <span className="text-slate-700 text-xs">→</span>
          <input type="date" value={filters.dateTo} onChange={e => set('dateTo', e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-[#16161f] border border-[#1e1e2e] text-slate-400 text-xs focus:outline-none focus:border-violet-500/50"/>
        </div>
      )}
    </div>
  );
}
