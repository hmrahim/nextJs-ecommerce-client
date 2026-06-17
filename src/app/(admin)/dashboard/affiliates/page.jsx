// 📁 PATH: src/app/(admin)/dashboard/affiliates/page.jsx
// ⚠️  old page.jsx instead of REPLACE Do (or new)

'use client';
import { useState, useEffect, useCallback } from 'react';
import { affiliateService } from '@/services/affiliateService';
import AffiliateTable     from '@/components/admin/affiliates/AffiliateTable';
import AffiliateFilters   from '@/components/admin/affiliates/AffiliateFilters';
import AffiliateFormModal from '@/components/admin/affiliates/AffiliateFormModal';
import PayoutModal        from '@/components/admin/affiliates/PayoutModal';

const DUMMY = [
  { _id: 'aff01', name: 'Tanvir Ahmed',     email: 'tanvir@influencerbd.com', phone: '+8801712345678', referralCode: 'TANVIR-X1Y2', tier: 'platinum', commissionPercent: 18, status: 'approved', clicks: 28450, conversions: 1842, totalRevenue: 1284500, pendingPayout: 18420, payoutMethod: 'bKash', payoutAccount: '01712345678', minPayoutThreshold: 500 },
  { _id: 'aff02', name: 'Nusrat Jahan',     email: 'nusrat@bloggerbd.com',    phone: '+8801812345678', referralCode: 'NUSRAT-A1B2', tier: 'gold',     commissionPercent: 15, status: 'approved', clicks: 18230, conversions: 1124, totalRevenue: 824100, pendingPayout: 12340, payoutMethod: 'Nagad', payoutAccount: '01812345678', minPayoutThreshold: 500 },
  { _id: 'aff03', name: 'Rakib Hasan',      email: 'rakib@youtube.com',       phone: '+8801912345678', referralCode: 'RAKIB-K9L0', tier: 'gold',     commissionPercent: 15, status: 'approved', clicks: 14200, conversions: 892,  totalRevenue: 612000, pendingPayout: 9180,  payoutMethod: 'bKash', payoutAccount: '01912345678', minPayoutThreshold: 500 },
  { _id: 'aff04', name: 'Sumaiya Khan',     email: 'sumaiya@insta.com',       phone: '+8801612345678', referralCode: 'SUM-Q3R4',   tier: 'silver',   commissionPercent: 12, status: 'approved', clicks: 9420,  conversions: 524,  totalRevenue: 384200, pendingPayout: 4610,  payoutMethod: 'Rocket', payoutAccount: '01612345678', minPayoutThreshold: 500 },
  { _id: 'aff05', name: 'Faisal Mahmud',    email: 'faisal@review.com',       phone: '+8801512345678', referralCode: 'FAISAL-Z8',  tier: 'silver',   commissionPercent: 12, status: 'pending',  clicks: 240,   conversions: 0,    totalRevenue: 0,      pendingPayout: 0,     payoutMethod: 'Bank Transfer', payoutAccount: 'DBBL 1234567', minPayoutThreshold: 1000 },
  { _id: 'aff06', name: 'Anika Tabassum',   email: 'anika@tiktok.com',        phone: '+8801312345678', referralCode: 'ANIKA-T1K',  tier: 'bronze',   commissionPercent: 10, status: 'approved', clicks: 4820,  conversions: 218,  totalRevenue: 142800, pendingPayout: 1714,  payoutMethod: 'bKash', payoutAccount: '01312345678', minPayoutThreshold: 500 },
  { _id: 'aff07', name: 'Hasibul Islam',    email: 'hasib@blogger.com',       phone: '+8801412345678', referralCode: 'HASIB-9P',   tier: 'bronze',   commissionPercent: 10, status: 'suspended',clicks: 1200,  conversions: 45,   totalRevenue: 28400,  pendingPayout: 280,   payoutMethod: 'bKash', payoutAccount: '01412345678', minPayoutThreshold: 500 },
  { _id: 'aff08', name: 'Mehedi Hassan',    email: 'mehedi@yt.com',           phone: '+8801212345678', referralCode: 'MEHEDI-B7',  tier: 'gold',     commissionPercent: 15, status: 'approved', clicks: 21400, conversions: 1284, totalRevenue: 942000, pendingPayout: 14130, payoutMethod: 'bKash', payoutAccount: '01212345678', minPayoutThreshold: 500 },
  { _id: 'aff09', name: 'Sadia Akter',      email: 'sadia@fashion.com',       phone: '+8801112345678', referralCode: 'SADIA-F2',   tier: 'silver',   commissionPercent: 12, status: 'pending',  clicks: 0,     conversions: 0,    totalRevenue: 0,      pendingPayout: 0,     payoutMethod: 'Nagad', payoutAccount: '01112345678', minPayoutThreshold: 500 },
  { _id: 'aff10', name: 'Imran Khan',       email: 'imran@deals.com',         phone: '+8801012345678', referralCode: 'IMRAN-D9',   tier: 'bronze',   commissionPercent: 10, status: 'rejected', clicks: 0,     conversions: 0,    totalRevenue: 0,      pendingPayout: 0,     payoutMethod: 'bKash', payoutAccount: '01012345678', minPayoutThreshold: 500 },
];

