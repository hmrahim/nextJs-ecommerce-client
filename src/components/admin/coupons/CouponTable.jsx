// 📁 PATH: src/components/admin/coupons/CouponTable.jsx
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

'use client';
import { useState } from 'react';

const STATUS_CFG = {
  active:    { label: 'Active',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  inactive:  { label: 'Inactive',  cls: 'bg-slate-700/30 text-slate-400 border-slate-700/50' },
  expired:   { label: 'Expired',   cls: 'bg-slate-700/30 text-slate-500 border-slate-700/50' },
  exhausted: { label: 'Exhausted', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const TYPE_CFG = {
  percent:  { label: (v) => `${v}% off`,    cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  fixed:    { label: (v) => `৳${v} off`,    cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  shipping: { label: (_) => 'Free Shipping', cls: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
};

function getStatus(c) {
  if (!c.isActive) return 'inactive';
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return 'expired';
  if (c.maxUses && c.usedCount >= c.maxUses) return 'exhausted';
  return 'active';
}

function UsageBar({ used, max }) {
  if (!max) return <span className="text-xs text-slate-500">{used} uses</span>;
  const pct = Math.min(100, Math.round((used / max) * 100));
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{used} / {max}</span>
        <span className="text-xs text-slate-600">{pct}%</span>
      </div>
      <div className="w-24 h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ExpiryCell({ expiresAt }) {
  if (!expiresAt) return <span className="text-xs text-slate-600">No expiry</span>;
  const d = new Date(expiresAt);
  const now = new Date();
  const diff = Math.ceil((d - now) / 86400000);
  const expired = diff < 0;
  const urgent  = !expired && diff <= 3;
  const soon    = !expired && diff <= 7;

  return (
    <div>
      <p className={`text-xs font-medium ${expired ? 'text-slate-600 line-through' : urgent ? 'text-red-400' : soon ? 'text-amber-400' : 'text-slate-300'}`}>
        {d.toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}
      </p>
      {!expired && <p className={`text-xs ${urgent ? 'text-red-500' : soon ? 'text-amber-500' : 'text-slate-600'}`}>{diff === 0 ? 'Expires today!' : `${diff}d left`}</p>}
      {expired  && <p className="text-xs text-slate-700">Expired</p>}
    </div>
  );
}

function ConfirmDeleteModal({ coupon, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-center mb-1">Delete Coupon?</h3>
        <p className="text-slate-400 text-sm text-center mb-5">
          "<span className="text-orange-400 font-mono font-bold">{coupon?.code}</span>" permanently delete হবে।
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function CouponTable({ coupons, loading, selected, onSelectChange, onEdit, onDelete, onToggle, pagination, onPageChange }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [copied, setCopied] = useState(null);

  const allSelected = coupons.length > 0 && selected.length === coupons.length;
  const toggleAll   = () => onSelectChange(allSelected ? [] : coupons.map(c => c._id));
  const toggleOne   = (id) => onSelectChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-8 flex items-center justify-center gap-3 text-slate-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading coupons…
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-orange-500" />
                </th>
                {['Code', 'Discount', 'Min Order', 'Usage', 'Per User', 'Expires', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2e]">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      No coupons found
                    </div>
                  </td>
                </tr>
              ) : coupons.map(coupon => {
                const status   = coupon.status || getStatus(coupon);
                const typeCfg  = TYPE_CFG[coupon.type] || TYPE_CFG.fixed;
                const inactive = status !== 'active';

                return (
                  <tr key={coupon._id} className={`group hover:bg-white/[0.02] transition-colors ${selected.includes(coupon._id) ? 'bg-orange-500/5' : ''} ${inactive ? 'opacity-60' : ''}`}>

                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(coupon._id)} onChange={() => toggleOne(coupon._id)} className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-orange-500" />
                    </td>

                    {/* Code */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-orange-400 text-sm tracking-widest bg-orange-500/5 border border-orange-500/10 px-2 py-0.5 rounded">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-slate-300 transition-all"
                          title="Copy code"
                        >
                          {copied === coupon.code
                            ? <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          }
                        </button>
                      </div>
                      {coupon.description && <p className="text-xs text-slate-600 mt-0.5 max-w-[160px] truncate">{coupon.description}</p>}
                    </td>

                    {/* Discount type */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${typeCfg.cls}`}>
                        {typeCfg.label(coupon.value)}
                      </span>
                    </td>

                    {/* Min order */}
                    <td className="px-4 py-3">
                      {coupon.minOrderAmount > 0
                        ? <span className="text-xs text-slate-300">৳{coupon.minOrderAmount.toLocaleString()}</span>
                        : <span className="text-xs text-slate-600">No minimum</span>
                      }
                    </td>

                    {/* Usage */}
                    <td className="px-4 py-3">
                      <UsageBar used={coupon.usedCount || 0} max={coupon.maxUses} />
                    </td>

                    {/* Per user */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">
                        {coupon.maxUsesPerUser ? `${coupon.maxUsesPerUser}x` : '∞'}
                      </span>
                    </td>

                    {/* Expiry */}
                    <td className="px-4 py-3">
                      <ExpiryCell expiresAt={coupon.expiresAt} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <button onClick={() => onToggle(coupon._id)} title="Click to toggle">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer ${STATUS_CFG[status]?.cls}`}>
                          {STATUS_CFG[status]?.label || status}
                        </span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(coupon)} className="p-1.5 rounded-lg hover:bg-violet-500/10 text-slate-400 hover:text-violet-400 transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(coupon)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div className="px-4 py-3 border-t border-[#1e1e2e] flex items-center justify-between text-sm">
            <span className="text-slate-500 text-xs">Page {pagination.page} of {pagination.pages} · {pagination.total} coupons</span>
            <div className="flex items-center gap-1">
              <button disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)} className="px-3 py-1 rounded-lg border border-[#1e1e2e] text-slate-400 text-xs hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed">← Prev</button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const p = Math.max(1, pagination.page - 2) + i;
                if (p > pagination.pages) return null;
                return <button key={p} onClick={() => onPageChange(p)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === pagination.page ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-white/5'}`}>{p}</button>;
              })}
              <button disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)} className="px-3 py-1 rounded-lg border border-[#1e1e2e] text-slate-400 text-xs hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed">Next →</button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          coupon={deleteTarget}
          onConfirm={() => { onDelete(deleteTarget._id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
