'use client';
import { useState } from 'react';
import { Ticket, Copy, Clock, Check, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const VOUCHERS = [
  { id: 1, code: 'WELCOME20', title: '20% off your next order', desc: 'Min order ৳1,500 · One per user', expires: 'Jul 15, 2026', type: 'active', value: '20%', color: 'from-emerald-500 to-emerald-700' },
  { id: 2, code: 'FREESHIP', title: 'Free shipping nationwide', desc: 'No minimum order', expires: 'Jun 30, 2026', type: 'active', value: 'FREE', color: 'from-sky-500 to-blue-700' },
  { id: 3, code: 'GOLD500', title: '৳500 off for Gold members', desc: 'Min order ৳5,000', expires: 'Aug 01, 2026', type: 'active', value: '৳500', color: 'from-amber-500 to-orange-600' },
  { id: 4, code: 'SUMMER10', title: '10% summer sale', desc: 'On selected categories', expires: 'May 31, 2026', type: 'expired', value: '10%', color: 'from-slate-400 to-slate-600' },
  { id: 5, code: 'NEWYEAR', title: '৳200 new year bonus', desc: 'Used on ORD-09823', expires: 'Jan 31, 2026', type: 'used', value: '৳200', color: 'from-slate-400 to-slate-600' },
];

const TABS = [
  { id: 'active', label: 'Active', count: 3 },
  { id: 'used', label: 'Used', count: 1 },
  { id: 'expired', label: 'Expired', count: 1 },
];

export default function VouchersPage() {
  const [tab, setTab] = useState('active');
  const [code, setCode] = useState('');
  const list = VOUCHERS.filter((v) => v.type === tab);

  const copy = (c) => {
    navigator.clipboard?.writeText(c);
    toast.success(`Copied ${c}`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-5">
        <h1 className="text-xl font-bold">Vouchers & Coupons</h1>
        <p className="text-xs text-slate-500 mt-0.5">Apply codes at checkout to save on your order.</p>
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter promo code" className="w-full rounded-lg border border-border pl-9 pr-3 py-2.5 text-sm font-mono" />
          </div>
          <button onClick={() => { if (code) { toast.success(`${code} added to your wallet`); setCode(''); } }} className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-orange-500">Redeem</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-2 inline-flex">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${tab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t.label} <span className="ml-1 text-xs opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <Ticket className="mx-auto w-12 h-12 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">No vouchers here yet</p>
          <p className="text-sm text-slate-500">Check back soon for new offers and deals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((v) => (
            <div key={v.id} className={`relative flex overflow-hidden rounded-2xl border border-border bg-white ${v.type !== 'active' ? 'opacity-60' : ''}`}>
              <div className={`w-28 flex flex-col items-center justify-center text-white bg-gradient-to-br ${v.color} p-4 relative`}>
                <Ticket className="w-6 h-6 mb-1 opacity-80" />
                <p className="font-display font-bold text-2xl leading-none">{v.value}</p>
                <p className="text-[10px] opacity-90 mt-1 uppercase tracking-wider">Off</p>
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-r-0" />
              </div>
              <div className="flex-1 p-4 border-l border-dashed border-slate-200">
                <p className="font-bold text-sm">{v.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{v.desc}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <code className="px-2 py-1 rounded-md bg-slate-100 text-xs font-bold tracking-wider">{v.code}</code>
                  {v.type === 'active' ? (
                    <button onClick={() => copy(v.code)} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"><Copy className="w-3 h-3" /> Copy</button>
                  ) : v.type === 'used' ? (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Check className="w-3 h-3" /> Used</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-rose-600"><Clock className="w-3 h-3" /> Expired</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Valid until {v.expires}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
