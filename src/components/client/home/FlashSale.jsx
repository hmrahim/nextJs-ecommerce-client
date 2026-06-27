"use client";
/**
 * 📁 src/components/client/home/FlashSale.jsx
 *
 * Storefront flash-sale section. Shows ALL active flash sales (including
 * offers like "Mega Offer", "Flash Sale", etc.) as separate slider sections
 * on the homepage. Each sale displays up to 10 products in a slider with a
 * "See All" link that navigates to a dynamic page showing all products.
 *
 * Handles both:
 *   - applicationType === 'specific' → uses embedded products
 *   - applicationType === 'all'      → fetches catalog products & applies discount
 */

import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Countdown } from "./Countdown";
import { ProductCard } from "../product/ProductCard";
import { flashSaleService } from "@/services/flashSaleService";
import { productService } from "@/services/productService";
import ProductSlider from "./ProductSlider";

const FlashSaleSection = ({ sale, products }) => {
  const [isExpired, setExpired] = useState(false);
  const handleExpire = useCallback(() => setExpired(true), []);

  if (isExpired) return null;
  if (!sale || products.length === 0) return null;

  // Normalize so ProductCard understands these
  // Use originalPrice as `price` so FlashSaleContext can properly compute
  // the discount without double-discounting. The context handles showing sale price.
  const normalized = products.slice(0, 10).map((p) => ({
    ...p,
    _id: p._id || p.productId || p.product,
    images: p.images?.length ? p.images : p.image ? [{ url: p.image }] : [],
    price: p.originalPrice ?? p.price ?? 0,
    comparePrice: null, // Let FlashSaleContext handle discount display
  }));

  const cards = normalized.map((p) => (
    <div key={String(p._id)} className="px-1">
      <ProductCard p={p} compact />
    </div>
  ));

  const endTime = sale.endTime;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-50 to-amber-50">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-white/60 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-400">
            <Zap className="h-5 w-5 text-emerald-950" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">
              {sale?.name || "Flash Sale"}
            </h2>
            <div className="text-xs text-muted-foreground">
              {sale?.discountType === "percent"
                ? `Up to ${sale.discountValue}% OFF`
                : sale?.discountValue
                  ? `Up to ৳${sale.discountValue} OFF`
                  : "Hurry, limited time only"}
              {sale?.applicationType === "all" && (
                <span className="ml-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  All products
                </span>
              )}
            </div>
          </div>
          <div className="ml-2">
            {endTime ? (
              <Countdown targetDate={endTime} onExpire={handleExpire} />
            ) : (
              <Countdown hours={8} onExpire={handleExpire} />
            )}
          </div>
        </div>
        <Link
          href={sale?.slug ? `/flash-sale/${sale.slug}` : "/shop"}
          className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-700 hover:underline"
        >
          See All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Slider */}
      <div className="p-4">
        <ProductSlider autoPlay={3500}>{cards}</ProductSlider>
      </div>
    </section>
  );
};

/**
 * Apply a flash sale discount to catalog products for "all" type sales.
 */
function applyDiscountToProducts(products, sale) {
  if (!sale || !products.length) return products;
  const { discountType, discountValue } = sale;
  if (!discountValue) return products;

  return products.map((p) => {
    const basePrice = Number(p.price ?? p.originalPrice ?? 0);
    let salePrice;
    if (discountType === "percent") {
      salePrice = Math.max(0, Math.round(basePrice * (1 - discountValue / 100)));
    } else {
      salePrice = Math.max(0, Math.round(basePrice - discountValue));
    }
    return {
      ...p,
      salePrice,
      originalPrice: basePrice,
    };
  });
}

const FlashSale = () => {
  const [salesWithProducts, setSalesWithProducts] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch all active flash sales
        const res = await flashSaleService.getActive();
        const list = res?.data?.data || res?.data || [];
        const now = Date.now();

        // Filter out expired and inactive sales
        const activeSales = (Array.isArray(list) ? list : []).filter(
          (s) => new Date(s.endTime).getTime() > now && s.isActive !== false
        );

        // For each sale, resolve its products
        const salesResults = await Promise.all(
          activeSales.map(async (sale) => {
            let products = Array.isArray(sale.products) ? sale.products : [];

            // If products are embedded and not empty, use them directly
            if (products.length > 0) {
              return { sale, products };
            }

            // Try fetching by slug first (backend may resolve products)
            if (sale.slug) {
              try {
                const detailRes = await flashSaleService.getBySlug(sale.slug);
                const detailPayload = detailRes?.data?.data || detailRes?.data || {};
                const detailSale = detailPayload.sale || detailPayload;
                const detailProducts = Array.isArray(detailPayload.products)
                  ? detailPayload.products
                  : Array.isArray(detailSale.products)
                    ? detailSale.products
                    : [];
                if (detailProducts.length > 0) {
                  return { sale: detailSale, products: detailProducts };
                }
              } catch {
                // Continue to fallback
              }
            }

            // Fallback: for "all" type sales, fetch catalog products and apply discount
            if (sale.applicationType === "all" || !sale.applicationType) {
              try {
                const prodRes = await productService.getAll({ limit: 20, status: "active" });
                const prodData = prodRes?.data?.data || prodRes?.data || [];
                const catalogProducts = Array.isArray(prodData) ? prodData : (prodData.products || []);
                if (catalogProducts.length > 0) {
                  const withDiscount = applyDiscountToProducts(catalogProducts, sale);
                  return { sale, products: withDiscount };
                }
              } catch {
                // No products available
              }
            }

            return { sale, products: [] };
          })
        );

        if (!cancelled) {
          // Only show sales that have products
          const withProducts = salesResults.filter(
            (item) => item.products.length > 0
          );
          setSalesWithProducts(withProducts);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setSalesWithProducts([]);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) return null;
  if (salesWithProducts.length === 0) return null;

  return (
    <div className="space-y-8">
      {salesWithProducts.map(({ sale, products }) => (
        <FlashSaleSection
          key={sale._id || sale.slug}
          sale={sale}
          products={products}
        />
      ))}
    </div>
  );
};

export default FlashSale;