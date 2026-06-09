
'use client';
import { useState, useEffect } from 'react';

const ADJ_TYPES = [
  { value: 'restock',    label: 'Restock',    icon: '📦', desc: 'Add received stock from supplier' },
  { value: 'adjustment', label: 'Adjustment', icon: '✏️', desc: 'Manual correction' },
  { value: 'damage',     label: 'Damage',     icon: '⚠️', desc: 'Remove damaged/expired goods' },
  { value: 'return',     label: 'Return',     icon: '↩️', desc: 'Stock returned from customer' },
];

export default function AdjustStockModal({ item, onClose, onSave }) {
  const [type,     setType]    = useState('restock');
  const [delta,    setDelta]   = useState('');
  const [reason,   setReason]  = useState('');
  const [saving,   setSaving]  = useState(false);
  const [error,    setError]   = useState('');

  if (!item) return null;

  const isDeduction = type === 'damage';
  const parsedDelta = parseInt(delta, 10) || 0;
  const newQty = isDeduction
    ? item.quantity - parsedDelta
    : item.quantity + parsedDelta;

  const handleSave = async () => {
    if (!parsedDelta || parsedDelta <= 0) { setError('Enter a valid quantity greater than 0.'); return; }
    if (!reason.trim()) { setError('Please provide a reason.'); return; }
    if (isDeduction && parsedDelta > item.quantity) { setError(`Cannot remove more than current stock (${item.quantity}).`); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(item._id, { type, delta: isDeduction ? -parsedDelta : parsedDelta, reason });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full h-10 px-3 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#111118] rounded-2xl border border-[#1e1e2e] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1e1e2e] flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Adjust Stock</h2>
            <p className="text-sm text-slate-500 mt-0.5 font-mono">{item.variantSku}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Current stock */}
          <div className="rounded-xl bg-[#0d0d14] border border-[#1e1e2e] p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">Current Stock</div>
              <div className="text-2xl font-bold text-white">{item.quantity.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Reserved</div>
              <div className="text-xl font-semibold text-slate-300">{item.reserved.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Available</div>
              <div className="text-xl font-semibold text-emerald-400">{Math.max(0, item.quantity - item.reserved).toLocaleString()}</div>
            </div>
          </div>

          {/* Adjustment type */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Adjustment Type</label>
            <div className="grid grid-cols-2 gap-2">
              {ADJ_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-all ${type === t.value ? 'border-violet-500/50 bg-violet-500/10' : 'border-[#1e1e2e] bg-[#0d0d14] hover:border-slate-600'}`}
                >
                  <div className="text-sm font-medium text-white">{t.icon} {t.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              Quantity to {isDeduction ? 'Remove' : 'Add'}
            </label>
            <input
              type="number"
              min="1"
              value={delta}
              onChange={e => { setDelta(e.target.value); setError(''); }}
              placeholder="0"
              className={inputCls}
            />
            {parsedDelta > 0 && (
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                <span>New stock will be:</span>
                <span className={`font-bold ${newQty < 0 ? 'text-red-400' : newQty <= item.threshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {Math.max(0, newQty).toLocaleString()} units
                </span>
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Reason / Note</label>
            <textarea
              value={reason}
              onChange={e => { setReason(e.target.value); setError(''); }}
              placeholder="e.g. Received from supplier PO-2024-12"
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1e1e2e] flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : 'Save Adjustment'}
          </button>
          <button
            onClick={onClose}
            className="px-5 h-10 rounded-xl border border-[#1e1e2e] text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
