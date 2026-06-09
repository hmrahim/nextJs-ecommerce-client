// 📁 PATH: src/app/(admin)/dashboard/promotions/page.jsx
// ⚠️  পুরোনো page.jsx এর জায়গায় REPLACE করো (অথবা নতুন)

'use client';
import { useState, useEffect, useCallback } from 'react';
import { promotionService } from '@/services/promotionService';
import PromotionTable     from '@/components/admin/promotions/PromotionTable';
import PromotionFilters   from '@/components/admin/promotions/PromotionFilters';
import PromotionFormModal from '@/components/admin/promotions/PromotionFormModal';

const now = new Date();
const f = (d) => new Date(now.getTime() + d * 86400000).toISOString();
const p = (d) => new Date(now.getTime() - d * 86400000).toISOString();

const DUMMY = [
  { _id: 'pr01', name: 'Buy 2 Get 1 Free — T-Shirts', type: 'buy_x_get_y', appliesTo: 'Specific Categories', buyQty: 2, getQty: 1, priority: 100, stackable: false, isActive: true,  startsAt: p(10), endsAt: f(20), redeemCount: 842,  totalDiscount: 168400, description: 'Mix & match any t-shirts', rewardLabel: 'Buy 2 Get 1' },
  { _id: 'pr02', name: 'Flat 15% off Cart',           type: 'cart_percent',appliesTo: 'All Products',         discountPercent: 15, minOrderAmount: 1500, maxDiscount: 500, priority: 90,  stackable: true,  isActive: true,  startsAt: p(5),  endsAt: f(10), redeemCount: 1542, totalDiscount: 462000, description: 'Sitewide cart discount', rewardLabel: '15% off cart' },
  { _id: 'pr03', name: 'Spend ৳3000 — Free Gift',     type: 'free_gift',   appliesTo: 'All Products',         minOrderAmount: 3000, freeGiftProduct: 'Premium Tote Bag', priority: 70, stackable: true, isActive: true, startsAt: p(2), endsAt: f(30), redeemCount: 218, totalDiscount: 65400, description: 'Free branded tote on big orders', rewardLabel: 'Free gift' },
  { _id: 'pr04', name: 'Electronics Bundle Deal',     type: 'bundle_deal', appliesTo: 'Specific Products',    discountPercent: 20, priority: 80, stackable: false, isActive: true, startsAt: p(15), endsAt: f(5), redeemCount: 96, totalDiscount: 384000, description: 'Phone + Earbuds + Case bundle', rewardLabel: 'Bundle: 20% off' },
  { _id: 'pr05', name: 'Tier Discount Ladder',        type: 'tier_discount',appliesTo: 'All Products',        discountPercent: 25, minOrderAmount: 5000, maxDiscount: 1500, priority: 60, stackable: false, isActive: true, startsAt: p(20), endsAt: f(40), redeemCount: 412, totalDiscount: 412000, description: 'Spend more, save more — up to 25%', rewardLabel: 'Up to 25% off' },
  { _id: 'pr06', name: 'Free Shipping Over ৳800',     type: 'free_shipping',appliesTo: 'All Products',        minOrderAmount: 800, priority: 50, stackable: true, isActive: true, startsAt: p(60), endsAt: null, redeemCount: 5240, totalDiscount: 314400, description: 'Sitewide free shipping threshold', rewardLabel: 'Free shipping' },
  { _id: 'pr07', name: 'New Year Mega — 30% off',     type: 'cart_percent',appliesTo: 'All Products',         discountPercent: 30, minOrderAmount: 2000, maxDiscount: 1000, priority: 120, stackable: false, isActive: true, startsAt: f(20), endsAt: f(35), redeemCount: 0, totalDiscount: 0, description: 'Pre-scheduled new year campaign', rewardLabel: '30% off cart' },
  { _id: 'pr08', name: 'BOGO Cosmetics',              type: 'bogo',        appliesTo: 'Specific Categories',  buyQty: 1, getQty: 1, priority: 85, stackable: false, isActive: false, startsAt: p(30), endsAt: p(2), redeemCount: 612, totalDiscount: 244800, description: 'Expired BOGO on cosmetics', rewardLabel: 'Buy 1 Get 1 Free' },
  { _id: 'pr09', name: 'VIP Cart ৳500 off',           type: 'cart_fixed',  appliesTo: 'Customer Group',       discountAmount: 500, minOrderAmount: 4000, priority: 95, stackable: false, isActive: true, startsAt: p(10), endsAt: f(60), redeemCount: 142, totalDiscount: 71000, description: 'VIP customers only', rewardLabel: '৳500 off cart' },
  { _id: 'pr10', name: 'Kitchen Bundle 25% off',      type: 'bundle_deal', appliesTo: 'Specific Categories',  discountPercent: 25, priority: 75, stackable: false, isActive: true, startsAt: p(7), endsAt: f(7), redeemCount: 84, totalDiscount: 168000, description: '3-piece kitchenware bundle', rewardLabel: 'Bundle: 25% off' },
];

