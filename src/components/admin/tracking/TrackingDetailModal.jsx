// 📁 PATH: src/components/admin/tracking/TrackingDetailModal.jsx
'use client';
import { useState } from 'react';
import { TRACKING_STATUSES, PRIORITIES } from './_dummyData';

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function relTime(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Stepper({ status }) {
  const sequence = ['pending', 'picked_up', 'in_transit', 'at_hub', 'out_for_delivery', 'delivered'];
  const currentIdx = sequence.indexOf(status);
  const isFailed = ['returned', 'cancelled', 'failed_attempt'].includes(status);

  return (
    <div className="flex items-center justify-between">
      {sequence.map((s, i) => {
        const reached = !isFailed && i <= currentIdx;
        const isCurrent = !isFailed && i === currentIdx;
        const st = TRACKING_STATUSES[s];
        return (
          <div key={s} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                reached
                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-[#111118] border-[#1e1e2e] text-slate-600'
              } ${isCurrent ? 'ring-4 ring-orange-500/30 animate-pulse' : ''}`}>
                {reached ? '✓' : i + 1}
              </div>
              <p className={`text-[10px] mt-1.5 text-center whitespace-nowrap ${reached ? 'text-orange-300 font-semibold' : 'text-slate-600'}`}>
                {st.label}
              </p>
            </div>
            {i < sequence.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx && !isFailed ? 'bg-orange-500' : 'bg-[#1e1e2e]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TrackingDetailModal({ shipment, onClose, onAddNote, onAdvanceStatus }) {
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!shipment) return null;
  const st = TRACKING_STATUSES[shipment.status];
  const pr = PRIORITIES[shipment.priority];
  const isFailed = ['returned', 'cancelled', 'failed_attempt'].includes(shipment.status);
  const isDone = ['delivered', 'returned', 'cancelled'].includes(shipment.status);

  const copyTracking = () => {
    navigator.clipboard.writeText(shipment.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const submitNote = () => {
    if (!note.trim()) return;
    onAddNote(shipment._id, note.trim());
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1e1e2e] flex items-center justify-between bg-gradient-to-r from-orange-500/5 to-transparent">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Shipment Tracking</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${pr.cls}`}>{pr.label}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-orange-400 text-sm font-bold">{shipment.trackingNumber}</span>
              <button onClick={copyTracking} className="text-slate-500 hover:text-slate-300" title="Copy">
                {copied
                  ? <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
              </button>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400">{shipment.orderId}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Status banner */}
          <div className={`p-4 rounded-xl border ${st.cls}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{st.icon}</span>
                <div>
                  <p className="text-xs uppercase font-semibold opacity-70">Current Status</p>
                  <p className="text-lg font-bold">{st.label}</p>
                  <p className="text-xs opacity-80 mt-0.5">📍 {shipment.currentLocation}</p>
                </div>
              </div>
              {!isDone && (
                <div className="text-right">
                  <p className="text-[10px] uppercase opacity-70">ETA</p>
                  <p className="text-sm font-semibold">{fmtDate(shipment.estimatedDelivery)}</p>
                </div>
              )}
              {shipment.deliveredAt && (
                <div className="text-right">
                  <p className="text-[10px] uppercase opacity-70">Delivered At</p>
                  <p className="text-sm font-semibold">{fmtDate(shipment.deliveredAt)}</p>
                </div>
              )}
            </div>
            {shipment.failureReason && (
              <p className="mt-3 text-xs bg-black/20 rounded-md px-3 py-2">⚠️ {shipment.failureReason}</p>
            )}
          </div>

          {/* Stepper */}
          {!['cancelled'].includes(shipment.status) && (
            <div className="p-5 rounded-xl border border-[#1e1e2e] bg-[#111118]">
              <Stepper status={shipment.status} />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Customer */}
            <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">👤 Customer & Address</p>
              <p className="text-white font-semibold">{shipment.customer.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{shipment.customer.phone}</p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">📍 {shipment.customer.address}</p>
            </div>

            {/* Courier */}
            <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">🚚 Courier & Origin</p>
              <p className="text-white font-semibold">{shipment.courier}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{shipment.courierCode}</p>
              <p className="text-xs text-slate-300 mt-2">From: {shipment.pickupLocation}</p>
              <p className="text-xs text-slate-500 mt-1">Attempts: {shipment.deliveryAttempts}</p>
            </div>
          </div>

          {/* Items & payment */}
          <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">📦 Items & Payment</p>
            <div className="space-y-2">
              {shipment.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-[#1e1e2e] pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-slate-200">{it.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{it.sku}</p>
                  </div>
                  <span className="text-slate-400 text-xs">× {it.qty}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e1e2e] grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Weight</p>
                <p className="text-sm font-bold text-slate-200">{shipment.weight} kg</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Value</p>
                <p className="text-sm font-bold text-white">৳{shipment.value.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">{shipment.isCod ? 'COD Amount' : 'Payment'}</p>
                <p className={`text-sm font-bold ${shipment.isCod ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {shipment.isCod ? `৳${shipment.codAmount.toLocaleString()}` : 'Prepaid'}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-4">📜 Timeline ({shipment.events.length} events)</p>
            <div className="relative pl-6">
              <div className="absolute left-2 top-1 bottom-1 w-px bg-[#1e1e2e]" />
              {shipment.events.map((ev, i) => {
                const evSt = TRACKING_STATUSES[ev.status];
                const isLatest = i === 0;
                return (
                  <div key={i} className="relative pb-4 last:pb-0">
                    <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full ${evSt.dot} ${isLatest ? 'ring-4 ring-orange-500/20 animate-pulse' : ''}`} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${isLatest ? 'text-white' : 'text-slate-300'}`}>
                          {evSt.icon} {evSt.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">📍 {ev.location}</p>
                        {ev.note && <p className="text-xs text-slate-500 mt-1 italic">"{ev.note}"</p>}
                        {ev.operator && <p className="text-[10px] text-slate-600 mt-1">— {ev.operator}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-slate-500">{fmtDate(ev.timestamp)}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{relTime(ev.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add internal note */}
          {!isDone && (
            <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">✏️ Add Internal Note</p>
              <div className="flex gap-2">
                <input
                  type="text" value={note} onChange={e => setNote(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitNote(); }}
                  placeholder="e.g. Called customer, will retry tomorrow…"
                  className="flex-1 h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0c0c12] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                />
                <button onClick={submitNote} disabled={!note.trim()} className="px-4 h-9 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Add Event
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[#1e1e2e] flex justify-between items-center gap-3 flex-wrap">
          <p className="text-xs text-slate-500">Created {fmtDate(shipment.createdAt)}</p>
          <div className="flex gap-2">
            {!isDone && !isFailed && (
              <button onClick={() => onAdvanceStatus(shipment._id)} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors">
                Advance to Next Status →
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
