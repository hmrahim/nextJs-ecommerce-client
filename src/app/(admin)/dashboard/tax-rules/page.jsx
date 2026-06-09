// 📁 PATH: src/app/(admin)/dashboard/tax-rules/page.jsx
// 🏛 Tax rules management (Amazon GST / Daraj VAT style)

'use client';
import { useState, useMemo } from 'react';

const now = Date.now();
const day = 86400000;
const iso = (d) => new Date(d).toISOString();
const dateFmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';

const TAX_TYPES = {
  vat:         { label: 'VAT',          icon: '🏛', color: 'text-sky-300' },
  gst:         { label: 'GST',          icon: '📋', color: 'text-violet-300' },
  sales_tax:   { label: 'Sales Tax',    icon: '💵', color: 'text-emerald-300' },
  import_duty: { label: 'Import Duty',  icon: '🚢', color: 'text-orange-300' },
  service_tax: { label: 'Service Tax',  icon: '🔧', color: 'text-pink-300' },
};

const REGIONS = [
  { code: 'BD', label: '🇧🇩 Bangladesh' },
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'PK', label: '🇵🇰 Pakistan' },
  { code: 'AE', label: '🇦🇪 UAE' },
  { code: 'SA', label: '🇸🇦 Saudi Arabia' },
  { code: 'MY', label: '🇲🇾 Malaysia' },
  { code: 'SG', label: '🇸🇬 Singapore' },
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'UK', label: '🇬🇧 United Kingdom' },
];

const CATEGORIES = ['All Products','Electronics','Fashion & Apparel','Home & Kitchen','Beauty & Personal Care','Sports & Outdoors','Books & Stationery','Grocery & Food','Health & Wellness','Toys & Baby','Automotive'];

const CUSTOMER_GROUPS = ['All Customers','Retail','Wholesale','VIP','Business'];

