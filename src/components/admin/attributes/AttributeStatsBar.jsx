// 📁 PATH: src/components/admin/attributes/AttributeStatsBar.jsx
'use client';

const CARDS = [
  {
    key: 'total', label: 'Total Attributes', color: 'amber',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>,
  },
  {
    key: 'active', label: 'Active', color: 'emerald',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
  {
    key: 'filterable', label: 'Filterable', color: 'sky',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>,
  },
  {
    key: 'variant', label: 'Variant Attributes', color: 'violet',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  },
  {
    key: 'totalValues', label: 'Total Values', color: 'indigo',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>,
  },
  {
    key: 'inactive', label: 'Inactive', color: 'slate',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>,
  },
];

const PALETTE = {
  amber:  { border: 'border-amber-500/20',  bg: 'from-amber-500/10',  text: 'text-amber-400'  },
  emerald:{ border: 'border-emerald-500/20',bg: 'from-emerald-500/10',text: 'text-emerald-400' },
  sky:    { border: 'border-sky-500/20',    bg: 'from-sky-500/10',    text: 'text-sky-400'    },
  violet: { border: 'border-violet-500/20', bg: 'from-violet-500/10', text: 'text-violet-400' },
  indigo: { border: 'border-indigo-500/20', bg: 'from-indigo-500/10', text: 'text-indigo-400' },
  slate:  { border: 'border-slate-500/20',  bg: 'from-slate-500/10',  text: 'text-slate-400'  },
};

export default function AttributeStatsBar({ stats = {}, loading }) {
  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-4 animate-pulse h-24" />
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map(card => {
        const p = PALETTE[card.color];
        return (
          <div key={card.key} className={`rounded-xl border ${p.border} bg-gradient-to-br ${p.bg} to-transparent p-4 flex flex-col gap-2`}>
            <div className={`${p.text} opacity-80`}>{card.icon}</div>
            <p className={`text-2xl font-bold tabular-nums tracking-tight ${p.text}`}>
              {(stats[card.key] ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 leading-tight">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
