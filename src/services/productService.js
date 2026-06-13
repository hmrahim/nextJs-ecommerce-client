import api from '@/lib/api';

export const productService = {
  // ── Public ──────────────────────────────────────────────────────────────────
  getAll:        (params)               => api.get('/products',                    { params }),
  getBySlug:     (slug)                 => api.get(`/products/${slug}`),
  getBySku:      (sku)                  => api.get(`/products/sku/${sku}`),
  getByCategory: (slug, params)         => api.get(`/categories/${slug}/products`, { params }),
  search:        (query, params)        => api.get('/products/search',             { params: { q: query, ...params } }),
  getFeatured:   (params)               => api.get('/products/featured',           { params }),
  getRelated:    (productId, params)    => api.get(`/products/${productId}/related`, { params }),

  // ── Admin ────────────────────────────────────────────────────────────────────
  adminGetAll:   (params)               => api.get('/admin/products',              { params }),
  adminGetById:  (id)                   => api.get(`/admin/products/${id}`),
  adminCreate:   (data)                 => api.post('/admin/products',             data),
  adminUpdate:   (id, data)             => api.put(`/admin/products/${id}`,        data),

  // Soft-delete → isActive: false, status: 'archived'
  adminArchive:        (id)             => api.delete(`/admin/products/${id}`),

  // Hard-delete → DB থেকে permanently সরায়
  adminDelete:         (id)             => api.delete(`/admin/products/${id}/hard`),

  // Bulk archive (parallel)
  adminBulkArchive:    (ids)            => Promise.all(ids.map((id) => api.delete(`/admin/products/${id}`))),

  // Bulk hard-delete (parallel)
  adminBulkDelete:     (ids)            => Promise.all(ids.map((id) => api.delete(`/admin/products/${id}/hard`))),

  // Toggle status: active ↔ draft
  adminToggleStatus: async (id, currentStatus) => {
    const next = currentStatus === 'active' ? 'draft' : 'active';
    return api.patch(`/admin/products/${id}/status`, { status: next });
  },

  // Explicit status set
  adminSetStatus:      (id, status)     => api.patch(`/admin/products/${id}/status`, { status }),
};
