// 📁 PATH: src/components/admin/loyalty/AdjustPointsModal.jsx
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

'use client';
import { useState } from 'react';

export default function AdjustPointsModal({ member, onSave, onClose }) {
  const [mode, setMode]     = useState('add');
  const [points, setPoints] = useState(100);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!points || !reason.trim()) return;
    setSaving(true);
    try { await onSave({ delta: mode === 'add' ? +points : -Math.abs(+points), reason }); } finally { setSaving(false); }
  };

  const newBalance = (member.points || 0) + (mode === 'add' ? +points : -Math.abs(+points));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e]">
          <h2 className="text-lg font-bold text-white">Adjust Loyalty Points</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-4">
            <p className="text-xs text-slate-500">Member</p>
            <p className="text-sm font-semibold text-white">{member.name}</p>
            <p className="text-xs text-slate-500 mt-2">Current Balance</p>
            <p className="text-2xl font-bold text-orange-400">{new Intl.NumberFormat().format(member.points || 0)} <span className="text-sm text-slate-500 font-normal">pts</span></p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setMode('add')} className={`px-3 py-2 rounded-lg border text-sm ${mode === 'add' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-[#1e1e2e] text-slate-400'}`}>➕ Add Points</button>
            <button onClick={() => setMode('subtract')} className={`px-3 py-2 rounded-lg border text-sm ${mode === 'subtract' ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-[#1e1e2e] text-slate-400'}`}>➖ Deduct Points</button>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Points</label>
            <input type="number" min={1} value={points} onChange={e => setPoints(+e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white focus:outline-none focus:border-orange-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Reason (required)</label>
            <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white resize-none focus:outline-none focus:border-orange-500/50" placeholder="e.g. Goodwill bonus / complaint resolution" />
          </div>
          <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 text-center">
            <p className="text-xs text-orange-400/80">New Balance</p>
            <p className="text-xl font-bold text-orange-400">{new Intl.NumberFormat().format(Math.max(0, newBalance))} pts</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#1e1e2e]">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5">Cancel</button>
          <button onClick={submit} disabled={saving || !reason.trim()} className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium disabled:opacity-60">{saving ? 'Saving…' : 'Apply Adjustment'}</button>
        </div>
      </div>
    </div>
  );
}
