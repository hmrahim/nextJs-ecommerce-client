import api from '@/lib/api';

export const orderService = {
  /* ── Client ──────────────────────────────────────────────────── */
  create:       (data)       => api.post('/orders', data),
  getMyOrders:  (params)     => api.get('/orders/my', { params }),
  getById:      (id)         => api.get(`/orders/${id}`),
  cancelOrder:  (id)         => api.patch(`/orders/${id}/cancel`),

  /* ── Admin ───────────────────────────────────────────────────── */
  adminGetAll:        (params)            => api.get('/admin/orders', { params }),
  adminGetById:       (id)                => api.get(`/admin/orders/${id}`),
  adminStats:         ()                  => api.get('/admin/orders/stats'),
  adminListRiders:    (params)            => api.get('/admin/orders/riders', { params }),
  adminConfirmOrder:  (id, riderId, note) => api.patch(`/admin/orders/${id}/confirm`, { ...(riderId && { riderId }), note }),
  adminAssignRider:   (id, riderId, note) => api.patch(`/admin/orders/${id}/assign-rider`, { riderId, note }),
  adminUpdateStatus:  (id, status, note)  => api.patch(`/admin/orders/${id}/status`, { status, note }),
  adminCancelOrder:   (id, note)          => api.patch(`/admin/orders/${id}/cancel`, { note }),
  adminExport:        (params)            => api.get('/admin/orders/export', { params, responseType: 'blob' }),

  /* ── Rider ───────────────────────────────────────────────────── */
  riderListOrders:        (params) => api.get('/rider/orders', { params }),
  riderGetOrder:          (id)     => api.get(`/rider/orders/${id}`),
  riderMarkPickedUp:      (id)     => api.patch(`/rider/orders/${id}/pickup`),
  riderCompleteDelivery:  (id, payload) => api.patch(`/rider/orders/${id}/deliver`, payload),
};