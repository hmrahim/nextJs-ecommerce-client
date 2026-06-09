// 📁 PATH: src/services/affiliateService.js
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

import api from '@/lib/api';

export const affiliateService = {
  // Affiliates (partners)
  adminGetAll:        (params)   => api.get('/admin/affiliates', { params }),
  adminGetById:       (id)       => api.get(`/admin/affiliates/${id}`),
  adminCreate:        (data)     => api.post('/admin/affiliates', data),
  adminUpdate:        (id, data) => api.put(`/admin/affiliates/${id}`, data),
  adminDelete:        (id)       => api.delete(`/admin/affiliates/${id}`),
  adminApprove:       (id)       => api.post(`/admin/affiliates/${id}/approve`),
  adminReject:        (id, r)    => api.post(`/admin/affiliates/${id}/reject`, { reason: r }),
  adminSuspend:       (id)       => api.post(`/admin/affiliates/${id}/suspend`),
  adminBulkDelete:    (ids)      => api.delete('/admin/affiliates/bulk', { data: { ids } }),
  // Commissions & payouts
  adminGetCommissions:(id, p)    => api.get(`/admin/affiliates/${id}/commissions`, { params: p }),
  adminPayout:        (id, data) => api.post(`/admin/affiliates/${id}/payout`, data),
  adminGetPayouts:    (params)   => api.get('/admin/affiliates/payouts', { params }),
  adminApprovePayout: (pid)      => api.post(`/admin/affiliates/payouts/${pid}/approve`),
  // Global settings
  adminGetSettings:   ()         => api.get('/admin/affiliates/settings'),
  adminSaveSettings:  (data)     => api.put('/admin/affiliates/settings', data),
};
