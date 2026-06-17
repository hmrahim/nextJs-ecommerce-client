'use client';
import { Gift, TrendingUp, ShoppingBag, Star, Award, Zap, Crown, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const HISTORY = [
  { id: 1, label: 'Order ORD-10001', date: 'Jun 09, 2026', points: +124, type: 'earn' },
  { id: 2, label: 'Birthday bonus', date: 'May 14, 2026', points: +200, type: 'earn' },
  { id: 3, label: 'Redeemed SAR 200 voucher', date: 'May 02, 2026', points: -400, type: 'redeem' },
  { id: 4, label: 'Order ORD-09823', date: 'Apr 28, 2026', points: +88, type: 'earn' },
  { id: 5, label: 'Product review bonus', date: 'Apr 20, 2026', points: +50, type: 'earn' },
];

const REWARDS = [
  { id: 1, title: 'SAR 100 off voucher', cost: 200, icon: Gift, color: 'from-emerald-500 to-emerald-700' },
  { id: 2, title: 'SAR 500 off voucher', cost: 900, icon: Gift, color: 'from-amber-500 to-orange-600' },
  { id: 3, title: 'Free shipping for a month', cost: 1500, icon: Zap, color: 'from-sky-500 to-blue-700' },
  { id: 4, title: 'SAR 1,000 cashback', cost: 1800, icon: Award, color: 'from-rose-500 to-pink-700' },
];

const TIERS = [
  { name: 'Silver', min: 0, color: 'bg-slate-400' },
  { name: 'Gold', min: 500, color: 'bg-amber-500', current: true },
  { name: 'Platinum', min: 2000, color: 'bg-violet-500' },
];

export default function RewardsPage() {
  const points = 1240;
  const nextTier = 2000;
  const progress = Math.min(100, (points / nextTier) * 100);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">
              <Crown className="w-3.5 h-3.5" /> GOLD MEMBER
            </div>
            <p className="mt-3 font-display text-4xl font-bold">{points.toLocaleString()} pts</p>
            <p className="text-sm opacity-90 mt-1">{(nextTier - points).toLocaleString()} points to Platinum</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider opacity-80">Lifetime spent</p>
            <p className="text-2xl font-bold">SAR 48,200</p>
          </div>
        </div>
        <div className="relative mt-5">
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-2 bg-white rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs font-semibold">
            {TIERS.map((t) => (
              <span key={t.name} className={t.current ? 'opacity-100' : 'opacity-70'}>{t.name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { i: TrendingUp, l: 'Earned this year', v: '892' },
          { i: ShoppingBag, l: 'From orders', v: '740' },
          { i: Star, l: 'From reviews', v: '152' },
          { i: Gift, l: 'Redeemed', v: '400' },
        ].map((s) => (
          <div key={s.l} className="bg-white rounded-2xl border border-border p-4">
            <s.i className="w-5 h-5 text-orange-500" />
            <p className="mt-2 font-display text-xl font-bold">{s.v}</p>
            <p className="text-xs text-slate-500">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-lg">Redeem rewards</h2>
          <p className="text-xs text-slate-500">Use points for vouchers, perks and more</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          {REWARDS.map((r) => {
            const can = points >= r.cost;
            return (
              <div key={r.id} className={`rounded-xl border border-border p-4 flex flex-col ${can ? '' : 'opacity-60'}`}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${r.color} text-white grid place-items-center`}>
                  <r.icon className="w-5 h-5" />
                </div>
                <p className="mt-3 font-semibold text-sm flex-1">{r.title}</p>
                <p className="text-xs text-slate-500 mt-1">{r.cost.toLocaleString()} pts</p>
                <button
                  disabled={!can}
                  onClick={() => toast.success(`Redeemed: ${r.title}`)}
                  className={`mt-3 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${can ? 'bg-slate-900 text-white hover:bg-orange-500' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  {can ? <>Redeem <ArrowRight className="w-3 h-3" /></> : 'Not enough'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-bold text-lg">Points history</h2>
        </div>
        <ul className="divide-y divide-border">
          {HISTORY.map((h) => (
            <li key={h.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{h.label}</p>
                <p className="text-xs text-slate-500">{h.date}</p>
              </div>
              <span className={`font-bold ${h.type === 'earn' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {h.points > 0 ? '+' : ''}{h.points} pts
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
