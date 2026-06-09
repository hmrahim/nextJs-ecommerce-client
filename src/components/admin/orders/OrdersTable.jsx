
'use client';
import { useState } from 'react';

export const ORDER_STATUS = {
  pending:    { label: 'Pending',    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   dot: 'bg-amber-400' },
  confirmed:  { label: 'Confirmed',  cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20',         dot: 'bg-sky-400' },
  processing: { label: 'Processing', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20', dot: 'bg-violet-400' },
  shipped:    { label: 'Shipped',    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',       dot: 'bg-blue-400' },
  delivered:  { label: 'Delivered',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-500/10 text-red-400 border-red-500/20',         dot: 'bg-red-400' },
  refunded:   { label: 'Refunded',   cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20',   dot: 'bg-slate-400' },
};

export function StatusBadge({ status }) {
  const cfg = ORDER_STATUS[status] || ORDER_STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Avatar({ name }) {
  const initials = (name || 'UN').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const colors = ['bg-violet-500/20 text-violet-400', 'bg-sky-500/20 text-sky-400', 'bg-emerald-500/20 text-emerald-400', 'bg-amber-500/20 text-amber-400'];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-full ${color} border border-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function OrdersTable({
  orders = [],
  loading,
  selected = [],
  onSelectChange,
  onViewOrder,
  onUpdateStatus,
  pagination,
  onPageChange,
}) {
  const [actionMenu, setActionMenu] = useState(null);

  const allSelected = orders.length > 0 && selected.length === orders.length;
  const toggleAll = () => onSelectChange(allSelected ? [] : orders.map(o => o._id));
  const toggleOne = (id) => onSelectChange(
    selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
  );

  const NEXT_STATUS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['refunded'],
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
        <div className="p-12 flex items-center justify-center gap-3 text-slate-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading orders…
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-violet-500"
                />
              </th>
              {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e2e]">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>No orders found</span>
                  </div>
                </td>
              </tr>
            ) : orders.map((order) => {
              const nextStatuses = NEXT_STATUS[order.status] || [];
              return (
                <tr
                  key={order._id}
                  className={`group hover:bg-white/[0.02] transition-colors ${selected.includes(order._id) ? 'bg-violet-500/5' : ''}`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(order._id)}
                      onChange={() => toggleOne(order._id)}
                      className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-violet-500"
                    />
                  </td>

                  {/* Order Number */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onViewOrder(order)}
                      className="text-violet-400 hover:text-violet-300 font-mono font-semibold text-sm transition-colors hover:underline"
                    >
                      #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                    </button>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={order.customerName || order.userId?.firstName} />
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate max-w-[130px]">
                          {order.customerName || `${order.userId?.firstName || ''} ${order.userId?.lastName || ''}`.trim() || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[130px]">
                          {order.customerEmail || order.userId?.email || '—'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Items */}
                  <td className="px-4 py-3">
                    <span className="text-slate-300">
                      {order.items?.length ?? 0} <span className="text-slate-500">item{order.items?.length !== 1 ? 's' : ''}</span>
                    </span>
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3">
                    <span className="text-white font-semibold">${(order.totalAmount ?? order.total ?? 0).toFixed(2)}</span>
                    {order.discountAmount > 0 && (
                      <span className="ml-1.5 text-xs text-emerald-400">-${order.discountAmount.toFixed(2)}</span>
                    )}
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : order.paymentStatus === 'failed'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {order.paymentStatus || 'pending'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3">
                    <span className="text-slate-400 text-xs whitespace-nowrap">
                      {order.placedAt || order.createdAt
                        ? new Date(order.placedAt || order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onViewOrder(order)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-violet-400 transition-colors"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {/* Quick status update dropdown */}
                      {nextStatuses.length > 0 && (
                        <div className="relative">
                          <button
                            onClick={() => setActionMenu(actionMenu === order._id ? null : order._id)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-sky-400 transition-colors"
                            title="Update Status"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          {actionMenu === order._id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                              <div className="absolute right-0 top-full mt-1 z-20 bg-[#16161f] border border-[#1e1e2e] rounded-xl shadow-2xl overflow-hidden min-w-[140px]">
                                {nextStatuses.map(s => {
                                  const cfg = ORDER_STATUS[s];
                                  return (
                                    <button
                                      key={s}
                                      onClick={() => { onUpdateStatus(order._id, s); setActionMenu(null); }}
                                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left"
                                    >
                                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                      <span className="text-slate-300">→ {cfg.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-4 py-3 border-t border-[#1e1e2e] flex items-center justify-between text-sm flex-wrap gap-2">
          <span className="text-slate-500">
            Page {pagination.page} of {pagination.pages} · {pagination.total} orders
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1 rounded-lg border border-[#1e1e2e] text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              const p = Math.max(1, pagination.page - 2) + i;
              if (p > pagination.pages) return null;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === pagination.page ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1 rounded-lg border border-[#1e1e2e] text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
