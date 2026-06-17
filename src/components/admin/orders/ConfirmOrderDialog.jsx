'use client';

import { useState, useMemo } from 'react';
import { useRiders, useConfirmOrder } from '@/hooks/useOrder';
import toast from 'react-hot-toast';

/**
 * Amazon/Noon-style "Confirm Order" dialog.
 * Forces admin to pick an active rider before confirming the order.
 *
 * Props:
 *  - order: full order object (must include _id, orderNumber, shippingAddress)
 *  - onClose()
 *  - onConfirmed?(updatedOrder)
 */
export default function ConfirmOrderDialog({ order, onClose, onConfirmed }) {
  const [riderId, setRiderId] = useState('');
  const [note, setNote]       = useState('');
  const [search, setSearch]   = useState('');

  const { data: riders = [], isLoading } = useRiders({ availableOnly: true });
  const confirmMut = useConfirmOrder();

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return riders;
    return riders.filter((r) =>
      r.name.toLowerCase().includes(s) ||
      r.phone?.toLowerCase().includes(s) ||
      r.serviceAreas?.some((a) => a.toLowerCase().includes(s)),
    );
  }, [riders, search]);

  const selected = riders.find((r) => r._id === riderId);

  const handleSubmit = async () => {
    try {
      const res = await confirmMut.mutateAsync({ id: order._id, riderId, note });
      onConfirmed?.(res?.data?.data);
      onClose();
    } catch { /* toast handled in hook */ }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#1e1e2e] bg-gradient-to-b from-[#13131a] to-[#0e0e17] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#1e1e2e]">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-amber-400">⚡</span> Confirm Order &amp; Assign Rider
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Order <span className="text-slate-300 font-mono">{order.orderNumber}</span> ·
              {' '}<span className="text-slate-300">{order.shippingAddress?.city || order.shippingAddress?.area || '—'}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rider by name, phone, or area..."
              className="w-full bg-[#0a0a12] border border-[#1e1e2e] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500/50 focus:outline-none"
            />
            <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
          </div>

          {/* Rider list */}
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">
              Available riders ({filtered.length})
            </div>

            {isLoading ? (
              <div className="text-slate-500 text-sm py-8 text-center">Loading riders…</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#1e1e2e] py-8 text-center text-slate-500 text-sm">
                No available riders found
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {filtered.map((r) => {
                  const active = r._id === riderId;
                  return (
                    <button
                      key={r._id}
                      type="button"
                      onClick={() => setRiderId(r._id)}
                      className={[
                        'text-left rounded-xl border p-3 transition-all',
                        active
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40'
                          : 'border-[#1e1e2e] bg-[#0a0a12] hover:border-[#2a2a3e]',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                          {r.name?.charAt(0) || 'R'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{r.name}</div>
                          <div className="text-[11px] text-slate-500 truncate">{r.phone || '—'}</div>
                        </div>
                        {active && <span className="text-amber-400 text-lg">✓</span>}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-[#1e1e2e] text-slate-300">
                          🛵 {r.vehicleType}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                          {r.activeOrders} active
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                          ⭐ {Number(r.rating).toFixed(1)}
                        </span>
                      </div>
                      {r.serviceAreas?.length > 0 && (
                        <div className="mt-1.5 text-[10px] text-slate-500 truncate">
                          📍 {r.serviceAreas.join(' · ')}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">
              Note for rider (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. Call customer before reaching, fragile items..."
              className="w-full bg-[#0a0a12] border border-[#1e1e2e] rounded-lg p-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500/50 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1e1e2e] p-4 flex items-center justify-between gap-3 bg-[#0a0a12]">
          <div className="text-xs text-slate-500">
            {selected ? (
              <>Confirming with <span className="text-amber-400">{selected.name}</span></>
            ) : (
              <>No rider selected — confirming without assigning</>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-300 hover:bg-[#1e1e2e] text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={confirmMut.isPending}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            >
              {confirmMut.isPending ? 'Confirming…' : '✓ Confirm Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}