const RULES_SEED = [
  { id: 'tax_01', name: 'Bangladesh Standard VAT',          type: 'vat',         region: 'BD', rate: 15.0, category: 'All Products',         customerGroup: 'All Customers', priority: 1,  compound: false, includeShipping: true,  isActive: true,  startDate: iso(now - 200*day), endDate: null,             description: 'Standard 15% VAT applies to all taxable goods sold in Bangladesh.',     updatedAt: iso(now - 5*day) },
  { id: 'tax_02', name: 'BD Reduced VAT - Essentials',      type: 'vat',         region: 'BD', rate: 5.0,  category: 'Grocery & Food',       customerGroup: 'All Customers', priority: 5,  compound: false, includeShipping: false, isActive: true,  startDate: iso(now - 180*day), endDate: null,             description: 'Reduced 5% VAT on grocery and essential food items.',                   updatedAt: iso(now - 12*day) },
  { id: 'tax_03', name: 'BD Electronics SD',                type: 'sales_tax',   region: 'BD', rate: 7.5,  category: 'Electronics',          customerGroup: 'Retail',        priority: 3,  compound: true,  includeShipping: false, isActive: true,  startDate: iso(now - 120*day), endDate: null,             description: 'Supplementary duty on electronics for retail buyers.',                  updatedAt: iso(now - 2*day) },
  { id: 'tax_04', name: 'India GST 18% (Standard)',         type: 'gst',         region: 'IN', rate: 18.0, category: 'All Products',         customerGroup: 'All Customers', priority: 1,  compound: false, includeShipping: true,  isActive: true,  startDate: iso(now - 365*day), endDate: null,             description: 'Standard CGST + SGST 9% + 9% on most goods.',                           updatedAt: iso(now - 18*day) },
  { id: 'tax_05', name: 'India GST 5% Apparel',             type: 'gst',         region: 'IN', rate: 5.0,  category: 'Fashion & Apparel',    customerGroup: 'All Customers', priority: 4,  compound: false, includeShipping: false, isActive: true,  startDate: iso(now - 200*day), endDate: null,             description: '5% GST on apparel below ₹1000.',                                        updatedAt: iso(now - 30*day) },
  { id: 'tax_06', name: 'UAE VAT 5%',                       type: 'vat',         region: 'AE', rate: 5.0,  category: 'All Products',         customerGroup: 'All Customers', priority: 1,  compound: false, includeShipping: true,  isActive: true,  startDate: iso(now - 400*day), endDate: null,             description: 'Standard 5% VAT in United Arab Emirates.',                              updatedAt: iso(now - 7*day) },
  { id: 'tax_07', name: 'Saudi Arabia VAT 15%',             type: 'vat',         region: 'SA', rate: 15.0, category: 'All Products',         customerGroup: 'All Customers', priority: 1,  compound: false, includeShipping: true,  isActive: true,  startDate: iso(now - 300*day), endDate: null,             description: 'KSA standard VAT.',                                                     updatedAt: iso(now - 14*day) },
  { id: 'tax_08', name: 'US California Sales Tax',          type: 'sales_tax',   region: 'US', rate: 7.25, category: 'All Products',         customerGroup: 'Retail',        priority: 2,  compound: false, includeShipping: false, isActive: true,  startDate: iso(now - 250*day), endDate: null,             description: 'Base CA state sales tax (city/county tax applied separately).',         updatedAt: iso(now - 22*day) },
  { id: 'tax_09', name: 'UK VAT 20%',                       type: 'vat',         region: 'UK', rate: 20.0, category: 'All Products',         customerGroup: 'All Customers', priority: 1,  compound: false, includeShipping: true,  isActive: true,  startDate: iso(now - 500*day), endDate: null,             description: 'United Kingdom standard VAT rate.',                                     updatedAt: iso(now - 9*day) },
  { id: 'tax_10', name: 'Wholesale Tax Exemption',          type: 'vat',         region: 'BD', rate: 0.0,  category: 'All Products',         customerGroup: 'Wholesale',     priority: 10, compound: false, includeShipping: false, isActive: true,  startDate: iso(now - 90*day),  endDate: null,             description: 'Zero-rated VAT for verified wholesale resellers with valid TIN.',       updatedAt: iso(now - 3*day) },
  { id: 'tax_11', name: 'Import Duty - Mobile Phones',      type: 'import_duty', region: 'BD', rate: 25.0, category: 'Electronics',          customerGroup: 'All Customers', priority: 6,  compound: true,  includeShipping: false, isActive: true,  startDate: iso(now - 150*day), endDate: null,             description: 'Customs import duty on mobile devices.',                                updatedAt: iso(now - 28*day) },
  { id: 'tax_12', name: 'Service Tax - Delivery',           type: 'service_tax', region: 'BD', rate: 2.5,  category: 'All Products',         customerGroup: 'All Customers', priority: 8,  compound: false, includeShipping: true,  isActive: false, startDate: iso(now - 60*day),  endDate: iso(now - 10*day), description: 'Service tax on courier delivery fees (deprecated).',                    updatedAt: iso(now - 10*day) },
  { id: 'tax_13', name: 'Singapore GST 9%',                 type: 'gst',         region: 'SG', rate: 9.0,  category: 'All Products',         customerGroup: 'All Customers', priority: 1,  compound: false, includeShipping: true,  isActive: true,  startDate: iso(now - 365*day), endDate: null,             description: 'Singapore GST as of 2024.',                                             updatedAt: iso(now - 40*day) },
];

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

