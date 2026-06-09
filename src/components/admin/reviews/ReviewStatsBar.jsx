'use client';

function StatCard({ label, value, sub, color = 'violet' }) {
  const colors = {
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    amber:  'bg-amber-500/10  border-amber-500/20  text-amber-400',
    emerald:'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    red:    'bg-red-500/10    border-red-500/20    text-red-400',
    sky:    'bg-sky-500/10    border-sky-500/20    text-sky-400',
  };
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      {sub && <p className="text-xs opacity-60">{sub}</p>}
    </div>
  );
}

export default function ReviewStatsBar({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-4 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  const avg = stats?.avgRating ? Number(stats.avgRating).toFixed(1) : '—';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        label="Total Reviews"
        value={stats?.total?.toLocaleString()}
        color="violet"
      />
      <StatCard
        label="Pending"
        value={stats?.pending?.toLocaleString()}
        sub="Needs moderation"
        color="amber"
      />
      <StatCard
        label="Approved"
        value={stats?.approved?.toLocaleString()}
        sub="Live on site"
        color="emerald"
      />
      <StatCard
        label="Rejected"
        value={stats?.rejected?.toLocaleString()}
        color="red"
      />
      <StatCard
        label="Avg Rating"
        value={avg ? `${avg} ★` : '—'}
        sub={`from ${stats?.total ?? 0} reviews`}
        color="sky"
      />
    </div>
  );
}
