// src/app/(admin)/dashboard/products/page.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  useAdminProducts,
  useArchiveProduct,
  useDeleteProduct,
  useBulkArchiveProducts,
  useBulkDeleteProducts,
  useToggleProductStatus,
} from '@/hooks/useProducts';
import ProductTable    from '@/components/admin/products/ProductTable';
import ProductFilters  from '@/components/admin/products/ProductFilters';
import ProductViewModal from '@/components/admin/products/ProductViewModal';

// ── Bulk Action Confirm Modal ─────────────────────────────────────────────────
function BulkActionModal({ count, mode, onConfirm, onCancel, isPending }) {
  const isDelete = mode === 'delete';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={!isPending ? onCancel : undefined}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDelete ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
          {isDelete ? (
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          )}
        </div>
        <h3 className="text-white font-semibold text-center mb-1">
          {isDelete ? `${count}টি Product Delete করবে?` : `${count}টি Product Archive করবে?`}
        </h3>
        <p className="text-slate-400 text-sm text-center mb-5">
          {isDelete
            ? '⚠️ DB থেকে চিরতরে মুছে যাবে, undo সম্ভব না।'
            : 'Product গুলো archived হবে, DB তে থাকবে।'}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={isPending}
            className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isPending}
            className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isDelete ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'}`}>
            {isPending ? (
              <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Processing…</>
            ) : isDelete ? `Delete ${count}` : `Archive ${count}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [page,        setPage]        = useState(1);
  const [filters,     setFilters]     = useState({ search: '', status: '', category: '', sort: '-createdAt' });
  const [selected,    setSelected]    = useState([]);
  const [viewProduct, setViewProduct] = useState(null);
  // bulk modal: null | 'archive' | 'delete'
  const [bulkMode,    setBulkMode]    = useState(null);

  // ── Queries & Mutations ────────────────────────────────────────────
  const { data, isLoading, isError } = useAdminProducts(page, filters);

  const archiveMutation      = useArchiveProduct();
  const deleteMutation       = useDeleteProduct();
  const bulkArchiveMutation  = useBulkArchiveProducts();
  const bulkDeleteMutation   = useBulkDeleteProducts();
  const toggleMutation       = useToggleProductStatus();

  const products   = data?.results || [];
  const pagination = { page, total: data?.total || 0, pages: data?.pages || 1 };

  // ── Handlers ──────────────────────────────────────────────────────
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setSelected([]);
  };

  const handleArchive = (id) => {
    archiveMutation.mutate(id, {
      onSuccess: () => setSelected(prev => prev.filter(x => x !== id)),
    });
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setSelected(prev => prev.filter(x => x !== id)),
    });
  };

  const handleToggleStatus = (id) => {
    const product = products.find(p => p._id === id);
    if (!product) return;
    toggleMutation.mutate(
      { id, currentStatus: product.status },
      {
        onSuccess: () => {
          if (viewProduct?._id === id) {
            setViewProduct(prev => ({
              ...prev,
              status: prev.status === 'active' ? 'draft' : 'active',
            }));
          }
        },
      }
    );
  };

  const handleBulkConfirm = () => {
    if (bulkMode === 'archive') {
      bulkArchiveMutation.mutate(selected, {
        onSuccess: () => { setSelected([]); setBulkMode(null); },
      });
    } else if (bulkMode === 'delete') {
      bulkDeleteMutation.mutate(selected, {
        onSuccess: () => { setSelected([]); setBulkMode(null); },
      });
    }
  };

  const bulkIsPending = bulkArchiveMutation.isPending || bulkDeleteMutation.isPending;

  // ── Stats ──────────────────────────────────────────────────────────
  const statsCards = [
    { label: 'Total',    value: pagination.total,                                     icon: '📦', color: 'from-violet-500/20 to-violet-500/5',  border: 'border-violet-500/20',  text: 'text-violet-400'  },
    { label: 'Active',   value: products.filter(p => p.status === 'active').length,   icon: '✅', color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    { label: 'Draft',    value: products.filter(p => p.status === 'draft').length,    icon: '📝', color: 'from-slate-500/20 to-slate-500/5',    border: 'border-slate-500/20',   text: 'text-slate-400'   },
    { label: 'Archived', value: products.filter(p => p.status === 'archived').length, icon: '🗄️', color: 'from-amber-500/20 to-amber-500/5',    border: 'border-amber-500/20',   text: 'text-amber-400'   },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Products</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your entire product catalog.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk actions — selected থাকলে দেখাবে */}
          {selected.length > 0 && (
            <>
              {/* Bulk Archive */}
              <button
                onClick={() => setBulkMode('archive')}
                disabled={bulkIsPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Archive {selected.length}
              </button>

              {/* Bulk Delete */}
              <button
                onClick={() => setBulkMode('delete')}
                disabled={bulkIsPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete {selected.length}
              </button>
            </>
          )}

          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-900/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map(s => (
          <div key={s.label} className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.color} p-4`}>
            <span className="text-lg">{s.icon}</span>
            <p className={`text-2xl font-bold mt-2 ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <ProductFilters filters={filters} onChange={handleFilterChange} />

      {/* Error */}
      {isError && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Failed to load products. Please try again.
        </div>
      )}

      {/* Table */}
      <ProductTable
        products={products}
        loading={isLoading}
        selected={selected}
        onSelectChange={setSelected}
        onView={setViewProduct}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        archivingId={archiveMutation.isPending ? archiveMutation.variables : null}
        deletingId={deleteMutation.isPending  ? deleteMutation.variables  : null}
        pagination={pagination}
        onPageChange={p => { setPage(p); setSelected([]); }}
      />

      {/* View Modal */}
      {viewProduct && (
        <ProductViewModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Bulk Action Confirm Modal */}
      {bulkMode && (
        <BulkActionModal
          count={selected.length}
          mode={bulkMode}
          onConfirm={handleBulkConfirm}
          onCancel={() => !bulkIsPending && setBulkMode(null)}
          isPending={bulkIsPending}
        />
      )}

    </div>
  );
}