"use client";
import Link from "next/link";
import { Star, Heart, ShoppingCart, BadgeCheck, Check, Loader2 } from "lucide-react";
import { useAddToCart } from "@/hooks/useCart";
import { useState } from "react";

function ProductCard({ p, compact = false }) {
  const price        = p.price        ?? 0;
  const comparePrice = p.comparePrice ?? null;
  const discount     =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  const rating    = p.avgRating   ?? 0;
  const reviews   = p.reviewCount ?? 0;
  const title     = p.name        ?? '';
  const image     = p.images?.[0]?.url ?? '/placeholder.png';
  const brandName = p.brand?.name ?? '';
  const slug      = p.slug ?? p._id;

  const addToCart = useAddToCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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
      /* toast already shown by the mutation */
    }
  };

  return (
    <Link
      href={`/shop/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card card-hover"
    >
      {/* ── image ── */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {p.featured && (
          <span className="absolute left-2 top-2 chip">Featured</span>
        )}
        {discount > 0 && (
          <span className="absolute right-2 top-2 sale-badge">-{discount}%</span>
        )}
        {/* wishlist */}
        <button
          className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-muted-foreground
            opacity-0 transition group-hover:opacity-100 hover:text-rose-500"
          aria-label="Save to wishlist"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* ── body ── */}
      <div className={`flex flex-1 flex-col gap-1.5 p-3 ${compact ? 'text-xs' : 'text-sm'}`}>
        <h3 className="line-clamp-2 font-medium text-foreground group-hover:text-primary">
          {title}
        </h3>

        {/* rating */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
          <span>({reviews.toLocaleString()})</span>
        </div>

        {/* price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            ৳{price.toLocaleString()}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-muted-foreground line-through">
              ৳{comparePrice.toLocaleString()}
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
          disabled={addToCart.isPending}
          className={`mt-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all duration-200 disabled:opacity-70
            ${added
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
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
    </Link>
  );
}

export { ProductCard };
export default ProductCard;
