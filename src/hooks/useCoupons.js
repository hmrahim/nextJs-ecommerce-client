// 📁 PATH: src/hooks/useCoupons.js
// react-query hooks — useBrands.js pattern follow has been done
// Optimistic updates + cache patching + toast notifications

'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { couponService } from '@/services/couponService';

// ─── Query key factory ────────────────────────────────────────────────────
export const couponKeys = {
  all:    ()        => ['admin-coupons'],
  list:   (filters) => ['admin-coupons', 'list', filters],
  detail: (id)      => ['admin-coupons', 'detail', id],
  stats:  ()        => ['admin-coupons', 'stats'],
  usage:  (id, p)   => ['admin-coupons', 'usage', id, p],
};

// ─── Helpers: derive status & recalc stats client-side ────────────────────
export function deriveStatus(c) {
  if (!c) return 'inactive';
  if (!c.isActive) return 'inactive';
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return 'expired';
  if (c.maxUses && c.usedCount >= c.maxUses) return 'exhausted';
  if (c.startDate && new Date(c.startDate) > new Date()) return 'scheduled';
  return 'active';
}

function recalcStats(list = []) {
  return {
    total:     list.length,
    active:    list.filter((c) => deriveStatus(c) === 'active').length,
    inactive:  list.filter((c) => deriveStatus(c) === 'inactive').length,
    expired:   list.filter((c) => deriveStatus(c) === 'expired').length,
    exhausted: list.filter((c) => deriveStatus(c) === 'exhausted').length,
    scheduled: list.filter((c) => deriveStatus(c) === 'scheduled').length,
    totalUses: list.reduce((s, c) => s + (c.usedCount || 0), 0),
  };
}

// Patch a single coupon across every cached list
function patchInLists(qc, id, updater) {
  qc.setQueriesData({ queryKey: couponKeys.all() }, (old) => {
    if (!old?.coupons) return old;
    const updated = old.coupons.map((c) => (c._id === id ? updater(c) : c));
    return { ...old, coupons: updated, stats: recalcStats(updated) };
  });
}

function removeFromLists(qc, ids) {
  qc.setQueriesData({ queryKey: couponKeys.all() }, (old) => {
    if (!old?.coupons) return old;
    const updated = old.coupons.filter((c) => !ids.includes(c._id));
    return { ...old, coupons: updated, stats: recalcStats(updated) };
  });
}

// Backend response Whom normalize Do — backend any shape Can send to this
function normalizeList(payload) {
  // I hope backend: { success, data: { coupons, total, pages, stats? } }
  const data = payload?.data ?? payload;
  const coupons = data?.coupons || data?.data || data?.items || [];
  return {
    coupons,
    total: data?.total ?? coupons.length,
    pages: data?.pages ?? 1,
    page:  data?.page  ?? 1,
    stats: data?.stats ?? recalcStats(coupons),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. List
// ═══════════════════════════════════════════════════════════════════════════
export function useAdminCoupons(filters = {}) {
  return useQuery({
    queryKey: couponKeys.list(filters),
    queryFn: async () => {
      const res = await couponService.adminGetAll({
        page:   filters.page   || 1,
        limit:  filters.limit  || 15,
        search: filters.search || undefined,
        status: filters.status || undefined,
        type:   filters.type   || undefined,
        sort:   filters.sort   || 'createdAt:desc',
      });
      return normalizeList(res.data);
    },
    placeholderData: keepPreviousData,
    staleTime:       1000 * 60 * 2,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Detail
// ═══════════════════════════════════════════════════════════════════════════
export function useAdminCoupon(id) {
  return useQuery({
    queryKey: couponKeys.detail(id),
    queryFn: async () => {
      const res = await couponService.adminGetById(id);
      return res.data?.data ?? res.data;
    },
    enabled:   !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Stats (separate endpoint)
// ═══════════════════════════════════════════════════════════════════════════
export function useCouponStats() {
  return useQuery({
    queryKey: couponKeys.stats(),
    queryFn: async () => {
      const res = await couponService.adminGetStats();
      return res.data?.data ?? res.data;
    },
    staleTime: 1000 * 60 * 3,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Usage breakdown
// ═══════════════════════════════════════════════════════════════════════════
export function useCouponUsage(id, params = {}) {
  return useQuery({
    queryKey: couponKeys.usage(id, params),
    queryFn: async () => {
      const res = await couponService.adminGetUsage(id, params);
      return res.data?.data ?? res.data;
    },
    enabled: !!id,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. Generate code (one-shot, no caching)
// ═══════════════════════════════════════════════════════════════════════════
export function useGenerateCouponCode() {
  return useMutation({
    mutationFn: async () => {
      const res = await couponService.adminGenCode();
      return res.data?.code || res.data?.data?.code;
    },
    onError: () => toast.error('Could not generate code'),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. Create
// ═══════════════════════════════════════════════════════════════════════════
export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => couponService.adminCreate(data),
    onSuccess: (res) => {
      toast.success('Coupon created');
      const created = res.data?.data ?? res.data;
      // prepend to every list cache
      qc.setQueriesData({ queryKey: couponKeys.all() }, (old) => {
        if (!old?.coupons) return old;
        const updated = [created, ...old.coupons];
        return { ...old, coupons: updated, total: (old.total || 0) + 1, stats: recalcStats(updated) };
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create coupon');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: couponKeys.all() });
      qc.invalidateQueries({ queryKey: couponKeys.stats() });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. Update (optimistic)
// ═══════════════════════════════════════════════════════════════════════════
export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => couponService.adminUpdate(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: couponKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: couponKeys.all() });
      patchInLists(qc, id, (c) => ({ ...c, ...data }));
      return { snapshot };
    },
    onSuccess: () => toast.success('Coupon updated'),
    onError: (err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Failed to update coupon');
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: couponKeys.all() });
      qc.invalidateQueries({ queryKey: couponKeys.detail(vars.id) });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. Delete (optimistic)
// ═══════════════════════════════════════════════════════════════════════════
export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => couponService.adminDelete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: couponKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: couponKeys.all() });
      removeFromLists(qc, [id]);
      return { snapshot };
    },
    onSuccess: () => toast.success('Coupon deleted'),
    onError: (err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Failed to delete coupon');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: couponKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. Bulk delete (optimistic)
// ═══════════════════════════════════════════════════════════════════════════
export function useBulkDeleteCoupons() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => couponService.adminBulkDelete(ids),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: couponKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: couponKeys.all() });
      removeFromLists(qc, ids);
      return { snapshot };
    },
    onSuccess: (_d, ids) => toast.success(`${ids.length} coupon(s) deleted`),
    onError: (err, _ids, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Bulk delete failed');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: couponKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. Toggle status (optimistic flip)
// ═══════════════════════════════════════════════════════════════════════════
export function useToggleCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => couponService.adminToggle(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: couponKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: couponKeys.all() });
      patchInLists(qc, id, (c) => ({ ...c, isActive: !c.isActive }));
      return { snapshot };
    },
    onSuccess: (res) => {
      const updated = res.data?.data ?? res.data;
      if (updated?._id) patchInLists(qc, updated._id, () => updated);
    },
    onError: (err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Failed to toggle status');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: couponKeys.all() }),
  });
}
