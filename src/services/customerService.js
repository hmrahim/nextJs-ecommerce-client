
import api from '@/lib/api';

export const customerService = {
  // ── Listing & Search ──────────────────────────────────────────────────────
  adminGetAll:       (params)         => api.get('/admin/customers', { params }),
  adminGetById:      (id)             => api.get(`/admin/customers/${id}`),

  // ── CRUD ──────────────────────────────────────────────────────────────────
  adminCreate:       (data)           => api.post('/admin/customers', data),
  adminUpdate:       (id, data)       => api.put(`/admin/customers/${id}`, data),
  adminDelete:       (id)             => api.delete(`/admin/customers/${id}`),
  adminBulkDelete:   (ids)            => api.post('/admin/customers/bulk-delete', { ids }),

  // ── Status toggles ────────────────────────────────────────────────────────
  adminToggleBan:    (id, reason)     => api.patch(`/admin/customers/${id}/toggle-ban`, { reason }),
  adminToggleVerify: (id)             => api.patch(`/admin/customers/${id}/toggle-verify`),
  adminToggleActive: (id)             => api.patch(`/admin/customers/${id}/toggle-active`),
  adminChangeRole:   (id, role)       => api.patch(`/admin/customers/${id}/role`, { role }),

  // ── Sub-resources ─────────────────────────────────────────────────────────
  adminGetOrders:    (id, params)     => api.get(`/admin/customers/${id}/orders`, { params }),
  adminGetWishlist:  (id)             => api.get(`/admin/customers/${id}/wishlist`),
  adminGetReviews:   (id)             => api.get(`/admin/customers/${id}/reviews`),
  adminGetActivity:  (id, params)     => api.get(`/admin/customers/${id}/activity`, { params }),
  adminGetAddresses: (id)             => api.get(`/admin/customers/${id}/addresses`),

  // ── Notes ─────────────────────────────────────────────────────────────────
  adminAddNote:      (id, text)       => api.post(`/admin/customers/${id}/notes`, { text }),
  adminDeleteNote:   (id, noteId)     => api.delete(`/admin/customers/${id}/notes/${noteId}`),
  adminEditNote:     (id, noteId, text) => api.put(`/admin/customers/${id}/notes/${noteId}`, { text }),

  // ── Communication ─────────────────────────────────────────────────────────
  adminSendEmail:    (id, data)       => api.post(`/admin/customers/${id}/send-email`, data),
  adminBulkEmail:    (ids, data)      => api.post('/admin/customers/bulk-email', { ids, ...data }),

  // ── Tags & Segments ───────────────────────────────────────────────────────
  adminAddTag:       (id, tag)        => api.post(`/admin/customers/${id}/tags`, { tag }),
  adminRemoveTag:    (id, tag)        => api.delete(`/admin/customers/${id}/tags/${tag}`),

  // ── Analytics ─────────────────────────────────────────────────────────────
  adminGetStats:     ()               => api.get('/admin/customers/stats'),
  adminGetCohorts:   (params)         => api.get('/admin/customers/cohorts', { params }),
  adminGetRetention: (params)         => api.get('/admin/customers/retention', { params }),
  adminGetLTV:       (params)         => api.get('/admin/customers/ltv', { params }),

  // ── Export ────────────────────────────────────────────────────────────────
  adminExport:       (params)         => api.get('/admin/customers/export', { params, responseType: 'blob' }),
};
