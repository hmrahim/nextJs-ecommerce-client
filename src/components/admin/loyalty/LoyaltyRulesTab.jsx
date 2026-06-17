// 📁 PATH: src/components/admin/loyalty/LoyaltyRulesTab.jsx
// ⚠️  This is a completely new file

'use client';
import { useState } from 'react';

const EVENTS = [
  { value: 'order_placed',   label: 'Order Placed' },
  { value: 'order_delivered',label: 'Order Delivered' },
  { value: 'signup',         label: 'New Signup' },
  { value: 'review_posted',  label: 'Review Posted' },
  { value: 'referral_signup',label: 'Referral Signup' },
  { value: 'birthday',       label: 'Birthday' },
  { value: 'social_share',   label: 'Social Share' },
];
const ipt = 'h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white focus:outline-none focus:border-orange-500/50';

export default function LoyaltyRulesTab({ rules, onSave, onDelete, onToggle }) {
  const [draft, setDraft] = useState(null);
  const startNew = () => setDraft({ _id: 'new', name: '', event: 'order_placed', pointsType: 'percent', pointsValue: 1, minSpend: 0, isActive: true });
  const commit = () => { if (!draft.name.trim()) return; onSave(draft); setDraft(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Earn rules tell the system when & how members earn points.</p>
        <button onClick={startNew} className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium">+ New Rule</button>
      </div>

      <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] divide-y divide-[#1e1e2e]">
        {rules.map(r => (
          <div key={r._id} className="flex items-center justify-between p-4 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{r.name}</p>
                <span className="px-2 py-0.5 rounded-md border border-[#1e1e2e] text-[10px] text-slate-400">{EVENTS.find(e => e.value === r.event)?.label || r.event}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {r.pointsType === 'percent' ? `${r.pointsValue} pt per SAR 1 spent` : `${r.pointsValue} flat points per event`}
                {r.minSpend > 0 && ` · min SAR ${r.minSpend}`}
              </p>
            </div>
            <button onClick={() => onToggle(r._id)} className={`relative w-10 h-5 rounded-full transition-colors ${r.isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${r.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <button onClick={() => onDelete(r._id)} className="p-1.5 text-red-400 hover:text-red-300 text-sm">🗑</button>
          </div>
        ))}
        {!rules.length && !draft && <div className="p-8 text-center text-sm text-slate-500">No earning rules yet. Create your first one.</div>}

        {draft && (
          <div className="p-4 bg-orange-500/5 grid grid-cols-1 md:grid-cols-6 gap-2">
            <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={`${ipt} md:col-span-2`} placeholder="Rule name" />
            <select value={draft.event} onChange={e => setDraft({ ...draft, event: e.target.value })} className={ipt}>{EVENTS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}</select>
            <select value={draft.pointsType} onChange={e => setDraft({ ...draft, pointsType: e.target.value })} className={ipt}>
              <option value="flat">Flat points</option>
              <option value="percent">pt per SAR 1</option>
            </select>
            <input type="number" min={0} step={0.1} value={draft.pointsValue} onChange={e => setDraft({ ...draft, pointsValue: +e.target.value })} className={ipt} placeholder="Value" />
            <input type="number" min={0} value={draft.minSpend} onChange={e => setDraft({ ...draft, minSpend: +e.target.value })} className={ipt} placeholder="Min SAR " />
            <div className="md:col-span-6 flex gap-2">
              <button onClick={() => setDraft(null)} className="px-3 py-1.5 rounded-md border border-[#1e1e2e] text-xs text-slate-400 hover:bg-white/5">Cancel</button>
              <button onClick={commit} className="px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium">Save Rule</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
