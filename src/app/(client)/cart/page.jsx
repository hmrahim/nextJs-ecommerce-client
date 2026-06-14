'use client';
/**
 * 📁 src/app/(client)/cart/page.jsx
 *
 * Cart page — real cart data + backend coupon validation.
 * Applied coupon persists to checkout via useCouponStore (sessionStorage).
 */

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Trash2, Plus, Minus, Truck, Tag,
  ShieldCheck, ShoppingBag, Loader2,
  X, CheckCircle2,
} from 'lucide-react';

import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from '@/hooks/useCart';
import { useCouponStore } from '@/store/couponStore';

const FREE_SHIP_THRESHOLD = 999;

/* ─────────────────────────────────────────────────────────────── */
/*  Coupon Box — hits the real backend                            */
/* ─────────────────────────────────────────────────────────────── */
function CouponBox({ subtotal, items }) {
  const { coupon, loading, error, applyCoupon, removeCoupon, clearError } =
    useCouponStore();
  const [code, setCode] = useState('');

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    const result = await applyCoupon(code, subtotal, items);
    if (result.ok) setCode('');
  };

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
        <span className="flex items-center gap-2 font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          {coupon.code} — {coupon.label}
          {coupon.discount > 0 && (
            <span className="text-xs font-bold text-emerald-600">
              (-৳{coupon.discount.toLocaleString()})
            </span>
          )}
        </span>
        <button
          onClick={removeCoupon}
          aria-label="Remove coupon"
          className="text-emerald-700 hover:text-rose-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="space-y-1">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); clearError(); }}
          placeholder="Coupon code লিখুন"
          className="flex-1 rounded-md border border-border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
        </button>
      </div>
      {error && (
        <p className="ml-6 text-xs text-rose-600">{error}</p>
      )}
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Main Page                                                      */
/* ─────────────────────────────────────────────────────────────── */
export default function CartPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart  = useClearCart();

  const { coupon } = useCouponStore();

  const items    = data?.items    ?? [];
  const subtotal = data?.subtotal ?? 0;

  /* ── Selection (for "remove selected") ── */
  const [selected, setSelected] = useState(() => new Set());
  const allKeys      = useMemo(() => items.map((i) => i.key), [items]);
  const allSelected  = items.length > 0 && selected.size === items.length;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(allKeys));
  const toggleOne = (key) => {
    const next = new Set(selected);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelected(next);
  };

  const selectedItems    = items.filter((i) => selected.has(i.key));
  const selectedSubtotal = selectedItems.length
    ? selectedItems.reduce((s, i) => s + i.lineTotal, 0)
    : subtotal;

  const removeSelected = async () => {
    if (!selected.size) return;
    for (const it of selectedItems) {
      await removeItem.mutateAsync({ productId: it.productId, variantSku: it.variantSku });
    }
    setSelected(new Set());
  };

  /* ── Totals ── */
  const discount = coupon?.discount ?? 0;
  const freeShip = coupon?.type === 'shipping' || selectedSubtotal >= FREE_SHIP_THRESHOLD;
  const shipping  = freeShip ? 0 : selectedSubtotal > 0 ? 60 : 0;
  const total     = Math.max(0, selectedSubtotal + shipping - discount);
  const remainingForFreeShip = Math.max(0, FREE_SHIP_THRESHOLD - selectedSubtotal);

  /* ── States ── */
  if (isLoading) {
    return (
      <div className="container-x py-20 flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        Cart লোড হচ্ছে…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container-x py-16 text-center">
        <p className="text-rose-600 font-medium">
          {error?.response?.data?.message || 'Cart লোড করা যায়নি।'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container-x py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-50">
            <ShoppingBag className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="font-display text-2xl font-bold">Cart খালি আছে</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            কিছু product add করুন।
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-lg bg-amber-400 px-6 py-3 font-bold text-emerald-950 hover:bg-amber-300"
          >
            Shopping শুরু করুন →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-6">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>{' '}
        / <span className="text-foreground">Shopping Cart</span>
      </nav>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">
          Shopping Cart{' '}
          <span className="text-muted-foreground text-base font-normal">
            ({data?.itemCount ?? items.length} items)
          </span>
        </h1>
        <button
          onClick={() => { if (window.confirm('Cart clear করবেন?')) clearCart.mutate(); }}
          disabled={clearCart.isPending}
          className="text-xs font-semibold text-rose-600 hover:underline disabled:opacity-50"
        >
          Clear cart
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── Items column ── */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* select-all header */}
            <div className="flex items-center gap-3 border-b border-border bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="accent-emerald-600"
              />
              সব select করুন ({items.length} items)
              <button
                onClick={removeSelected}
                disabled={!selected.size || removeItem.isPending}
                className="ml-auto text-xs text-rose-600 hover:underline disabled:opacity-40"
              >
                {removeItem.isPending
                  ? 'মুছছে…'
                  : `Remove Selected${selected.size ? ` (${selected.size})` : ''}`}
              </button>
            </div>

            {/* items */}
            {items.map((it) => {
              const isUpdating =
                (updateItem.isPending &&
                  updateItem.variables?.productId === it.productId &&
                  updateItem.variables?.variantSku === it.variantSku) ||
                (removeItem.isPending &&
                  removeItem.variables?.productId === it.productId &&
                  removeItem.variables?.variantSku === it.variantSku);

              const dec = () =>
                updateItem.mutate({
                  productId: it.productId,
                  variantSku: it.variantSku,
                  quantity: Math.max(1, it.quantity - 1),
                });
              const inc = () =>
                updateItem.mutate({
                  productId: it.productId,
                  variantSku: it.variantSku,
                  quantity: it.quantity + 1,
                });

              return (
                <div
                  key={it.key}
                  className={`flex flex-wrap gap-4 border-b border-border p-4 last:border-b-0 transition-opacity ${
                    isUpdating ? 'opacity-60' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(it.key)}
                    onChange={() => toggleOne(it.key)}
                    className="mt-2 accent-emerald-600"
                  />
                  <Link
                    href={it.product.slug ? `/product/${it.product.slug}` : `/product/${it.productId}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={it.product.image || '/placeholder.png'}
                      className="h-16 w-16 sm:h-24 sm:w-24 rounded-lg object-cover bg-muted"
                      alt={it.product.name}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={it.product.slug ? `/product/${it.product.slug}` : `/product/${it.productId}`}
                      className="font-medium hover:text-primary line-clamp-2"
                    >
                      {it.product.name}
                    </Link>

                    {it.variant?.attrs && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {Object.entries(it.variant.attrs)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-emerald-700">
                        ৳{it.price.toLocaleString()}
                      </span>
                      {it.originalPrice && it.originalPrice !== it.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          ৳{it.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {!it.inStock && (
                      <div className="mt-1 text-xs font-semibold text-rose-600">
                        মাত্র {it.stock}টি বাকি — পরিমাণ adjust করা হয়েছে
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end justify-between gap-2">
                    <button
                      onClick={() =>
                        removeItem.mutate({ productId: it.productId, variantSku: it.variantSku })
                      }
                      disabled={removeItem.isPending}
                      aria-label="Remove item"
                      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="flex items-center rounded-md border border-border">
                      <button
                        onClick={dec}
                        disabled={isUpdating || it.quantity <= 1}
                        className="grid h-8 w-8 place-items-center hover:bg-emerald-50 disabled:opacity-40"
                        aria-label="কমান"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">
                        {it.quantity}
                      </span>
                      <button
                        onClick={inc}
                        disabled={isUpdating || (it.stock !== undefined && it.quantity >= it.stock)}
                        className="grid h-8 w-8 place-items-center hover:bg-emerald-50 disabled:opacity-40"
                        aria-label="বাড়ান"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      মোট: <b className="text-foreground">৳{it.lineTotal.toLocaleString()}</b>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* free-ship progress */}
          <div className="rounded-xl border border-border bg-emerald-50 p-4 text-sm">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-emerald-700" />
              {remainingForFreeShip > 0 ? (
                <span>
                  আরও <b>৳{remainingForFreeShip.toLocaleString()}</b> কিনলে{' '}
                  <b>FREE ডেলিভারি</b> পাবেন! 🎉
                </span>
              ) : (
                <span className="font-semibold text-emerald-800">
                  আপনি FREE ডেলিভারি পেয়েছেন! 🎉
                </span>
              )}
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${Math.min(100, (selectedSubtotal / FREE_SHIP_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Summary column ── */}
        <aside className="space-y-4 lg:sticky lg:top-32 h-fit">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display text-lg font-bold mb-4">Order Summary</h3>

            {/* Coupon box */}
            <div className="mb-4">
              <CouponBox subtotal={selectedSubtotal} items={items} />
            </div>

            {/* Breakdown */}
            <div className="space-y-2 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal {selectedItems.length ? `(${selectedItems.length} selected)` : ''}
                </span>
                <span>৳{selectedSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shipping === 0 ? 'text-emerald-700 font-semibold' : ''}>
                  {shipping === 0 ? 'FREE' : `৳${shipping}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Coupon ({coupon?.code})
                  </span>
                  <span className="text-emerald-700 font-semibold">
                    -৳{discount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-3 text-lg font-bold">
                <span>Total</span>
                <span className="text-emerald-700">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {discount > 0 && (
              <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                🎉 আপনি ৳{discount.toLocaleString()} সাশ্রয় করছেন!
              </div>
            )}

            <Link
              href="/checkout"
              className="mt-4 block w-full rounded-lg bg-amber-400 py-3 text-center font-bold text-emerald-950 hover:bg-amber-300 transition-colors"
            >
              Checkout করুন →
            </Link>
            <Link
              href="/shop"
              className="mt-2 block w-full rounded-lg border border-border py-3 text-center text-sm font-semibold hover:bg-emerald-50 transition-colors"
            >
              Shopping চালিয়ে যান
            </Link>

            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure SSL Checkout
            </div>
            {isFetching && (
              <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Syncing…
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
