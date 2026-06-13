// src/hooks/useProducts.js
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { ADMIN_ITEMS_PER_PAGE } from '@/lib/constants';

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const productKeys = {
  all:    ()        => ['admin-products'],
  list:   (filters) => ['admin-products', 'list', filters],
  detail: (id)      => ['admin-products', 'detail', id],
};

// ─── Helper: cache থেকে ids বাদ দাও ─────────────────────────────────────────
function removeFromCache(queryClient, idsToRemove) {
  queryClient.setQueriesData({ queryKey: productKeys.all() }, (old) => {
    if (!old?.results) return old;
    const removed = old.results.filter((p) => !idsToRemove.includes(p._id));
    return {
      ...old,
      results: removed,
      total: Math.max(0, (old.total ?? 0) - (old.results.length - removed.length)),
    };
  });
}

// ─── 1. Fetch ─────────────────────────────────────────────────────────────────
export function useAdminProducts(page = 1, filters = {}) {
  return useQuery({
    queryKey: productKeys.list({ page, ...filters }),
    queryFn: async () => {
      const res = await productService.adminGetAll({
        page,
        limit:    ADMIN_ITEMS_PER_PAGE,
        search:   filters.search   || undefined,
        status:   filters.status   || undefined,
        category: filters.category || undefined,
        sort:     filters.sort     || '-createdAt',
      });
      return res.data;
    },
    staleTime:        1000 * 60 * 2,
    keepPreviousData: true,
  
  });
}

// ─── 1b. Fetch single product by ID (for modal — includes variants) ───────────
export function useAdminProductById(id) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn:  async () => {
      const res = await productService.adminGetById(id);
      return res.data?.data ?? res.data;
    },
    enabled:   !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── 2. Archive (soft-delete) ─────────────────────────────────────────────────
export function useArchiveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => productService.adminArchive(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: productKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: productKeys.all() });
      // cache এ status 'archived' করে দাও
      qc.setQueriesData({ queryKey: productKeys.all() }, (old) => {
        if (!old?.results) return old;
        return {
          ...old,
          results: old.results.map((p) =>
            p._id === id ? { ...p, status: 'archived', isActive: false } : p
          ),
        };
      });
      return { snapshot };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: productKeys.all() }),
  });
}

// ─── 3. Hard-delete ──────────────────────────────────────────────────────────
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => productService.adminDelete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: productKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: productKeys.all() });
      removeFromCache(qc, [id]);
      return { snapshot };
    },
    onSuccess: (_res, id) => console.log('✅ Hard deleted id:', id),
    onError: (_err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: productKeys.all() }),
  });
}

// ─── 4. Bulk archive ─────────────────────────────────────────────────────────
export function useBulkArchiveProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => productService.adminBulkArchive(ids),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: productKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: productKeys.all() });
      qc.setQueriesData({ queryKey: productKeys.all() }, (old) => {
        if (!old?.results) return old;
        return {
          ...old,
          results: old.results.map((p) =>
            ids.includes(p._id) ? { ...p, status: 'archived', isActive: false } : p
          ),
        };
      });
      return { snapshot };
    },
    onSuccess: (_res, ids) => console.log('✅ Bulk archived ids:', ids),
    onError: (_err, _ids, ctx) => {
      ctx?.snapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: productKeys.all() }),
  });
}

// ─── 5. Bulk hard-delete ─────────────────────────────────────────────────────
export function useBulkDeleteProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => productService.adminBulkDelete(ids),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: productKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: productKeys.all() });
      removeFromCache(qc, ids);
      return { snapshot };
    },
    onSuccess: (_res, ids) => console.log('✅ Bulk hard deleted ids:', ids),
    onError: (_err, _ids, ctx) => {
      ctx?.snapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: productKeys.all() }),
  });
}

// ─── 6. Toggle status (active ↔ draft) ───────────────────────────────────────
export function useToggleProductStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, currentStatus }) =>
      productService.adminToggleStatus(id, currentStatus),
    onMutate: async ({ id, currentStatus }) => {
      await qc.cancelQueries({ queryKey: productKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: productKeys.all() });
      const nextStatus = currentStatus === 'active' ? 'draft' : 'active';
      qc.setQueriesData({ queryKey: productKeys.all() }, (old) => {
        if (!old?.results) return old;
        return {
          ...old,
          results: old.results.map((p) =>
            p._id === id ? { ...p, status: nextStatus } : p
          ),
        };
      });
      return { snapshot, nextStatus };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: productKeys.all() }),
  });
}