// 📁 PATH: src/services/couponService.js
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

import api from '@/lib/api';

export const couponService = {
  // Public — cart apply
  validate: (code, orderAmount) => api.post('/coupons/validate', { code, orderAmount }),

  // Admin
  adminGetAll:    (params)     => api.get('/admin/coupons', { params }),
  adminGetById:   (id)         => api.get(`/admin/coupons/${id}`),
  adminCreate:    (data)       => api.post('/admin/coupons', data),
  adminUpdate:    (id, data)   => api.put(`/admin/coupons/${id}`, data),
  adminDelete:    (id)         => api.delete(`/admin/coupons/${id}`),
  adminToggle:    (id)         => api.patch(`/admin/coupons/${id}/toggle`),
  adminBulkDelete:(ids)        => api.delete('/admin/coupons/bulk', { data: { ids } }),
  adminGetUsage:  (id, params) => api.get(`/admin/coupons/${id}/usage`, { params }),
  adminGenCode:   ()           => api.get('/admin/coupons/generate-code'),
};
