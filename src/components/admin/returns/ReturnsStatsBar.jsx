// 📁 PATH: src/components/admin/returns/ReturnsStatsBar.jsx
// ⚠️  NEW FILE

'use client';

export default function ReturnsStatsBar({ stats = {} }) {
  const cards = [
    {
      label: 'Total Requests',
      value: stats.total ?? 0,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>,
      border: 'border-violet-500/20', grad: 'from-violet-500/10', text: 'text-violet-400',
    },
    {
      label: 'Pending Review',
      value: stats.pending_review ?? 0,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
      border: 'border-amber-500/20', grad: 'from-amber-500/10', text: 'text-amber-400',
    },
    {
      label: 'Approved',
      value: stats.approved ?? 0,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
      border: 'border-sky-500/20', grad: 'from-sky-500/10', text: 'text-sky-400',
    },
    {
      label: 'Refunds Issued',
      value: stats.refund_processed ?? 0,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/></svg>,
      border: 'border-emerald-500/20', grad: 'from-emerald-500/10', text: 'text-emerald-400',
    },
    {
      label: 'Total Refunded',
      value: `$${(stats.totalRefunded ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
      border: 'border-emerald-500/20', grad: 'from-emerald-500/10', text: 'text-emerald-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(c => (
        <div key={c.label} className={`rounded-xl border ${c.border} bg-gradient-to-br ${c.grad} to-transparent p-4`}>
          <div className={`${c.text} mb-2 opacity-80`}>{c.icon}</div>
          <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
