// 📁 PATH: src/services/attributeService.js
import api from '@/lib/api';

export const attributeService = {
  // ── Admin ────────────────────────────────────────────────────────────────
  adminGetAll:    (params)       => api.get('/admin/attributes', { params }),
  adminGetById:   (id)           => api.get(`/admin/attributes/${id}`),
  adminCreate:    (data)         => api.post('/admin/attributes', data),
  adminUpdate:    (id, data)     => api.put(`/admin/attributes/${id}`, data),
  adminDelete:    (id)           => api.delete(`/admin/attributes/${id}`),
  adminToggle:    (id)           => api.patch(`/admin/attributes/${id}/toggle`),
  adminReorder:   (items)        => api.patch('/admin/attributes/reorder', { items }),

  // Value-level operations
  adminAddValue:    (attrId, data)        => api.post(`/admin/attributes/${attrId}/values`, data),
  adminUpdateValue: (attrId, valId, data) => api.put(`/admin/attributes/${attrId}/values/${valId}`, data),
  adminDeleteValue: (attrId, valId)       => api.delete(`/admin/attributes/${attrId}/values/${valId}`),
  adminReorderValues: (attrId, items)     => api.patch(`/admin/attributes/${attrId}/values/reorder`, { items }),

  // Stats
  adminGetStats:  ()             => api.get('/admin/attributes/stats'),

  // Public (used in product forms/filters)
  getAll:         ()             => api.get('/attributes'),
  getByCategory:  (categoryId)   => api.get(`/categories/${categoryId}/attributes`),
};
