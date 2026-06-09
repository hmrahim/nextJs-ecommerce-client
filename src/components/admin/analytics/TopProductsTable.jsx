'use client';

export default function TopProductsTable({ data = [] }) {
  if (!data.length) return null;

  const maxRev = Math.max(...data.map(d => d.revenue));

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['#', 'Product', 'SKU', 'Revenue', 'Orders', 'Trend'].map((h, i) => (
              <th key={h} style={{
                textAlign: i > 1 ? 'right' : 'left',
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
          {data.map((p, i) => {
            const positive = p.trend >= 0;
            return (
              <tr key={p.sku} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '11px 10px', color: 'var(--adm-muted)', fontSize: 12 }}>
                  {i + 1}
                </td>
                <td style={{ padding: '11px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `rgba(108,99,255,${0.25 - i * 0.03})`,
                      border: '1px solid rgba(108,99,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#a78bfa', flexShrink: 0,
                    }}>
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>{p.name}</div>
                      <div style={{ marginTop: 2, height: 3, width: `${(p.revenue / maxRev) * 100}%`, minWidth: 20,
                        background: 'linear-gradient(90deg, #6c63ff, #a78bfa)', borderRadius: 4 }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 10px', color: 'var(--adm-muted)', fontSize: 12, fontFamily: 'monospace' }}>
                  {p.sku}
                </td>
                <td style={{ padding: '11px 10px', textAlign: 'right', fontWeight: 600, color: '#fff' }}>
                  ${p.revenue.toLocaleString()}
                </td>
                <td style={{ padding: '11px 10px', textAlign: 'right', color: 'var(--adm-muted)' }}>
                  {p.orders.toLocaleString()}
                </td>
                <td style={{ padding: '11px 10px', textAlign: 'right' }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: positive ? '#4ade80' : '#f87171',
                    background: positive ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                    border: `1px solid ${positive ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                    borderRadius: 20, padding: '2px 8px',
                    whiteSpace: 'nowrap',
                  }}>
                    {positive ? '+' : ''}{p.trend}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
