import api from '@/lib/api';

/**
 * settingsService
 * ---------------
 * Mirrors the pattern used across the project (axios `api` instance with
 * JWT interceptor).  Every method maps 1-to-1 to a backend REST endpoint
 * so you only need to wire the routes on the server side.
 *
 * Base path: /api/admin/settings
 */

// ─── General / Store ───────────────────────────────────────────────────────

export const settingsService = {

  // ── Store info ──────────────────────────────────────────────────────────
  async getStore() {
    const { data } = await api.get('/admin/settings/store');
    return data;
  },
  async updateStore(payload) {
    const { data } = await api.put('/admin/settings/store', payload);
    return data;
  },

  // ── Localisation ────────────────────────────────────────────────────────
  async getLocalisation() {
    const { data } = await api.get('/admin/settings/localisation');
    return data;
  },
  async updateLocalisation(payload) {
    const { data } = await api.put('/admin/settings/localisation', payload);
    return data;
  },

  // ── Email / SMTP ─────────────────────────────────────────────────────────
  async getEmail() {
    const { data } = await api.get('/admin/settings/email');
    return data;
  },
  async updateEmail(payload) {
    const { data } = await api.put('/admin/settings/email', payload);
    return data;
  },
  async testEmail(toAddress) {
    const { data } = await api.post('/admin/settings/email/test', { to: toAddress });
    return data;
  },

  // ── Payment gateways ────────────────────────────────────────────────────
  async getPayment() {
    const { data } = await api.get('/admin/settings/payment');
    return data;
  },
  async updatePayment(payload) {
    const { data } = await api.put('/admin/settings/payment', payload);
    return data;
  },

  // ── Shipping ────────────────────────────────────────────────────────────
  async getShipping() {
    const { data } = await api.get('/admin/settings/shipping');
    return data;
  },
  async updateShipping(payload) {
    const { data } = await api.put('/admin/settings/shipping', payload);
    return data;
  },

  // ── Notifications ───────────────────────────────────────────────────────
  async getNotifications() {
    const { data } = await api.get('/admin/settings/notifications');
    return data;
  },
  async updateNotifications(payload) {
    const { data } = await api.put('/admin/settings/notifications', payload);
    return data;
  },

  // ── Security ────────────────────────────────────────────────────────────
  async getSecurity() {
    const { data } = await api.get('/admin/settings/security');
    return data;
  },
  async updateSecurity(payload) {
    const { data } = await api.put('/admin/settings/security', payload);
    return data;
  },

  // ── Media / uploads ─────────────────────────────────────────────────────
  async getMedia() {
    const { data } = await api.get('/admin/settings/media');
    return data;
  },
  async updateMedia(payload) {
    const { data } = await api.put('/admin/settings/media', payload);
    return data;
  },

  // ── API Keys (read-only display) ─────────────────────────────────────────
  async getApiKeys() {
    const { data } = await api.get('/admin/settings/api-keys');
    return data; // [{ id, name, prefix, createdAt, lastUsedAt }]
  },
  async createApiKey(name) {
    const { data } = await api.post('/admin/settings/api-keys', { name });
    return data; // returns the raw key once — store it!
  },
  async revokeApiKey(id) {
    const { data } = await api.delete(`/admin/settings/api-keys/${id}`);
    return data;
  },
};
