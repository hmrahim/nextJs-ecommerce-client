import api from '@/lib/api';

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (productId, qty = 1, variantSku = 'default') => {
    console.log('CART_ADD:', { productId, qty, variantSku });
    return api.post('/cart/items', {
      productId: String(productId),
      qty: Number(qty),
      variantSku: variantSku || 'default',
    });
  },
  updateItem: (productId, qty, variantSku = 'default') =>
    api.patch(`/cart/items/${String(productId)}`, {
      qty: Number(qty),
      variantSku: variantSku || 'default',
    }),
  removeItem: (productId, variantSku = 'default') =>
    api.delete(`/cart/items/${String(productId)}`, { data: { variantSku: variantSku || 'default' } }),
  clearCart: () => api.delete('/cart'),
  mergeCart: (sessionId) => api.post('/cart/merge', { sessionId }),
};