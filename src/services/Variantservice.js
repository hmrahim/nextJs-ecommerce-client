// 📁 PATH: src/services/variantService.js
import api from '@/lib/api';

export const variantService = {
  // ── Admin ──────────────────────────────────────────────────────────────────
  adminGetAll:    (productId)            => api.get(`/admin/products/${productId}/variants`),
  adminCreate:    (productId, data)      => api.post(`/admin/products/${productId}/variants`, data),
  adminBulkGenerate: (productId, data)   => api.post(`/admin/products/${productId}/variants/bulk`, data),
  adminUpdate:    (productId, varId, data) => api.put(`/admin/products/${productId}/variants/${varId}`, data),
  adminDelete:    (productId, varId)     => api.delete(`/admin/products/${productId}/variants/${varId}`),
  adminDeleteAll: (productId)            => api.delete(`/admin/products/${productId}/variants`),
  adminToggle:    (productId, varId)     => api.patch(`/admin/products/${productId}/variants/${varId}/toggle`),

  // ── Public ─────────────────────────────────────────────────────────────────
  getPublic:      (productId)            => api.get(`/products/${productId}/variants`),
};