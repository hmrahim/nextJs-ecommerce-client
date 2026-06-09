'use client';
import { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

import { DUMMY_REVIEWS, DUMMY_STATS } from '@/components/admin/reviews/_dummyData';

import ReviewStatsBar    from '@/components/admin/reviews/ReviewStatsBar';
import ReviewFilters     from '@/components/admin/reviews/ReviewFilters';
import BulkActionBar     from '@/components/admin/reviews/BulkActionBar';
import ReviewTable       from '@/components/admin/reviews/ReviewTable';
import ReviewDetailModal from '@/components/admin/reviews/ReviewDetailModal';

// ── Default filters ───────────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  search: '',
  status: '',
  rating: '',
  sort: 'createdAt:desc',
  page: 1,
  limit: 15,
};

// ── Helper: review → status key ──────────────────────────────────────────
const statusKey = (r) =>
  r.isApproved === true ? 'approved' : r.isApproved === false ? 'rejected' : 'pending';

export default function ReviewsPage() {
  // ── Local state (dummy mode) ─────────────────────────────────────────
  const [reviews, setReviews] = useState(DUMMY_REVIEWS);
  const [stats, setStats]     = useState(DUMMY_STATS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selected, setSelected]       = useState([]);
  const [activeReview, setActiveReview] = useState(null);

  // ── Client-side filter + sort (dummy only — real API handles this) ──
  const filtered = useMemo(() => {
    let list = [...reviews];

    // search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(r => {
        const name = `${r.userId?.firstName || ''} ${r.userId?.lastName || ''}`.toLowerCase();
        const product = (r.productId?.name || '').toLowerCase();
        const body = (r.body || '').toLowerCase();
        const title = (r.title || '').toLowerCase();
        return name.includes(q) || product.includes(q) || body.includes(q) || title.includes(q);
      });
    }

    // status
    if (filters.status) {
      list = list.filter(r => statusKey(r) === filters.status);
    }

    // rating
    if (filters.rating) {
      list = list.filter(r => r.rating === Number(filters.rating));
    }

    // sort
    const [field, dir] = (filters.sort || 'createdAt:desc').split(':');
    list.sort((a, b) => {
      const av = field === 'rating' ? a.rating : new Date(a.createdAt).getTime();
      const bv = field === 'rating' ? b.rating : new Date(b.createdAt).getTime();
      return dir === 'asc' ? av - bv : bv - av;
    });

    return list;
  }, [reviews, filters]);

  // pagination
  const LIMIT = filters.limit;
  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paginated  = filtered.slice((filters.page - 1) * LIMIT, filters.page * LIMIT);
  const pagination = { page: filters.page, pages: totalPages, total: filtered.length };

  // ── Recalculate stats after every mutation ────────────────────────────
  const recalcStats = (list) => {
    setStats({
      total:    list.length,
      pending:  list.filter(r => r.isApproved === null).length,
      approved: list.filter(r => r.isApproved === true).length,
      rejected: list.filter(r => r.isApproved === false).length,
      avgRating: list.length
        ? (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1)
        : '0',
    });
  };

  // ── Handlers (dummy — replace with real API calls) ────────────────────
  const handleApprove = useCallback(async (id) => {
    setReviews(prev => {
      const updated = prev.map(r => r._id === id ? { ...r, isApproved: true } : r);
      recalcStats(updated);
      return updated;
    });
    // also refresh modal if open
    setActiveReview(prev => prev?._id === id ? { ...prev, isApproved: true } : prev);
    toast.success('Review approved');
    // 🔌 REAL API: await reviewService.adminApprove(id);
  }, []);

  const handleReject = useCallback(async (id) => {
    setReviews(prev => {
      const updated = prev.map(r => r._id === id ? { ...r, isApproved: false } : r);
      recalcStats(updated);
      return updated;
    });
    setActiveReview(prev => prev?._id === id ? { ...prev, isApproved: false } : prev);
    toast.success('Review rejected');
    // 🔌 REAL API: await reviewService.adminReject(id);
  }, []);

  const handleDelete = useCallback(async (id) => {
    setReviews(prev => {
      const updated = prev.filter(r => r._id !== id);
      recalcStats(updated);
      return updated;
    });
    setSelected(prev => prev.filter(x => x !== id));
    toast.success('Review deleted');
    // 🔌 REAL API: await reviewService.adminDelete(id);
  }, []);

  const handleBulkAction = useCallback(async (action) => {
    if (action === 'approve') {
      setReviews(prev => {
        const updated = prev.map(r => selected.includes(r._id) ? { ...r, isApproved: true } : r);
        recalcStats(updated);
        return updated;
      });
      toast.success(`${selected.length} reviews approved`);
    } else if (action === 'reject') {
      setReviews(prev => {
        const updated = prev.map(r => selected.includes(r._id) ? { ...r, isApproved: false } : r);
        recalcStats(updated);
        return updated;
      });
      toast.success(`${selected.length} reviews rejected`);
    } else if (action === 'delete') {
      setReviews(prev => {
        const updated = prev.filter(r => !selected.includes(r._id));
        recalcStats(updated);
        return updated;
      });
      toast.success(`${selected.length} reviews deleted`);
    }
    setSelected([]);
    // 🔌 REAL API: await reviewService.adminBulkAction(selected, action);
  }, [selected]);

  const handleReply = useCallback(async (id, reply) => {
    setReviews(prev => prev.map(r => r._id === id ? { ...r, adminReply: reply } : r));
    setActiveReview(prev => prev?._id === id ? { ...prev, adminReply: reply } : prev);
    toast.success('Reply posted');
    // 🔌 REAL API: await reviewService.adminReply(id, reply);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────
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
        {/* DEV badge */}
        <span className="text-xs px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium">
          ⚡ Dummy Data Mode
        </span>
      </div>

      {/* Stats */}
      <ReviewStatsBar stats={stats} loading={false} />

      {/* Filters */}
      <ReviewFilters filters={filters} onChange={(f) => { setFilters(f); setSelected([]); }} />

      {/* Bulk action bar */}
      <BulkActionBar
        selectedCount={selected.length}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelected([])}
      />

      {/* Table */}
      <ReviewTable
        reviews={paginated}
        loading={false}
        selected={selected}
        onSelectChange={setSelected}
        onView={setActiveReview}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        pagination={pagination}
        onPageChange={(page) => setFilters(f => ({ ...f, page }))}
      />

      {/* Detail Modal */}
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
