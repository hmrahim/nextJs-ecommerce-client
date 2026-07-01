import api from '@/lib/api';

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (productId, qty = 1, variantSku = 'default', bundleId = null) => {
    console.log('CART_ADD:', { productId, qty, variantSku, bundleId });
    return api.post('/cart/items', {
      productId: String(productId),
      qty: Number(qty),
      variantSku: variantSku || 'default',
      bundleId: bundleId || undefined,
    });
  },
  updateItem: (productId, qty, variantSku = 'default', bundleId = null) =>
    api.patch(`/cart/items/${String(productId)}`, {
      qty: Number(qty),
      variantSku: variantSku || 'default',
      bundleId: bundleId || undefined,
    }),
  removeItem: (productId, variantSku = 'default', bundleId = null) =>
    api.delete(`/cart/items/${String(productId)}`, { 
      data: { 
        variantSku: variantSku || 'default',
        bundleId: bundleId || undefined,
      } 
    }),
  clearCart: () => api.delete('/cart'),
  mergeCart: (sessionId) => api.post('/cart/merge', { sessionId }),
};