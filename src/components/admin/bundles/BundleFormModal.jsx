// 📁 PATH: src/components/admin/bundles/BundleFormModal.jsx
// ⚠️  This is a completely new file

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { bundleService } from '@/services/bundleService';

/* ─── Shared input/select styles (project-wide dark theme) ────────────── */
const inp =
  'w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-colors';
const sel =
  'w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-violet-500/60 transition-colors';

/* ─── Helper sub-components ───────────────────────────────────────────── */
function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint  && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] overflow-hidden">
      <div className="px-4 py-2.5 bg-[#0d0d14] border-b border-[#1e1e2e]">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

/* ─── Product Search & Picker ─────────────────────────────────────────── */
function ProductPicker({ products, onChange }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [searching, setSearch]  = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const debounceRef             = useRef(null);
  const dropRef                 = useRef(null);

  // Dummy products for when backend is unavailable
  const DUMMY_PRODUCTS = [
    { _id: 'p1', name: 'Premium Wireless Headphones', price: 129.99, sku: 'ELC-001', stock: 45 },
    { _id: 'p2', name: 'Minimalist Leather Wallet',   price: 49.99,  sku: 'ACC-002', stock: 120 },
    { _id: 'p3', name: 'Organic Green Tea Set',        price: 34.99,  sku: 'FD-003',  stock: 0 },
    { _id: 'p4', name: 'Ceramic Pour-Over Coffee Dripper', price: 39.99, sku: 'KIT-004', stock: 62 },
    { _id: 'p5', name: 'Bamboo Cutting Board Set',     price: 27.99,  sku: 'KIT-005', stock: 3 },
    { _id: 'p6', name: 'Merino Wool Throw Blanket',    price: 89.99,  sku: 'HOM-006', stock: 28 },
    { _id: 'p7', name: 'Stainless Steel Water Bottle', price: 24.99,  sku: 'SPT-007', stock: 200 },
    { _id: 'p8', name: 'Yoga Mat Premium Non-Slip',    price: 64.99,  sku: 'SPT-009', stock: 35 },
    { _id: 'p9', name: 'Mechanical Keyboard TKL',      price: 149.99, sku: 'ELC-010', stock: 18 },
  ];

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setShowDrop(false); return; }
    setSearch(true);
    try {
      const res = await bundleService.searchProducts(q);
      const list = res.data?.products || res.data?.data || [];
      setResults(list);
    } catch {
      // fallback to dummy
      const lower = q.toLowerCase();
      setResults(DUMMY_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(lower) || p.sku.toLowerCase().includes(lower)
      ));
    } finally {
      setSearch(false);
      setShowDrop(true);
    }
  }, []);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 400);
  };

  const addProduct = (product) => {
    if (products.find(p => p.productId === product._id)) return;
    onChange([...products, {
      productId: product._id,
      name:      product.name,
      price:     product.price,
      sku:       product.sku,
      stock:     product.stock,
      quantity:  1,
    }]);
    setQuery('');
    setResults([]);
    setShowDrop(false);
  };

  const removeProduct = (id) => onChange(products.filter(p => p.productId !== id));

  const updateQty = (id, qty) => {
    const n = Math.max(1, parseInt(qty) || 1);
    onChange(products.map(p => p.productId === id ? { ...p, quantity: n } : p));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalOriginal = products.reduce((s, p) => s + (p.price * (p.quantity || 1)), 0);

  return (
    <div className="space-y-3">
      {/* Search box */}
      <div className="relative" ref={dropRef}>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search product by name or SKU…"
            value={query}
            onChange={handleInput}
            onFocus={() => results.length > 0 && setShowDrop(true)}
            className={`${inp} pl-9`}
          />
          {searching && (
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>

        {/* Dropdown results */}
        {showDrop && results.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-[#1e1e2e] bg-[#13131c] shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
            {results.map(p => {
              const alreadyAdded = products.find(x => x.productId === p._id);
              return (
                <button
                  key={p._id}
                  type="button"
                  disabled={!!alreadyAdded}
                  onClick={() => addProduct(p)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${alreadyAdded ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}
                >
                  <div>
                    <p className="text-sm text-white font-medium">{p.name}</p>
                    <p className="text-xs text-slate-600 font-mono">{p.sku}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm text-slate-300">SAR {p.price?.toLocaleString()}</p>
                    <p className={`text-xs ${p.stock === 0 ? 'text-red-400' : 'text-slate-600'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {showDrop && results.length === 0 && query.trim() && !searching && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-[#1e1e2e] bg-[#13131c] shadow-xl px-4 py-3 text-sm text-slate-500">
            No products found for "{query}"
          </div>
        )}
      </div>

      {/* Selected products list */}
      {products.length > 0 && (
        <div className="space-y-2">
          {products.map((p, idx) => (
            <div
              key={p.productId}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] group"
            >
              <div className="w-6 h-6 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400 flex-shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-slate-600 font-mono">SAR {p.price?.toLocaleString()} each</p>
              </div>

              {/* Quantity stepper */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => updateQty(p.productId, (p.quantity || 1) - 1)}
                  disabled={(p.quantity || 1) <= 1}
                  className="w-6 h-6 rounded-md border border-[#1e1e2e] text-slate-400 hover:text-white hover:border-violet-500/40 transition-colors flex items-center justify-center text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                >−</button>
                <input
                  type="number"
                  min="1"
                  value={p.quantity || 1}
                  onChange={e => updateQty(p.productId, e.target.value)}
                  className="w-10 h-6 text-center text-xs bg-[#0a0a0f] border border-[#1e1e2e] rounded-md text-white focus:outline-none focus:border-violet-500/60"
                />
                <button
                  type="button"
                  onClick={() => updateQty(p.productId, (p.quantity || 1) + 1)}
                  className="w-6 h-6 rounded-md border border-[#1e1e2e] text-slate-400 hover:text-white hover:border-violet-500/40 transition-colors flex items-center justify-center text-xs"
                >+</button>
              </div>

              <span className="text-xs text-slate-400 font-medium w-20 text-right flex-shrink-0">
                SAR {((p.price || 0) * (p.quantity || 1)).toLocaleString()}
              </span>

              <button
                type="button"
                onClick={() => removeProduct(p.productId)}
                className="p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                title="Remove product"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Total row */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-violet-500/5 border border-violet-500/10">
            <span className="text-xs text-slate-500">
              {products.length} product{products.length !== 1 ? 's' : ''} · original total
            </span>
            <span className="text-sm font-bold text-violet-400">SAR {totalOriginal.toLocaleString()}</span>
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="flex items-center justify-center py-6 rounded-xl border border-dashed border-[#1e1e2e] text-slate-600 text-sm gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Search and add products above
        </div>
      )}
    </div>
  );
}

/* ─── Main Modal ──────────────────────────────────────────────────────── */
const INITIAL = {
  name:          '',
  description:   '',
  sku:           '',
  products:      [],      // [{ productId, name, price, sku, stock, quantity }]
  bundlePrice:   '',
  comparePrice:  '',
  stock:         '',
  validFrom:     '',
  validUntil:    '',
  isActive:      true,
  isFeatured:    false,
  image:         '',
  tags:          '',
};

export default function BundleFormModal({ editing, onSave, onClose }) {
  const isEdit = !!editing;

  const defaultValues = (() => {
    if (!isEdit) return { ...INITIAL };
    return {
      name:         editing.name         || '',
      description:  editing.description  || '',
      sku:          editing.sku          || '',
      products:     (editing.products || []).map(p => ({
        productId:  p.productId || p._id || '',
        name:       p.name || p.productName || '',
        price:      p.price || 0,
        sku:        p.sku || '',
        stock:      p.stock ?? null,
        quantity:   p.quantity || 1,
      })),
      bundlePrice:  editing.bundlePrice  ?? editing.price ?? '',
      comparePrice: editing.comparePrice ?? editing.originalPrice ?? '',
      stock:        editing.stock        ?? '',
      validFrom:    editing.validFrom  ? editing.validFrom.split('T')[0]  : '',
      validUntil:   editing.validUntil ? editing.validUntil.split('T')[0] : '',
      isActive:     editing.isActive   !== false,
      isFeatured:   editing.isFeatured || false,
      image:        editing.image        || '',
      tags:         Array.isArray(editing.tags) ? editing.tags.join(', ') : (editing.tags || ''),
    };
  })();

  const { watch, setValue, handleSubmit: rhfHandleSubmit } = useForm({ defaultValues });
  const form = watch();
  const set = (k, v) => setValue(k, v, { shouldDirty: true });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* Live savings calculation */
  const originalTotal = form.products.reduce((s, p) => s + (p.price * (p.quantity || 1)), 0);
  const bundlePrice   = parseFloat(form.bundlePrice) || 0;
  const savings       = originalTotal > 0 && bundlePrice > 0 ? originalTotal - bundlePrice : 0;
  const savingsPct    = originalTotal > 0 && savings > 0 ? Math.round((savings / originalTotal) * 100) : 0;

  const validate = (data) => {
    const e = {};
    if (!data.name.trim())                              e.name        = 'Bundle name is required';
    if (data.products.length < 2)                       e.products    = 'A bundle must have at least 2 products';
    if (!data.bundlePrice || isNaN(data.bundlePrice) || parseFloat(data.bundlePrice) <= 0)
                                                        e.bundlePrice = 'Valid bundle price required';
    if (data.comparePrice && parseFloat(data.comparePrice) <= parseFloat(data.bundlePrice))
                                                        e.comparePrice= 'Compare price must be higher than bundle price';
    if (data.stock !== '' && (isNaN(data.stock) || parseInt(data.stock) < 0))
                                                        e.stock       = 'Stock must be 0 or more';
    if (data.validFrom && data.validUntil && data.validFrom > data.validUntil)
                                                        e.validUntil  = 'End date must be after start date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = rhfHandleSubmit(async (data) => {
    if (!validate(data)) return;
    setSaving(true);
    try {
      await onSave({
        ...data,
        bundlePrice:  parseFloat(data.bundlePrice),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
        stock:        data.stock !== '' ? parseInt(data.stock) : null,
        validFrom:    data.validFrom  || null,
        validUntil:   data.validUntil || null,
        tags:         data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-[#13131c] border border-[#1e1e2e] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-lg">
              📦
            </div>
            <div>
              <h2 className="text-white font-semibold">{isEdit ? 'Edit Bundle' : 'Create New Bundle'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEdit ? `Editing "${editing.name}"` : 'Group products into a discounted combo deal.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable form body ── */}
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1 p-6 space-y-4">

          {/* Live Savings Preview */}
          {form.products.length >= 1 && bundlePrice > 0 && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-violet-500/5 border border-violet-500/15">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-1">Bundle Preview</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {form.name && <span className="text-white font-semibold">{form.name}</span>}
                  <span className="text-violet-400 font-bold">SAR {bundlePrice.toLocaleString()}</span>
                  {savings > 0 && (
                    <>
                      <span className="text-slate-600 text-xs line-through">SAR {originalTotal.toLocaleString()}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Save {savingsPct}% · SAR {savings.toLocaleString()} off
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${form.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </div>
          )}

          {/* ── Section 1: Basic Info ── */}
          <Section title="Bundle Details">
            <Field label="Bundle Name" required error={errors.name}>
              <input
                className={inp}
                placeholder="e.g. Home Office Starter Kit"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                maxLength={120}
              />
            </Field>

            <Field label="Description" hint="Shown to customers on product page">
              <textarea
                className={`${inp} h-auto py-2 resize-none`}
                rows={2}
                placeholder="Briefly describe what's included and the value…"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                maxLength={400}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Bundle SKU" hint="Leave empty to auto-generate">
                <input
                  className={`${inp} font-mono uppercase`}
                  placeholder="BNDL-001"
                  value={form.sku}
                  onChange={e => set('sku', e.target.value.toUpperCase())}
                  maxLength={40}
                />
              </Field>
              <Field label="Tags" hint="Comma-separated (e.g. gift, summer)">
                <input
                  className={inp}
                  placeholder="gift, home, bestseller"
                  value={form.tags}
                  onChange={e => set('tags', e.target.value)}
                />
              </Field>
            </div>
          </Section>

          {/* ── Section 2: Products ── */}
          <Section title={`Products in Bundle (${form.products.length})`}>
            <ProductPicker
              products={form.products}
              onChange={prods => set('products', prods)}
            />
            {errors.products && (
              <p className="text-xs text-red-400 mt-1">{errors.products}</p>
            )}
          </Section>

          {/* ── Section 3: Pricing ── */}
          <Section title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bundle Price (SAR )" required error={errors.bundlePrice}
                hint={originalTotal > 0 ? `Individual total: SAR ${originalTotal.toLocaleString()}` : undefined}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">SAR </span>
                  <input
                    type="number" min="0" step="0.01"
                    className={`${inp} pl-6`}
                    placeholder="0.00"
                    value={form.bundlePrice}
                    onChange={e => set('bundlePrice', e.target.value)}
                  />
                </div>
              </Field>

              <Field label="Compare Price (SAR )" hint="Crossed-out 'was' price" error={errors.comparePrice}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">SAR </span>
                  <input
                    type="number" min="0" step="0.01"
                    className={`${inp} pl-6`}
                    placeholder="Optional"
                    value={form.comparePrice}
                    onChange={e => set('comparePrice', e.target.value)}
                  />
                </div>
              </Field>
            </div>

            <Field label="Stock Quantity" hint="Leave empty for unlimited stock" error={errors.stock}>
              <input
                type="number" min="0"
                className={inp}
                placeholder="∞ Unlimited"
                value={form.stock}
                onChange={e => set('stock', e.target.value)}
              />
            </Field>
          </Section>

          {/* ── Section 4: Validity ── */}
          <Section title="Availability Period">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Date" hint="Leave empty to make available immediately">
                <input
                  type="date"
                  className={`${inp} text-slate-300`}
                  value={form.validFrom}
                  onChange={e => set('validFrom', e.target.value)}
                />
              </Field>
              <Field label="End Date" hint="Leave empty for no expiry" error={errors.validUntil}>
                <input
                  type="date"
                  className={`${inp} text-slate-300`}
                  value={form.validUntil}
                  onChange={e => set('validUntil', e.target.value)}
                />
              </Field>
            </div>
          </Section>

          {/* ── Section 5: Settings ── */}
          <Section title="Settings">
            {/* Active toggle */}
            <button
              type="button"
              onClick={() => set('isActive', !form.isActive)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                form.isActive
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                  : 'bg-[#0a0a0f] border-[#1e1e2e] text-slate-500'
              }`}
            >
              <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.isActive ? 'bg-emerald-500' : 'bg-[#1e1e2e]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.isActive ? 'left-5' : 'left-0.5'}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{form.isActive ? 'Active' : 'Inactive'}</p>
                <p className="text-xs text-slate-600">
                  {form.isActive ? 'Bundle is visible and purchasable.' : 'Bundle is hidden from customers.'}
                </p>
              </div>
            </button>

            {/* Featured toggle */}
            <button
              type="button"
              onClick={() => set('isFeatured', !form.isFeatured)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                form.isFeatured
                  ? 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                  : 'bg-[#0a0a0f] border-[#1e1e2e] text-slate-500'
              }`}
            >
              <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.isFeatured ? 'bg-amber-500' : 'bg-[#1e1e2e]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.isFeatured ? 'left-5' : 'left-0.5'}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{form.isFeatured ? '⭐ Featured' : 'Not featured'}</p>
                <p className="text-xs text-slate-600">
                  {form.isFeatured ? 'Displayed prominently on homepage and bundle listings.' : 'Regular placement only.'}
                </p>
              </div>
            </button>
          </Section>

        </form>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-[#1e1e2e] flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          {/* Summary chips */}
          {form.products.length > 0 && bundlePrice > 0 && (
            <div className="flex items-center gap-2 flex-1 justify-center">
              <span className="text-xs text-slate-600">{form.products.length} products</span>
              {savings > 0 && (
                <span className="text-xs font-semibold text-emerald-400">Saves {savingsPct}%</span>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-violet-900/30"
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isEdit ? 'Save Changes' : 'Create Bundle'}
          </button>
        </div>
      </div>
    </div>
  );
}
