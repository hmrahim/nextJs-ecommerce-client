import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, variant = null) => {
        const { items } = get();
        const key = variant ? `${product.id}-${variant.id}` : product.id;
        const existing = items.find((i) => i.key === key);
        if (existing) {
          set({ items: items.map((i) => i.key === key ? { ...i, quantity: i.quantity + quantity } : i) });
        } else {
          set({ items: [...items, { key, product, variant, quantity }] });
        }
      },

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      updateQuantity: (key, quantity) => {
        if (quantity < 1) return get().removeItem(key);
        set({ items: get().items.map((i) => i.key === key ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [] }),

      get totalItems() { return get().items.reduce((acc, i) => acc + i.quantity, 0); },
      get subtotal() {
        return get().items.reduce((acc, i) => {
          const price = i.variant?.price || i.product.price;
          return acc + price * i.quantity;
        }, 0);
      },
    }),
    { name: 'moom24-cart' }
  )
);
