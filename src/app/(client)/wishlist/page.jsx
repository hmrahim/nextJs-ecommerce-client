"use client";
/**
 * 📁 src/app/(client)/wishlist/page.jsx
 *
 * Full wishlist page — Amazon / Noon style:
 *  • Live data from API via useWishlist()
 *  • Remove individual items
 *  • Move all to cart
 *  • Clear wishlist
 *  • Empty state with CTA
 *  • Loading skeleton
 */

import Link from "next/link";
import { Heart, Trash2, ShoppingCart, ArrowRight, PackageSearch } from "lucide-react";
import {
  useWishlist,
  useClearWishlist,
  useMoveAllToCart,
  useToggleWishlist,
} from "@/hooks/useWishlist";
import { useAddToCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/* ── Skeleton card ───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-card overflow-hidden">
      <div className="aspect-square bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-8 bg-muted rounded mt-2" />
      </div>
    </div>
  );
}

/* ── Single wishlist item card ───────────────────────────────── */
function WishlistCard({ item }) {
  const p = item.product;
  const price        = p.price        ?? 0;
  const comparePrice = p.comparePrice ?? null;
  const discount     =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  const image     = p.images?.[0]?.url ?? '/placeholder.png';
  const brandName = p.brand?.name ?? '';

  const toggleWishlist = useToggleWishlist();
  const addToCart      = useAddToCart();

  const handleRemove = () => toggleWishlist.mutate(p);

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({
        product: { _id: p._id, id: p._id, name: p.name, price: p.price, images: p.images, slug: p.slug, brand: p.brand },
        quantity: 1,
        variant: null,
      });
    } catch { /* toast shown by hook */ }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-md">
      {/* Remove button */}
      <button
        onClick={handleRemove}
        disabled={toggleWishlist.isPending}
        className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-muted-foreground
          hover:bg-rose-50 hover:text-rose-500 transition disabled:opacity-50"
        aria-label="Remove from wishlist"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {/* Discount badge */}
      {discount > 0 && (
        <span className="absolute left-2 top-2 z-10 sale-badge">-{discount}%</span>
      )}

      {/* Image */}
      <Link href={`/shop/${p.slug}`} className="block aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 text-sm">
        <Link href={`/shop/${p.slug}`} className="line-clamp-2 font-medium text-foreground hover:text-primary">
          {p.name}
        </Link>

        {brandName && (
          <p className="text-[11px] text-muted-foreground">{brandName}</p>
        )}

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-bold text-primary">SAR {price.toLocaleString()}</span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-muted-foreground line-through">
              SAR {comparePrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock badge */}
        {!p.inStock && (
          <span className="text-xs font-medium text-rose-500">Out of Stock</span>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={addToCart.isPending || !p.inStock}
          className="mt-1 flex items-center justify-center gap-1.5 rounded-md bg-emerald-50 py-1.5 text-xs
            font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white disabled:opacity-50"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-rose-50">
        <PackageSearch className="h-10 w-10 text-rose-400" />
      </div>
      <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
      <p className="max-w-sm text-muted-foreground text-sm">
        Save items you love by clicking the heart icon on any product.
      </p>
      <Link
        href="/shop"
        className="mt-2 flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition"
      >
        Browse Products <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: wishlist, isLoading } = useWishlist();
  const clearWishlist  = useClearWishlist();
  const moveAllToCart  = useMoveAllToCart();

  /* Redirect guests */
  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const items = wishlist?.items || [];

  return (
    <div className="container-x py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        {' / '}
        <span className="text-foreground">Wishlist</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
          <Heart className="h-7 w-7 fill-rose-500 text-rose-500" />
          My Wishlist
          {items.length > 0 && (
            <span className="ml-1 text-lg font-normal text-muted-foreground">
              ({items.length})
            </span>
          )}
        </h1>

        {items.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => moveAllToCart.mutate()}
              disabled={moveAllToCart.isPending}
              className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold
                hover:bg-emerald-50 hover:text-emerald-700 transition disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              {moveAllToCart.isPending ? 'Moving…' : 'Move All to Cart'}
            </button>
            <button
              onClick={() => clearWishlist.mutate()}
              disabled={clearWishlist.isPending}
              className="flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm font-semibold
                text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {clearWishlist.isPending ? 'Clearing…' : 'Clear'}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, idx) => (
            <WishlistCard key={String(item.product?._id || idx)} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
