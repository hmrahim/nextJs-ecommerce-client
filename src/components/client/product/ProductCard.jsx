'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.images?.[0] || '/images/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.comparePrice > product.price && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Sale
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold">{formatPrice(product.price)}</span>
            {product.comparePrice > product.price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3 flex gap-2">
        <button
          onClick={() => addToCart(product)}
          className="flex-1 bg-gray-900 text-white text-xs py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Add to Cart
        </button>
        <button
          onClick={() => toggle(product)}
          aria-label="Wishlist"
          className="px-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          {isWishlisted(product.id) ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  );
}
