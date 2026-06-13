'use client';
import { useState } from 'react';
import { Plus, CreditCard, Trash2, Star, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL = [
  { id: 1, brand: 'VISA', last4: '4242', name: 'Sarah Khan', exp: '08/28', default: true },
  { id: 2, brand: 'Mastercard', last4: '8910', name: 'Sarah Khan', exp: '12/27', default: false },
  { id: 3, brand: 'bKash', last4: '3456', name: '+880 1700-123456', exp: 'Mobile Wallet', default: false },
];

const BRAND_BG = {
  VISA: 'from-sky-600 to-indigo-700',
  Mastercard: 'from-rose-600 to-orange-600',
  bKash: 'from-pink-600 to-rose-700',
};

export default function PaymentMethodsPage() {
  const [items, setItems] = useState(INITIAL);
  const [open, setOpen] = useState(false);

  const remove = (id) => {
    setItems(items.filter((i) => i.id !== id));
    toast.success('Payment method removed');
  };
  const makeDefault = (id) => {
    setItems(items.map((i) => ({ ...i, default: i.id === id })));
    toast.success('Default updated');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Payment methods</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your saved cards and wallets for faster checkout.</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-orange-500">
          <Plus className="w-4 h-4" /> Add new
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((m) => (
          <div key={m.id} className="space-y-3">
            <div className={`relative h-44 rounded-2xl bg-gradient-to-br ${BRAND_BG[m.brand] || 'from-slate-700 to-slate-900'} text-white p-5 shadow-lg overflow-hidden`}>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
              <div className="relative flex items-center justify-between">
                <CreditCard className="w-8 h-8" />
                {m.default && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-white/20 backdrop-blur"><Star className="w-3 h-3" /> DEFAULT</span>}
              </div>
              <div className="relative mt-8 text-lg font-mono tracking-widest">•••• •••• •••• {m.last4}</div>
              <div className="relative mt-4 flex items-end justify-between text-xs">
                <div>
                  <p className="opacity-70 text-[10px] uppercase">Card holder</p>
                  <p className="font-semibold">{m.name}</p>
                </div>
                <div className="text-right">
                  <p className="opacity-70 text-[10px] uppercase">Expires</p>
                  <p className="font-semibold">{m.exp}</p>
                </div>
                <p className="absolute bottom-0 right-0 font-display font-bold text-base italic">{m.brand}</p>
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              {!m.default && <button onClick={() => makeDefault(m.id)} className="flex-1 px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 font-semibold">Make default</button>}
              <button onClick={() => remove(m.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-rose-600 hover:bg-rose-50 font-semibold">
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-emerald-900">Your payment info is secure</p>
          <p className="text-xs text-emerald-800 mt-0.5">We use industry-standard SSL encryption. We never store your full card number.</p>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg">Add payment method</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <label className="col-span-2">
                <span className="block mb-1 font-medium text-slate-700">Card number</span>
                <input placeholder="1234 5678 9012 3456" className="w-full rounded-lg border border-border px-3 py-2" />
              </label>
              <label className="col-span-2">
                <span className="block mb-1 font-medium text-slate-700">Cardholder name</span>
                <input className="w-full rounded-lg border border-border px-3 py-2" />
              </label>
              <label>
                <span className="block mb-1 font-medium text-slate-700">Expires</span>
                <input placeholder="MM/YY" className="w-full rounded-lg border border-border px-3 py-2" />
              </label>
              <label>
                <span className="block mb-1 font-medium text-slate-700">CVV</span>
                <input placeholder="123" className="w-full rounded-lg border border-border px-3 py-2" />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
              <button onClick={() => { setOpen(false); toast.success('Card added'); }} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold">Save card</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
