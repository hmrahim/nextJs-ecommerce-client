// 📁 PATH: src/components/client/product/ProductReviews.jsx
'use client';

import { useState } from 'react';
import { Star, ShieldCheck, ThumbsUp, Edit2, Trash2, X, Send, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  useProductReviews,
  useSubmitReview,
  useUpdateReview,
  useDeleteReview,
} from '@/hooks/client/useReviews';

/* ── Helpers ─────────────────────────────────────────────────────── */
function avatar(name = '') {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || 'U';
  const palette  = [
    'bg-violet-100 text-violet-700',
    'bg-sky-100    text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100  text-amber-700',
    'bg-rose-100   text-rose-700',
  ];
  const color = palette[initials.charCodeAt(0) % palette.length];
  return { initials, color };
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)  return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── StarRating — interactive or display ────────────────────────── */
function StarRating({ value = 0, onChange, size = 'w-5 h-5', readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer transition-transform hover:scale-110'}
          aria-label={`${n} star`}
        >
          <Star
            className={`${size} transition-colors ${
              n <= active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ── RatingBar — distribution bar ───────────────────────────────── */
function RatingBar({ star, count, total, active, onClick }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      type="button"
      onClick={() => onClick(star)}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition hover:bg-slate-50 ${
        active ? 'ring-1 ring-emerald-400' : ''
      }`}
    >
      <span className="w-5 shrink-0 text-right font-medium text-slate-600">{star}★</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 shrink-0 text-right text-slate-400">{pct}%</span>
    </button>
  );
}

