'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useAddToCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

export default function ProductGallery({ product }) {
  const [selected, setSelected] = useState(0);
  const addToCart = useAddToCart();

  return (
    <div className="grid grid-cols-2 gap-10">
      <div>
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
          <Image src={product.images?.[selected] || '/images/placeholder.png'} alt={product.name} fill className="object-cover" />
        </div>
        {product.images?.length > 1 && (
          <div className="flex gap-2 mt-3">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setSelected(i)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${i === selected ? 'border-emerald-600' : 'border-transparent'}`}>
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
          {product.comparePrice > product.price && (
            <span className="text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
        <p className="text-gray-600 mb-6">{product.description}</p>
        <button onClick={() => addToCart.mutateAsync({ product })}
          disabled={addToCart.isPending}
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
          {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}