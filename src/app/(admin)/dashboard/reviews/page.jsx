// 📁 PATH: src/app/(admin)/dashboard/reviews/page.jsx
'use client';

import { useState, useCallback } from 'react';

import ReviewStatsBar    from '@/components/admin/reviews/ReviewStatsBar';
import ReviewFilters     from '@/components/admin/reviews/ReviewFilters';
import BulkActionBar     from '@/components/admin/reviews/BulkActionBar';
import ReviewTable       from '@/components/admin/reviews/ReviewTable';
import ReviewDetailModal from '@/components/admin/reviews/ReviewDetailModal';

import {
  useAdminReviews,
  useAdminReviewStats,
  useApproveReview,
  useRejectReview,
  useAdminDeleteReview,
  useAdminReplyReview,
  useAdminBulkReviewAction,
} from '@/hooks/useAdminReviews';

/* ── Default filters ─────────────────────────────────────────────── */
const DEFAULT_FILTERS = {
  search: '',
  status: '',
  rating: '',
  sort:   'createdAt:desc',
  page:   1,
  limit:  15,
};

/* ══════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════ */
export default function ReviewsPage() {
  const [filters,      setFilters]      = useState(DEFAULT_FILTERS);
  const [selected,     setSelected]     = useState([]);
  const [activeReview, setActiveReview] = useState(null); // review object in modal

  /* ── Data ── */
  const {
    data,
    isLoading,
    isFetching,
  } = useAdminReviews(filters);

  const { data: stats, isLoading: statsLoading } = useAdminReviewStats();

  const reviews    = data?.results ?? [];
  const pagination = {
    page:  data?.page  ?? filters.page,
    pages: data?.pages ?? 1,
    total: data?.total ?? 0,
  };

  /* ── Mutations ── */
  const approveMutation    = useApproveReview();
  const rejectMutation     = useRejectReview();
  const deleteMutation     = useAdminDeleteReview();
  const replyMutation      = useAdminReplyReview();
  const bulkMutation       = useAdminBulkReviewAction();

  /* ── Handlers ── */
  const handleApprove = useCallback(async (id) => {
    await approveMutation.mutateAsync(id);
    // keep modal in sync
    setActiveReview((prev) => prev?._id === id ? { ...prev, isApproved: true } : prev);
  }, [approveMutation]);

  const handleReject = useCallback(async (id) => {
    await rejectMutation.mutateAsync(id);
    setActiveReview((prev) => prev?._id === id ? { ...prev, isApproved: false } : prev);
  }, [rejectMutation]);

  const handleDelete = useCallback(async (id) => {
    await deleteMutation.mutateAsync(id);
    setActiveReview((prev) => prev?._id === id ? null : prev);
    setSelected((prev) => prev.filter((x) => x !== id));
  }, [deleteMutation]);

  const handleReply = useCallback(async (id, reply) => {
    await replyMutation.mutateAsync({ id, reply });
    setActiveReview((prev) =>
      prev?._id === id ? { ...prev, adminReply: reply } : prev
    );
  }, [replyMutation]);

  const handleBulkAction = useCallback(async (action) => {
    await bulkMutation.mutateAsync({ ids: selected, action });
    setSelected([]);
    // close modal if the active review was in the selection
    setActiveReview((prev) =>
      prev && selected.includes(prev._id) ? null : prev
    );
  }, [bulkMutation, selected]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setSelected([]);
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((f) => ({ ...f, page }));
    setSelected([]);
  }, []);

  /* ── Render ── */
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reviews</h1>
          <p className="text-sm text-slate-400 mt-1">
            Moderate and manage customer product reviews.
          </p>
        </div>

        {/* Live indicator — shows when background refetch is running */}
        {isFetching && !isLoading && (
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 font-medium">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Refreshing…
          </span>
        )}
      </div>

      {/* Stats bar */}
      <ReviewStatsBar stats={stats} loading={statsLoading} />

      {/* Filters */}
      <ReviewFilters
        filters={filters}
        onChange={handleFilterChange}
      />

      {/* Bulk action bar — visible only when rows are selected */}
      <BulkActionBar
        selectedCount={selected.length}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelected([])}
      />

      {/* Table */}
      <ReviewTable
        reviews={reviews}
        loading={isLoading}
        selected={selected}
        onSelectChange={setSelected}
        onView={setActiveReview}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Detail modal */}
      {activeReview && (
        <ReviewDetailModal
          review={activeReview}
          onClose={() => setActiveReview(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          onReply={handleReply}
        />
      )}

    </div>
  );
}