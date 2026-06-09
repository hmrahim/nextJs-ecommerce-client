// 📁 PATH: src/services/giftCardService.js
// Gift Card API service — mirrors couponService shape

import api from '@/lib/api';

export const giftCardService = {
  // Public — customer side
  validate:   (code)               => api.post('/gift-cards/validate', { code }),
  redeem:     (code, amount)       => api.post('/gift-cards/redeem',   { code, amount }),
  checkBalance:(code)              => api.get(`/gift-cards/${code}/balance`),
  purchase:   (data)               => api.post('/gift-cards/purchase', data),

  // Admin
  adminGetAll:     (params)        => api.get('/admin/gift-cards', { params }),
  adminGetById:    (id)            => api.get(`/admin/gift-cards/${id}`),
  adminCreate:     (data)          => api.post('/admin/gift-cards', data),
  adminUpdate:     (id, data)      => api.put(`/admin/gift-cards/${id}`, data),
  adminDelete:     (id)            => api.delete(`/admin/gift-cards/${id}`),
  adminToggle:     (id)            => api.patch(`/admin/gift-cards/${id}/toggle`),
  adminBulkDelete: (ids)           => api.delete('/admin/gift-cards/bulk', { data: { ids } }),
  adminBulkIssue:  (data)          => api.post('/admin/gift-cards/bulk-issue', data),
  adminResend:     (id)            => api.post(`/admin/gift-cards/${id}/resend`),
  adminGetHistory: (id, params)    => api.get(`/admin/gift-cards/${id}/history`, { params }),
  adminGenCode:    ()              => api.get('/admin/gift-cards/generate-code'),
  adminExport:     (params)        => api.get('/admin/gift-cards/export', { params, responseType: 'blob' }),
};