export default function AffiliatesPage() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  const [filters, setFilters]       = useState({ search: '', status: '', tier: '', sort: 'totalRevenue:desc' });
  const [selected, setSelected]     = useState([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [payoutFor, setPayoutFor]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await affiliateService.adminGetAll({ ...filters });
      const d = res.data;
      setItems(d.affiliates || d.data || []);
      setUsingDummy(false);
    } catch {
      let list = [...DUMMY];
      const q = filters.search?.toLowerCase();
      if (q) list = list.filter(i => i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.referralCode.toLowerCase().includes(q));
      if (filters.status) list = list.filter(i => i.status === filters.status);
      if (filters.tier)   list = list.filter(i => i.tier === filters.tier);
      const [k, dir] = (filters.sort || '').split(':');
      if (k) list.sort((a, b) => (b[k] || 0) - (a[k] || 0)).reverse(); // simple sort by numeric desc
      if (k && dir === 'desc') list.sort((a, b) => (b[k] || 0) - (a[k] || 0));
      setItems(list);
      setUsingDummy(true);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    if (usingDummy) {
      if (editing) setItems(p => p.map(c => c._id === editing._id ? { ...c, ...data } : c));
      else setItems(p => [{ ...data, _id: 'aff_' + Date.now(), clicks: 0, conversions: 0, totalRevenue: 0, pendingPayout: 0 }, ...p]);
    } else {
      if (editing) await affiliateService.adminUpdate(editing._id, data);
      else         await affiliateService.adminCreate(data);
      load();
    }
    setModalOpen(false); setEditing(null);
  };
  const handleApprove = async (id) => { if (usingDummy) return setItems(p => p.map(c => c._id === id ? { ...c, status: 'approved' } : c)); await affiliateService.adminApprove(id); load(); };
  const handleSuspend = async (id) => { if (usingDummy) return setItems(p => p.map(c => c._id === id ? { ...c, status: 'suspended' } : c)); await affiliateService.adminSuspend(id); load(); };
  const handleDelete  = async (id) => { if (usingDummy) return setItems(p => p.filter(c => c._id !== id)); await affiliateService.adminDelete(id); load(); };
  const handlePayout  = async (data) => {
    if (usingDummy) setItems(p => p.map(c => c._id === payoutFor._id ? { ...c, pendingPayout: Math.max(0, (c.pendingPayout || 0) - data.amount) } : c));
    else { await affiliateService.adminPayout(payoutFor._id, data); load(); }
    setPayoutFor(null);
  };
  const handleBulkDelete = async () => { if (usingDummy) { setItems(p => p.filter(c => !selected.includes(c._id))); setSelected([]); return; } await affiliateService.adminBulkDelete(selected); setSelected([]); load(); };

  const stats = {
    total: items.length,
    approved: items.filter(i => i.status === 'approved').length,
    pending:  items.filter(i => i.status === 'pending').length,
    revenue:  items.reduce((s, i) => s + (i.totalRevenue || 0), 0),
    payout:   items.reduce((s, i) => s + (i.pendingPayout || 0), 0),
    conversions: items.reduce((s, i) => s + (i.conversions || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Affiliates</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage partner network, track referrals & pay out commissions.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20">Delete ({selected.length})</button>}
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Affiliate
          </button>
        </div>
      </div>

      {usingDummy && <div className="px-4 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs">⚠️ Showing demo data — backend unreachable.</div>}

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { l: 'Total Affiliates', v: stats.total, c: 'text-white' },
          { l: 'Approved',         v: stats.approved, c: 'text-emerald-400' },
          { l: 'Pending Review',   v: stats.pending, c: 'text-amber-400' },
          { l: 'Conversions',      v: new Intl.NumberFormat().format(stats.conversions), c: 'text-violet-400' },
          { l: 'Affiliate Revenue',v: 'SAR ' + new Intl.NumberFormat().format(stats.revenue), c: 'text-emerald-400' },
          { l: 'Pending Payout',   v: 'SAR ' + new Intl.NumberFormat().format(stats.payout), c: 'text-amber-400' },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-[#1e1e2e] bg-[#16161f] p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.l}</p>
            <p className={`text-xl font-bold mt-1 ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <AffiliateFilters filters={filters} onChange={(f) => { setFilters(f); setSelected([]); }} />

      <AffiliateTable affiliates={items} loading={loading} selected={selected} onSelectChange={setSelected}
        onEdit={(c) => { setEditing(c); setModalOpen(true); }} onApprove={handleApprove} onSuspend={handleSuspend}
        onPayout={(a) => setPayoutFor(a)} onDelete={handleDelete} />

      {modalOpen && <AffiliateFormModal affiliate={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />}
      {payoutFor && <PayoutModal affiliate={payoutFor} onSave={handlePayout} onClose={() => setPayoutFor(null)} />}
    </div>
  );
}
