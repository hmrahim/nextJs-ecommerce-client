// 📁 PATH: src/components/client/bundles/BundleCard.jsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Package, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

function BundleImageSlider({ images, title, href }) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const total = images.length;

  const startAutoSlide = useCallback(() => {
    if (total <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 3000);
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

  const goNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    goTo((current + 1) % total);
  };

  const goPrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    goTo((current - 1 + total) % total);
  };

  return (
    <div className="relative h-full w-full group/slider">
      <Link href={href} className="block h-full w-full" aria-label={title}>
        <img
          src={images[current] || "/placeholder.png"}
          alt={`${title} - image ${current + 1}`}
          loading="lazy"
          className="h-full w-full object-cover transition-all duration-500"
        />
      </Link>

      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-sm opacity-0 transition-opacity duration-200 group-hover/slider:opacity-100 hover:bg-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-sm opacity-0 transition-opacity duration-200 group-hover/slider:opacity-100 hover:bg-white"
            aria-label="Next image"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </>
      )}

      {total > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goTo(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === current
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BundleCard({ b }) {
  const title = b.name ?? "";
  const slug = b.slug ?? b._id;
  const href = `/bundles/${slug}`;
  const price = b.bundlePrice ?? 0;
  const comparePrice = b.comparePrice ?? b.originalPrice ?? null;
  const productCount = b.products?.length ?? 0;
  const soldOut = b.stock !== null && b.stock !== undefined && b.stock <= 0;

  // Collect all product images for the slider
  const productImages = (b.products || [])
    .map((p) => p.image)
    .filter(Boolean);

  // Use bundle image as first, then product images, fallback to placeholder
  const allImages = [];
  if (b.image) allImages.push(b.image);
  productImages.forEach((img) => {
    if (!allImages.includes(img)) allImages.push(img);
  });
  if (allImages.length === 0) allImages.push("/placeholder.png");

  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card card-hover">
      {/* ── image slider ── */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <BundleImageSlider images={allImages} title={title} href={href} />

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white pointer-events-none z-20">
          <Package className="h-3 w-3" /> Bundle
        </span>

        {discount > 0 && (
          <span className="absolute right-2 top-2 sale-badge pointer-events-none z-20">
            -{discount}%
          </span>
        )}

        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-foreground">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* ── body ── */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 text-sm">
        <Link href={href} className="block">
          <h3 className="line-clamp-2 font-medium text-foreground group-hover:text-primary">
            {title}
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground">
          {productCount} product{productCount !== 1 ? "s" : ""} included
        </p>

        {/* price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            SAR {price.toLocaleString()}
          </span>
          {comparePrice > price && (
            <span className="text-xs text-muted-foreground line-through">
              SAR {comparePrice.toLocaleString()}
            </span>
          )}
        </div>

        <Link
          href={href}
          className="mt-1 flex items-center justify-center gap-1.5 rounded-md bg-violet-50 py-1.5 text-xs font-semibold text-violet-700 transition-all duration-200 hover:bg-violet-600 hover:text-white"
        >
          View Deal <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export { BundleCard };
export default BundleCard;