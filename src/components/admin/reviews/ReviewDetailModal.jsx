'use client';
import { useState } from 'react';
import { ReviewStatusBadge } from './ReviewTable';

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <svg
          key={n}
          className={`w-5 h-5 ${n <= rating ? 'text-amber-400' : 'text-slate-700'}`}
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-slate-400 text-sm ml-1">{rating} / 5</span>
    </div>
  );
}

export default function ReviewDetailModal({
  review,
  onClose,
  onApprove,
  onReject,
  onDelete,
  onReply,
}) {
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  if (!review) return null;

  const customerName =
    review.userId
      ? `${review.userId.firstName || ''} ${review.userId.lastName || ''}`.trim() || 'Unknown'
      : 'Unknown';

  const statusKey = review.isApproved
    ? 'approved'
    : review.isApproved === false
    ? 'rejected'
    : 'pending';

  const handleApprove = async () => {
    setActionLoading('approve');
    await onApprove(review._id);
    setActionLoading('');
    onClose();
  };

  const handleReject = async () => {
    setActionLoading('reject');
    await onReject(review._id);
    setActionLoading('');
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this review permanently?')) return;
    setActionLoading('delete');
    await onDelete(review._id);
    setActionLoading('');
    onClose();
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    await onReply(review._id, replyText.trim());
    setReplyLoading(false);
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#0e0e17] border border-[#1e1e2e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Review Detail</h2>
              <p className="text-slate-500 text-xs">
                {review.createdAt
                  ? new Date(review.createdAt).toLocaleString()
                  : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ReviewStatusBadge status={statusKey} />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Customer + Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Section title="Customer">
              <div className="space-y-1.5">
                <p className="text-white font-medium">{customerName}</p>
                <p className="text-slate-400 text-sm">{review.userId?.email || '—'}</p>
                <p className="text-slate-500 text-sm">{review.userId?.phone || '—'}</p>
                {review.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1">
                    ✓ Verified Buyer
                  </span>
                )}
              </div>
            </Section>
            <Section title="Product">
              <div className="space-y-1.5">
                <p className="text-white font-medium">
                  {review.productId?.name || '—'}
                </p>
                {review.productId?.sku && (
                  <p className="text-slate-500 text-xs font-mono">
                    SKU: {review.productId.sku}
                  </p>
                )}
                {review.orderId && (
                  <p className="text-slate-500 text-xs">
                    Order:{' '}
                    <span className="font-mono text-sky-400">
                      #{typeof review.orderId === 'string'
                        ? review.orderId.slice(-6).toUpperCase()
                        : review.orderId?.orderNumber || review.orderId?._id?.slice(-6).toUpperCase()}
                    </span>
                  </p>
                )}
              </div>
            </Section>
          </div>

          {/* Rating + Review Content */}
          <Section title="Review Content">
            <div className="space-y-3">
              <Stars rating={review.rating} />
              {review.title && (
                <p className="text-white font-semibold">{review.title}</p>
              )}
              <p className="text-slate-300 text-sm leading-relaxed">
                {review.body || <span className="text-slate-600 italic">No body text</span>}
              </p>
              {review.images?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {review.images.map((img, i) => (
                    <a
                      key={i}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 rounded-lg border border-[#1e1e2e] bg-[#16161f] overflow-hidden flex items-center justify-center"
                    >
                      <img
                        src={img}
                        alt={`Review image ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <span
                        className="hidden text-slate-500 text-xs"
                        style={{ display: 'none' }}
                      >
                        📷
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* Admin Reply */}
          <Section title="Admin Reply">
            <div className="space-y-3">
              {review.adminReply ? (
                <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-3">
                  <p className="text-xs text-violet-400 font-semibold mb-1">Your reply</p>
                  <p className="text-slate-300 text-sm">{review.adminReply}</p>
                </div>
              ) : (
                <p className="text-slate-600 text-sm italic">No reply yet</p>
              )}
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={review.adminReply ? 'Update your reply…' : 'Write a reply to this review…'}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[#0e0e17] border border-[#1e1e2e] text-slate-300 placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-violet-500/50"
              />
              <button
                onClick={handleReply}
                disabled={replyLoading || !replyText.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {replyLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                {review.adminReply ? 'Update Reply' : 'Post Reply'}
              </button>
            </div>
          </Section>

          {/* Moderation Actions */}
          <Section title="Moderation">
            <div className="flex flex-wrap gap-3">
              {statusKey !== 'approved' && (
                <button
                  onClick={handleApprove}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {actionLoading === 'approve' ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Approve
                </button>
              )}
              {statusKey !== 'rejected' && (
                <button
                  onClick={handleReject}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {actionLoading === 'reject' ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  Reject
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 text-sm font-semibold transition-colors ml-auto"
              >
                {actionLoading === 'delete' ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                Delete Permanently
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
