// 📁 PATH: src/components/admin/campaigns/CampaignFilters.jsx
// ⚠️  This is a completely new file

'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS = [
  { value: '',          label: 'All Status' },
  { value: 'draft',     label: '📝 Draft' },
  { value: 'scheduled', label: '⏱️ Scheduled' },
  { value: 'running',   label: '🚀 Running' },
  { value: 'paused',    label: '⏸️ Paused' },
  { value: 'completed', label: '✅ Completed' },
  { value: 'archived',  label: '📦 Archived' },
];
const CHANNEL = [
  { value: '',          label: 'All Channels' },
  { value: 'email',     label: '📧 Email' },
  { value: 'sms',       label: '💬 SMS' },
  { value: 'push',      label: '🔔 Push' },
  { value: 'whatsapp',  label: '🟢 WhatsApp' },
  { value: 'in_app',    label: '🛍 In-App Banner' },
];
const SORT = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc',  label: 'Oldest First' },
  { value: 'scheduledAt:asc',label: 'Upcoming' },
  { value: 'sentCount:desc', label: 'Most Sent' },
  { value: 'revenue:desc',   label: 'Top Revenue' },
];

const sel = 'h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-colors';

export default function CampaignFilters({ filters, onChange }) {
  const [search, setSearch] = useState(filters.search || '');
  const debounced = useDebounce(search, 400);
  useEffect(() => { if (debounced !== filters.search) onChange({ ...filters, search: debounced }); }, [debounced]);

  const hasActive = filters.search || filters.status || filters.channel;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search campaigns by name, subject, segment…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors"
        />
      </div>
      <select value={filters.status} onChange={e => onChange({ ...filters, status: e.target.value })} className={sel}>
        {STATUS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select value={filters.channel} onChange={e => onChange({ ...filters, channel: e.target.value })} className={sel}>
        {CHANNEL.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select value={filters.sort} onChange={e => onChange({ ...filters, sort: e.target.value })} className={sel}>
        {SORT.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hasActive && (
        <button
          onClick={() => { setSearch(''); onChange({ search: '', status: '', channel: '', sort: 'createdAt:desc' }); }}
          className="h-9 px-3 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors"
        >Clear</button>
      )}
    </div>
  );
}
