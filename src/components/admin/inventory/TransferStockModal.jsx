
'use client';
import { useState } from 'react';

export default function TransferStockModal({ item, warehouses = [], onClose, onSave }) {
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [qty,    setQty]    = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  if (!item) return null;

  const destWarehouses = warehouses.filter(w => w._id !== item.warehouseId && w.isActive);
  const parsedQty = parseInt(qty, 10) || 0;

  const handleSave = async () => {
    if (!toWarehouseId) { setError('Select a destination warehouse.'); return; }
    if (!parsedQty || parsedQty <= 0) { setError('Enter a valid transfer quantity.'); return; }
    if (parsedQty > item.quantity - item.reserved) { setError(`Available stock is only ${item.quantity - item.reserved}.`); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ fromInventoryId: item._id, toWarehouseId, quantity: parsedQty, reason });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full h-10 px-3 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors';
  const selectCls = 'w-full h-10 px-3 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] text-sm text-slate-300 focus:outline-none focus:border-sky-500/50 transition-colors cursor-pointer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#111118] rounded-2xl border border-[#1e1e2e] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1e1e2e] flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Transfer Stock</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{item.variantSku}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Route visualization */}
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">From</div>
              <div className="text-sm font-semibold text-white">{item.warehouseName}</div>
              <div className="text-xs text-sky-400 mt-1">{(item.quantity - item.reserved).toLocaleString()} avail.</div>
            </div>
            <svg className="w-5 h-5 text-sky-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="flex-1 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">To</div>
              <div className="text-sm font-semibold text-slate-300">
                {toWarehouseId ? warehouses.find(w => w._id === toWarehouseId)?.name : '—'}
              </div>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Destination Warehouse</label>
            <select value={toWarehouseId} onChange={e => { setToWarehouseId(e.target.value); setError(''); }} className={selectCls}>
              <option value="">Select destination…</option>
              {destWarehouses.map(w => <option key={w._id} value={w._id}>{w.name} — {w.city}</option>)}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Transfer Quantity</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={e => { setQty(e.target.value); setError(''); }}
              placeholder="0"
              className={inputCls}
            />
            {parsedQty > 0 && (
              <div className="mt-2 text-xs text-slate-400">
                Remaining at source: <span className="text-white font-semibold">{Math.max(0, item.quantity - item.reserved - parsedQty).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Rebalancing regional stock"
              className={inputCls}
            />
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1e1e2e] flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-10 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Transferring…
              </>
            ) : 'Confirm Transfer'}
          </button>
          <button onClick={onClose} className="px-5 h-10 rounded-xl border border-[#1e1e2e] text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
