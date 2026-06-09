// 📁 PATH: src/services/profileService.js
import api from '@/lib/api';

export const profileService = {

  // Get current user profile
  async getProfile() {
    const res = await api.get('/users/me');
    return res.data; // { user }
  },

  // Update basic info (firstName, lastName, phone)
  async updateProfile(data) {
    const res = await api.patch('/users/me', data);
    return res.data;
  },

  // Change password
  async changePassword({ currentPassword, newPassword }) {
    const res = await api.patch('/users/me/password', { currentPassword, newPassword });
    return res.data;
  },

  // Addresses
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

  // Saved cards
  async addCard(cardData) {
    const res = await api.post('/users/me/cards', cardData);
    return res.data;
  },
  async deleteCard(cardType) {
    const res = await api.delete(`/users/me/cards/${cardType}`);
    return res.data;
  },

  // Activity log
  async getActivity({ page = 1, limit = 20 } = {}) {
    const res = await api.get(`/users/me/activity?page=${page}&limit=${limit}`);
    return res.data;
  },

  // Request account deletion
  async requestDeletion(reason) {
    const res = await api.post('/users/me/delete-request', { reason });
    return res.data;
  },

  // Notification preferences
  async updateNotificationPrefs(prefs) {
    const res = await api.patch('/users/me/notifications', prefs);
    return res.data;
  },
};
