// 📁 PATH: src/services/profileService.js
import api from '@/lib/api';
import { uploadService, UPLOAD_FOLDERS } from '@/services/uploadService';

export const profileService = {

  // ── Profile ───────────────────────────────────────────────

  async getProfile() {
    const res = await api.get('/users/me');
    return res.data; // { user }
  },

  async updateProfile(data) {
    const res = await api.patch('/users/me', data);
    return res.data; // { user }
  },

  // ── Avatar Upload ─────────────────────────────────────────
  // Step 1: file → Cloudinary → secure_url পাই
  // Step 2: secure_url → PATCH /users/me/avatar → MongoDB-তে save

  async uploadAvatar(file, onProgress) {
    // ১. Cloudinary-তে direct upload
    const uploaded = await uploadService.uploadImage(file, {
      folder:     UPLOAD_FOLDERS.USER_AVATARS, // 'moom24/avatars'
      onProgress,
    });

    // ২. URL backend-এ পাঠাও → DB-তে save
    const res = await api.patch('/users/me/avatar', { avatarUrl: uploaded.url });
    return res.data; // { message, user: { avatar, ... } }
  },

  // ── Password ──────────────────────────────────────────────

  async changePassword({ currentPassword, newPassword }) {
    const res = await api.patch('/users/me/password', { currentPassword, newPassword });
    return res.data;
  },

  // ── Addresses ─────────────────────────────────────────────

  async addAddress(address) {
    const res = await api.post('/users/me/addresses', address);
    return res.data;
  },
  async updateAddress(addressId, address) {
    const res = await api.patch(`/users/me/addresses/${addressId}`, address);
    return res.data;
  },
  async deleteAddress(addressId) {
    const res = await api.delete(`/users/me/addresses/${addressId}`);
    return res.data;
  },
  async setDefaultAddress(addressId) {
    const res = await api.patch(`/users/me/addresses/${addressId}/default`);
    return res.data;
  },

  // ── Cards ─────────────────────────────────────────────────

  async addCard(cardData) {
    const res = await api.post('/users/me/cards', cardData);
    return res.data;
  },
  async deleteCard(cardType) {
    const res = await api.delete(`/users/me/cards/${cardType}`);
    return res.data;
  },

  // ── Misc ──────────────────────────────────────────────────

  async getActivity({ page = 1, limit = 20 } = {}) {
    const res = await api.get(`/users/me/activity?page=${page}&limit=${limit}`);
    return res.data;
  },
  async requestDeletion(reason) {
    const res = await api.post('/users/me/delete-request', { reason });
    return res.data;
  },
  async updateNotificationPrefs(prefs) {
    const res = await api.patch('/users/me/notifications', prefs);
    return res.data;
  },
};
