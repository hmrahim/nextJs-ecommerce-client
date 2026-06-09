// 📁 PATH: src/components/admin/customers/CustomerTable.jsx
// ⚠️  NEW FILE

'use client';
import { useState } from 'react';

// ── Shared UI atoms ───────────────────────────────────────────────────────────
const AVATAR_PALETTE = [
  'bg-violet-500/20 text-violet-300 border-violet-500/20',
  'bg-sky-500/20    text-sky-300    border-sky-500/20',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
  'bg-amber-500/20  text-amber-300  border-amber-500/20',
  'bg-pink-500/20   text-pink-300   border-pink-500/20',
  'bg-indigo-500/20 text-indigo-300 border-indigo-500/20',
];

export function CustomerAvatar({ firstName = '', lastName = '', size = 'md', className = '' }) {
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?';
  const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % AVATAR_PALETTE.length;
  const s = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm' }[size];
  return (
    <div className={`${s} rounded-full border flex items-center justify-center font-bold flex-shrink-0 ${AVATAR_PALETTE[idx]} ${className}`}>
      {initials}
    </div>
  );
}

export function StatusChip({ customer }) {
  if (customer.isBanned)        return <Chip color="red"    dot label="Banned" />;
  if (!customer.isActive)       return <Chip color="slate"  dot label="Inactive" />;
  if (!customer.emailVerified)  return <Chip color="amber"  dot label="Unverified" />;
  return                               <Chip color="emerald" dot label="Active" />;
}

function Chip({ color, label, dot }) {
  const c = {
    red:     'bg-red-500/10    text-red-400    border-red-500/20',
    slate:   'bg-slate-500/10  text-slate-400  border-slate-500/20',
    amber:   'bg-amber-500/10  text-amber-400  border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    violet:  'bg-violet-500/10 text-violet-400 border-violet-500/20',
    yellow:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  }[color] || '';
  const d = { red: 'bg-red-400', slate: 'bg-slate-400', amber: 'bg-amber-400', emerald: 'bg-emerald-400', violet: 'bg-violet-400', yellow: 'bg-yellow-400' }[color];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${d}`} />}
      {label}
    </span>
  );
}

export function CustomerTags({ tags = [] }) {
  const VIP  = tags.includes('VIP');
  const risk = tags.includes('At Risk');
  const fraud= tags.includes('Fraudulent');
  return (
    <div className="flex flex-wrap gap-1">
      {VIP   && <Chip color="yellow" label="⭐ VIP" />}
      {risk  && <Chip color="amber"  label="At Risk" />}
      {fraud && <Chip color="red"    label="⚠ Fraud" />}
      {tags.includes('B2B') && <Chip color="violet" label="B2B" />}
    </div>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────
export default function CustomerTable({
  customers = [], loading, selected = [],
  onSelectChange, onView, onToggleBan, onToggleVerify, onDelete,
  pagination, onPageChange,
}) {
  const [menu, setMenu] = useState(null);

  const allSel = customers.length > 0 && selected.length === customers.length;
  const toggle = (id) => onSelectChange(
    selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
  );

  if (loading) return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] flex items-center justify-center p-16 gap-3 text-slate-500">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Loading customers…
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
                  onChange={() => onSelectChange(allSel ? [] : customers.map(c => c._id))}
                  className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-violet-500" />
              </th>
              {['Customer','Contact','Orders','Spent','LTV','Last Order','Status','Tags',''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e2e]">
            {customers.length === 0 ? (
              <tr><td colSpan={10} className="py-20 text-center text-slate-600">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  No customers found
                </div>
              </td></tr>
            ) : customers.map(c => (
              <tr key={c._id}
                className={`group hover:bg-white/[0.025] transition-colors ${selected.includes(c._id) ? 'bg-violet-500/[0.05]' : ''}`}>

                {/* Checkbox */}
                <td className="px-4 py-3.5">
                  <input type="checkbox" checked={selected.includes(c._id)} onChange={() => toggle(c._id)}
                    className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-violet-500" />
                </td>

                {/* Customer name + avatar */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <CustomerAvatar firstName={c.firstName} lastName={c.lastName} />
                    <div className="min-w-0">
                      <button onClick={() => onView(c)}
                        className="text-white font-medium hover:text-violet-400 transition-colors block truncate max-w-[150px] text-left leading-snug">
                        {c.firstName} {c.lastName}
                      </button>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        ID: <span className="font-mono">{c._id}</span>
                      </p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-4 py-3.5">
                  <p className="text-slate-300 text-xs truncate max-w-[190px]">{c.email}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">{c.phone || '—'}</p>
                </td>

                {/* Orders */}
                <td className="px-4 py-3.5 text-center">
                  <span className="text-slate-200 font-semibold">{c.totalOrders ?? 0}</span>
                </td>

                {/* Spent */}
                <td className="px-4 py-3.5">
                  <span className={`font-semibold tabular-nums ${(c.totalSpent || 0) >= 2000 ? 'text-emerald-400' : (c.totalSpent || 0) >= 500 ? 'text-slate-200' : 'text-slate-400'}`}>
                    ${(c.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </span>
                </td>

                {/* LTV */}
                <td className="px-4 py-3.5">
                  <span className="text-slate-500 tabular-nums text-xs">${(c.ltv || 0).toLocaleString()}</span>
                </td>

                {/* Last Order */}
                <td className="px-4 py-3.5">
                  <span className="text-slate-500 text-xs whitespace-nowrap">
                    {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : <span className="text-slate-700">Never</span>}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5"><StatusChip customer={c} /></td>

                {/* Tags */}
                <td className="px-4 py-3.5"><CustomerTags tags={c.tags} /></td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* View */}
                    <button onClick={() => onView(c)} title="View profile"
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-violet-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    {/* More */}
                    <div className="relative">
                      <button onClick={() => setMenu(menu === c._id ? null : c._id)} title="More"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-200 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                        </svg>
                      </button>
                      {menu === c._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 z-20 bg-[#16161f] border border-[#1e1e2e] rounded-xl shadow-2xl overflow-hidden min-w-[172px]">
                            <button onClick={() => { onView(c); setMenu(null); }}
                              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors text-left">
                              <span className="text-base">👁</span> View Profile
                            </button>
                            <button onClick={() => { onToggleVerify(c._id); setMenu(null); }}
                              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors text-left">
                              <span className="text-base">{c.emailVerified ? '❌' : '✅'}</span>
                              {c.emailVerified ? 'Unverify Email' : 'Verify Email'}
                            </button>
                            <div className="border-t border-[#1e1e2e] my-0.5" />
                            <button onClick={() => { onToggleBan(c._id); setMenu(null); }}
                              className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors text-left ${c.isBanned ? 'text-emerald-400' : 'text-amber-400'}`}>
                              <span className="text-base">{c.isBanned ? '✅' : '🚫'}</span>
                              {c.isBanned ? 'Unban Customer' : 'Ban Customer'}
                            </button>
                            <button onClick={() => { onDelete(c._id); setMenu(null); }}
                              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left">
                              <span className="text-base">🗑</span> Delete
                            </button>
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
              className="px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-400 hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-xs">
              ← Prev
            </button>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
              const p = Math.max(1, Math.min(pagination.page - 3, pagination.pages - 6)) + i;
              if (p > pagination.pages) return null;
              return (
                <button key={p} onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === pagination.page ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                  {p}
                </button>
              );
            })}
            <button disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-400 hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-xs">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
