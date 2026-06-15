
'use client';
import { useState } from 'react';
import ConfirmOrderDialog from './ConfirmOrderDialog';

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

/* ── Premium Action Button ─────────────────────────────────────────────── */
function ActionBtn({ variant = 'ghost', title, onClick, children, disabled }) {
  const variants = {
    view:
      'bg-gradient-to-b from-white/[0.06] to-white/[0.02] text-slate-200 border-white/10 hover:from-violet-500/20 hover:to-violet-500/5 hover:text-violet-300 hover:border-violet-400/30 hover:shadow-[0_0_0_1px_rgba(167,139,250,0.15),0_4px_18px_-4px_rgba(139,92,246,0.45)]',
    confirm:
      'bg-gradient-to-b from-emerald-500/20 to-emerald-600/10 text-emerald-300 border-emerald-400/25 hover:from-emerald-400/30 hover:to-emerald-500/15 hover:text-emerald-200 hover:border-emerald-300/50 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.25),0_4px_18px_-4px_rgba(16,185,129,0.55)]',
    cancel:
      'bg-gradient-to-b from-rose-500/15 to-rose-600/5 text-rose-300 border-rose-400/25 hover:from-rose-500/25 hover:to-rose-600/10 hover:text-rose-200 hover:border-rose-300/50 hover:shadow-[0_0_0_1px_rgba(244,114,182,0.25),0_4px_18px_-4px_rgba(244,63,94,0.55)]',
    ghost:
      'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/[0.08] hover:text-white',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`group/btn inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold border backdrop-blur-sm transition-all duration-200 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

const IconEye = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const IconX = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconMore = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
  </svg>
);
const IconTrash = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
  </svg>
);

export default function OrdersTable({
  orders = [],
  loading,
  selected = [],
  onSelectChange,
  onViewOrder,        // optional — if provided, View opens parent modal instead of built-in
  onUpdateStatus,
  onDeleteOrder,      // optional — called when delete is confirmed
  pagination,
  onPageChange,
}) {
  const [actionMenu, setActionMenu] = useState(null);

  // Cancel modal
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Confirm modal
  const [confirmTarget, setConfirmTarget] = useState(null);

  // View modal (built-in premium)
  const [viewTarget, setViewTarget] = useState(null);

  // Delete modal (built-in premium)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCancelModal = (order) => { setCancelNote(''); setCancelTarget(order); };
  const closeCancelModal = () => { if (!cancelling) { setCancelTarget(null); setCancelNote(''); } };
  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await onUpdateStatus(cancelTarget._id, 'cancelled', cancelNote.trim() || undefined);
      setCancelTarget(null);
      setCancelNote('');
    } finally {
      setCancelling(false);
    }
  };

  const openConfirmModal = (order) => setConfirmTarget(order);
  const closeConfirmModal = () => setConfirmTarget(null);
  const handleConfirmYes = async () => {
    if (!confirmTarget) return;
    await onUpdateStatus(confirmTarget._id, 'confirmed');
  };

  const openView = (order) => {
    if (onViewOrder) return onViewOrder(order); // fall back to parent if provided
    setViewTarget(order);
  };
  const closeView = () => setViewTarget(null);

  const openDeleteModal = (order) => setDeleteTarget(order);
  const closeDeleteModal = () => { if (!deleting) setDeleteTarget(null); };
  const confirmDelete = async () => {
    if (!deleteTarget || !onDeleteOrder) return;
    setDeleting(true);
    try {
      await onDeleteOrder(deleteTarget._id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const allSelected = orders.length > 0 && selected.length === orders.length;
  const toggleAll = () => onSelectChange(allSelected ? [] : orders.map(o => o._id));
  const toggleOne = (id) => onSelectChange(
    selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
  );

  // Status flow for "More" dropdown (advanced transitions)
  const MORE_STATUS = {
    confirmed:  ['processing'],
    processing: ['shipped'],
    shipped:    ['delivered'],
    delivered:  ['refunded'],
  };

  // Locked states — terminal
  const isTerminal = (s) => s === 'delivered' || s === 'refunded';

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
    <>
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
              {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${h === 'Actions' ? 'text-right pr-5' : 'text-left'}`}>
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
              const status = order.status;
              // Mutual lock — cancelled blocks Confirm, confirmed/processing/shipped/terminal blocks Confirm
              const confirmDisabled = status === 'cancelled' || status === 'confirmed' || status === 'processing' || status === 'shipped' || isTerminal(status);
              const cancelDisabled  = status === 'cancelled' || isTerminal(status);
              const moreOptions = MORE_STATUS[status] || [];

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
                      onClick={() => openView(order)}
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

                  {/* ── Premium Actions ─────────────────────────────── */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View — opens built-in premium modal (or parent's if onViewOrder is set) */}
                      <ActionBtn
                        variant="view"
                        title="View order details"
                        onClick={() => openView(order)}
                      >
                        <IconEye />
                        <span>View</span>
                      </ActionBtn>

                      {/* Confirm — opens premium confirmation modal */}
                      <ActionBtn
                        variant="confirm"
                        title={confirmDisabled ? 'Not available for this status' : 'Confirm this order'}
                        disabled={confirmDisabled}
                        onClick={() => openConfirmModal(order)}
                      >
                        <IconCheck />
                        <span>Confirm</span>
                      </ActionBtn>


                      {/* Cancel — opens premium modal */}
                      <ActionBtn
                        variant="cancel"
                        title={cancelDisabled ? 'Not available for this status' : 'Cancel this order'}
                        disabled={cancelDisabled}
                        onClick={() => openCancelModal(order)}
                      >
                        <IconX />
                        <span>Cancel</span>
                      </ActionBtn>

                      {/* Delete — only when onDeleteOrder is provided */}
                      {onDeleteOrder && (
                        <ActionBtn
                          variant="cancel"
                          title="Delete this order permanently"
                          onClick={() => openDeleteModal(order)}
                        >
                          <IconTrash />
                        </ActionBtn>
                      )}

                      {/* More — advanced transitions (process / ship / deliver / refund) */}
                      {moreOptions.length > 0 && (
                        <div className="relative">
                          <ActionBtn
                            variant="ghost"
                            title="More actions"
                            onClick={() => setActionMenu(actionMenu === order._id ? null : order._id)}
                          >
                            <IconMore />
                          </ActionBtn>
                          {actionMenu === order._id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                              <div className="absolute right-0 top-full mt-1.5 z-20 bg-[#16161f]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden min-w-[160px] py-1">
                                {moreOptions.map(s => {
                                  const cfg = ORDER_STATUS[s];
                                  return (
                                    <button
                                      key={s}
                                      onClick={() => { onUpdateStatus(order._id, s); setActionMenu(null); }}
                                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left"
                                    >
                                      <span className={`w-2 h-2 rounded-full ${cfg.dot} shadow-[0_0_8px_currentColor]`} />
                                      <span className="text-slate-200">Mark as {cfg.label}</span>
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

    {/* ── Premium Confirm Order Modal ──────────────────────────────── */}
    {confirmTarget && (
      <ConfirmOrderDialog
        order={confirmTarget}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmYes}
      />
    )}

   {/* ── Premium Cancel Confirmation Modal ─────────────────────────── */}
    {cancelTarget && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_.15s_ease-out]"
        style={{ animation: 'fadeIn .15s ease-out' }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={closeCancelModal}
        />

        {/* Dialog */}
        <div
          className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1a24] to-[#111118] shadow-[0_30px_80px_-20px_rgba(244,63,94,0.35),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden"
          style={{ animation: 'popIn .25s cubic-bezier(.2,.9,.3,1.2)' }}
        >
          {/* Top glow strip */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/60 to-transparent" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

          <div className="relative p-6">
            {/* Icon */}
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/30 to-rose-600/10 border border-rose-400/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(244,63,94,0.5)]">
              <svg className="w-7 h-7 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
              </svg>
            </div>

            <h3 className="text-center text-lg font-bold text-white">Cancel this order?</h3>
            <p className="mt-1.5 text-center text-sm text-slate-400">
              Order <span className="font-mono font-semibold text-rose-300">#{cancelTarget.orderNumber || cancelTarget._id.slice(-6).toUpperCase()}</span> will be marked as cancelled. This action cannot be undone.
            </p>

            {/* Summary card */}
            <div className="mt-5 rounded-xl border border-white/5 bg-black/30 p-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Customer</p>
                <p className="text-sm text-white font-medium truncate">
                  {cancelTarget.customerName || 'Unknown'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-sm font-bold text-white">
                  ${(cancelTarget.totalAmount ?? cancelTarget.total ?? 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Optional reason */}
            <label className="block mt-4 text-xs font-medium text-slate-400 mb-1.5">
              Reason <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              value={cancelNote}
              onChange={(e) => setCancelNote(e.target.value)}
              rows={2}
              placeholder="e.g. Customer requested cancellation"
              className="w-full px-3 py-2 rounded-lg bg-[#0d0d14] border border-white/5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-400/40 focus:ring-2 focus:ring-rose-500/10 transition-all resize-none"
            />

            {/* Buttons */}
            <div className="mt-6 flex items-center gap-2">
              <button
                onClick={closeCancelModal}
                disabled={cancelling}
                className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 text-sm font-semibold hover:bg-white/[0.07] transition-all disabled:opacity-40"
              >
                Keep order
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelling}
                className="flex-1 h-10 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 text-white text-sm font-semibold border border-rose-400/50 shadow-[0_8px_24px_-8px_rgba(244,63,94,0.7)] hover:from-rose-400 hover:to-rose-500 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Cancelling…
                  </>
                ) : (
                  <>
                    <IconX />
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
    )}

    {/* ── Premium View Order Modal ──────────────────────────────────── */}
    {viewTarget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn .15s ease-out' }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeView} />
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1a24] to-[#111118] shadow-[0_30px_80px_-20px_rgba(139,92,246,0.35),0_0_0_1px_rgba(255,255,255,0.04)]"
          style={{ animation: 'popIn .25s cubic-bezier(.2,.9,.3,1.2)' }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-white/5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">Order Details</span>
                <StatusBadge status={viewTarget.status} />
              </div>
              <h3 className="text-xl font-bold text-white font-mono">
                #{viewTarget.orderNumber || viewTarget._id.slice(-6).toUpperCase()}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Placed {viewTarget.placedAt || viewTarget.createdAt
                  ? new Date(viewTarget.placedAt || viewTarget.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                  : '—'}
              </p>
            </div>
            <button
              onClick={closeView}
              className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              title="Close"
            >
              <IconX />
            </button>
          </div>

          {/* Body */}
          <div className="relative px-6 py-5 overflow-y-auto max-h-[calc(90vh-180px)] space-y-5">
            {/* Customer */}
            <section>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Customer</h4>
              <div className="rounded-xl border border-white/5 bg-black/30 p-4 flex items-center gap-3">
                <Avatar name={viewTarget.customerName || viewTarget.userId?.firstName} />
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold truncate">
                    {viewTarget.customerName || `${viewTarget.userId?.firstName || ''} ${viewTarget.userId?.lastName || ''}`.trim() || 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{viewTarget.customerEmail || viewTarget.userId?.email || '—'}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                  viewTarget.paymentStatus === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : viewTarget.paymentStatus === 'failed'
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>{viewTarget.paymentStatus || 'pending'}</span>
              </div>
            </section>

            {/* Items */}
            <section>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Items ({viewTarget.items?.length ?? 0})
              </h4>
              <div className="rounded-xl border border-white/5 bg-black/30 divide-y divide-white/5 overflow-hidden">
                {(viewTarget.items || []).map((it, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{it.name || it.productName || `Item ${i + 1}`}</p>
                      <p className="text-xs text-slate-500">Qty: {it.quantity ?? 1}</p>
                    </div>
                    <p className="text-sm text-white font-semibold flex-shrink-0">
                      ${((it.price ?? 0) * (it.quantity ?? 1)).toFixed(2)}
                    </p>
                  </div>
                ))}
                {(!viewTarget.items || viewTarget.items.length === 0) && (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">No items</div>
                )}
              </div>
            </section>

            {/* Totals */}
            <section className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-1.5 text-sm">
              {viewTarget.subtotal != null && (
                <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>${viewTarget.subtotal.toFixed(2)}</span></div>
              )}
              {viewTarget.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-${viewTarget.discountAmount.toFixed(2)}</span></div>
              )}
              {viewTarget.shippingAmount != null && (
                <div className="flex justify-between text-slate-400"><span>Shipping</span><span>${viewTarget.shippingAmount.toFixed(2)}</span></div>
              )}
              <div className="pt-2 mt-1 border-t border-white/5 flex justify-between text-base font-bold text-white">
                <span>Total</span><span>${(viewTarget.totalAmount ?? viewTarget.total ?? 0).toFixed(2)}</span>
              </div>
            </section>

            {viewTarget.shippingAddress && (
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Shipping Address</h4>
                <div className="rounded-xl border border-white/5 bg-black/30 p-4 text-sm text-slate-300 leading-relaxed">
                  {[viewTarget.shippingAddress.line1, viewTarget.shippingAddress.line2, viewTarget.shippingAddress.city, viewTarget.shippingAddress.state, viewTarget.shippingAddress.zip, viewTarget.shippingAddress.country].filter(Boolean).join(', ')}
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="relative px-6 py-4 border-t border-white/5 bg-black/20 flex justify-end">
            <button
              onClick={closeView}
              className="h-10 px-5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-200 text-sm font-semibold hover:bg-white/[0.08] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── Premium Delete Confirmation Modal ─────────────────────────── */}
    {deleteTarget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn .15s ease-out' }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeDeleteModal} />
        <div
          className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1a24] to-[#111118] shadow-[0_30px_80px_-20px_rgba(244,63,94,0.45),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden"
          style={{ animation: 'popIn .25s cubic-bezier(.2,.9,.3,1.2)' }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/70 to-transparent" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-rose-500/25 blur-3xl pointer-events-none" />

          <div className="relative p-6">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/30 to-rose-600/10 border border-rose-400/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(244,63,94,0.5)]">
              <IconTrash />
            </div>
            <h3 className="text-center text-lg font-bold text-white">Delete this order?</h3>
            <p className="mt-1.5 text-center text-sm text-slate-400">
              Order <span className="font-mono font-semibold text-rose-300">#{deleteTarget.orderNumber || deleteTarget._id.slice(-6).toUpperCase()}</span> will be permanently removed from your records. This action cannot be undone.
            </p>

            <div className="mt-5 rounded-xl border border-rose-400/15 bg-rose-500/[0.04] p-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Customer</p>
                <p className="text-sm text-white font-medium truncate">{deleteTarget.customerName || 'Unknown'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-sm font-bold text-white">${(deleteTarget.totalAmount ?? deleteTarget.total ?? 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 text-sm font-semibold hover:bg-white/[0.07] transition-all disabled:opacity-40"
              >
                Keep order
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 h-10 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 text-white text-sm font-semibold border border-rose-400/50 shadow-[0_8px_24px_-8px_rgba(244,63,94,0.7)] hover:from-rose-400 hover:to-rose-500 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deleting…
                  </>
                ) : (
                  <>
                    <IconTrash />
                    Yes, delete order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
