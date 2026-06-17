// 📁 PATH: src/services/reviewService.js
import api from '@/lib/api';

export const reviewService = {
  // ── Admin ────────────────────────────────────────────────────────────────
  // All review list Do (filter, sort, pagination, search With)
  adminGetAll: (params) => api.get('/admin/reviews', { params }),

  // a review-Of detail
  adminGetById: (id) => api.get(`/admin/reviews/${id}`),

  // Review approve Do
  adminApprove: (id) => api.patch(`/admin/reviews/${id}/approve`),

  // Review reject / unapprove Do
  adminReject: (id) => api.patch(`/admin/reviews/${id}/reject`),

  // Review delete Do
  adminDelete: (id) => api.delete(`/admin/reviews/${id}`),

  // Bulk action — approve / reject / delete
  adminBulkAction: (ids, action) =>
    api.post('/admin/reviews/bulk', { ids, action }),

  // Review-In admin reply Give
  adminReply: (id, reply) =>
    api.post(`/admin/reviews/${id}/reply`, { reply }),

  // Stats — dashboard cards-for this
  adminGetStats: () => api.get('/admin/reviews/stats'),

  // ── Client ──────────────────────────────────────────────────────────────
  // a product-Of approved review list
  getByProduct: (productId, params) =>
    api.get(`/products/${productId}/reviews`, { params }),

  // Review submit Do
  create: (productId, data) =>
    api.post(`/products/${productId}/reviews`, data),

  // own review update Do
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),

  // own review delete Do
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};