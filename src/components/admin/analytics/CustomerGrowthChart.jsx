'use client';

export default function CustomerGrowthChart({ data = [], height = 140 }) {
  if (!data.length) return null;

  const W = 700;
  const H = height;
  const PAD = { top: 16, right: 16, bottom: 32, left: 10 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxNew = Math.max(...data.map(d => d.new)) * 1.2;

  const barW = (innerW / data.length) * 0.55;
  const gap = innerW / data.length;

  // Show subset of x labels
  const labelStep = Math.ceil(data.length / 7);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6c63ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6c63ff" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i}
          x1={PAD.left} x2={PAD.left + innerW}
          y1={PAD.top + innerH * (1 - f)} y2={PAD.top + innerH * (1 - f)}
          stroke="rgba(255,255,255,0.04)" strokeWidth={1}
        />
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const bH = (d.new / maxNew) * innerH;
        const x = PAD.left + i * gap + gap / 2 - barW / 2;
        const y = PAD.top + innerH - bH;
        const showLabel = i % labelStep === 0 || i === data.length - 1;

        return (
          <g key={i}>
            <rect
              x={x} y={y} width={barW} height={bH}
              fill="url(#barGrad)"
              rx={3}
            />
            {showLabel && (
              <text
                x={x + barW / 2} y={PAD.top + innerH + 16}
                textAnchor="middle" fontSize={9.5} fill="rgba(100,116,139,0.8)"
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
