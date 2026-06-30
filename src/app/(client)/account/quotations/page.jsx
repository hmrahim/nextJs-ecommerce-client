// 📁 PATH: src/app/(client)/account/quotations/page.jsx
// 📋 Customer Quotation Page — Production-grade product builder
//    Per-item: Variant • Quantity • Unit • Custom specs • Target price • Note

'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  FileText, Plus, Trash2, Search, Loader2, Download, Package, ChevronRight,
  X, CheckCircle, Building2, ArrowLeft, AlertCircle, Tag, Edit3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { quotationService } from '@/services/quotationService';
import { useShopSearch, useProductVariants, useShopFeaturedProducts } from '@/hooks/client/useShopProducts';

/* ─── Helpers ─── */
const fmt = (n) => `SAR ${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const dateFmt = (d) => d ? new Date(d).toLocaleDateString('en-SA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const UNIT_OPTIONS = [
  { value: 'pcs', label: 'Pieces (PCS)' }, { value: 'box', label: 'Box' },
  { value: 'carton', label: 'Carton (CTN)' }, { value: 'set', label: 'Set' },
  { value: 'pair', label: 'Pair' }, { value: 'pack', label: 'Pack' },
  { value: 'dozen', label: 'Dozen' }, { value: 'kg', label: 'Kilogram (KG)' },
  { value: 'gram', label: 'Gram (g)' }, { value: 'ltr', label: 'Litre (L)' },
  { value: 'ml', label: 'Millilitre (mL)' }, { value: 'metre', label: 'Metre (m)' },
  { value: 'sqm', label: 'Square Metre (m²)' }, { value: 'roll', label: 'Roll' },
  { value: 'bag', label: 'Bag' }, { value: 'bottle', label: 'Bottle' },
];

const isValidSaudiVAT = (v) => /^3\d{13}3$/.test(String(v || '').trim());
const isValidCR = (v) => !v || /^\d{10}$/.test(String(v).trim());
const isValidSaudiPhone = (v) => /^(?:\+?966|0)?5\d{8}$/.test(String(v || '').replace(/[\s-]/g, ''));

function getProductImage(p) { return p?.images?.[0]?.url || p?.image || null; }

const STATUS_CONFIG = {
  pending:  { label: 'Pending Review', icon: '⏳', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  approved: { label: 'Approved', icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  accepted: { label: 'Accepted', icon: '🤝', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  rejected: { label: 'Rejected', icon: '✕', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  expired:  { label: 'Expired', icon: '⌛', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
};

/* ════════════════════════════════════════════════════════
   PRODUCT SEARCH INPUT
════════════════════════════════════════════════════════ */
function ProductSearchInput({ onAdd }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handler(e) { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setFocused(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { const t = setTimeout(() => setDebouncedQuery(query.trim()), 300); return () => clearTimeout(t); }, [query]);

  const { data, isFetching, isError } = useShopSearch({ q: debouncedQuery, limit: 8 });
  const results = data?.results ?? data?.products ?? data?.data ?? [];
  const loading = isFetching;
  const open = focused && query.trim().length > 0;

  function selectProduct(product) { setPendingProduct(product); setQuery(''); setFocused(false); }
  function startCustom() {
    if (!query.trim()) return;
    setPendingProduct({ _id: null, name: query.trim(), sku: '', price: null, __custom: true });
    setQuery(''); setFocused(false);
  }
  function confirmPending(item) { onAdd(item); setPendingProduct(null); }

  const showCustomOption = debouncedQuery && !loading && !results.some(r => (r.name || '').toLowerCase() === debouncedQuery.toLowerCase());

  return (
    <div ref={wrapperRef} className="relative">
      <div className={`flex items-center gap-2 border-2 rounded-xl px-4 py-3 bg-white transition-all ${focused ? 'border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]' : 'border-slate-200 hover:border-slate-300'}`}>
        {loading ? <Loader2 size={16} className="text-slate-400 animate-spin shrink-0" /> : <Search size={16} className="text-slate-400 shrink-0" />}
        <input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)}
          onKeyDown={e => { if (e.key === 'Enter' && showCustomOption) { e.preventDefault(); startCustom(); }}}
          placeholder="Search product name or SKU…" className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none" autoComplete="off" />
        {query && <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>}
      </div>

      {open && (
        <div className="absolute z-50 left-0 right-0 top-[calc(100%+6px)] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {results.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Products</p>
              {results.map(product => {
                const img = getProductImage(product);
                return (
                  <button key={product._id} onMouseDown={e => { e.preventDefault(); selectProduct(product); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left group">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-100">
                      {img ? <img src={img} alt="" className="w-full h-full object-cover rounded-lg" /> : <Package size={16} className="text-slate-400 group-hover:text-emerald-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-emerald-700">{product.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{product.sku ? `SKU: ${product.sku} · ` : ''}{product.category?.name || ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-700">{fmt(product.price)}</p>
                      {product.inStock === false && <p className="text-[10px] text-rose-400">Out of stock</p>}
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
          {loading && <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Searching…</div>}
          {isError && !loading && <div className="px-4 py-3 text-sm text-rose-500">Couldn&apos;t reach the product catalog.</div>}
          {results.length === 0 && !loading && !isError && debouncedQuery && <div className="px-4 py-3 text-sm text-slate-500">No matching products found.</div>}
          {showCustomOption && (
            <div className="border-t border-slate-100">
              <button onMouseDown={e => { e.preventDefault(); startCustom(); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left group">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100"><Plus size={16} className="text-blue-500" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-700">Add &ldquo;<span className="font-bold">{query}</span>&rdquo; as custom item</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Not in our catalog — configure details next</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">CUSTOM</span>
              </button>
            </div>
          )}
        </div>
      )}
      {pendingProduct && <ProductConfigurator product={pendingProduct} onConfirm={confirmPending} onCancel={() => setPendingProduct(null)} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   PRODUCT CONFIGURATOR
════════════════════════════════════════════════════════ */
function ProductConfigurator({ product, onConfirm, onCancel }) {
  const isCustom = !!product.__custom;
  const { data: variants = [], isLoading } = useProductVariants(isCustom ? null : product._id);
  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [customUnit, setCustomUnit] = useState('');
  const [specs, setSpecs] = useState([]);
  const [targetPrice, setTargetPrice] = useState('');
  const [itemNote, setItemNote] = useState('');

  const activeVariant = variants.find(v => v._id === variantId) || null;
  const canConfirm = !isLoading && qty > 0 && (unit !== 'custom' || customUnit.trim().length > 0);
  const img = activeVariant?.image?.url || activeVariant?.image || getProductImage(product);

  function addSpec() { setSpecs(s => [...s, { key: '', value: '' }]); }
  function updateSpec(i, field, val) { setSpecs(s => s.map((sp, idx) => idx === i ? { ...sp, [field]: val } : sp)); }
  function removeSpec(i) { setSpecs(s => s.filter((_, idx) => idx !== i)); }

  function confirm() {
    if (!canConfirm) return;
    const finalUnit = unit === 'custom' ? customUnit.trim().toLowerCase() : unit;
    const cleanSpecs = specs.map(s => ({ key: s.key.trim(), value: s.value.trim() })).filter(s => s.key && s.value);
    onConfirm({
      name: product.name, sku: activeVariant?.sku || product.sku || '', qty, unit: finalUnit,
      specs: cleanSpecs, targetPrice: targetPrice ? Number(targetPrice) : null, itemNote: itemNote.trim() || '',
      fromDB: !isCustom, productId: isCustom ? null : product._id, image: img,
      price: activeVariant?.price ?? product.price ?? null, variantId: activeVariant?._id || null, variantTitle: activeVariant?.variantTitle || null,
    });
  }

  return (
    <div className="mt-3 border-2 border-emerald-200 bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
        <div className="w-11 h-11 rounded-xl bg-white border border-emerald-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
          {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Package size={18} className="text-slate-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-bold text-slate-800 truncate">{product.name}</p>
            {isCustom && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full uppercase tracking-wide">Custom</span>}
          </div>
          {product.sku && <p className="text-[11px] text-emerald-600 font-medium">SKU: {product.sku}</p>}
          {!isCustom && product.price != null && <p className="text-[11px] text-slate-500">Catalog price: <span className="font-semibold text-slate-700">{fmt(product.price)}</span></p>}
        </div>
        <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-emerald-200 text-emerald-700 transition-colors shrink-0"><X size={15} /></button>
      </div>
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Quantity" required>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 font-bold text-lg transition-colors">−</button>
              <input type="number" min="1" max="999999" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center text-sm font-bold border border-slate-200 rounded-xl py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white" />
              <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 font-bold text-lg transition-colors">+</button>
            </div>
          </Field>
          <Field label="Unit of Measure" required>
            <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              <option value="custom">— Custom unit —</option>
            </select>
            {unit === 'custom' && <input value={customUnit} onChange={e => setCustomUnit(e.target.value)} placeholder="e.g. drum, pallet, container" className="mt-2 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />}
          </Field>
        </div>
        <Field label="Custom Specifications" hint="Add any specs the supplier should know">
          {specs.length === 0 && <p className="text-[11px] text-slate-400 italic mb-2">No custom specifications added yet.</p>}
          <div className="space-y-2">
            {specs.map((sp, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input value={sp.key} onChange={e => updateSpec(i, 'key', e.target.value)} placeholder="Spec name" className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                </div>
                <input value={sp.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="Value" className="flex-[1.3] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                <button onClick={() => removeSpec(i)} className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <button onClick={addSpec} type="button" className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"><Plus size={13} /> Add specification</button>
        </Field>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">All fields except <span className="font-semibold text-slate-500">quantity</span> & <span className="font-semibold text-slate-500">unit</span> are optional.</p>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={confirm} disabled={!canConfirm} className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"><Plus size={13} /> Add to List</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label} {required && <span className="text-rose-500">*</span>}</label>
      </div>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   CART ITEM ROW
════════════════════════════════════════════════════════ */
function CartRow({ item, index, onQtyChange, onRemove }) {
  const unitLabel = (UNIT_OPTIONS.find(u => u.value === item.unit)?.label.replace(/\s*\(.*\)/, '') || item.unit || 'pcs');
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 group">
      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
        {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="text-slate-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
          {!item.fromDB && <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full uppercase tracking-wide">Custom</span>}
        </div>
        {item.sku && <p className="text-[11px] text-slate-400 mt-0.5">SKU: {item.sku}</p>}
        {item.specs?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.specs.map((s, i) => <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"><span className="text-slate-400">{s.key}:</span><span className="font-bold text-slate-700">{s.value}</span></span>)}
          </div>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 flex-wrap">
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">{unitLabel}</span>
          {item.targetPrice != null && item.targetPrice > 0 && <span>Target: <span className="font-bold text-slate-700">{fmt(item.targetPrice)}</span>/unit</span>}
        </div>
        {item.itemNote && <p className="text-[11px] text-slate-500 mt-1 italic">📝 {item.itemNote}</p>}
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={() => onQtyChange(index, Math.max(1, item.qty - 1))} className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 font-bold text-base">−</button>
          <input type="number" min="1" value={item.qty} onChange={e => onQtyChange(index, Math.max(1, parseInt(e.target.value) || 1))} className="w-14 text-center text-sm font-bold border border-slate-200 rounded-lg py-1 focus:outline-none focus:border-emerald-400" />
          <button onClick={() => onQtyChange(index, item.qty + 1)} className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 font-bold text-base">+</button>
        </div>
        <button onClick={() => onRemove(index)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={13} /></button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   COMPANY INFO FIELDS — react-hook-form
════════════════════════════════════════════════════════ */
function CompanyInfoFields({ register, errors }) {
  const fieldClass = (err) =>
    `w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder-slate-300 ${err ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100' : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Company Name *</label>
        <input {...register('companyName', { required: 'Company name is required' })} placeholder="e.g. Al Rashid Trading Co." className={fieldClass(errors.companyName)} />
        {errors.companyName && <p className="text-[11px] text-rose-500 mt-1">{errors.companyName.message}</p>}
      </div>
      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">VAT Registration Number *</label>
        <input {...register('vatNumber', { required: 'VAT number is required', validate: (v) => isValidSaudiVAT(v) || 'Enter a valid 15-digit Saudi VAT number' })}
          placeholder="300000000000003" inputMode="numeric" maxLength={15}
          onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 15); }} className={fieldClass(errors.vatNumber)} />
        {errors.vatNumber ? <p className="text-[11px] text-rose-500 mt-1">{errors.vatNumber.message}</p> : <p className="text-[11px] text-slate-400 mt-1">15 digits — starts and ends with 3</p>}
      </div>
      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">CR Number <span className="font-normal normal-case text-slate-400">(optional)</span></label>
        <input {...register('crNumber', { validate: (v) => !v || isValidCR(v) || 'CR number must be 10 digits' })}
          placeholder="1010XXXXXX" inputMode="numeric" maxLength={10}
          onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); }} className={fieldClass(errors.crNumber)} />
        {errors.crNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.crNumber.message}</p>}
      </div>
      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Person *</label>
        <input {...register('contactPerson', { required: 'Contact person is required' })} placeholder="Full name" className={fieldClass(errors.contactPerson)} />
        {errors.contactPerson && <p className="text-[11px] text-rose-500 mt-1">{errors.contactPerson.message}</p>}
      </div>
      <div>
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Phone *</label>
        <input {...register('contactPhone', { required: 'Contact phone is required', validate: (v) => isValidSaudiPhone(v) || 'Enter a valid Saudi mobile number' })}
          placeholder="05XXXXXXXX" inputMode="tel" className={fieldClass(errors.contactPhone)} />
        {errors.contactPhone && <p className="text-[11px] text-rose-500 mt-1">{errors.contactPhone.message}</p>}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Company Address <span className="font-normal normal-case text-slate-400">(optional)</span></label>
        <input {...register('address')} placeholder="Building, street, city" className={fieldClass(errors.address)} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   REQUEST MODAL — react-hook-form
