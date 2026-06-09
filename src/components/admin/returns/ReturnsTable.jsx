// 📁 PATH: src/components/admin/returns/ReturnsTable.jsx
// ⚠️  NEW FILE

'use client';
import { useState } from 'react';
import { STATUS_CONFIG, TYPE_CONFIG } from './_dummyData';

export function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending_review;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
      {cfg.label}
    </span>
  );
}

export function TypeChip({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.return_refund;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#1e1e2e] text-slate-400 border border-[#2a2a3f]">
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function ReturnsTable({
  returns = [], loading, selected = [],
  onSelectChange, onView,
  onApprove, onReject, onProcessRefund,
  pagination, onPageChange,
}) {
  const [menu, setMenu] = useState(null);
  const allSel = returns.length > 0 && selected.length === returns.length;
  const toggle = id => onSelectChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  if (loading) return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] flex items-center justify-center p-16 gap-3 text-slate-500">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Loading…
    </div>
  );

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSel}
                  onChange={() => onSelectChange(allSel ? [] : returns.map(r => r._id))}
                  className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-violet-500"/>
              </th>
              {['Request','Customer','Type','Items','Refund Amt','Method','Status','Submitted',''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e2e]">
            {returns.length === 0 ? (
              <tr><td colSpan={10} className="py-20 text-center">
                <div className="flex flex-col items-center gap-2 text-slate-600">
                  <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                  </svg>
                  No return requests found
                </div>
              </td></tr>
            ) : returns.map(r => (
              <tr key={r._id}
                className={`group hover:bg-white/[0.025] transition-colors ${selected.includes(r._id) ? 'bg-violet-500/[0.05]' : ''}`}>

                <td className="px-4 py-3.5">
                  <input type="checkbox" checked={selected.includes(r._id)} onChange={() => toggle(r._id)}
                    className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-violet-500"/>
                </td>

                {/* Request # + order link */}
                <td className="px-4 py-3.5">
                  <button onClick={() => onView(r)} className="text-violet-400 hover:text-violet-300 font-mono font-semibold text-sm transition-colors hover:underline">
                    {r.returnNumber}
                  </button>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Order: <span className="text-slate-500 font-mono">{r.orderId?.orderNumber || '—'}</span>
                  </p>
                </td>

                {/* Customer */}
                <td className="px-4 py-3.5">
                  <p className="text-slate-200 font-medium text-sm">
                    {r.userId?.firstName} {r.userId?.lastName}
                  </p>
                  <p className="text-slate-600 text-[11px] truncate max-w-[170px]">{r.userId?.email}</p>
                </td>

                {/* Type */}
                <td className="px-4 py-3.5"><TypeChip type={r.type}/></td>

                {/* Items */}
                <td className="px-4 py-3.5">
                  <span className="text-slate-300">{r.items?.length ?? 0}
                    <span className="text-slate-600"> item{r.items?.length !== 1 ? 's' : ''}</span>
                  </span>
                </td>

                {/* Refund amount */}
                <td className="px-4 py-3.5">
                  <span className={`font-bold tabular-nums ${r.refundAmount > 0 ? 'text-white' : 'text-slate-600'}`}>
                    {r.refundAmount > 0 ? `$${r.refundAmount.toFixed(2)}` : '—'}
                  </span>
                </td>

                {/* Refund method */}
                <td className="px-4 py-3.5">
                  <span className="text-slate-400 text-xs capitalize">
                    {r.refundMethod === 'original_payment' ? 'Original' :
                     r.refundMethod === 'store_credit'     ? 'Store Credit' :
                     r.refundMethod === 'bank_transfer'    ? 'Bank Transfer' :
                     r.refundMethod === 'exchange'         ? 'Exchange' : '—'}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5"><StatusChip status={r.status}/></td>

                {/* Date */}
                <td className="px-4 py-3.5">
                  <span className="text-slate-500 text-xs whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onView(r)} title="View"
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-violet-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    <div className="relative">
                      <button onClick={() => setMenu(menu === r._id ? null : r._id)} title="Actions"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-200 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                        </svg>
                      </button>
                      {menu === r._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenu(null)}/>
                          <div className="absolute right-0 top-full mt-1 z-20 bg-[#16161f] border border-[#1e1e2e] rounded-xl shadow-2xl overflow-hidden min-w-[170px]">
                            <button onClick={() => { onView(r); setMenu(null); }}
                              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors">
                              👁 View Details
                            </button>
                            {r.status === 'pending_review' && <>
                              <button onClick={() => { onApprove(r._id); setMenu(null); }}
                                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                                ✅ Approve
                              </button>
                              <button onClick={() => { onReject(r._id); setMenu(null); }}
                                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                ❌ Reject
                              </button>
                            </>}
                            {r.status === 'item_received' && (
                              <button onClick={() => { onProcessRefund(r._id); setMenu(null); }}
                                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-sky-400 hover:bg-sky-500/10 transition-colors">
                                💸 Process Refund
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination?.pages > 1 && (
        <div className="px-5 py-3 border-t border-[#1e1e2e] flex items-center justify-between flex-wrap gap-2 text-sm">
          <span className="text-slate-600 text-xs">
            Showing {((pagination.page - 1) * 15) + 1}–{Math.min(pagination.page * 15, pagination.total)} of {pagination.total}
          </span>
          <div className="flex items-center gap-1">
            <button disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-400 hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed text-xs transition-colors">← Prev</button>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
              const p = Math.max(1, Math.min(pagination.page - 3, pagination.pages - 6)) + i;
              if (p > pagination.pages) return null;
              return <button key={p} onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === pagination.page ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>{p}</button>;
            })}
            <button disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-400 hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed text-xs transition-colors">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
