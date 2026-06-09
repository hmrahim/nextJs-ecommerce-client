'use client';

export default function AnalyticsCard({ title, subtitle, action, children, span = 1 }) {
  return (
    <div style={{
      background: 'var(--adm-surface)',
      border: '1px solid var(--adm-border)',
      borderRadius: 14,
      padding: '20px 22px',
      gridColumn: span > 1 ? `span ${span}` : undefined,
    }}>
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}>
          <div>
            {title && (
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: '#fff' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--adm-muted)' }}>{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
