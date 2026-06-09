// 📁 PATH: src/components/admin/profile/NotificationsPanel.jsx
'use client';
import { useState } from 'react';

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{ height: '22px' }}
      className={`relative inline-flex w-10 rounded-full border transition-colors flex-shrink-0
        ${on ? 'bg-violet-600 border-violet-500' : 'bg-[#1e1e2e] border-[#2a2a3e]'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
        ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

const NOTIF_GROUPS = [
  {
    title: 'Email notifications',
    items: [
      { key: 'emailOrders',   label: 'Order updates',       sub: 'Shipping, delivery, and tracking alerts' },
      { key: 'emailPromos',   label: 'Promotions & offers', sub: 'Sales, discount codes, and featured deals' },
      { key: 'emailReviews',  label: 'Review reminders',    sub: 'Prompt to review delivered items' },
      { key: 'emailSecurity', label: 'Security alerts',     sub: 'Login from new device or location' },
    ],
  },
  {
    title: 'Push notifications',
    items: [
      { key: 'pushFlash',   label: 'Flash sale alerts',    sub: 'Limited-time deals on your watchlist' },
      { key: 'pushSupport', label: 'Support replies',       sub: 'When support responds to your ticket' },
      { key: 'pushWishlist',label: 'Wishlist price drops',  sub: 'Notify when wishlist item goes on sale' },
    ],
  },
  {
    title: 'SMS notifications',
    items: [
      { key: 'smsOrders',   label: 'Order status SMS',     sub: 'Critical status changes only' },
      { key: 'smsOtp',      label: 'OTP & security codes', sub: 'Always on — cannot be disabled' },
    ],
  },
];

const DEFAULTS = {
  emailOrders: true, emailPromos: true, emailReviews: false, emailSecurity: true,
  pushFlash: true, pushSupport: false, pushWishlist: true,
  smsOrders: false, smsOtp: true,
};

export default function NotificationsPanel() {
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [saved, setSaved]  = useState(false);

  const toggle = (key) => {
    if (key === 'smsOtp') return; // always on
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => setSaved(true);

  return (
    <div className="space-y-4">
      {NOTIF_GROUPS.map(group => (
        <div key={group.title} className="rounded-xl border border-[#1e1e2e] bg-[#13131a] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1e1e2e] bg-[#0f0f18]">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{group.title}</h3>
          </div>
          <div className="divide-y divide-[#1e1e2e]">
            {group.items.map(item => (
              <div key={item.key} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-slate-200 text-sm font-medium">{item.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>
                </div>
                <Toggle
                  on={prefs[item.key]}
                  onToggle={() => toggle(item.key)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Save preferences
        </button>
        {saved && <p className="text-emerald-400 text-sm">Saved!</p>}
      </div>
    </div>
  );
}
