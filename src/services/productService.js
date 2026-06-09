import api from '@/lib/api';

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getByCategory: (slug, params) => api.get(`/categories/${slug}/products`, { params }),
  search: (query, params) => api.get('/products/search', { params: { q: query, ...params } }),
  getFeatured: () => api.get('/products/featured'),
  getRelated: (productId) => api.get(`/products/${productId}/related`),

  // Admin
  adminGetAll: (params) => api.get('/admin/products', { params }),
  adminCreate: (data) => api.post('/admin/products', data),
  adminUpdate: (id, data) => api.put(`/admin/products/${id}`, data),
  adminDelete: (id) => api.delete(`/admin/products/${id}`),
  adminToggleStatus: (id) => api.patch(`/admin/products/${id}/toggle-status`),
};
