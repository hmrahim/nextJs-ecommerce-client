// 📁 PATH: src/app/(admin)/dashboard/brands/page.jsx

'use client';
import { useState, useEffect, useCallback } from 'react';
import BrandTable from '@/components/admin/brands/BrandTable';
import BrandFormModal from '@/components/admin/brands/BrandFormModal';

// ── Dummy brands (real ecommerce style) ───────────────────────────────────────
const DUMMY_BRANDS = [
  {
    _id: 'br_01',
    name: 'Samsung',
    slug: 'samsung',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png',
    website: 'https://samsung.com',
    description: 'South Korean multinational manufacturing conglomerate.',
    country: 'South Korea',
    isFeatured: true,
    isActive: true,
    productCount: 214,
    sortOrder: 1,
    metaTitle: 'Samsung Bangladesh | Official Products',
    metaDescription: 'Buy original Samsung smartphones, TVs and home appliances.',
    createdAt: '2024-01-10',
  },
  {
    _id: 'br_02',
    name: 'Apple',
    slug: 'apple',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    website: 'https://apple.com',
    description: 'American multinational technology company.',
    country: 'United States',
    isFeatured: true,
    isActive: true,
    productCount: 87,
    sortOrder: 2,
    metaTitle: 'Apple Bangladesh | iPhone, MacBook & More',
    metaDescription: 'Shop Apple products with official warranty.',
    createdAt: '2024-01-12',
  },
  {
    _id: 'br_03',
    name: 'Sony',
    slug: 'sony',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
    website: 'https://sony.com',
    description: 'Japanese multinational conglomerate corporation.',
    country: 'Japan',
    isFeatured: true,
    isActive: true,
    productCount: 143,
    sortOrder: 3,
    metaTitle: 'Sony Bangladesh | Electronics & Entertainment',
    metaDescription: 'Buy Sony cameras, headphones, TVs & PlayStation.',
    createdAt: '2024-01-15',
  },
  {
    _id: 'br_04',
    name: 'Nike',
    slug: 'nike',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    website: 'https://nike.com',
    description: 'American multinational footwear and apparel corporation.',
    country: 'United States',
    isFeatured: false,
    isActive: true,
    productCount: 312,
    sortOrder: 4,
    metaTitle: 'Nike Bangladesh | Sports & Lifestyle',
    metaDescription: 'Shop original Nike shoes, apparel and accessories.',
    createdAt: '2024-02-01',
  },
  {
    _id: 'br_05',
    name: 'Adidas',
    slug: 'adidas',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
    website: 'https://adidas.com',
    description: 'German multinational corporation that designs and manufactures shoes and clothing.',
    country: 'Germany',
    isFeatured: false,
    isActive: true,
    productCount: 267,
    sortOrder: 5,
    metaTitle: 'Adidas Bangladesh | Official Store',
    metaDescription: 'Discover Adidas sneakers, sports clothing & accessories.',
    createdAt: '2024-02-10',
  },
  {
    _id: 'br_06',
    name: 'LG',
    slug: 'lg',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/LG_logo_%282015%29.svg/2560px-LG_logo_%282015%29.svg.png',
    website: 'https://lg.com',
    description: 'South Korean multinational electronics company.',
    country: 'South Korea',
    isFeatured: false,
    isActive: true,
    productCount: 98,
    sortOrder: 6,
    metaTitle: 'LG Bangladesh | TVs, ACs & Appliances',
    metaDescription: 'Shop LG home appliances, TVs and electronics.',
    createdAt: '2024-02-15',
  },
  {
    _id: 'br_07',
    name: 'Xiaomi',
    slug: 'xiaomi',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Xiaomi_logo.svg/2560px-Xiaomi_logo.svg.png',
    website: 'https://mi.com',
    description: 'Chinese multinational technology company.',
    country: 'China',
    isFeatured: false,
    isActive: false,
    productCount: 54,
    sortOrder: 7,
    metaTitle: 'Xiaomi Bangladesh | Mi Phones & Smart Devices',
    metaDescription: 'Buy Xiaomi smartphones, smart home products.',
    createdAt: '2024-03-01',
  },
  {
    _id: 'br_08',
    name: 'Puma',
    slug: 'puma',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Puma_logo.svg/2560px-Puma_logo.svg.png',
    website: 'https://puma.com',
    description: 'German multinational corporation that designs and manufactures athletic footwear.',
    country: 'Germany',
    isFeatured: false,
    isActive: true,
    productCount: 189,
    sortOrder: 8,
    metaTitle: 'Puma Bangladesh | Sports Footwear & Apparel',
    metaDescription: 'Official Puma store — shoes, clothing and accessories.',
    createdAt: '2024-03-05',
  },
];

