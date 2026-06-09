// 📁 PATH: src/components/admin/customers/CustomerSegmentTabs.jsx
// ⚠️  NEW FILE

'use client';

export const SEGMENTS = [
  { key: 'all',        label: 'All',           filter: () => true },
  { key: 'active',     label: 'Active',         filter: c => c.isActive && !c.isBanned && c.emailVerified },
  { key: 'vip',        label: '⭐ VIP',          filter: c => c.tags?.includes('VIP') },
  { key: 'new',        label: 'New (30d)',       filter: c => new Date(c.createdAt) > new Date(Date.now() - 86400000 * 30) },
  { key: 'at_risk',    label: 'At Risk',         filter: c => c.tags?.includes('At Risk') || (!c.lastOrderAt ? false : new Date(c.lastOrderAt) < new Date(Date.now() - 86400000 * 60) && c.isActive) },
  { key: 'inactive',   label: 'Inactive',        filter: c => !c.isActive && !c.isBanned },
  { key: 'unverified', label: 'Unverified',      filter: c => !c.emailVerified && !c.isBanned },
  { key: 'banned',     label: '🚫 Banned',        filter: c => c.isBanned },
];

export default function CustomerSegmentTabs({ segment, counts = {}, onChange }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {SEGMENTS.map(s => {
        const active = segment === s.key;
        const count  = counts[s.key] ?? 0;
        return (
          <button key={s.key} onClick={() => onChange(s.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              active
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'border border-[#1e1e2e] text-slate-400 hover:text-slate-200 hover:border-slate-600 bg-[#111118]'
            }`}>
            {s.label}
            <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${active ? 'bg-white/20 text-white' : 'bg-[#1e1e2e] text-slate-500'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
