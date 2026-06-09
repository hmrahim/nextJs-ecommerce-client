// 📁 PATH: src/app/(admin)/dashboard/gift-cards/page.jsx

'use client';
import { useState, useEffect, useCallback } from 'react';
import { giftCardService } from '@/services/giftCardService';
import GiftCardTable     from '@/components/admin/gift-cards/GiftCardTable';
import GiftCardFormModal from '@/components/admin/gift-cards/GiftCardFormModal';
import GiftCardFilters   from '@/components/admin/gift-cards/GiftCardFilters';

// ── Dummy data (used when backend is offline) ────────────────────────────────
const now    = new Date();
const future = (d) => new Date(now.getTime() + d * 86400000).toISOString();
const past   = (d) => new Date(now.getTime() - d * 86400000).toISOString();

const DUMMY = [
  { _id: 'g01', code: 'GIFT-WX2A-7K9P-MN3Q', type: 'digital',  initialValue: 1000, balance: 1000, currency: 'BDT', recipientName: 'Rahim Uddin',    recipientEmail: 'rahim@example.com', senderName: 'Karim Ahmed',  message: 'Happy Birthday!',         isActive: true,  expiresAt: future(180), issuedAt: past(2),  createdAt: past(2)   },
  { _id: 'g02', code: 'GIFT-ABCD-1234-EFGH', type: 'digital',  initialValue: 2000, balance:  450, currency: 'BDT', recipientName: 'Fatima Begum',   recipientEmail: 'fatima@example.com',senderName: 'Sister',       message: 'Enjoy shopping!',          isActive: true,  expiresAt: future(60),  issuedAt: past(40), createdAt: past(40)  },
  { _id: 'g03', code: 'GIFT-EID2-5000-VIP1', type: 'physical', initialValue: 5000, balance: 5000, currency: 'BDT', recipientName: 'Hasan Mahmud',   recipientEmail: '',                  senderName: 'Acme Corp',    message: 'Eid Mubarak from Acme',   isActive: true,  expiresAt: future(365), issuedAt: past(5),  createdAt: past(5)   },
  { _id: 'g04', code: 'GIFT-XPRD-9999-ZZZZ', type: 'digital',  initialValue: 500,  balance:    0, currency: 'BDT', recipientName: 'Sadia Khan',     recipientEmail: 'sadia@example.com', senderName: 'Brother',      message: 'Get something nice',       isActive: true,  expiresAt: past(10),    issuedAt: past(120),createdAt: past(120) },
  { _id: 'g05', code: 'GIFT-FRSH-3K2L-PQ7M', type: 'digital',  initialValue: 3000, balance: 3000, currency: 'BDT', recipientName: '',               recipientEmail: '',                  senderName: '',             message: '',                          isActive: false, expiresAt: future(90),  issuedAt: past(1),  createdAt: past(1)   },
  { _id: 'g06', code: 'GIFT-CORP-BULK-001A', type: 'physical', initialValue: 10000,balance: 7250, currency: 'BDT', recipientName: 'Ahsan Habib',    recipientEmail: 'ahsan@corp.com',    senderName: 'HR Dept',      message: 'Annual reward',            isActive: true,  expiresAt: future(200), issuedAt: past(30), createdAt: past(30)  },
  { _id: 'g07', code: 'GIFT-FLSH-8765-4321', type: 'digital',  initialValue: 1500, balance:    0, currency: 'BDT', recipientName: 'Nadia Akter',    recipientEmail: 'nadia@example.com', senderName: 'Friend',       message: 'For your wedding!',         isActive: true,  expiresAt: future(20),  issuedAt: past(60), createdAt: past(60)  },
  { _id: 'g08', code: 'GIFT-WLCM-NEW1-2025', type: 'digital',  initialValue: 200,  balance:  200, currency: 'BDT', recipientName: 'New Customer',   recipientEmail: 'new@example.com',   senderName: 'ShopName',     message: 'Welcome to our store!',    isActive: true,  expiresAt: future(45),  issuedAt: past(0),  createdAt: past(0)   },
  { _id: 'g09', code: 'GIFT-VIPP-LRGE-2500', type: 'physical', initialValue: 2500, balance: 1200, currency: 'BDT', recipientName: 'Tareq Hassan',   recipientEmail: 'tareq@vip.com',     senderName: 'VIP Program',  message: 'Thanks for your loyalty',  isActive: true,  expiresAt: future(150), issuedAt: past(20), createdAt: past(20)  },
  { _id: 'g10', code: 'GIFT-OLDX-XPRD-2024', type: 'digital',  initialValue: 800,  balance:  800, currency: 'BDT', recipientName: 'Mizanur Rahman', recipientEmail: 'mizan@example.com', senderName: 'Old Friend',   message: 'Better late than never',   isActive: true,  expiresAt: past(60),    issuedAt: past(200),createdAt: past(200) },
];

