'use client';

function formatValue(value, type) {
  if (type === 'currency') return '$' + value.toLocaleString('en', { minimumFractionDigits: 0 });
  if (type === 'percent') return value.toFixed(1) + '%';
  if (type === 'number') return value.toLocaleString('en');
  return value;
}

export default function KpiCard({ title, value, change, type = 'number', icon, accent = false }) {
  const positive = change >= 0;
  const changeAbs = Math.abs(change).toFixed(1);

  return (
    <div
      style={{
        background: accent
          ? 'linear-gradient(135deg, rgba(108,99,255,0.18), rgba(167,139,250,0.08))'
          : 'var(--adm-surface)',
        border: accent ? '1px solid rgba(108,99,255,0.35)' : '1px solid var(--adm-border)',
        borderRadius: 14,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow for accent cards */}
      {accent && (
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 120, height: 120,
          background: 'radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--adm-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {title}
        </span>
        {icon && (
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: accent ? 'rgba(108,99,255,0.25)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accent ? '#a78bfa' : 'var(--adm-muted)',
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Syne, sans-serif', color: '#fff', lineHeight: 1 }}>
        {formatValue(value, type)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 11.5, fontWeight: 600,
          color: positive ? '#4ade80' : '#f87171',
          background: positive ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
          border: `1px solid ${positive ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
          borderRadius: 20, padding: '2px 8px',
        }}>
          {positive ? '▲' : '▼'} {changeAbs}%
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--adm-muted)' }}>vs last period</span>
      </div>
    </div>
  );
}
