'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Bell, Package, Tag, Heart, MessageSquare, Gift, CheckCheck, Trash2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const ICON_MAP = { order: Package, promo: Tag, wishlist: Heart, message: MessageSquare, reward: Gift, system: Bell };
const COLOR_MAP = {
  order: 'bg-sky-100 text-sky-700',
  promo: 'bg-amber-100 text-amber-700',
  wishlist: 'bg-rose-100 text-rose-700',
  message: 'bg-violet-100 text-violet-700',
  reward: 'bg-emerald-100 text-emerald-700',
  system: 'bg-slate-100 text-slate-700',
};

const INITIAL = [
  { id: 1, type: 'order', title: 'Your order is out for delivery', body: 'ORD-10002 will arrive by 6 PM today.', time: '10 min ago', unread: true, href: '/account/orders/ORD-10002' },
  { id: 2, type: 'promo', title: '20% off ends tonight', body: 'Use code WELCOME20 before midnight.', time: '2 hours ago', unread: true, href: '/account/vouchers' },
  { id: 3, type: 'reward', title: 'You earned 124 points', body: 'For completing order ORD-10001.', time: '1 day ago', unread: true, href: '/account/rewards' },
  { id: 4, type: 'wishlist', title: 'Price drop on Smart Watch Series 9', body: 'Now ৳8,750 (was ৳9,990).', time: '2 days ago', unread: false, href: '/account/wishlist' },
  { id: 5, type: 'message', title: 'Support replied to your ticket', body: 'Re: Refund for ORD-09823 — please review.', time: '3 days ago', unread: false, href: '#' },
  { id: 6, type: 'order', title: 'Your order was delivered', body: 'ORD-10001 was delivered. Tap to review.', time: '4 days ago', unread: false, href: '/account/orders/ORD-10001' },
  { id: 7, type: 'system', title: 'New device sign-in', body: 'Chrome on Windows · Dhaka, BD', time: '1 week ago', unread: false, href: '/account/settings' },
];

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'order', label: 'Orders' },
  { id: 'promo', label: 'Promotions' },
  { id: 'reward', label: 'Rewards' },
];

export default function NotificationsPage() {
  const [items, setItems] = useState(INITIAL);
  const [tab, setTab] = useState('all');

  const list = items.filter((n) => tab === 'all' ? true : tab === 'unread' ? n.unread : n.type === tab);
  const unread = items.filter((n) => n.unread).length;

  const markAll = () => {
    setItems(items.map((n) => ({ ...n, unread: false })));
    toast.success('All marked as read');
  };
  const toggle = (id) => setItems(items.map((n) => n.id === id ? { ...n, unread: !n.unread } : n));
  const remove = (id) => setItems(items.filter((n) => n.id !== id));
  const clearAll = () => { setItems([]); toast.success('Notifications cleared'); };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              Notifications
              {unread > 0 && <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-orange-500 text-white text-xs font-bold">{unread}</span>}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Stay up to date with orders, offers and rewards.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={markAll} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50"><CheckCheck className="w-3.5 h-3.5" /> Mark all read</button>
            <Link href="/account/settings" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50"><Settings className="w-3.5 h-3.5" /> Preferences</Link>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t.label}</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <Bell className="mx-auto w-12 h-12 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">You're all caught up</p>
          <p className="text-sm text-slate-500">No notifications in this view.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border divide-y divide-border">
          {list.map((n) => {
            const Icon = ICON_MAP[n.type] || Bell;
            return (
              <div key={n.id} className={`group flex items-start gap-3 p-4 ${n.unread ? 'bg-orange-50/40' : ''}`}>
                <div className={`w-10 h-10 rounded-full grid place-items-center flex-shrink-0 ${COLOR_MAP[n.type]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <Link href={n.href} onClick={() => n.unread && toggle(n.id)} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{n.title}</p>
                    {n.unread && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{n.body}</p>
                  <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                </Link>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => toggle(n.id)} title="Toggle read" className="p-2 rounded-lg hover:bg-slate-100"><CheckCheck className="w-4 h-4 text-slate-500" /></button>
                  <button onClick={() => remove(n.id)} title="Delete" className="p-2 rounded-lg hover:bg-rose-50"><Trash2 className="w-4 h-4 text-rose-500" /></button>
                </div>
              </div>
            );
          })}
          <div className="p-3 text-center">
            <button onClick={clearAll} className="text-xs font-semibold text-rose-600 hover:underline">Clear all notifications</button>
          </div>
        </div>
      )}
    </div>
  );
}
