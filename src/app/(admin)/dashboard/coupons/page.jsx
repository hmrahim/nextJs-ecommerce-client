// 📁 PATH: src/app/(admin)/dashboard/coupons/page.jsx
// ⚠️ old page.jsx instead of REPLACE Do
// react-query hooks by fully wired — any dummy fallback isn't

'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import CouponTable     from '@/components/admin/coupons/CouponTable';
import CouponFormModal from '@/components/admin/coupons/CouponFormModal';
import CouponFilters   from '@/components/admin/coupons/CouponFilters';

import {
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useBulkDeleteCoupons,
  useToggleCoupon,
  deriveStatus,
} from '@/hooks/useCoupons';

const LIMIT = 15;

export default function CouponsPage() {
  // ── URL-less local UI state ──────────────────────────────────────────────
  const [filters, setFilters]   = useState({ search: '', status: '', type: '', sort: 'createdAt:desc' });
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);

  // ── react-query: list ────────────────────────────────────────────────────
  const queryFilters = useMemo(() => ({ ...filters, page, limit: LIMIT }), [filters, page]);
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminCoupons(queryFilters);

  const coupons    = data?.coupons || [];
  const pagination = { page, total: data?.total || 0, pages: data?.pages || 1 };
  const stats      = useMemo(() => {
    const s = data?.stats || {};
    const totalUses = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    const savings   = coupons.reduce((sum, c) => {
      if (c.type === 'fixed')   return sum + (c.value || 0) * (c.usedCount || 0);
      if (c.type === 'percent') return sum + Math.round(((c.minOrderAmount || 1000) * (c.value || 0) / 100) * (c.usedCount || 0));
      return sum;
    }, 0);
    return {
      total:     s.total     ?? coupons.length,
      active:    s.active    ?? coupons.filter((c) => deriveStatus(c) === 'active').length,
      expired:   s.expired   ?? coupons.filter((c) => deriveStatus(c) === 'expired').length,
      exhausted: s.exhausted ?? coupons.filter((c) => deriveStatus(c) === 'exhausted').length,
      totalUses: s.totalUsed ?? s.totalUses ?? totalUses,
      savings:   s.savings   ?? savings,
    };
  }, [coupons, data]);

  // ── mutations ────────────────────────────────────────────────────────────
  const createM = useCreateCoupon();
  const updateM = useUpdateCoupon();
  const deleteM = useDeleteCoupon();
  const bulkM   = useBulkDeleteCoupons();
  const toggleM = useToggleCoupon();

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleSave = async (payload) => {
    try {
      if (editing) await updateM.mutateAsync({ id: editing._id, data: payload });
      else         await createM.mutateAsync(payload);
      setModalOpen(false);
      setEditing(null);
    } catch { /* toast handled by hook */ }
  };

  const handleDelete     = (id)  => deleteM.mutate(id);
  const handleToggle     = (id)  => toggleM.mutate(id);
  const handleBulkDelete = async () => {
    if (!selected.length) return;
    try {
      await bulkM.mutateAsync(selected);
      setSelected([]);
    } catch { /* toast handled */ }
  };

  const handleFilterChange = (f) => { setFilters(f); setPage(1); setSelected([]); };

  const openCreate = () => { setEditing(null);  setModalOpen(true); };
  const openEdit   = (c) => { setEditing(c);    setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const saving = createM.isPending || updateM.isPending;

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage discount codes for your store</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkM.isPending}
              className="h-9 px-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              Delete ({selected.length})
            </button>
          )}
          <button
            onClick={openCreate}
            className="h-9 px-4 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-900/30"
          >
            + New Coupon
          </button>
        </div>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          <span>{error?.response?.data?.message || error?.message || 'Failed to load coupons'}</span>
          <button onClick={() => refetch()} className="px-3 py-1 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total Coupons', value: stats.total,                                  icon: '🎟️', from: 'from-orange-500/20',  border: 'border-orange-500/20',  text: 'text-orange-400' },
          { label: 'Active',        value: stats.active,                                 icon: '✅', from: 'from-emerald-500/20', border: 'border-emerald-500/20', text: 'text-emerald-400' },
          { label: 'Expired',       value: stats.expired,                                icon: '⏰', from: 'from-slate-500/20',   border: 'border-slate-500/20',   text: 'text-slate-400' },
          { label: 'Exhausted',     value: stats.exhausted,                              icon: '🔴', from: 'from-red-500/20',     border: 'border-red-500/20',     text: 'text-red-400' },
          { label: 'Total Uses',    value: (stats.totalUses || 0).toLocaleString(),      icon: '📊', from: 'from-violet-500/20',  border: 'border-violet-500/20',  text: 'text-violet-400' },
          { label: 'Total Savings', value: `SAR ${(stats.savings || 0).toLocaleString()}`,  icon: '💰', from: 'from-sky-500/20',     border: 'border-sky-500/20',     text: 'text-sky-400' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.from}/5 to-transparent p-4`}>
            <div className="text-lg mb-1">{s.icon}</div>
            <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <CouponFilters filters={filters} onChange={handleFilterChange} />

      {/* Table */}
      <CouponTable
        coupons={coupons}
        loading={isLoading || isFetching}
        selected={selected}
        onSelectChange={setSelected}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* Modal */}
      {modalOpen && (
        <CouponFormModal
          editing={editing}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
        />
      )}
    </div>
  );
}
