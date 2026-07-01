// 📁 PATH: src/services/bundleService.js
// ⚠️  This is a completely new file

import api from '@/lib/api';

export const bundleService = {
  // Admin
  adminGetAll:    (params)   => api.get('/admin/bundles', { params }),
  adminGetById:   (id)       => api.get(`/admin/bundles/${id}`),
  adminCreate:    (data)     => api.post('/admin/bundles', data),
  adminUpdate:    (id, data) => api.put(`/admin/bundles/${id}`, data),
  adminDelete:    (id)       => api.delete(`/admin/bundles/${id}`),
  adminToggle:    (id)       => api.patch(`/admin/bundles/${id}/toggle`),
  adminBulkDelete:(ids)      => api.delete('/admin/bundles/bulk', { data: { ids } }),

  // Product search for bundle builder
  searchProducts: (q)        => api.get('/admin/products/search', { params: { q, limit: 20 } }),

  // Public (storefront)
  getAll:    ()      => api.get('/bundles'),
  getBySlug: (slug)  => api.get(`/bundles/${slug}`),
};