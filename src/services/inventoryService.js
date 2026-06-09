
import api from '@/lib/api';

export const inventoryService = {
  // ── Inventory ────────────────────────────────────────────────────────────
  getAll:        (params) => api.get('/admin/inventory', { params }),
  getById:       (id)     => api.get(`/admin/inventory/${id}`),
  adjust:        (id, data) => api.patch(`/admin/inventory/${id}/adjust`, data),
  transfer:      (data)   => api.post('/admin/inventory/transfer', data),
  bulkAdjust:    (data)   => api.post('/admin/inventory/bulk-adjust', data),
  getHistory:    (id, params) => api.get(`/admin/inventory/${id}/history`, { params }),
  getAlerts:     ()       => api.get('/admin/inventory/alerts'),
  export:        (params) => api.get('/admin/inventory/export', { params, responseType: 'blob' }),

  // ── Warehouses ───────────────────────────────────────────────────────────
  getWarehouses: ()       => api.get('/admin/warehouses'),
  createWarehouse:(data)  => api.post('/admin/warehouses', data),
  updateWarehouse:(id, d) => api.patch(`/admin/warehouses/${id}`, d),
};
