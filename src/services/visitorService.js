import api from '@/lib/api';

/**
 * Visitor Analytics Service
 * Backend endpoint pattern: /admin/visitors/*
 * Replace base path if your API uses a different prefix.
 */
export const visitorService = {

  // All visitors — paginated + filterable
  // params: { page, limit, search, country, device, source, dateFrom, dateTo }
  getAll: (params) => api.get('/admin/visitors', { params }),

  // Single visitor full detail
  getById: (id) => api.get(`/admin/visitors/${id}`),

  // Summary stats — total, unique, bounce rate, avg session
  getStats: (params) => api.get('/admin/visitors/stats', { params }),

  // Top pages visited
  getTopPages: (params) => api.get('/admin/visitors/top-pages', { params }),

  // Visitors grouped by country
  getByCountry: (params) => api.get('/admin/visitors/by-country', { params }),

  // Visitors grouped by device type
  getByDevice: (params) => api.get('/admin/visitors/by-device', { params }),

  // Visitors grouped by referrer/source
  getBySource: (params) => api.get('/admin/visitors/by-source', { params }),

  // Real-time active visitors count
  getLiveCount: () => api.get('/admin/visitors/live'),

  // Daily visitor chart data
  getChartData: (params) => api.get('/admin/visitors/chart', { params }),

  // Delete a visitor record
  deleteOne: (id) => api.delete(`/admin/visitors/${id}`),

  // Bulk delete
  deleteBulk: (ids) => api.post('/admin/visitors/bulk-delete', { ids }),

  // Export CSV
  exportCsv: (params) => api.get('/admin/visitors/export', { params, responseType: 'blob' }),
};