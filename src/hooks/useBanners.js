'use client';
// 📁 PATH: src/hooks/useBanners.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannerService } from '@/services/Bannerservice';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const bannerKeys = {
  all:    ()        => ['admin-banners'],
  list:   (filters) => ['admin-banners', 'list', filters],
  detail: (id)      => ['admin-banners', 'detail', id],
  stats:  ()        => ['admin-banners', 'stats'],
};

// ─── Stats recalculator (optimistic update for this) ──────────────────────────
function recalcStats(list) {
  return {
    total:       list.length,
    live:        list.filter((b) => b.status === 'live').length,
    scheduled:   list.filter((b) => b.status === 'scheduled').length,
    paused:      list.filter((b) => b.status === 'paused').length,
    expired:     list.filter((b) => b.status === 'expired').length,
    draft:       list.filter((b) => b.status === 'draft').length,
    clicks:      list.reduce((s, b) => s + (b.clicks || 0), 0),
    impressions: list.reduce((s, b) => s + (b.impressions || 0), 0),
  };
}

// ─── Helper: a banner All cached list In patch Do ──────────────────────────
function patchInCache(queryClient, id, updater) {
  queryClient.setQueriesData({ queryKey: bannerKeys.all() }, (old) => {
    if (!old?.banners) return old;
    const updated = old.banners.map((b) => (b._id === id ? updater(b) : b));
    return { ...old, banners: updated, stats: recalcStats(updated) };
  });
}

// ─── Helper: cache from banners remove ─────────────────────────────────────────
function removeFromCache(queryClient, ids) {
  queryClient.setQueriesData({ queryKey: bannerKeys.all() }, (old) => {
    if (!old?.banners) return old;
    const updated = old.banners.filter((b) => !ids.includes(b._id));
    return { ...old, banners: updated, stats: recalcStats(updated) };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. List — banners fetch (with filters)
// ═══════════════════════════════════════════════════════════════════════════════
export function useAdminBanners(filters = {}) {
  return useQuery({
    queryKey: bannerKeys.list(filters),
    queryFn: async () => {
      const res = await bannerService.adminGetAll({
        search:    filters.search    || undefined,
        placement: filters.placement !== 'all' ? filters.placement : undefined,
        status:    filters.status    !== 'all' ? filters.status    : undefined,
      });
      return res.data.data; // backend: { success, data: { banners, stats } }
    },
    staleTime:        1000 * 60 * 2,
    keepPreviousData: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Single banner detail
// ═══════════════════════════════════════════════════════════════════════════════
export function useAdminBanner(id) {
  return useQuery({
    queryKey: bannerKeys.detail(id),
    queryFn: async () => {
      const res = await bannerService.adminGetById(id);
      return res.data.data;
    },
    enabled:   !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Stats
// ═══════════════════════════════════════════════════════════════════════════════
export function useBannerStats() {
  return useQuery({
    queryKey: bannerKeys.stats(),
    queryFn: async () => {
      const res = await bannerService.adminGetStats();
      return res.data.data;
    },
    staleTime: 1000 * 60 * 3,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Create banner
// ═══════════════════════════════════════════════════════════════════════════════
export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => bannerService.adminCreate(formData),
    onSuccess: (res) => {
      toast.success('Banner created successfully!');
      const newBanner = res.data.data;
      qc.setQueriesData({ queryKey: bannerKeys.all() }, (old) => {
        if (!old?.banners) return old;
        const updated = [newBanner, ...old.banners];
        return { ...old, banners: updated, stats: recalcStats(updated) };
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create banner');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: bannerKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Update banner
// ═══════════════════════════════════════════════════════════════════════════════
export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => bannerService.adminUpdate(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: bannerKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: bannerKeys.all() });
      patchInCache(qc, id, (b) => ({ ...b, ...data }));
      return { snapshot };
    },
    onSuccess: () => toast.success('Banner updated successfully!'),
    onError: (err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Failed to update banner');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: bannerKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Delete banner
// ═══════════════════════════════════════════════════════════════════════════════
export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => bannerService.adminDelete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: bannerKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: bannerKeys.all() });
      removeFromCache(qc, [id]);
      return { snapshot };
    },
    onSuccess: () => toast.success('Banner deleted'),
    onError: (err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Failed to delete banner');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: bannerKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Toggle status (live ⇄ paused)
// ═══════════════════════════════════════════════════════════════════════════════
export function useToggleBannerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => bannerService.adminToggleStatus(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: bannerKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: bannerKeys.all() });
      patchInCache(qc, id, (b) => ({
        ...b,
        status: b.status === 'live' ? 'paused' : 'live',
      }));
      return { snapshot };
    },
    onSuccess: (_res, id) => {
      // server from updated banner taking cache patch Do
      const updated = _res?.data?.data;
      if (updated) patchInCache(qc, id, () => updated);
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Failed to toggle banner status');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: bannerKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Public — track click
// ═══════════════════════════════════════════════════════════════════════════════
export function useTrackBannerClick() {
  return useMutation({
    mutationFn: (id) => bannerService.trackClick(id),
    // silent — no toast, no cache update needed
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Public — track impression
// ═══════════════════════════════════════════════════════════════════════════════
export function useTrackBannerImpression() {
  return useMutation({
    mutationFn: (id) => bannerService.trackImpression(id),
    // silent
  });
}


export function useBanners(placement, { platform = "web" } = {}) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!placement) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/banners/platform/${platform}/placement/${placement}`
        );
        if (!cancelled) {
          setBanners(Array.isArray(res.data?.data) ? res.data.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setBanners([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placement, platform]);

  return { banners, loading, error };
}
