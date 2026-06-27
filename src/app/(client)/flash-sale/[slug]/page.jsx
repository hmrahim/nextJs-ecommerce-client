"use client";
/**
 * 📁 src/app/(client)/flash-sale/[slug]/page.jsx
 *
 * Dynamic page that shows ALL products of a specific flash sale.
 * Handles both:
 *   - applicationType === 'specific' → shows embedded products
 *   - applicationType === 'all'      → fetches catalog products & applies discount
 */

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap, Package } from "lucide-react";
import { flashSaleService } from "@/services/flashSaleService";
import { productService } from "@/services/productService";
import { ProductCard } from "@/components/client/product/ProductCard";
import { Countdown } from "@/components/client/home/Countdown";

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

export default function FlashSaleDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [sale, setSale] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpired, setExpired] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await flashSaleService.getBySlug(slug);
        const payload = res?.data?.data || res?.data || {};
        const saleData = payload.sale || payload;

        // Check if expired
        if (
          saleData?.endTime &&
          new Date(saleData.endTime).getTime() <= Date.now()
        ) {
          if (!cancelled) {
            setExpired(true);
            setSale(saleData);
            setLoading(false);
          }
          return;
        }

        // Try to get products from response
        let items = Array.isArray(payload.products)
          ? payload.products
          : Array.isArray(saleData.products)
            ? saleData.products
            : [];

        // If no products found and sale is "all" type, fetch catalog products
        if (items.length === 0 && (saleData.applicationType === "all" || !saleData.applicationType)) {
          try {
            const prodRes = await productService.getAll({ limit: 50, status: "active" });
            const prodData = prodRes?.data?.data || prodRes?.data || [];
            const catalogProducts = Array.isArray(prodData) ? prodData : (prodData.products || []);
            if (catalogProducts.length > 0) {
              items = applyDiscountToProducts(catalogProducts, saleData);
            }
          } catch {
            // No catalog products available
          }
        }

        if (!cancelled) {
          setSale(saleData);
          setProducts(items);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load flash sale details");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleExpire = useCallback(() => setExpired(true), []);

  // Normalize products for ProductCard
  // Use the ORIGINAL price as `price` so FlashSaleContext can properly compute
  // the flash sale discount without double-discounting. The context will show
  // the sale price via `flash.price`. If context hasn't loaded yet, the card
  // falls back to showing `price` with `comparePrice` as strikethrough.
  const normalized = products.map((p) => {
    const originalPrice = p.originalPrice ?? p.comparePrice ?? p.price ?? 0;
    const salePrice = p.salePrice ?? p.price ?? 0;
    return {
      ...p,
      _id: p._id || p.productId || p.product,
      slug: p.slug || null,
      images: p.images?.length ? p.images : p.image ? [{ url: p.image }] : [],
      // Set price to original so FlashSaleContext applies discount correctly
      price: originalPrice,
      comparePrice: null, // Context handles compare price display
    };
  });

  if (isLoading) {
    return (
      <div className="container-x py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-24 rounded-2xl bg-muted" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-x py-8">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Package className="h-16 w-16 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">{error}</p>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-emerald-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">
          {sale?.name || "Flash Sale"}
        </span>
      </nav>

      {/* Sale Header Banner */}
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-50 to-amber-50">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-400 shadow-lg">
              <Zap className="h-7 w-7 text-emerald-950" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">
                {sale?.name || "Flash Sale"}
              </h1>
              <div className="mt-1 text-sm text-muted-foreground">
                {sale?.discountType === "percent"
                  ? `Up to ${sale.discountValue}% OFF on all items`
                  : sale?.discountValue
                    ? `Up to ৳${sale.discountValue} OFF on all items`
                    : "Limited time offers — grab them before they're gone!"}
                {sale?.applicationType === "all" && (
                  <span className="ml-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    All products
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Countdown & Stats */}
          <div className="flex flex-col items-end gap-2">
            {isExpired ? (
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                Sale Ended
              </span>
            ) : sale?.endTime ? (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground">Ends in</span>
                <Countdown targetDate={sale.endTime} onExpire={handleExpire} />
              </div>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {normalized.length} product{normalized.length !== 1 ? "s" : ""}{" "}
              available
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isExpired ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <Zap className="h-16 w-16 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            This flash sale has ended
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Browse Other Deals
          </Link>
        </div>
      ) : normalized.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <Package className="h-16 w-16 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            No products found in this sale
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {normalized.map((p) => (
            <ProductCard key={String(p._id)} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}