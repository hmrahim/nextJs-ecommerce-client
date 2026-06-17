// 📁 PATH: components/client/search/SearchResultCard.jsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

/**
 * ✅ FIX: Link target '/products/${slug}' was — your actual route '/product/[id]'.
 *         id If not available slug fallback has been done।
 */
export default function SearchResultCard({ product }) {
  const {
    _id,
    name,
    slug,
    images,
    price,
    comparePrice,
    avgRating,
    reviewCount,
    category,
    inStock = true,
  } = product;

  const thumbnail = images?.[0]?.url ?? '/images/placeholder.png';
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPct = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const href = `/product/${_id ?? slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={thumbnail}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            -{discountPct}%
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-semibold bg-black/60 px-2 py-1 rounded">
              Stock isn't
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-3 gap-1.5">
        {category?.name && (
          <span className="text-xs text-violet-600 font-medium truncate">
            {category.name}
          </span>
        )}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {name}
        </h3>

        {reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-600">
              {Number(avgRating ?? 0).toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}

        <div className="mt-auto pt-1 flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900">SAR {price}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">SAR {comparePrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
