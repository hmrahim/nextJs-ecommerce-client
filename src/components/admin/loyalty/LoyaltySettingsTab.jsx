// 📁 PATH: src/components/admin/loyalty/LoyaltySettingsTab.jsx
// ⚠️  This is a completely new file

'use client';
import { useState, useEffect } from 'react';

const ipt = 'w-full h-10 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white focus:outline-none focus:border-orange-500/50';
const lbl = 'block text-xs font-medium text-slate-400 mb-1.5';

export default function LoyaltySettingsTab({ settings, onSave }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(settings), [settings]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => { setSaving(true); try { await onSave(form); } finally { setSaving(false); } };

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] p-6 max-w-3xl space-y-5">
      <div>
        <label className={lbl}>Program Name</label>
        <input value={form.programName} onChange={e => set('programName', e.target.value)} className={ipt} />
      </div>
      <div>
        <label className={lbl}>Points Currency Name</label>
        <input value={form.currencyName} onChange={e => set('currencyName', e.target.value)} className={ipt} placeholder="e.g. Stars, Coins, Points" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Redemption Rate (pts → SAR 1)</label>
          <input type="number" min={1} value={form.redemptionRate} onChange={e => set('redemptionRate', +e.target.value)} className={ipt} />
          <p className="text-xs text-slate-500 mt-1">{form.redemptionRate} pts = SAR 1 cart discount</p>
        </div>
        <div>
          <label className={lbl}>Min Points to Redeem</label>
          <input type="number" min={0} value={form.minRedeem} onChange={e => set('minRedeem', +e.target.value)} className={ipt} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Max % off per Order</label>
          <input type="number" min={0} max={100} value={form.maxPercentPerOrder} onChange={e => set('maxPercentPerOrder', +e.target.value)} className={ipt} />
        </div>
        <div>
          <label className={lbl}>Points Expiry (days)</label>
          <input type="number" min={0} value={form.expiryDays} onChange={e => set('expiryDays', +e.target.value)} className={ipt} placeholder="0 = never expire" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" />
          <span className="text-sm text-slate-300">Program Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.allowGuestEarn} onChange={e => set('allowGuestEarn', e.target.checked)} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" />
          <span className="text-sm text-slate-300">Allow guest checkout to earn (on signup)</span>
        </label>
      </div>
      <div className="pt-2 flex justify-end">
        <button onClick={submit} disabled={saving} className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium disabled:opacity-60">{saving ? 'Saving…' : 'Save Settings'}</button>
      </div>
    </div>
  );
}
