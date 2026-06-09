// 📁 PATH: src/services/returnService.js
// ⚠️  NEW FILE

import api from '@/lib/api';

export const returnService = {
  // ── Admin ─────────────────────────────────────────────────────────────────
  adminGetAll:         (params)           => api.get('/admin/returns', { params }),
  adminGetById:        (id)               => api.get(`/admin/returns/${id}`),
  adminUpdateStatus:   (id, status, note) => api.patch(`/admin/returns/${id}/status`, { status, note }),
  adminApprove:        (id, data)         => api.patch(`/admin/returns/${id}/approve`, data),
  adminReject:         (id, reason)       => api.patch(`/admin/returns/${id}/reject`, { reason }),
  adminProcessRefund:  (id, data)         => api.post(`/admin/returns/${id}/refund`, data),
  adminMarkReceived:   (id)               => api.patch(`/admin/returns/${id}/received`),
  adminAddNote:        (id, text)         => api.post(`/admin/returns/${id}/notes`, { text }),
  adminDeleteNote:     (id, noteId)       => api.delete(`/admin/returns/${id}/notes/${noteId}`),
  adminBulkUpdate:     (ids, status)      => api.post('/admin/returns/bulk-update', { ids, status }),
  adminGetStats:       ()                 => api.get('/admin/returns/stats'),
  adminExport:         (params)           => api.get('/admin/returns/export', { params, responseType: 'blob' }),
};
