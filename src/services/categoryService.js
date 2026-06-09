
import api from '@/lib/api';

export const categoryService = {
  // Public
  getAll:       (params) => api.get('/categories', { params }),
  getTree:      ()       => api.get('/categories/tree'),
  getBySlug:    (slug)   => api.get(`/categories/${slug}`),

  // Admin
  adminGetAll:  (params) => api.get('/admin/categories', { params }),
  adminGetTree: ()       => api.get('/admin/categories/tree'),
  adminCreate:  (data)   => api.post('/admin/categories', data),
  adminUpdate:  (id, data) => api.put(`/admin/categories/${id}`, data),
  adminDelete:  (id)     => api.delete(`/admin/categories/${id}`),
  adminReorder: (items)  => api.patch('/admin/categories/reorder', { items }),
  adminToggle:  (id)     => api.patch(`/admin/categories/${id}/toggle`),
};
