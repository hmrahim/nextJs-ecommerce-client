import api from '@/lib/api';

const notificationService = {
  async getAdminNotifications() {
    const { data } = await api.get('/admin/notifications');
    return data;
  },

  async markAllRead() {
    const { data } = await api.patch('/admin/notifications/mark-read');
    return data;
  },

  async markOneRead(id) {
    const { data } = await api.patch(`/admin/notifications/${id}/mark-read`);
    return data;
  },

  async clearAll() {
    const { data } = await api.delete('/admin/notifications/clear');
    return data;
  },

  async deleteOne(id) {
    const { data } = await api.delete(`/admin/notifications/${id}`);
    return data;
  }
};

export default notificationService;
