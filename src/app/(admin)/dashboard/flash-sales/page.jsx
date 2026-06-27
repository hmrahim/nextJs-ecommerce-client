// 📁 PATH: src/app/(admin)/dashboard/flash-sales/page.jsx

'use client';
import { useState, useEffect, useCallback } from 'react';
import { flashSaleService }   from '@/services/flashSaleService';
import { DUMMY_SALES, getSaleStatus } from '@/components/admin/flash-sales/_dummyData';
import FlashSaleStatsBar from '@/components/admin/flash-sales/FlashSaleStatsBar';
import FlashSaleFilters  from '@/components/admin/flash-sales/FlashSaleFilters';
import FlashSaleTable    from '@/components/admin/flash-sales/FlashSaleTable';
import FlashSaleFormModal from '@/components/admin/flash-sales/FlashSaleFormModal';

export default function FlashSalesPage() {
  const [sales, setSales]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters]       = useState({ search: '', status: '', discountType: '', sort: 'newest' });
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);

  /* ── load ─────────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Read current page via functional updater to avoid adding pagination
      // to deps (which would cause an infinite re-render loop).
      let currentPage;
      setPagination(p => { currentPage = p.page; return p; });
      const res = await flashSaleService.adminGetAll({
        page:  currentPage,
        limit: 20,
        search:       filters.search       || undefined,
        status:       filters.status       || undefined,
        discountType: filters.discountType || undefined,
        sort:         filters.sort,
      });
      const d = res.data;
      const list = (d.flashSales ?? d.data ?? []).map(s => ({ ...s, status: getSaleStatus(s) }));
      setSales(list);
      setPagination(p => ({ ...p, total: d.total ?? list.length, pages: d.pages ?? 1 }));
      setUsingDummy(false);
    } catch {
      // fallback to dummy data
      let list = DUMMY_SALES.map(s => ({ ...s, status: getSaleStatus(s) }));
      const q = filters.search?.toLowerCase();
      if (q)                   list = list.filter(s => s.name.toLowerCase().includes(q) || s.slug?.includes(q));
      if (filters.status)      list = list.filter(s => s.status === filters.status);
      if (filters.discountType)list = list.filter(s => s.discountType === filters.discountType);
      if (filters.sort === 'revenue')   list = [...list].sort((a,b) => (b.revenue||0) - (a.revenue||0));
      if (filters.sort === 'startTime') list = [...list].sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
      if (filters.sort === 'oldest')    list = [...list].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
      setSales(list);
      setPagination({ page: 1, total: list.length, pages: 1 });
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  /* ── CRUD ─────────────────────────────────────────────────────── */
  const handleSave = async (data) => {
    if (usingDummy) {
      if (editing) {
        setSales(p => p.map(s => s._id === editing._id
          ? { ...s, ...data, status: getSaleStatus({ ...s, ...data }) }
          : s
        ));
      } else {
        const ns = {
          ...data,
          _id: 'fs_' + Date.now(),
          soldCount: 0, revenue: 0,
          products: [],
          createdAt: new Date().toISOString(),
          status: getSaleStatus(data),
        };
        setSales(p => [ns, ...p]);
      }
    } else {
      if (editing) await flashSaleService.adminUpdate(editing._id, data);
      else         await flashSaleService.adminCreate(data);
      load();
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this flash sale?')) return;
    if (usingDummy) { setSales(p => p.filter(s => s._id !== id)); return; }
    await flashSaleService.adminDelete(id); load();
  };

  const handleToggle = async (id) => {
    if (usingDummy) {
      setSales(p => p.map(s => {
        if (s._id !== id) return s;
        const updated = { ...s, isActive: !s.isActive };
        return { ...updated, status: getSaleStatus(updated) };
      }));
      return;
    }
    await flashSaleService.adminToggle(id); load();
  };

  const handleBulkDelete = async (ids) => {
    if (!confirm(`Delete ${ids.length} flash sale(s)?`)) return;
    if (usingDummy) { setSales(p => p.filter(s => !ids.includes(s._id))); return; }
    await flashSaleService.adminBulkDelete(ids); load();
  };

  const handleDuplicate = async (id) => {
    if (usingDummy) {
      const orig = sales.find(s => s._id === id);
      if (!orig) return;
      const dup = { ...orig, _id: 'fs_' + Date.now(), name: orig.name + ' (Copy)', slug: orig.slug + '-copy', status: 'draft', isActive: false, soldCount: 0, revenue: 0, createdAt: new Date().toISOString() };
      setSales(p => [dup, ...p]);
      return;
    }
    await flashSaleService.adminDuplicate(id); load();
  };

  const handleViewProducts = (sale) => {
    // placeholder — open a product management modal/drawer
    alert(`Manage products for: ${sale.name}\n(Connect your ProductsModal here)`);
  };

  const handleFilterChange = (f) => {
    setFilters(f);
    setPagination(p => ({ ...p, page: 1 }));
  };

  /* ── render ───────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">⚡ Flash Sales</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage limited-time flash sales, discounts, and stock offers.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-900/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Flash Sale
        </button>
      </div>

      {/* Demo notice */}
      {usingDummy && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Demo mode — Connect backend to see real flash sales data. All CRUD operations work locally.
        </div>
      )}

      {/* Stats bar */}
      <FlashSaleStatsBar sales={sales} />

      {/* Filters */}
      <FlashSaleFilters
        filters={filters}
        onChange={handleFilterChange}
        total={pagination.total || sales.length}
      />

      {/* Table */}
      <FlashSaleTable
        sales={sales}
        loading={loading}
        onEdit={(s) => { setEditing(s); setModalOpen(true); }}
        onDelete={handleDelete}
        onToggle={handleToggle}
        onDuplicate={handleDuplicate}
        onViewProducts={handleViewProducts}
        onBulkDelete={handleBulkDelete}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPagination(prev => ({ ...prev, page: p }))}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                pagination.page === p
                  ? 'bg-orange-500 text-white'
                  : 'bg-[#1a1a25] text-slate-400 border border-[#2e2e3e] hover:text-white hover:border-orange-500/40'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <FlashSaleFormModal
          editing={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}