════════════════════════════════════════════════════════ */
function RequestModal({ onClose, onSubmit }) {
  const [step, setStep] = useState('products');
  const [cartItems, setCartItems] = useState([]);
  const [generalNote, setGeneralNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { register, handleSubmit: rhfHandleSubmit, formState: { errors } } = useForm({
    defaultValues: { companyName: '', vatNumber: '', crNumber: '', contactPerson: '', contactPhone: '', address: '' },
    mode: 'onBlur',
  });

  const { data: featured } = useShopFeaturedProducts(5);
  const popularProducts = Array.isArray(featured) ? featured : (featured?.results ?? featured?.data ?? []);

  function addItem(product) {
    setCartItems(prev => {
      const idx = prev.findIndex(p =>
        product.productId ? p.productId === product.productId && p.variantId === product.variantId && JSON.stringify(p.specs || []) === JSON.stringify(product.specs || [])
          : p.name === product.name && JSON.stringify(p.specs || []) === JSON.stringify(product.specs || [])
      );
      if (idx !== -1) return prev.map((p, i) => i === idx ? { ...p, qty: p.qty + product.qty } : p);
      return [...prev, product];
    });
  }
  function updateQty(index, qty) { setCartItems(prev => prev.map((p, i) => i === index ? { ...p, qty } : p)); }
  function removeItem(index) { setCartItems(prev => prev.filter((_, i) => i !== index)); }
  function quickAddFeatured(p) {
    const img = getProductImage(p);
    addItem({ name: p.name, sku: p.sku || '', qty: 1, unit: 'pcs', specs: [], targetPrice: null, itemNote: '', fromDB: true, productId: p._id, image: img, price: p.price ?? null, variantId: null, variantTitle: null });
  }
  function goToCompanyStep() { if (cartItems.length === 0) return; setStep('company'); }

  async function onFormSubmit(data) {
    setLoading(true);
    setSubmitError(null);
    try {
      const payload = {
        items: cartItems.map(it => ({
          productId: it.productId || undefined, variantId: it.variantId || undefined,
          name: it.name, sku: it.sku || undefined, variantTitle: it.variantTitle || undefined,
          qty: it.qty, unit: it.unit || 'pcs', specs: it.specs?.length ? it.specs : undefined,
          targetPrice: it.targetPrice ?? undefined, itemNote: it.itemNote || undefined, fromDB: it.fromDB,
        })),
        notes: generalNote,
        companyName: data.companyName.trim(), vatNumber: data.vatNumber.trim(),
        crNumber: data.crNumber.trim() || undefined, contactPerson: data.contactPerson.trim(),
        contactPhone: data.contactPhone.trim(), address: data.address.trim() || undefined,
      };
      const res = await quotationService.createRequest(payload);
      setSubmitted(true);
      setTimeout(() => {
        onSubmit({ items: cartItems, generalNote, companyInfo: data, serverQuotation: res?.data?.data });
        onClose();
      }, 1800);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to send your quotation request. Please try again.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="w-full flex flex-col h-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">New Quotation Request</h2>
              {!submitted && (
                <div className="flex items-center gap-2 mt-1">
                  <span className={`flex items-center gap-1 text-[11px] font-bold ${step === 'products' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'products' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>Products
                  </span>
                  <span className="w-8 h-px bg-slate-200" />
                  <span className={`flex items-center gap-1 text-[11px] font-bold ${step === 'company' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'company' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>Company Details
                  </span>
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"><X size={16} /> Close</button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4"><CheckCircle size={32} className="text-emerald-600" /></div>
            <h3 className="text-lg font-bold text-slate-900">Request Sent!</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">Our team will review your request and send you a detailed quotation within 24 hours.</p>
          </div>
        ) : step === 'products' ? (
          <>
            <div className="flex-1 overflow-y-auto bg-slate-50">
              <div className="max-w-5xl mx-auto p-6">
                <div className="md:flex gap-6 items-start">
                  <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 mb-6 md:mb-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Search & Configure Products</p>
                    <ProductSearchInput onAdd={addItem} />
                    <p className="text-[11px] text-slate-400 mt-2.5 flex items-center gap-1"><span>💡</span> Pick a product, then set quantity, unit, and any custom specs</p>
                    {cartItems.length === 0 && popularProducts.length > 0 && (
                      <div className="mt-5">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Popular Products</p>
                        <div className="space-y-1">
                          {popularProducts.slice(0, 5).map(p => {
                            const img = getProductImage(p);
                            return (
                              <button key={p._id} onClick={() => quickAddFeatured(p)} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                  {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Package size={13} className="text-slate-400" />}
                                </div>
                                <div className="flex-1 min-w-0"><p className="text-xs font-medium text-slate-700 truncate">{p.name}</p><p className="text-[10px] text-slate-400">{p.category?.name || ''}</p></div>
                                <Plus size={14} className="text-slate-300 group-hover:text-emerald-500 shrink-0" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your List</p>
                      {cartItems.length > 0 && <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</span>}
                    </div>
                    {cartItems.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-3"><Package size={22} className="text-slate-300" /></div>
                        <p className="text-sm font-medium text-slate-400">No products added yet</p>
                        <p className="text-xs text-slate-300 mt-1">Search on the left to get started</p>
                      </div>
                    ) : (
                      <div className="flex-1">{cartItems.map((item, i) => <CartRow key={i} item={item} index={i} onQtyChange={updateQty} onRemove={removeItem} />)}</div>
                    )}
                    <div className="mt-4">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Additional Note <span className="font-normal normal-case">(optional)</span></label>
                      <textarea rows={2} value={generalNote} onChange={e => setGeneralNote(e.target.value)} placeholder="Delivery deadline, bulk discount, special requirements…"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 placeholder-slate-300 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-t bg-white shrink-0">
              <p className="text-xs text-slate-500">{cartItems.length === 0 ? 'Add at least one product to continue' : `${cartItems.length} product${cartItems.length > 1 ? 's' : ''} · ${cartItems.reduce((s, p) => s + p.qty, 0)} total units`}</p>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={goToCompanyStep} disabled={cartItems.length === 0} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">Continue →</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto bg-slate-50">
              <div className="max-w-2xl mx-auto p-6">
                <div className="flex items-center gap-2 mb-4 text-sm text-slate-500"><Building2 size={16} className="text-emerald-600" /><p>We need a few business details to prepare a compliant VAT quotation.</p></div>
                <CompanyInfoFields register={register} errors={errors} />
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Order Summary</p>
                  <p className="text-xs text-slate-500">{cartItems.length} product{cartItems.length > 1 ? 's' : ''} · {cartItems.reduce((s, p) => s + p.qty, 0)} total units</p>
                </div>
                {submitError && (
                  <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700"><AlertCircle size={15} className="shrink-0 mt-0.5" /><span>{submitError}</span></div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-t bg-white shrink-0">
              <button onClick={() => setStep('products')} className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"><ArrowLeft size={14} /> Back</button>
              <button onClick={rhfHandleSubmit(onFormSubmit)} disabled={loading} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : '📤 Submit Quotation Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   QUOTATION DETAIL MODAL
════════════════════════════════════════════════════════ */
function QuotationDetailModal({ quotation, onClose, onAccept, onReject }) {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  async function handleAccept() {
    setAccepting(true);
    try {
      await quotationService.acceptQuotation(quotation.id || quotation._id);
      setAccepting(false);
      onAccept(quotation.id || quotation._id);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to accept quotation');
      setAccepting(false);
    }
  }

  async function handleReject() {
    setRejecting(true);
    try {
      await quotationService.rejectQuotation(quotation.id || quotation._id);
      setRejecting(false);
      onReject(quotation.id || quotation._id);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject quotation');
      setRejecting(false);
    }
  }

  const sc = STATUS_CONFIG[quotation.status] || STATUS_CONFIG.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl my-10 bg-white rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400">Quotation</span>
            <span className="font-mono text-sm font-bold text-slate-800">{quotation.quotationNumber || quotation.id}</span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>{sc.icon} {sc.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"><Download size={12} /> PDF / Print</button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500"><X size={16} /></button>
          </div>
        </div>
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">QUOTATION</h1>
              <p className="text-sm text-slate-400 mt-0.5">{quotation.quotationNumber || quotation.id}</p>
              {quotation.validUntil && <p className="text-xs font-semibold text-amber-600 mt-2 inline-flex items-center gap-1">⚠️ Valid until: {dateFmt(quotation.validUntil)}</p>}
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900 text-lg">Moom24</p>
              <p className="text-xs text-slate-400">support@moom24.com</p>
              <p className="text-xs text-slate-400 mt-1">Issued: {dateFmt(quotation.approvedAt || quotation.createdAt)}</p>
            </div>
          </div>
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-slate-200 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="pb-2.5 text-left font-semibold">Product</th>
                <th className="pb-2.5 text-right font-semibold">Qty</th>
                <th className="pb-2.5 text-right font-semibold">Unit</th>
                <th className="pb-2.5 text-right font-semibold">Unit Price</th>
                <th className="pb-2.5 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotation.items.map((it, i) => (
                <tr key={i}>
                  <td className="py-3">
                    <p className="font-medium text-slate-800">{it.name}</p>
                    {it.sku && <p className="text-xs text-slate-400">{it.sku}</p>}
                    {it.specs?.length > 0 && <p className="text-[11px] text-slate-500 mt-0.5">{it.specs.map(s => `${s.key}: ${s.value}`).join(' · ')}</p>}
                  </td>
                  <td className="py-3 text-right">{it.qty}</td>
                  <td className="py-3 text-right uppercase text-xs text-slate-500">{it.unit || 'pcs'}</td>
                  <td className="py-3 text-right">{it.unitPrice ? fmt(it.unitPrice) : '—'}</td>
                  <td className="py-3 text-right font-semibold">{it.total ? fmt(it.total) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mb-6">
            <div className="w-60 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{fmt(quotation.subtotal)}</span></div>
              <div className="flex justify-between text-slate-500"><span>VAT (15%)</span><span>{fmt(quotation.tax)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Shipping</span><span>{fmt(quotation.shipping)}</span></div>
              <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-2 mt-1"><span>Total</span><span className="text-emerald-700">{fmt(quotation.total)}</span></div>
            </div>
          </div>
          {quotation.adminNote && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800"><span className="font-semibold">📝 Note from team: </span>{quotation.adminNote}</div>
          )}
        </div>
        {quotation.status === 'approved' && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t bg-slate-50 rounded-b-2xl">
            <p className="text-xs text-slate-500 flex-1">Review the above pricing and accept or decline</p>
            <button onClick={handleReject} disabled={rejecting} className="px-4 py-2 text-sm font-medium text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl disabled:opacity-50 transition-colors">{rejecting ? 'Declining…' : 'Decline'}</button>
            <button onClick={handleAccept} disabled={accepting} className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50 transition-colors shadow-sm">{accepting ? <><Loader2 size={14} className="animate-spin" />Accepting…</> : '✅ Accept Quotation'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════ */
export default function CustomerQuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequest, setShowRequest] = useState(false);
  const [selected, setSelected] = useState(null);
  const [pageToast, setPageToast] = useState(null);

  useEffect(() => {
    async function fetchQuotations() {
      setLoading(true);
      try {
        const res = await quotationService.getMyQuotations();
        const data = res?.data?.data ?? [];
        setQuotations(Array.isArray(data) ? data : []);
      } catch {
        setQuotations([]);
      } finally {
        setLoading(false);
      }
    }
    fetchQuotations();
  }, [showRequest]);

  function showToast(msg, type = 'success') { setPageToast({ msg, type }); setTimeout(() => setPageToast(null), 4000); }

  function handleNewRequest({ items, generalNote, companyInfo, serverQuotation }) {
    if (serverQuotation) {
      setQuotations(prev => [serverQuotation, ...prev]);
    }
    showToast(`Request sent for ${items.length} product${items.length > 1 ? 's' : ''}! We'll respond within 24 hours.`);
  }

  function handleAccept(id) {
    setQuotations(prev => prev.map(q => (q.id || q._id) === id ? { ...q, status: 'accepted' } : q));
    showToast('Quotation accepted! Our team will contact you shortly.');
  }

  function handleReject(id) {
    setQuotations(prev => prev.map(q => (q.id || q._id) === id ? { ...q, status: 'rejected' } : q));
    showToast('Quotation declined.', 'info');
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {pageToast && (
        <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium transition-all ${pageToast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-slate-700 text-white'}`}>
          {pageToast.type === 'success' ? '✅' : 'ℹ️'}<span>{pageToast.msg}</span>
          <button onClick={() => setPageToast(null)} className="ml-2 text-white/60 hover:text-white"><X size={14} /></button>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quotations</h1>
          <p className="text-sm text-slate-500 mt-1">Request price quotes for bulk or special orders</p>
        </div>
        <button onClick={() => setShowRequest(true)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl transition-colors shadow-sm shrink-0"><Plus size={16} /> Request Quote</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-emerald-500" /><span className="ml-3 text-sm text-slate-500">Loading quotations…</span></div>
      ) : quotations.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
          <FileText size={44} className="mx-auto text-slate-200 mb-4" />
          <p className="font-semibold text-slate-600">No quotations yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">Request a price quote for bulk or custom orders</p>
          <button onClick={() => setShowRequest(true)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl">Request a Quote</button>
        </div>
      ) : (
        <div className="space-y-3">
          {quotations.map(q => {
            const sc = STATUS_CONFIG[q.status] || STATUS_CONFIG.pending;
            const isActionable = q.status === 'approved';
            return (
              <div key={q.id || q._id} onClick={() => setSelected(q)}
                className={`bg-white border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md ${isActionable ? 'border-emerald-300 ring-1 ring-emerald-200 hover:border-emerald-400' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-slate-800">{q.quotationNumber || q.id || q._id}</span>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>{sc.icon} {sc.label}</span>
                      {isActionable && <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full animate-pulse">ACTION REQUIRED</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">{q.items?.length || 0} product{(q.items?.length || 0) > 1 ? 's' : ''} · {dateFmt(q.createdAt)}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{q.items?.map(it => it.name).join(', ')}</p>
                    {q.validUntil && q.status === 'approved' && <p className="text-xs font-semibold text-amber-600 mt-1.5">⏰ Expires: {dateFmt(q.validUntil)}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    {q.total > 0 ? <p className="text-lg font-bold text-slate-900">{fmt(q.total)}</p> : <p className="text-sm text-slate-400 italic">Price pending</p>}
                    <p className="text-xs text-slate-400 mt-1">View details →</p>
                  </div>
                </div>
                {isActionable && (
                  <div className="mt-4 pt-4 border-t border-emerald-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500">A price quotation is ready for your review</p>
                    <button onClick={e => { e.stopPropagation(); setSelected(q); }} className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors">Review & Accept</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showRequest && <RequestModal onClose={() => setShowRequest(false)} onSubmit={handleNewRequest} />}
      {selected && <QuotationDetailModal quotation={selected} onClose={() => setSelected(null)} onAccept={handleAccept} onReject={handleReject} />}
    </div>
  );
}