// 📁 PATH: src/app/(admin)/dashboard/products/page.jsx
// ⚠️  এই ফাইলটা পুরোনো page.jsx এর জায়গায় REPLACE করো
'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { productService } from '@/services/productService';
import ProductTable from '@/components/admin/products/ProductTable';
import ProductFilters from '@/components/admin/products/ProductFilters';
import { ADMIN_ITEMS_PER_PAGE } from '@/lib/constants';

// ── Dummy products (used while backend is not ready) ─────────────────────────
const DUMMY_PRODUCTS = [
  { _id: '1', name: 'Premium Wireless Headphones', slug: 'premium-wireless-headphones', price: 129.99, comparePrice: 179.99, stock: 45, sold: 230, status: 'active', category: { name: 'Electronics' }, images: [], rating: 4.7, sku: 'ELC-001' },
  { _id: '2', name: 'Minimalist Leather Wallet', slug: 'minimalist-leather-wallet', price: 49.99, comparePrice: null, stock: 120, sold: 540, status: 'active', category: { name: 'Accessories' }, images: [], rating: 4.5, sku: 'ACC-002' },
  { _id: '3', name: 'Organic Green Tea Set', slug: 'organic-green-tea-set', price: 34.99, comparePrice: 44.99, stock: 0, sold: 88, status: 'out_of_stock', category: { name: 'Food & Drink' }, images: [], rating: 4.8, sku: 'FD-003' },
  { _id: '4', name: 'Ceramic Pour-Over Coffee Dripper', slug: 'ceramic-pour-over-coffee-dripper', price: 39.99, comparePrice: null, stock: 62, sold: 310, status: 'active', category: { name: 'Kitchen' }, images: [], rating: 4.6, sku: 'KIT-004' },
  { _id: '5', name: 'Bamboo Cutting Board Set', slug: 'bamboo-cutting-board-set', price: 27.99, comparePrice: 39.99, stock: 3, sold: 125, status: 'low_stock', category: { name: 'Kitchen' }, images: [], rating: 4.3, sku: 'KIT-005' },
  { _id: '6', name: 'Merino Wool Throw Blanket', slug: 'merino-wool-throw-blanket', price: 89.99, comparePrice: 119.99, stock: 28, sold: 95, status: 'active', category: { name: 'Home Decor' }, images: [], rating: 4.9, sku: 'HOM-006' },
  { _id: '7', name: 'Stainless Steel Water Bottle', slug: 'stainless-steel-water-bottle', price: 24.99, comparePrice: null, stock: 200, sold: 870, status: 'active', category: { name: 'Sports' }, images: [], rating: 4.4, sku: 'SPT-007' },
  { _id: '8', name: 'Artisan Soy Candle Collection', slug: 'artisan-soy-candle-collection', price: 54.99, comparePrice: 69.99, stock: 0, sold: 145, status: 'draft', category: { name: 'Home Decor' }, images: [], rating: 4.7, sku: 'HOM-008' },
  { _id: '9', name: 'Yoga Mat Premium Non-Slip', slug: 'yoga-mat-premium-non-slip', price: 64.99, comparePrice: 84.99, stock: 35, sold: 420, status: 'active', category: { name: 'Sports' }, images: [], rating: 4.6, sku: 'SPT-009' },
  { _id: '10', name: 'Mechanical Keyboard TKL', slug: 'mechanical-keyboard-tkl', price: 149.99, comparePrice: 199.99, stock: 18, sold: 67, status: 'active', category: { name: 'Electronics' }, images: [], rating: 4.8, sku: 'ELC-010' },
  { _id: '11', name: 'Linen Tote Bag Natural', slug: 'linen-tote-bag-natural', price: 19.99, comparePrice: null, stock: 150, sold: 340, status: 'active', category: { name: 'Accessories' }, images: [], rating: 4.2, sku: 'ACC-011' },
  { _id: '12', name: 'Cold Brew Coffee Maker', slug: 'cold-brew-coffee-maker', price: 44.99, comparePrice: 59.99, stock: 0, sold: 210, status: 'out_of_stock', category: { name: 'Kitchen' }, images: [], rating: 4.5, sku: 'KIT-012' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDummy, setUsingDummy] = useState(false);

  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ search: '', status: '', category: '', sort: 'created_at:desc' });
  const [selected, setSelected] = useState([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: ADMIN_ITEMS_PER_PAGE,
        search: filters.search || undefined,
        status: filters.status || undefined,
        category: filters.category || undefined,
        sort: filters.sort,
      };
      const res = await productService.adminGetAll(params);
      const data = res.data;
      setProducts(data.products || data.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.pagination?.total || 0,
        pages: data.pages || data.pagination?.pages || 1,
      }));
      setUsingDummy(false);
    } catch {
      // Backend not ready — fall back to dummy data
      const search = filters.search?.toLowerCase() || '';
      const filtered = DUMMY_PRODUCTS.filter(p => {
        if (search && !p.name.toLowerCase().includes(search) && !p.sku.toLowerCase().includes(search)) return false;
        if (filters.status && p.status !== filters.status) return false;
        return true;
      });
      setProducts(filtered);
      setPagination({ page: 1, total: filtered.length, pages: 1 });
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelected([]);
  };

  const handleDelete = async (id) => {
    if (usingDummy) {
      setProducts(prev => prev.filter(p => p._id !== id));
      return;
    }
    try {
      await productService.adminDelete(id);
      fetchProducts();
    } catch {
      setError('Failed to delete product.');
    }
  };

  const handleToggleStatus = async (id) => {
    if (usingDummy) {
      setProducts(prev => prev.map(p => {
        if (p._id !== id) return p;
        return { ...p, status: p.status === 'active' ? 'draft' : 'active' };
      }));
      return;
    }
    try {
      await productService.adminToggleStatus(id);
      fetchProducts();
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleBulkDelete = async () => {
    if (usingDummy) {
      setProducts(prev => prev.filter(p => !selected.includes(p._id)));
      setSelected([]);
      return;
    }
    try {
      await Promise.all(selected.map(id => productService.adminDelete(id)));
      setSelected([]);
      fetchProducts();
    } catch {
      setError('Bulk delete failed.');
    }
  };

  const statsCards = [
    { label: 'Total Products', value: usingDummy ? DUMMY_PRODUCTS.length : pagination.total, icon: '📦', color: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/20', text: 'text-violet-400' },
    { label: 'Active', value: (usingDummy ? DUMMY_PRODUCTS : products).filter(p => p.status === 'active').length, icon: '✅', color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    { label: 'Out of Stock', value: (usingDummy ? DUMMY_PRODUCTS : products).filter(p => p.status === 'out_of_stock').length, icon: '⚠️', color: 'from-red-500/20 to-red-500/5', border: 'border-red-500/20', text: 'text-red-400' },
    { label: 'Draft', value: (usingDummy ? DUMMY_PRODUCTS : products).filter(p => p.status === 'draft').length, icon: '📝', color: 'from-slate-500/20 to-slate-500/5', border: 'border-slate-500/20', text: 'text-slate-400' },
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
          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete {selected.length}
            </button>
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

      {/* Dummy data notice */}
      {usingDummy && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Showing demo data — backend API not connected yet. Changes will not persist on reload.
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.color} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <ProductFilters filters={filters} onChange={handleFilterChange} />

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Table */}
      <ProductTable
        products={products}
        loading={loading}
        selected={selected}
        onSelectChange={setSelected}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        pagination={pagination}
        onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
      />
    </div>
  );
}
