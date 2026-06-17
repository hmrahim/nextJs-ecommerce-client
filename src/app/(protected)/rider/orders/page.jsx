'use client';

import { useState, useMemo } from 'react';
import {
  useRiderOrders,
  useRiderPickup,
  useRiderDeliver,
} from '@/hooks/useOrder';

/**
 * Rider dashboard — list of assigned orders, with pickup + complete-delivery flow.
 * Mounted at: /rider/orders  (under (protected) group, rider-only)
 */
export default function RiderOrdersPage() {
  const [tab, setTab] = useState('active'); // active | shipped | history
  const filter =
    tab === 'active'  ? { status: 'confirmed' } :
    tab === 'shipped' ? { status: 'shipped' } :
                        { status: 'delivered' };

  const { data, isLoading, refetch } = useRiderOrders(filter);
  const orders = data?.data || [];

  const [activeOrder, setActiveOrder] = useState(null);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Deliveries</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your assigned orders</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-300 text-sm hover:bg-[#1e1e2e]"
          >↻ Refresh</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 bg-[#13131a] rounded-xl border border-[#1e1e2e] w-fit">
          {[
            { key: 'active',  label: '🕐 To pick up' },
            { key: 'shipped', label: '🚚 Out for delivery' },
            { key: 'history', label: '✅ Delivered' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                tab === t.key
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >{t.label}</button>
          ))}
        </div>

        {/* Orders */}
        {isLoading ? (
          <div className="text-slate-500 py-16 text-center">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1e1e2e] py-16 text-center text-slate-500">
            <div className="text-5xl mb-2">📭</div>
            No orders in this category
          </div>
        ) : (
          <div className="grid gap-3">
            {orders.map((o) => (
              <RiderOrderCard key={o._id} order={o} onOpen={() => setActiveOrder(o)} />
            ))}
          </div>
        )}
      </div>

      {activeOrder && (
        <RiderActionSheet
          order={activeOrder}
          onClose={() => setActiveOrder(null)}
          onDone={() => { setActiveOrder(null); refetch(); }}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
function RiderOrderCard({ order, onOpen }) {
  const a = order.shippingAddress || {};
  const isConfirmed = order.status === 'confirmed';
  const isShipped   = order.status === 'shipped';

  return (
    <button
      onClick={onOpen}
      className="text-left rounded-xl border border-[#1e1e2e] bg-[#13131a] p-4 hover:border-amber-500/40 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-white">{order.orderNumber}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
              isConfirmed ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
              isShipped   ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {order.status.toUpperCase()}
            </span>
          </div>
          <div className="mt-1.5 text-sm text-white">{a.firstName} {a.lastName}</div>
          <div className="text-xs text-slate-400">📞 {a.phone}</div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            📍 {a.houseNo ? `${a.houseNo}, ` : ''}{a.road ? `${a.road}, ` : ''}{a.area || a.mapAddress}
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-semibold text-amber-400">SAR {Number(order.total).toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500 uppercase mt-0.5">{order.paymentMethod}</div>
        </div>
      </div>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────── */
function RiderActionSheet({ order, onClose, onDone }) {
  const pickup  = useRiderPickup();
  const deliver = useRiderDeliver();
  const isOnlinePaid = order.paymentStatus === 'paid';

  const [paymentMethod, setPaymentMethod] = useState(isOnlinePaid ? 'online_already_paid' : order.paymentMethod || 'cod');
  const [amount, setAmount]         = useState(order.total);
  const [transactionId, setTxn]     = useState('');
  const [note, setNote]             = useState('');

  const needsTxn = ['bkash', 'nagad', 'rocket', 'card', 'bank'].includes(paymentMethod);

  const a = order.shippingAddress || {};

  const handlePickup = async () => {
    await pickup.mutateAsync(order._id);
    onDone();
  };

  const handleDeliver = async () => {
    await deliver.mutateAsync({
      id: order._id,
      paymentMethod,
      amountCollected: paymentMethod === 'online_already_paid' ? order.total : Number(amount),
      transactionId: transactionId || undefined,
      note: note || undefined,
    });
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div
        className="relative w-full max-w-lg max-h-[95vh] overflow-hidden rounded-t-2xl sm:rounded-2xl border border-[#1e1e2e] bg-[#0e0e17] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#1e1e2e]">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-white">{order.orderNumber}</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl">×</button>
          </div>
          <div className="text-xs text-slate-500 mt-1">Total: <span className="text-amber-400 font-semibold">SAR {Number(order.total).toLocaleString('en-IN')}</span></div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Customer card */}
          <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-4">
            <div className="text-sm text-white">{a.firstName} {a.lastName}</div>
            <a href={`tel:${a.phone}`} className="text-sm text-amber-400 hover:underline">📞 {a.phone}</a>
            <div className="text-xs text-slate-400 mt-2 leading-relaxed">
              📍 {a.houseNo ? `${a.houseNo}, ` : ''}{a.road ? `${a.road}, ` : ''}{a.area || a.mapAddress}
              {a.city && <>, {a.city}</>}
            </div>
            {a.lat && a.lng && (
              <a
                href={`https://www.google.com/maps?q=${a.lat},${a.lng}`}
                target="_blank" rel="noreferrer"
                className="inline-block mt-2 text-xs text-blue-400 hover:underline"
              >🗺️ Open in Maps</a>
            )}
            {a.note && <div className="mt-2 text-[11px] text-amber-400">Note: {a.note}</div>}
          </div>

          {/* Items quick list */}
          <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Items</div>
            {(order.items || []).map((it, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-slate-300">{it.productName} × {it.quantity}</span>
                <span className="text-slate-400">SAR {it.lineTotal}</span>
              </div>
            ))}
          </div>

          {/* Pickup action */}
          {order.status === 'confirmed' && (
            <button
              onClick={handlePickup}
              disabled={pickup.isPending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium hover:opacity-90 disabled:opacity-50"
            >
              {pickup.isPending ? 'Updating…' : '🚚 Mark as Picked Up'}
            </button>
          )}

          {/* Delivery + payment */}
          {order.status === 'shipped' && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <div className="text-sm font-medium text-emerald-300">Complete Delivery</div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">
                  Payment received via
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#0a0a12] border border-[#1e1e2e] rounded-lg p-2.5 text-sm text-white"
                >
                  {isOnlinePaid && <option value="online_already_paid">Already paid online ✓</option>}
                  <option value="cod">Cash on delivery</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                  <option value="card">Card (POS)</option>
                  <option value="bank">Bank transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {paymentMethod !== 'online_already_paid' && (
                <>
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">
                      Amount collected (SAR )
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[#0a0a12] border border-[#1e1e2e] rounded-lg p-2.5 text-sm text-white"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">Order total: SAR {order.total}</div>
                  </div>
                  {needsTxn && (
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">
                        Transaction ID
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTxn(e.target.value)}
                        placeholder="e.g. TX12345678"
                        className="w-full bg-[#0a0a12] border border-[#1e1e2e] rounded-lg p-2.5 text-sm text-white"
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">
                  Note (optional)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-[#0a0a12] border border-[#1e1e2e] rounded-lg p-2.5 text-sm text-white resize-none"
                />
              </div>

              <button
                onClick={handleDeliver}
                disabled={deliver.isPending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                {deliver.isPending ? 'Completing…' : '✅ Confirm Delivery & Payment'}
              </button>
            </div>
          )}

          {order.status === 'delivered' && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-emerald-300 text-sm">
              ✅ This order has been delivered
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
