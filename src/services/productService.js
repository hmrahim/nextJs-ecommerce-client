import api from '@/lib/api';

export const productService = {
  // ── Public ──────────────────────────────────────────────────────────
  getAll:        (params)           => api.get('/products',                    { params }),
  getBySlug:     (slug)             => api.get(`/products/${slug}`),
  getBySku:      (sku)              => api.get(`/products/sku/${sku}`),
  getByCategory: (slug, params)     => api.get(`/categories/${slug}/products`, { params }),
  search:        (query, params)    => api.get('/products/search',             { params: { q: query, ...params } }),
  getFeatured:   (params)           => api.get('/products/featured',           { params }),
  getRelated:    (slug, params)     => api.get(`/products/${slug}/related`,    { params }),

  // ── Admin ────────────────────────────────────────────────────────────
  adminGetAll:         (params)     => api.get('/admin/products',              { params }),
  adminGetById:        (id)         => api.get(`/admin/products/${id}`),
  adminCreate:         (data)       => api.post('/admin/products',             data),
  adminUpdate:         (id, data)   => api.put(`/admin/products/${id}`,        data),
  adminArchive:        (id)         => api.delete(`/admin/products/${id}`),
  adminDelete:         (id)         => api.delete(`/admin/products/${id}/hard`),
  adminBulkArchive:    (ids)        => Promise.all(ids.map((id) => api.delete(`/admin/products/${id}`))),
  adminBulkDelete:     (ids)        => Promise.all(ids.map((id) => api.delete(`/admin/products/${id}/hard`))),
  adminToggleStatus: async (id, currentStatus) => {
    const next = currentStatus === 'active' ? 'draft' : 'active';
    return api.patch(`/admin/products/${id}/status`, { status: next });
  },
  adminSetStatus:      (id, status) => api.patch(`/admin/products/${id}/status`, { status }),
  adminUpdateStock:    (id, stock)  => api.patch(`/admin/products/${id}/stock`,  { stock }),
};