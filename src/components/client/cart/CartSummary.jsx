'use client';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Truck, Package, Tag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import CartItem from './CartItem';
import Link from 'next/link';
import { useState } from 'react';

/* ── coupon input ── */
function CouponBox() {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(false);

  const apply = () => {
    if (code.trim()) setApplied(true);
  };

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Tag className="h-4 w-4 text-primary" />
        Apply Coupon
      </h3>
      {applied ? (
        <div className="flex items-center justify-between rounded-lg bg-success/10 px-3 py-2">
          <span className="text-sm font-semibold text-success">"{code}" applied!</span>
          <button onClick={() => { setApplied(false); setCode(''); }} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
          />
          <button
            onClick={apply}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

/* ── order summary sidebar ── */
function OrderSummary({ items, subtotal, totalItems }) {
  const savings = items.reduce((acc, i) => {
    const cp = i.product.comparePrice;
    const p = i.variant?.price ?? i.product.price;
    return acc + (cp && cp > p ? (cp - p) * i.quantity : 0);
  }, 0);

  return (
    <div className="space-y-4">
      {/* price breakdown */}
      <div className="rounded-xl border border-border bg-white p-5 space-y-3">
        <h2 className="font-display text-base font-bold text-foreground border-b border-border pb-3">
          Order Summary
        </h2>

        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Price ({totalItems} items)</span>
            <span>৳{subtotal.toLocaleString()}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>-৳{savings.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery</span>
            <span className="font-medium text-success">Free</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between text-base font-bold text-foreground">
            <span>Total Amount</span>
            <span className="text-primary">৳{subtotal.toLocaleString()}</span>
          </div>
        </div>

        {savings > 0 && (
          <div className="rounded-lg bg-success/10 px-3 py-2 text-xs font-semibold text-success">
            🎉 You save ৳{savings.toLocaleString()} on this order!
          </div>
        )}

        <Link
          href="/checkout"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground
            hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-md shadow-primary/25"
        >
          Proceed to Checkout
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="text-center text-[11px] text-muted-foreground">
          Secure checkout with 256-bit SSL encryption
        </p>
      </div>

      {/* trust badges */}
      <div className="rounded-xl border border-border bg-white p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Why shop with us
        </h3>
        <div className="space-y-3">
          {[
            { icon: Truck,       title: 'Free Delivery',     sub: 'On orders above ৳500'     },
            { icon: ShieldCheck, title: 'Secure Payment',    sub: '100% safe & encrypted'    },
            { icon: Package,     title: 'Easy Returns',      sub: '7-day hassle-free return'  },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── main export ── */
export default function CartSummary() {
  const { items, subtotal, totalItems, clearCart } = useCartStore();

  /* ── empty state ── */
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <div className="rounded-full bg-muted p-8">
          <ShoppingCart className="h-14 w-14 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added anything yet.</p>
        </div>
        <Link
          href="/shop"
          className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Start Shopping <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      {/* ── left: items ── */}
      <div className="space-y-4">
        {/* cart header */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4">
          <h1 className="font-display text-xl font-bold text-foreground">
            Shopping Cart
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          </h1>
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear cart
          </button>
        </div>

        {/* items */}
        <div className="rounded-xl border border-border bg-white px-5">
          {items.map((item) => (
            <CartItem key={item.key} item={item} />
          ))}
        </div>

        {/* coupon */}
        <CouponBox />
      </div>

      {/* ── right: summary ── */}
      <div className="lg:sticky lg:top-24 h-fit">
        <OrderSummary items={items} subtotal={subtotal} totalItems={totalItems} />
      </div>
    </div>
  );
}
