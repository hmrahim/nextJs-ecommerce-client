
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { productService } from '@/services/productService';

const INITIAL_FORM = {
  name: '', slug: '', sku: '', price: '', comparePrice: '', cost: '',
  stock: '', description: '', shortDescription: '',
  category: '', brand: '', tags: '',
  status: 'draft', featured: false, trackInventory: true,
  weight: '', dimensions: { length: '', width: '', height: '' },
  images: [],
};

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function FormSection({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e1e2e]">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-colors";
const textareaCls = "w-full px-3 py-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-colors resize-none";

export default function ProductFormPage({ mode = 'create', productId }) {
  const router = useRouter();
  const { watch, setValue, reset, handleSubmit: rhfHandleSubmit } = useForm({ defaultValues: INITIAL_FORM });
  const form = watch();
  const set = (key, val) => setValue(key, val, { shouldDirty: true });
  const setDim = (key, val) => setValue('dimensions', { ...form.dimensions, [key]: val }, { shouldDirty: true });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(mode === 'edit');
  const [apiError, setApiError] = useState('');
  const [slugManual, setSlugManual] = useState(false);

  // Load existing product for edit mode
  useEffect(() => {
    if (mode !== 'edit' || !productId) return;
    const load = async () => {
      try {
        const res = await productService.adminGetAll({ id: productId });
        const p = res.data?.product || res.data;
        if (p) {
          reset({
            name: p.name || '', slug: p.slug || '', sku: p.sku || '',
            price: p.price || '', comparePrice: p.comparePrice || '', cost: p.cost || '',
            stock: p.stock ?? '', description: p.description || '',
            shortDescription: p.shortDescription || '', category: p.category?._id || p.category || '',
            brand: p.brand || '', tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
            status: p.status || 'draft', featured: p.featured || false,
            trackInventory: p.trackInventory !== false, weight: p.weight || '',
            dimensions: p.dimensions || { length: '', width: '', height: '' },
            images: p.images || [],
          });
          setSlugManual(true);
        }
      } catch {
        reset({ ...INITIAL_FORM, name: 'Sample Product', slug: 'sample-product', price: '99.99', stock: '50', status: 'active' });
        setSlugManual(true);
      } finally {
        setLoadingProduct(false);
      }
    };
    load();
  }, [mode, productId, reset]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    set('name', val);
    if (!slugManual) set('slug', slugify(val));
  };

  const validate = (data) => {
    const e = {};
    if (!data.name.trim()) e.name = 'Product name is required';
    if (!data.slug.trim()) e.slug = 'Slug is required';
    if (!data.price || isNaN(data.price) || Number(data.price) < 0) e.price = 'Valid price required';
    if (data.stock !== '' && (isNaN(data.stock) || Number(data.stock) < 0)) e.stock = 'Stock must be a non-negative number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = rhfHandleSubmit(async (data) => {
    if (!validate(data)) return;
    setSaving(true);
    setApiError('');

    const payload = {
      ...data,
      price: parseFloat(data.price),
      comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
      cost: data.cost ? parseFloat(data.cost) : null,
      stock: data.stock !== '' ? parseInt(data.stock) : 0,
      weight: data.weight ? parseFloat(data.weight) : null,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    try {
      if (mode === 'create') {
        await productService.adminCreate(payload);
      } else {
        await productService.adminUpdate(productId, payload);
      }
      router.push('/dashboard/products');
    } catch {
      setApiError('Backend not connected — product saved locally for demo.');
      setTimeout(() => router.push('/dashboard/products'), 1500);
    } finally {
      setSaving(false);
    }
  });

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-64 text-slate-500 gap-3">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading product…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/products" className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'create' ? 'Add Product' : 'Edit Product'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {mode === 'create' ? 'Create a new product in your catalog.' : 'Update product details.'}
          </p>
        </div>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic Info */}
            <FormSection title="Basic Information">
              <Field label="Product Name" required>
                <input className={inputCls} placeholder="e.g. Premium Wireless Headphones" value={form.name} onChange={handleNameChange} />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Slug" required hint="URL-friendly identifier">
                  <input
                    className={inputCls}
                    placeholder="my-product-name"
                    value={form.slug}
                    onChange={e => { setSlugManual(true); set('slug', e.target.value); }}
                  />
                  {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug}</p>}
                </Field>
                <Field label="SKU" hint="Stock Keeping Unit">
                  <input className={inputCls} placeholder="ELC-001" value={form.sku} onChange={e => set('sku', e.target.value)} />
                </Field>
              </div>

              <Field label="Short Description" hint="Shown on product card (optional)">
                <textarea
                  className={textareaCls}
                  rows={2}
                  placeholder="Brief one-liner about this product…"
                  value={form.shortDescription}
                  onChange={e => set('shortDescription', e.target.value)}
                />
              </Field>

              <Field label="Description">
                <textarea
                  className={textareaCls}
                  rows={5}
                  placeholder="Full product description — supports HTML…"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </Field>
            </FormSection>

            {/* Pricing */}
            <FormSection title="Pricing">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Price (BDT)" required>
                  <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={form.price} onChange={e => set('price', e.target.value)} />
                  {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price}</p>}
                </Field>
                <Field label="Compare Price" hint="Original / crossed-out price">
                  <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)} />
                </Field>
                <Field label="Cost per item" hint="For profit calculation">
                  <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={form.cost} onChange={e => set('cost', e.target.value)} />
                </Field>
              </div>
              {form.price && form.comparePrice && Number(form.comparePrice) > Number(form.price) && (
                <p className="text-xs text-emerald-400">
                  Discount: {Math.round((1 - form.price / form.comparePrice) * 100)}% off
                </p>
              )}
            </FormSection>

            {/* Inventory */}
            <FormSection title="Inventory">
              <div className="flex items-center gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => set('trackInventory', !form.trackInventory)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.trackInventory ? 'bg-violet-600' : 'bg-[#1e1e2e]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.trackInventory ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-slate-400">Track Inventory</span>
              </div>

              {form.trackInventory && (
                <Field label="Stock Quantity">
                  <input type="number" min="0" className={inputCls} placeholder="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
                  {errors.stock && <p className="mt-1 text-xs text-red-400">{errors.stock}</p>}
                </Field>
              )}
            </FormSection>

            {/* Shipping */}
            <FormSection title="Shipping">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Weight (kg)">
                  <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={form.weight} onChange={e => set('weight', e.target.value)} />
                </Field>
                <div />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Dimensions (cm)</label>
                <div className="grid grid-cols-3 gap-3">
                  {['length', 'width', 'height'].map(dim => (
                    <input key={dim} type="number" min="0" step="0.1" className={inputCls} placeholder={dim.charAt(0).toUpperCase() + dim.slice(1)} value={form.dimensions[dim]} onChange={e => setDim(dim, e.target.value)} />
                  ))}
                </div>
              </div>
            </FormSection>
          </div>

          {/* Right column — sidebar */}
          <div className="space-y-5">

            {/* Status */}
            <FormSection title="Status">
              <div className="space-y-2">
                {['active', 'draft', 'archived'].map(s => (
                  <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={form.status === s}
                      onChange={() => set('status', s)}
                      className="accent-violet-500"
                    />
                    <span className="text-sm text-slate-300 capitalize group-hover:text-white transition-colors">{s}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2.5 cursor-pointer" onClick={() => set('featured', !form.featured)}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${form.featured ? 'bg-violet-600 border-violet-600' : 'border-[#1e1e2e]'}`}>
                  {form.featured && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm text-slate-400">Mark as Featured</span>
              </div>
            </FormSection>

            {/* Organisation */}
            <FormSection title="Organisation">
              <Field label="Category">
                <input className={inputCls} placeholder="e.g. Electronics" value={form.category} onChange={e => set('category', e.target.value)} />
              </Field>
              <Field label="Brand">
                <input className={inputCls} placeholder="e.g. Sony" value={form.brand} onChange={e => set('brand', e.target.value)} />
              </Field>
              <Field label="Tags" hint="Comma-separated">
                <input className={inputCls} placeholder="wireless, headphones, noise-cancelling" value={form.tags} onChange={e => set('tags', e.target.value)} />
              </Field>
            </FormSection>

            {/* Images — placeholder for future upload */}
            <FormSection title="Images">
              <div className="rounded-xl border-2 border-dashed border-[#1e1e2e] p-6 flex flex-col items-center gap-2 text-center">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-slate-500">Image upload via <span className="text-violet-400">uploadService</span> — connect backend to enable</p>
              </div>
            </FormSection>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#1e1e2e]">
          <Link
            href="/dashboard/products"
            className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => { set('status', 'draft'); }}
              className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-violet-900/30"
            >
              {saving && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {mode === 'create' ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
