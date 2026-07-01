import api from '@/lib/api';

/**
 * Visitor Analytics Service
 * Backend endpoint pattern: /admin/visitors/*
 * Replace base path if your API uses a different prefix.
 *
 * ⚠️ FIX: the tracking pings used to hit /track/visit and /track/event.
 * Ad blockers (uBlock Origin, Brave Shields, AdBlock+EasyPrivacy) block
 * ANY url containing "/track", "/analytics", "/pixel", "/collect", or
 * "/beacon" — even first-party same-domain requests. That's why visits
 * were never saving: the request never left the browser, and it failed
 * silently because trackVisit()/trackEvent() are called with .catch(() => {})
 * in VisitorTracker.jsx. Renamed to neutral paths that match the backend.
 */
export const visitorService = {

  // Silent tracking pings — called by <VisitorTracker /> on every route change
  trackVisit: (payload) => api.post('/session/ping', payload),
  trackEvent: (payload) => api.post('/session/activity', payload),

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