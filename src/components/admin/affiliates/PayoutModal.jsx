// 📁 PATH: src/components/admin/affiliates/PayoutModal.jsx
// ⚠️  This is a completely new file

'use client';
import { useState } from 'react';

export default function PayoutModal({ affiliate, onSave, onClose }) {
  const [amount, setAmount] = useState(affiliate?.pendingPayout || 0);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (amount <= 0) return;
    setSaving(true);
    try { await onSave({ amount: Number(amount), reference, note, method: affiliate.payoutMethod, account: affiliate.payoutAccount }); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e]">
          <h2 className="text-lg font-bold text-white">Process Payout</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-4">
            <p className="text-xs text-slate-500">Affiliate</p>
            <p className="text-sm font-semibold text-white">{affiliate.name}</p>
            <p className="text-xs text-slate-500 mt-2">Pending Balance</p>
            <p className="text-xl font-bold text-amber-400">SAR {new Intl.NumberFormat().format(affiliate.pendingPayout)}</p>
            <p className="text-xs text-slate-500 mt-2">Payout via</p>
            <p className="text-sm text-slate-300">{affiliate.payoutMethod} — <span className="font-mono">{affiliate.payoutAccount}</span></p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Payout Amount SAR </label>
            <input type="number" min={0} max={affiliate.pendingPayout} value={amount} onChange={e => setAmount(+e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white focus:outline-none focus:border-orange-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Transaction Reference</label>
            <input value={reference} onChange={e => setReference(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white focus:outline-none focus:border-orange-500/50" placeholder="TXN-…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Note</label>
            <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white resize-none focus:outline-none focus:border-orange-500/50" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#1e1e2e]">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5">Cancel</button>
          <button onClick={submit} disabled={saving || amount <= 0} className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium disabled:opacity-60">{saving ? 'Processing…' : '💸 Pay Out'}</button>
        </div>
      </div>
    </div>
  );
}
