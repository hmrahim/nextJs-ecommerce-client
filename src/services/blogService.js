// 📁 PATH: src/services/blogService.js
import api from '@/lib/api';

export const blogService = {
  // ── Admin ─────────────────────────────────────────────────────────────────
  adminGetAll:     (params)     => api.get('/admin/blogs',              { params }),
  adminGetStats:   ()           => api.get('/admin/blogs/stats'),
  adminGetById:    (id)         => api.get(`/admin/blogs/${id}`),
  adminCreate:     (data)       => api.post('/admin/blogs',             data),
  adminUpdate:     (id, data)   => api.put(`/admin/blogs/${id}`,        data),
  adminDelete:     (id)         => api.delete(`/admin/blogs/${id}`),
  adminBulkDelete: (ids)        => api.delete('/admin/blogs/bulk',      { data: { ids } }),
  adminBulkStatus: (ids, status)=> api.patch('/admin/blogs/bulk-status',{ ids, status }),
  adminToggleFeatured: (id)     => api.patch(`/admin/blogs/${id}/toggle-featured`),
  adminChangeStatus:   (id, status) => api.patch(`/admin/blogs/${id}/status`, { status }),

  // ── Public ────────────────────────────────────────────────────────────────
  getAll:     (params) => api.get('/blogs',              { params }),
  getBySlug:  (slug)   => api.get(`/blogs/${slug}`),
  getFeatured: ()      => api.get('/blogs/featured'),
  getByCategory: (cat) => api.get(`/blogs/category/${cat}`),
  trackView:  (id)     => api.patch(`/blogs/${id}/view`),
  addComment: (id, data) => api.post(`/blogs/${id}/comments`, data),
  likePost:   (id)     => api.patch(`/blogs/${id}/like`),
};
