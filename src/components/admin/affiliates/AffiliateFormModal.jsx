// 📁 PATH: src/components/admin/affiliates/AffiliateFormModal.jsx
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

'use client';
import { useState, useEffect } from 'react';

const TIERS = ['bronze', 'silver', 'gold', 'platinum'];
const PAYOUT_METHODS = ['bKash', 'Nagad', 'Rocket', 'Bank Transfer', 'PayPal', 'Stripe Connect'];

const empty = {
  name: '', email: '', phone: '', website: '', socialHandle: '',
  referralCode: '', commissionPercent: 10, tier: 'bronze', status: 'pending',
  payoutMethod: 'bKash', payoutAccount: '', minPayoutThreshold: 500, notes: '',
};

const ipt = 'w-full h-10 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50';
const lbl = 'block text-xs font-medium text-slate-400 mb-1.5';

function genCode(name = '') {
  const base = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) || 'AFF';
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}-${rand}`;
}

export default function AffiliateFormModal({ affiliate, onSave, onClose }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (affiliate) setForm({ ...empty, ...affiliate }); else setForm({ ...empty, referralCode: genCode() }); }, [affiliate]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.referralCode.trim()) e.referralCode = 'Referral code required';
    if (form.commissionPercent < 0 || form.commissionPercent > 100) e.commissionPercent = '0–100 only';
    if (!form.payoutAccount.trim()) e.payoutAccount = 'Payout account required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e]">
          <div>
            <h2 className="text-lg font-bold text-white">{affiliate ? 'Edit Affiliate' : 'New Affiliate Partner'}</h2>
            <p className="text-xs text-slate-500">Onboard partners with their own referral code & commission.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className={ipt} placeholder="John Doe" />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className={lbl}>Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={ipt} placeholder="john@example.com" />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Phone</label><input value={form.phone} onChange={e => set('phone', e.target.value)} className={ipt} placeholder="+880…" /></div>
            <div><label className={lbl}>Website / Social</label><input value={form.website} onChange={e => set('website', e.target.value)} className={ipt} placeholder="https://… or @handle" /></div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Referral Code *</label>
              <div className="flex gap-2">
                <input value={form.referralCode} onChange={e => set('referralCode', e.target.value.toUpperCase())} className={`${ipt} font-mono`} />
                <button type="button" onClick={() => set('referralCode', genCode(form.name))} className="h-10 px-3 rounded-lg border border-[#1e1e2e] text-slate-300 text-sm hover:bg-white/5">↻</button>
              </div>
              {errors.referralCode && <p className="text-xs text-red-400 mt-1">{errors.referralCode}</p>}
            </div>
            <div>
              <label className={lbl}>Commission %</label>
              <input type="number" min={0} max={100} value={form.commissionPercent} onChange={e => set('commissionPercent', +e.target.value)} className={ipt} />
              {errors.commissionPercent && <p className="text-xs text-red-400 mt-1">{errors.commissionPercent}</p>}
            </div>
            <div>
              <label className={lbl}>Tier</label>
              <select value={form.tier} onChange={e => set('tier', e.target.value)} className={ipt}>
                {TIERS.map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-4 space-y-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Payout Details</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Method</label>
                <select value={form.payoutMethod} onChange={e => set('payoutMethod', e.target.value)} className={ipt}>
                  {PAYOUT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Account / Number *</label>
                <input value={form.payoutAccount} onChange={e => set('payoutAccount', e.target.value)} className={ipt} placeholder="Acc no / wallet" />
                {errors.payoutAccount && <p className="text-xs text-red-400 mt-1">{errors.payoutAccount}</p>}
              </div>
              <div><label className={lbl}>Min Payout Threshold ৳</label><input type="number" min={0} value={form.minPayoutThreshold} onChange={e => set('minPayoutThreshold', +e.target.value)} className={ipt} /></div>
            </div>
          </div>

          <div>
            <label className={lbl}>Status</label>
            <div className="flex gap-2 flex-wrap">
              {['pending', 'approved', 'suspended', 'rejected'].map(s => (
                <button key={s} type="button" onClick={() => set('status', s)} className={`px-3 py-1.5 rounded-md border text-xs capitalize ${form.status === s ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-[#1e1e2e] text-slate-400 hover:bg-white/5'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label className={lbl}>Internal Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} className={`${ipt} h-auto py-2 resize-none`} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#1e1e2e]">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium disabled:opacity-60">{saving ? 'Saving…' : affiliate ? 'Update' : 'Create Affiliate'}</button>
        </div>
      </div>
    </div>
  );
}
