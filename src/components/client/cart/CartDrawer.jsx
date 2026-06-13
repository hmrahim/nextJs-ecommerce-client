'use client';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import CartItem from './CartItem';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore();
  const { items, subtotal } = useCartStore();

  return (
    <>
      {cartOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={closeCart} />}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-lg">Cart ({items.length})</h2>
          <button onClick={closeCart} className="text-2xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0
            ? <p className="text-gray-400 text-center py-12">Your cart is empty</p>
            : items.map((item) => <CartItem key={item.key} item={item} />)
          }
        </div>
        {items.length > 0 && (
          <div className="p-4 border-t border-border">
            <div className="flex justify-between font-bold mb-4">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Link href="/checkout" onClick={closeCart} className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors">
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
