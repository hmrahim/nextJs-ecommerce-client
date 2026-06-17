'use client';
/**
 * 📁 src/hooks/useCart.js
 *
 * React-Query based cart hooks.
 * Coupon state lives in useCouponStore (global, persists cart → checkout).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cartService } from '@/services/cartService';
import { useCouponStore } from '@/store/couponStore';

export const CART_KEY = ['cart'];

/* ── Map server item → UI shape ─────────────────────────────── */
const mapServerItem = (i) => {
  const key =
    i.variantSku && i.variantSku !== 'default'
      ? `${i.productId}-${i.variantSku}`
      : String(i.productId);

  return {
    key,
    productId:     i.productId,
    variantSku:    i.variantSku,
    quantity:      i.qty,
    price:         i.currentPrice ?? i.price,
    originalPrice: i.price,
    lineTotal:     (i.currentPrice ?? i.price) * i.qty,
    stock:         i.stock,
    inStock:       i.inStock,
    product: {
      id:       i.productId,
      name:     i.product?.name  || 'Product',
      slug:     i.product?.slug,
      image:    i.product?.image || '',
      isActive: i.product?.isActive,
    },
    variant: i.variant,
  };
};

const normalizeCart = (raw) => {
  const items = (raw?.items || []).map(mapServerItem);
  return {
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal:  items.reduce((s, i) => s + i.lineTotal, 0),
    updatedAt: raw?.updatedAt,
  };
};

/* ── Queries ─────────────────────────────────────────────────── */
export function useCart() {
  return useQuery({
    queryKey: CART_KEY,
    queryFn: async () => {
      const { data } = await cartService.getCart();
      return normalizeCart(data?.data);
    },
    staleTime: 30 * 1000,
  });
}

/* ── Mutations ───────────────────────────────────────────────── */
export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ product, quantity = 1, variant = null }) => {
      const pid = product._id || product.id;
      const sku = variant?.sku || 'default';
      return cartService.addItem(pid, quantity, sku);
    },
    onSuccess: ({ data }) => {
      qc.setQueryData(CART_KEY, normalizeCart(data?.data));
      toast.success('Added to cart');
    },
    onError: (err) => {
      const status  = err?.response?.status;
      const message = err?.response?.data?.message;
      if (status === 409) {
        // stock End — backend Of message show (e.g. "Only 2 item(s) left in stock.")
        toast.error(message || 'Not enough stock available');
      } else {
        toast.error(message || 'Could not add to cart');
      }
    },
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  const recompute = useCouponStore((s) => s.recomputeDiscount);

  return useMutation({
    mutationFn: ({ productId, variantSku = 'default', quantity }) =>
      cartService.updateItem(productId, quantity, variantSku),
    onMutate: async ({ productId, variantSku = 'default', quantity }) => {
      await qc.cancelQueries({ queryKey: CART_KEY });
      const prev = qc.getQueryData(CART_KEY);
      if (prev) {
        const items = prev.items.map((i) =>
          i.productId === productId && i.variantSku === variantSku
            ? { ...i, quantity, lineTotal: i.price * quantity }
            : i,
        );
        const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
        qc.setQueryData(CART_KEY, {
          ...prev,
          items,
          itemCount: items.reduce((s, i) => s + i.quantity, 0),
          subtotal,
        });
        recompute(subtotal);
      }
      return { prev };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(CART_KEY, ctx.prev);
      const status  = err?.response?.status;
      const message = err?.response?.data?.message;
      if (status === 409) {
        toast.error(message || 'Not enough stock available');
      } else {
        toast.error(message || 'Could not update quantity');
      }
    },
    onSuccess: ({ data }) => {
      const cart = normalizeCart(data?.data);
      qc.setQueryData(CART_KEY, cart);
      recompute(cart.subtotal);
    },
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  const recompute = useCouponStore((s) => s.recomputeDiscount);

  return useMutation({
    mutationFn: ({ productId, variantSku = 'default' }) =>
      cartService.removeItem(productId, variantSku),
    onSuccess: ({ data }) => {
      const cart = normalizeCart(data?.data);
      qc.setQueryData(CART_KEY, cart);
      recompute(cart.subtotal);
      toast.success('Item removed');
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || 'Could not remove item'),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  const removeCoupon = useCouponStore((s) => s.removeCoupon);

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: ({ data }) => {
      qc.setQueryData(CART_KEY, normalizeCart(data?.data));
      removeCoupon();
      toast.success('Cart cleared');
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || 'Could not clear cart'),
  });
}