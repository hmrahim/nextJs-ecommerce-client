// 📁 PATH: src/services/brandService.js
import api from '@/lib/api';

export const brandService = {
    // ── Admin ─────────────────────────────────────────────────────────────────
    adminGetAll: (params) => api.get('/admin/brands', { params }),
    adminGetById: (id) => api.get(`/admin/brands/${id}`),
    adminCreate: (data) => api.post('/admin/brands', data),
    adminUpdate: (id, data) => api.put(`/admin/brands/${id}`, data),
    adminDelete: (id) => api.delete(`/admin/brands/${id}`),
    adminToggle: (id) => api.patch(`/admin/brands/${id}/toggle`),   // isActive toggle
    adminFeature: (id) => api.patch(`/admin/brands/${id}/feature`),  // isFeatured toggle
    adminReorder: (items) => api.patch('/admin/brands/reorder', { items }),
    adminGetStats: () => api.get('/admin/brands/stats'),

    // ── Public ────────────────────────────────────────────────────────────────
    getAll: () => api.get('/brands'),
    getBySlug: (slug) => api.get(`/brands/${slug}`),
};