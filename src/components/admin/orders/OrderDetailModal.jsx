
'use client';
import { useState } from 'react';
import { StatusBadge, ORDER_STATUS } from './OrdersTable';

const TIMELINE_ICONS = {
  pending:    '🕐',
  confirmed:  '✅',
  processing: '⚙️',
  shipped:    '🚚',
  delivered:  '📦',
  cancelled:  '❌',
  refunded:   '↩️',
};

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    await onUpdateStatus(order._id, newStatus, statusNote);
    setUpdating(false);
    setNewStatus('');
    setStatusNote('');
  };

  const statusHistory = order.statusHistory || [];
  const items = order.items || [];
  const shipping = order.shippingAddress || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#0e0e17] border border-[#1e1e2e] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">
                Order #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
              </h2>
              <p className="text-slate-500 text-xs">
                {order.placedAt || order.createdAt
                  ? new Date(order.placedAt || order.createdAt).toLocaleString()
                  : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Customer + Shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Section title="Customer">
              <div className="space-y-1.5">
                <p className="text-white font-medium">
                  {order.customerName || `${order.userId?.firstName || ''} ${order.userId?.lastName || ''}`.trim() || 'Unknown'}
                </p>
                <p className="text-slate-400 text-sm">{order.customerEmail || order.userId?.email || '—'}</p>
                <p className="text-slate-500 text-sm">{order.customerPhone || order.userId?.phone || '—'}</p>
              </div>
            </Section>
            <Section title="Shipping Address">
              <div className="space-y-1 text-sm text-slate-400">
                {shipping.street && <p>{shipping.street}</p>}
                {(shipping.city || shipping.state) && <p>{[shipping.city, shipping.state].filter(Boolean).join(', ')}</p>}
                {(shipping.country || shipping.zip) && <p>{[shipping.zip, shipping.country].filter(Boolean).join(' ')}</p>}
                {!shipping.street && <p className="text-slate-600">No address provided</p>}
              </div>
            </Section>
          </div>

          {/* Items */}
          <Section title={`Order Items (${items.length})`}>
            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-slate-600 text-sm">No items</p>
              ) : items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400 flex-shrink-0">
                    {item.productId?.name?.[0] || item.name?.[0] || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.productId?.name || item.name || 'Product'}</p>
                    <p className="text-slate-500 text-xs">
                      {item.variantSku && <span className="font-mono mr-2">{item.variantSku}</span>}
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-white font-semibold text-sm flex-shrink-0">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Totals + Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Section title="Order Summary">
              <div className="space-y-2 text-sm">
                {[
                  ['Subtotal', order.subtotal],
                  ['Tax', order.taxAmount],
                  ['Shipping', order.shippingAmount],
                  ['Discount', order.discountAmount ? -order.discountAmount : null],
                ].map(([label, val]) => val != null && (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className={val < 0 ? 'text-emerald-400' : 'text-slate-300'}>
                      {val < 0 ? '-' : ''}${Math.abs(val).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-[#1e1e2e]">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-white font-bold">${(order.totalAmount ?? order.total ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </Section>
            <Section title="Payment">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Method</span>
                  <span className="text-slate-300 capitalize">{order.paymentMethod || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-medium capitalize ${
                    order.paymentStatus === 'paid' ? 'text-emerald-400' :
                    order.paymentStatus === 'failed' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {order.paymentStatus || 'pending'}
                  </span>
                </div>
                {order.couponId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coupon</span>
                    <span className="text-emerald-400 font-mono text-xs">{typeof order.couponId === 'string' ? order.couponId : order.couponId?.code}</span>
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* Timeline */}
          {statusHistory.length > 0 && (
            <Section title="Status Timeline">
              <div className="relative pl-6 space-y-3">
                <div className="absolute left-2 top-1 bottom-1 w-px bg-[#1e1e2e]" />
                {statusHistory.map((entry, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[18px] top-0.5 w-3 h-3 rounded-full bg-[#1e1e2e] border border-violet-500/40 flex items-center justify-center text-[8px]">
                      {TIMELINE_ICONS[entry.status] || '•'}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <StatusBadge status={entry.status} />
                        {entry.note && <p className="text-slate-500 text-xs mt-1">{entry.note}</p>}
                      </div>
                      <span className="text-slate-600 text-xs whitespace-nowrap flex-shrink-0">
                        {entry.changedAt ? new Date(entry.changedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Update Status */}
          {order.status !== 'delivered' && order.status !== 'refunded' && (
            <Section title="Update Status">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ORDER_STATUS)
                    .filter(([s]) => s !== order.status)
                    .map(([s, cfg]) => (
                      <button
                        key={s}
                        onClick={() => setNewStatus(s === newStatus ? '' : s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          newStatus === s
                            ? `${cfg.cls} ring-2 ring-violet-500/30`
                            : 'border-[#1e1e2e] text-slate-500 hover:border-slate-600 hover:text-slate-300'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                </div>
                {newStatus && (
                  <>
                    <input
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      placeholder="Optional note (e.g. tracking number)…"
                      className="w-full px-3 py-2 rounded-lg bg-[#0e0e17] border border-[#1e1e2e] text-slate-300 placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50"
                    />
                    <button
                      onClick={handleStatusUpdate}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                    >
                      {updating ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : null}
                      Update to {ORDER_STATUS[newStatus]?.label}
                    </button>
                  </>
                )}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
