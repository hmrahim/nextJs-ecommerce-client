import api from '@/lib/api';

export const analyticsService = {
  // ── Overview KPIs ────────────────────────────────────────────────────────
  getOverview: (params) => api.get('/admin/analytics/overview', { params }),

  // ── Revenue ──────────────────────────────────────────────────────────────
  getRevenue: (params) => api.get('/admin/analytics/revenue', { params }),
  getRevenueByChannel: (params) => api.get('/admin/analytics/revenue/channels', { params }),

  // ── Orders ───────────────────────────────────────────────────────────────
  getOrdersStats: (params) => api.get('/admin/analytics/orders', { params }),
  getOrdersByStatus: (params) => api.get('/admin/analytics/orders/status', { params }),
  getAOV: (params) => api.get('/admin/analytics/orders/aov', { params }),

  // ── Products ─────────────────────────────────────────────────────────────
  getTopProducts: (params) => api.get('/admin/analytics/products/top', { params }),
  getTopCategories: (params) => api.get('/admin/analytics/products/categories', { params }),
  getLowStock: (params) => api.get('/admin/analytics/products/low-stock', { params }),

  // ── Customers ────────────────────────────────────────────────────────────
  getCustomerStats: (params) => api.get('/admin/analytics/customers', { params }),
  getCustomerGrowth: (params) => api.get('/admin/analytics/customers/growth', { params }),
  getRetentionCohort: (params) => api.get('/admin/analytics/customers/retention', { params }),
  getGeoDistribution: (params) => api.get('/admin/analytics/customers/geo', { params }),

  // ── Funnels ──────────────────────────────────────────────────────────────
  getConversionFunnel: (params) => api.get('/admin/analytics/funnel', { params }),
  getCartAbandonment: (params) => api.get('/admin/analytics/funnel/abandonment', { params }),

  // ── Coupons & Promotions ─────────────────────────────────────────────────
  getCouponStats: (params) => api.get('/admin/analytics/coupons', { params }),

  // ── Export ───────────────────────────────────────────────────────────────
  exportReport: (params) => api.get('/admin/analytics/export', { params, responseType: 'blob' }),
};
