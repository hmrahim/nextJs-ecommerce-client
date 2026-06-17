// src/hooks/useAttributes.js
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attributeService } from '@/services/attributeService';
import toast from 'react-hot-toast';

// ─── Slug helper ──────────────────────────────────────────────────────────────
const slugify = (t) =>
  t.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const attributeKeys = {
  all:    ()        => ['admin-attributes'],
  list:   (filters) => ['admin-attributes', 'list', filters],
  detail: (id)      => ['admin-attributes', 'detail', id],
  stats:  ()        => ['admin-attributes', 'stats'],
};

// ─── Stats recalculator (local cache sync) ───────────────────────────────────
function recalcStats(list) {
  return {
    total:       list.length,
    active:      list.filter((a) => a.isActive).length,
    inactive:    list.filter((a) => !a.isActive).length,
    filterable:  list.filter((a) => a.isFilterable).length,
    variant:     list.filter((a) => a.isVariant).length,
    totalValues: list.reduce((s, a) => s + (a.values?.length || 0), 0),
  };
}

// ─── Helper: update a single attribute in every cached list ──────────────────
function patchInCache(queryClient, id, updater) {
  queryClient.setQueriesData({ queryKey: attributeKeys.all() }, (old) => {
    if (!old?.attributes) return old;
    const updated = old.attributes.map((a) => (a._id === id ? updater(a) : a));
    return { ...old, attributes: updated, stats: recalcStats(updated) };
  });
}

