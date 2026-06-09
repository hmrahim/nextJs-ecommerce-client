// 📁 PATH: src/components/admin/flash-sales/FlashSaleStatsBar.jsx
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

'use client';

function StatCard({ label, value, sub, color = 'orange', icon }) {
  const colors = {
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400',
    green:  'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    blue:   'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400',
    red:    'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
  };
  return (
    <div className={`relative rounded-xl border bg-gradient-to-br ${colors[color]} p-4 overflow-hidden`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-medium truncate mb-1">{label}</p>
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className="text-2xl opacity-70 flex-shrink-0">{icon}</div>
      </div>
    </div>
  );
}

export default function FlashSaleStatsBar({ sales }) {
  const active   = sales.filter(s => s.status === 'active').length;
  const upcoming = sales.filter(s => s.status === 'upcoming' || s.status === 'scheduled').length;
  const ended    = sales.filter(s => s.status === 'ended').length;
  const draft    = sales.filter(s => s.status === 'draft').length;

  const totalRevenue = sales.reduce((a, s) => a + (s.revenue || 0), 0);
  const totalSold    = sales.reduce((a, s) => a + (s.soldCount || 0), 0);
  const totalStock   = sales.reduce((a, s) => a + (s.totalStock || 0), 0);
  const fillRate     = totalStock > 0 ? Math.round((totalSold / totalStock) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <StatCard
        label="Active Sales"
        value={active}
        sub={`${upcoming} upcoming`}
        color="orange"
        icon="⚡"
      />
      <StatCard
        label="Total Revenue"
        value={`৳${(totalRevenue / 1000).toFixed(0)}K`}
        sub={`${totalSold} orders`}
        color="green"
        icon="💰"
      />
      <StatCard
        label="Stock Fill Rate"
        value={`${fillRate}%`}
        sub={`${totalSold} / ${totalStock} sold`}
        color="blue"
        icon="📦"
      />
      <StatCard
        label="Total Sales"
        value={sales.length}
        sub={`${ended} ended · ${draft} draft`}
        color="violet"
        icon="🏷️"
      />
    </div>
  );
}
