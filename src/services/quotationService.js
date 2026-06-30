// 📁 PATH: src/services/quotationService.js
import api from '@/lib/api';

export const quotationService = {
  /* ── Customer ─────────────────────────────────────────────────── */
  // Customer নতুন quotation request করবে
  createRequest(data) {
    return api.post('/quotations', data);
  },

  // Customer তার নিজের সব quotation দেখবে
  getMyQuotations(params) {
    return api.get('/quotations/my', { params });
  },

  // Customer একটি নির্দিষ্ট quotation দেখবে
  getById(id) {
    return api.get(`/quotations/${id}`);
  },

  // Customer approved quotation accept করবে
  acceptQuotation(id) {
    return api.patch(`/quotations/${id}/accept`);
  },

  // Customer quotation reject করতে পারবে
  rejectQuotation(id) {
    return api.patch(`/quotations/${id}/reject`);
  },

  /* ── Admin ────────────────────────────────────────────────────── */
  adminGetAll(params) {
    return api.get('/admin/quotations', { params });
  },

  adminGetById(id) {
    return api.get(`/admin/quotations/${id}`);
  },

  adminStats() {
    return api.get('/admin/quotations/stats');
  },

  // Admin quotation generate করে approve করবে
  adminApprove(id, data) {
    return api.patch(`/admin/quotations/${id}/approve`, data);
  },

  // Admin quotation reject করবে
  adminReject(id, note) {
    return api.patch(`/admin/quotations/${id}/reject`, { note });
  },

  // Admin quotation expire করবে
  adminExpire(id) {
    return api.patch(`/admin/quotations/${id}/expire`);
  },
};