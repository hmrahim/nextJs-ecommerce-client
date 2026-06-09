'use client';
import { useCartStore } from '@/store/cartStore';
import CartItem from './CartItem';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CartSummary() {
  const { items, subtotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
        <Link href="/shop" className="text-orange-500 hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2 space-y-4">
        {items.map((item) => <CartItem key={item.key} item={item} />)}
      </div>
      <div className="bg-gray-50 rounded-xl p-6 h-fit">
        <h2 className="font-bold text-lg mb-4">Order Summary</h2>
        <div className="flex justify-between mb-2 text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        <div className="flex justify-between mb-4 text-sm"><span>Shipping</span><span className="text-green-500">Free</span></div>
        <div className="flex justify-between font-bold border-t pt-4"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
        <Link href="/checkout" className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg mt-4 font-medium hover:bg-gray-700 transition-colors">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