function getStatus(g) {
  if (!g.isActive) return 'inactive';
  if (g.expiresAt && new Date(g.expiresAt) < new Date()) return 'expired';
  if ((g.balance ?? g.initialValue) <= 0) return 'redeemed';
  return 'active';
}

export default function GiftCardsPage() {
  const [giftCards, setGiftCards]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters]       = useState({ search: '', status: '', type: '', sort: 'createdAt:desc' });
  const [selected, setSelected]     = useState([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [toast, setToast]           = useState(null); // { type, message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await giftCardService.adminGetAll({
        page: pagination.page, limit: 15,
        search: filters.search || undefined,
        status: filters.status || undefined,
        type:   filters.type   || undefined,
        sort:   filters.sort,
      });
      const d = res.data;
      setGiftCards(d.giftCards || d.data || []);
      setPagination(p => ({ ...p, total: d.total || 0, pages: d.pages || 1 }));
      setUsingDummy(false);
    } catch {
      // Backend offline → dummy
      let list = DUMMY.map(g => ({ ...g, status: getStatus(g) }));
      const q = filters.search?.toLowerCase();
      if (q) list = list.filter(g =>
        g.code.toLowerCase().includes(q)
        || g.recipientName?.toLowerCase().includes(q)
        || g.recipientEmail?.toLowerCase().includes(q)
        || g.senderName?.toLowerCase().includes(q)
      );
      if (filters.status) list = list.filter(g => g.status === filters.status);
      if (filters.type)   list = list.filter(g => g.type   === filters.type);

      // Sort
      const [key, dir] = (filters.sort || 'createdAt:desc').split(':');
      list.sort((a, b) => {
        const av = a[key]; const bv = b[key];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (av < bv) return dir === 'asc' ? -1 : 1;
        if (av > bv) return dir === 'asc' ?  1 : -1;
        return 0;
      });

      setGiftCards(list);
      setPagination({ page: 1, total: list.length, pages: 1 });
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => { load(); }, [load]);

  // ── CRUD ────────────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    try {
      if (usingDummy) {
        if (editing) {
          setGiftCards(p => p.map(g => g._id === editing._id ? { ...g, ...data, status: getStatus({ ...g, ...data }) } : g));
          showToast('success', 'Gift card updated');
        } else {
          const nc = { ...data, _id: 'g_' + Date.now(), createdAt: new Date().toISOString(), issuedAt: data.issuedAt || new Date().toISOString(), status: getStatus(data) };
          setGiftCards(p => [nc, ...p]);
          showToast('success', `Gift card ${nc.code} issued`);
        }
      } else {
        if (editing) await giftCardService.adminUpdate(editing._id, data);
        else          await giftCardService.adminCreate(data);
        await load();
        showToast('success', editing ? 'Gift card updated' : 'Gift card issued');
      }
      setModalOpen(false); setEditing(null);
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      if (usingDummy) {
        setGiftCards(p => p.filter(g => g._id !== id));
      } else {
        await giftCardService.adminDelete(id); await load();
      }
      showToast('success', 'Gift card deleted');
    } catch {
      showToast('error', 'Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      if (usingDummy) {
        setGiftCards(p => p.map(g => {
          if (g._id !== id) return g;
          const updated = { ...g, isActive: !g.isActive };
          return { ...updated, status: getStatus(updated) };
        }));
      } else {
        await giftCardService.adminToggle(id); await load();
      }
    } catch {
      showToast('error', 'Status update failed');
    }
  };

  const handleResend = async (id) => {
    try {
      if (usingDummy) {
        showToast('success', 'Delivery email re-queued (demo)');
      } else {
        await giftCardService.adminResend(id);
        showToast('success', 'Delivery email re-sent');
      }
    } catch {
      showToast('error', 'Resend failed');
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    try {
      if (usingDummy) {
        setGiftCards(p => p.filter(g => !selected.includes(g._id)));
      } else {
        await giftCardService.adminBulkDelete(selected); await load();
      }
      showToast('success', `${selected.length} deleted`);
      setSelected([]);
    } catch {
      showToast('error', 'Bulk delete failed');
    }
  };

  const handleFilterChange = (f) => {
    setFilters(f);
    setPagination(p => ({ ...p, page: 1 }));
    setSelected([]);
  };

  // Stats
  const stats = {
    total:       giftCards.length,
    active:      giftCards.filter(g => (g.status || getStatus(g)) === 'active').length,
    redeemed:    giftCards.filter(g => (g.status || getStatus(g)) === 'redeemed').length,
    expired:     giftCards.filter(g => (g.status || getStatus(g)) === 'expired').length,
    outstanding: giftCards.reduce((s, g) => s + ((g.balance ?? g.initialValue) || 0), 0),
    issuedValue: giftCards.reduce((s, g) => s + (g.initialValue || 0), 0),
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gift Cards</h1>
          <p className="text-sm text-slate-400 mt-0.5">Issue, manage and track digital and physical gift cards.</p>
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
            Issue Gift Card
          </button>
        </div>
      </div>

      {/* Demo notice */}
      {usingDummy && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Demo mode — backend connect হলে real gift cards দেখাবে।
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total Cards',     value: stats.total,                                       icon: '🎁', from: 'from-orange-500/20', border: 'border-orange-500/20', text: 'text-orange-400' },
          { label: 'Active',          value: stats.active,                                      icon: '✅', from: 'from-emerald-500/20',border: 'border-emerald-500/20',text: 'text-emerald-400' },
          { label: 'Fully Redeemed',  value: stats.redeemed,                                    icon: '💸', from: 'from-red-500/20',    border: 'border-red-500/20',    text: 'text-red-400' },
          { label: 'Expired',         value: stats.expired,                                     icon: '⏰', from: 'from-slate-500/20',  border: 'border-slate-500/20',  text: 'text-slate-400' },
          { label: 'Outstanding',     value: `৳${stats.outstanding.toLocaleString()}`,         icon: '💰', from: 'from-sky-500/20',    border: 'border-sky-500/20',    text: 'text-sky-400' },
          { label: 'Total Issued',    value: `৳${stats.issuedValue.toLocaleString()}`,         icon: '📊', from: 'from-violet-500/20', border: 'border-violet-500/20', text: 'text-violet-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.from}/5 to-transparent p-4`}>
            <div className="text-lg mb-1">{s.icon}</div>
            <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <GiftCardFilters filters={filters} onChange={handleFilterChange} />

      {/* Table */}
      <GiftCardTable
        giftCards={giftCards}
        loading={loading}
        selected={selected}
        onSelectChange={setSelected}
        onEdit={(g) => { setEditing(g); setModalOpen(true); }}
        onDelete={handleDelete}
        onToggle={handleToggle}
        onResend={handleResend}
        pagination={pagination}
        onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
      />

      {/* Modal */}
      {modalOpen && (
        <GiftCardFormModal
          editing={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-2xl border text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          {toast.type === 'success'
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          {toast.message}
        </div>
      )}
    </div>
  );
}
