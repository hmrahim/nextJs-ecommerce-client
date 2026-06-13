'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Package, Truck, Check, X, Eye, RotateCcw } from 'lucide-react';

const ORDERS = [
  { id: 'ORD-10001', date: 'Jun 08, 2026', status: 'Delivered', total: 12490, items: [{ name: 'Wireless Headphones', qty: 1, image: 'https://picsum.photos/seed/o1/120' }] },
  { id: 'ORD-10002', date: 'Jun 05, 2026', status: 'Shipped', total: 3299, items: [{ name: 'USB-C Cable 2m', qty: 2, image: 'https://picsum.photos/seed/o2/120' }] },
  { id: 'ORD-10003', date: 'May 28, 2026', status: 'Processing', total: 8750, items: [{ name: 'Smart Watch Series 9', qty: 1, image: 'https://picsum.photos/seed/o3/120' }] },
  { id: 'ORD-10004', date: 'May 20, 2026', status: 'Cancelled', total: 1499, items: [{ name: 'Phone Case Pro', qty: 1, image: 'https://picsum.photos/seed/o4/120' }] },
  { id: 'ORD-10005', date: 'May 12, 2026', status: 'Delivered', total: 22150, items: [{ name: '4K Monitor 27"', qty: 1, image: 'https://picsum.photos/seed/o5/120' }] },
];

const TABS = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_STYLES = {
  Delivered: 'bg-emerald-100 text-emerald-700',
  Shipped: 'bg-sky-100 text-sky-700',
  Processing: 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-rose-100 text-rose-700',
};

const STATUS_ICONS = { Delivered: Check, Shipped: Truck, Processing: Package, Cancelled: X };

export default function OrdersPage() {
  const [tab, setTab] = useState('All');
  const [q, setQ] = useState('');
  const list = ORDERS.filter((o) => (tab === 'All' || o.status === tab) && (q === '' || o.id.toLowerCase().includes(q.toLowerCase()) || o.items.some((i) => i.name.toLowerCase().includes(q.toLowerCase()))));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold">My Orders</h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by order ID or product" className="w-full rounded-lg border border-border pl-9 pr-3 py-2 text-sm" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === t ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t}</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <Package className="mx-auto w-12 h-12 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">No orders found</p>
          <p className="text-sm text-slate-500">Try a different filter or search term.</p>
          <Link href="/" className="mt-4 inline-block px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((o) => {
            const Icon = STATUS_ICONS[o.status] || Package;
            return (
              <div key={o.id} className="bg-white rounded-2xl border border-border p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <p className="font-bold">{o.id}</p>
                    <p className="text-xs text-slate-500">Placed {o.date}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[o.status]}`}>
                    <Icon className="w-3.5 h-3.5" /> {o.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 flex-1 min-w-[220px]">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100">
                        <Image src={it.image} alt={it.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm line-clamp-1">{it.name}</p>
                        <p className="text-xs text-slate-500">Qty {it.qty}</p>
                      </div>
                    </div>
                  ))}
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="font-bold text-emerald-700">৳{o.total.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/account/orders/${o.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50"><Eye className="w-3.5 h-3.5" /> View details</Link>
                  {o.status === 'Shipped' && <Link href={`/account/orders/${o.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50"><Truck className="w-3.5 h-3.5" /> Track</Link>}
                  {o.status === 'Delivered' && <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50"><RotateCcw className="w-3.5 h-3.5" /> Buy again</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
