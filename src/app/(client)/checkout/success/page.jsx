'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Mail, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const id = useSearchParams().get('id') ?? 'ORD-DEMO123';
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-lg p-8 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Order confirmed!</h1>
        <p className="mt-2 text-slate-600">Thanks for shopping with us. We've emailed your receipt.</p>
        <div className="mt-6 inline-flex items-center gap-2 bg-slate-50 border border-border rounded-full px-4 py-2 text-sm">
          <Package className="w-4 h-4 text-orange-500" />
          Order ID: <span className="font-mono font-bold">{id}</span>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl bg-slate-50 p-4">
            <Mail className="w-5 h-5 text-orange-500" />
            <p className="mt-2 text-sm font-semibold">Receipt sent</p>
            <p className="text-xs text-slate-500">Check your inbox</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <Package className="w-5 h-5 text-orange-500" />
            <p className="mt-2 text-sm font-semibold">Shipping update</p>
            <p className="text-xs text-slate-500">Tracking in 24h</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/account/orders/${id}`} className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-500">Track order <ArrowRight className="w-4 h-4" /></Link>
          <Link href="/shop" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-border font-semibold hover:bg-slate-50">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
