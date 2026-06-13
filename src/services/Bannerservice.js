// 📁 PATH: src/services/bannerService.js
import api from '@/lib/api';

export const bannerService = {
  // ── Admin ─────────────────────────────────────────────────────────────────
  adminGetAll:      (params) => api.get('/admin/banners',            { params }),
  adminGetStats:    ()       => api.get('/admin/banners/stats'),
  adminGetById:     (id)     => api.get(`/admin/banners/${id}`),
  adminCreate:      (data)   => api.post('/admin/banners',           data),
  adminUpdate:      (id, data) => api.put(`/admin/banners/${id}`,    data),
  adminDelete:      (id)     => api.delete(`/admin/banners/${id}`),
  adminToggleStatus:(id)     => api.patch(`/admin/banners/${id}/toggle-status`),

  // ── Public ────────────────────────────────────────────────────────────────
  getByPlacement:   (placement) => api.get(`/banners/${placement}`),
  trackClick:       (id)        => api.patch(`/banners/${id}/click`),
  trackImpression:  (id)        => api.patch(`/banners/${id}/impression`),
};