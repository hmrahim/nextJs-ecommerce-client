'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Truck, Package, MapPin, Download, MessageSquare } from 'lucide-react';

export default function OrderDetailPage({ params }) {
  const id = params?.id ?? 'ORD-DEMO';
  const order = {
    id, status: 'Shipped', placedAt: 'Jun 8, 2026', eta: 'Jun 13, 2026',
    items: [
      { id: 1, name: 'Wireless Noise-Cancel Headphones', qty: 1, price: 299, image: 'https://picsum.photos/seed/oh1/200' },
      { id: 2, name: 'USB-C Charging Cable 2m', qty: 2, price: 14.99, image: 'https://picsum.photos/seed/oh2/200' },
    ],
    address: 'John Doe · 1234 Market St, San Francisco, CA 94103',
    payment: 'VISA •••• 4242',
    subtotal: 328.98, shipping: 0, tax: 26.32, total: 355.30,
  };
  const steps = ['Placed', 'Confirmed', 'Shipped', 'Out for delivery', 'Delivered'];
  const current = 2;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/account/orders" className="text-xs text-slate-500 hover:text-orange-600">← All orders</Link>
            <h1 className="mt-1 text-2xl font-bold">{order.id}</h1>
            <p className="text-sm text-slate-500">Placed {order.placedAt} · ETA {order.eta}</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-slate-50"><Download className="w-4 h-4" /> Invoice</button>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-slate-50"><MessageSquare className="w-4 h-4" /> Support</button>
          </div>
        </div>

        <ol className="mt-6 grid grid-cols-5 gap-2">
          {steps.map((s, i) => (
            <li key={s} className="text-center">
              <div className={`mx-auto w-9 h-9 rounded-full flex items-center justify-center ${i <= current ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {i < current ? <Check className="w-4 h-4" /> : i === current ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />}
              </div>
              <p className={`mt-2 text-[11px] font-medium ${i <= current ? 'text-slate-900' : 'text-slate-400'}`}>{s}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border divide-y divide-border">
          {order.items.map((i) => (
            <div key={i.id} className="p-4 flex items-center gap-4">
              <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden"><Image src={i.image} alt={i.name} fill className="object-cover" sizes="64px" /></div>
              <div className="flex-1 min-w-0"><p className="font-semibold line-clamp-1">{i.name}</p><p className="text-xs text-slate-500">Qty {i.qty}</p></div>
              <span className="font-bold">${(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-bold mb-3">Summary</h3>
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>${order.subtotal.toFixed(2)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd>{order.shipping === 0 ? 'Free' : `$${order.shipping}`}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Tax</dt><dd>${order.tax.toFixed(2)}</dd></div>
              <div className="flex justify-between border-t border-border pt-2 font-bold"><dt>Total</dt><dd>${order.total.toFixed(2)}</dd></div>
            </dl>
          </div>
          <div className="bg-white rounded-2xl border border-border p-5 text-sm">
            <h3 className="font-bold mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Ship to</h3>
            <p className="text-slate-600">{order.address}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-5 text-sm">
            <h3 className="font-bold mb-2">Payment</h3>
            <p className="text-slate-600">{order.payment}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
