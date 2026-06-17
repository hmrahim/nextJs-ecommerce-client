// 📁 PATH: src/app/(admin)/dashboard/abandoned-carts/page.jsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { abandonedCartService } from '@/services/abandonedCartService';
import AbandonedCartTable   from '@/components/admin/abandoned-carts/AbandonedCartTable';
import AbandonedCartFilters from '@/components/admin/abandoned-carts/AbandonedCartFilters';
import CartDetailDrawer     from '@/components/admin/abandoned-carts/CartDetailDrawer';

const past = (m) => new Date(Date.now() - m * 60000).toISOString();

const DUMMY = [
  { _id: 'ab01', customerName: 'Tanvir Ahmed', email: 'tanvir@example.com', phone: '+8801712345678', itemsCount: 3, cartValue: 4520, status: 'new',        abandonedAt: past(45),    recoveryAttempts: 0, couponSent: null,        items: [{ name: 'Wireless Earbuds Pro', qty: 1, price: 2800 }, { name: 'Phone Case', qty: 1, price: 720 }, { name: 'Cable USB-C', qty: 1, price: 1000 }], recoveryLog: [] },
  { _id: 'ab02', customerName: 'Nusrat Jahan', email: 'nusrat@example.com',phone: '+8801812345678',itemsCount: 2, cartValue: 2100, status: 'email_sent', abandonedAt: past(180),   recoveryAttempts: 1, couponSent: null,        items: [{ name: 'Silk Saree', qty: 1, price: 1500 }, { name: 'Beaded Clutch', qty: 1, price: 600 }], recoveryLog: [{ type: 'email', note: 'Recovery email sent', at: past(120) }] },
  { _id: 'ab03', customerName: 'Rakib Hasan',  email: 'rakib@example.com', phone: '+8801912345678',itemsCount: 5, cartValue: 8920, status: 'reminded',   abandonedAt: past(1440),  recoveryAttempts: 2, couponSent: 'COMEBACK10', items: [{ name: 'Gaming Mouse', qty: 1, price: 3200 }, { name: 'Mousepad XL', qty: 1, price: 720 }, { name: 'Mech Keyboard', qty: 1, price: 4500 }, { name: 'Wrist Rest', qty: 1, price: 300 }, { name: 'Cable Sleeve', qty: 1, price: 200 }], recoveryLog: [{ type: 'email', note: 'Email + coupon sent', at: past(1200) }, { type: 'sms', note: 'SMS reminder', at: past(720) }] },
  { _id: 'ab04', customerName: 'Sumaiya Khan', email: 'sumaiya@example.com',phone: '+8801612345678',itemsCount: 1, cartValue: 1280, status: 'recovered',  abandonedAt: past(4320),  recoveryAttempts: 1, couponSent: 'SAVE15',    items: [{ name: 'Skincare Bundle', qty: 1, price: 1280 }], recoveryLog: [{ type: 'email', note: 'Coupon SAVE15 sent', at: past(4200) }, { type: 'recovered', note: 'Order #ORD-5821 placed', at: past(4000) }] },
  { _id: 'ab05', customerName: 'Guest',        email: null,                phone: '+8801512345678',itemsCount: 2, cartValue: 1850, status: 'lost',       abandonedAt: past(10080), recoveryAttempts: 3, couponSent: 'LASTCHANCE20', items: [{ name: 'Bluetooth Speaker', qty: 1, price: 1500 }, { name: 'AUX Cable', qty: 1, price: 350 }], recoveryLog: [] },
  { _id: 'ab06', customerName: 'Faisal Mahmud',email: 'faisal@example.com',phone: '+8801412345678',itemsCount: 4, cartValue: 6240, status: 'new',        abandonedAt: past(20),    recoveryAttempts: 0, couponSent: null,        items: [{ name: 'Smartwatch', qty: 1, price: 4500 }, { name: 'Watch Strap', qty: 2, price: 600 }, { name: 'Screen Protector', qty: 1, price: 540 }], recoveryLog: [] },
  { _id: 'ab07', customerName: 'Anika Tabassum',email:'anika@example.com', phone: '+8801312345678',itemsCount: 6, cartValue: 12480,status: 'email_sent', abandonedAt: past(360),   recoveryAttempts: 1, couponSent: null,        items: [{ name: 'Designer Kurti', qty: 2, price: 2200 }, { name: 'Heels', qty: 1, price: 3200 }, { name: 'Handbag', qty: 1, price: 2880 }, { name: 'Jewelry Set', qty: 1, price: 1600 }, { name: 'Perfume', qty: 1, price: 800 }], recoveryLog: [{ type: 'email', note: 'Recovery email sent', at: past(300) }] },
  { _id: 'ab08', customerName: 'Mehedi Hassan',email: 'mehedi@example.com',phone: '+8801212345678',itemsCount: 2, cartValue: 3450, status: 'reminded',   abandonedAt: past(2880),  recoveryAttempts: 2, couponSent: 'BACK10',    items: [{ name: 'Running Shoes', qty: 1, price: 2800 }, { name: 'Socks Pack', qty: 1, price: 650 }], recoveryLog: [{ type: 'email', note: 'Recovery sent', at: past(2700) }, { type: 'sms', note: 'Final reminder', at: past(1440) }] },
  { _id: 'ab09', customerName: 'Sadia Akter',  email: 'sadia@example.com', phone: '+8801112345678',itemsCount: 1, cartValue: 950,  status: 'new',        abandonedAt: past(8),     recoveryAttempts: 0, couponSent: null,        items: [{ name: 'Hair Dryer', qty: 1, price: 950 }], recoveryLog: [] },
  { _id: 'ab10', customerName: 'Imran Khan',   email: 'imran@example.com', phone: '+8801012345678',itemsCount: 3, cartValue: 5640, status: 'recovered',  abandonedAt: past(8640),  recoveryAttempts: 1, couponSent: 'WIN20',     items: [{ name: 'Tablet 10"', qty: 1, price: 4500 }, { name: 'Tablet Case', qty: 1, price: 740 }, { name: 'Stylus', qty: 1, price: 400 }], recoveryLog: [{ type: 'email', note: 'Coupon WIN20 sent', at: past(8400) }, { type: 'recovered', note: 'Order #ORD-5901 placed', at: past(8000) }] },
];

