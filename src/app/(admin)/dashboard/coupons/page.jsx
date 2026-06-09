// 📁 PATH: src/app/(admin)/dashboard/coupons/page.jsx
// ⚠️  পুরোনো page.jsx এর জায়গায় REPLACE করো

'use client';
import { useState, useEffect, useCallback } from 'react';
import { couponService } from '@/services/couponService';
import CouponTable   from '@/components/admin/coupons/CouponTable';
import CouponFormModal from '@/components/admin/coupons/CouponFormModal';
import CouponFilters from '@/components/admin/coupons/CouponFilters';

// ── Dummy data ─────────────────────────────────────────────────────────────────
const now = new Date();
const future  = (days) => new Date(now.getTime() + days * 86400000).toISOString();
const past    = (days) => new Date(now.getTime() - days * 86400000).toISOString();

const DUMMY = [
  { _id: 'c01', code: 'WELCOME20',   type: 'percent', value: 20, minOrderAmount: 500,   maxUses: 500,  usedCount: 312, maxUsesPerUser: 1, isActive: true,  applicableTo: 'all',        expiresAt: future(30),  description: 'New user welcome discount',           createdAt: past(60) },
  { _id: 'c02', code: 'FLAT100',     type: 'fixed',   value: 100,minOrderAmount: 999,   maxUses: 200,  usedCount: 200, maxUsesPerUser: 1, isActive: false, applicableTo: 'all',        expiresAt: past(5),     description: 'Flat ৳100 off on orders above ৳999', createdAt: past(45) },
  { _id: 'c03', code: 'EID2025',     type: 'percent', value: 30, minOrderAmount: 1500,  maxUses: 1000, usedCount: 678, maxUsesPerUser: 2, isActive: true,  applicableTo: 'all',        expiresAt: future(7),   description: 'Eid special 30% off',                createdAt: past(10) },
  { _id: 'c04', code: 'ELEC15',      type: 'percent', value: 15, minOrderAmount: 2000,  maxUses: 300,  usedCount: 89,  maxUsesPerUser: 1, isActive: true,  applicableTo: 'category',   expiresAt: future(15),  description: '15% off on Electronics',             createdAt: past(20) },
  { _id: 'c05', code: 'FREESHIP',    type: 'shipping',value: 100,minOrderAmount: 800,   maxUses: null, usedCount: 1240,maxUsesPerUser: 3, isActive: true,  applicableTo: 'all',        expiresAt: future(60),  description: 'Free shipping on orders above ৳800', createdAt: past(90) },
  { _id: 'c06', code: 'VIP50',       type: 'fixed',   value: 500,minOrderAmount: 5000,  maxUses: 50,   usedCount: 12,  maxUsesPerUser: 1, isActive: true,  applicableTo: 'all',        expiresAt: future(90),  description: 'VIP customer exclusive ৳500 off',   createdAt: past(5) },
  { _id: 'c07', code: 'FLASH25',     type: 'percent', value: 25, minOrderAmount: 1200,  maxUses: 100,  usedCount: 100, maxUsesPerUser: 1, isActive: false, applicableTo: 'all',        expiresAt: past(2),     description: 'Flash sale 25% off — expired',      createdAt: past(10) },
  { _id: 'c08', code: 'APP10',       type: 'percent', value: 10, minOrderAmount: 0,     maxUses: null, usedCount: 3421,maxUsesPerUser: 5, isActive: true,  applicableTo: 'all',        expiresAt: future(120), description: 'App-only 10% off always',            createdAt: past(180) },
  { _id: 'c09', code: 'KITCHEN200',  type: 'fixed',   value: 200,minOrderAmount: 1500,  maxUses: 150,  usedCount: 44,  maxUsesPerUser: 1, isActive: true,  applicableTo: 'category',   expiresAt: future(20),  description: '৳200 off Kitchen category',          createdAt: past(8) },
  { _id: 'c10', code: 'RAMADAN30',   type: 'percent', value: 30, minOrderAmount: 2000,  maxUses: 2000, usedCount: 1987,maxUsesPerUser: 2, isActive: false, applicableTo: 'all',        expiresAt: past(30),    description: 'Ramadan special — expired',          createdAt: past(70) },
];

function getStatus(coupon) {
  if (!coupon.isActive) return 'inactive';
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return 'expired';
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return 'exhausted';
  return 'active';
}

