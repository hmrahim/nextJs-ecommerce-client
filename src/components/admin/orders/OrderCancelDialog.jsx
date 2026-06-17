'use client';
import { useState, useEffect, useRef } from 'react';

/* ══════════════════════════════════════════════════════════
   CANCEL REASONS — quick select
══════════════════════════════════════════════════════════ */
const QUICK_REASONS = [
  { id: 'stock',    label: 'Out of stock',          icon: '📦' },
  { id: 'fraud',   label: 'Suspicious order',       icon: '🚫' },
  { id: 'address', label: 'Invalid address',        icon: '📍' },
  { id: 'request', label: 'Customer requested',     icon: '👤' },
  { id: 'payment', label: 'Payment failed',         icon: '💳' },
  { id: 'other',   label: 'Other reason',           icon: '✏️' },
];

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   Props:
     order      — order object (needs _id, orderNumber, total, items)
     onClose    — function()
     onConfirm  — async function(note: string) — called on confirm
══════════════════════════════════════════════════════════ */
export default function OrderCancelDialog({ order, onClose, onConfirm }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [customNote, setCustomNote]         = useState('');
  const [loading, setLoading]               = useState(false);
  const [shake, setShake]                   = useState(false);
  const textareaRef = useRef(null);

  // Focus textarea when "Other reason" is picked
  useEffect(() => {
    if (selectedReason === 'other') {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [selectedReason]);

  // Keyboard: Escape to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !loading) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, onClose]);

  const noteText = selectedReason === 'other'
    ? customNote.trim()
    : QUICK_REASONS.find(r => r.id === selectedReason)?.label || '';

  const handleConfirm = async () => {
    if (!selectedReason) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setLoading(true);
    try {
      await onConfirm?.(noteText);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const itemCount = order.items?.length ?? 0;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      onClick={() => !loading && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-lg" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-md"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'cancelDialogIn 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
      >
        <style>{`
          @keyframes cancelDialogIn {
            from { opacity: 0; transform: scale(0.93) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes cancelShake {
            0%,100% { transform: translateX(0); }
            20%     { transform: translateX(-6px); }
            40%     { transform: translateX(6px); }
            60%     { transform: translateX(-4px); }
            80%     { transform: translateX(4px); }
          }
          .shake { animation: cancelShake 0.5s ease; }
        `}</style>

        <div className="rounded-2xl border border-rose-500/20 bg-[#0d0d16] overflow-hidden shadow-2xl"
          style={{ boxShadow: '0 0 0 1px rgba(244,63,94,0.1), 0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(244,63,94,0.05)' }}
        >

          {/* ── Header ── */}
          <div className="relative px-5 pt-5 pb-4 bg-gradient-to-b from-rose-500/8 to-transparent">
            {/* Decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center flex-shrink-0 shadow-inner">
                <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white">Cancel this order?</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  This will restore stock and free the assigned rider. Action cannot be undone.
                </p>
              </div>

              {/* Close X */}
              <button
                onClick={() => !loading && onClose()}
                disabled={loading}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all disabled:opacity-30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order summary */}
            <div className="mt-4 rounded-xl bg-[#13131f] border border-[#1e1e2e] px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/20 to-rose-600/10 flex items-center justify-center text-sm">
                📦
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white font-mono">{order.orderNumber}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-sm font-bold text-rose-300">
                SAR {Number(order.total ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* ── Reason picker ── */}
          <div className="px-5 pb-4">
            <p className={`text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-3 ${shake ? 'shake text-rose-400' : ''}`}>
              Select a reason *
            </p>

            <div className="grid grid-cols-2 gap-2">
              {QUICK_REASONS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  disabled={loading}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all text-sm font-medium disabled:opacity-40 ${
                    selectedReason === r.id
                      ? 'border-rose-500/50 bg-rose-500/12 text-rose-300 shadow-sm shadow-rose-500/10'
                      : 'border-[#1e1e2e] bg-[#0f0f1a] text-slate-400 hover:border-rose-500/25 hover:text-slate-200 hover:bg-[#13131f]'
                  }`}
                >
                  <span className="text-base leading-none">{r.icon}</span>
                  <span className="text-[12px] leading-snug">{r.label}</span>
                  {selectedReason === r.id && (
                    <span className="ml-auto w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom note — only when "Other" selected */}
            {selectedReason === 'other' && (
              <div className="mt-3" style={{ animation: 'cancelDialogIn 0.18s ease forwards' }}>
                <textarea
                  ref={textareaRef}
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  placeholder="Describe the reason…"
                  rows={3}
                  disabled={loading}
                  className="w-full rounded-xl bg-[#0f0f1a] border border-rose-500/25 p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 resize-none transition-colors disabled:opacity-40"
                />
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-5 pb-5 pt-1 flex items-center gap-2.5">
            {/* Keep order */}
            <button
              onClick={() => !loading && onClose()}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-[#1e1e2e] bg-[#0f0f1a] text-slate-300 text-sm font-semibold hover:bg-[#13131f] hover:text-white transition-all disabled:opacity-40"
            >
              Keep order
            </button>

            {/* Confirm cancel */}
            <button
              onClick={handleConfirm}
              disabled={loading || !selectedReason}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                !selectedReason
                  ? 'bg-rose-500/30 text-rose-400/50 cursor-not-allowed border border-rose-500/15'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 disabled:opacity-60'
              }`}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Cancelling…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}