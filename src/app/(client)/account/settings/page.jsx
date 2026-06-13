'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AccountSettingsPage() {
  const [tab, setTab] = useState('profile');
  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Password' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
  ];
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-5">
        <h1 className="text-xl font-bold">Account settings</h1>
        <div className="mt-4 flex gap-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t.label}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-border p-6">
        {tab === 'profile' && (
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            {[['First name', 'John'], ['Last name', 'Doe'], ['Email', 'john@moom24.com'], ['Phone', '+1 555 0100']].map(([l, v]) => (
              <label key={l} className="text-sm">
                <span className="block mb-1 font-medium text-slate-700">{l}</span>
                <input defaultValue={v} className="w-full rounded-lg border border-border px-3 py-2.5" />
              </label>
            ))}
            <div className="col-span-2"><button onClick={() => toast.success('Profile updated')} className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold">Save changes</button></div>
          </div>
        )}
        {tab === 'security' && (
          <div className="space-y-3 max-w-md">
            {['Current password', 'New password', 'Confirm new password'].map((l) => (
              <label key={l} className="text-sm block">
                <span className="block mb-1 font-medium text-slate-700">{l}</span>
                <input type="password" className="w-full rounded-lg border border-border px-3 py-2.5" />
              </label>
            ))}
            <button onClick={() => toast.success('Password changed')} className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold">Update password</button>
          </div>
        )}
        {tab === 'notifications' && (
          <ul className="divide-y divide-border max-w-2xl">
            {[
              ['Order updates', 'Shipment, delivery and receipt notifications', true],
              ['Promotions', 'Discounts and exclusive offers', true],
              ['Wishlist alerts', 'When wishlist items drop in price', false],
              ['Newsletter', 'Weekly product roundup', false],
            ].map(([t, d, on]) => (
              <li key={t} className="py-4 flex items-center justify-between">
                <div><p className="font-semibold">{t}</p><p className="text-xs text-slate-500">{d}</p></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={on} className="sr-only peer" />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-orange-500 transition" />
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-4" />
                </label>
              </li>
            ))}
          </ul>
        )}
        {tab === 'privacy' && (
          <div className="space-y-4 max-w-2xl">
            <div className="p-4 rounded-xl border border-border border-amber-200 bg-amber-50">
              <p className="font-semibold text-amber-900">Download your data</p>
              <p className="text-xs text-amber-800 mt-1">Get a JSON export of your account, orders, addresses and wishlists.</p>
              <button className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-white border border-border font-semibold">Request export</button>
            </div>
            <div className="p-4 rounded-xl border border-border border-rose-200 bg-rose-50">
              <p className="font-semibold text-rose-900">Delete account</p>
              <p className="text-xs text-rose-800 mt-1">Permanently delete your account and all data. Cannot be undone.</p>
              <button className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
