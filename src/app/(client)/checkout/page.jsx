'use client';
/**
 * 📁 src/app/(client)/checkout/page.jsx
 *
 * Checkout page — real cart items + coupon discount from useCouponStore.
 * Coupon applied in /cart page automatically carries over here via sessionStorage.
 */

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard, Wallet, Banknote, Truck, ShieldCheck,
  MapPin, Loader2, CheckCircle2, X, Tag,
} from 'lucide-react';

import { useCart } from '@/hooks/useCart';
import { useCouponStore } from '@/store/couponStore';

const FREE_SHIP_THRESHOLD = 999;

/* ── Small helpers ── */
function Section({ title, icon, children }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, placeholder, full, type = 'text', ...rest }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <input
        type={type}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
        placeholder={placeholder || label}
        {...rest}
      />
    </div>
  );
}

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery',  sub: '3-5 business days', price: 0    },
  { id: 'express',  label: 'Express Delivery',    sub: '1-2 business days', price: 120  },
  { id: 'sameday',  label: 'Same-Day Delivery',   sub: 'Order before 12 PM', price: 200 },
];

const PAYMENT_OPTIONS = [
  { id: 'card',  icon: <CreditCard className="h-5 w-5" />, label: 'Credit / Debit Card' },
  { id: 'mfs',   icon: <Wallet     className="h-5 w-5" />, label: 'bKash / Nagad / Rocket' },
  { id: 'cod',   icon: <Banknote   className="h-5 w-5" />, label: 'Cash on Delivery' },
  { id: 'bank',  icon: '🏦',                               label: 'Bank Transfer' },
];

