// 📁 PATH: src/app/(admin)/dashboard/bundles/page.jsx
// ⚠️  This is a completely new file

'use client';
import { useState, useEffect, useCallback } from 'react';
import { bundleService } from '@/services/bundleService';
import BundleTable      from '@/components/admin/bundles/BundleTable';
import BundleFilters    from '@/components/admin/bundles/BundleFilters';
import BundleFormModal  from '@/components/admin/bundles/BundleFormModal';

/* ─── Dummy data (used when backend is not ready) ─────────────────────── */
const now   = new Date();
const fDays = d => new Date(now.getTime() + d * 86400000).toISOString();
const pDays = d => new Date(now.getTime() - d * 86400000).toISOString();

const DUMMY_BUNDLES = [
  {
    _id: 'b01',
    name: 'Home Office Starter Kit',
    description: 'Everything you need for a productive home office setup.',
    sku: 'BNDL-001',
    products: [
      { productId: 'p9', name: 'Mechanical Keyboard TKL',      price: 149.99, quantity: 1 },
      { productId: 'p1', name: 'Premium Wireless Headphones',  price: 129.99, quantity: 1 },
      { productId: 'p7', name: 'Stainless Steel Water Bottle', price: 24.99,  quantity: 1 },
    ],
    bundlePrice:   259.99,
    comparePrice:  304.97,
    originalPrice: 304.97,
    stock: 35,
    sold: 128,
    isActive: true,
    isFeatured: true,
    validFrom: pDays(10),
    validUntil: fDays(30),
    tags: ['office', 'bundle', 'bestseller'],
    createdAt: pDays(15),
  },
  {
    _id: 'b02',
    name: 'Morning Ritual Bundle',
    description: 'Start every day right with this curated morning wellness pack.',
    sku: 'BNDL-002',
    products: [
      { productId: 'p3', name: 'Organic Green Tea Set',              price: 34.99, quantity: 1 },
      { productId: 'p4', name: 'Ceramic Pour-Over Coffee Dripper',   price: 39.99, quantity: 1 },
    ],
    bundlePrice:   62.99,
    comparePrice:  74.98,
    originalPrice: 74.98,
    stock: 50,
    sold: 312,
    isActive: true,
    isFeatured: false,
    validFrom: null,
    validUntil: null,
    tags: ['morning', 'wellness', 'kitchen'],
    createdAt: pDays(45),
  },
  {
    _id: 'b03',
    name: 'Active Lifestyle Pack',
    description: 'Gear up for your fitness journey with this essential sports bundle.',
    sku: 'BNDL-003',
    products: [
      { productId: 'p8', name: 'Yoga Mat Premium Non-Slip',      price: 64.99, quantity: 1 },
      { productId: 'p7', name: 'Stainless Steel Water Bottle',   price: 24.99, quantity: 2 },
    ],
    bundlePrice:   99.99,
    comparePrice:  114.97,
    originalPrice: 114.97,
    stock: 0,
    sold: 87,
    isActive: true,
    isFeatured: false,
    validFrom: null,
    validUntil: null,
    tags: ['sports', 'fitness'],
    createdAt: pDays(30),
  },
  {
    _id: 'b04',
    name: 'Kitchen Essentials Set',
    description: 'Premium kitchen tools for the home chef.',
    sku: 'BNDL-004',
    products: [
      { productId: 'p5', name: 'Bamboo Cutting Board Set',            price: 27.99, quantity: 1 },
      { productId: 'p4', name: 'Ceramic Pour-Over Coffee Dripper',    price: 39.99, quantity: 1 },
    ],
    bundlePrice:   54.99,
    comparePrice:  67.98,
    originalPrice: 67.98,
    stock: 20,
    sold: 56,
    isActive: false,
    isFeatured: false,
    validFrom: null,
    validUntil: null,
    tags: ['kitchen'],
    createdAt: pDays(60),
  },
  {
    _id: 'b05',
    name: 'Eid Gift Mega Bundle',
    description: 'The perfect gift bundle for Eid celebrations.',
    sku: 'BNDL-EID25',
    products: [
      { productId: 'p6', name: 'Merino Wool Throw Blanket',    price: 89.99, quantity: 1 },
      { productId: 'p2', name: 'Minimalist Leather Wallet',    price: 49.99, quantity: 1 },
      { productId: 'p1', name: 'Premium Wireless Headphones',  price: 129.99, quantity: 1 },
    ],
    bundlePrice:   219.99,
    comparePrice:  269.97,
    originalPrice: 269.97,
    stock: 15,
    sold: 204,
    isActive: true,
    isFeatured: true,
    validFrom: pDays(5),
    validUntil: fDays(4),
    tags: ['eid', 'gift', 'premium'],
    createdAt: pDays(8),
  },
  {
    _id: 'b06',
    name: 'Summer Outdoors Bundle',
    description: 'Stay hydrated and active this summer.',
    sku: 'BNDL-SUM25',
    products: [
      { productId: 'p7', name: 'Stainless Steel Water Bottle', price: 24.99, quantity: 2 },
      { productId: 'p8', name: 'Yoga Mat Premium Non-Slip',    price: 64.99, quantity: 1 },
    ],
    bundlePrice:   99.99,
    comparePrice:  114.97,
    originalPrice: 114.97,
    stock: 8,
    sold: 45,
    isActive: true,
    isFeatured: false,
    validFrom: pDays(2),
    validUntil: pDays(1),    // expired
    tags: ['summer', 'outdoor'],
    createdAt: pDays(20),
  },
];

