'use client';
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect } from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const PAYMENT_OPTIONS = [
  { value: '', label: 'All Payments' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Unpaid' },
  { value: 'failed', label: 'Failed' },
];

const SORT_OPTIONS = [
  { value: 'placedAt:desc', label: 'Newest First' },
  { value: 'placedAt:asc',  label: 'Oldest First' },
  { value: 'totalAmount:desc', label: 'Highest Value' },
  { value: 'totalAmount:asc',  label: 'Lowest Value' },
];

export default function OrderFilters({ filters, onChange }) {
  const [search, setSearch] = useState(filters.search || '');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange({ ...filters, search: debouncedSearch });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleField = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Order # or customer…"
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-300 placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status}
        onChange={e => handleField('status', e.target.value)}
        className="px-3 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
      >
        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Payment */}
      <select
        value={filters.paymentStatus}
        onChange={e => handleField('paymentStatus', e.target.value)}
        className="px-3 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
      >
        {PAYMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Sort */}
      <select
        value={filters.sort}
        onChange={e => handleField('sort', e.target.value)}
        className="px-3 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
      >
        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Clear */}
      {(filters.search || filters.status || filters.paymentStatus) && (
        <button
          onClick={() => { setSearch(''); onChange({ search: '', status: '', paymentStatus: '', sort: 'placedAt:desc' }); }}
          className="px-3 py-2 rounded-xl border border-[#1e1e2e] text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
