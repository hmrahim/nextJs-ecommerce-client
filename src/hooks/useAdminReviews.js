// 📁 PATH: src/hooks/useAdminReviews.js
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/reviewService';
import toast from 'react-hot-toast';

/* ── Query Key Factory ───────────────────────────────────────────── */
export const adminReviewKeys = {
  all:    ()        => ['admin-reviews'],
  list:   (filters) => ['admin-reviews', 'list', filters],
  detail: (id)      => ['admin-reviews', 'detail', id],
  stats:  ()        => ['admin-reviews', 'stats'],
};

/* ── Cache helpers ───────────────────────────────────────────────── */

/** All admin review list queries invalidate Do — filters anyway */
function invalidateList(queryClient) {
  queryClient.invalidateQueries({
    queryKey: ['admin-reviews', 'list'],
    exact: false,
  });
}

/** a review-Of isApproved field cache-In patch Do */
function patchApproval(queryClient, id, isApproved) {
  queryClient.setQueriesData({ queryKey: ['admin-reviews', 'list'], exact: false }, (old) => {
    if (!old?.results) return old;
    return {
      ...old,
      results: old.results.map((r) =>
        r._id === id ? { ...r, isApproved } : r
      ),
    };
  });
}

/** a review-Of adminReply field cache-In patch Do */
function patchReply(queryClient, id, adminReply) {
  queryClient.setQueriesData({ queryKey: ['admin-reviews', 'list'], exact: false }, (old) => {
    if (!old?.results) return old;
    return {
      ...old,
      results: old.results.map((r) =>
        r._id === id ? { ...r, adminReply, adminRepliedAt: new Date().toISOString() } : r
      ),
    };
  });
}

/** multiple review cache remove from */
function removeFromCache(queryClient, ids) {
  queryClient.setQueriesData({ queryKey: ['admin-reviews', 'list'], exact: false }, (old) => {
    if (!old?.results) return old;
    const updated = old.results.filter((r) => !ids.includes(r._id));
    return {
      ...old,
      results: updated,
      total: Math.max(0, (old.total ?? 0) - (old.results.length - updated.length)),
    };
  });
}

/* ══════════════════════════════════════════════════════════════════
   1. useAdminReviews
══════════════════════════════════════════════════════════════════ */
export function useAdminReviews(filters = {}) {
  const { page = 1, limit = 15, search, status, rating, sort = 'createdAt:desc' } = filters;

  const [sortField, sortDir] = sort.split(':');
  const sortParam = sortDir === 'asc' ? sortField : `-${sortField}`;

  return useQuery({
    queryKey: adminReviewKeys.list({ page, limit, search, status, rating, sort }),
    queryFn: async () => {
      const res = await reviewService.adminGetAll({
        page,
        limit,
        sort:    sortParam,
        status:  status  || undefined,
        rating:  rating  || undefined,
        search:  search  || undefined,
      });
      return res.data;
    },
    staleTime:        1000 * 60 * 2,
    keepPreviousData: true,
  });
}

/* ══════════════════════════════════════════════════════════════════
   2. useAdminReviewStats
══════════════════════════════════════════════════════════════════ */
export function useAdminReviewStats() {
  return useQuery({
    queryKey: adminReviewKeys.stats(),
    queryFn: async () => {
      const res = await reviewService.adminGetStats();
      return res.data.data;
    },
    staleTime: 1000 * 60 * 3,
  });
}

/* ══════════════════════════════════════════════════════════════════
   3. useAdminReviewById
══════════════════════════════════════════════════════════════════ */
export function useAdminReviewById(id) {
  return useQuery({
    queryKey: adminReviewKeys.detail(id),
    queryFn: async () => {
      const res = await reviewService.adminGetById(id);
      return res.data.data;
    },
    enabled:   !!id,
    staleTime: 1000 * 60 * 2,
  });
}

/* ══════════════════════════════════════════════════════════════════
   4. useApproveReview
══════════════════════════════════════════════════════════════════ */
export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => reviewService.adminApprove(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin-reviews', 'list'], exact: false });
      const snapshot = queryClient.getQueriesData({ queryKey: ['admin-reviews', 'list'], exact: false });
      patchApproval(queryClient, id, true);
      return { snapshot };
    },

    onSuccess: (_, id) => {
      toast.success('Review approved');
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.stats() });
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.detail(id) });
    },

    onError: (_err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error('Failed to approve review');
    },

    onSettled: () => invalidateList(queryClient),
  });
}

/* ══════════════════════════════════════════════════════════════════
   5. useRejectReview
══════════════════════════════════════════════════════════════════ */
export function useRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => reviewService.adminReject(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin-reviews', 'list'], exact: false });
      const snapshot = queryClient.getQueriesData({ queryKey: ['admin-reviews', 'list'], exact: false });
      patchApproval(queryClient, id, false);
      return { snapshot };
    },

    onSuccess: (_, id) => {
      toast.success('Review rejected');
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.stats() });
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.detail(id) });
    },

    onError: (_err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error('Failed to reject review');
    },

    onSettled: () => invalidateList(queryClient),
  });
}

/* ══════════════════════════════════════════════════════════════════
   6. useAdminDeleteReview
══════════════════════════════════════════════════════════════════ */
export function useAdminDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => reviewService.adminDelete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin-reviews', 'list'], exact: false });
      const snapshot = queryClient.getQueriesData({ queryKey: ['admin-reviews', 'list'], exact: false });
      removeFromCache(queryClient, [id]);
      return { snapshot };
    },

    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.stats() });
    },

    onError: (_err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error('Failed to delete review');
    },

    onSettled: () => invalidateList(queryClient),
  });
}

/* ══════════════════════════════════════════════════════════════════
   7. useAdminReplyReview
══════════════════════════════════════════════════════════════════ */
export function useAdminReplyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reply }) => reviewService.adminReply(id, reply),

    onSuccess: (res, { id }) => {
      const savedReply = res?.data?.data?.adminReply ?? '';
      toast.success('Reply posted');
      // list cache optimistic patch
      patchReply(queryClient, id, savedReply);
      // detail cache refresh
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.detail(id) });
    },

    onError: () => toast.error('Failed to post reply'),

    onSettled: () => invalidateList(queryClient),
  });
}

/* ══════════════════════════════════════════════════════════════════
   8. useAdminBulkReviewAction
══════════════════════════════════════════════════════════════════ */
export function useAdminBulkReviewAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, action }) => reviewService.adminBulkAction(ids, action),

    onMutate: async ({ ids, action }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-reviews', 'list'], exact: false });
      const snapshot = queryClient.getQueriesData({ queryKey: ['admin-reviews', 'list'], exact: false });

      if (action === 'delete') {
        removeFromCache(queryClient, ids);
      } else {
        const isApproved = action === 'approve';
        queryClient.setQueriesData({ queryKey: ['admin-reviews', 'list'], exact: false }, (old) => {
          if (!old?.results) return old;
          return {
            ...old,
            results: old.results.map((r) =>
              ids.includes(r._id) ? { ...r, isApproved } : r
            ),
          };
        });
      }

      return { snapshot };
    },

    onSuccess: (_, { ids, action }) => {
      toast.success(`${ids.length} review${ids.length > 1 ? 's' : ''} ${action}d`);
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.stats() });
    },

    onError: (_err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error('Bulk action failed');
    },

    onSettled: () => invalidateList(queryClient),
  });
}