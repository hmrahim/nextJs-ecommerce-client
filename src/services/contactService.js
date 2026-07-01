// 📁 PATH: src/services/contactService.js
import api from '@/lib/api';

export const contactService = {
  /* ── Customer ─────────────────────────────────────────────────── */
  // Customer contact form submit করবে
  send(data) {
    return api.post('/contact', data);
  },

  /* ── Admin ────────────────────────────────────────────────────── */
  // Admin সব contact message দেখবে (filter + pagination)
  adminGetAll(params) {
    return api.get('/admin/contact', { params });
  },

  // Admin quick stats দেখবে (new/read/replied count)
  adminStats() {
    return api.get('/admin/contact/stats');
  },

  // Admin একটি নির্দিষ্ট message দেখবে (auto marks as read)
  adminGetById(id) {
    return api.get(`/admin/contact/${id}`);
  },

  // Admin customer কে email reply পাঠাবে
  adminReply(id, message) {
    return api.post(`/admin/contact/${id}/reply`, { message });
  },

  // Admin message এর status আপডেট করবে
  adminUpdateStatus(id, status) {
    return api.patch(`/admin/contact/${id}/status`, { status });
  },

  // Admin message ডিলিট করবে
  adminDelete(id) {
    return api.delete(`/admin/contact/${id}`);
  },
};