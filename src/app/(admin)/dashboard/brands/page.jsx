
'use client';
import { useState, useMemo } from 'react';
import BrandTable     from '@/components/admin/brands/BrandTable';
import BrandFormModal from '@/components/admin/brands/BrandFormModal';
import {
  useAdminBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
  useToggleBrand,
  useToggleBrandFeatured,
  useBulkDeleteBrands,
  useBulkActivateBrands,
  useBulkDeactivateBrands,
} from '@/hooks/useBrands';

// ── Bulk bar ──────────────────────────────────────────────────────────────────
function BulkBar({ count, onDelete, onActivate, onDeactivate, onClear }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex-wrap">
      <span className="text-sm font-semibold text-amber-300">{count} selected</span>
      <div className="flex items-center gap-2 ml-auto flex-wrap">
        <button onClick={onActivate}   className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors">✓ Activate</button>
        <button onClick={onDeactivate} className="px-3 py-1.5 rounded-lg bg-slate-600/80 hover:bg-slate-600 text-white text-xs font-semibold transition-colors">⏸ Deactivate</button>
        <button onClick={onDelete}     className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors">🗑 Delete</button>
        <button onClick={onClear}      className="px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-500 hover:text-slate-300 text-xs transition-colors">Clear</button>
      </div>
    </div>
  );
}

export default function BrandsPage() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | inactive | featured

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selected,  setSelected]  = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data, isLoading } = useAdminBrands({ search, filterStatus });
  const brands = data?.brands ?? [];
  const stats  = data?.stats  ?? {};

  // ── Client-side filter (fallback If backend filter without doing) ──────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return brands.filter((b) => {
      const matchSearch = b.name.toLowerCase().includes(q) || b.country?.toLowerCase().includes(q);
      if (filterStatus === 'active')   return matchSearch && b.isActive && !b.isFeatured;
      if (filterStatus === 'inactive') return matchSearch && !b.isActive;
      if (filterStatus === 'featured') return matchSearch && b.isFeatured;
      return matchSearch;
    });
  }, [brands, search, filterStatus]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createBrand     = useCreateBrand();
  const updateBrand     = useUpdateBrand();
  const deleteBrand     = useDeleteBrand();
  const toggleActive    = useToggleBrand();
  const toggleFeatured  = useToggleBrandFeatured();
  const bulkDelete      = useBulkDeleteBrands();
  const bulkActivate    = useBulkActivateBrands();
  const bulkDeactivate  = useBulkDeactivateBrands();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (brand) => { setEditing(brand); setModalOpen(true); };

  const handleSave = async (formData) => {
    if (editing) {
      await updateBrand.mutateAsync({ id: editing._id, data: formData });
    } else {
  
      await createBrand.mutateAsync(formData);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    
    deleteBrand.mutate(id);
    setSelected((prev) => prev.filter((x) => x !== id));
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selected.length} brand(s)?`)) return;
    bulkDelete.mutate(selected, { onSuccess: () => setSelected([]) });
  };
  const handleBulkActivate = () =>
    bulkActivate.mutate(selected, { onSuccess: () => setSelected([]) });
  const handleBulkDeactivate = () =>
    bulkDeactivate.mutate(selected, { onSuccess: () => setSelected([]) });

  // ── Stats cards ───────────────────────────────────────────────────────────
  const STATS_CONFIG = [
    {
      label: 'Total Brands',
      value: stats.total ?? 0,
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      bg: 'from-violet-500/15 to-violet-500/5', border: 'border-violet-500/20', text: 'text-violet-400',
    },
    {
      label: 'Active Brands',
      value: stats.active ?? 0,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      bg: 'from-emerald-500/15 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400',
    },
    {
      label: 'Featured Brands',
      value: stats.featured ?? 0,
      icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      bg: 'from-amber-500/15 to-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400',
    },
    {
      label: 'Total Products',
      value: (stats.totalProducts ?? 0).toLocaleString(),
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      bg: 'from-sky-500/15 to-sky-500/5', border: 'border-sky-500/20', text: 'text-sky-400',
    },
  ];

  const FILTER_TABS = [
    { key: 'all',      label: 'All Brands', count: stats.total      ?? 0 },
    { key: 'active',   label: 'Active',     count: stats.activeOnly ?? 0 },
    { key: 'featured', label: 'Featured',   count: stats.featured   ?? 0 },
    { key: 'inactive', label: 'Inactive',   count: stats.inactive   ?? 0 },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Brands</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage all your product brands — logos, SEO, featured status.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors shadow-lg shadow-amber-900/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Brand
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS_CONFIG.map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.bg} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.text} bg-white/5`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.icon} />
              </svg>
            </div>
            <div>
              {isLoading
                ? <div className="h-7 w-10 rounded bg-white/5 animate-pulse mb-1" />
                : <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              }
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search brands by name or country…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-8 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterStatus === tab.key
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                filterStatus === tab.key ? 'bg-black/20 text-black/70' : 'bg-white/5 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk bar */}
      <BulkBar
        count={selected.length}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onDelete={handleBulkDelete}
        onClear={() => setSelected([])}
      />

      {/* Table */}
      <BrandTable
        brands={filtered}
        loading={isLoading}
        selected={selected}
        onSelectChange={setSelected}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleActive={(id) => toggleActive.mutate(id)}
        onToggleFeatured={(id) => toggleFeatured.mutate(id)}
      />

      {/* Modal */}
      {modalOpen && (
        <BrandFormModal
          editing={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