export default function BrandsPage() {
  const [brands, setBrands]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);

  // ── Search / filter ─────────────────────────────────────────────────────────
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | inactive | featured

  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/brands');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBrands(data.brands || data);
      setUsingDummy(false);
    } catch {
      setBrands(DUMMY_BRANDS);
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBrands(); }, [loadBrands]);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = brands.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
                        b.country?.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === 'active')   return matchSearch && b.isActive && !b.isFeatured;
    if (filterStatus === 'inactive') return matchSearch && !b.isActive;
    if (filterStatus === 'featured') return matchSearch && b.isFeatured;
    return matchSearch;
  });

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    if (usingDummy) {
      if (editing) {
        setBrands(prev => prev.map(b => b._id === editing._id ? { ...b, ...formData } : b));
      } else {
        const newBrand = {
          ...formData,
          _id: 'br_' + Date.now(),
          productCount: 0,
          isActive: formData.isActive !== false,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setBrands(prev => [...prev, newBrand]);
      }
    } else {
      if (editing) {
        await fetch(`/api/admin/brands/${editing._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      } else {
        await fetch('/api/admin/brands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      }
      loadBrands();
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (usingDummy) {
      setBrands(prev => prev.filter(b => b._id !== id));
    } else {
      fetch(`/api/admin/brands/${id}`, { method: 'DELETE' }).then(loadBrands);
    }
  };

  const handleToggleActive = (id) => {
    if (usingDummy) {
      setBrands(prev => prev.map(b => b._id === id ? { ...b, isActive: !b.isActive } : b));
    } else {
      fetch(`/api/admin/brands/${id}/toggle`, { method: 'PATCH' }).then(loadBrands);
    }
  };

  const handleToggleFeatured = (id) => {
    if (usingDummy) {
      setBrands(prev => prev.map(b => b._id === id ? { ...b, isFeatured: !b.isFeatured } : b));
    } else {
      fetch(`/api/admin/brands/${id}/feature`, { method: 'PATCH' }).then(loadBrands);
    }
  };

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (brand) => { setEditing(brand); setModalOpen(true); };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalActive   = brands.filter(b => b.isActive).length;
  const totalFeatured = brands.filter(b => b.isFeatured).length;
  const totalProducts = brands.reduce((s, b) => s + (b.productCount || 0), 0);

  const STATS = [
    {
      label: 'Total Brands',
      value: brands.length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      accent: 'violet',
      bg: 'from-violet-500/15 to-violet-500/5',
      border: 'border-violet-500/20',
      text: 'text-violet-400',
    },
    {
      label: 'Active Brands',
      value: totalActive,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: 'emerald',
      bg: 'from-emerald-500/15 to-emerald-500/5',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
    },
    {
      label: 'Featured Brands',
      value: totalFeatured,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      accent: 'amber',
      bg: 'from-amber-500/15 to-amber-500/5',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
    },
    {
      label: 'Total Products',
      value: totalProducts.toLocaleString(),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      accent: 'sky',
      bg: 'from-sky-500/15 to-sky-500/5',
      border: 'border-sky-500/20',
      text: 'text-sky-400',
    },
  ];

  const FILTER_TABS = [
    { key: 'all',      label: 'All Brands', count: brands.length },
    { key: 'active',   label: 'Active',     count: brands.filter(b => b.isActive && !b.isFeatured).length },
    { key: 'featured', label: 'Featured',   count: totalFeatured },
    { key: 'inactive', label: 'Inactive',   count: brands.filter(b => !b.isActive).length },
  ];

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
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

      {/* ── Demo notice ─────────────────────────────────────────────────────── */}
      {usingDummy && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Demo mode — backend connected হলে real brands দেখাবে।
        </div>
      )}

      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map(s => (
          <div key={s.label} className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.bg} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.text} bg-white/5`}>
              {s.icon}
            </div>
            <div>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search brands by name or country…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]">
          {FILTER_TABS.map(tab => (
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

      {/* ── Brand Table ─────────────────────────────────────────────────────── */}
      <BrandTable
        brands={filtered}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onToggleFeatured={handleToggleFeatured}
      />

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
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
