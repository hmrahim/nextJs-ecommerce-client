import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '@/services/cartService';
import { getSessionId } from '@/lib/session';

// Map a backend cart item -> the shape the UI components expect
// (item.product.*, item.variant.*, item.quantity, item.key)
const mapServerItem = (i) => {
  let key = i.variantSku && i.variantSku !== 'default'
    ? `${i.productId}-${i.variantSku}`
    : String(i.productId);

  if (i.bundleId) {
    key = `${key}-bundle-${i.bundleId}`;
  }

  return {
    key,
    productId: i.productId,
    variantSku: i.variantSku,
    quantity: i.qty,
    bundleId: i.bundleId || null,
    product: {
      id: i.productId,
      _id: i.productId,
      name: i.product?.name,
      slug: i.product?.slug,
      images: i.product?.image ? [{ url: i.product.image }] : [],
      price: i.currentPrice ?? i.price,
      comparePrice: null,
    },
    variant:
      i.variantSku && i.variantSku !== 'default'
        ? { id: i.variantSku, sku: i.variantSku, price: i.price, ...i.variant }
        : null,
  };
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      hydrated: false,

      /* ── Pull the latest cart from the server ─────────────── */
      fetchCart: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await cartService.getCart();
          const items = (data?.data?.items || []).map(mapServerItem);
          set({ items, loading: false, hydrated: true });
        } catch (err) {
          set({ loading: false, error: err?.response?.data?.message || 'Failed to load cart' });
        }
      },

      /* ── Add item (calls backend, then refreshes from response) ── */
      addItem: async (product, quantity = 1, variant = null, bundleId = null) => {
        const productId = product._id || product.id;
        const variantSku = variant?.sku || 'default';

        set({ loading: true, error: null });
        try {
          const { data } = await cartService.addItem(productId, quantity, variantSku, bundleId);
          const items = (data?.data?.items || []).map(mapServerItem);
          set({ items, loading: false });
          return { success: true };
        } catch (err) {
          const message = err?.response?.data?.message || 'Could not add item to cart';
          set({ loading: false, error: message });
          return { success: false, message };
        }
      },

      /* ── Update quantity ───────────────────────────────────── */
      updateQuantity: async (key, quantity) => {
        const item = get().items.find((i) => i.key === key);
        if (!item) return;

        if (quantity < 1) return get().removeItem(key);

        set({ loading: true, error: null });
        try {
          const { data } = await cartService.updateItem(item.productId, quantity, item.variantSku, item.bundleId);
          const items = (data?.data?.items || []).map(mapServerItem);
          set({ items, loading: false });
        } catch (err) {
          set({ loading: false, error: err?.response?.data?.message || 'Could not update quantity' });
        }
      },

      /* ── Remove item ───────────────────────────────────────── */
      removeItem: async (key) => {
        const item = get().items.find((i) => i.key === key);
        if (!item) return;

        set({ loading: true, error: null });
        try {
          const { data } = await cartService.removeItem(item.productId, item.variantSku, item.bundleId);
          const items = (data?.data?.items || []).map(mapServerItem);
          set({ items, loading: false });
        } catch (err) {
          set({ loading: false, error: err?.response?.data?.message || 'Could not remove item' });
        }
      },

      /* ── Clear cart ────────────────────────────────────────── */
      clearCart: async () => {
        set({ loading: true, error: null });
        try {
          await cartService.clearCart();
          set({ items: [], loading: false });
        } catch (err) {
          set({ loading: false, error: err?.response?.data?.message || 'Could not clear cart' });
        }
      },

      /* ── Merge guest cart into user cart after login ──────── */
      mergeGuestCart: async () => {
        const sessionId = getSessionId();
        if (!sessionId) return;
        try {
          const { data } = await cartService.mergeCart(sessionId);
          const items = (data?.data?.items || []).map(mapServerItem);
          set({ items });
        } catch {
          // ignore merge failures silently — user still has their cart
        }
      },

      get totalItems() {
        return get().items.reduce((acc, i) => acc + i.quantity, 0);
      },
      get subtotal() {
        return get().items.reduce((acc, i) => {
          const price = i.bundleId ? i.product.price : (i.variant?.price ?? i.product.price ?? 0);
          return acc + price * i.quantity;
        }, 0);
      },
    }),
    {
      name: 'moom24-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);