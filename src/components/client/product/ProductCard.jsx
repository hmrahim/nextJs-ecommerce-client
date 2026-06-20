"use client";
/**
 * 📁 src/components/client/product/ProductCard.jsx
 *
 * FIX: Buttons were nested inside <Link>, which caused the App-Router
 * top progress bar to flash and sometimes navigate away before the
 * wishlist / add-to-cart mutation could finish.
 *
 * Now: outer wrapper is a plain <div>. Only the image + title are
 * wrapped in their own <Link>s. Cart/wishlist buttons are siblings of
 * those links, so clicks never bubble to a navigable ancestor.
 */

import Link from "next/link";
import {
  Star,
  Heart,
  ShoppingCart,
  BadgeCheck,
  Check,
  Loader2,
} from "lucide-react";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist, useWishlistIds } from "@/hooks/useWishlist";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function ProductCard({ p, compact = false }) {
  const price = p.price ?? 0;
  const comparePrice = p.comparePrice ?? null;
  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  const rating = p.avgRating ?? 0;
  const reviews = p.reviewCount ?? 0;
  const title = p.name ?? "";
  const image = p.images?.[0]?.url ?? "/placeholder.png";
  const brandName = p.brand?.name ?? "";
  const slug = p.slug ?? p._id;
  const href = `/shop/${slug}`;

  /* ── Cart ──────────────────────────────────────────────────── */
  const addToCart = useAddToCart();
  const [added, setAdded] = useState(false);

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent?.stopImmediatePropagation) {
      e.nativeEvent.stopImmediatePropagation();
    }
  };

  const handleAddToCart = async (e) => {
    stop(e);
    if (addToCart.isPending) return;
    try {
      await addToCart.mutateAsync({
        product: {
          id: p._id,
          _id: p._id,
          name: p.name,
          price: p.price,
          comparePrice: p.comparePrice,
          images: p.images,
          slug: p.slug,
          brand: p.brand,
        },
        quantity: 1,
        variant: null,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch {
      /* toast already shown */
    }
  };

  /* ── Wishlist ──────────────────────────────────────────────── */
  const { data: session } = useSession();
  const router = useRouter();
  const wishlistIds = useWishlistIds();
  const toggleWishlist = useToggleWishlist();

  const productId = String(p._id || p.id);
  const isWishlisted = wishlistIds.has(productId);

  const handleWishlist = (e) => {
    stop(e);

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (toggleWishlist.isPending) return;

    toggleWishlist.mutate({
      _id: p._id,
      id: p._id,
      name: p.name,
      slug: p.slug,
      images: p.images,
      price: p.price,
      comparePrice: p.comparePrice,
      avgRating: p.avgRating,
      reviewCount: p.reviewCount,
      brand: p.brand,
      inStock: p.inStock,
    });
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card card-hover">
      {/* ── image (link) ── */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={href} className="block h-full w-full" aria-label={title}>
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {p.featured && (
          <span className="absolute left-2 top-2 chip pointer-events-none">
            Featured
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-2 top-2 sale-badge pointer-events-none">
            -{discount}%
          </span>
        )}

        {/* ── Wishlist heart button (sibling of Link, not nested) ── */}
        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          onClick={handleWishlist}
          onMouseDown={stop}
          onTouchStart={stop}
          disabled={toggleWishlist.isPending}
          className={`absolute bottom-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full
            bg-white/90 transition shadow-sm
            opacity-100 md:opacity-0 md:group-hover:opacity-100
            disabled:cursor-not-allowed disabled:opacity-50
            ${
              isWishlisted
                ? "text-rose-500"
                : "text-muted-foreground hover:text-rose-500"
            }`}
        >
          {toggleWishlist.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart
              className={`h-4 w-4 transition-transform active:scale-125 ${
                isWishlisted ? "fill-rose-500" : ""
              }`}
            />
          )}
        </button>
      </div>

      {/* ── body ── */}
      <div
        className={`flex flex-1 flex-col gap-1.5 p-3 ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        <Link href={href} className="block">
          <h3 className="line-clamp-2 font-medium text-foreground group-hover:text-primary">
            {title}
          </h3>
        </Link>

        {/* rating */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-foreground">
            {rating.toFixed(1)}
          </span>
          <span>({reviews.toLocaleString()})</span>
        </div>

        {/* price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            SAR {price.toLocaleString()}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-muted-foreground line-through">
              SAR {comparePrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* brand */}
        {brandName && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <BadgeCheck className="h-3 w-3 text-emerald-600" />
            {brandName}
          </div>
        )}

        {/* add to cart btn */}
        <button
          type="button"
          onClick={handleAddToCart}
          onMouseDown={stop}
          onTouchStart={stop}
          disabled={addToCart.isPending}
          className={`mt-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all duration-200 disabled:opacity-70
            ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
            }`}
        >
          {addToCart.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Adding…
            </>
          ) : added ? (
            <>
              <Check className="h-3.5 w-3.5" /> Added!
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export { ProductCard };
export default ProductCard;
