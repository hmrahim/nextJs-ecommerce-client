'use client';
import { useState, useEffect } from 'react';
import {
  useVisitorStats,
  useVisitorChart,
  useVisitorsByDevice,
  useVisitorsBySource,
  useVisitorsByCountry,
  useTopPages,
  useVisitorsList,
  useBulkDeleteVisitors,
  useExportVisitorsCsv,
  useLiveVisitorCount,
} from '@/hooks/useVisitors';


/* ═══════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════ */

function StatCard({ label, value, change, up, sub, color, icon }) {
  const C = {
    violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  text: 'text-violet-400'  },
    sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     text: 'text-sky-400'     },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400'   },
    pink:    { bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    text: 'text-pink-400'    },
  }[color];
  return (
    <div className={`rounded-xl border ${C.border} ${C.bg} p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${C.bg} border ${C.border} flex items-center justify-center`}>
          <svg className={`w-4 h-4 ${C.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {change && <span className={`text-xs font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>{change}</span>}
          <span className="text-xs text-slate-500">{sub}</span>
        </div>
      </div>
    </div>
  );
}

function WeeklyChart({ data = [] }) {
  const maxV = Math.max(1, ...data.map(d => d.visitors));
  const [hovered, setHovered] = useState(null);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative"
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
          {hovered === i && (
            <div className="absolute -top-8 bg-[#16161f] border border-white/10 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap z-10 shadow-lg">
              {d.visitors.toLocaleString()} visitors
            </div>
          )}
          <div className="relative w-full flex items-end" style={{ height: 80 }}>
            <div
              className={`w-full rounded-t-sm transition-all duration-200 ${hovered === i ? 'bg-violet-400' : 'bg-violet-500/40'}`}
              style={{ height: `${(d.visitors / maxV) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-600">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, size = 80 }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  let cum = 0;
  const r = size / 2 - 8;
  const cx = size / 2, cy = size / 2;
  const slices = data.map(d => {
    const start = cum;
    cum += (d.count / total) * 360;
    return { ...d, start, end: cum };
  });
  const arc = (startDeg, endDeg) => {
    const s = ((startDeg - 90) * Math.PI) / 180;
    const e = ((endDeg - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={arc(s.start, s.end)} fill={s.color} opacity={0.85} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#111118" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   VISITOR DETAIL MODAL
   ═══════════════════════════════════════════════════ */

function VisitorModal({ visitor: v, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  const TABS = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'session',   label: 'Session'   },
    { id: 'technical', label: 'Technical' },
    { id: 'identity',  label: 'Identity'  },
    { id: 'location',  label: 'Location'  },
  ];

  const STATUS_DOT = { online: 'bg-emerald-400', idle: 'bg-amber-400', offline: 'bg-slate-600' };
  const STATUS_BG  = { online: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', idle: 'bg-amber-500/10 text-amber-400 border-amber-500/20', offline: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };

  const scrollPct = parseInt(v.scrollDepth);
  const scrollColor = scrollPct >= 75 ? '#34d399' : scrollPct >= 50 ? '#fbbf24' : '#f472b6';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e16] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] bg-[#111118]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <span className="text-base">{v.country.split(' ')[0]}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white font-mono">{v.ip}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_BG[v.status]}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${STATUS_DOT[v.status]} ${v.status === 'online' ? 'animate-pulse' : ''}`} />
                  {v.status}
                </span>
                {v.isReturning && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-sky-500/10 text-sky-400 border-sky-500/20 font-medium">
                    Returning
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{v.country} · {v.city} · {v.timezone}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-0 border-b border-white/[0.07] bg-[#111118]">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                activeTab === t.id
                  ? 'text-violet-400 border-violet-500 bg-violet-500/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <>
              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Pages Visited', value: v.pagesVisited, icon: '📄', color: 'violet' },
                  { label: 'Session Duration', value: v.duration, icon: '⏱️', color: 'sky' },
                  { label: 'Click Count', value: v.clickCount, icon: '🖱️', color: 'emerald' },
                  { label: 'Visit #', value: `#${v.visitCount}`, icon: '🔁', color: 'amber' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-center">
                    <p className="text-xl mb-1">{s.icon}</p>
                    <p className="text-lg font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Journey */}
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="text-xs font-semibold text-slate-300 mb-3 flex justify-between">
                  <span>Page Journey ({v.pagesVisited || 0} hits)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Paths in chronological order</span>
                </p>

                {v.pages && v.pages.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {v.pages.map((p, idx) => {
                      const title = p.path === '/' ? 'Homepage' : (p.path.split('/').filter(Boolean).pop() || '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                      return (
                        <div key={idx} className="flex items-start justify-between gap-3 text-[11px] py-1.5 border-b border-white/[0.04] last:border-b-0">
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="text-[9px] w-5 h-5 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center font-mono flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <span className="text-slate-200 font-medium block truncate">{title || 'Page'}</span>
                              <span className="text-slate-500 font-mono text-[9px] block truncate">{p.path}</span>
                            </div>
                          </div>
                          <span className="text-slate-500 text-[10px] flex-shrink-0 font-mono mt-0.5">
                            {new Date(p.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Entry: {v.entryPage}
                    </span>
                    <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                      Current: {v.page}
                    </span>
                    <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                      Exit: {v.exitPage}
                    </span>
                  </div>
                )}
              </div>

              {/* Scroll Depth + Bounce + Commerce */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Scroll Depth */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Scroll Depth</p>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-white">{v.scrollDepth}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: v.scrollDepth, background: scrollColor }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {['25%','50%','75%','100%'].map(p => (
                      <span key={p} className={`text-[9px] ${scrollPct >= parseInt(p) ? 'text-slate-300' : 'text-slate-700'}`}>{p}</span>
                    ))}
                  </div>
                </div>

                {/* Bounce */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col justify-between">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Bounce</p>
                  <div>
                    <span className={`text-sm font-bold ${v.bounce ? 'text-red-400' : 'text-emerald-400'}`}>
                      {v.bounce ? '⚠️ Bounced' : '✅ Engaged'}
                    </span>
                    <p className="text-[10px] text-slate-600 mt-1">{v.bounce ? 'Left without interaction' : 'Visited multiple pages'}</p>
                  </div>
                </div>

                {/* E-commerce */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">E-Commerce</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Cart Added</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${v.cartAdded ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                        {v.cartAdded ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Purchased</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${v.purchased ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                        {v.purchased ? '✓ Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── SESSION TAB ── */}
          {activeTab === 'session' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Entry Page',       value: v.entryPage },
                  { label: 'Exit Page',        value: v.exitPage },
                  { label: 'Current Page',     value: v.page },
                  { label: 'Pages Visited',    value: `${v.pagesVisited} pages` },
                  { label: 'Session Duration', value: v.duration },
                  { label: 'Click Count',      value: `${v.clickCount} clicks` },
                  { label: 'Scroll Depth',     value: v.scrollDepth },
                  { label: 'Bounce',           value: v.bounce ? 'Yes' : 'No' },
                  { label: 'Cart Added',       value: v.cartAdded ? 'Yes' : 'No' },
                  { label: 'Purchased',        value: v.purchased ? 'Yes' : 'No' },
                  { label: 'Traffic Source',   value: v.source },
                  { label: 'Visit Time',       value: v.time },
                ].map(f => (
                  <div key={f.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{f.label}</p>
                    <p className="text-xs font-medium text-white break-all">{f.value}</p>
                  </div>
                ))}
              </div>
              {v.referrerUrl && (
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Referrer URL</p>
                  <p className="text-xs font-medium text-violet-400 break-all">{v.referrerUrl}</p>
                </div>
              )}
            </>
          )}

          {/* ── TECHNICAL TAB ── */}
          {activeTab === 'technical' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'IP Address',       value: v.ip },
                { label: 'Device',           value: v.device },
                { label: 'Operating System', value: v.os },
                { label: 'Browser',          value: v.browser },
                { label: 'Screen Resolution',value: v.screenResolution },
                { label: 'Connection Type',  value: v.connectionType },
                { label: 'Language / Locale',value: v.language },
                { label: 'Referrer URL',     value: v.referrerUrl ?? 'Direct / None' },
              ].map(f => (
                <div key={f.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{f.label}</p>
                  <p className="text-xs font-medium text-white break-all">{f.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── IDENTITY TAB ── */}
          {activeTab === 'identity' && (
            <>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  {v.isRegistered
                    ? <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    : <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {v.isRegistered ? (v.email ?? 'Registered User') : 'Guest Visitor'}
                  </p>
                  {v.userId && <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {v.userId}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${v.isRegistered ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                      {v.isRegistered ? 'Registered' : 'Guest'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${v.isReturning ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {v.isReturning ? 'Returning Visitor' : 'New Visitor'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'User ID',      value: v.userId ?? '—' },
                  { label: 'Email',        value: v.email ?? '—' },
                  { label: 'Visitor Type', value: v.isReturning ? 'Returning' : 'New' },
                  { label: 'Total Visits', value: `${v.visitCount} visits` },
                ].map(f => (
                  <div key={f.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{f.label}</p>
                    <p className="text-xs font-medium text-white break-all">{f.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── LOCATION TAB ── */}
          {activeTab === 'location' && (
            <>
              {/* Google Maps embed */}
              <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden relative" style={{ height: 220 }}>
                {v.lat && v.lng ? (
                  <iframe
                    title="Visitor Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://maps.google.com/maps?q=${v.lat},${v.lng}&z=13&output=embed`}
                    className="absolute inset-0 w-full h-full opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500">
                      📍
                    </div>
                    <p className="text-xs text-slate-500">No map coordinates available</p>
                  </div>
                )}
              </div>

              {/* Local Address Card */}
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-lg flex-shrink-0">
                  📍
                </div>
                <div>
                  <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider">
                    {v.streetAddress ? 'GPS Detailed Address' : 'Estimated Local Address'}
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5 leading-snug">
                    {v.streetAddress || (
                      <>
                        {v.city ? `${v.city}, ` : ''}
                        {v.region && v.region !== v.city ? `${v.region}, ` : ''}
                        {v.country || ''}
                        {v.postalCode && v.postalCode !== '—' ? ` (${v.postalCode})` : ''}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Country',     value: v.country },
                  { label: 'Region / State', value: v.region || '—' },
                  { label: 'City',        value: v.city },
                  { label: 'Latitude',    value: v.lat ? `${v.lat}°` : '—' },
                  { label: 'Longitude',   value: v.lng ? `${v.lng}°` : '—' },
                  { label: 'Timezone',    value: v.timezone },
                  { label: 'ISP / Network', value: v.isp },
                  { label: 'Postal Code', value: v.postalCode },
                  { label: 'Currency',    value: v.currency },
                ].map(f => (
                  <div key={f.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{f.label}</p>
                    <p className="text-xs font-medium text-white break-all">{f.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/[0.07] bg-[#111118] flex items-center justify-between">
          <span className="text-[10px] text-slate-600 font-mono">ID: {v.id}</span>
          <button onClick={onClose}
            className="px-4 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function VisitorsPage() {
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deviceFilter, setDevice]   = useState('all');
  const [sourceFilter, setSource]   = useState('all');
  const [statusFilter, setStatus]   = useState('all');
  const [selected, setSelected]     = useState([]);
  const [modalVisitor, setModal]    = useState(null);
  const [dateRange, setDateRange]   = useState('7d');
  const [page, setPage]             = useState(1);

  // debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, deviceFilter, sourceFilter, statusFilter, dateRange]);

  const { data: stats }        = useVisitorStats(dateRange);
  const { data: chartData = [] }    = useVisitorChart(dateRange);
  const { data: deviceData = [] }   = useVisitorsByDevice(dateRange);
  const { data: sourceData = [] }   = useVisitorsBySource(dateRange);
  const { data: countryData = [] }  = useVisitorsByCountry(dateRange);
  const { data: topPages = [] }     = useTopPages(dateRange);
  const { data: liveNow }      = useLiveVisitorCount();

  const { data: listData, isLoading: listLoading } = useVisitorsList({
    page, limit: 20, search: debouncedSearch,
    device: deviceFilter, source: sourceFilter, status: statusFilter, range: dateRange,
  });
  const visitors    = listData?.visitors ?? [];
  const totalCount  = listData?.total ?? 0;
  const totalPages  = listData?.totalPages ?? 1;

  const bulkDelete = useBulkDeleteVisitors();
  const exportCsv  = useExportVisitorsCsv();

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = ()   => setSelected(s => s.length === visitors.length ? [] : visitors.map(v => v.id));
  const handleBulkDelete = () => {
    if (!selected.length) return;
    bulkDelete.mutate(selected, { onSuccess: () => setSelected([]) });
  };

  const STATUS_DOT = { online: 'bg-emerald-400', idle: 'bg-amber-400', offline: 'bg-slate-600' };
  const DEVICE_ICON = {
    Mobile:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />,
    Desktop: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    Tablet:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Visitor Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time and historical visitor data — location, device, behavior, and traffic sources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">{liveNow ?? 0} live now</span>
          </div>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-white/10 bg-[#111118] text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={() => exportCsv.mutate(dateRange)}
            disabled={exportCsv.isPending}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {exportCsv.isPending ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Visits"    value={(stats?.totalVisitors ?? 0).toLocaleString()}  change={stats?.totalChange}    up={!(stats?.totalChange||"").startsWith("-")}  sub="vs last period" color="violet"
          icon={<><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>} />
        <StatCard label="Unique Visitors" value={(stats?.uniqueVisitors ?? 0).toLocaleString()} change={stats?.uniqueChange}  up={!(stats?.uniqueChange||"").startsWith("-")}  sub="vs last period" color="sky"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>} />
        <StatCard label="Page Views"      value={(stats?.pageViews ?? 0).toLocaleString()}       change={stats?.pageViewChange} up={!(stats?.pageViewChange||"").startsWith("-")}  sub="vs last period" color="emerald"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>} />
        <StatCard label="Avg. Session"    value={stats?.avgSession ?? "0m 00s"}                       change={null}                      up={true}  sub="per visitor"    color="amber"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>} />
        <StatCard label="Bounce Rate"     value={`${stats?.bounceRate ?? 0}%`}                 change={stats?.bounceChange}  up={false} sub="vs last period" color="pink"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>} />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-xl border border-white/10 bg-[#111118] p-5">
          <h2 className="text-sm font-semibold text-white mb-1">Weekly Traffic</h2>
          <p className="text-xs text-slate-500 mb-4">Visitors per day (last 7 days)</p>
          <WeeklyChart data={chartData} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-[#111118] p-5">
            <h2 className="text-sm font-semibold text-white mb-1">Devices</h2>
            <p className="text-xs text-slate-500 mb-4">Traffic by device type</p>
            <div className="flex items-center gap-4">
              <DonutChart data={deviceData.length ? deviceData : [{ label: "No data", count: 1, pct: 100, color: "#334155" }]} size={88} />
              <div className="flex-1 space-y-2.5">
                {deviceData.map(d => (
                  <div key={d.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-xs text-slate-400">{d.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-white">{d.pct}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#111118] p-5">
            <h2 className="text-sm font-semibold text-white mb-1">Traffic Sources</h2>
            <p className="text-xs text-slate-500 mb-4">Where visitors come from</p>
            <div className="space-y-2.5">
              {sourceData.map(s => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-xs text-slate-400">{s.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{s.pct}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Locations + Top Pages ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#111118] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Top Locations</h2>
            <p className="text-xs text-slate-500 mt-0.5">Visitors by country & city</p>
          </div>
          <div className="divide-y divide-white/5">
            {countryData.map((c, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <span className="text-xl flex-shrink-0">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white">{c.city}, {c.country}</p>
                  <div className="mt-1 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500/60" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-white">{c.visitors.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">{c.pct}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#111118] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Top Pages</h2>
            <p className="text-xs text-slate-500 mt-0.5">Most visited pages</p>
          </div>
          <div className="divide-y divide-white/5">
            {topPages.map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <span className="text-xs text-slate-600 font-mono w-4 flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{p.title}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{p.path}</p>
                </div>
                <div className="text-right flex-shrink-0 space-y-0.5">
                  <p className="text-xs font-semibold text-white">{p.views.toLocaleString()}</p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[10px] text-slate-500">{p.avgTime}</span>
                    <span className="text-[10px] text-slate-500">·</span>
                    <span className="text-[10px] text-amber-400">{p.bounce} bounce</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Visitor Log Table ── */}
      <div className="rounded-xl border border-white/10 bg-[#111118] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Visitor Log</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click any row to view full visitor details</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={deviceFilter} onChange={e => setDevice(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-[#0a0a0f] text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer">
              <option value="all">All Devices</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
            </select>
            <select value={sourceFilter} onChange={e => setSource(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-[#0a0a0f] text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer">
              <option value="all">All Sources</option>
              <option value="Direct">Direct</option>
              <option value="Organic Search">Organic Search</option>
              <option value="Social Media">Social Media</option>
              <option value="Referral">Referral</option>
              <option value="Email">Email</option>
            </select>
            <select value={statusFilter} onChange={e => setStatus(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-[#0a0a0f] text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer">
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="idle">Idle</option>
              <option value="offline">Offline</option>
            </select>
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search IP, city, page…" value={search} onChange={e => setSearch(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-white/10 bg-[#0a0a0f] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 w-44" />
            </div>
            {selected.length > 0 && (
              <button onClick={handleBulkDelete} disabled={bulkDelete.isPending}
                className="px-3 py-1.5 text-xs rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-colors disabled:opacity-50">
                {bulkDelete.isPending ? 'Deleting…' : `Delete ${selected.length}`}
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" checked={selected.length === visitors.length && visitors.length > 0}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-violet-600 cursor-pointer" />
                </th>
                {['Status','IP Address','Location','Device / OS','Browser','Source','Last Page','Duration','Bounce','Cart','Time'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {visitors.map(v => (
                <tr key={v.id}
                  className="group hover:bg-white/[0.025] transition-colors cursor-pointer"
                  onClick={() => setModal(v)}>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(v.id)} onChange={() => toggleSelect(v.id)}
                      className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-violet-600 cursor-pointer" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[v.status]} ${v.status === 'online' ? 'animate-pulse' : ''}`} />
                      <span className="text-[10px] text-slate-400 capitalize">{v.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-slate-300">{v.ip}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-white">{v.country}</span>
                    <span className="text-[10px] text-slate-500 block">{v.city}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {DEVICE_ICON[v.device]}
                      </svg>
                      <span>
                        <span className="text-xs text-white block">{v.device}</span>
                        <span className="text-[10px] text-slate-500">{v.os}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-300 whitespace-nowrap">{v.browser}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 whitespace-nowrap">{v.source}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <span className="text-[10px] font-mono text-violet-400 truncate block">{v.page}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-slate-300">{v.duration}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${v.bounce ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {v.bounce ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${v.cartAdded ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-white/5 text-slate-600 border-white/10'}`}>
                      {v.cartAdded ? '🛒' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[10px] text-slate-500">{v.time}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {listLoading && (
            <div className="py-16 text-center">
              <p className="text-slate-500 text-sm">Loading visitors…</p>
            </div>
          )}

          {!listLoading && visitors.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-slate-500 text-sm">No visitors match your filters.</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-500">Showing {visitors.length} of {totalCount.toLocaleString()} visitors</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="w-7 h-7 rounded text-xs transition-colors text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent">
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) => (
                p === '…'
                  ? <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-slate-600">…</span>
                  : <button key={p} onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded text-xs transition-colors ${p === page ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
                      {p}
                    </button>
              ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="w-7 h-7 rounded text-xs transition-colors text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ── Visitor Detail Modal ── */}
      {modalVisitor && <VisitorModal visitor={modalVisitor} onClose={() => setModal(null)} />}

    </div>
  );
}