import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (!get().items.find((i) => i.id === product.id)) {
          set({ items: [...get().items, product] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      isWishlisted: (id) => !!get().items.find((i) => i.id === id),
      toggle: (product) => {
        get().isWishlisted(product.id) ? get().removeItem(product.id) : get().addItem(product);
      },
      clear: () => set({ items: [] }),
    }),
    { name: 'moom24-wishlist' }
  )
);
