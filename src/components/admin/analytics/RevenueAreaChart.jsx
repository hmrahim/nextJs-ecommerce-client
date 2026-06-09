'use client';
import { useState, useRef, useEffect } from 'react';

function formatK(n) {
  return n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'k' : '$' + n;
}

export default function RevenueAreaChart({ data = [], height = 240 }) {
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  if (!data.length) return null;

  const W = 800;
  const H = height;
  const PAD = { top: 24, right: 20, bottom: 40, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxRev = Math.max(...data.map(d => d.revenue)) * 1.12;
  const minRev = 0;

  const xPos = (i) => PAD.left + (i / (data.length - 1)) * innerW;
  const yPos = (v) => PAD.top + innerH - ((v - minRev) / (maxRev - minRev)) * innerH;

  // Build smooth path (catmull-rom)
  const points = data.map((d, i) => [xPos(i), yPos(d.revenue)]);

  function catmullRom(pts) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  }

  const linePath = catmullRom(points);
  const areaPath = linePath + ` L ${points[points.length - 1][0]},${PAD.top + innerH} L ${points[0][0]},${PAD.top + innerH} Z`;

  // Y axis gridlines
  const yTicks = 5;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = (maxRev / yTicks) * i;
    const y = yPos(val);
    return { val, y };
  });

  // X labels — show subset to avoid crowding
  const maxLabels = 8;
  const step = Math.ceil(data.length / maxLabels);
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  const handleMouseMove = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const closest = data.reduce((best, d, i) => {
      const dist = Math.abs(xPos(i) - svgX);
      return dist < best.dist ? { i, dist } : best;
    }, { i: 0, dist: Infinity });
    setTooltip({ i: closest.i, x: xPos(closest.i), y: yPos(data[closest.i].revenue) });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6c63ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6c63ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6c63ff" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {yLines.map(({ val, y }, i) => (
          <g key={i}>
            <line x1={PAD.left} x2={PAD.left + innerW} y1={y} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y + 4}
              textAnchor="end" fontSize={10} fill="rgba(100,116,139,0.9)">
              {formatK(val)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#revGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth={2.5} strokeLinecap="round" />

        {/* X labels */}
        {xLabels.map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text key={i} x={xPos(idx)} y={PAD.top + innerH + 18}
              textAnchor="middle" fontSize={10} fill="rgba(100,116,139,0.9)">
              {d.label}
            </text>
          );
        })}

        {/* Tooltip dot */}
        {tooltip && (
          <>
            <line
              x1={tooltip.x} x2={tooltip.x}
              y1={PAD.top} y2={PAD.top + innerH}
              stroke="rgba(108,99,255,0.4)" strokeWidth={1} strokeDasharray="4 3"
            />
            <circle cx={tooltip.x} cy={tooltip.y} r={5}
              fill="#6c63ff" stroke="#fff" strokeWidth={2} />
          </>
        )}
      </svg>

      {/* Tooltip bubble */}
      {tooltip && (() => {
        const d = data[tooltip.i];
        return (
          <div style={{
            position: 'absolute',
            left: `${(tooltip.x / W) * 100}%`,
            top: `${(tooltip.y / H) * 100}%`,
            transform: 'translate(-50%, -120%)',
            background: '#1a1a2e',
            border: '1px solid rgba(108,99,255,0.4)',
            borderRadius: 10,
            padding: '8px 14px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            zIndex: 10,
          }}>
            <div style={{ fontSize: 11, color: 'var(--adm-muted)', marginBottom: 4 }}>{d.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'Syne,sans-serif' }}>
              ${d.revenue.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: '#a78bfa', marginTop: 2 }}>
              {d.orders} orders · {d.visitors?.toLocaleString()} visitors
            </div>
          </div>
        );
      })()}
    </div>
  );
}
