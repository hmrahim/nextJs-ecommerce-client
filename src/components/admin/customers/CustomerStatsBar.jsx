// 📁 PATH: src/components/admin/customers/CustomerStatsBar.jsx
// ⚠️  NEW FILE

'use client';

const CARDS = [
  {
    key: 'total',
    label: 'Total Customers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    border: 'border-violet-500/20', from: 'from-violet-500/10', text: 'text-violet-400',
    trend: '+12% vs last month',
  },
  {
    key: 'active',
    label: 'Active',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    border: 'border-emerald-500/20', from: 'from-emerald-500/10', text: 'text-emerald-400',
    trend: '+5% vs last month',
  },
  {
    key: 'new',
    label: 'New (30 days)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
    border: 'border-sky-500/20', from: 'from-sky-500/10', text: 'text-sky-400',
    trend: '+8% vs last month',
  },
  {
    key: 'vip',
    label: 'VIP Customers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    border: 'border-yellow-500/20', from: 'from-yellow-500/10', text: 'text-yellow-400',
    trend: '+2 this month',
  },
  {
    key: 'revenue',
    label: 'Total Revenue',
    prefix: '$',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    border: 'border-emerald-500/20', from: 'from-emerald-500/10', text: 'text-emerald-300',
    trend: '+18% vs last month',
  },
  {
    key: 'banned',
    label: 'Banned',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    border: 'border-red-500/20', from: 'from-red-500/10', text: 'text-red-400',
    trend: '-1 vs last month',
    trendGood: true,
  },
];

function formatValue(key, val) {
  if (key === 'revenue') return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return val.toLocaleString();
}

export default function CustomerStatsBar({ stats = {} }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map(card => {
        const val = stats[card.key] ?? 0;
        return (
          <div key={card.key} className={`rounded-xl border ${card.border} bg-gradient-to-br ${card.from} to-transparent p-4 flex flex-col gap-2`}>
            <div className={`${card.text} opacity-80`}>{card.icon}</div>
            <div>
              <p className={`text-2xl font-bold tracking-tight ${card.text}`}>
                {card.prefix || ''}{formatValue(card.key, val)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">{card.label}</p>
            </div>
            <p className={`text-[10px] font-medium ${card.trendGood ? 'text-emerald-500' : 'text-slate-700'}`}>
              {card.trend}
            </p>
          </div>
        );
      })}
    </div>
  );
}