/* ─────────────────────────────────────────────────────────────── */
export default function CheckoutPage() {
  const router = useRouter();
  const { data, isLoading } = useCart();
  const { coupon, removeCoupon } = useCouponStore();

  const items    = data?.items    ?? [];
  const subtotal = data?.subtotal ?? 0;

  /* ── Local form state ── */
  const [delivery, setDelivery] = useState('standard');
  const [payment,  setPayment]  = useState('card');
  const [placing,  setPlacing]  = useState(false);

  const deliveryCost = DELIVERY_OPTIONS.find((d) => d.id === delivery)?.price ?? 0;

  /* ── Totals ── */
  const couponDiscount = coupon?.discount ?? 0;
  const freeShip       = coupon?.type === 'shipping' || subtotal >= FREE_SHIP_THRESHOLD;
  const shippingCost   = freeShip ? 0 : deliveryCost;
  const total          = Math.max(0, subtotal + shippingCost - couponDiscount);

  /* ── Place order (stub — wire to your orderService) ── */
  const handlePlaceOrder = async () => {
    setPlacing(true);
    // TODO: call orderService.create({ items, couponCode: coupon?.code, total, ... })
    await new Promise((r) => setTimeout(r, 1200)); // simulate API
    router.push('/checkout/success?id=ORD-' + Date.now());
  };

  if (isLoading) {
    return (
      <div className="container-x py-20 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        লোড হচ্ছে…
      </div>
    );
  }

  return (
    <div className="container-x py-6">
      {/* ── Breadcrumb / steps ── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-xl sm:text-3xl font-bold">Checkout</h1>
        <div className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-hide">
          {['Cart', 'Information', 'Payment', 'Confirm'].map((s, i) => (
            <div key={s} className="flex items-center gap-1 whitespace-nowrap">
              <div
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                  i <= 1 ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
              <span className={`hidden sm:inline ${i <= 1 ? 'font-semibold' : 'text-muted-foreground'}`}>
                {s}
              </span>
              {i < 3 && <span className="text-muted-foreground text-xs">›</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Left: form ── */}
        <div className="space-y-6">
          <Section title="Contact Information" icon="📧">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Email" placeholder="you@example.com" type="email" />
              <Field label="Phone" placeholder="+880 1XXX-XXXXXX" type="tel" />
            </div>
          </Section>

          <Section title="Shipping Address" icon={<MapPin className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First Name" />
              <Field label="Last Name" />
              <Field label="Address" full placeholder="House #, Road, Area" />
              <Field label="City" placeholder="Dhaka" />
              <Field label="Postal Code" placeholder="1207" />
              <Field label="Country" placeholder="Bangladesh" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['🏠 Home', '🏢 Office', '+ New Address'].map((lbl) => (
                <button
                  key={lbl}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-emerald-600 transition-colors first:border-2 first:border-emerald-600 first:bg-emerald-50 first:text-emerald-700"
                >
                  {lbl}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Delivery Method" icon={<Truck className="h-5 w-5" />}>
            <div className="space-y-2">
              {DELIVERY_OPTIONS.map((d) => (
                <label
                  key={d.id}
                  className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                    delivery === d.id
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-border hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value={d.id}
                      checked={delivery === d.id}
                      onChange={() => setDelivery(d.id)}
                      className="accent-emerald-600"
                    />
                    <div>
                      <div className="font-semibold text-sm">{d.label}</div>
                      <div className="text-xs text-muted-foreground">{d.sub}</div>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700">
                    {d.price === 0 ? 'FREE' : `৳${d.price}`}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          <Section title="Payment Method" icon={<CreditCard className="h-5 w-5" />}>
            <div className="grid gap-2 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    payment === p.id
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-border hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    value={p.id}
                    checked={payment === p.id}
                    onChange={() => setPayment(p.id)}
                    className="accent-emerald-600"
                  />
                  <span className="text-emerald-700">{p.icon}</span>
                  <span className="font-semibold text-sm">{p.label}</span>
                </label>
              ))}
            </div>

            {payment === 'card' && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Card Number" placeholder="1234 5678 9012 3456" full />
                <Field label="Expiry" placeholder="MM / YY" />
                <Field label="CVV" placeholder="•••" />
              </div>
            )}
          </Section>
        </div>

        {/* ── Right: order summary ── */}
        <aside className="space-y-4 lg:sticky lg:top-32 h-fit">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display text-lg font-bold mb-4">Your Order</h3>

            {/* Items */}
            <div className="space-y-3 border-b border-border pb-3 max-h-60 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Cart খালি।{' '}
                  <Link href="/cart" className="text-emerald-600 underline">
                    Cart এ যান
                  </Link>
                </p>
              ) : (
                items.map((it) => (
                  <div key={it.key} className="flex gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={it.product.image || '/placeholder.png'}
                        className="h-14 w-14 rounded-md object-cover bg-muted"
                        alt={it.product.name}
                      />
                      <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                        {it.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium line-clamp-2">{it.product.name}</div>
                      {it.variant?.attrs && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {Object.entries(it.variant.attrs).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold whitespace-nowrap text-emerald-700">
                      ৳{it.lineTotal.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Applied coupon chip */}
            {coupon && (
              <div className="mt-3 flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <Tag className="h-3.5 w-3.5" />
                  {coupon.code} — {coupon.label}
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-emerald-600 hover:text-rose-600 transition-colors"
                  aria-label="Remove coupon"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-2 py-3 text-sm border-t border-border mt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shippingCost === 0 ? 'text-emerald-700 font-semibold' : ''}>
                  {shippingCost === 0 ? 'FREE' : `৳${shippingCost}`}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coupon discount</span>
                  <span className="text-emerald-700 font-semibold">
                    -৳{couponDiscount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-3 text-lg font-bold">
                <span>Total</span>
                <span className="text-emerald-700">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {couponDiscount > 0 && (
              <div className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                🎉 Coupon এ ৳{couponDiscount.toLocaleString()} সাশ্রয়!
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={placing || items.length === 0}
              className="mt-2 w-full rounded-lg bg-amber-400 py-3 font-bold text-emerald-950 hover:bg-amber-300 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {placing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> অপেক্ষা করুন…</>
              ) : (
                'Order দিন →'
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> 256-bit SSL Encrypted
            </div>
          </div>

          {/* Back to cart */}
          <Link
            href="/cart"
            className="block w-full rounded-xl border border-border bg-card py-3 text-center text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            ← Cart এ ফিরে যান
          </Link>
        </aside>
      </div>
    </div>
  );
}
