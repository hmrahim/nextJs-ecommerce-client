
import api from '@/lib/api';

export const orderService = {
  // ── Client ──────────────────────────────────────────────────────────────
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),

  // ── Admin ────────────────────────────────────────────────────────────────
  adminGetAll: (params) => api.get('/admin/orders', { params }),
  adminGetById: (id) => api.get(`/admin/orders/${id}`),
  adminUpdateStatus: (id, status, note) =>
    api.patch(`/admin/orders/${id}/status`, { status, note }),
  adminAssignShipment: (id, data) =>
    api.patch(`/admin/orders/${id}/shipment`, data),
  adminExport: (params) =>
    api.get('/admin/orders/export', { params, responseType: 'blob' }),
};