export default function PromotionsPage() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  const [filters, setFilters]       = useState({ search: '', status: '', type: '', sort: 'priority:desc' });
  const [selected, setSelected]     = useState([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await promotionService.adminGetAll({ ...filters });
      const d = res.data;
      setItems(d.promotions || d.data || []);
      setUsingDummy(false);
    } catch {
      let list = [...DUMMY];
      const q = filters.search?.toLowerCase();
      if (q) list = list.filter(i => i.name.toLowerCase().includes(q));
      if (filters.type) list = list.filter(i => i.type === filters.type);
      if (filters.status) {
        const now = new Date();
        list = list.filter(i => {
          if (filters.status === 'inactive') return !i.isActive;
          if (filters.status === 'scheduled') return i.isActive && i.startsAt && new Date(i.startsAt) > now;
          if (filters.status === 'expired') return i.isActive && i.endsAt && new Date(i.endsAt) < now;
          if (filters.status === 'active') return i.isActive && (!i.startsAt || new Date(i.startsAt) <= now) && (!i.endsAt || new Date(i.endsAt) >= now);
          return true;
        });
      }
      setItems(list);
      setUsingDummy(true);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    if (usingDummy) {
      if (editing) setItems(p => p.map(c => c._id === editing._id ? { ...c, ...data } : c));
      else setItems(p => [{ ...data, _id: 'pr_' + Date.now(), redeemCount: 0, totalDiscount: 0 }, ...p]);
    } else {
      if (editing) await promotionService.adminUpdate(editing._id, data);
      else         await promotionService.adminCreate(data);
      load();
    }
    setModalOpen(false); setEditing(null);
  };
  const handleDelete    = async (id) => { if (usingDummy) return setItems(p => p.filter(c => c._id !== id)); await promotionService.adminDelete(id); load(); };
  const handleToggle    = async (id) => { if (usingDummy) return setItems(p => p.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c)); await promotionService.adminToggle(id); load(); };
  const handleDuplicate = async (id) => { if (usingDummy) { const c = items.find(x => x._id === id); if (c) setItems(p => [{ ...c, _id: 'pr_' + Date.now(), name: c.name + ' (Copy)', redeemCount: 0, totalDiscount: 0 }, ...p]); return; } await promotionService.adminDuplicate(id); load(); };
  const handleBulkDelete= async () => { if (usingDummy) { setItems(p => p.filter(c => !selected.includes(c._id))); setSelected([]); return; } await promotionService.adminBulkDelete(selected); setSelected([]); load(); };

  const now = new Date();
  const stats = {
    total: items.length,
    active: items.filter(i => i.isActive && (!i.startsAt || new Date(i.startsAt) <= now) && (!i.endsAt || new Date(i.endsAt) >= now)).length,
    scheduled: items.filter(i => i.isActive && i.startsAt && new Date(i.startsAt) > now).length,
    redeems: items.reduce((s, i) => s + (i.redeemCount || 0), 0),
    discount: items.reduce((s, i) => s + (i.totalDiscount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Promotions</h1>
          <p className="text-sm text-slate-400 mt-0.5">Build rule-based offers — BOGO, bundles, tier discounts & more.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20">Delete ({selected.length})</button>
          )}
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Promotion
          </button>
        </div>
      </div>

      {usingDummy && <div className="px-4 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs">⚠️ Showing demo data — backend unreachable.</div>}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: 'Total Promotions', v: stats.total, c: 'text-white' },
          { l: 'Active',           v: stats.active, c: 'text-emerald-400' },
          { l: 'Scheduled',        v: stats.scheduled, c: 'text-sky-400' },
          { l: 'Total Redemptions',v: new Intl.NumberFormat().format(stats.redeems), c: 'text-violet-400' },
          { l: 'Discount Given',   v: '৳' + new Intl.NumberFormat().format(stats.discount), c: 'text-orange-400' },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-[#1e1e2e] bg-[#16161f] p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.l}</p>
            <p className={`text-xl font-bold mt-1 ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <PromotionFilters filters={filters} onChange={(f) => { setFilters(f); setSelected([]); }} />

      <PromotionTable promotions={items} loading={loading} selected={selected} onSelectChange={setSelected}
        onEdit={(c) => { setEditing(c); setModalOpen(true); }} onDelete={handleDelete} onToggle={handleToggle} onDuplicate={handleDuplicate} />

      {modalOpen && <PromotionFormModal promotion={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />}
    </div>
  );
}
