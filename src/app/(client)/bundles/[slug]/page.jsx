// 📁 PATH: src/app/(client)/bundles/[slug]/page.jsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Package, CheckCircle2, ShoppingCart, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useShopBundleBySlug } from "@/hooks/client/useShopBundles";
import { useAddBundleToCart } from "@/hooks/useCart";
import toast from "react-hot-toast";

/* ── Image Slider Component ── */
function BundleDetailSlider({ images }) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const total = images.length;

  const startAutoSlide = useCallback(() => {
    if (total <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 4000);
  }, [total]);

  const stopAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [startAutoSlide, stopAutoSlide]);

  const goTo = (idx) => {
    stopAutoSlide();
    setCurrent(idx);
    startAutoSlide();
  };

  const goNext = () => goTo((current + 1) % total);
  const goPrev = () => goTo((current - 1 + total) % total);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted group">
        <img
          src={images[current] || "/placeholder.png"}
          alt={`Bundle image ${current + 1}`}
          className="h-full w-full object-cover transition-all duration-500"
        />

        {/* Navigation arrows */}
        {total > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Bundle badge */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-xs font-bold text-white z-20">
          <Package className="h-3.5 w-3.5" /> Bundle Deal
        </span>

        {/* Image counter */}
        {total > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white z-20">
            {current + 1} / {total}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                idx === current
                  ? "border-violet-500 ring-2 ring-violet-500/20"
                  : "border-border hover:border-violet-300 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BundleDetailPage() {
  const { slug } = useParams();
  const { data: bundle, isLoading } = useShopBundleBySlug(slug);
  const addBundleToCart = useAddBundleToCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container-x py-10">
        <div className="animate-pulse space-y-4">
          <div className="aspect-[21/9] rounded-xl bg-muted" />
          <div className="h-6 w-1/2 rounded bg-muted" />
          <div className="h-4 w-1/3 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="container-x py-16 text-center">
        <Package className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Bundle not found or no longer available.</p>
      </div>
    );
  }

  const price = bundle.bundlePrice ?? 0;
  const comparePrice = bundle.comparePrice ?? bundle.originalPrice ?? null;
  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  const soldOut = bundle.stock !== null && bundle.stock !== undefined && bundle.stock <= 0;

  // Collect all images for the slider
  const allImages = [];
  if (bundle.image) allImages.push(bundle.image);
  (bundle.products || []).forEach((p) => {
    if (p.image && !allImages.includes(p.image)) {
      allImages.push(p.image);
    }
  });
  if (allImages.length === 0) allImages.push("/placeholder.png");

  // Add bundle to cart - adds each product individually with bundle discounts
  const handleAddToCart = () => {
    if (soldOut || addBundleToCart.isPending) return;

    addBundleToCart.mutate({
      products: bundle.products || [],
      bundleId: bundle._id,
      quantity,
    });
  };

  return (
    <div className="container-x py-6">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image Slider */}
        <BundleDetailSlider images={allImages} />

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{bundle.name}</h1>
            {bundle.sku && <p className="mt-1 text-xs text-muted-foreground font-mono">{bundle.sku}</p>}
          </div>

          {bundle.description && (
            <p className="text-sm text-muted-foreground">{bundle.description}</p>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">SAR {price.toLocaleString()}</span>
            {comparePrice > price && (
              <span className="text-base text-muted-foreground line-through">
                SAR {comparePrice.toLocaleString()}
              </span>
            )}
            {discount > 0 && (
              <span className="sale-badge">-{discount}%</span>
            )}
          </div>

          {bundle.stock !== null && bundle.stock !== undefined && (
            <p className={`text-sm font-medium ${bundle.stock <= 0 ? "text-red-500" : "text-emerald-600"}`}>
              {bundle.stock <= 0 ? "Sold out" : `${bundle.stock} bundles left in stock`}
            </p>
          )}

          {/* Add to Cart Section */}
          <div className="flex items-center gap-3 pt-2">
            {/* Quantity selector */}
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-10 w-12 items-center justify-center text-sm font-semibold text-foreground border-x border-border">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={soldOut || addBundleToCart.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20"
            >
              {addBundleToCart.isPending ? (
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
              {soldOut ? "Sold Out" : addBundleToCart.isPending ? "Adding..." : "Add Bundle to Cart"}
            </button>
          </div>

          {/* Products included */}
          <div className="rounded-xl border border-border p-4 mt-2">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              What&apos;s included ({bundle.products?.length || 0} products)
            </h2>
            <ul className="space-y-2.5">
              {(bundle.products || []).map((p, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  {/* Product image thumbnail */}
                  {p.image && (
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <span className="flex flex-1 items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    {p.name}
                    {p.quantity > 1 && <span className="text-xs text-muted-foreground">&times; {p.quantity}</span>}
                  </span>
                  <span className="flex-shrink-0 text-muted-foreground">
                    SAR {(p.price * p.quantity).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {bundle.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {bundle.tags.map((t) => (
                <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}