// 📁 PATH: src/app/(admin)/dashboard/invoices/page.jsx
// 🧾 Invoice management (Amazon / Noon order invoice style)

'use client';
import { useState, useMemo } from 'react';

const now = Date.now();
const day = 86400000;
const iso = (d) => new Date(d).toISOString();
const fmt = (n) => `৳${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const dateFmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';

const STATUS = {
  paid:      { label: 'Paid',      cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  pending:   { label: 'Pending',   cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  overdue:   { label: 'Overdue',   cls: 'bg-red-500/15 text-red-300 border-red-500/30' },
  refunded:  { label: 'Refunded',  cls: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  cancelled: { label: 'Cancelled', cls: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  draft:     { label: 'Draft',     cls: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
};

const CUSTOMERS = [
  { id: 'c01', name: 'Rakib Hasan',     email: 'rakib.h@gmail.com',     phone: '+880 1712-334455', addr: 'House 12, Road 5, Dhanmondi, Dhaka 1209' },
  { id: 'c02', name: 'Sumaiya Akter',   email: 'sumaiya.a@yahoo.com',   phone: '+880 1811-998877', addr: 'Apt 4B, Sector 7, Uttara, Dhaka 1230' },
  { id: 'c03', name: 'Arif Khan',       email: 'arif.khan@outlook.com', phone: '+880 1611-445566', addr: 'Flat 3A, Banani DOHS, Dhaka 1213' },
  { id: 'c04', name: 'Nadia Rahman',    email: 'nadia.r@gmail.com',     phone: '+880 1911-223344', addr: 'House 24, Block C, Mirpur 10, Dhaka 1216' },
  { id: 'c05', name: 'Tareq Mahmud',    email: 'tareq.m@gmail.com',     phone: '+880 1511-778899', addr: 'Apt 5C, Gulshan Avenue, Dhaka 1212' },
  { id: 'c06', name: 'Farhana Sultana', email: 'farhana.s@hotmail.com', phone: '+880 1711-556677', addr: 'House 8, Road 12, Bashundhara R/A, Dhaka 1229' },
  { id: 'c07', name: 'Imran Hossain',   email: 'imran.h@gmail.com',     phone: '+880 1811-112233', addr: 'Plot 56, Sector 4, Uttara, Dhaka 1230' },
];

const ITEMS_POOL = [
  { sku: 'MOB-IP14-128', name: 'iPhone 14 128GB Midnight', price: 124900, tax: 7.5 },
  { sku: 'MOB-S23-256',  name: 'Samsung Galaxy S23 256GB', price: 89500,  tax: 7.5 },
  { sku: 'LAP-MBA-M2',   name: 'MacBook Air M2 13"',        price: 154900, tax: 7.5 },
  { sku: 'AUD-APP-2',    name: 'AirPods Pro (2nd Gen)',     price: 27500,  tax: 7.5 },
  { sku: 'WCH-AW-S9',    name: 'Apple Watch Series 9 45mm', price: 51200,  tax: 7.5 },
  { sku: 'FSN-TS-MEN',   name: 'Men Premium Cotton T-Shirt',price: 890,    tax: 5.0 },
  { sku: 'HOM-BLN-QN',   name: 'Queen Size Cotton Blanket', price: 2450,   tax: 5.0 },
  { sku: 'BTY-PRF-50',   name: 'Eau de Parfum 50ml',        price: 4200,   tax: 5.0 },
  { sku: 'SPT-SHO-RUN',  name: 'Running Shoes',             price: 5800,   tax: 5.0 },
  { sku: 'KCH-BLD-PRO',  name: 'Kitchen Blender Pro 1200W', price: 6700,   tax: 5.0 },
];

function mkItems(seed) {
  const n = 1 + (seed % 4);
  const items = [];
  for (let i = 0; i < n; i++) {
    const p = ITEMS_POOL[(seed + i * 3) % ITEMS_POOL.length];
    const qty = 1 + ((seed + i) % 3);
    items.push({ ...p, qty });
  }
  return items;
}

function calc(items, shipping = 60, discount = 0) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const tax      = items.reduce((s, it) => s + (it.price * it.qty * it.tax / 100), 0);
  const total    = subtotal + tax + shipping - discount;
  return { subtotal, tax, shipping, discount, total };
}

const INVOICES_SEED = Array.from({ length: 14 }).map((_, i) => {
  const cust = CUSTOMERS[i % CUSTOMERS.length];
  const items = mkItems(i + 3);
  const { subtotal, tax, shipping, discount, total } = calc(items, 60, i % 4 === 0 ? 200 : 0);
  const issuedAt = iso(now - (i * 3 + 1) * day);
  const dueAt    = iso(now - (i * 3 + 1) * day + 7 * day);
  const overdue  = new Date(dueAt) < new Date() && i % 5 === 2;
  let status = i % 6 === 0 ? 'pending' : i % 6 === 1 ? 'paid' : i % 6 === 2 ? 'paid' : i % 6 === 3 ? 'refunded' : i % 6 === 4 ? 'cancelled' : 'paid';
  if (overdue && status === 'pending') status = 'overdue';
  return {
    id:        `INV-${(2026000 + i + 128).toString()}`,
    orderId:   `#ORD-${(95000 + i * 17).toString()}`,
    customer:  cust,
    items,
    subtotal, tax, shipping, discount, total,
    status,
    type:      i % 7 === 6 ? 'credit_note' : (status === 'refunded' ? 'refund' : 'sale'),
    paymentMethod: ['Card','bKash','Nagad','Cash on Delivery','Bank'][i % 5],
    issuedAt, dueAt,
    paidAt: status === 'paid' ? iso(new Date(issuedAt).getTime() + day) : null,
    notes:  i % 4 === 0 ? 'Thanks for shopping with Moom24.' : '',
  };
});

