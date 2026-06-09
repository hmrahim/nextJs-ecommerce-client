// 📁 PATH: src/app/(admin)/dashboard/payouts/page.jsx
// 💸 Seller payouts management (Amazon Seller Central / Daraj Seller Center style)

'use client';
import { useState, useMemo } from 'react';

/* ───────────── Dummy Data ───────────── */
const now = Date.now();
const day = 86400000;
const iso = (d) => new Date(d).toISOString();

const SELLERS = [
  { id: 's01', name: 'Aarong Electronics',  email: 'finance@aarong-el.com',  avatar: 'AE' },
  { id: 's02', name: 'Daraz Mall Vendor',   email: 'pay@dmv.com',            avatar: 'DM' },
  { id: 's03', name: 'TechZone BD',         email: 'accounts@techzone.bd',   avatar: 'TZ' },
  { id: 's04', name: 'Fashion Hub',         email: 'admin@fashionhub.co',    avatar: 'FH' },
  { id: 's05', name: 'Home & Living Co.',   email: 'finance@hnl.com',        avatar: 'HL' },
  { id: 's06', name: 'Mobile Mart',         email: 'pay@mobilemart.bd',      avatar: 'MM' },
  { id: 's07', name: 'Beauty Bazaar',       email: 'cfo@beautybazaar.com',   avatar: 'BB' },
  { id: 's08', name: 'Sports World',        email: 'finance@sportsworld.bd', avatar: 'SW' },
];

const METHODS = {
  bank:   { label: 'Bank Transfer', icon: '🏦', color: 'text-sky-400' },
  bkash:  { label: 'bKash',         icon: '📱', color: 'text-pink-400' },
  nagad:  { label: 'Nagad',         icon: '💳', color: 'text-orange-400' },
  rocket: { label: 'Rocket',        icon: '🚀', color: 'text-violet-400' },
};

