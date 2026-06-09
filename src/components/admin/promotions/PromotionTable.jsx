// 📁 PATH: src/components/admin/promotions/PromotionTable.jsx
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

'use client';
import { useState } from 'react';

const STATUS_CFG = {
  active:    { label: 'Active',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  scheduled: { label: 'Scheduled', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  expired:   { label: 'Expired',   cls: 'bg-slate-700/30 text-slate-500 border-slate-700/50' },
  inactive:  { label: 'Inactive',  cls: 'bg-slate-700/30 text-slate-400 border-slate-700/50' },
};
const TYPE_CFG = {
  bogo:          { label: 'BOGO',          icon: '🎁' },
  buy_x_get_y:   { label: 'Buy X Get Y',   icon: '🔢' },
  bundle_deal:   { label: 'Bundle',        icon: '📦' },
  tier_discount: { label: 'Tier Discount', icon: '📈' },
  cart_percent:  { label: '% Cart Off',    icon: '%'  },
  cart_fixed:    { label: '৳ Cart Off',    icon: '৳'  },
  free_gift:     { label: 'Free Gift',     icon: '🎀' },
  free_shipping: { label: 'Free Shipping', icon: '🚚' },
};

function getStatus(p) {
  const now = new Date();
  if (!p.isActive) return 'inactive';
  if (p.startsAt && new Date(p.startsAt) > now) return 'scheduled';
  if (p.endsAt && new Date(p.endsAt) < now) return 'expired';
  return 'active';
}

function ConfirmDelete({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-semibold text-center mb-1">Delete Promotion?</h3>
        <p className="text-slate-400 text-sm text-center mb-5">"<span className="text-orange-400">{name}</span>" permanently delete হবে।</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function PromotionTable({ promotions, loading, selected, onSelectChange, onEdit, onDelete, onToggle, onDuplicate }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const allSelected = promotions.length > 0 && selected.length === promotions.length;
  const toggleAll = () => onSelectChange(allSelected ? [] : promotions.map(p => p._id));
  const toggleOne = (id) => onSelectChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  if (loading) return <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] p-12 text-center"><div className="w-10 h-10 mx-auto border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;
  if (!promotions.length) return <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] p-16 text-center text-slate-500 text-sm">No promotions found.</div>;

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#111118] border-b border-[#1e1e2e]">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 w-10"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" /></th>
              <th className="px-4 py-3">Promotion</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Reward</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Performance</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e2e]">
            {promotions.map(p => {
              const st = STATUS_CFG[getStatus(p)];
              const tc = TYPE_CFG[p.type] || TYPE_CFG.cart_percent;
              return (
                <tr key={p._id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleOne(p._id)} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" /></td>
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 truncate">{p.description || '—'}</p>
                    {p.appliesTo && <p className="text-[11px] text-slate-600 mt-0.5">Applies to: <span className="text-slate-400">{p.appliesTo}</span></p>}
                  </td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#1e1e2e] text-xs text-slate-300"><span>{tc.icon}</span>{tc.label}</span></td>
                  <td className="px-4 py-3 text-sm text-orange-400 font-medium">{p.rewardLabel || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-400">{p.startsAt ? new Date(p.startsAt).toLocaleDateString('en-BD', { day: '2-digit', month: 'short' }) : '—'}</p>
                    <p className="text-xs text-slate-600">→ {p.endsAt ? new Date(p.endsAt).toLocaleDateString('en-BD', { day: '2-digit', month: 'short' }) : 'No end'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-medium">{new Intl.NumberFormat().format(p.redeemCount || 0)} <span className="text-xs text-slate-500 font-normal">uses</span></p>
                    <p className="text-xs text-emerald-400">৳{new Intl.NumberFormat().format(p.totalDiscount || 0)} given</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-sm text-slate-300 font-semibold">{p.priority || 0}</span>{p.stackable && <span className="block text-[10px] text-violet-400">stackable</span>}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-md border text-xs font-medium ${st.cls}`}>{st.label}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button onClick={() => setMenuFor(menuFor === p._id ? null : p._id)} className="p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-white"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm-2 4a2 2 0 104 0 2 2 0 00-4 0z" /></svg></button>
                      {menuFor === p._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                          <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-[#1e1e2e] bg-[#16161f] shadow-xl py-1">
                            <button onClick={() => { setMenuFor(null); onEdit(p); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5">✏️ Edit</button>
                            <button onClick={() => { setMenuFor(null); onDuplicate(p._id); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5">📑 Duplicate</button>
                            <button onClick={() => { setMenuFor(null); onToggle(p._id); }} className="w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-white/5">{p.isActive ? '⏸ Pause' : '▶ Activate'}</button>
                            <div className="border-t border-[#1e1e2e] my-1" />
                            <button onClick={() => { setMenuFor(null); setDeleteTarget(p); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5">🗑 Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {deleteTarget && <ConfirmDelete name={deleteTarget.name} onConfirm={() => { onDelete(deleteTarget._id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}
