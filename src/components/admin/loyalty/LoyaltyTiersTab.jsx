// 📁 PATH: src/components/admin/loyalty/LoyaltyTiersTab.jsx
// ⚠️  This is a completely new file

'use client';
import { useState } from 'react';

const ipt = 'w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white focus:outline-none focus:border-orange-500/50';

export default function LoyaltyTiersTab({ tiers, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);

  const startNew = () => setDraft({ _id: 'new', name: '', threshold: 0, multiplier: 1, color: '#f59e0b', perks: '' });
  const startEdit = (t) => { setEditing(t._id); setDraft({ ...t, perks: (t.perks || []).join(', ') }); };
  const cancel = () => { setEditing(null); setDraft(null); };
  const commit = () => {
    if (!draft.name.trim()) return;
    onSave({ ...draft, perks: draft.perks ? draft.perks.split(',').map(s => s.trim()).filter(Boolean) : [] });
    cancel();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Define tiers that members unlock based on lifetime spend or points.</p>
        <button onClick={startNew} className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium">+ New Tier</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {tiers.map(t => {
          const isEditing = editing === t._id;
          return (
            <div key={t._id} className="rounded-xl border border-[#1e1e2e] bg-[#16161f] p-4">
              {isEditing ? (
                <div className="space-y-2">
                  <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={ipt} placeholder="Tier name" />
                  <input type="number" min={0} value={draft.threshold} onChange={e => setDraft({ ...draft, threshold: +e.target.value })} className={ipt} placeholder="Threshold (pts/SAR )" />
                  <input type="number" step={0.1} min={1} value={draft.multiplier} onChange={e => setDraft({ ...draft, multiplier: +e.target.value })} className={ipt} placeholder="Earn multiplier" />
                  <input value={draft.perks} onChange={e => setDraft({ ...draft, perks: e.target.value })} className={ipt} placeholder="Perks (comma separated)" />
                  <div className="flex gap-2 pt-2">
                    <button onClick={cancel} className="flex-1 px-3 py-1.5 rounded-md border border-[#1e1e2e] text-xs text-slate-400 hover:bg-white/5">Cancel</button>
                    <button onClick={commit} className="flex-1 px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium">Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: t.color }} /><h3 className="text-white font-semibold">{t.name}</h3></div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(t)} className="p-1 text-slate-400 hover:text-white">✏️</button>
                      <button onClick={() => onDelete(t._id)} className="p-1 text-red-400 hover:text-red-300">🗑</button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Threshold</p>
                  <p className="text-lg font-bold text-orange-400">{new Intl.NumberFormat().format(t.threshold)} pts</p>
                  <p className="text-xs text-slate-500 mt-2">Earn rate</p>
                  <p className="text-sm font-semibold text-emerald-400">{t.multiplier}× points</p>
                  {t.perks?.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-[#1e1e2e] pt-3">
                      {t.perks.map((p, i) => <li key={i} className="text-xs text-slate-400 flex gap-1.5"><span className="text-emerald-400">✓</span>{p}</li>)}
                    </ul>
                  )}
                </>
              )}
            </div>
          );
        })}

        {draft && editing === null && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 space-y-2">
            <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={ipt} placeholder="Tier name" />
            <input type="number" min={0} value={draft.threshold} onChange={e => setDraft({ ...draft, threshold: +e.target.value })} className={ipt} placeholder="Threshold (pts/SAR )" />
            <input type="number" step={0.1} min={1} value={draft.multiplier} onChange={e => setDraft({ ...draft, multiplier: +e.target.value })} className={ipt} placeholder="Earn multiplier" />
            <input value={draft.perks} onChange={e => setDraft({ ...draft, perks: e.target.value })} className={ipt} placeholder="Perks (comma separated)" />
            <div className="flex gap-2 pt-2">
              <button onClick={cancel} className="flex-1 px-3 py-1.5 rounded-md border border-[#1e1e2e] text-xs text-slate-400 hover:bg-white/5">Cancel</button>
              <button onClick={commit} className="flex-1 px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium">Create</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
