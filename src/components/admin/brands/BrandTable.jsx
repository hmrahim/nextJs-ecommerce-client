// 📁 PATH: src/components/admin/brands/BrandTable.jsx

'use client';
import { useState } from 'react';

/* ── Delete Confirm Modal ────────────────────────────────────────────────────── */
function ConfirmDelete({ brand, onConfirm, onCancel }) {
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
        <h3 className="text-white font-semibold text-center mb-1">Delete Brand?</h3>
        <p className="text-slate-400 text-sm text-center mb-4">
          <span className="text-white font-medium">{brand?.name}</span> permanently delete হবে।
          এই brand এর সাথে linked products গুলো unbranded হয়ে যাবে।
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
            Delete Brand
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Brand Logo ──────────────────────────────────────────────────────────────── */
function BrandLogo({ brand }) {
  const [imgErr, setImgErr] = useState(false);
  const initials = brand.name.slice(0, 2).toUpperCase();

  if (brand.logoUrl && !imgErr) {
    return (
      <div className="w-11 h-11 rounded-xl border border-[#1e1e2e] bg-white flex items-center justify-center overflow-hidden flex-shrink-0 p-1.5">
        <img
          src={brand.logoUrl}
          alt={brand.name}
          className="w-full h-full object-contain"
          onError={() => setImgErr(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-xl border border-[#1e1e2e] bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-violet-400">{initials}</span>
    </div>
  );
}

/* ── Toggle Switch ───────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, color = 'emerald' }) {
  const TRACK = {
    emerald: checked ? 'bg-emerald-500' : 'bg-[#1e1e2e]',
    amber:   checked ? 'bg-amber-500'   : 'bg-[#1e1e2e]',
  };
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${TRACK[color]}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

/* ── Empty State ─────────────────────────────────────────────────────────────── */
function EmptyState({ hasSearch }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-violet-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      </div>
      <p className="text-white font-medium">
        {hasSearch ? 'No brands found' : 'No brands yet'}
      </p>
      <p className="text-slate-500 text-sm mt-1">
        {hasSearch ? 'Try a different search term' : 'Add your first brand to get started'}
      </p>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="space-y-0">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#1e1e2e] animate-pulse">
          <div className="w-11 h-11 rounded-xl bg-white/5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 bg-white/5 rounded" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
          <div className="h-3 w-16 bg-white/5 rounded hidden md:block" />
          <div className="h-3 w-12 bg-white/5 rounded hidden lg:block" />
          <div className="h-5 w-9 bg-white/5 rounded-full hidden sm:block" />
          <div className="h-5 w-9 bg-white/5 rounded-full hidden sm:block" />
          <div className="h-8 w-20 bg-white/5 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/* ── Main Table ──────────────────────────────────────────────────────────────── */
export default function BrandTable({ brands, loading, onEdit, onDelete, onToggleActive, onToggleFeatured }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sortField, setSortField]       = useState('sortOrder');
  const [sortDir, setSortDir]           = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = [...brands].sort((a, b) => {
    let av = a[sortField], bv = b[sortField];
    if (typeof av === 'string') av = av.toLowerCase(), bv = bv?.toLowerCase() ?? '';
    if (sortDir === 'asc') return av > bv ? 1 : -1;
    return av < bv ? 1 : -1;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return (
      <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
    return (
      <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {sortDir === 'asc'
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        }
      </svg>
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#0d0d14] overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 px-5 py-3 border-b border-[#1e1e2e] bg-[#0a0a0f]">
          {[
            { label: 'Brand',    field: 'name',         cls: '' },
            { label: 'Country',  field: 'country',      cls: 'hidden lg:flex' },
            { label: 'Products', field: 'productCount', cls: 'hidden xl:flex' },
            { label: 'Active',   field: 'isActive',     cls: '' },
            { label: 'Featured', field: 'isFeatured',   cls: '' },
            { label: 'Actions',  field: null,           cls: '' },
          ].map(col => (
            <div
              key={col.label}
              className={`flex items-center gap-1 text-xs font-medium text-slate-500 uppercase tracking-wider ${col.cls} ${col.field ? 'cursor-pointer hover:text-slate-300 select-none' : ''}`}
              onClick={() => col.field && handleSort(col.field)}
            >
              {col.label}
              {col.field && <SortIcon field={col.field} />}
            </div>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <Skeleton />
        ) : sorted.length === 0 ? (
          <EmptyState hasSearch={brands.length > 0} />
        ) : (
          <div>
            {sorted.map((brand, idx) => (
              <div
                key={brand._id}
                className={`group flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto_auto_auto] md:items-center gap-3 md:gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02] ${idx < sorted.length - 1 ? 'border-b border-[#1e1e2e]' : ''}`}
              >
                {/* Brand name + logo */}
                <div className="flex items-center gap-3 min-w-0">
                  <BrandLogo brand={brand} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white truncate">{brand.name}</span>
                      {brand.isFeatured && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20 flex-shrink-0">
                          ⭐ Featured
                        </span>
                      )}
                      {!brand.isActive && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/20 flex-shrink-0">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">/{brand.slug}</p>
                  </div>
                </div>

                {/* Country */}
                <div className="hidden lg:flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{brand.country || '—'}</span>
                </div>

                {/* Product count */}
                <div className="hidden xl:flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white">{(brand.productCount || 0).toLocaleString()}</span>
                  <span className="text-xs text-slate-500">products</span>
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-2 md:justify-center">
                  <span className="md:hidden text-xs text-slate-500 w-14">Active</span>
                  <Toggle
                    checked={brand.isActive}
                    onChange={() => onToggleActive(brand._id)}
                    color="emerald"
                  />
                </div>

                {/* Featured toggle */}
                <div className="flex items-center gap-2 md:justify-center">
                  <span className="md:hidden text-xs text-slate-500 w-14">Featured</span>
                  <Toggle
                    checked={brand.isFeatured}
                    onChange={() => onToggleFeatured(brand._id)}
                    color="amber"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                      title="Visit website"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => onEdit(brand)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                    title="Edit brand"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(brand)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete brand"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer count */}
        {!loading && sorted.length > 0 && (
          <div className="px-5 py-3 border-t border-[#1e1e2e] bg-[#0a0a0f] flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Showing <span className="text-slate-400">{sorted.length}</span> brand{sorted.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDelete
          brand={deleteTarget}
          onConfirm={() => { onDelete(deleteTarget._id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
