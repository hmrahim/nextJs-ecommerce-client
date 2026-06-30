'use client';
import { useState } from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [tracked, setTracked] = useState(false);

  const handleTrack = () => {
    if (orderId.trim()) setTracked(true);
  };

  const STEPS = [
    { icon: CheckCircle, label: 'Order Placed', time: 'Mon, 23 Jun · 10:14 AM', done: true },
    { icon: Package, label: 'Packed & Ready', time: 'Mon, 23 Jun · 2:30 PM', done: true },
    { icon: Truck, label: 'Out for Delivery', time: 'Tue, 24 Jun · 9:00 AM', done: true },
    { icon: Clock, label: 'Delivered', time: 'Expected: Tue, 24 Jun', done: false },
  ];

  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-xl text-center mb-10">
        <h1 className="font-display text-4xl font-extrabold">Track Your Order</h1>
        <p className="mt-2 text-muted-foreground">Enter your order ID to get live delivery updates.</p>
      </div>

      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-3">
          <input
            className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500"
            placeholder="Order ID (e.g. MM-2024-00012345)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500"
            placeholder="Email address used for this order"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleTrack}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Track Order
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          You can also find your Order ID in your confirmation email or in{' '}
          <a href="/account/orders" className="text-emerald-600 hover:underline">My Orders</a>.
        </p>
      </div>

      {tracked && (
        <div className="mx-auto max-w-xl mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-muted-foreground">Order</div>
              <div className="font-display font-bold text-lg">{orderId || 'MM-2024-00012345'}</div>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Out for Delivery</span>
          </div>

          <div className="relative pl-8 space-y-6">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
            {STEPS.map((s, i) => (
              <div key={s.label} className="relative flex gap-4 items-start">
                <div className={`absolute -left-5 h-5 w-5 rounded-full flex items-center justify-center ${s.done ? 'bg-emerald-600 text-white' : 'border-2 border-border bg-background'}`}>
                  {s.done && <s.icon className="h-3 w-3" />}
                </div>
                <div>
                  <div className={`font-semibold text-sm ${s.done ? '' : 'text-muted-foreground'}`}>{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm">
            <div className="font-semibold text-emerald-800">Delivery Partner</div>
            <div className="text-muted-foreground">Steadfast Courier · Rider: Rahim (⭐ 4.9)</div>
            <div className="mt-2 text-emerald-700 font-medium">📞 Call Rider</div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-xl mt-10 text-center">
        <p className="text-sm text-muted-foreground">
          Having trouble?{' '}
          <a href="/help" className="text-emerald-600 hover:underline">Visit Help Center</a>{' '}
          or{' '}
          <a href="/contact" className="text-emerald-600 hover:underline">contact support</a>.
        </p>
      </div>
    </div>
  );
}
