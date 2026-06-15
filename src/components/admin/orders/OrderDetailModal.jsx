'use client';

import { useState } from 'react';
import ConfirmOrderDialog from './ConfirmOrderDialog';
import OrderCancelDialog from './OrderCancelDialog';
import {
  useAdminUpdateStatus,
  useAdminCancelOrder,
} from '@/hooks/useOrder';

/* ────────────────────────────────────────────────────────────
   STATUS META — Amazon/Noon style
─────────────────────────────────────────────────────────── */
const STATUS_META = {
  pending:   { label: 'Pending',        color: 'amber',   icon: '🕐', step: 1 },
  confirmed: { label: 'Confirmed',      color: 'blue',    icon: '✅', step: 2 },
  shipped:   { label: 'Out for Delivery', color: 'indigo', icon: '🚚', step: 3 },
  delivered: { label: 'Delivered',      color: 'emerald', icon: '📦', step: 4 },
  cancelled: { label: 'Cancelled',      color: 'rose',    icon: '❌', step: 0 },
  refunded:  { label: 'Refunded',       color: 'slate',   icon: '↩️', step: 0 },
};

const TONE = {
  amber:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  blue:    'bg-blue-500/15 text-blue-300 border-blue-500/30',
  indigo:  'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  rose:    'bg-rose-500/15 text-rose-300 border-rose-500/30',
  slate:   'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${TONE[m.color]}`}>
      <span>{m.icon}</span>{m.label}
    </span>
  );
}

