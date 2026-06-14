/**
 * 📁 src/store/couponStore.js
 *
 * Global coupon/promo state — persisted in sessionStorage so it survives
 * the cart → checkout navigation but resets when the tab closes.
 *
 * Used by:
 *  - /cart page (apply / remove coupon)
 *  - /checkout page (show discount, pass to order payload)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { couponService } from '@/services/couponService';

export const useCouponStore = create(
  persist(
    (set, get) => ({
      // ── State ─────────────────────────────────────────────
      coupon: null,        // { code, type, value, label, discount }
      loading: false,
      error: null,

      // ── Actions ───────────────────────────────────────────

      /**
       * Validate & apply a coupon code against the backend.
       * @param {string} code
       * @param {number} orderAmount  current cart subtotal
       * @param {Array}  items        cart items (optional, for item-level coupons)
       * @returns {{ ok: boolean, message?: string }}
       */
      applyCoupon: async (code, orderAmount, items = []) => {
        if (!code?.trim()) {
          set({ error: 'কোড টা লিখুন' });
          return { ok: false, message: 'কোড টা লিখুন' };
        }

        set({ loading: true, error: null });

        try {
          const { data } = await couponService.validate({
            code: code.trim().toUpperCase(),
            orderAmount,
            items,
          });

          const payload = data?.data ?? data;
          // backend returns: { discount, type, value, code, description/label }
          const coupon = {
            code:     payload.code     ?? code.toUpperCase(),
            type:     payload.type     ?? 'percent',
            value:    payload.value    ?? 0,
            label:    payload.description ?? payload.label ?? `${payload.value} off`,
            discount: payload.discount ?? 0,   // pre-computed by backend
          };

          set({ coupon, loading: false, error: null });
          return { ok: true };
        } catch (err) {
          const message =
            err?.response?.data?.message || 'Invalid or expired coupon code';
          set({ loading: false, error: message, coupon: null });
          return { ok: false, message };
        }
      },

      /**
       * Re-compute discount when cart amount changes (e.g. item qty updated).
       * Only called if a coupon is already applied.
       */
      recomputeDiscount: (newSubtotal) => {
        const { coupon } = get();
        if (!coupon) return;

        let discount = 0;
        if (coupon.type === 'percent') {
          discount = Math.round((newSubtotal * coupon.value) / 100);
        } else if (coupon.type === 'fixed') {
          discount = Math.min(coupon.value, newSubtotal);
        }
        // 'shipping' type: no $ discount, handled separately

        set({ coupon: { ...coupon, discount } });
      },

      /** Remove applied coupon */
      removeCoupon: () => set({ coupon: null, error: null }),

      /** Clear error only */
      clearError: () => set({ error: null }),
    }),
    {
      name: 'moom24-coupon',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (s) => ({ coupon: s.coupon }),
    }
  )
);









