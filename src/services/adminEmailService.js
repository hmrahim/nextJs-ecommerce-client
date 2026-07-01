// 📁 PATH: src/services/adminEmailService.js
import api from '@/lib/api';

export const adminEmailService = {
  /* ── User picker ──────────────────────────────────────────────── */
  // Dashboard-এ recipient list এর জন্য সব user আনবে (search + role filter + pagination)
  listUsers(params) {
    return api.get('/admin/email/users', { params });
  },

  /* ── Send ─────────────────────────────────────────────────────── */
  // userIds: [string], emails: [string], subject: string, message: string
  send({ userIds = [], emails = [], subject, message }) {
    return api.post('/admin/email/send', { userIds, emails, subject, message });
  },

  /* ── History ──────────────────────────────────────────────────── */
  getHistory(params) {
    return api.get('/admin/email/history', { params });
  },

  getHistoryById(id) {
    return api.get(`/admin/email/history/${id}`);
  },
};