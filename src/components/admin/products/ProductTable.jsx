// src/components/admin/products/ProductTable.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';

const STATUS_CONFIG = {
  active:       { label: 'Active',       cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  draft:        { label: 'Draft',        cls: 'bg-slate-500/10  text-slate-400  border-slate-500/20'  },
  out_of_stock: { label: 'Out of Stock', cls: 'bg-red-500/10    text-red-400    border-red-500/20'    },
  low_stock:    { label: 'Low Stock',    cls: 'bg-amber-500/10  text-amber-400  border-amber-500/20'  },
  archived:     { label: 'Archived',     cls: 'bg-gray-500/10   text-gray-500   border-gray-500/20'   },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function ProductImage({ images, name }) {
  const src = images?.[0]?.url || (typeof images?.[0] === 'string' ? images[0] : null);
  if (src) return <img src={src} alt={name} className="w-9 h-9 rounded-lg object-cover" />;
  const initials = name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
      {initials}
    </div>
  );
}

// ── Archive Confirm Modal ─────────────────────────────────────────────────────
function ConfirmArchiveModal({ product, onConfirm, onCancel, isPending }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={!isPending ? onCancel : undefined}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          {/* Archive icon */}
          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-center mb-1">Archive Product?</h3>
        <p className="text-slate-400 text-sm text-center mb-1">
          &ldquo;{product?.name}&rdquo; archived will be।
        </p>
        <p className="text-slate-500 text-xs text-center mb-5">Product The list will move away from but DB will be in।</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Archiving…</>
            ) : 'Archive'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hard Delete Confirm Modal ─────────────────────────────────────────────────
function ConfirmDeleteModal({ product, onConfirm, onCancel, isPending }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={!isPending ? onCancel : undefined}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-center mb-1">Permanently Delete?</h3>
        <p className="text-slate-400 text-sm text-center mb-1">
          &ldquo;{product?.name}&rdquo; will be permanently deleted।
        </p>
        <p className="text-red-400/70 text-xs text-center mb-5">⚠️ This undo cannot be done।</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Deleting…</>
            ) : 'Delete Forever'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────
export default function ProductTable({
  products = [],
  loading,
  selected = [],
  onSelectChange,
  onArchive,        // (id) => void — soft-delete
  onDelete,         // (id) => void — hard-delete
  onToggleStatus,   // (id) => void
  onView,           // (product) => void
  archivingId,      // id | null
  deletingId,       // id | null
  pagination,
  onPageChange,
}) {
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);

  const allSelected = products.length > 0 && selected.length === products.length;
  const toggleAll   = () => onSelectChange(allSelected ? [] : products.map(p => p._id));
  const toggleOne   = (id) => onSelectChange(
    selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
  );

  const doArchive = () => {
    if (!archiveTarget) return;
    onArchive(archiveTarget._id);
    setArchiveTarget(null);
  };

  const doDelete = () => {
    if (!deleteTarget) return;
    console.log('🗑️ Hard deleting product id:', deleteTarget._id);
    onDelete(deleteTarget._id);
    setDeleteTarget(null);
  };

  const COLS = ['', 'Product', 'SKU', 'Price', 'Stock', 'Status', 'Sales', ''];

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
        <div className="p-8 flex items-center justify-center gap-3 text-slate-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading products…
        </div>
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
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-violet-500" />
                </th>
                {COLS.slice(1).map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1e1e2e]">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>No products found</span>
                    </div>
                  </td>
                </tr>
              ) : products.map((product) => {
                const isArchiving = archivingId === product._id;
                const isDeleting  = deletingId  === product._id;
                const isBusy      = isArchiving || isDeleting;

                return (
                  <tr
                    key={product._id}
                    className={`group transition-all ${
                      selected.includes(product._id) ? 'bg-violet-500/5' : 'hover:bg-white/[0.02]'
                    } ${isBusy ? 'opacity-40 pointer-events-none' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(product._id)} onChange={() => toggleOne(product._id)}
                        className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-violet-500" />
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <ProductImage images={product.images} name={product.name} />
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate max-w-[180px]">{product.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-3">
                      <span className="text-slate-400 font-mono text-xs">{product.sku || '—'}</span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <span className="text-white font-semibold">SAR {product.price?.toLocaleString()}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="ml-1.5 text-xs text-slate-500 line-through">SAR {product.comparePrice?.toLocaleString()}</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-400' : product.stock <= 5 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {product.stock}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <button onClick={() => onToggleStatus?.(product._id)} title="Click to toggle active/draft" className="hover:opacity-80 transition-opacity">
                        <StatusBadge status={product.status} />
                      </button>
                    </td>

                    {/* Sales */}
                    <td className="px-4 py-3">
                      <span className="text-slate-400">{product.sold ?? 0}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                        {/* View */}
                        <button onClick={() => onView?.(product)}
                          className="p-1.5 rounded-lg hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 transition-colors" title="View">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Edit */}
                        <Link href={`/dashboard/products/${product._id}`}
                          className="p-1.5 rounded-lg hover:bg-violet-500/10 text-slate-400 hover:text-violet-400 transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>

                        {/* Archive — amber */}
                        <button onClick={() => setArchiveTarget(product)}
                          className="p-1.5 rounded-lg hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 transition-colors" title="Archive">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </button>

                        {/* Delete — red */}
                        <button onClick={() => setDeleteTarget(product)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors" title="Delete Forever">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        {pagination && pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-[#1e1e2e] flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.pages} · {pagination.total} products
            </span>
            <div className="flex items-center gap-1">
              <button disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}
                className="px-3 py-1 rounded-lg border border-[#1e1e2e] text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                ← Prev
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const p = Math.max(1, pagination.page - 2) + i;
                if (p > pagination.pages) return null;
                return (
                  <button key={p} onClick={() => onPageChange(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === pagination.page ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                    {p}
                  </button>
                );
              })}
              <button disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)}
                className="px-3 py-1 rounded-lg border border-[#1e1e2e] text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Archive Confirm */}
      {archiveTarget && (
        <ConfirmArchiveModal
          product={archiveTarget}
          onConfirm={doArchive}
          onCancel={() => setArchiveTarget(null)}
          isPending={archivingId === archiveTarget._id}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDeleteModal
          product={deleteTarget}
          onConfirm={doDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={deletingId === deleteTarget._id}
        />
      )}
    </>
  );
}