// 📁 PATH: src/components/admin/bundles/BundleTable.jsx
// ⚠️  This is a completely new file

'use client';
import { useState } from 'react';

const STATUS_CFG = {
  active:   { label: 'Active',   cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  inactive: { label: 'Inactive', cls: 'bg-slate-700/30 text-slate-400 border-slate-700/50' },
  expired:  { label: 'Expired',  cls: 'bg-slate-700/30 text-slate-500 border-slate-700/50' },
};

function getStatus(bundle) {
  if (!bundle.isActive) return 'inactive';
  if (bundle.validUntil && new Date(bundle.validUntil) < new Date()) return 'expired';
  return 'active';
}

function SavingsBadge({ original, bundle }) {
  if (!original || original <= bundle) return null;
  const pct = Math.round(((original - bundle) / original) * 100);
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      -{pct}%
    </span>
  );
}

function StockBar({ stock, threshold = 10 }) {
  if (stock === undefined || stock === null) return <span className="text-xs text-slate-600">—</span>;
  const isLow = stock > 0 && stock <= threshold;
  const isEmpty = stock === 0;
  return (
    <span className={`text-xs font-medium ${isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-slate-300'}`}>
      {isEmpty ? 'Out of stock' : isLow ? `Low (${stock})` : stock}
    </span>
  );
}

function ValidityCell({ validFrom, validUntil }) {
  const now = new Date();
  if (!validFrom && !validUntil) return <span className="text-xs text-slate-600">Always on</span>;

  const from = validFrom ? new Date(validFrom) : null;
  const until = validUntil ? new Date(validUntil) : null;
  const expired = until && until < now;
  const notStarted = from && from > now;
  const daysLeft = until ? Math.ceil((until - now) / 86400000) : null;

  return (
    <div>
      {from && (
        <p className="text-[10px] text-slate-600">
          From {from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </p>
      )}
      {until && (
        <p className={`text-xs font-medium ${expired ? 'text-slate-600 line-through' : daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-amber-400' : 'text-slate-400'}`}>
          {until.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      )}
      {!expired && daysLeft !== null && (
        <p className={`text-[10px] ${daysLeft <= 3 ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-slate-600'}`}>
          {daysLeft === 0 ? 'Ends today!' : notStarted ? 'Not started' : `${daysLeft}d left`}
        </p>
      )}
      {expired && <p className="text-[10px] text-slate-700">Expired</p>}
    </div>
  );
}

function ConfirmDeleteModal({ bundle, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-center mb-1">Delete Bundle?</h3>
        <p className="text-slate-400 text-sm text-center mb-5">
          "<span className="text-violet-400 font-semibold">{bundle?.name}</span>" permanently delete will be। This undo cannot be done।
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BundleTable({
  bundles, loading, selected, onSelectChange,
  onEdit, onDelete, onToggle, pagination, onPageChange,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const allSelected = bundles.length > 0 && selected.length === bundles.length;
  const toggleAll = () => onSelectChange(allSelected ? [] : bundles.map(b => b._id));
  const toggleOne = id => onSelectChange(
    selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-10 flex items-center justify-center gap-3 text-slate-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading bundles…
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
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-violet-500"
                  />
                </th>
                {['Bundle', 'Products', 'Bundle Price', 'Stock', 'Sold', 'Validity', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1e1e2e]">
              {bundles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="font-medium">No bundles found</p>
                      <p className="text-xs text-slate-600">Create your first bundle to offer combo deals.</p>
                    </div>
                  </td>
                </tr>
              ) : bundles.map(bundle => {
                const status = bundle.status || getStatus(bundle);
                const inactive = status !== 'active';
                const isSelected = selected.includes(bundle._id);

                return (
                  <tr
                    key={bundle._id}
                    className={`group hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-violet-500/5' : ''} ${inactive ? 'opacity-60' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(bundle._id)}
                        className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-violet-500"
                      />
                    </td>

                    {/* Bundle name + image */}
                    <td className="px-4 py-3 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail — stacked product images or placeholder */}
                        <div className="relative w-10 h-10 flex-shrink-0">
                          {bundle.image ? (
                            <img
                              src={bundle.image}
                              alt={bundle.name}
                              className="w-10 h-10 rounded-lg object-cover border border-[#1e1e2e]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#1e1e2e] border border-[#2a2a3a] flex items-center justify-center">
                              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          )}
                          {/* Product count badge */}
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center">
                            {bundle.products?.length || 0}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate max-w-[160px]">{bundle.name}</p>
                          {bundle.sku && (
                            <p className="text-[10px] text-slate-600 font-mono mt-0.5">{bundle.sku}</p>
                          )}
                          {bundle.description && (
                            <p className="text-[10px] text-slate-600 mt-0.5 truncate max-w-[160px]">{bundle.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Products list */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 max-w-[180px]">
                        {(bundle.products || []).slice(0, 3).map((p, i) => (
                          <p key={i} className="text-xs text-slate-400 truncate">
                            <span className="text-slate-600 mr-1">×{p.quantity || 1}</span>
                            {p.name || p.productName || 'Product'}
                          </p>
                        ))}
                        {(bundle.products || []).length > 3 && (
                          <p className="text-[10px] text-slate-600">
                            +{bundle.products.length - 3} more
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white">
                            SAR {(bundle.bundlePrice || bundle.price || 0).toLocaleString()}
                          </span>
                          <SavingsBadge
                            original={bundle.originalPrice || bundle.comparePrice}
                            bundle={bundle.bundlePrice || bundle.price}
                          />
                        </div>
                        {(bundle.originalPrice || bundle.comparePrice) > 0 && (
                          <span className="text-xs text-slate-600 line-through">
                            SAR {(bundle.originalPrice || bundle.comparePrice).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <StockBar stock={bundle.stock} />
                    </td>

                    {/* Sold */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">
                        {(bundle.sold || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Validity */}
                    <td className="px-4 py-3">
                      <ValidityCell validFrom={bundle.validFrom} validUntil={bundle.validUntil} />
                    </td>

                    {/* Status — clickable toggle */}
                    <td className="px-4 py-3">
                      <button onClick={() => onToggle(bundle._id)} title="Click to toggle status">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer ${STATUS_CFG[status]?.cls || STATUS_CFG.inactive.cls}`}>
                          {STATUS_CFG[status]?.label || status}
                        </span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(bundle)}
                          className="p-1.5 rounded-lg hover:bg-violet-500/10 text-slate-400 hover:text-violet-400 transition-colors"
                          title="Edit bundle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(bundle)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete bundle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
            <span className="text-slate-500 text-xs">
              Page {pagination.page} of {pagination.pages} · {pagination.total} bundles
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
                className="px-3 py-1 rounded-lg border border-[#1e1e2e] text-slate-400 text-xs hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const p = Math.max(1, pagination.page - 2) + i;
                if (p > pagination.pages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === pagination.page ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => onPageChange(pagination.page + 1)}
                className="px-3 py-1 rounded-lg border border-[#1e1e2e] text-slate-400 text-xs hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          bundle={deleteTarget}
          onConfirm={() => { onDelete(deleteTarget._id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
