// 📁 PATH: src/services/flashSaleService.js
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল — src/services/ ফোল্ডারে রাখো

import api from '@/lib/api';

export const flashSaleService = {
  // ── Admin endpoints ────────────────────────────────────────────
  adminGetAll:      (params)       => api.get('/admin/flash-sales', { params }),
  adminGetById:     (id)           => api.get(`/admin/flash-sales/${id}`),
  adminCreate:      (data)         => api.post('/admin/flash-sales', data),
  adminUpdate:      (id, data)     => api.put(`/admin/flash-sales/${id}`, data),
  adminDelete:      (id)           => api.delete(`/admin/flash-sales/${id}`),
  adminToggle:      (id)           => api.patch(`/admin/flash-sales/${id}/toggle`),
  adminBulkDelete:  (ids)          => api.delete('/admin/flash-sales/bulk', { data: { ids } }),
  adminDuplicate:   (id)           => api.post(`/admin/flash-sales/${id}/duplicate`),

  // Products inside a flash sale
  adminAddProducts:    (id, items) => api.post(`/admin/flash-sales/${id}/products`, { items }),
  adminRemoveProduct:  (id, prodId)=> api.delete(`/admin/flash-sales/${id}/products/${prodId}`),
  adminUpdateProduct:  (id, prodId, data) => api.patch(`/admin/flash-sales/${id}/products/${prodId}`, data),

  // Stats & analytics
  adminGetStats:    (id)           => api.get(`/admin/flash-sales/${id}/stats`),
  adminGetRevenue:  (params)       => api.get('/admin/flash-sales/revenue', { params }),

  // Public (storefront)
  getActive:        ()             => api.get('/flash-sales/active'),
  getUpcoming:      ()             => api.get('/flash-sales/upcoming'),
};