/* ── ReviewCard ─────────────────────────────────────────────────── */
function ReviewCard({ review, currentUserId, onEdit, onDelete }) {
  const isOwner  = currentUserId && String(review.user?.id) === String(currentUserId);
  const { initials, color } = avatar(review.user?.name);

  return (
    <div className="rounded-xl border border-border bg-white p-4 space-y-3 transition hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.user?.image ? (
            <img
              src={review.user.image}
              alt={review.user.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${color}`}
            >
              {initials}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-none">{review.user?.name}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <StarRating value={review.rating} readonly size="w-3.5 h-3.5" />
              <span className="text-[11px] text-slate-400">{timeAgo(review.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Badges + owner actions */}
        <div className="flex shrink-0 items-center gap-2">
          {review.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          )}
          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(review)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                aria-label="Edit review"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(review._id)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                aria-label="Delete review"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      {review.title && (
        <p className="text-sm font-semibold text-slate-800">{review.title}</p>
      )}
      {review.body && (
        <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>
      )}

      {/* Images */}
      {review.images?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.images.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Review image ${i + 1}`}
              className="h-16 w-16 rounded-lg object-cover border border-border"
            />
          ))}
        </div>
      )}

      {/* Admin Reply */}
      {review.adminReply && (
        <div className="flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold select-none">
            S
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-emerald-700">Store Reply</p>
            <p className="text-sm text-slate-700 leading-relaxed">{review.adminReply}</p>
            {review.adminRepliedAt && (
              <p className="text-[11px] text-slate-400">{timeAgo(review.adminRepliedAt)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── ReviewForm — create + edit ─────────────────────────────────── */
function ReviewForm({ productId, editTarget, onClose }) {
  const [rating, setRating] = useState(editTarget?.rating ?? 0);
  const [title,  setTitle]  = useState(editTarget?.title  ?? '');
  const [body,   setBody]   = useState(editTarget?.body   ?? '');

  const isEdit = !!editTarget;

  const submitMutation = useSubmitReview(productId);
  const updateMutation = useUpdateReview(productId);

  const isPending = submitMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;

    const payload = { rating, title: title.trim(), body: body.trim() };

    if (isEdit) {
      updateMutation.mutate(
        { reviewId: editTarget._id, data: payload },
        { onSuccess: onClose }
      );
    } else {
      submitMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-800">
          {isEdit ? 'Edit your review' : 'Write a review'}
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-700 transition"
          aria-label="Close form"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star picker */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Rating <span className="text-rose-500">*</span>
          </label>
          <StarRating value={rating} onChange={setRating} size="w-7 h-7" />
          {rating === 0 && (
            <p className="mt-1 text-xs text-rose-500">Please select a rating</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Title <span className="text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarise your experience"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
          />
        </div>

        {/* Body */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Review <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            rows={4}
            maxLength={2000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share more about your experience with this product…"
            className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
          />
          <p className="mt-0.5 text-right text-xs text-slate-400">{body.length}/2000</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={rating === 0 || isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isEdit ? 'Update' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Pagination ─────────────────────────────────────────────────── */
function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-slate-50 disabled:opacity-40 transition"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1)
        .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
        .reduce((acc, n, idx, arr) => {
          if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
          acc.push(n);
          return acc;
        }, [])
        .map((item, i) =>
          item === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-sm">…</span>
          ) : (
            <button
              key={item}
              onClick={() => onChange(item)}
              className={`grid h-8 min-w-8 place-items-center rounded-md border px-2 text-sm font-medium transition ${
                item === page
                  ? 'border-emerald-500 bg-emerald-600 text-white'
                  : 'border-border hover:bg-slate-50 text-slate-700'
              }`}
            >
              {item}
            </button>
          )
        )}
      <button
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
        className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-slate-50 disabled:opacity-40 transition"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   Props:
     productId: string   — MongoDB ObjectId of the product
══════════════════════════════════════════════════════════════════ */
export default function ProductReviews({ productId }) {
  const { user, isLoggedIn } = useAuth();

  /* ── local state ── */
  const [page,       setPage]       = useState(1);
  const [sort,       setSort]       = useState('newest');
  const [ratingFilter, setRatingFilter] = useState(null); // 1-5 | null
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null); // review object being edited

  /* ── data ── */
  const { data, isLoading, isFetching, isError } = useProductReviews(productId, {
    page,
    sort,
    rating: ratingFilter ?? undefined,
  });

  const deleteMutation = useDeleteReview(productId);

  const reviews     = data?.results      ?? [];
  const total       = data?.total        ?? 0;
  const pages       = data?.pages        ?? 1;
  const stats       = data?.stats        ?? { avgRating: 0, totalReviews: 0, distribution: {} };
  const dist        = stats.distribution ?? {};

  /* ── handlers ── */
  const handleEdit = (review) => {
    setEditTarget(review);
    setShowForm(true);
    // scroll to form smoothly
    setTimeout(() =>
      document.getElementById('review-form-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      50
    );
  };

  const handleDelete = (reviewId) => {
    if (!window.confirm('Delete your review?')) return;
    deleteMutation.mutate(reviewId);
  };

  const handleFilterStar = (star) => {
    setRatingFilter((prev) => (prev === star ? null : star));
    setPage(1);
  };

  const handleOpenForm = () => {
    setEditTarget(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditTarget(null);
  };

  /* ── RENDER ── */
  return (
    <div className="space-y-8" id="reviews-section">

      {/* ── Summary row ── */}
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">

        {/* Big avg number */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-slate-50 px-8 py-6 min-w-[140px]">
          <span className="text-5xl font-bold text-slate-900 leading-none">
            {stats.avgRating.toFixed(1)}
          </span>
          <StarRating value={Math.round(stats.avgRating)} readonly size="w-5 h-5" />
          <span className="mt-1 text-xs text-slate-500">{stats.totalReviews.toLocaleString()} reviews</span>
        </div>

        {/* Distribution bars */}
        <div className="flex flex-col justify-center gap-1.5 py-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar
              key={star}
              star={star}
              count={dist[star] ?? 0}
              total={stats.totalReviews}
              active={ratingFilter === star}
              onClick={handleFilterStar}
            />
          ))}
          {ratingFilter && (
            <button
              onClick={() => { setRatingFilter(null); setPage(1); }}
              className="mt-1 self-start text-xs text-emerald-600 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* ── Write review CTA / form anchor ── */}
      <div id="review-form-anchor">
        {!showForm && (
          isLoggedIn ? (
            <button
              onClick={handleOpenForm}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50 transition"
            >
              <Star className="h-4 w-4 fill-emerald-400 text-emerald-400" />
              Write a review
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <AlertCircle className="h-4 w-4 shrink-0 text-slate-400" />
              <span>
                <a href="/auth/login" className="font-semibold text-emerald-600 hover:underline">Log in</a>
                {' '}to write a review
              </span>
            </div>
          )
        )}

        {showForm && (
          <ReviewForm
            productId={productId}
            editTarget={editTarget}
            onClose={handleCloseForm}
          />
        )}
      </div>

      {/* ── Sort + count toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {isLoading ? (
            <span className="inline-block h-3 w-32 animate-pulse rounded bg-slate-200" />
          ) : (
            <>
              Showing <span className="font-semibold text-slate-800">{total}</span>{' '}
              {ratingFilter ? `${ratingFilter}-star ` : ''}review{total !== 1 ? 's' : ''}
            </>
          )}
        </p>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-emerald-400"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
        </select>
      </div>

      {/* ── Loading state ── */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-3 w-28 rounded bg-slate-200" />
                  <div className="h-3 w-20 rounded bg-slate-200" />
                </div>
              </div>
              <div className="h-3 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {/* ── Error state ── */}
      {isError && !isLoading && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-center text-sm text-red-600">
          Failed to load reviews. Please refresh the page.
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && !isError && reviews.length === 0 && (
        <div className="rounded-xl border border-border bg-slate-50 py-12 text-center">
          <Star className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="font-semibold text-slate-600">
            {ratingFilter ? `No ${ratingFilter}-star reviews yet` : 'No reviews yet'}
          </p>
          {!ratingFilter && (
            <p className="mt-1 text-sm text-slate-400">Be the first to share your experience</p>
          )}
        </div>
      )}

      {/* ── Review list ── */}
      {!isLoading && reviews.length > 0 && (
        <div className={`space-y-3 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={user?.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!isLoading && pages > 1 && (
        <Pagination
          page={page}
          pages={pages}
          onChange={(n) => {
            setPage(n);
            document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

    </div>
  );
}