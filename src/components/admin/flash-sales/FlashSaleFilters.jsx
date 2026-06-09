// 📁 PATH: src/components/admin/flash-sales/FlashSaleFilters.jsx
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

'use client';

const STATUS_TABS = [
  { key: '',         label: 'All'      },
  { key: 'active',   label: '⚡ Live'  },
  { key: 'upcoming', label: '🕐 Upcoming' },
  { key: 'scheduled',label: '📅 Scheduled' },
  { key: 'ended',    label: '✅ Ended' },
  { key: 'draft',    label: '📝 Draft' },
];

export default function FlashSaleFilters({ filters, onChange, total }) {
  const set = (k, v) => onChange({ ...filters, [k]: v, page: 1 });

  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => set('status', t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filters.status === t.key
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-[#16161f] text-slate-400 border border-[#1e1e2e] hover:border-orange-500/30 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 self-center">{total} sale{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Search + sort row */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={filters.search || ''}
            onChange={e => set('search', e.target.value)}
            placeholder="Search flash sales…"
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20"
          />
        </div>
        <select
          value={filters.sort || 'newest'}
          onChange={e => set('sort', e.target.value)}
          className="h-8 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-orange-500/60"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="startTime">By start time</option>
          <option value="revenue">By revenue</option>
        </select>
        <select
          value={filters.discountType || ''}
          onChange={e => set('discountType', e.target.value)}
          className="h-8 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-orange-500/60"
        >
          <option value="">All types</option>
          <option value="percent">% Discount</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>
    </div>
  );
}
