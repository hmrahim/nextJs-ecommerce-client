'use client';

import { useState } from 'react';

/**
 * Premium "Cancel Order" dialog with optional reason.
 *
 * Props:
 *  - order: order object
 *  - onClose()
 *  - onConfirm(note?: string): async — caller cancels the order
 */
export default function OrderCancelDialog({ order, onClose, onConfirm }) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const handleClose = () => {
    if (!submitting) {
      setNote('');
      onClose?.();
    }
  };

  const handleYes = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm?.(note.trim() || undefined);
      setNote('');
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ animation: 'fadeIn .15s ease-out' }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={handleClose} />

      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1a24] to-[#111118] shadow-[0_30px_80px_-20px_rgba(244,63,94,0.35),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden"
        style={{ animation: 'popIn .25s cubic-bezier(.2,.9,.3,1.2)' }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/60 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

        <div className="relative p-6">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/30 to-rose-600/10 border border-rose-400/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(244,63,94,0.5)]">
            <svg className="w-7 h-7 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>

          <h3 className="text-center text-lg font-bold text-white">Cancel this order?</h3>
          <p className="mt-1.5 text-center text-sm text-slate-400">
            Order{' '}
            <span className="font-mono font-semibold text-rose-300">
              #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
            </span>{' '}
            will be marked as cancelled. This action cannot be undone.
          </p>

          <div className="mt-5 rounded-xl border border-white/5 bg-black/30 p-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Customer</p>
              <p className="text-sm text-white font-medium truncate">
                {order.customerName || 'Unknown'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-sm font-bold text-white">
                ${Number(order.totalAmount ?? order.total ?? 0).toFixed(2)}
              </p>
            </div>
          </div>

          <label className="block mt-4 text-xs font-medium text-slate-400 mb-1.5">
            Reason <span className="text-slate-600">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="e.g. Customer requested cancellation"
            className="w-full px-3 py-2 rounded-lg bg-[#0d0d14] border border-white/5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-400/40 focus:ring-2 focus:ring-rose-500/10 transition-all resize-none"
          />

          <div className="mt-6 flex items-center gap-2">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 text-sm font-semibold hover:bg-white/[0.07] transition-all disabled:opacity-40"
            >
              Keep order
            </button>
            <button
              onClick={handleYes}
              disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 text-white text-sm font-semibold border border-rose-400/50 shadow-[0_8px_24px_-8px_rgba(244,63,94,0.7)] hover:from-rose-400 hover:to-rose-500 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Yes, cancel order
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn  { 0% { opacity: 0; transform: scale(.92) translateY(8px) } 100% { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>
    </div>
  );
}
