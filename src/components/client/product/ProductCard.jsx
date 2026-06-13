"use client";
import Link from "next/link";
import { Star, Heart, ShoppingCart, BadgeCheck, Truck } from "lucide-react";

function ProductCard({ p, compact = false }) {
  // Schema: price / comparePrice / avgRating / reviewCount / name / images[0].url / brand / featured
  const price       = p.price       ?? 0;
  const comparePrice= p.comparePrice ?? null;
  const discount    = comparePrice && comparePrice > price
    ? Math.round((comparePrice - price) / comparePrice * 100)
    : 0;

  const rating      = p.avgRating   ?? 0;
  const reviews     = p.reviewCount ?? 0;
  const title       = p.name        ?? '';
  const image       = p.images?.[0]?.url ?? '/placeholder.png';
  const brandName   = p.brand?.name  ?? '';
  const slug        = p.slug         ?? p._id;

  return (
    <Link
      href={`/shop/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card card-hover"
    >
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
        <button
          className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-rose-500"
          aria-label="Save"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className={`flex flex-1 flex-col gap-1.5 p-3 ${compact ? "text-xs" : "text-sm"}`}>
        <h3 className="line-clamp-2 font-medium text-foreground group-hover:text-primary">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
          <span>({reviews.toLocaleString()})</span>
        </div>

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

        {brandName && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <BadgeCheck className="h-3 w-3 text-emerald-600" />
              {brandName}
            </span>
          </div>
        )}

        <button className="mt-1 flex items-center justify-center gap-1.5 rounded-md bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-600 hover:text-white">
          <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
        </button>
      </div>
    </Link>
  );
}

export { ProductCard };