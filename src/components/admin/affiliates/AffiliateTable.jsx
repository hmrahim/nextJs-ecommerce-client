// 📁 PATH: src/components/admin/affiliates/AffiliateTable.jsx
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

'use client';
import { useState } from 'react';

const STATUS_CFG = {
  approved:  { label: 'Approved',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  pending:   { label: 'Pending',   cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  suspended: { label: 'Suspended', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  rejected:  { label: 'Rejected',  cls: 'bg-slate-700/30 text-slate-500 border-slate-700/50' },
};
const TIER_CFG = {
  bronze:   { label: 'Bronze',   icon: '🥉', cls: 'text-amber-600' },
  silver:   { label: 'Silver',   icon: '🥈', cls: 'text-slate-300' },
  gold:     { label: 'Gold',     icon: '🥇', cls: 'text-amber-400' },
  platinum: { label: 'Platinum', icon: '💎', cls: 'text-cyan-300' },
};

function ConfirmModal({ title, message, confirmLabel = 'Confirm', confirmCls = 'bg-red-600 hover:bg-red-500', onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-semibold text-center mb-2">{title}</h3>
        <p className="text-slate-400 text-sm text-center mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2 rounded-lg ${confirmCls} text-white text-sm font-medium`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default function AffiliateTable({ affiliates, loading, selected, onSelectChange, onEdit, onApprove, onSuspend, onPayout, onDelete }) {
  const [confirmAction, setConfirmAction] = useState(null);
  const [copied, setCopied] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const allSelected = affiliates.length > 0 && selected.length === affiliates.length;
  const toggleAll = () => onSelectChange(allSelected ? [] : affiliates.map(a => a._id));
  const toggleOne = (id) => onSelectChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  const copyCode = (code) => { navigator.clipboard.writeText(code); setCopied(code); setTimeout(() => setCopied(null), 1500); };

  if (loading) return <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] p-12 text-center"><div className="w-10 h-10 mx-auto border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;
  if (!affiliates.length) return <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] p-16 text-center text-slate-500 text-sm">No affiliates found.</div>;

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#111118] border-b border-[#1e1e2e]">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 w-10"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" /></th>
              <th className="px-4 py-3">Affiliate</th>
              <th className="px-4 py-3">Referral Code</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Performance</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Pending Payout</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e2e]">
            {affiliates.map(a => {
              const st = STATUS_CFG[a.status] || STATUS_CFG.pending;
              const tier = TIER_CFG[a.tier] || TIER_CFG.bronze;
              return (
                <tr key={a._id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(a._id)} onChange={() => toggleOne(a._id)} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 flex items-center justify-center text-orange-400 font-semibold text-sm">{a.name?.[0]?.toUpperCase() || '?'}</div>
                      <div>
                        <p className="text-sm font-semibold text-white">{a.name}</p>
                        <p className="text-xs text-slate-500">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => copyCode(a.referralCode)} className="group inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-[#1e1e2e] bg-[#111118] hover:border-orange-500/30">
                      <span className="font-mono text-xs text-orange-400">{a.referralCode}</span>
                      <svg className="w-3 h-3 text-slate-500 group-hover:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      {copied === a.referralCode && <span className="text-[10px] text-emerald-400">Copied!</span>}
                    </button>
                  </td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 text-sm font-medium ${tier.cls}`}><span>{tier.icon}</span>{tier.label}</span></td>
                  <td className="px-4 py-3"><span className="text-sm text-white font-semibold">{a.commissionPercent}%</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-xs">
                      <div><p className="text-slate-500">Clicks</p><p className="text-slate-300 font-semibold">{new Intl.NumberFormat().format(a.clicks || 0)}</p></div>
                      <div><p className="text-slate-500">Conv.</p><p className="text-violet-400 font-semibold">{new Intl.NumberFormat().format(a.conversions || 0)}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><p className="text-sm text-emerald-400 font-semibold">৳{new Intl.NumberFormat().format(a.totalRevenue || 0)}</p></td>
                  <td className="px-4 py-3"><p className="text-sm text-amber-400 font-semibold">৳{new Intl.NumberFormat().format(a.pendingPayout || 0)}</p></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-md border text-xs font-medium ${st.cls}`}>{st.label}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button onClick={() => setMenuFor(menuFor === a._id ? null : a._id)} className="p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-white"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm-2 4a2 2 0 104 0 2 2 0 00-4 0z" /></svg></button>
                      {menuFor === a._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                          <div className="absolute right-0 top-9 z-20 w-48 rounded-lg border border-[#1e1e2e] bg-[#16161f] shadow-xl py-1">
                            <button onClick={() => { setMenuFor(null); onEdit(a); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5">✏️ Edit</button>
                            {a.status === 'pending'  && <button onClick={() => { setMenuFor(null); onApprove(a._id); }} className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-white/5">✅ Approve</button>}
                            {a.status === 'approved' && <button onClick={() => { setMenuFor(null); setConfirmAction({ type: 'suspend', id: a._id, name: a.name }); }} className="w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-white/5">🚫 Suspend</button>}
                            {a.pendingPayout > 0     && <button onClick={() => { setMenuFor(null); onPayout(a); }} className="w-full text-left px-3 py-2 text-sm text-sky-400 hover:bg-white/5">💸 Pay out ৳{new Intl.NumberFormat().format(a.pendingPayout)}</button>}
                            <div className="border-t border-[#1e1e2e] my-1" />
                            <button onClick={() => { setMenuFor(null); setConfirmAction({ type: 'delete', id: a._id, name: a.name }); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5">🗑 Delete</button>
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
      {confirmAction?.type === 'delete' && <ConfirmModal title="Delete Affiliate?" message={`"${confirmAction.name}" permanently delete হবে।`} confirmLabel="Delete" onConfirm={() => { onDelete(confirmAction.id); setConfirmAction(null); }} onCancel={() => setConfirmAction(null)} />}
      {confirmAction?.type === 'suspend' && <ConfirmModal title="Suspend Affiliate?" message={`"${confirmAction.name}" suspended করা হবে — referral tracking বন্ধ থাকবে।`} confirmLabel="Suspend" confirmCls="bg-amber-600 hover:bg-amber-500" onConfirm={() => { onSuspend(confirmAction.id); setConfirmAction(null); }} onCancel={() => setConfirmAction(null)} />}
    </div>
  );
}