const STATUS = {
  pending:    { label: 'Pending Review', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  processing: { label: 'Processing',     cls: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  paid:       { label: 'Paid',           cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  failed:     { label: 'Failed',         cls: 'bg-red-500/15 text-red-300 border-red-500/30' },
  on_hold:    { label: 'On Hold',        cls: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
};

const PAYOUTS_SEED = [
  { id: 'PO-2026-00128', seller: SELLERS[0], grossAmount: 184520, commission: 18452, fees: 850, tax: 2767, netAmount: 162451, currency: 'BDT', method: 'bank',   account: 'DBBL ••4521', status: 'paid',       requestedAt: iso(now-12*day), processedAt: iso(now-10*day), orders: 142, period: 'Nov 16 – Nov 30, 2025', txnId: 'TXN-9281044', notes: '' },
  { id: 'PO-2026-00129', seller: SELLERS[1], grossAmount: 96400,  commission: 9640,  fees: 500, tax: 1446, netAmount: 84814,  currency: 'BDT', method: 'bkash',  account: '+8801712••3344', status: 'processing', requestedAt: iso(now-3*day),  processedAt: null,            orders: 78,  period: 'Dec 01 – Dec 15, 2025', txnId: '',          notes: 'Auto release on T+2' },
  { id: 'PO-2026-00130', seller: SELLERS[2], grossAmount: 312800, commission: 31280, fees: 1200,tax: 4692, netAmount: 275628, currency: 'BDT', method: 'bank',   account: 'BRAC ••8812', status: 'pending',    requestedAt: iso(now-1*day),  processedAt: null,            orders: 211, period: 'Dec 01 – Dec 15, 2025', txnId: '',          notes: '' },
  { id: 'PO-2026-00131', seller: SELLERS[3], grossAmount: 54200,  commission: 5420,  fees: 350, tax: 813,  netAmount: 47617,  currency: 'BDT', method: 'nagad',  account: '+8801812••9911', status: 'paid',       requestedAt: iso(now-22*day), processedAt: iso(now-20*day), orders: 41,  period: 'Nov 01 – Nov 15, 2025', txnId: 'TXN-9244112', notes: '' },
  { id: 'PO-2026-00132', seller: SELLERS[4], grossAmount: 128900, commission: 12890, fees: 700, tax: 1934, netAmount: 113376, currency: 'BDT', method: 'rocket', account: '+8801911••2233', status: 'failed',     requestedAt: iso(now-5*day),  processedAt: iso(now-4*day),  orders: 96,  period: 'Dec 01 – Dec 15, 2025', txnId: '',          notes: 'Account inactive — retry needed' },
  { id: 'PO-2026-00133', seller: SELLERS[5], grossAmount: 442100, commission: 44210, fees: 1800,tax: 6632, netAmount: 389458, currency: 'BDT', method: 'bank',   account: 'EBL ••1147',  status: 'on_hold',    requestedAt: iso(now-2*day),  processedAt: null,            orders: 318, period: 'Dec 01 – Dec 15, 2025', txnId: '',          notes: 'KYC verification pending' },
  { id: 'PO-2026-00134', seller: SELLERS[6], grossAmount: 76300,  commission: 7630,  fees: 400, tax: 1145, netAmount: 67125,  currency: 'BDT', method: 'bkash',  account: '+8801511••7788', status: 'paid',       requestedAt: iso(now-35*day), processedAt: iso(now-33*day), orders: 58,  period: 'Oct 16 – Oct 31, 2025', txnId: 'TXN-9112889', notes: '' },
  { id: 'PO-2026-00135', seller: SELLERS[7], grossAmount: 198400, commission: 19840, fees: 950, tax: 2976, netAmount: 174634, currency: 'BDT', method: 'bank',   account: 'CITY ••3320', status: 'processing', requestedAt: iso(now-4*day),  processedAt: null,            orders: 154, period: 'Dec 01 – Dec 15, 2025', txnId: '',          notes: '' },
  { id: 'PO-2026-00136', seller: SELLERS[0], grossAmount: 88100,  commission: 8810,  fees: 450, tax: 1322, netAmount: 77518,  currency: 'BDT', method: 'bkash',  account: '+8801711••5544', status: 'pending',    requestedAt: iso(now-1*day),  processedAt: null,            orders: 64,  period: 'Dec 01 – Dec 15, 2025', txnId: '',          notes: '' },
  { id: 'PO-2026-00137', seller: SELLERS[2], grossAmount: 256700, commission: 25670, fees: 1100,tax: 3851, netAmount: 226079, currency: 'BDT', method: 'bank',   account: 'BRAC ••8812', status: 'paid',       requestedAt: iso(now-45*day), processedAt: iso(now-43*day), orders: 188, period: 'Oct 16 – Oct 31, 2025', txnId: 'TXN-9018744', notes: '' },
  { id: 'PO-2026-00138', seller: SELLERS[3], grossAmount: 41200,  commission: 4120,  fees: 300, tax: 618,  netAmount: 36162,  currency: 'BDT', method: 'nagad',  account: '+8801812••9911', status: 'paid',       requestedAt: iso(now-50*day), processedAt: iso(now-48*day), orders: 32,  period: 'Oct 01 – Oct 15, 2025', txnId: 'TXN-8998441', notes: '' },
  { id: 'PO-2026-00139', seller: SELLERS[5], grossAmount: 521800, commission: 52180, fees: 2000,tax: 7827, netAmount: 459793, currency: 'BDT', method: 'bank',   account: 'EBL ••1147',  status: 'pending',    requestedAt: iso(now-1*day),  processedAt: null,            orders: 387, period: 'Dec 01 – Dec 15, 2025', txnId: '',          notes: 'Large amount — needs manager approval' },
];

const fmt = (n) => `৳${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const dateFmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* ───────────── Sub-components ───────────── */
function StatCard({ label, value, hint, icon, color }) {
  return (
    <div className={`rounded-xl border ${color.border} bg-gradient-to-br ${color.from} to-transparent p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        {hint && <span className={`text-[10px] font-semibold ${color.text}`}>{hint}</span>}
      </div>
      <p className={`text-xl font-bold ${color.text}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${s.cls}`}>{s.label}</span>;
}

function PayoutDrawer({ payout, onClose, onAction }) {
  if (!payout) return null;
  const timeline = [
    { label: 'Requested',  date: payout.requestedAt, done: true },
    { label: 'Reviewed',   date: payout.status !== 'pending' ? payout.requestedAt : null, done: payout.status !== 'pending' },
    { label: 'Processing', date: ['processing','paid','failed'].includes(payout.status) ? payout.processedAt || payout.requestedAt : null, done: ['processing','paid','failed'].includes(payout.status) },
    { label: payout.status === 'failed' ? 'Failed' : 'Paid', date: payout.processedAt, done: ['paid','failed'].includes(payout.status) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative ml-auto w-full max-w-2xl h-full bg-[#0b0b14] border-l border-[#1e1e2e] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-[#0b0b14]/95 backdrop-blur border-b border-[#1e1e2e] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Payout</p>
            <h2 className="text-lg font-bold text-white">{payout.id}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seller */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-[#1e1e2e] bg-[#0f0f1a]">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">{payout.seller.avatar}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{payout.seller.name}</p>
              <p className="text-xs text-slate-400">{payout.seller.email}</p>
            </div>
            <StatusPill status={payout.status} />
          </div>

          {/* Amount Breakdown */}
          <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f1a] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Amount Breakdown</h3>
            <div className="space-y-2 text-sm">
              <Row label="Gross Sales"           value={fmt(payout.grossAmount)} />
              <Row label="Platform Commission (10%)" value={`− ${fmt(payout.commission)}`} negative />
              <Row label="Transaction Fees"      value={`− ${fmt(payout.fees)}`} negative />
              <Row label="Tax Withheld"          value={`− ${fmt(payout.tax)}`} negative />
              <div className="border-t border-[#1e1e2e] my-2" />
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm text-slate-300 font-semibold">Net Payable</span>
                <span className="text-xl font-bold text-emerald-400">{fmt(payout.netAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Method"        value={`${METHODS[payout.method].icon} ${METHODS[payout.method].label}`} />
            <InfoBox label="Account"       value={payout.account} mono />
            <InfoBox label="Settlement Period" value={payout.period} />
            <InfoBox label="Orders Settled"    value={`${payout.orders} orders`} />
            <InfoBox label="Requested"     value={dateFmt(payout.requestedAt)} />
            <InfoBox label="Processed"     value={dateFmt(payout.processedAt)} />
            {payout.txnId && <InfoBox label="Transaction ID" value={payout.txnId} mono full />}
          </div>

          {payout.notes && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-[11px] font-semibold text-amber-400 uppercase mb-1">Notes</p>
              <p className="text-sm text-amber-200/80">{payout.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f1a] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Status Timeline</h3>
            <div className="space-y-3">
              {timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 mt-1.5 rounded-full ${t.done ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-700'}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${t.done ? 'text-white' : 'text-slate-500'}`}>{t.label}</p>
                    <p className="text-xs text-slate-500">{t.date ? dateFmt(t.date) : '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            {payout.status === 'pending' && (
              <>
                <button onClick={() => onAction('approve', payout)} className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold">✓ Approve & Process</button>
                <button onClick={() => onAction('reject', payout)} className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-sm font-semibold">Reject</button>
                <button onClick={() => onAction('hold', payout)} className="px-4 py-2.5 rounded-lg bg-slate-500/10 border border-slate-500/30 text-slate-300 hover:bg-slate-500/20 text-sm font-semibold">Hold</button>
              </>
            )}
            {payout.status === 'processing' && (
              <button onClick={() => onAction('markPaid', payout)} className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold">Mark as Paid</button>
            )}
            {payout.status === 'failed' && (
              <button onClick={() => onAction('retry', payout)} className="flex-1 px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold">↻ Retry Payout</button>
            )}
            {payout.status === 'on_hold' && (
              <button onClick={() => onAction('release', payout)} className="flex-1 px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold">Release Hold</button>
            )}
            <button onClick={() => alert('Receipt downloaded (demo)')} className="px-4 py-2.5 rounded-lg bg-white/5 border border-[#1e1e2e] text-slate-300 hover:bg-white/10 text-sm font-semibold">⬇ Receipt</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, negative }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={negative ? 'text-red-300' : 'text-slate-200'}>{value}</span>
    </div>
  );
}

function InfoBox({ label, value, mono, full }) {
  return (
    <div className={`rounded-lg border border-[#1e1e2e] bg-[#0f0f1a] p-3 ${full ? 'col-span-2' : ''}`}>
      <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</p>
      <p className={`text-sm text-white mt-1 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

/* ───────────── Main Page ───────────── */
export default function PayoutsPage() {
  const [payouts, setPayouts] = useState(PAYOUTS_SEED);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [method, setMethod]   = useState('');
  const [sort, setSort]       = useState('newest');
  const [selected, setSelected] = useState([]);
  const [active, setActive]   = useState(null);

  const filtered = useMemo(() => {
    let list = [...payouts];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.id.toLowerCase().includes(q) || p.seller.name.toLowerCase().includes(q) || p.account.toLowerCase().includes(q));
    }
    if (status) list = list.filter(p => p.status === status);
    if (method) list = list.filter(p => p.method === method);
    switch (sort) {
      case 'oldest':   list.sort((a,b) => new Date(a.requestedAt) - new Date(b.requestedAt)); break;
      case 'amount_d': list.sort((a,b) => b.netAmount - a.netAmount); break;
      case 'amount_a': list.sort((a,b) => a.netAmount - b.netAmount); break;
      default:         list.sort((a,b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    }
    return list;
  }, [payouts, search, status, method, sort]);

  const stats = useMemo(() => ({
    total:      payouts.length,
    paid:       payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.netAmount, 0),
    pending:    payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.netAmount, 0),
    processing: payouts.filter(p => p.status === 'processing').reduce((s, p) => s + p.netAmount, 0),
    failed:     payouts.filter(p => p.status === 'failed').reduce((s, p) => s + p.netAmount, 0),
    onHold:     payouts.filter(p => p.status === 'on_hold').reduce((s, p) => s + p.netAmount, 0),
  }), [payouts]);

  const handleAction = (action, payout) => {
    setPayouts(prev => prev.map(p => {
      if (p.id !== payout.id) return p;
      const u = { ...p };
      if (action === 'approve')  { u.status = 'processing'; u.notes = 'Approved by admin'; }
      if (action === 'reject')   { u.status = 'failed'; u.notes = 'Rejected by admin'; u.processedAt = iso(Date.now()); }
      if (action === 'hold')     { u.status = 'on_hold'; u.notes = 'Held by admin for review'; }
      if (action === 'markPaid') { u.status = 'paid'; u.processedAt = iso(Date.now()); u.txnId = 'TXN-' + Math.floor(Math.random()*9000000+1000000); }
      if (action === 'retry')    { u.status = 'processing'; u.notes = 'Retry in progress'; }
      if (action === 'release')  { u.status = 'pending'; u.notes = 'Released from hold'; }
      return u;
    }));
    setActive(null);
  };

  const handleBulkApprove = () => {
    setPayouts(prev => prev.map(p => selected.includes(p.id) && p.status === 'pending' ? { ...p, status: 'processing' } : p));
    setSelected([]);
  };

  const allSelected = filtered.length > 0 && filtered.every(p => selected.includes(p.id));
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map(p => p.id));
  const toggleOne = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const sel = "h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-slate-300 focus:outline-none focus:border-orange-500/50";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Seller Payouts</h1>
          <p className="text-sm text-slate-400 mt-0.5">Approve, process and track seller settlements across all payment methods.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button onClick={handleBulkApprove} className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20">
              ✓ Approve ({selected.length})
            </button>
          )}
          <button onClick={() => alert('Export started (demo)')} className="px-4 py-2 rounded-lg bg-white/5 border border-[#1e1e2e] text-slate-300 text-sm font-semibold hover:bg-white/10">⬇ Export CSV</button>
          <button onClick={() => alert('New manual payout (demo)')} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold shadow-lg shadow-orange-900/30">+ New Payout</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Total Payouts" value={stats.total}                  icon="💼" color={{ border:'border-violet-500/20', from:'from-violet-500/10', text:'text-violet-300' }} />
        <StatCard label="Paid Out"      value={fmt(stats.paid)}              hint="LIFETIME" icon="✅" color={{ border:'border-emerald-500/20', from:'from-emerald-500/10', text:'text-emerald-300' }} />
        <StatCard label="Pending"       value={fmt(stats.pending)}           hint="REVIEW"   icon="⏳" color={{ border:'border-amber-500/20', from:'from-amber-500/10', text:'text-amber-300' }} />
        <StatCard label="Processing"    value={fmt(stats.processing)}        icon="🔄" color={{ border:'border-sky-500/20', from:'from-sky-500/10', text:'text-sky-300' }} />
        <StatCard label="Failed"        value={fmt(stats.failed)}            hint="RETRY"    icon="⚠️" color={{ border:'border-red-500/20', from:'from-red-500/10', text:'text-red-300' }} />
        <StatCard label="On Hold"       value={fmt(stats.onHold)}            icon="🔒" color={{ border:'border-slate-500/20', from:'from-slate-500/10', text:'text-slate-300' }} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payout id, seller or account…" className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className={sel}>
          <option value="">All Status</option>
          {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={method} onChange={e => setMethod(e.target.value)} className={sel}>
          <option value="">All Methods</option>
          {Object.entries(METHODS).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className={sel}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount_d">Highest Amount</option>
          <option value="amount_a">Lowest Amount</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#1e1e2e] bg-[#0b0b14] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#111118] border-b border-[#1e1e2e]">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 w-10"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-orange-500" /></th>
                <th className="px-4 py-3">Payout ID</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Net Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-500">No payouts found</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-[#1e1e2e] hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleOne(p.id)} className="accent-orange-500" /></td>
                  <td className="px-4 py-3"><span className="font-mono text-xs text-slate-300">{p.id}</span><div className="text-[10px] text-slate-500">{p.orders} orders</div></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">{p.seller.avatar}</div>
                      <div><p className="text-white font-medium">{p.seller.name}</p><p className="text-[10px] text-slate-500">{p.period}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-white font-bold">{fmt(p.netAmount)}</span><div className="text-[10px] text-slate-500">of {fmt(p.grossAmount)}</div></td>
                  <td className="px-4 py-3"><span className={METHODS[p.method].color}>{METHODS[p.method].icon} {METHODS[p.method].label}</span><div className="text-[10px] text-slate-500 font-mono">{p.account}</div></td>
                  <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{dateFmt(p.requestedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setActive(p)} className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-[#1e1e2e]">View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#1e1e2e] text-xs text-slate-500 flex justify-between">
          <span>Showing {filtered.length} of {payouts.length} payouts</span>
          <span>Total net: <span className="text-white font-semibold">{fmt(filtered.reduce((s, p) => s + p.netAmount, 0))}</span></span>
        </div>
      </div>

      <PayoutDrawer payout={active} onClose={() => setActive(null)} onAction={handleAction} />
    </div>
  );
}
