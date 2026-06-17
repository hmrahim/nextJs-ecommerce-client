'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// ── Global loading bar controller (call from anywhere) ──────────
export const loadingBar = {
  _start: null,
  _finish: null,
  start:  () => loadingBar._start?.(),
  finish: () => loadingBar._finish?.(),
};

export default function TopLoadingBar({
  color,
  variant = 'admin',
  height = 3,
  shadowBlur = 8,
}) {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [visible,  setVisible]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [fadeOut,  setFadeOut]  = useState(false);

  const barColor   = color ?? (variant === 'client' ? '#22c55e' : '#6c63ff');
  const tickRef    = useRef(null);
  const runningRef = useRef(false);

  const clearTick = () => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  };

  const startBar = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    clearTick();

    setFadeOut(false);
    setVisible(true);

    let p = 8;
    setProgress(p);

    tickRef.current = setInterval(() => {
      // crawl slowly — stops at 90%, waits for finishBar
      p = p + (90 - p) * 0.03;
      setProgress(Math.min(p, 90));
    }, 100);
  };

  const finishBar = () => {
    if (!runningRef.current) return;
    runningRef.current = false;
    clearTick();

    setProgress(100);
    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
        setFadeOut(false);
      }, 500);
    }, 200);
  };

  // Register global controller
  useEffect(() => {
    loadingBar._start  = startBar;
    loadingBar._finish = finishBar;
    return () => {
      loadingBar._start  = null;
      loadingBar._finish = null;
    };
  });

  // Finish when new route renders
  useEffect(() => {
    finishBar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes moom-sweep {
          0%   { left: -60%; }
          100% { left: 130%; }
        }
      `}</style>

      {/* Bar */}
      <div
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          right:         0,
          height:        `${height}px`,
          zIndex:        99999,
          pointerEvents: 'none',
          opacity:       fadeOut ? 0 : 1,
          transition:    'opacity 0.5s ease',
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

          {/* Filled bar */}
          <div
            style={{
              position:     'absolute',
              top:          0,
              left:         0,
              height:       '100%',
              width:        `${progress}%`,
              background:   barColor,
              boxShadow:    `0 0 ${shadowBlur}px 2px ${barColor}88`,
              borderRadius: '0 2px 2px 0',
              transition:   progress === 100 ? 'width 0.2s ease' : 'width 0.8s linear',
              overflow:     'hidden',
            }}
          >
            {/* Sweeping shine */}
            <div
              style={{
                position:   'absolute',
                top:        0,
                width:      '60%',
                height:     '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                animation:  'moom-sweep 1.8s ease-in-out infinite',
              }}
            />
          </div>

          {/* Glowing tip */}
          <div
            style={{
              position:     'absolute',
              top:          '50%',
              left:         `${progress}%`,
              transform:    'translate(-50%, -50%)',
              width:        `${height * 4}px`,
              height:       `${height * 4}px`,
              borderRadius: '50%',
              background:   barColor,
              boxShadow:    `0 0 10px 4px ${barColor}cc`,
              opacity:      progress >= 99 ? 0 : 1,
              transition:   'left 0.8s linear, opacity 0.2s ease',
            }}
          />
        </div>
      </div>

      {/* Top glow */}
      <div
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          right:         0,
          height:        '50px',
          zIndex:        99998,
          pointerEvents: 'none',
          opacity:       fadeOut ? 0 : 0.12,
          background:    `linear-gradient(to bottom, ${barColor}66, transparent)`,
          transition:    'opacity 0.5s ease',
        }}
      />
    </>
  );
}