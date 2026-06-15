import api from '@/lib/api';

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (productId, qty = 1, variantSku = 'default') =>
    api.post('/cart/items', { productId, qty, variantSku }),
  updateItem: (productId, qty, variantSku = 'default') =>
    api.patch(`/cart/items/${productId}`, { qty, variantSku }),
  removeItem: (productId, variantSku = 'default') =>
    api.delete(`/cart/items/${productId}`, { data: { variantSku } }),
  clearCart: () => api.delete('/cart'),
  mergeCart: (sessionId) => api.post('/cart/merge', { sessionId }),
};