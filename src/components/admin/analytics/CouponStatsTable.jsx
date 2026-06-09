'use client';

export default function CouponStatsTable({ data = [] }) {
  if (!data.length) return null;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['Code', 'Uses', 'Discount Given', 'Revenue Generated', 'Conv. Rate'].map((h, i) => (
              <th key={h} style={{
                textAlign: i === 0 ? 'left' : 'right',
                padding: '0 10px 12px',
                fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em',
                color: 'var(--adm-muted)', textTransform: 'uppercase',
                borderBottom: '1px solid var(--adm-border)',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '11px 10px' }}>
                <span style={{
                  fontFamily: 'monospace', fontWeight: 700, fontSize: 12.5,
                  color: '#a78bfa',
                  background: 'rgba(108,99,255,0.15)',
                  border: '1px solid rgba(108,99,255,0.25)',
                  borderRadius: 6, padding: '3px 10px',
                }}>{c.code}</span>
              </td>
              <td style={{ padding: '11px 10px', textAlign: 'right', color: 'var(--adm-text)', fontWeight: 500 }}>
                {c.uses.toLocaleString()}
              </td>
              <td style={{ padding: '11px 10px', textAlign: 'right', color: '#f87171', fontWeight: 600 }}>
                -${c.discount.toLocaleString()}
              </td>
              <td style={{ padding: '11px 10px', textAlign: 'right', color: '#4ade80', fontWeight: 600 }}>
                ${c.revenue.toLocaleString()}
              </td>
              <td style={{ padding: '11px 10px', textAlign: 'right' }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: '#38bdf8',
                  background: 'rgba(56,189,248,0.1)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  borderRadius: 20, padding: '2px 8px',
                }}>
                  {c.conv}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
