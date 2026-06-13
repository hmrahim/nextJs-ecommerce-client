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
  adminAddValue: (attrId, data) =>
    api.post(`/admin/attributes/${attrId}/values`, {
      label:     data.label,
      valueData: data.value,        // ← frontend "value" → backend "valueData"
      isActive:  data.isActive,
      sortOrder: data.sortOrder,
    }),
  adminUpdateValue: (attrId, valId, data) =>
    api.put(`/admin/attributes/${attrId}/values/${valId}`, {
      ...(data.label     !== undefined && { label:     data.label }),
      ...(data.value     !== undefined && { valueData: data.value }),  // ← same fix
      ...(data.isActive  !== undefined && { isActive:  data.isActive }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    }),
  adminDeleteValue:   (attrId, valId)  => api.delete(`/admin/attributes/${attrId}/values/${valId}`),
  adminReorderValues: (attrId, items)  => api.patch(`/admin/attributes/${attrId}/values/reorder`, { items }),

  // Stats
  adminGetStats:  ()             => api.get('/admin/attributes/stats'),

  // Public
  getAll:         ()             => api.get('/attributes'),
  getByCategory:  (categoryId)   => api.get(`/categories/${categoryId}/attributes`),
};