/* ───────────── Components ───────────── */
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
  const s = STATUS[status] || STATUS.draft;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${s.cls}`}>{s.label}</span>;
}

function InvoiceModal({ invoice, onClose, onAction }) {
  if (!invoice) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-xl shadow-2xl text-slate-800" onClick={e => e.stopPropagation()}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Invoice</span>
            <span className="text-sm font-bold text-slate-800">{invoice.id}</span>
            <StatusPill status={invoice.status} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onAction('print', invoice)} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200">🖨 Print</button>
            <button onClick={() => onAction('download', invoice)} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200">⬇ PDF</button>
            <button onClick={() => onAction('send', invoice)} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-orange-500 hover:bg-orange-400 text-white">✉ Email</button>
            {invoice.status === 'pending' && <button onClick={() => onAction('markPaid', invoice)} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-500 hover:bg-emerald-400 text-white">✓ Mark Paid</button>}
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 text-white font-bold flex items-center justify-center">M</div>
                <span className="text-2xl font-bold tracking-tight">Moom24</span>
              </div>
              <p className="text-xs text-slate-500">House 14, Road 7, Banani, Dhaka 1213</p>
              <p className="text-xs text-slate-500">support@moom24.com · +880 9610-123456</p>
              <p className="text-xs text-slate-500">VAT Reg: 003456789-0102</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-slate-800">{invoice.type === 'credit_note' ? 'CREDIT NOTE' : invoice.type === 'refund' ? 'REFUND' : 'INVOICE'}</h1>
              <p className="text-sm text-slate-500 mt-1">{invoice.id}</p>
              <p className="text-xs text-slate-500 mt-2">Order: <span className="font-mono">{invoice.orderId}</span></p>
            </div>
          </div>

          {/* Bill to */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-1">Bill To</p>
              <p className="font-semibold text-slate-800">{invoice.customer.name}</p>
              <p className="text-sm text-slate-600">{invoice.customer.email}</p>
              <p className="text-sm text-slate-600">{invoice.customer.phone}</p>
              <p className="text-sm text-slate-600 mt-1">{invoice.customer.addr}</p>
            </div>
            <div className="text-right">
              <div className="inline-grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-slate-500">Issued:</span>     <span className="font-medium">{dateFmt(invoice.issuedAt)}</span>
                <span className="text-slate-500">Due:</span>        <span className="font-medium">{dateFmt(invoice.dueAt)}</span>
                <span className="text-slate-500">Payment:</span>    <span className="font-medium">{invoice.paymentMethod}</span>
                {invoice.paidAt && (<><span className="text-slate-500">Paid on:</span> <span className="font-medium">{dateFmt(invoice.paidAt)}</span></>)}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left  px-4 py-2.5">Item</th>
                  <th className="text-right px-4 py-2.5 w-16">Qty</th>
                  <th className="text-right px-4 py-2.5 w-28">Unit Price</th>
                  <th className="text-right px-4 py-2.5 w-16">Tax</th>
                  <th className="text-right px-4 py-2.5 w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{it.name}</p>
                      <p className="text-xs text-slate-500 font-mono">SKU: {it.sku}</p>
                    </td>
                    <td className="text-right px-4 py-3">{it.qty}</td>
                    <td className="text-right px-4 py-3">{fmt(it.price)}</td>
                    <td className="text-right px-4 py-3 text-slate-500">{it.tax}%</td>
                    <td className="text-right px-4 py-3 font-semibold">{fmt(it.price * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-5">
            <div className="w-72 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{fmt(invoice.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tax (VAT)</span><span>{fmt(invoice.tax)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{fmt(invoice.shipping)}</span></div>
              {invoice.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>− {fmt(invoice.discount)}</span></div>}
              <div className="border-t pt-2 flex justify-between text-base font-bold text-slate-800"><span>Total</span><span>{fmt(invoice.total)}</span></div>
              {invoice.status === 'paid' && <div className="text-right text-emerald-600 text-xs font-semibold pt-1">✓ PAID IN FULL</div>}
              {invoice.status === 'overdue' && <div className="text-right text-red-600 text-xs font-semibold pt-1">⚠ OVERDUE</div>}
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6 p-3 rounded-lg bg-slate-50 border text-xs text-slate-600 italic">{invoice.notes}</div>
          )}

          <div className="mt-8 pt-4 border-t text-center text-[11px] text-slate-400">
            This is a computer-generated invoice. For any queries contact support@moom24.com
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Main Page ───────────── */
export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(INVOICES_SEED);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType]     = useState('');
  const [range, setRange]   = useState('all');
  const [sort, setSort]     = useState('newest');
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    let list = [...invoices];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.id.toLowerCase().includes(q) || i.orderId.toLowerCase().includes(q) || i.customer.name.toLowerCase().includes(q) || i.customer.email.toLowerCase().includes(q));
    }
    if (status) list = list.filter(i => i.status === status);
    if (type)   list = list.filter(i => i.type === type);
    if (range !== 'all') {
      const days = { '7d': 7, '30d': 30, '90d': 90 }[range];
      if (days) list = list.filter(i => (now - new Date(i.issuedAt).getTime()) <= days * day);
    }
    switch (sort) {
      case 'oldest':   list.sort((a,b) => new Date(a.issuedAt) - new Date(b.issuedAt)); break;
      case 'amount_d': list.sort((a,b) => b.total - a.total); break;
      case 'amount_a': list.sort((a,b) => a.total - b.total); break;
      default:         list.sort((a,b) => new Date(b.issuedAt) - new Date(a.issuedAt));
    }
    return list;
  }, [invoices, search, status, type, range, sort]);

  const stats = useMemo(() => ({
    total:   invoices.length,
    paid:    invoices.filter(i => i.status === 'paid').reduce((s,i) => s + i.total, 0),
    pending: invoices.filter(i => i.status === 'pending').reduce((s,i) => s + i.total, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((s,i) => s + i.total, 0),
    revenue: invoices.filter(i => i.status === 'paid').reduce((s,i) => s + i.total, 0),
    tax:     invoices.filter(i => i.status === 'paid').reduce((s,i) => s + i.tax, 0),
  }), [invoices]);

  const handleAction = (action, inv) => {
    if (action === 'markPaid') {
      setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'paid', paidAt: iso(Date.now()) } : i));
      setActive({ ...inv, status: 'paid', paidAt: iso(Date.now()) });
    }
    if (action === 'send')     alert(`Invoice ${inv.id} emailed to ${inv.customer.email} (demo)`);
    if (action === 'download') alert(`Downloading ${inv.id}.pdf (demo)`);
    if (action === 'print')    window.print();
  };

  const allSelected = filtered.length > 0 && filtered.every(i => selected.includes(i.id));
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map(i => i.id));
  const toggleOne = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const sel = "h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-slate-300 focus:outline-none focus:border-orange-500/50";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Invoices</h1>
          <p className="text-sm text-slate-400 mt-0.5">Generate, send and track customer invoices, refunds and credit notes.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button onClick={() => alert(`Bulk download ${selected.length} invoices (demo)`)} className="px-4 py-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm font-semibold hover:bg-sky-500/20">⬇ Download ({selected.length})</button>
          )}
          <button onClick={() => alert('Export CSV (demo)')} className="px-4 py-2 rounded-lg bg-white/5 border border-[#1e1e2e] text-slate-300 text-sm font-semibold hover:bg-white/10">⬇ Export</button>
          <button onClick={() => alert('Create invoice (demo)')} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold shadow-lg shadow-orange-900/30">+ Create Invoice</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Total Invoices" value={stats.total}        icon="🧾" color={{ border:'border-violet-500/20', from:'from-violet-500/10', text:'text-violet-300' }} />
        <StatCard label="Paid"           value={fmt(stats.paid)}     hint="COLLECTED" icon="✅" color={{ border:'border-emerald-500/20', from:'from-emerald-500/10', text:'text-emerald-300' }} />
        <StatCard label="Pending"        value={fmt(stats.pending)}  hint="AWAITING"  icon="⏳" color={{ border:'border-amber-500/20', from:'from-amber-500/10', text:'text-amber-300' }} />
        <StatCard label="Overdue"        value={fmt(stats.overdue)}  hint="ACTION"    icon="⚠️" color={{ border:'border-red-500/20', from:'from-red-500/10', text:'text-red-300' }} />
        <StatCard label="Total Revenue"  value={fmt(stats.revenue)}  icon="💰" color={{ border:'border-sky-500/20', from:'from-sky-500/10', text:'text-sky-300' }} />
        <StatCard label="Tax Collected"  value={fmt(stats.tax)}      icon="🏛" color={{ border:'border-pink-500/20', from:'from-pink-500/10', text:'text-pink-300' }} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice id, order, customer…" className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className={sel}>
          <option value="">All Status</option>
          {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} className={sel}>
          <option value="">All Types</option>
          <option value="sale">Sale</option>
          <option value="refund">Refund</option>
          <option value="credit_note">Credit Note</option>
        </select>
        <select value={range} onChange={e => setRange(e.target.value)} className={sel}>
          <option value="all">All Time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className={sel}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount_d">Highest Amount</option>
          <option value="amount_a">Lowest Amount</option>
        </select>
      </div>

      <div className="rounded-xl border border-[#1e1e2e] bg-[#0b0b14] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#111118] border-b border-[#1e1e2e]">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 w-10"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-orange-500" /></th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-12 text-slate-500">No invoices found</td></tr>}
              {filtered.map(i => (
                <tr key={i.id} className="border-b border-[#1e1e2e] hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(i.id)} onChange={() => toggleOne(i.id)} className="accent-orange-500" /></td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-white">{i.id}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{i.type.replace('_',' ')}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{i.customer.name}</p>
                    <p className="text-[10px] text-slate-500">{i.customer.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{i.orderId}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-white font-bold">{fmt(i.total)}</p>
                    <p className="text-[10px] text-slate-500">tax {fmt(i.tax)}</p>
                  </td>
                  <td className="px-4 py-3"><StatusPill status={i.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{dateFmt(i.issuedAt)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{dateFmt(i.dueAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setActive(i)} className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-[#1e1e2e]">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#1e1e2e] text-xs text-slate-500 flex justify-between">
          <span>Showing {filtered.length} of {invoices.length} invoices</span>
          <span>Total: <span className="text-white font-semibold">{fmt(filtered.reduce((s,i) => s + i.total, 0))}</span></span>
        </div>
      </div>

      <InvoiceModal invoice={active} onClose={() => setActive(null)} onAction={handleAction} />
    </div>
  );
}
