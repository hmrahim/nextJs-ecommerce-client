'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const RATING_OPTIONS = [
  { value: '', label: 'All Ratings' },
  { value: '5', label: '★★★★★  5 Star' },
  { value: '4', label: '★★★★☆  4 Star' },
  { value: '3', label: '★★★☆☆  3 Star' },
  { value: '2', label: '★★☆☆☆  2 Star' },
  { value: '1', label: '★☆☆☆☆  1 Star' },
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc',  label: 'Oldest First' },
  { value: 'rating:desc',    label: 'Highest Rating' },
  { value: 'rating:asc',     label: 'Lowest Rating' },
];

const SELECT_CLS =
  'px-3 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-violet-500/50 transition-colors';

export default function ReviewFilters({ filters, onChange }) {
  const [search, setSearch] = useState(filters.search || '');
  const debounced = useDebounce(search, 400);

  useEffect(() => {
    if (debounced !== filters.search) {
      onChange({ ...filters, search: debounced, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const set = (key, val) => onChange({ ...filters, [key]: val, page: 1 });

  const hasActiveFilter =
    filters.search || filters.status || filters.rating || filters.sort !== 'createdAt:desc';

  const clear = () => {
    setSearch('');
    onChange({ search: '', status: '', rating: '', sort: 'createdAt:desc', page: 1 });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Customer, product or review…"
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-300 placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status}
        onChange={e => set('status', e.target.value)}
        className={SELECT_CLS}
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Rating */}
      <select
        value={filters.rating}
        onChange={e => set('rating', e.target.value)}
        className={SELECT_CLS}
      >
        {RATING_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={filters.sort}
        onChange={e => set('sort', e.target.value)}
        className={SELECT_CLS}
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Clear */}
      {hasActiveFilter && (
        <button
          onClick={clear}
          className="px-3 py-2 rounded-xl border border-[#1e1e2e] text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
