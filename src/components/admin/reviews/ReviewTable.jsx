'use client';
import { useState } from 'react';

// ── Status config ────────────────────────────────────────────────────────
export const REVIEW_STATUS = {
  pending:  { label: 'Pending',  cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   dot: 'bg-amber-400' },
  approved: { label: 'Approved', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  rejected: { label: 'Rejected', cls: 'bg-red-500/10 text-red-400 border-red-500/20',         dot: 'bg-red-400' },
};

export function ReviewStatusBadge({ status }) {
  const cfg = REVIEW_STATUS[status] || REVIEW_STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Star rating ──────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg
          key={n}
          className={`w-3.5 h-3.5 ${n <= rating ? 'text-amber-400' : 'text-slate-700'}`}
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-slate-500 ml-1">{rating}/5</span>
    </div>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = (name || 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const colors = [
    'bg-violet-500/20 text-violet-400',
    'bg-sky-500/20 text-sky-400',
    'bg-emerald-500/20 text-emerald-400',
    'bg-amber-500/20 text-amber-400',
  ];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-full ${color} border border-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Main Table ───────────────────────────────────────────────────────────
export default function ReviewTable({
  reviews = [],
  loading,
  selected = [],
  onSelectChange,
  onView,
  onApprove,
  onReject,
  onDelete,
  pagination,
  onPageChange,
}) {
  const [actionMenu, setActionMenu] = useState(null);

  const allSelected = reviews.length > 0 && selected.length === reviews.length;
  const toggleAll = () => onSelectChange(allSelected ? [] : reviews.map(r => r._id));
  const toggleOne = (id) =>
    onSelectChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
        <div className="p-12 flex items-center justify-center gap-3 text-slate-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading reviews…
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
              {/* Checkbox */}
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-violet-500"
                />
              </th>
              {['Customer', 'Product', 'Rating', 'Review', 'Status', 'Verified', 'Date', ''].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#1e1e2e]">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>No reviews found</span>
                  </div>
                </td>
              </tr>
            ) : reviews.map((review) => (
              <tr
                key={review._id}
                className={`group hover:bg-white/[0.02] transition-colors ${selected.includes(review._id) ? 'bg-violet-500/5' : ''}`}
              >
                {/* Checkbox */}
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(review._id)}
                    onChange={() => toggleOne(review._id)}
                    className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-violet-500"
                  />
                </td>

                {/* Customer */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={
                      review.userId
                        ? `${review.userId.firstName || ''} ${review.userId.lastName || ''}`.trim()
                        : 'Unknown'
                    } />
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate max-w-[120px]">
                        {review.userId
                          ? `${review.userId.firstName || ''} ${review.userId.lastName || ''}`.trim() || 'Unknown'
                          : 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[120px]">
                        {review.userId?.email || '—'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Product */}
                <td className="px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-slate-300 font-medium truncate max-w-[140px]">
                      {review.productId?.name || '—'}
                    </p>
                    {review.orderId && (
                      <p className="text-xs text-slate-600 font-mono">
                        #{typeof review.orderId === 'string'
                          ? review.orderId.slice(-6).toUpperCase()
                          : review.orderId?.orderNumber || review.orderId?._id?.slice(-6).toUpperCase()}
                      </p>
                    )}
                  </div>
                </td>

                {/* Rating */}
                <td className="px-4 py-3">
                  <Stars rating={review.rating} />
                </td>

                {/* Review text */}
                <td className="px-4 py-3 max-w-[200px]">
                  {review.title && (
                    <p className="text-white text-xs font-semibold truncate">{review.title}</p>
                  )}
                  <p className="text-slate-400 text-xs truncate">{review.body || '—'}</p>
                  {review.images?.length > 0 && (
                    <span className="text-xs text-sky-400 mt-0.5 inline-block">
                      📷 {review.images.length} image{review.images.length > 1 ? 's' : ''}
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <ReviewStatusBadge status={review.isApproved ? 'approved' : (review.isApproved === false ? 'rejected' : 'pending')} />
                </td>

                {/* Verified buyer */}
                <td className="px-4 py-3">
                  {review.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600">—</span>
                  )}
                </td>

                {/* Date */}
                <td className="px-4 py-3">
                  <span className="text-slate-400 text-xs whitespace-nowrap">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })
                      : '—'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* View */}
                    <button
                      onClick={() => onView(review)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-violet-400 transition-colors"
                      title="View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    {/* Approve */}
                    {!review.isApproved && (
                      <button
                        onClick={() => onApprove(review._id)}
                        className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Approve"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}

                    {/* Reject */}
                    {review.isApproved !== false && (
                      <button
                        onClick={() => onReject(review._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                        title="Reject"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}

                    {/* More (delete) */}
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === review._id ? null : review._id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-300 transition-colors"
                        title="More"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                        </svg>
                      </button>
                      {actionMenu === review._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 z-20 bg-[#16161f] border border-[#1e1e2e] rounded-xl shadow-2xl overflow-hidden min-w-[130px]">
                            <button
                              onClick={() => { onDelete(review._id); setActionMenu(null); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-4 py-3 border-t border-[#1e1e2e] flex items-center justify-between text-sm flex-wrap gap-2">
          <span className="text-slate-500">
            Page {pagination.page} of {pagination.pages} · {pagination.total} reviews
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
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    p === pagination.page
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:bg-white/5'
                  }`}
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
