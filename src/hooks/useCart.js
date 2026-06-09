'use client';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

export function useCart() {
  const store = useCartStore();
  const { openCart } = useUIStore();

  const addToCart = (product, quantity = 1, variant = null) => {
    store.addItem(product, quantity, variant);
    openCart();
  };

  return { ...store, addToCart };
}
