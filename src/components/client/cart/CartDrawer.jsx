'use client';
import { ShoppingCart, X, ArrowRight, Package, Truck, ShieldCheck } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import CartItem from './CartItem';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

/* ── tiny trust badge ── */
function TrustBadge({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
    </div>
  );
}

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore();
  const { items, subtotal, totalItems } = useCartStore();
  const drawerRef = useRef(null);

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeCart(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeCart]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  const savings = items.reduce((acc, i) => {
    const cp = i.product.comparePrice;
    const p = i.variant?.price ?? i.product.price;
    return acc + (cp && cp > p ? (cp - p) * i.quantity : 0);
  }, 0);

  return (
    <>
      {/* ── backdrop ── */}
      <div
        aria-hidden
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* ── drawer panel ── */}
      <aside
        ref={drawerRef}
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-background shadow-2xl
          transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)]
          ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* ── header ── */}
        <div className="flex items-center justify-between border-b border-border bg-header px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="h-5 w-5 text-header-foreground" />
            <h2 className="font-display text-base font-bold text-header-foreground">
              My Cart
              {totalItems > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-full p-1.5 text-header-foreground/70 hover:bg-white/10 hover:text-header-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── empty state ── */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="rounded-full bg-muted p-6">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Add items to get started</p>
            </div>
            <button
              onClick={closeCart}
              className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* ── free shipping banner ── */}
            <div className="border-b border-border bg-success/10 px-5 py-2.5">
              <p className="text-xs font-medium text-success flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" />
                Free delivery on orders above ৳500
              </p>
            </div>

            {/* ── items list ── */}
            <div className="flex-1 overflow-y-auto px-5 overscroll-contain">
              {items.map((item) => (
                <CartItem key={item.key} item={item} />
              ))}

              {/* trust badges */}
              <div className="grid grid-cols-3 gap-3 py-5 border-t border-border mt-2">
                <TrustBadge icon={Truck}        label="Free Delivery" />
                <TrustBadge icon={ShieldCheck}  label="Secure Payment" />
                <TrustBadge icon={Package}      label="Easy Returns" />
              </div>
            </div>

            {/* ── footer summary ── */}
            <div className="border-t border-border bg-card px-5 pb-6 pt-4 space-y-3">
              {/* savings callout */}
              {savings > 0 && (
                <div className="rounded-lg bg-success/10 px-3 py-2 text-xs font-semibold text-success">
                  🎉 You're saving ৳{savings.toLocaleString()} on this order!
                </div>
              )}

              {/* price rows */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="font-medium text-success">Free</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary">৳{subtotal.toLocaleString()}</span>
                </div>
              </div>

              {/* CTA buttons */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground
                  hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-md shadow-primary/25"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/cart"
                onClick={closeCart}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white py-3 text-sm font-semibold text-foreground
                  hover:bg-muted transition-colors"
              >
                View Full Cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
