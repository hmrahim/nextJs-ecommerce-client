// 📁 PATH: src/services/promotionService.js
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

import api from '@/lib/api';

export const promotionService = {
  adminGetAll:     (params)   => api.get('/admin/promotions', { params }),
  adminGetById:    (id)       => api.get(`/admin/promotions/${id}`),
  adminCreate:     (data)     => api.post('/admin/promotions', data),
  adminUpdate:     (id, data) => api.put(`/admin/promotions/${id}`, data),
  adminDelete:     (id)       => api.delete(`/admin/promotions/${id}`),
  adminToggle:     (id)       => api.patch(`/admin/promotions/${id}/toggle`),
  adminDuplicate:  (id)       => api.post(`/admin/promotions/${id}/duplicate`),
  adminBulkDelete: (ids)      => api.delete('/admin/promotions/bulk', { data: { ids } }),
  adminReorder:    (ids)      => api.patch('/admin/promotions/reorder', { ids }),
  adminPerformance:(id)       => api.get(`/admin/promotions/${id}/performance`),
};