export default function CouponsPage() {
  const [coupons, setCoupons]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [usingDummy, setUsingDummy]   = useState(false);
  const [pagination, setPagination]   = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters]         = useState({ search: '', status: '', type: '', sort: 'createdAt:desc' });
  const [selected, setSelected]       = useState([]);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await couponService.adminGetAll({
        page: pagination.page, limit: 15,
        search: filters.search || undefined,
        status: filters.status || undefined,
        type:   filters.type   || undefined,
        sort:   filters.sort,
      });
      const d = res.data;
      setCoupons(d.coupons || d.data || []);
      setPagination(p => ({ ...p, total: d.total || 0, pages: d.pages || 1 }));
      setUsingDummy(false);
    } catch {
      let list = DUMMY.map(c => ({ ...c, status: getStatus(c) }));
      const q = filters.search?.toLowerCase();
      if (q) list = list.filter(c => c.code.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
      if (filters.status) list = list.filter(c => c.status === filters.status);
      if (filters.type)   list = list.filter(c => c.type === filters.type);
      setCoupons(list);
      setPagination({ page: 1, total: list.length, pages: 1 });
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => { load(); }, [load]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    if (usingDummy) {
      if (editing) {
        setCoupons(p => p.map(c => c._id === editing._id ? { ...c, ...data, status: getStatus({ ...c, ...data }) } : c));
      } else {
        const nc = { ...data, _id: 'c_' + Date.now(), usedCount: 0, createdAt: new Date().toISOString(), status: getStatus(data) };
        setCoupons(p => [nc, ...p]);
      }
    } else {
      if (editing) await couponService.adminUpdate(editing._id, data);
      else         await couponService.adminCreate(data);
      load();
    }
    setModalOpen(false); setEditing(null);
  };

  const handleDelete = async (id) => {
    if (usingDummy) { setCoupons(p => p.filter(c => c._id !== id)); return; }
    await couponService.adminDelete(id); load();
  };

  const handleToggle = async (id) => {
    if (usingDummy) {
      setCoupons(p => p.map(c => {
        if (c._id !== id) return c;
        const updated = { ...c, isActive: !c.isActive };
        return { ...updated, status: getStatus(updated) };
      }));
      return;
    }
    await couponService.adminToggle(id); load();
  };

  const handleBulkDelete = async () => {
    if (usingDummy) { setCoupons(p => p.filter(c => !selected.includes(c._id))); setSelected([]); return; }
    await couponService.adminBulkDelete(selected); setSelected([]); load();
  };

  const handleFilterChange = (f) => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); setSelected([]); };

  // Stats
  const allForStats = usingDummy ? coupons : coupons;
  const stats = {
    total:     allForStats.length,
    active:    allForStats.filter(c => (c.status || getStatus(c)) === 'active').length,
    expired:   allForStats.filter(c => (c.status || getStatus(c)) === 'expired').length,
    exhausted: allForStats.filter(c => (c.status || getStatus(c)) === 'exhausted').length,
    totalUses: allForStats.reduce((s, c) => s + (c.usedCount || 0), 0),
    savings:   allForStats.reduce((s, c) => s + (c.type === 'fixed' ? (c.value * c.usedCount) : 0), 0),
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Coupons</h1>
          <p className="text-sm text-slate-400 mt-0.5">Create and manage discount codes, offers, and promotions.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete ({selected.length})
            </button>
          )}
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-900/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Coupon
          </button>
        </div>
      </div>

      {/* Demo notice */}
      {usingDummy && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Demo mode — backend connected হলে real coupons দেখাবে।
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total Coupons', value: stats.total,               icon: '🎟️', from: 'from-orange-500/20', border: 'border-orange-500/20', text: 'text-orange-400' },
          { label: 'Active',        value: stats.active,              icon: '✅', from: 'from-emerald-500/20',border: 'border-emerald-500/20',text: 'text-emerald-400' },
          { label: 'Expired',       value: stats.expired,             icon: '⏰', from: 'from-slate-500/20',  border: 'border-slate-500/20',  text: 'text-slate-400' },
          { label: 'Exhausted',     value: stats.exhausted,           icon: '🔴', from: 'from-red-500/20',    border: 'border-red-500/20',    text: 'text-red-400' },
          { label: 'Total Uses',    value: stats.totalUses.toLocaleString(),icon:'📊',from:'from-violet-500/20',border:'border-violet-500/20',text:'text-violet-400'},
          { label: 'Total Savings', value: `৳${stats.savings.toLocaleString()}`,icon:'💰',from:'from-sky-500/20',border:'border-sky-500/20',text:'text-sky-400'},
        ].map(s => (
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
        loading={loading}
        selected={selected}
        onSelectChange={setSelected}
        onEdit={(c) => { setEditing(c); setModalOpen(true); }}
        onDelete={handleDelete}
        onToggle={handleToggle}
        pagination={pagination}
        onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
      />

      {/* Modal */}
      {modalOpen && (
        <CouponFormModal
          editing={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
