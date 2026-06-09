'use client';
import { useState } from 'react';
import { DISPUTE_TYPE } from './DisputesTable';

export default function DisputeFilters({ filters, onChange }) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      onChange({ ...filters, search });
    }
  };

  const set = (key, val) => onChange({ ...filters, [key]: val, page: 1 });

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by dispute ID, order, customer…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          onBlur={handleSearch}
          className="w-full pl-9 pr-4 py-2.5 bg-[#111118] border border-[#1e1e2e] rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/50 transition-colors"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status || ''}
        onChange={e => set('status', e.target.value)}
        className="px-3 py-2.5 bg-[#111118] border border-[#1e1e2e] rounded-xl text-sm text-slate-300 outline-none focus:border-violet-500/50 cursor-pointer"
      >
        <option value="">All Statuses</option>
        <option value="open">Open</option>
        <option value="under_review">Under Review</option>
        <option value="awaiting_customer">Awaiting Customer</option>
        <option value="escalated">Escalated</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>

      {/* Priority */}
      <select
        value={filters.priority || ''}
        onChange={e => set('priority', e.target.value)}
        className="px-3 py-2.5 bg-[#111118] border border-[#1e1e2e] rounded-xl text-sm text-slate-300 outline-none focus:border-violet-500/50 cursor-pointer"
      >
        <option value="">All Priorities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {/* Type */}
      <select
        value={filters.type || ''}
        onChange={e => set('type', e.target.value)}
        className="px-3 py-2.5 bg-[#111118] border border-[#1e1e2e] rounded-xl text-sm text-slate-300 outline-none focus:border-violet-500/50 cursor-pointer"
      >
        <option value="">All Types</option>
        {Object.entries(DISPUTE_TYPE).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={filters.sort || 'openedAt:desc'}
        onChange={e => set('sort', e.target.value)}
        className="px-3 py-2.5 bg-[#111118] border border-[#1e1e2e] rounded-xl text-sm text-slate-300 outline-none focus:border-violet-500/50 cursor-pointer"
      >
        <option value="openedAt:desc">Newest First</option>
        <option value="openedAt:asc">Oldest First</option>
        <option value="claimedAmount:desc">Highest Amount</option>
        <option value="priority:desc">Priority</option>
      </select>

      {/* Clear */}
      {(filters.status || filters.priority || filters.type || filters.search) && (
        <button
          onClick={() => onChange({ search: '', status: '', priority: '', type: '', sort: 'openedAt:desc' })}
          className="px-3 py-2.5 rounded-xl text-xs text-slate-500 hover:text-slate-300 border border-[#1e1e2e] hover:border-[#2a2a3a] transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