function getBundleStatus(bundle) {
  if (!bundle.isActive) return 'inactive';
  if (bundle.validUntil && new Date(bundle.validUntil) < new Date()) return 'expired';
  return 'active';
}

/* ─── Page Component ──────────────────────────────────────────────────── */
export default function BundlesPage() {
  const [bundles, setBundles]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters]       = useState({ search: '', status: '', sort: 'createdAt:desc' });
  const [selected, setSelected]     = useState([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);

  /* ── Fetch ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bundleService.adminGetAll({
        page:   pagination.page,
        limit:  15,
        search: filters.search  || undefined,
        status: filters.status  || undefined,
        sort:   filters.sort,
      });
      const d = res.data;
      setBundles((d.bundles || d.data || []).map(b => ({ ...b, status: getBundleStatus(b) })));
      setPagination(p => ({ ...p, total: d.total || 0, pages: d.pages || 1 }));
      setUsingDummy(false);
    } catch {
      let list = DUMMY_BUNDLES.map(b => ({ ...b, status: getBundleStatus(b) }));
      const q  = filters.search?.toLowerCase();
      if (q)             list = list.filter(b => b.name.toLowerCase().includes(q) || b.sku?.toLowerCase().includes(q));
      if (filters.status) list = list.filter(b => b.status === filters.status);
      setBundles(list);
      setPagination({ page: 1, total: list.length, pages: 1 });
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => { load(); }, [load]);

  /* ── CRUD ── */
  const handleSave = async (data) => {
    if (usingDummy) {
      if (editing) {
        setBundles(prev => prev.map(b =>
          b._id === editing._id
            ? { ...b, ...data, status: getBundleStatus({ ...b, ...data }) }
            : b
        ));
      } else {
        const nb = {
          ...data,
          _id:       'b_' + Date.now(),
          sold:      0,
          createdAt: new Date().toISOString(),
          status:    getBundleStatus(data),
        };
        setBundles(prev => [nb, ...prev]);
      }
    } else {
      if (editing) await bundleService.adminUpdate(editing._id, data);
      else         await bundleService.adminCreate(data);
      load();
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (usingDummy) { setBundles(p => p.filter(b => b._id !== id)); return; }
    await bundleService.adminDelete(id);
    load();
  };

  const handleToggle = async (id) => {
    if (usingDummy) {
      setBundles(prev => prev.map(b => {
        if (b._id !== id) return b;
        const updated = { ...b, isActive: !b.isActive };
        return { ...updated, status: getBundleStatus(updated) };
      }));
      return;
    }
    await bundleService.adminToggle(id);
    load();
  };

  const handleBulkDelete = async () => {
    if (usingDummy) {
      setBundles(p => p.filter(b => !selected.includes(b._id)));
      setSelected([]);
      return;
    }
    await bundleService.adminBulkDelete(selected);
    setSelected([]);
    load();
  };

  const handleFilterChange = (f) => {
    setFilters(f);
    setPagination(p => ({ ...p, page: 1 }));
    setSelected([]);
  };

  /* ── Stats ── */
  const allForStats = usingDummy ? DUMMY_BUNDLES.map(b => ({ ...b, status: getBundleStatus(b) })) : bundles;
  const stats = {
    total:    usingDummy ? DUMMY_BUNDLES.length : pagination.total,
    active:   allForStats.filter(b => b.status === 'active').length,
    inactive: allForStats.filter(b => b.status === 'inactive').length,
    expired:  allForStats.filter(b => b.status === 'expired').length,
    featured: allForStats.filter(b => b.isFeatured).length,
    totalSold:allForStats.reduce((s, b) => s + (b.sold || 0), 0),
  };

  /* ── Render ── */
  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bundles</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Create and manage combo deals — group products together for discounted pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete ({selected.length})
            </button>
          )}
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-900/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Bundle
          </button>
        </div>
      </div>

      {/* ── Demo notice ── */}
      {usingDummy && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Demo mode — backend connected If real bundles will show। Changes reload-In persist will not do।
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total Bundles', value: stats.total,                     icon: '📦', from: 'from-violet-500/20', border: 'border-violet-500/20', text: 'text-violet-400' },
          { label: 'Active',        value: stats.active,                    icon: '✅', from: 'from-emerald-500/20',border: 'border-emerald-500/20',text: 'text-emerald-400' },
          { label: 'Inactive',      value: stats.inactive,                  icon: '⏸️', from: 'from-slate-500/20',  border: 'border-slate-500/20',  text: 'text-slate-400' },
          { label: 'Expired',       value: stats.expired,                   icon: '⏰', from: 'from-red-500/20',    border: 'border-red-500/20',    text: 'text-red-400' },
          { label: 'Featured',      value: stats.featured,                  icon: '⭐', from: 'from-amber-500/20',  border: 'border-amber-500/20',  text: 'text-amber-400' },
          { label: 'Total Sold',    value: stats.totalSold.toLocaleString(),icon: '🛒', from: 'from-sky-500/20',    border: 'border-sky-500/20',    text: 'text-sky-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.from}/5 to-transparent p-4`}>
            <div className="text-lg mb-1">{s.icon}</div>
            <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <BundleFilters filters={filters} onChange={handleFilterChange} />

      {/* ── Table ── */}
      <BundleTable
        bundles={bundles}
        loading={loading}
        selected={selected}
        onSelectChange={setSelected}
        onEdit={b => { setEditing(b); setModalOpen(true); }}
        onDelete={handleDelete}
        onToggle={handleToggle}
        pagination={pagination}
        onPageChange={p => setPagination(prev => ({ ...prev, page: p }))}
      />

      {/* ── Modal ── */}
      {modalOpen && (
        <BundleFormModal
          editing={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
