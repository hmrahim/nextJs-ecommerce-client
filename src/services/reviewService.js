import api from '@/lib/api';

export const reviewService = {
  // ── Admin ────────────────────────────────────────────────────────────────
  // সব review list করো (filter, sort, pagination সহ)
  adminGetAll: (params) => api.get('/admin/reviews', { params }),

  // একটি review-এর detail
  adminGetById: (id) => api.get(`/admin/reviews/${id}`),

  // Review approve করো
  adminApprove: (id) => api.patch(`/admin/reviews/${id}/approve`),

  // Review reject / unapprove করো
  adminReject: (id) => api.patch(`/admin/reviews/${id}/reject`),

  // Review delete করো
  adminDelete: (id) => api.delete(`/admin/reviews/${id}`),

  // Bulk action — approve / reject / delete
  adminBulkAction: (ids, action) =>
    api.post('/admin/reviews/bulk', { ids, action }),

  // Review-এ admin reply দাও
  adminReply: (id, reply) =>
    api.post(`/admin/reviews/${id}/reply`, { reply }),

  // Stats — dashboard cards-এর জন্য
  adminGetStats: () => api.get('/admin/reviews/stats'),

  // ── Client ──────────────────────────────────────────────────────────────
  // একটা product-এর approved review list
  getByProduct: (productId, params) =>
    api.get(`/products/${productId}/reviews`, { params }),

  // Review submit করো
  create: (productId, data) =>
    api.post(`/products/${productId}/reviews`, data),

  // নিজের review update করো
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),

  // নিজের review delete করো
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};
