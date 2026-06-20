'use client';
import Image from 'next/image';
import { Trash2, Plus, Minus, Heart, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useToggleWishlist, useWishlistIds } from '@/hooks/useWishlist';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();

  const price = item.variant?.price ?? item.product.price;
  const comparePrice = item.product.comparePrice;
  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;
  const image = item.product.images?.[0]?.url ?? '/placeholder.png';
  const slug = item.product.slug ?? item.product._id;

  /* ── Wishlist ──────────────────────────────────────────── */
  const wishlistIds = useWishlistIds();
  const toggleWishlist = useToggleWishlist();
  const productId = String(item.product._id || item.product.id);
  const isWishlisted = wishlistIds.has(productId);

  const handleSaveForLater = () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    if (toggleWishlist.isPending) return;
    toggleWishlist.mutate({
      _id: item.product._id,
      id: item.product._id,
      name: item.product.name,
      slug: item.product.slug,
      images: item.product.images,
      price: item.product.price,
      comparePrice: item.product.comparePrice,
      brand: item.product.brand,
      inStock: item.product.inStock,
    });
  };

  return (
    <div className="flex gap-4 py-5 border-b border-border last:border-0 group/item">
      {/* ── image ── */}
      <Link
        href={`/shop/${slug}`}
        className="relative shrink-0 h-24 w-24 rounded-xl overflow-hidden bg-muted border border-border"
      >
        <Image
          src={image}
          alt={item.product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover/item:scale-105"
        />
        {discount > 0 && (
          <span className="absolute top-1 left-1 text-[10px] font-bold bg-sale text-white px-1.5 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </Link>

      {/* ── details ── */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        {/* name */}
        <Link
          href={`/shop/${slug}`}
          className="text-sm font-semibold text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors"
        >
          {item.product.name}
        </Link>

        {/* variant */}
        {item.variant && (
          <p className="text-xs text-muted-foreground">
            {item.variant.name}
          </p>
        )}

        {/* price row */}
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-base font-bold text-primary">
            SAR {(price * item.quantity).toLocaleString()}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-muted-foreground line-through">
              SAR {(comparePrice * item.quantity).toLocaleString()}
            </span>
          )}
          {item.quantity > 1 && (
            <span className="text-xs text-muted-foreground">
              (SAR {price.toLocaleString()} each)
            </span>
          )}
        </div>

        {/* in stock */}
        <p className="text-[11px] font-medium text-success">✓ In Stock</p>

        {/* ── actions ── */}
        <div className="flex items-center gap-3 mt-2">
          {/* qty stepper */}
          <div className="flex items-center rounded-lg border border-border bg-white overflow-hidden">
            <button
              onClick={() => updateQuantity(item.key, item.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40"
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-9 text-center text-sm font-semibold select-none tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.key, item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* divider */}
          <span className="h-4 w-px bg-border" />

          {/* remove */}
          <button
            onClick={() => removeItem(item.key)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>

          {/* save for later / wishlist */}
          <button
            onClick={handleSaveForLater}
            disabled={toggleWishlist.isPending}
            className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-50
              ${isWishlisted ? 'text-rose-500 hover:text-rose-600' : 'text-muted-foreground hover:text-primary'}`}
          >
            {toggleWishlist.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            )}
            {isWishlisted ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}