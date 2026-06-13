
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandService } from '@/services/brandService';
import toast from 'react-hot-toast';

// ─── Slug helper ──────────────────────────────────────────────────────────────
const slugify = (t) =>
  t.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const brandKeys = {
  all:    ()        => ['admin-brands'],
  list:   (filters) => ['admin-brands', 'list', filters],
  detail: (id)      => ['admin-brands', 'detail', id],
  stats:  ()        => ['admin-brands', 'stats'],
};

// ─── Stats recalculator ───────────────────────────────────────────────────────
function recalcStats(list) {
  return {
    total:         list.length,
    active:        list.filter((b) => b.isActive).length,
    activeOnly:    list.filter((b) => b.isActive && !b.isFeatured).length,
    inactive:      list.filter((b) => !b.isActive).length,
    featured:      list.filter((b) => b.isFeatured).length,
    totalProducts: list.reduce((s, b) => s + (b.productCount || 0), 0),
  };
}

// ─── Helper: একটা brand সব cached list এ patch করো ──────────────────────────
function patchInCache(queryClient, id, updater) {
  queryClient.setQueriesData({ queryKey: brandKeys.all() }, (old) => {
    if (!old?.brands) return old;
    const updated = old.brands.map((b) => (b._id === id ? updater(b) : b));
    return { ...old, brands: updated, stats: recalcStats(updated) };
  });
}

// ─── Helper: cache থেকে brands সরাও ─────────────────────────────────────────
function removeFromCache(queryClient, ids) {
  queryClient.setQueriesData({ queryKey: brandKeys.all() }, (old) => {
    if (!old?.brands) return old;
    const updated = old.brands.filter((b) => !ids.includes(b._id));
    return { ...old, brands: updated, stats: recalcStats(updated) };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. List — brands fetch (with filters)
// ═══════════════════════════════════════════════════════════════════════════════
export function useAdminBrands(filters = {}) {
  return useQuery({
    queryKey: brandKeys.list(filters),
    queryFn: async () => {
      const res = await brandService.adminGetAll({
        search:   filters.search       || undefined,
        status:   filters.filterStatus || undefined,
        featured: filters.featured     || undefined,
      });
      return res.data.data; // backend: { success, data: { brands, stats } }
    },
    staleTime:        1000 * 60 * 2,
    keepPreviousData: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Single brand detail
// ═══════════════════════════════════════════════════════════════════════════════
export function useAdminBrand(id) {
  return useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: async () => {
      const res = await brandService.adminGetById(id);
      return res.data.data;
    },
    enabled:   !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Stats
// ═══════════════════════════════════════════════════════════════════════════════
export function useBrandStats() {
  return useQuery({
    queryKey: brandKeys.stats(),
    queryFn: async () => {
      const res = await brandService.adminGetStats();
      return res.data.data;
    },
    staleTime: 1000 * 60 * 3,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Create brand
// ═══════════════════════════════════════════════════════════════════════════════
export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) =>
      brandService.adminCreate({
        ...formData,
        slug: formData.slug || slugify(formData.name),
      }),
    onSuccess: (res) => {
      toast.success('Brand created');
      const newBrand = res.data.data;
      qc.setQueriesData({ queryKey: brandKeys.all() }, (old) => {
        if (!old?.brands) return old;
        const updated = [...old.brands, newBrand];
        return { ...old, brands: updated, stats: recalcStats(updated) };
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create brand');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: brandKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Update brand
// ═══════════════════════════════════════════════════════════════════════════════
export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => brandService.adminUpdate(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: brandKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: brandKeys.all() });
      patchInCache(qc, id, (b) => ({ ...b, ...data }));
      return { snapshot };
    },
    onSuccess: () => toast.success('Brand updated'),
    onError: (err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Failed to update brand');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: brandKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Delete brand
// ═══════════════════════════════════════════════════════════════════════════════
export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => brandService.adminDelete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: brandKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: brandKeys.all() });
      removeFromCache(qc, [id]);
      return { snapshot };
    },
    onSuccess: () => toast.success('Brand deleted'),
    onError: (err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Failed to delete brand');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: brandKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Toggle isActive
// ═══════════════════════════════════════════════════════════════════════════════
export function useToggleBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => brandService.adminToggle(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: brandKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: brandKeys.all() });
      patchInCache(qc, id, (b) => ({ ...b, isActive: !b.isActive }));
      return { snapshot };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Failed to toggle brand');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: brandKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Toggle isFeatured
// ═══════════════════════════════════════════════════════════════════════════════
export function useToggleBrandFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => brandService.adminFeature(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: brandKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: brandKeys.all() });
      patchInCache(qc, id, (b) => ({ ...b, isFeatured: !b.isFeatured }));
      return { snapshot };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Failed to toggle featured');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: brandKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Bulk delete
// ═══════════════════════════════════════════════════════════════════════════════
export function useBulkDeleteBrands() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => brandService.adminDelete(id)));
    },
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: brandKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: brandKeys.all() });
      removeFromCache(qc, ids);
      return { snapshot };
    },
    onSuccess: (_res, ids) => toast.success(`${ids.length} brand(s) deleted`),
    onError: (_err, _ids, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Bulk delete failed');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: brandKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. Bulk activate
// ═══════════════════════════════════════════════════════════════════════════════
export function useBulkActivateBrands() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => brandService.adminUpdate(id, { isActive: true })));
    },
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: brandKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: brandKeys.all() });
      qc.setQueriesData({ queryKey: brandKeys.all() }, (old) => {
        if (!old?.brands) return old;
        const updated = old.brands.map((b) =>
          ids.includes(b._id) ? { ...b, isActive: true } : b
        );
        return { ...old, brands: updated, stats: recalcStats(updated) };
      });
      return { snapshot };
    },
    onSuccess: (_res, ids) => toast.success(`${ids.length} brand(s) activated`),
    onError: (_err, _ids, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Bulk activate failed');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: brandKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. Bulk deactivate
// ═══════════════════════════════════════════════════════════════════════════════
export function useBulkDeactivateBrands() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => brandService.adminUpdate(id, { isActive: false })));
    },
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: brandKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: brandKeys.all() });
      qc.setQueriesData({ queryKey: brandKeys.all() }, (old) => {
        if (!old?.brands) return old;
        const updated = old.brands.map((b) =>
          ids.includes(b._id) ? { ...b, isActive: false } : b
        );
        return { ...old, brands: updated, stats: recalcStats(updated) };
      });
      return { snapshot };
    },
    onSuccess: (_res, ids) => toast.success(`${ids.length} brand(s) deactivated`),
    onError: (_err, _ids, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Bulk deactivate failed');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: brandKeys.all() }),
  });
}
