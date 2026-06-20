'use client';
/**
 * 📁 src/hooks/useWishlist.js
 *
 * Production-ready wishlist hooks.
 *  • Toggle uses server-authoritative /wishlist/toggle endpoint.
 *  • Frontend never decides add vs remove — server returns `action`.
 *  • Cache is replaced with the server's serialized wishlist on success
 *    so the heart state can never drift.
 *  • productId is validated before the mutation fires.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { wishlistService } from '@/services/wishlistService';
import { CART_KEY } from '@/hooks/useCart';

export const WISHLIST_KEY = ['wishlist'];

const pickProductId = (product) => {
  if (!product) return '';
  const raw = product._id ?? product.id ?? product.productId ?? '';
  return raw ? String(raw) : '';
};

const normalizeWishlist = (raw) => {
  const items = raw?.items || [];
  return {
    items,
    itemCount: raw?.itemCount ?? items.length,
    updatedAt: raw?.updatedAt,
  };
};

/* ── GET ─────────────────────────────────────────────────────── */
export function useWishlist() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: async () => {
      const { data } = await wishlistService.getWishlist();
      return normalizeWishlist(data?.data);
    },
    enabled: !!session,
    staleTime: 60 * 1000,
  });
}

/* ── Derived: Set<string> for O(1) heart check ───────────────── */
export function useWishlistIds() {
  const { data } = useWishlist();
  return new Set(
    (data?.items || []).map((i) => String(i.product?._id || i.product))
  );
}

/* ── TOGGLE — server-authoritative ───────────────────────────── */
export function useToggleWishlist() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (product) => {
      const pid = pickProductId(product);
      if (!pid) {
        throw new Error('Missing product id');
      }
      const res = await wishlistService.toggleItem(pid);
      return res?.data; // { success, action, data: { items, itemCount, ... } }
    },

    /* Optimistic update — flip locally for instant feedback */
    onMutate: async (product) => {
      await qc.cancelQueries({ queryKey: WISHLIST_KEY });
      const prev = qc.getQueryData(WISHLIST_KEY);
      const pid = pickProductId(product);
      if (!pid) return { prev };

      const current = prev || { items: [], itemCount: 0 };
      const alreadyIn = current.items.some(
        (i) => String(i.product?._id || i.product) === pid
      );

      const nextItems = alreadyIn
        ? current.items.filter(
            (i) => String(i.product?._id || i.product) !== pid
          )
        : [
            ...current.items,
            {
              product: {
                _id: pid,
                name: product.name,
                slug: product.slug,
                images: product.images,
                price: product.price,
                comparePrice: product.comparePrice,
                avgRating: product.avgRating,
                reviewCount: product.reviewCount,
                brand: product.brand,
                inStock: product.inStock,
                isActive: true,
              },
              addedAt: new Date().toISOString(),
            },
          ];

      qc.setQueryData(WISHLIST_KEY, {
        ...current,
        items: nextItems,
        itemCount: nextItems.length,
      });

      return { prev };
    },

    onSuccess: (payload) => {
      // Replace cache with server truth
      if (payload?.data) {
        qc.setQueryData(WISHLIST_KEY, normalizeWishlist(payload.data));
      }
      const action = payload?.action;
      toast.success(
        action === 'removed' ? 'Removed from wishlist' : 'Added to wishlist'
      );
    },

    onError: (err, _product, ctx) => {
      if (ctx?.prev) qc.setQueryData(WISHLIST_KEY, ctx.prev);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Could not update wishlist. Please try again.';
      toast.error(msg);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: WISHLIST_KEY });
    },
  });
}

/* ── CLEAR ───────────────────────────────────────────────────── */
export function useClearWishlist() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => wishlistService.clearWishlist(),
    onSuccess: () => {
      qc.setQueryData(WISHLIST_KEY, { items: [], itemCount: 0 });
      toast.success('Wishlist cleared');
    },
    onError: () => toast.error('Could not clear wishlist'),
  });
}

/* ── MOVE ALL TO CART ────────────────────────────────────────── */
export function useMoveAllToCart() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => wishlistService.moveAllToCart(),
    onSuccess: ({ data }) => {
      qc.setQueryData(WISHLIST_KEY, { items: [], itemCount: 0 });
      qc.invalidateQueries({ queryKey: CART_KEY });
      toast.success(data?.message || 'All items moved to cart');
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message || 'Could not move items to cart'
      ),
  });
}
