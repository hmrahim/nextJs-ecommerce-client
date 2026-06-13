'use client';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { toggleCart } = useUIStore();
  const { totalItems } = useCartStore();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">Moom24</Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/shop">Shop</Link>
          <Link href="/blog">Blog</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/search" aria-label="Search">🔍</Link>
          {user ? (
            <>
              <Link href="/account/orders">My Orders</Link>
              <button onClick={logout} className="text-sm text-gray-500">Logout</button>
            </>
          ) : (
            <Link href="/auth/login">Login</Link>
          )}
          <button onClick={toggleCart} className="relative" aria-label="Cart">
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
