'use client';

export default function FunnelChart({ data = [] }) {
  if (!data.length) return null;

  const maxCount = data[0]?.count ?? 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((stage, i) => {
        const barW = (stage.count / maxCount) * 100;
        const dropOff = i > 0 ? (((data[i - 1].count - stage.count) / data[i - 1].count) * 100).toFixed(1) : null;

        return (
          <div key={stage.stage}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: `rgba(108,99,255,${1 - i * 0.15})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>{i + 1}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--adm-text)' }}>{stage.stage}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {dropOff && (
                  <span style={{
                    fontSize: 11, color: '#f87171',
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: 20, padding: '1px 7px', fontWeight: 600,
                  }}>-{dropOff}%</span>
                )}
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', minWidth: 60, textAlign: 'right' }}>
                  {stage.count.toLocaleString()}
                </span>
                <span style={{ fontSize: 11, color: 'var(--adm-muted)', minWidth: 36, textAlign: 'right' }}>
                  {stage.pct}%
                </span>
              </div>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${barW}%`,
                background: `linear-gradient(90deg, #6c63ff, #a78bfa)`,
                borderRadius: 8,
                opacity: 1 - i * 0.12,
                transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
