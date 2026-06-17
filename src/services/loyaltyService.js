// 📁 PATH: src/services/loyaltyService.js
// ⚠️  This is a completely new file

import api from '@/lib/api';

export const loyaltyService = {
  // Program settings
  adminGetSettings:    ()         => api.get('/admin/loyalty/settings'),
  adminSaveSettings:   (data)     => api.put('/admin/loyalty/settings', data),

  // Tiers
  adminGetTiers:       ()         => api.get('/admin/loyalty/tiers'),
  adminCreateTier:     (data)     => api.post('/admin/loyalty/tiers', data),
  adminUpdateTier:     (id, data) => api.put(`/admin/loyalty/tiers/${id}`, data),
  adminDeleteTier:     (id)       => api.delete(`/admin/loyalty/tiers/${id}`),

  // Earning rules
  adminGetRules:       ()         => api.get('/admin/loyalty/rules'),
  adminCreateRule:     (data)     => api.post('/admin/loyalty/rules', data),
  adminUpdateRule:     (id, data) => api.put(`/admin/loyalty/rules/${id}`, data),
  adminDeleteRule:     (id)       => api.delete(`/admin/loyalty/rules/${id}`),
  adminToggleRule:     (id)       => api.patch(`/admin/loyalty/rules/${id}/toggle`),

  // Members
  adminGetMembers:     (params)   => api.get('/admin/loyalty/members', { params }),
  adminGetMember:      (id)       => api.get(`/admin/loyalty/members/${id}`),
  adminAdjustPoints:   (id, data) => api.post(`/admin/loyalty/members/${id}/adjust`, data),
  adminGetTransactions:(params)   => api.get('/admin/loyalty/transactions', { params }),

  // Stats
  adminStats:          ()         => api.get('/admin/loyalty/stats'),
};
