// 📁 PATH: src/services/campaignService.js
// ⚠️  This is a completely new file

import api from '@/lib/api';

export const campaignService = {
  adminGetAll:     (params)   => api.get('/admin/campaigns', { params }),
  adminGetById:    (id)       => api.get(`/admin/campaigns/${id}`),
  adminCreate:     (data)     => api.post('/admin/campaigns', data),
  adminUpdate:     (id, data) => api.put(`/admin/campaigns/${id}`, data),
  adminDelete:     (id)       => api.delete(`/admin/campaigns/${id}`),
  adminToggle:     (id)       => api.patch(`/admin/campaigns/${id}/toggle`),
  adminDuplicate:  (id)       => api.post(`/admin/campaigns/${id}/duplicate`),
  adminBulkDelete: (ids)      => api.delete('/admin/campaigns/bulk', { data: { ids } }),
  adminSendTest:   (id, to)   => api.post(`/admin/campaigns/${id}/test`, { to }),
  adminLaunch:     (id)       => api.post(`/admin/campaigns/${id}/launch`),
  adminPause:      (id)       => api.post(`/admin/campaigns/${id}/pause`),
  adminMetrics:    (id)       => api.get(`/admin/campaigns/${id}/metrics`),
  adminAudienceCount: (q)     => api.post('/admin/campaigns/audience-count', q),
};
