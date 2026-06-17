// 📁 PATH: src/services/abandonedCartService.js
// ⚠️  This is a completely new file

import api from '@/lib/api';

export const abandonedCartService = {
  adminGetAll:         (params)   => api.get('/admin/abandoned-carts', { params }),
  adminGetById:        (id)       => api.get(`/admin/abandoned-carts/${id}`),
  adminDelete:         (id)       => api.delete(`/admin/abandoned-carts/${id}`),
  adminBulkDelete:     (ids)      => api.delete('/admin/abandoned-carts/bulk', { data: { ids } }),
  adminSendRecovery:   (id, data) => api.post(`/admin/abandoned-carts/${id}/send-recovery`, data),
  adminBulkRecovery:   (ids, data)=> api.post('/admin/abandoned-carts/bulk-recovery', { ids, ...data }),
  adminMarkRecovered:  (id)       => api.patch(`/admin/abandoned-carts/${id}/mark-recovered`),
  adminGenCoupon:      (id, data) => api.post(`/admin/abandoned-carts/${id}/coupon`, data),
  adminStats:          (params)   => api.get('/admin/abandoned-carts/stats', { params }),
  // Recovery automation
  adminGetFlows:       ()         => api.get('/admin/abandoned-carts/flows'),
  adminSaveFlows:      (data)     => api.put('/admin/abandoned-carts/flows', data),
};
