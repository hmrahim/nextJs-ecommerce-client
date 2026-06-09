'use client';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore();
  const price = item.variant?.price || item.product.price;

  return (
    <div className="flex gap-3">
      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        <Image src={item.product.images?.[0] || '/images/placeholder.png'} alt={item.product.name} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
        {item.variant && <p className="text-xs text-gray-400">{item.variant.name}</p>}
        <p className="text-sm font-bold mt-1">{formatPrice(price * item.quantity)}</p>
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="w-6 h-6 border rounded flex items-center justify-center text-sm">-</button>
          <span className="text-sm w-4 text-center">{item.quantity}</span>
          <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="w-6 h-6 border rounded flex items-center justify-center text-sm">+</button>
          <button onClick={() => removeItem(item.key)} className="ml-2 text-gray-400 hover:text-red-500 text-xs">Remove</button>
        </div>
      </div>
    </div>
  );
}
