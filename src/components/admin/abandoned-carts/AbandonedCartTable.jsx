// 📁 PATH: src/components/admin/abandoned-carts/AbandonedCartTable.jsx
'use client';
import { useState } from 'react';

const STATUS_CFG = {
  new:        { label: 'New',         cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  email_sent: { label: 'Email Sent',  cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  reminded:   { label: 'Reminded',    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  recovered:  { label: 'Recovered',   cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  lost:       { label: 'Lost',        cls: 'bg-slate-700/30 text-slate-500 border-slate-700/50' },
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AbandonedCartTable({ carts, loading, selected, onSelectChange, onSendRecovery, onMarkRecovered, onDelete, onView }) {
  const [menuFor, setMenuFor] = useState(null);
  const allSelected = carts.length > 0 && selected.length === carts.length;
  const toggleAll = () => onSelectChange(allSelected ? [] : carts.map(c => c._id));
  const toggleOne = (id) => onSelectChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  if (loading) return <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] p-12 text-center"><div className="w-10 h-10 mx-auto border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;
  if (!carts.length) return <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] p-16 text-center text-slate-500 text-sm">No abandoned carts 🎉</div>;

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#111118] border-b border-[#1e1e2e]">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 w-10"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" /></th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Cart Value</th>
              <th className="px-4 py-3">Abandoned</th>
              <th className="px-4 py-3">Recovery</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e2e]">
            {carts.map(c => {
              const st = STATUS_CFG[c.status] || STATUS_CFG.new;
              return (
                <tr key={c._id} className="hover:bg-white/[0.02] cursor-pointer" onClick={() => onView?.(c)}>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selected.includes(c._id)} onChange={() => toggleOne(c._id)} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" /></td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-white">{c.customerName || 'Guest'}</p>
                    <p className="text-xs text-slate-500">{c.email || c.phone || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-300 font-medium">{c.itemsCount} items</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{(c.items || []).slice(0, 2).map(i => i.name).join(', ')}{c.items?.length > 2 && '…'}</p>
                  </td>
                  <td className="px-4 py-3"><p className="text-sm font-bold text-orange-400">SAR {new Intl.NumberFormat().format(c.cartValue)}</p></td>
                  <td className="px-4 py-3"><p className="text-xs text-slate-300">{timeAgo(c.abandonedAt)}</p><p className="text-[11px] text-slate-600">{new Date(c.abandonedAt).toLocaleDateString('en-SA', { day: '2-digit', month: 'short' })}</p></td>
                  <td className="px-4 py-3">
                    {c.recoveryAttempts > 0 ? (
                      <>
                        <p className="text-xs text-slate-300">{c.recoveryAttempts} attempt{c.recoveryAttempts > 1 ? 's' : ''}</p>
                        {c.couponSent && <p className="text-[11px] text-orange-400 font-mono">{c.couponSent}</p>}
                      </>
                    ) : <span className="text-xs text-slate-600">Not contacted</span>}
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-md border text-xs font-medium ${st.cls}`}>{st.label}</span></td>
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="relative inline-block">
                      <button onClick={() => setMenuFor(menuFor === c._id ? null : c._id)} className="p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-white"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm-2 4a2 2 0 104 0 2 2 0 00-4 0z" /></svg></button>
                      {menuFor === c._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                          <div className="absolute right-0 top-9 z-20 w-52 rounded-lg border border-[#1e1e2e] bg-[#16161f] shadow-xl py-1">
                            <button onClick={() => { setMenuFor(null); onView?.(c); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5">👁 View Details</button>
                            <button onClick={() => { setMenuFor(null); onSendRecovery(c, 'email'); }} className="w-full text-left px-3 py-2 text-sm text-sky-400 hover:bg-white/5">📧 Send Email</button>
                            <button onClick={() => { setMenuFor(null); onSendRecovery(c, 'sms'); }} className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-white/5">💬 Send SMS</button>
                            <button onClick={() => { setMenuFor(null); onSendRecovery(c, 'coupon'); }} className="w-full text-left px-3 py-2 text-sm text-orange-400 hover:bg-white/5">🎟 Generate Coupon</button>
                            <button onClick={() => { setMenuFor(null); onMarkRecovered(c._id); }} className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-white/5">✅ Mark Recovered</button>
                            <div className="border-t border-[#1e1e2e] my-1" />
                            <button onClick={() => { setMenuFor(null); onDelete(c._id); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5">🗑 Delete</button>
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
    </div>
  );
}