function TaxFormModal({ editing, onClose, onSave }) {
  const [form, setForm] = useState(editing || {
    name: '', type: 'vat', region: 'BD', rate: 0, category: 'All Products',
    customerGroup: 'All Customers', priority: 1, compound: false, includeShipping: true,
    isActive: true, startDate: iso(Date.now()).split('T')[0], endDate: '', description: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      rate: parseFloat(form.rate) || 0,
      priority: parseInt(form.priority) || 1,
      startDate: form.startDate ? iso(form.startDate) : iso(Date.now()),
      endDate: form.endDate ? iso(form.endDate) : null,
    });
  };

  const input = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50";
  const label = "block text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <form onSubmit={submit} className="relative w-full max-w-2xl my-8 bg-[#0b0b14] border border-[#1e1e2e] rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{editing ? 'Edit Tax Rule' : 'Create Tax Rule'}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-md hover:bg-white/5 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className={label}>Rule Name *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Bangladesh Standard VAT" className={input} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Tax Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className={input}>
                {Object.entries(TAX_TYPES).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Region / Country *</label>
              <select value={form.region} onChange={e => set('region', e.target.value)} className={input}>
                {REGIONS.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Rate (%) *</label>
              <input required type="number" step="0.01" min="0" max="100" value={form.rate} onChange={e => set('rate', e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Priority</label>
              <input type="number" min="1" max="99" value={form.priority} onChange={e => set('priority', e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Applies To Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className={input}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Customer Group</label>
              <select value={form.customerGroup} onChange={e => set('customerGroup', e.target.value)} className={input}>
                {CUSTOMER_GROUPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Start Date</label>
              <input type="date" value={form.startDate?.split('T')[0] || ''} onChange={e => set('startDate', e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>End Date (optional)</label>
              <input type="date" value={form.endDate?.split('T')[0] || ''} onChange={e => set('endDate', e.target.value)} className={input} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 rounded-lg border border-[#1e1e2e] bg-[#111118] cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="accent-orange-500" />
              <span className="text-sm text-slate-200">Active</span>
            </label>
            <label className="flex items-center gap-2 p-3 rounded-lg border border-[#1e1e2e] bg-[#111118] cursor-pointer">
              <input type="checkbox" checked={form.compound} onChange={e => set('compound', e.target.checked)} className="accent-orange-500" />
              <span className="text-sm text-slate-200">Compound tax</span>
            </label>
            <label className="flex items-center gap-2 p-3 rounded-lg border border-[#1e1e2e] bg-[#111118] cursor-pointer">
              <input type="checkbox" checked={form.includeShipping} onChange={e => set('includeShipping', e.target.checked)} className="accent-orange-500" />
              <span className="text-sm text-slate-200">Apply on shipping</span>
            </label>
          </div>

          <div>
            <label className={label}>Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Internal notes about this rule…" className={`${input} h-auto py-2`}></textarea>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#1e1e2e] flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 border border-[#1e1e2e] text-slate-300 text-sm font-semibold hover:bg-white/10">Cancel</button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold shadow-lg shadow-orange-900/30">{editing ? 'Update Rule' : 'Create Rule'}</button>
        </div>
      </form>
    </div>
  );
}

/* ───────────── Main Page ───────────── */
export default function TaxRulesPage() {
  const [rules, setRules]     = useState(RULES_SEED);
  const [search, setSearch]   = useState('');
  const [region, setRegion]   = useState('');
  const [type, setType]       = useState('');
  const [status, setStatus]   = useState('');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    let list = [...rules];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    if (region) list = list.filter(r => r.region === region);
    if (type)   list = list.filter(r => r.type === type);
    if (status) list = list.filter(r => status === 'active' ? r.isActive : !r.isActive);
    return list.sort((a,b) => a.priority - b.priority);
  }, [rules, search, region, type, status]);

  const stats = useMemo(() => {
    const active = rules.filter(r => r.isActive);
    return {
      total:   rules.length,
      active:  active.length,
      inactive: rules.length - active.length,
      regions: new Set(active.map(r => r.region)).size,
      avgRate: active.length ? (active.reduce((s,r) => s + r.rate, 0) / active.length).toFixed(2) : 0,
      maxRate: active.length ? Math.max(...active.map(r => r.rate)).toFixed(1) : 0,
    };
  }, [rules]);

  const handleSave = (data) => {
    if (editing) {
      setRules(p => p.map(r => r.id === editing.id ? { ...r, ...data, updatedAt: iso(Date.now()) } : r));
    } else {
      setRules(p => [{ ...data, id: 'tax_' + Date.now(), updatedAt: iso(Date.now()) }, ...p]);
    }
    setModal(false); setEditing(null);
  };

  const handleToggle = (id) => setRules(p => p.map(r => r.id === id ? { ...r, isActive: !r.isActive, updatedAt: iso(Date.now()) } : r));
  const handleDelete = (id) => { if (confirm('Delete this tax rule?')) setRules(p => p.filter(r => r.id !== id)); };
  const handleDuplicate = (rule) => setRules(p => [{ ...rule, id: 'tax_' + Date.now(), name: rule.name + ' (Copy)', isActive: false, updatedAt: iso(Date.now()) }, ...p]);

  const sel = "h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-slate-300 focus:outline-none focus:border-orange-500/50";
  const regionLabel = (code) => REGIONS.find(r => r.code === code)?.label || code;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tax Rules</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage VAT, GST, sales tax and import duty across regions and product categories.</p>
        </div>
        <button onClick={() => { setEditing(null); setModal(true); }} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold shadow-lg shadow-orange-900/30">+ New Tax Rule</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Total Rules"    value={stats.total}        icon="📜" color={{ border:'border-violet-500/20', from:'from-violet-500/10', text:'text-violet-300' }} />
        <StatCard label="Active"         value={stats.active}       icon="✅" color={{ border:'border-emerald-500/20', from:'from-emerald-500/10', text:'text-emerald-300' }} />
        <StatCard label="Inactive"       value={stats.inactive}     icon="⏸" color={{ border:'border-slate-500/20', from:'from-slate-500/10', text:'text-slate-300' }} />
        <StatCard label="Regions Covered"value={stats.regions}      icon="🌍" color={{ border:'border-sky-500/20', from:'from-sky-500/10', text:'text-sky-300' }} />
        <StatCard label="Average Rate"   value={`${stats.avgRate}%`} hint="ACTIVE" icon="📊" color={{ border:'border-amber-500/20', from:'from-amber-500/10', text:'text-amber-300' }} />
        <StatCard label="Highest Rate"   value={`${stats.maxRate}%`} icon="📈" color={{ border:'border-pink-500/20', from:'from-pink-500/10', text:'text-pink-300' }} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by rule name or description…" className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50" />
        </div>
        <select value={region} onChange={e => setRegion(e.target.value)} className={sel}>
          <option value="">All Regions</option>
          {REGIONS.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} className={sel}>
          <option value="">All Types</option>
          {Object.entries(TAX_TYPES).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className={sel}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="rounded-xl border border-[#1e1e2e] bg-[#0b0b14] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#111118] border-b border-[#1e1e2e]">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Rule</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3">Applies To</th>
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-12 text-slate-500">No tax rules found</td></tr>}
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-[#1e1e2e] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{r.name}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 max-w-sm">{r.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${TAX_TYPES[r.type].color} text-xs font-semibold`}>{TAX_TYPES[r.type].icon} {TAX_TYPES[r.type].label}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{regionLabel(r.region)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white font-bold text-base">{r.rate}%</span>
                    {r.compound && <div className="text-[9px] text-amber-400 font-semibold">COMPOUND</div>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-300 text-xs">{r.category}</p>
                    <p className="text-[10px] text-slate-500">{r.customerGroup}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/5 border border-[#1e1e2e] text-slate-300 text-xs font-bold">{r.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(r.id)} className={`relative w-10 h-5 rounded-full transition-colors ${r.isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${r.isActive ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{dateFmt(r.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => { setEditing(r); setModal(true); }} title="Edit" className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-[#1e1e2e]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDuplicate(r)} title="Duplicate" className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-[#1e1e2e]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(r.id)} title="Delete" className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#1e1e2e] text-xs text-slate-500">
          Showing {filtered.length} of {rules.length} rules · Lower priority value runs first
        </div>
      </div>

      {modal && <TaxFormModal editing={editing} onClose={() => { setModal(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}
