// 📁 PATH: src/services/couponService.js
// Production-ready — backend route গুলোর সাথে 1:1 mapped
// Backend: src/routes/couponRoutes.js

import api from '@/lib/api';

export const couponService = {
  // ───── Public / customer ────────────────────────────────────────────────
  validate: (payload) => api.post('/coupons/validate', payload), // { code, orderAmount, items? }
  apply:    (payload) => api.post('/coupons/apply', payload),

  // ───── Admin: stats & utilities (MUST come before /:id routes) ──────────
  adminGetStats:    ()        => api.get('/admin/coupons/stats'),
  adminGenCode:     ()        => api.get('/admin/coupons/generate-code'),

  // ───── Admin: CRUD ──────────────────────────────────────────────────────
  adminGetAll:      (params)  => api.get('/admin/coupons', { params }),
  adminGetById:     (id)      => api.get(`/admin/coupons/${id}`),
  adminCreate:      (data)    => api.post('/admin/coupons', data),
  adminUpdate:      (id, data)=> api.put(`/admin/coupons/${id}`, data),
  adminDelete:      (id)      => api.delete(`/admin/coupons/${id}`),

  // ───── Admin: toggle + bulk + usage ─────────────────────────────────────
  adminToggle:      (id)      => api.patch(`/admin/coupons/${id}/toggle-status`),
  adminBulkDelete:  (ids)     => api.delete('/admin/coupons/bulk', { data: { ids } }),
  adminGetUsage:    (id, params) => api.get(`/admin/coupons/${id}/usage`, { params }),
};

export default couponService;
