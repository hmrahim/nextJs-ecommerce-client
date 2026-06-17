'use client';

import { useState, useEffect } from 'react';
import ConfirmOrderDialog from './ConfirmOrderDialog';
import OrderCancelDialog from './OrderCancelDialog';
import {
  useAdminUpdateStatus,
  useAdminCancelOrder,
  useAssignRider,
  useRiders,
} from '@/hooks/useOrder';
import api from '@/lib/api';

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

/* ────────────────────────────────────────────────────────────
   Reassign rider inline dropdown
─────────────────────────────────────────────────────────── */
function ReassignRiderInline({ orderId, currentRiderId }) {
  const { data: riders = [] } = useRiders({ availableOnly: true });
  const assignMut = useAssignRider();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs px-2.5 py-1 rounded-md border border-[#1e1e2e] text-slate-300 hover:bg-[#1e1e2e]"
      >
        Reassign
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 rounded-lg border border-[#1e1e2e] bg-[#0a0a12] shadow-xl z-10 max-h-64 overflow-y-auto">
          {riders.filter((r) => r._id !== currentRiderId).map((r) => (
            <button
              key={r._id}
              onClick={async () => {
                await assignMut.mutateAsync({ id: orderId, riderId: r._id });
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-[#1e1e2e] flex items-center justify-between"
            >
              <span>{r.name}</span>
              <span className="text-[10px] text-slate-500">{r.activeOrders} active</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Helper — find auth token from common storages (best effort)
─────────────────────────────────────────────────────────── */
function readAuthToken() {
  if (typeof window === 'undefined') return null;
  const keys = ['token', 'accessToken', 'authToken', 'admin_token', 'adminToken', 'jwt'];
  for (const k of keys) {
    const v = window.localStorage.getItem(k) || window.sessionStorage.getItem(k);
    if (v) return v.replace(/^"|"$/g, '');
  }
  return null;
}

/* ════════════════════════════════════════════════════════════
   MAIN MODAL
═══════════════════════════════════════════════════════════ */
export default function OrderDetailModal({ order: initialOrder, onClose, onUpdated }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [order, setOrder] = useState(initialOrder);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const updateStatus = useAdminUpdateStatus();
  const cancelMut    = useAdminCancelOrder();

  /* ── Fetch FULL enriched order (with product+variant) when modal opens.
     The list endpoint (`adminGetAll`) only returns lightweight rows; the
     `/api/admin/orders/:id` endpoint returns each item enriched with
     product, variant, currentStock, currentPrice, comparePrice etc. ── */
  useEffect(() => {
    setOrder(initialOrder);
    const id = initialOrder?._id;
    if (!id) return;

    let aborted = false;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoadingDetails(true);
        setFetchError(null);

        // ✅ FIX: Use the shared axios `api` instance instead of raw fetch.
        //   - `api` has baseURL = NEXT_PUBLIC_API_URL (already ends with /api)
        //     so we just call `/admin/orders/:id` — no /api/api/... 404.
        //   - The request interceptor pulls the token from NextAuth's
        //     getSession() and attaches `Authorization: Bearer <token>`.
        //     localStorage does NOT hold the token in this app, which is why
        //     the previous readAuthToken() approach produced HTTP 401.
        const res = await api.get(`/admin/orders/${id}`, { signal: ctrl.signal });
        const json = res.data;
        const full = json?.data || json?.order || json;
        if (!aborted && full && typeof full === 'object') {
          setOrder((prev) => ({ ...prev, ...full }));
        }
      } catch (e) {
        if (!aborted && e.name !== 'AbortError' && e.name !== 'CanceledError') {
          console.error('[OrderDetailModal] fetch full order failed', e);
          const status = e?.response?.status;
          setFetchError(status ? `HTTP ${status}` : (e.message || 'Failed to load full order'));
        }
      } finally {
        if (!aborted) setLoadingDetails(false);
      }
    })();

    return () => {
      aborted = true;
      ctrl.abort();
    };
  }, [initialOrder]);

  if (!order) return null;

  const items    = order.items || [];
  const shipping = order.shippingAddress || {};
  const history  = order.statusHistory || [];
  const rider    = order.rider || {};
  const pay      = order.paymentCollection || {};
  const currency = (n) => `SAR ${Number(n || 0).toLocaleString('en-IN')}`;

  const handleStatus = async (status, note = '') => {
    const res = await updateStatus.mutateAsync({ id: order._id, status, note });
    const updated = res?.data?.data;
    if (updated) setOrder((prev) => ({ ...prev, ...updated }));
    onUpdated?.(updated);
  };
  const openCancel = () => { setCancelNote(''); setShowCancel(true); };
  const closeCancel = () => { if (!cancelling) { setShowCancel(false); setCancelNote(''); } };
  const confirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelMut.mutateAsync({ id: order._id, note: cancelNote.trim() });
      const updated = res?.data?.data;
      if (updated) setOrder((prev) => ({ ...prev, ...updated }));
      onUpdated?.(updated);
      setShowCancel(false);
      setCancelNote('');
    } finally {
      setCancelling(false);
    }
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
                  {loadingDetails && (
                    <span className="text-[10px] text-slate-500 inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      Loading details…
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Placed {new Date(order.placedAt || order.createdAt).toLocaleString()} · {items.length} item(s) · {currency(order.total)}
                </p>
                {fetchError && (
                  <p className="text-[10px] text-rose-400 mt-1">
                    Could not load full product details ({fetchError}). Showing summary only.
                  </p>
                )}
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
                  <div className="text-xs text-slate-500 mt-0.5">You must select a rider before confirming this order.</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={openCancel}
                    className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-300 text-sm hover:bg-rose-500/10"
                  >Cancel</button>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium"
                  >✓ Confirm &amp; Assign Rider</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* LEFT — items + history */}
              <div className="lg:col-span-2 space-y-4">
                <Section
                  title={`Products ordered (${items.length})`}
                  action={
                    <span className="text-[10px] uppercase tracking-widest text-slate-600">
                      Per-product full details
                    </span>
                  }
                >
                  <div className="space-y-3">
                    {items.length === 0 && loadingDetails ? (
                      <div className="text-xs text-slate-500 py-6 text-center">Loading items…</div>
                    ) : items.length === 0 ? (
                      <div className="text-xs text-slate-500 py-6 text-center">No items found on this order.</div>
                    ) : (
                      items.map((it, i) => (
                        <OrderItemCard key={i} item={it} currency={currency} index={i + 1} />
                      ))
                    )}
                  </div>
                  {/* Totals */}
                  <div className="mt-5 pt-4 border-t border-[#1e1e2e] space-y-1.5 text-sm">
                    <Row label="Subtotal" value={currency(order.subtotal)} />
                    <Row label="Shipping" value={currency(order.shippingCost)} />
                    {order.couponDiscount > 0 && (
                      <Row label={`Coupon (${order.couponCode})`} value={`- ${currency(order.couponDiscount)}`} tone="emerald" />
                    )}
                    <Row label="Grand Total" value={currency(order.total)} bold />
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
                  <div className="text-sm text-white">{order.customerName || `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim() || 'Guest'}</div>
                  <div className="text-xs text-slate-400 mt-0.5">📞 {shipping.phone || '—'}</div>
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

                <Section
                  title="Rider"
                  action={
                    rider.riderId && ['confirmed', 'shipped'].includes(order.status) ? (
                      <ReassignRiderInline orderId={order._id} currentRiderId={rider.riderId?._id || rider.riderId} />
                    ) : null
                  }
                >
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
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button
                          onClick={openCancel}
                          className="text-xs px-3 py-1.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25"
                        >✕ Cancel order</button>
                      )}
                    </div>
                  </Section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm + assign rider dialog */}
      {showConfirm && (
        <ConfirmOrderDialog
          order={order}
          onClose={() => setShowConfirm(false)}
          onConfirmed={(updated) => { if (updated) setOrder((prev) => ({ ...prev, ...updated })); onUpdated?.(updated); setShowConfirm(false); }}
        />
      )}

      {/* Cancel dialog — standalone beautiful component */}
      {showCancel && (
        <OrderCancelDialog
          order={order}
          onClose={closeCancel}
          onConfirm={async (note) => {
            setCancelling(true);
            try {
              const res = await cancelMut.mutateAsync({ id: order._id, note });
              if (res?.data) setOrder((prev) => ({ ...prev, ...res.data }));
              onUpdated?.(res?.data);
              setShowCancel(false);
              setCancelNote('');
            } finally {
              setCancelling(false);
            }
          }}
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

/* ────────────────────────────────────────────────────────────
   Swatch — color name → CSS color (best-effort)
─────────────────────────────────────────────────────────── */
const COLOR_HINTS = {
  red: '#ef4444', crimson: '#dc2626', maroon: '#7f1d1d',
  pink: '#ec4899', rose: '#f43f5e', magenta: '#d946ef',
  orange: '#f97316', amber: '#f59e0b', yellow: '#eab308', gold: '#d4af37',
  green: '#22c55e', lime: '#84cc16', emerald: '#10b981', olive: '#65a30d',
  teal: '#14b8a6', cyan: '#06b6d4', sky: '#0ea5e9', blue: '#3b82f6',
  navy: '#1e3a8a', indigo: '#6366f1', violet: '#8b5cf6', purple: '#a855f7',
  brown: '#78350f', beige: '#e7d6b9', cream: '#fdf6e3', ivory: '#fffff0',
  white: '#ffffff', black: '#0a0a0a', gray: '#9ca3af', grey: '#9ca3af',
  silver: '#c0c0c0', charcoal: '#36454f',
};
function getSwatch(value) {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
  for (const k of Object.keys(COLOR_HINTS)) {
    if (v.includes(k)) return COLOR_HINTS[k];
  }
  return null;
}

/* ────────────────────────────────────────────────────────────
   OrderItemCard — Professional per-product detail card
─────────────────────────────────────────────────────────── */
function OrderItemCard({ item, currency, index }) {
  const [copied, setCopied] = useState(false);
  const product = item.product || null;
  const variant = item.variant || null;

  // Name fallback — prefer snapshot, then live product
  const name = item.productName || product?.name || 'Untitled product';

  // Image: prefer variant image, then snapshot, then first product image
  const image =
    item.variantImage ||
    item.productImage ||
    product?.images?.[0]?.url ||
    product?.image ||
    null;

  // Variant attributes — Mixed object {Color:'Red', Size:'M'} or Map
  const attrsRaw = item.variantAttrs || variant?.attributes || variant?.attrs || null;
  const attrEntries = attrsRaw && typeof attrsRaw === 'object'
    ? Object.entries(attrsRaw).filter(([, v]) => v != null && v !== '')
    : [];

  // Consider it a variant if: has non-default SKU, OR has variant attrs
  const isVariant = (item.variantSku && item.variantSku !== 'default') || attrEntries.length > 0;
  const stock = item.currentStock;
  const stockTone =
    stock == null ? 'text-slate-500' :
    stock <= 0 ? 'text-rose-300' :
    stock < 5 ? 'text-amber-300' : 'text-emerald-300';
  const stockLabel =
    stock == null ? 'Stock —' :
    stock <= 0 ? 'Out of stock' :
    `${stock} in stock`;

  const unitPrice = Number(item.unitPrice ?? item.price ?? item.currentPrice ?? product?.price ?? 0);
  const lineTotal = Number(item.lineTotal ?? item.totalPrice ?? (unitPrice * (item.quantity || 0)));
  const compare = item.comparePrice ?? product?.comparePrice ?? null;
  const hasDiscount = compare && compare > unitPrice && unitPrice > 0;

  const copySku = async () => {
    try {
      await navigator.clipboard.writeText(item.variantSku || product?.sku || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { /* noop */ }
  };

  return (
    <div className="group relative rounded-2xl border border-[#1e1e2e] bg-gradient-to-br from-[#15151f] via-[#111119] to-[#0e0e17] p-4 hover:border-amber-500/30 transition-all">
      {/* index pill */}
      <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-amber-500/30 ring-2 ring-[#0e0e17]">
        {index}
      </div>

      <div className="flex gap-4">
        {/* Image */}
        <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 rounded-xl overflow-hidden bg-[#0a0a12] border border-[#1e1e2e]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-3xl">📦</div>
          )}
          {hasDiscount && (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-bold">
              -{Math.round((1 - unitPrice / compare) * 100)}%
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {product?.brand?.name && (
                <div className="text-[10px] uppercase tracking-widest text-amber-400/80 font-semibold mb-0.5">
                  {product.brand.name}
                </div>
              )}
              <h4 className="text-sm sm:text-[15px] font-semibold text-white leading-snug line-clamp-2">
                {name}
              </h4>
              {product?.category?.name && (
                <div className="mt-1 text-[11px] text-slate-500">
                  in <span className="text-slate-400">{product.category.name}</span>
                </div>
              )}
            </div>

            {/* Price block */}
            <div className="text-right flex-shrink-0">
              <div className="text-base font-bold text-white">{currency(lineTotal)}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {item.quantity} × {currency(unitPrice)}
              </div>
              {hasDiscount && (
                <div className="text-[10px] text-slate-600 line-through">
                  {currency(compare)}
                </div>
              )}
            </div>
          </div>

          {/* Variant attributes — chips with color swatches */}
          {attrEntries.length > 0 ? (
            <div className="mt-3">
              <div className="text-[9px] uppercase tracking-widest text-slate-600 mb-1.5 font-semibold">Selected Variant</div>
              <div className="flex flex-wrap gap-1.5">
                {attrEntries.map(([k, v]) => {
                  const swatch = /color|colour/i.test(k) ? getSwatch(v) : null;
                  return (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[11px]"
                    >
                      <span className="text-indigo-400/80 uppercase tracking-wider text-[9px] font-semibold">{k}</span>
                      {swatch && (
                        <span
                          className="h-3 w-3 rounded-full border border-white/20 ring-1 ring-black/40"
                          style={{ background: swatch }}
                        />
                      )}
                      <span className="text-white font-medium">{String(v)}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ) : isVariant ? (
            <div className="mt-3 text-[11px] text-slate-500 italic">Variant selected (no attribute details stored)</div>
          ) : null}

          {/* Meta row: SKU + stock + variant badge + view link */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
            <button
              onClick={copySku}
              title="Copy SKU"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0a0a12] border border-[#1e1e2e] text-slate-300 font-mono hover:border-amber-500/40 hover:text-amber-300 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copied!' : (item.variantSku || product?.sku || '—')}
            </button>

            {isVariant ? (
              <span className="inline-flex items-center gap-1 text-indigo-300">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                Variant
              </span>
            ) : (
              <span className="text-slate-500">Standard product</span>
            )}

            <span className={`inline-flex items-center gap-1 ${stockTone}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {stockLabel}
            </span>

            {product?.slug && (
              <a
                href={`/shop/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
              >
                View product
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            )}
          </div>

          {/* Product attribute facts */}
          {product?.attributes?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#1e1e2e]/60 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1">
              {product.attributes.slice(0, 6).map((a, i) => (
                <div key={i} className="text-[10px]">
                  <span className="text-slate-600 uppercase tracking-wider">{a.key}: </span>
                  <span className="text-slate-300">{a.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}