function Section({ title, action, children }) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Progress tracker (Amazon-style 4 steps)
─────────────────────────────────────────────────────────── */
function ProgressTracker({ status }) {
  const steps = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered'];
  const currentStep = STATUS_META[status]?.step || 0;
  const isCancelled = status === 'cancelled' || status === 'refunded';

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center">
        <div className="text-rose-300 font-medium">This order was {status}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-5">
      <div className="flex items-center justify-between">
        {steps.map((label, idx) => {
          const step = idx + 1;
          const done = step <= currentStep;
          const active = step === currentStep;
          return (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              {idx > 0 && (
                <div
                  className={`absolute right-1/2 top-4 h-0.5 w-full ${
                    step <= currentStep ? 'bg-emerald-500' : 'bg-[#1e1e2e]'
                  }`}
                />
              )}
              <div
                className={[
                  'relative z-10 h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all',
                  done
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-[#0e0e17] border-[#1e1e2e] text-slate-500',
                  active && 'ring-4 ring-emerald-500/20 scale-110',
                ].join(' ')}
              >
                {done ? '✓' : step}
              </div>
              <div className={`mt-2 text-[11px] ${done ? 'text-white' : 'text-slate-500'}`}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* (Rider reassign UI removed — rider assignment is no longer part of order confirmation flow) */

/* ════════════════════════════════════════════════════════════
   MAIN MODAL
═══════════════════════════════════════════════════════════ */
export default function OrderDetailModal({ order, onClose, onUpdated }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancel, setShowCancel]   = useState(false);
  const updateStatus = useAdminUpdateStatus();
  const cancelMut    = useAdminCancelOrder();

  if (!order) return null;

  const items    = order.items || [];
  const shipping = order.shippingAddress || {};
  const history  = order.statusHistory || [];
  const rider    = order.rider || {};
  const pay      = order.paymentCollection || {};
  const currency = (n) => `৳${Number(n || 0).toLocaleString('en-IN')}`;

  const handleStatus = async (status, note = '') => {
    const res = await updateStatus.mutateAsync({ id: order._id, status, note });
    onUpdated?.(res?.data?.data);
  };
  const handleConfirmYes = async () => {
    const res = await updateStatus.mutateAsync({ id: order._id, status: 'confirmed' });
    onUpdated?.(res?.data?.data);
  };
  const handleCancelYes = async (note) => {
    const res = await cancelMut.mutateAsync({ id: order._id, note: note || '' });
    onUpdated?.(res?.data?.data);
  };


  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <div
          className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-[#1e1e2e] bg-[#0e0e17] shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-[#1e1e2e] bg-gradient-to-r from-[#13131a] to-[#0e0e17]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
                📦
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white font-mono">{order.orderNumber}</h2>
                  <StatusPill status={order.status} />
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    order.paymentStatus === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {order.paymentStatus?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Placed {new Date(order.placedAt || order.createdAt).toLocaleString()} · {items.length} item(s) · {currency(order.total)}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl leading-none">×</button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Progress */}
            <ProgressTracker status={order.status} />

            {/* Quick actions */}
            {order.status === 'pending' && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-amber-300">Awaiting confirmation</div>
                  <div className="text-xs text-slate-500 mt-0.5">Review the order and confirm to move it forward.</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCancel(true)}
                    className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-300 text-sm hover:bg-rose-500/10"
                  >Cancel</button>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium"
                  >✓ Confirm Order</button>
                </div>
              </div>
            )}


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* LEFT — items + history */}
              <div className="lg:col-span-2 space-y-4">
                <Section title={`Items (${items.length})`}>
                  <div className="space-y-2">
                    {items.map((it, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1e1e2e]/40">
                        <div className="h-14 w-14 rounded-lg bg-[#0a0a12] border border-[#1e1e2e] overflow-hidden flex items-center justify-center">
                          {it.productImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.productImage} alt={it.productName} className="h-full w-full object-cover" />
                          ) : <span className="text-2xl">📦</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{it.productName}</div>
                          <div className="text-[11px] text-slate-500">
                            {it.variantSku !== 'default' && `SKU: ${it.variantSku} · `}
                            Qty {it.quantity} × {currency(it.unitPrice)}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-white">{currency(it.lineTotal)}</div>
                      </div>
                    ))}
                  </div>
                  {/* Totals */}
                  <div className="mt-4 pt-3 border-t border-[#1e1e2e] space-y-1.5 text-sm">
                    <Row label="Subtotal" value={currency(order.subtotal)} />
                    <Row label="Shipping" value={currency(order.shippingCost)} />
                    {order.couponDiscount > 0 && (
                      <Row label={`Coupon (${order.couponCode})`} value={`- ${currency(order.couponDiscount)}`} tone="emerald" />
                    )}
                    <Row label="Total" value={currency(order.total)} bold />
                  </div>
                </Section>

                <Section title="Order timeline">
                  <ol className="space-y-3">
                    {[...history].reverse().map((h, i) => (
                      <li key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-7 w-7 rounded-full bg-[#1e1e2e] flex items-center justify-center text-xs">
                            {STATUS_META[h.status]?.icon || '•'}
                          </div>
                          {i < history.length - 1 && <div className="flex-1 w-px bg-[#1e1e2e] my-1" />}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2">
                            <StatusPill status={h.status} />
                            <span className="text-[11px] text-slate-500">
                              {new Date(h.changedAt).toLocaleString()}
                            </span>
                          </div>
                          {h.note && <div className="text-xs text-slate-400 mt-1">{h.note}</div>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </Section>
              </div>

              {/* RIGHT — customer / rider / payment */}
              <div className="space-y-4">
                <Section title="Customer">
                  <div className="text-sm text-white">{order.customerName || `${shipping.firstName} ${shipping.lastName}`}</div>
                  <div className="text-xs text-slate-400 mt-0.5">📞 {shipping.phone}</div>
                  {order.customerEmail && <div className="text-xs text-slate-400">✉️ {order.customerEmail}</div>}
                </Section>

                <Section title="Shipping address">
                  <div className="text-sm text-slate-200 leading-relaxed">
                    {shipping.houseNo && `${shipping.houseNo}, `}
                    {shipping.road && `${shipping.road}, `}
                    {shipping.area || shipping.mapAddress}
                    {shipping.city && <>, {shipping.city}</>}
                    {shipping.postalCode && ` - ${shipping.postalCode}`}
                  </div>
                  {shipping.landmark && <div className="text-[11px] text-slate-500 mt-1">Landmark: {shipping.landmark}</div>}
                  {shipping.note && <div className="text-[11px] text-amber-400 mt-1">Note: {shipping.note}</div>}
                </Section>

                <Section title="Rider">

                  {rider.riderId ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm">
                          {(rider.riderName || 'R').charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm text-white">{rider.riderName}</div>
                          <div className="text-[11px] text-slate-500">{rider.riderPhone} · 🛵 {rider.vehicleType}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-500">
                        Assigned {rider.assignedAt && new Date(rider.assignedAt).toLocaleString()}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-slate-500">No rider assigned yet</div>
                  )}
                </Section>

                <Section title="Payment">
                  <div className="text-xs text-slate-400">
                    Method: <span className="text-white">{order.paymentMethod?.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Status: <span className="text-white">{order.paymentStatus?.toUpperCase()}</span>
                  </div>
                  {pay.collectedAt && (
                    <div className="mt-2 pt-2 border-t border-[#1e1e2e] text-[11px] text-slate-400">
                      <div>Collected: <span className="text-emerald-400">{currency(pay.amount)}</span> via {pay.method}</div>
                      {pay.transactionId && <div>Txn: <span className="font-mono text-slate-300">{pay.transactionId}</span></div>}
                      <div>At {new Date(pay.collectedAt).toLocaleString()}</div>
                    </div>
                  )}
                </Section>

                {/* Admin manual status (advanced) */}
                {!['cancelled', 'refunded', 'delivered'].includes(order.status) && (
                  <Section title="Quick actions">
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatus('shipped', 'Force-marked shipped by admin')}
                          className="text-xs px-3 py-1.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25"
                        >🚚 Mark shipped</button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => handleStatus('delivered', 'Force-marked delivered by admin')}
                          className="text-xs px-3 py-1.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                        >📦 Mark delivered</button>
                      )}
                      <button
                        onClick={() => setShowCancel(true)}
                        className="text-xs px-3 py-1.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25"
                      >❌ Cancel order</button>

                    </div>
                  </Section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmOrderDialog
          order={order}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirmYes}
        />
      )}

      {showCancel && (
        <OrderCancelDialog
          order={order}
          onClose={() => setShowCancel(false)}
          onConfirm={handleCancelYes}
        />
      )}
    </>
  );
}


function Row({ label, value, bold, tone }) {
  return (
    <div className={`flex justify-between ${bold ? 'pt-2 border-t border-[#1e1e2e] text-base font-semibold text-white' : 'text-slate-400'}`}>
      <span>{label}</span>
      <span className={tone === 'emerald' ? 'text-emerald-400' : ''}>{value}</span>
    </div>
  );
}
