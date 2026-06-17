// 📁 PATH: src/hooks/client/useReviews.js
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/reviewService';
import toast from 'react-hot-toast';

/* ── Query Key Factory ───────────────────────────────────────────────── */
export const reviewKeys = {
  all:       ()                   => ['client-reviews'],
  byProduct: (productId, filters) => ['client-reviews', 'product', productId, filters],
};

/** productId-'s all review queries invalidate Do — filters anyway */
function invalidateProduct(queryClient, productId) {
  queryClient.invalidateQueries({
    queryKey: ['client-reviews', 'product', productId],
    exact: false,
  });
}

/* ══════════════════════════════════════════════════════════════════════
   1. useProductReviews
══════════════════════════════════════════════════════════════════════ */
export function useProductReviews(productId, filters = {}) {
  const { page = 1, limit = 10, sort = 'newest', rating } = filters;

  return useQuery({
    queryKey: reviewKeys.byProduct(productId, { page, limit, sort, rating }),
    queryFn: async () => {
      const params = { page, limit, sort };
      if (rating) params.rating = rating;
      const res = await reviewService.getByProduct(productId, params);
      return res.data;
    },
    enabled:          !!productId,
    staleTime:        1000 * 60 * 2,
    keepPreviousData: true,
  });
}

/* ══════════════════════════════════════════════════════════════════════
   2. useSubmitReview
══════════════════════════════════════════════════════════════════════ */
export function useSubmitReview(productId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => reviewService.create(productId, data),

    onSuccess: () => {
      toast.success('Review submitted! It will appear after moderation.');
      invalidateProduct(queryClient, productId);
    },

    onError: (err) => {
      const msg = err?.response?.data?.message ?? 'Failed to submit review';
      toast.error(msg);
    },
  });
}

/* ══════════════════════════════════════════════════════════════════════
   3. useUpdateReview
══════════════════════════════════════════════════════════════════════ */
export function useUpdateReview(productId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }) => reviewService.update(reviewId, data),

    onSuccess: () => {
      toast.success('Review updated and pending re-moderation.');
      invalidateProduct(queryClient, productId);
    },

    onError: (err) => {
      const msg = err?.response?.data?.message ?? 'Failed to update review';
      toast.error(msg);
    },
  });
}

/* ══════════════════════════════════════════════════════════════════════
   4. useDeleteReview
══════════════════════════════════════════════════════════════════════ */
export function useDeleteReview(productId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId) => reviewService.delete(reviewId),

    onSuccess: () => {
      toast.success('Review deleted.');
      invalidateProduct(queryClient, productId);
    },

    onError: (err) => {
      const msg = err?.response?.data?.message ?? 'Failed to delete review';
      toast.error(msg);
    },
  });
}