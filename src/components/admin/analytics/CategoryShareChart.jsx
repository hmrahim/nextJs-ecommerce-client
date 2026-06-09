'use client';

const COLORS = ['#6c63ff', '#a78bfa', '#38bdf8', '#34d399', '#fb923c'];

export default function CategoryShareChart({ data = [] }) {
  if (!data.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {data.map((cat, i) => (
        <div key={cat.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--adm-text)' }}>{cat.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 11, color: 'var(--adm-muted)' }}>{cat.orders.toLocaleString()} orders</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', minWidth: 70, textAlign: 'right' }}>
                ${cat.revenue.toLocaleString()}
              </span>
              <span style={{ fontSize: 12, color: 'var(--adm-muted)', minWidth: 36, textAlign: 'right' }}>
                {cat.share}%
              </span>
            </div>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${cat.share}%`,
              background: COLORS[i % COLORS.length],
              borderRadius: 6,
              transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
