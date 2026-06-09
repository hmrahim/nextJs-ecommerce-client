'use client';
import { useState } from 'react';

function polarToCartesian(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export default function DonutChart({ data = [] }) {
  const [hovered, setHovered] = useState(null);

  if (!data.length) return null;

  const total = data.reduce((s, d) => s + d.count, 0);
  const CX = 100, CY = 100, R = 72, INNER = 46;
  let deg = 0;

  const slices = data.map((d, i) => {
    const span = (d.count / total) * 358; // leave 2deg gap total
    const start = deg;
    const end = deg + span - 0.8;
    deg += span;
    return { ...d, start, end, i };
  });

  const activeD = hovered !== null ? data[hovered] : null;
  const activeTotal = activeD ? activeD.count : total;

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* SVG donut */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg viewBox="0 0 200 200" style={{ width: 160, height: 160 }}>
          {/* Track */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={R - INNER} />

          {slices.map((s, i) => (
            <path
              key={i}
              d={arcPath(CX, CY, (R + INNER) / 2, s.start, s.end)}
              fill="none"
              stroke={s.color}
              strokeWidth={R - INNER}
              strokeLinecap="round"
              style={{
                cursor: 'pointer',
                opacity: hovered === null || hovered === i ? 1 : 0.35,
                transition: 'opacity 0.2s',
                filter: hovered === i ? `drop-shadow(0 0 6px ${s.color}80)` : 'none',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* Center text */}
          <text x={CX} y={CY - 8} textAnchor="middle" fontSize={20} fontWeight={700} fill="#fff" fontFamily="Syne,sans-serif">
            {activeD ? activeD.count.toLocaleString() : total.toLocaleString()}
          </text>
          <text x={CX} y={CY + 10} textAnchor="middle" fontSize={10} fill="rgba(100,116,139,0.9)">
            {activeD ? activeD.status : 'Total Orders'}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 140 }}>
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
              background: hovered === i ? 'rgba(255,255,255,0.04)' : 'transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 12.5, color: 'var(--adm-text)', fontWeight: 500 }}>{d.status}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#fff' }}>{d.count.toLocaleString()}</span>
            <span style={{ fontSize: 11, color: 'var(--adm-muted)', minWidth: 34, textAlign: 'right' }}>
              {((d.count / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
