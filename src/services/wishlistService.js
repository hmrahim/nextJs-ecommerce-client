/**
 * 📁 src/services/wishlistService.js
 *
 * Thin API layer. Always coerces productId to string and validates
 * before hitting the network so the backend never sees `undefined`.
 */

import api from '@/lib/api';

const ensureId = (id) => {
  const s = id == null ? '' : String(id);
  if (!s || s === 'undefined' || s === 'null') {
    throw new Error('wishlistService: missing productId');
  }
  return s;
};

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),

  addItem: (productId) =>
    api.post('/wishlist/items', { productId: ensureId(productId) }),

  removeItem: (productId) =>
    api.delete(`/wishlist/items/${ensureId(productId)}`),

  // ✅ Server-authoritative toggle — backend decides add vs remove
  toggleItem: (productId) =>
    api.post('/wishlist/toggle', { productId: ensureId(productId) }),

  clearWishlist: () => api.delete('/wishlist'),

  checkItem: (productId) =>
    api.get(`/wishlist/check/${ensureId(productId)}`),

  moveAllToCart: () => api.post('/wishlist/move-to-cart'),
};