function withinAge(c, age) {
  if (!age) return true;
  const diff = (Date.now() - new Date(c.abandonedAt).getTime()) / 1000;
  if (age === '1h')  return diff < 3600;
  if (age === '24h') return diff < 86400;
  if (age === '7d')  return diff < 604800;
  if (age === '30d') return diff < 2592000;
  return true;
}

export default function AbandonedCartsPage() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  const [filters, setFilters]       = useState({ search: '', status: '', age: '' });
  const [selected, setSelected]     = useState([]);
  const [viewing, setViewing]       = useState(null);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await abandonedCartService.adminGetAll({ ...filters });
      setItems(res.data.carts || res.data.data || []);
      setUsingDummy(false);
    } catch {
      let list = [...DUMMY];
      const q = filters.search?.toLowerCase();
      if (q) list = list.filter(c => (c.customerName || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').includes(q));
      if (filters.status) list = list.filter(c => c.status === filters.status);
      if (filters.age)    list = list.filter(c => withinAge(c, filters.age));
      setItems(list);
      setUsingDummy(true);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleSendRecovery = async (cart, type) => {
    if (usingDummy) {
      setItems(p => p.map(c => c._id === cart._id ? { ...c, status: type === 'sms' ? 'reminded' : 'email_sent', recoveryAttempts: (c.recoveryAttempts || 0) + 1, couponSent: type === 'coupon' ? 'RECOVER10' : c.couponSent } : c));
    } else { await abandonedCartService.adminSendRecovery(cart._id, { type }); load(); }
    showToast(`${type === 'email' ? '📧 Recovery email' : type === 'sms' ? '💬 SMS' : '🎟 Coupon'} sent to ${cart.customerName || 'customer'}`);
  };
  const handleMarkRecovered = async (id) => { if (usingDummy) setItems(p => p.map(c => c._id === id ? { ...c, status: 'recovered' } : c)); else { await abandonedCartService.adminMarkRecovered(id); load(); } showToast('Cart marked as recovered ✅'); };
  const handleDelete    = async (id) => { if (usingDummy) setItems(p => p.filter(c => c._id !== id)); else { await abandonedCartService.adminDelete(id); load(); } };
  const handleBulkDelete = async () => { if (usingDummy) { setItems(p => p.filter(c => !selected.includes(c._id))); setSelected([]); return; } await abandonedCartService.adminBulkDelete(selected); setSelected([]); load(); };
  const handleBulkRecovery = async () => {
    if (usingDummy) setItems(p => p.map(c => selected.includes(c._id) ? { ...c, status: 'email_sent', recoveryAttempts: (c.recoveryAttempts || 0) + 1 } : c));
    else { await abandonedCartService.adminBulkRecovery(selected, { type: 'email' }); load(); }
    showToast(`📧 Recovery email sent to ${selected.length} customers`);
    setSelected([]);
  };

  const stats = {
    total: items.length,
    value: items.reduce((s, c) => s + (c.cartValue || 0), 0),
    recovered: items.filter(c => c.status === 'recovered').length,
    recoveredValue: items.filter(c => c.status === 'recovered').reduce((s, c) => s + (c.cartValue || 0), 0),
    recoveryRate: items.length ? ((items.filter(c => c.status === 'recovered').length / items.length) * 100).toFixed(1) + '%' : '0%',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Abandoned Carts</h1>
          <p className="text-sm text-slate-400 mt-0.5">Recover lost revenue — send email, SMS or coupon to bring customers back.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <>
              <button onClick={handleBulkRecovery} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium hover:bg-sky-500/20">📧 Send Recovery ({selected.length})</button>
              <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20">Delete ({selected.length})</button>
            </>
          )}
        </div>
      </div>

      {usingDummy && <div className="px-4 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs">⚠️ Showing demo data — backend unreachable.</div>}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: 'Abandoned Carts',  v: stats.total,                                       c: 'text-white' },
          { l: 'Cart Value at Risk',v: 'SAR ' + new Intl.NumberFormat().format(stats.value),c: 'text-amber-400' },
          { l: 'Recovered',        v: stats.recovered,                                   c: 'text-emerald-400' },
          { l: 'Recovered Value',  v: 'SAR ' + new Intl.NumberFormat().format(stats.recoveredValue), c: 'text-emerald-400' },
          { l: 'Recovery Rate',    v: stats.recoveryRate,                                c: 'text-orange-400' },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-[#1e1e2e] bg-[#16161f] p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.l}</p>
            <p className={`text-xl font-bold mt-1 ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <AbandonedCartFilters filters={filters} onChange={(f) => { setFilters(f); setSelected([]); }} />

      <AbandonedCartTable carts={items} loading={loading} selected={selected} onSelectChange={setSelected}
        onSendRecovery={handleSendRecovery} onMarkRecovered={handleMarkRecovered} onDelete={handleDelete} onView={setViewing} />

      <CartDetailDrawer cart={viewing} onClose={() => setViewing(null)} />

      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-2xl border text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>{toast.msg}</div>
      )}
    </div>
  );
}
