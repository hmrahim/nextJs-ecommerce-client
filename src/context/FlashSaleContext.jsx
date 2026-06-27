"use client";
/**
 * 📁 src/context/FlashSaleContext.jsx
 *
 * Global flash-sale awareness for the storefront.
 *
 * - Fetches the currently active flash sales once on mount and refreshes
 *   periodically (every 60s) so prices/badges stay in sync.
 * - Builds an O(1) lookup map keyed by productId for `applicationType==='specific'`
 *   sales, and exposes the discount config for `applicationType==='all'` sales
 *   so any product card / cart line can apply the discount client-side.
 * - Exposes `useFlashSale()` and a tiny `useFlashSalePrice(product)` helper that
 *   returns `{ price, originalPrice, discountPercent, isFlash, endTime }`.
 */

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { flashSaleService } from "@/services/flashSaleService";

const FlashSaleContext = createContext({
  sales: [],
  loading: true,
  /** Map<productId, { salePrice, originalPrice, saleId, endTime, discountType, discountValue }> */
  productMap: new Map(),
  /** highest-priority active "all-products" sale (or null) */
  allProductsSale: null,
  refresh: () => {},
});

export function FlashSaleProvider({ children }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    try {
      const res = await flashSaleService.getActive();
      const list = res?.data?.data || res?.data || [];
      // Filter out expired (defensive — server already filters)
      const now = Date.now();
      const active = (Array.isArray(list) ? list : []).filter(
        (s) => new Date(s.endTime).getTime() > now
      );
      setSales(active);
    } catch {
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
    const id = setInterval(fetchSales, 60_000);
    return () => clearInterval(id);
  }, [fetchSales]);

  const { productMap, allProductsSale } = useMemo(() => {
    const map = new Map();
    let allSale = null;
    // Sort by priority desc then earliest start — first match wins per product
    const sorted = [...sales].sort(
      (a, b) =>
        (b.priority || 0) - (a.priority || 0) ||
        new Date(a.startTime) - new Date(b.startTime)
    );
    for (const s of sorted) {
      if (s.applicationType === "all" && !allSale) {
        allSale = s;
        continue;
      }
      if (Array.isArray(s.products)) {
        for (const p of s.products) {
          const key = String(p.product || p._id);
          if (!map.has(key)) {
            map.set(key, {
              salePrice: p.salePrice,
              originalPrice: p.originalPrice,
              saleId: s._id,
              saleSlug: s.slug,
              endTime: s.endTime,
              discountType: s.discountType,
              discountValue: s.discountValue,
              stock: p.stock,
              sold: p.sold,
            });
          }
        }
      }
    }
    return { productMap: map, allProductsSale: allSale };
  }, [sales]);

  const value = useMemo(
    () => ({ sales, loading, productMap, allProductsSale, refresh: fetchSales }),
    [sales, loading, productMap, allProductsSale, fetchSales]
  );

  return <FlashSaleContext.Provider value={value}>{children}</FlashSaleContext.Provider>;
}

export function useFlashSale() {
  return useContext(FlashSaleContext);
}

/**
 * Compute the effective price for a single product based on the currently
 * active flash sales. Always returns an object — `isFlash:false` means no
 * sale applies and callers should use the catalog price.
 */
export function useFlashSalePrice(product) {
  const { productMap, allProductsSale } = useFlashSale();

  return useMemo(() => {
    if (!product) return { isFlash: false };
    const id = String(product._id || product.id || product.productId || "");
    const basePrice = Number(product.price ?? product.originalPrice ?? 0);

    // 1) Specific product match — wins over "all" sales
    if (id && productMap.has(id)) {
      const entry = productMap.get(id);
      if (entry.salePrice != null && entry.salePrice < (entry.originalPrice ?? basePrice)) {
        const orig = entry.originalPrice ?? basePrice;
        return {
          isFlash: true,
          price: entry.salePrice,
          originalPrice: orig,
          discountPercent: orig > 0 ? Math.round(((orig - entry.salePrice) / orig) * 100) : 0,
          endTime: entry.endTime,
          saleId: entry.saleId,
        };
      }
    }

    // 2) "All products" sale — apply sale-wide discount on top of catalog price
    if (allProductsSale && basePrice > 0) {
      const { discountType, discountValue, endTime, _id } = allProductsSale;
      let salePrice;
      if (discountType === "percent") {
        salePrice = Math.max(0, Math.round(basePrice * (1 - (Number(discountValue) || 0) / 100)));
      } else {
        salePrice = Math.max(0, Math.round(basePrice - (Number(discountValue) || 0)));
      }
      if (salePrice < basePrice) {
        return {
          isFlash: true,
          price: salePrice,
          originalPrice: basePrice,
          discountPercent: Math.round(((basePrice - salePrice) / basePrice) * 100),
          endTime,
          saleId: _id,
        };
      }
    }

    return { isFlash: false };
  }, [product, productMap, allProductsSale]);
}