// ─── Helper: remove attributes from every cached list ────────────────────────
function removeFromCache(queryClient, ids) {
  queryClient.setQueriesData({ queryKey: attributeKeys.all() }, (old) => {
    if (!old?.attributes) return old;
    const updated = old.attributes.filter((a) => !ids.includes(a._id));
    return { ...old, attributes: updated, stats: recalcStats(updated) };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. List — attributes fetch (with filters)
// ═══════════════════════════════════════════════════════════════════════════════
export function useAdminAttributes(filters = {}) {
  return useQuery({
    queryKey: attributeKeys.list(filters),
    queryFn: async () => {
      const res = await attributeService.adminGetAll({
        search: filters.search     || undefined,
        type:   filters.typeFilter || undefined,
        status: filters.statusFilter || undefined,
      });
      return res.data.data; // backend: { success, data: { attributes, stats } }
    },
    staleTime:        1000 * 60 * 2,
    keepPreviousData: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Single attribute detail
// ═══════════════════════════════════════════════════════════════════════════════
export function useAdminAttribute(id) {
  return useQuery({
    queryKey: attributeKeys.detail(id),
    queryFn: async () => {
      const res = await attributeService.adminGetById(id);
      return res.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Stats
// ═══════════════════════════════════════════════════════════════════════════════
export function useAttributeStats() {
  return useQuery({
    queryKey: attributeKeys.stats(),
    queryFn: async () => {
      const res = await attributeService.adminGetStats();
      return res.data.data;
    },
    staleTime: 1000 * 60 * 3,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Create attribute
// ═══════════════════════════════════════════════════════════════════════════════
export function useCreateAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) =>
      attributeService.adminCreate({
        ...formData,
        slug: formData.slug || slugify(formData.name),
      }),
    onSuccess: (res) => {
      toast.success('Attribute created');
      // new attribute all of it list cache-Put it in
      qc.setQueriesData({ queryKey: attributeKeys.all() }, (old) => {
        if (!old?.attributes) return old;
        const updated = [...old.attributes, res.data.data];
        return { ...old, attributes: updated, stats: recalcStats(updated) };
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create attribute');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: attributeKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Update attribute
// ═══════════════════════════════════════════════════════════════════════════════
export function useUpdateAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => attributeService.adminUpdate(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: attributeKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: attributeKeys.all() });
      patchInCache(qc, id, (a) => ({ ...a, ...data }));
      return { snapshot };
    },
    onSuccess: () => toast.success('Attribute updated'),
    onError: (err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Failed to update attribute');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: attributeKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Delete attribute
// ═══════════════════════════════════════════════════════════════════════════════
export function useDeleteAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => attributeService.adminDelete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: attributeKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: attributeKeys.all() });
      removeFromCache(qc, [id]);
      return { snapshot };
    },
    onSuccess: () => toast.success('Attribute deleted'),
    onError: (err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Failed to delete attribute');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: attributeKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Toggle active/inactive
// ═══════════════════════════════════════════════════════════════════════════════
export function useToggleAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => attributeService.adminToggle(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: attributeKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: attributeKeys.all() });
      patchInCache(qc, id, (a) => ({ ...a, isActive: !a.isActive }));
      return { snapshot };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Failed to toggle attribute');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: attributeKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Bulk activate
// ═══════════════════════════════════════════════════════════════════════════════
export function useBulkActivateAttributes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      // attributeService-In bulk endpoint If not available parallel call
      await Promise.all(ids.map((id) => attributeService.adminUpdate(id, { isActive: true })));
    },
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: attributeKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: attributeKeys.all() });
      qc.setQueriesData({ queryKey: attributeKeys.all() }, (old) => {
        if (!old?.attributes) return old;
        const updated = old.attributes.map((a) =>
          ids.includes(a._id) ? { ...a, isActive: true } : a
        );
        return { ...old, attributes: updated, stats: recalcStats(updated) };
      });
      return { snapshot };
    },
    onSuccess: (_res, ids) => toast.success(`${ids.length} activated`),
    onError: (_err, _ids, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Bulk activate failed');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: attributeKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Bulk deactivate
// ═══════════════════════════════════════════════════════════════════════════════
export function useBulkDeactivateAttributes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => attributeService.adminUpdate(id, { isActive: false })));
    },
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: attributeKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: attributeKeys.all() });
      qc.setQueriesData({ queryKey: attributeKeys.all() }, (old) => {
        if (!old?.attributes) return old;
        const updated = old.attributes.map((a) =>
          ids.includes(a._id) ? { ...a, isActive: false } : a
        );
        return { ...old, attributes: updated, stats: recalcStats(updated) };
      });
      return { snapshot };
    },
    onSuccess: (_res, ids) => toast.success(`${ids.length} deactivated`),
    onError: (_err, _ids, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Bulk deactivate failed');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: attributeKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. Bulk delete
// ═══════════════════════════════════════════════════════════════════════════════
export function useBulkDeleteAttributes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => attributeService.adminDelete(id)));
    },
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: attributeKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: attributeKeys.all() });
      removeFromCache(qc, ids);
      return { snapshot };
    },
    onSuccess: (_res, ids) => toast.success(`${ids.length} deleted`),
    onError: (_err, _ids, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Bulk delete failed');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: attributeKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. Add value (drawer)
// ═══════════════════════════════════════════════════════════════════════════════
export function useAddAttributeValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attrId, data }) => attributeService.adminAddValue(attrId, data),
  onSuccess: (res, { attrId }) => {
      toast.success('Value added');
      const raw = res.data.data;
      // backend returns "valueData", drawer expects "value"
      const newVal = { ...raw, value: raw.valueData };
      patchInCache(qc, attrId, (a) => ({
        ...a,
        values: [...(a.values || []), newVal],
      }));
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to add value');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: attributeKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. Update value
// ═══════════════════════════════════════════════════════════════════════════════
export function useUpdateAttributeValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attrId, valId, data }) =>
      attributeService.adminUpdateValue(attrId, valId, data),
    onMutate: async ({ attrId, valId, data }) => {
      await qc.cancelQueries({ queryKey: attributeKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: attributeKeys.all() });
      patchInCache(qc, attrId, (a) => ({
        ...a,
        values: (a.values || []).map((v) => (v._id === valId ? { ...v, ...data } : v)),
      }));
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Failed to update value');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: attributeKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. Delete value
// ═══════════════════════════════════════════════════════════════════════════════
export function useDeleteAttributeValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attrId, valId }) =>
      attributeService.adminDeleteValue(attrId, valId),
    onMutate: async ({ attrId, valId }) => {
      await qc.cancelQueries({ queryKey: attributeKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: attributeKeys.all() });
      patchInCache(qc, attrId, (a) => ({
        ...a,
        values: (a.values || []).filter((v) => v._id !== valId),
      }));
      return { snapshot };
    },
    onSuccess: () => toast.success('Value removed'),
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Failed to delete value');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: attributeKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14. Toggle value active/inactive
// ═══════════════════════════════════════════════════════════════════════════════
export function useToggleAttributeValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attrId, valId, currentActive }) =>
      attributeService.adminUpdateValue(attrId, valId, { isActive: !currentActive }),
    onMutate: async ({ attrId, valId, currentActive }) => {
      await qc.cancelQueries({ queryKey: attributeKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: attributeKeys.all() });
      patchInCache(qc, attrId, (a) => ({
        ...a,
        values: (a.values || []).map((v) =>
          v._id === valId ? { ...v, isActive: !currentActive } : v
        ),
      }));
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Failed to toggle value');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: attributeKeys.all() }),
  });
}