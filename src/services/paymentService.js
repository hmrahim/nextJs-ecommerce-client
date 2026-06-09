import api from '@/lib/api';

export const paymentService = {
  createIntent: (data) => api.post('/payment/create-intent', data),
  verify: (data) => api.post('/payment/verify', data),
  getHistory: () => api.get('/payment/history'),
};
