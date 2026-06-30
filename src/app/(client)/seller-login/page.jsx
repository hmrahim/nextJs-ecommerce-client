'use client';
import Link from 'next/link';
import { Store, ShieldCheck, TrendingUp, Users } from 'lucide-react';

export default function SellerLogin() {
  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 flex flex-col justify-center p-12 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Store className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">Moom24 Seller Hub</span>
        </div>
        <h1 className="font-display text-4xl font-extrabold leading-tight">
          Your store, your rules — sell to millions.
        </h1>
        <p className="mt-4 text-emerald-100 max-w-sm">
          Access your seller dashboard to manage products, orders, payouts, and analytics all in one place.
        </p>
        <div className="mt-10 space-y-4">
          {[
            { icon: TrendingUp, t: 'Real-time analytics', d: 'Track sales, visits, and conversion rates live.' },
            { icon: ShieldCheck, t: 'Secure payouts', d: 'Weekly transfers to bKash, Nagad, or bank.' },
            { icon: Users, t: '8M+ buyers', d: 'Reach customers in all 64 districts.' },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <f.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-sm">{f.t}</div>
                <div className="text-emerald-200 text-xs">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-bold mb-1">Sign in to your seller account</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Not a seller yet?{' '}
            <Link href="/become-seller" className="text-emerald-600 hover:underline font-medium">
              Join for free
            </Link>
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email or Phone</label>
              <input className="mt-1 w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="you@email.com" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-emerald-600 hover:underline">Forgot password?</Link>
              </div>
              <input type="password" className="mt-1 w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="••••••••" />
            </div>
            <button className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700">
              Sign In
            </button>
          </div>

          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm">
            <div className="font-semibold text-amber-800">📢 New seller?</div>
            <p className="mt-1 text-amber-700">Complete our 5-minute onboarding and list your first product today.</p>
            <Link href="/become-seller" className="mt-2 inline-block font-semibold text-amber-700 hover:underline">
              Start selling →
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/seller-help" className="hover:underline">Seller Help</Link>
            {' · '}
            <Link href="/contact" className="hover:underline">Support</Link>
            {' · '}
            <Link href="/faq" className="hover:underline">FAQs</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
