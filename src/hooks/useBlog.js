'use client';
// 📁 PATH: src/hooks/useBlog.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService } from '@/services/blogService';
import toast from 'react-hot-toast';

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const blogKeys = {
  all:    ()        => ['admin-blogs'],
  list:   (filters) => ['admin-blogs', 'list', filters],
  detail: (id)      => ['admin-blogs', 'detail', id],
  stats:  ()        => ['admin-blogs', 'stats'],
};

// ─── Stats recalculator (optimistic update এর জন্য) ──────────────────────────
function recalcStats(list) {
  return {
    total:     list.length,
    published: list.filter((b) => b.status === 'published').length,
    draft:     list.filter((b) => b.status === 'draft').length,
    scheduled: list.filter((b) => b.status === 'scheduled').length,
    review:    list.filter((b) => b.status === 'review').length,
    archived:  list.filter((b) => b.status === 'archived').length,
    featured:  list.filter((b) => b.isFeatured).length,
    totalViews: list.reduce((s, b) => s + (b.views || 0), 0),
  };
}

// ─── Helper: একটা blog সব cached list এ patch করো ────────────────────────────
function patchInCache(queryClient, id, updater) {
  queryClient.setQueriesData({ queryKey: blogKeys.all() }, (old) => {
    if (!old?.posts) return old;
    const updated = old.posts.map((b) => (b._id === id ? updater(b) : b));
    return { ...old, posts: updated, stats: recalcStats(updated) };
  });
}

// ─── Helper: cache থেকে blogs সরাও ──────────────────────────────────────────
function removeFromCache(queryClient, ids) {
  queryClient.setQueriesData({ queryKey: blogKeys.all() }, (old) => {
    if (!old?.posts) return old;
    const updated = old.posts.filter((b) => !ids.includes(b._id));
    return { ...old, posts: updated, stats: recalcStats(updated) };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. List — blogs fetch (with filters)
// ═══════════════════════════════════════════════════════════════════════════════
export function useAdminBlogs(filters = {}) {
  return useQuery({
    queryKey: blogKeys.list(filters),
    queryFn: async () => {
      const res = await blogService.adminGetAll({
        search:   filters.search   || undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        status:   filters.status   !== 'all' ? filters.status   : undefined,
        page:     filters.page     || 1,
        limit:    filters.limit    || 50,
      });
      return res.data.data; // backend: { success, data: { posts, stats, pagination } }
    },
    staleTime:        1000 * 60 * 2,
    keepPreviousData: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Single blog detail
// ═══════════════════════════════════════════════════════════════════════════════
export function useAdminBlog(id) {
  return useQuery({
    queryKey: blogKeys.detail(id),
    queryFn: async () => {
      const res = await blogService.adminGetById(id);
      return res.data.data;
    },
    enabled:   !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Stats
// ═══════════════════════════════════════════════════════════════════════════════
export function useBlogStats() {
  return useQuery({
    queryKey: blogKeys.stats(),
    queryFn: async () => {
      const res = await blogService.adminGetStats();
      return res.data.data;
    },
    staleTime: 1000 * 60 * 3,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Create blog post
// ═══════════════════════════════════════════════════════════════════════════════
export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => blogService.adminCreate(data),
    onSuccess: (res) => {
      toast.success('Blog post created successfully!');
      const newPost = res.data.data;
      qc.setQueriesData({ queryKey: blogKeys.all() }, (old) => {
        if (!old?.posts) return old;
        const updated = [newPost, ...old.posts];
        return { ...old, posts: updated, stats: recalcStats(updated) };
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create blog post');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: blogKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Update blog post
// ═══════════════════════════════════════════════════════════════════════════════
export function useUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => blogService.adminUpdate(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: blogKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: blogKeys.all() });
      patchInCache(qc, id, (b) => ({ ...b, ...data }));
      return { snapshot };
    },
    onSuccess: () => toast.success('Blog post updated successfully!'),
    onError: (err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Failed to update blog post');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: blogKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Delete single blog post
// ═══════════════════════════════════════════════════════════════════════════════
export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => blogService.adminDelete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: blogKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: blogKeys.all() });
      removeFromCache(qc, [id]);
      return { snapshot };
    },
    onSuccess: () => toast.success('Blog post deleted'),
    onError: (err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Failed to delete blog post');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: blogKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Bulk delete
// ═══════════════════════════════════════════════════════════════════════════════
export function useBulkDeleteBlogs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => blogService.adminBulkDelete(ids),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: blogKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: blogKeys.all() });
      removeFromCache(qc, ids);
      return { snapshot };
    },
    onSuccess: (_res, ids) => toast.success(`${ids.length} post(s) deleted`),
    onError: (err, _ids, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Bulk delete failed');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: blogKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Bulk status change (publish / archive)
// ═══════════════════════════════════════════════════════════════════════════════
export function useBulkUpdateBlogStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }) => blogService.adminBulkStatus(ids, status),
    onMutate: async ({ ids, status }) => {
      await qc.cancelQueries({ queryKey: blogKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: blogKeys.all() });
      qc.setQueriesData({ queryKey: blogKeys.all() }, (old) => {
        if (!old?.posts) return old;
        const updated = old.posts.map((b) =>
          ids.includes(b._id) ? { ...b, status } : b
        );
        return { ...old, posts: updated, stats: recalcStats(updated) };
      });
      return { snapshot };
    },
    onSuccess: (_res, { ids, status }) =>
      toast.success(`${ids.length} post(s) marked as ${status}`),
    onError: (err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Bulk status update failed');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: blogKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Toggle featured
// ═══════════════════════════════════════════════════════════════════════════════
export function useToggleBlogFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => blogService.adminToggleFeatured(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: blogKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: blogKeys.all() });
      patchInCache(qc, id, (b) => ({ ...b, isFeatured: !b.isFeatured }));
      return { snapshot };
    },
    onSuccess: (_res, id) => {
      const updated = _res?.data?.data;
      if (updated) patchInCache(qc, id, () => updated);
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error('Failed to toggle featured');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: blogKeys.all() }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. Change status (single post)
// ═══════════════════════════════════════════════════════════════════════════════
export function useChangeBlogStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => blogService.adminChangeStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: blogKeys.all() });
      const snapshot = qc.getQueriesData({ queryKey: blogKeys.all() });
      patchInCache(qc, id, (b) => ({ ...b, status }));
      return { snapshot };
    },
    onSuccess: () => toast.success('Status updated'),
    onError: (err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([key, val]) => qc.setQueryData(key, val));
      toast.error(err?.response?.data?.message || 'Failed to update status');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: blogKeys.all() }),
  });
}
