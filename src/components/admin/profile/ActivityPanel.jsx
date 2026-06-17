// 📁 PATH: src/components/admin/profile/ActivityPanel.jsx
'use client';
import { useState, useEffect } from 'react';
import { profileService } from '@/services/profileService';

const ACTION_CONFIG = {
  login:         { label: 'Signed in',            color: 'bg-violet-500/15 text-violet-400', icon: '→' },
  logout:        { label: 'Signed out',            color: 'bg-slate-500/15 text-slate-400',  icon: '←' },
  order_placed:  { label: 'Order placed',          color: 'bg-sky-500/15 text-sky-400',      icon: '🛍' },
  order_updated: { label: 'Order updated',         color: 'bg-amber-500/15 text-amber-400',  icon: '↻' },
  profile_update:{ label: 'Profile updated',       color: 'bg-emerald-500/15 text-emerald-400', icon: '✎' },
  password_change:{ label: 'Password changed',     color: 'bg-red-500/15 text-red-400',      icon: '🔑' },
  address_add:   { label: 'Address added',         color: 'bg-teal-500/15 text-teal-400',    icon: '📍' },
  review_posted: { label: 'Review posted',         color: 'bg-yellow-500/15 text-yellow-400',icon: '★' },
  wishlist_add:  { label: 'Added to wishlist',     color: 'bg-pink-500/15 text-pink-400',    icon: '♡' },
  card_add:      { label: 'Card added',            color: 'bg-indigo-500/15 text-indigo-400',icon: '💳' },
};

const DUMMY_ACTIVITY = [
  { _id: '1', action: 'login',          description: 'Chrome on Windows · Riyadh, SA',      createdAt: new Date(Date.now() - 60*60*1000) },
  { _id: '2', action: 'order_placed',   description: 'Order #ORD-00874 · 3 items · SAR 2,450', createdAt: new Date(Date.now() - 26*60*60*1000) },
  { _id: '3', action: 'profile_update', description: 'Phone number changed',                 createdAt: new Date(Date.now() - 2*24*60*60*1000) },
  { _id: '4', action: 'wishlist_add',   description: 'Samsung Galaxy S25 Ultra',             createdAt: new Date(Date.now() - 3*24*60*60*1000) },
  { _id: '5', action: 'review_posted',  description: '5★ review on Anker USB-C Cable',       createdAt: new Date(Date.now() - 4*24*60*60*1000) },
  { _id: '6', action: 'password_change',description: 'Password changed successfully',        createdAt: new Date(Date.now() - 10*24*60*60*1000) },
  { _id: '7', action: 'address_add',    description: 'Office address — Panthapath, Dhaka',   createdAt: new Date(Date.now() - 15*24*60*60*1000) },
  { _id: '8', action: 'card_add',       description: 'Visa card ending in 4242',             createdAt: new Date(Date.now() - 20*24*60*60*1000) },
  { _id: '9', action: 'login',          description: 'Android App · Dhaka, BD',              createdAt: new Date(Date.now() - 22*24*60*60*1000) },
  { _id: '10',action: 'order_placed',   description: 'Order #ORD-00821 · 1 item · SAR 980',    createdAt: new Date(Date.now() - 30*24*60*60*1000) },
];

function timeAgo(date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hrs  < 24)  return `${hrs}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ActivityPanel() {
  const [activity, setActivity]   = useState(DUMMY_ACTIVITY);
  const [loading,  setLoading]    = useState(false);
  const [page,     setPage]       = useState(1);
  const [filter,   setFilter]     = useState('all');

  const filtered = filter === 'all' ? activity : activity.filter(a => a.action.startsWith(filter));

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all',     label: 'All' },
          { key: 'login',   label: 'Logins' },
          { key: 'order',   label: 'Orders' },
          { key: 'profile', label: 'Profile' },
          { key: 'password',label: 'Security' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors
              ${filter === f.key
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'border-[#1e1e2e] text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1e1e2e] bg-[#0f0f18]">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Recent activity
          </h3>
        </div>
        <div className="divide-y divide-[#1a1a28]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <div className="w-8 h-8 rounded-lg bg-[#1e1e2e] animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#1e1e2e] rounded animate-pulse w-48" />
                  <div className="h-2.5 bg-[#1e1e2e] rounded animate-pulse w-32" />
                </div>
                <div className="h-2.5 bg-[#1e1e2e] rounded animate-pulse w-16" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-600">
              <p className="text-sm">No activity found</p>
            </div>
          ) : (
            filtered.map(item => {
              const cfg = ACTION_CONFIG[item.action] || { label: item.action, color: 'bg-slate-500/15 text-slate-400', icon: '•' };
              return (
                <div key={item._id} className="flex items-start gap-3 px-5 py-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium">{cfg.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{item.description}</p>
                  </div>
                  <span className="text-slate-600 text-xs flex-shrink-0 mt-0.5">{timeAgo(item.createdAt)}</span>
                </div>
              );
            })
          )}
        </div>
        {filtered.length >= 10 && (
          <div className="px-5 py-3 border-t border-[#1e1e2e]">
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full py-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
