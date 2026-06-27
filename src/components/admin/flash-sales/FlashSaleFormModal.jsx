// 📁 PATH: src/components/admin/flash-sales/FlashSaleFormModal.jsx

'use client';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { productService } from '@/services/productService';

const EMPTY = {
  name: '',
  slug: '',
  discountType: 'percent',
  discountValue: '',
  applicationType: 'all',
  startTime: '',
  endTime: '',
  totalStock: '',
  maxOrdersPerUser: 1,
  isActive: true,
  banner: '',
};

function toSlug(str) {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function toDatetimeLocal(iso) {
  if (!iso) return '';
  return iso.slice(0, 16);
}

function fromDatetimeLocal(val) {
  if (!val) return '';
  return new Date(val).toISOString();
}

export default function FlashSaleFormModal({ editing, onSave, onClose }) {
  const { watch, setValue, reset, handleSubmit: rhfHandleSubmit } = useForm({ defaultValues: EMPTY });
  const form = watch();
  const set = (k, v) => setValue(k, v, { shouldDirty: true });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Product selection state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [productPages, setProductPages] = useState(1);

  useEffect(() => {
    if (editing) {
      reset({
        name:             editing.name ?? '',
        slug:             editing.slug ?? '',
        discountType:     editing.discountType ?? 'percent',
        discountValue:    editing.discountValue ?? '',
        applicationType:  editing.applicationType ?? 'all',
        startTime:        toDatetimeLocal(editing.startTime),
        endTime:          toDatetimeLocal(editing.endTime),
        totalStock:       editing.totalStock ?? '',
        maxOrdersPerUser: editing.maxOrdersPerUser ?? 1,
        isActive:         editing.isActive ?? true,
        banner:           editing.banner ?? '',
      });
      // If editing and has specific products, pre-select them
      if (editing.applicationType === 'specific' && editing.products?.length > 0) {
        setSelectedProducts(editing.products.map(p => ({
          _id: p.product?._id || p.product || p._id,
          name: p.name,
          image: p.image,
          price: p.originalPrice,
          sku: p.sku,
        })));
      } else {
        setSelectedProducts([]);
      }
    } else {
      reset(EMPTY);
      setSelectedProducts([]);
    }
    setErrors({});
  }, [editing, reset]);

  // Fetch products when applicationType is 'specific'
  const fetchProducts = useCallback(async () => {
    if (form.applicationType !== 'specific') return;
    setProductsLoading(true);
    try {
      const res = await productService.adminGetAll({
        page: productPage,
        limit: 20,
        search: productSearch || undefined,
        status: 'active',
      });
      const d = res.data;
      setProducts(d.results ?? d.products ?? d.data ?? []);
      setProductTotal(d.total ?? 0);
      setProductPages(d.pages ?? d.totalPages ?? 1);
    } catch {
      // Fallback: empty list
      setProducts([]);
      setProductTotal(0);
      setProductPages(1);
    } finally {
      setProductsLoading(false);
    }
  }, [form.applicationType, productPage, productSearch]);

  useEffect(() => {
    if (form.applicationType === 'specific') {
      fetchProducts();
    }
  }, [fetchProducts, form.applicationType]);

  // Debounce product search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.applicationType === 'specific') {
        setProductPage(1);
        fetchProducts();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const handleNameChange = (v) => {
    set('name', v);
    if (!editing) set('slug', toSlug(v));
  };

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) {
        return prev.filter(p => p._id !== product._id);
      }
      return [...prev, {
        _id: product._id,
        name: product.name,
        image: product.images?.[0]?.url || product.image || null,
        price: product.price,
        sku: product.sku || '',
      }];
    });
  };

  const selectAllVisible = () => {
    setSelectedProducts(prev => {
      const newSelected = [...prev];
      products.forEach(product => {
        if (!newSelected.find(p => p._id === product._id)) {
          newSelected.push({
            _id: product._id,
            name: product.name,
            image: product.images?.[0]?.url || product.image || null,
            price: product.price,
            sku: product.sku || '',
          });
        }
      });
      return newSelected;
    });
  };

  const deselectAll = () => {
    setSelectedProducts([]);
  };

  const isProductSelected = (productId) => {
    return selectedProducts.some(p => p._id === productId);
  };

  const validate = (data) => {
    const e = {};
    if (!data.name.trim())      e.name = 'Name is required';
    if (!data.discountValue)    e.discountValue = 'Discount value is required';
    if (Number(data.discountValue) <= 0) e.discountValue = 'Must be greater than 0';
    if (data.discountType === 'percent' && Number(data.discountValue) > 100) e.discountValue = 'Percentage cannot exceed 100';
    if (!data.startTime)        e.startTime = 'Start time is required';
    if (!data.endTime)          e.endTime = 'End time is required';
    if (data.startTime && data.endTime && data.endTime <= data.startTime) e.endTime = 'End must be after start';
    if (!data.totalStock)       e.totalStock = 'Total stock is required';
    if (data.applicationType === 'specific' && selectedProducts.length === 0) {
      e.products = 'Please select at least one product';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = rhfHandleSubmit(async (data) => {
    if (!validate(data)) return;
    setSaving(true);
    try {
      const payload = {
        name:             data.name.trim(),
        slug:             data.slug.trim() || toSlug(data.name),
        discountType:     data.discountType,
        discountValue:    Number(data.discountValue),
        applicationType:  data.applicationType,
        startTime:        fromDatetimeLocal(data.startTime),
        endTime:          fromDatetimeLocal(data.endTime),
        totalStock:       Number(data.totalStock),
        maxOrdersPerUser: Number(data.maxOrdersPerUser) || 1,
        isActive:         data.isActive,
        banner:           data.banner || null,
      };
      console.log(payload);

      // If specific products selected, include them
      if (data.applicationType === 'specific') {
        payload.selectedProducts = selectedProducts.map(p => ({
          productId: p._id,
          name: p.name,
          image: p.image,
          originalPrice: p.price,
          sku: p.sku,
        }));
      }

      await onSave(payload);
    } finally {
      setSaving(false);
    }
  });

  const inputCls = (field) =>
    `w-full h-9 px-3 rounded-lg border bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-colors ${
      errors[field]
        ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
        : 'border-[#1e1e2e] focus:border-orange-500/60 focus:ring-orange-500/20'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e]">
          <div>
            <h2 className="text-base font-bold text-white">
              {editing ? '✏️ Edit Flash Sale' : '⚡ New Flash Sale'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {editing ? 'Update sale details' : 'Create a limited-time flash sale'}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#1a1a25] border border-[#2e2e3e] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Sale Name *</label>
            <input
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Eid Mega Flash Sale"
              className={inputCls('name')}
            />
            {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Slug</label>
            <input
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
              placeholder="auto-generated"
              className={inputCls('slug')}
            />
          </div>

          {/* Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Discount Type *</label>
              <select
                value={form.discountType}
                onChange={e => set('discountType', e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-orange-500/60"
              >
                <option value="percent">% Percentage</option>
                <option value="fixed">৳ Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {form.discountType === 'percent' ? 'Percentage (%)' : 'Amount (৳)'} *
              </label>
              <input
                type="number"
                min="0"
                max={form.discountType === 'percent' ? 100 : undefined}
                value={form.discountValue}
                onChange={e => set('discountValue', e.target.value)}
                placeholder={form.discountType === 'percent' ? '0 – 100' : 'e.g. 500'}
                className={inputCls('discountValue')}
              />
              {errors.discountValue && <p className="text-[11px] text-red-400 mt-1">{errors.discountValue}</p>}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              APPLICATION TYPE — All Products vs Specific Products
          ═══════════════════════════════════════════════════════════════ */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              এই অফার কোন প্রোডাক্টের জন্য? *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => set('applicationType', 'all')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  form.applicationType === 'all'
                    ? 'bg-orange-500/10 border-orange-500/60 text-orange-400'
                    : 'bg-[#111118] border-[#2e2e3e] text-slate-400 hover:border-slate-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                সব প্রোডাক্ট
              </button>
              <button
                type="button"
                onClick={() => set('applicationType', 'specific')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  form.applicationType === 'specific'
                    ? 'bg-orange-500/10 border-orange-500/60 text-orange-400'
                    : 'bg-[#111118] border-[#2e2e3e] text-slate-400 hover:border-slate-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                নির্দিষ্ট প্রোডাক্ট
              </button>
            </div>
            {form.applicationType === 'all' && (
              <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                এই অফার ওয়েবসাইটের সব প্রোডাক্টের উপর প্রযোজ্য হবে
              </p>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              PRODUCT SELECTION (only shown when applicationType === 'specific')
          ═══════════════════════════════════════════════════════════════ */}
          {form.applicationType === 'specific' && (
            <div className="space-y-3">
              {/* Selected count & actions */}
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-400">
                  প্রোডাক্ট সিলেক্ট করুন *
                  {selectedProducts.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold">
                      {selectedProducts.length} selected
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllVisible}
                    className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Select All Visible
                  </button>
                  {selectedProducts.length > 0 && (
                    <button
                      type="button"
                      onClick={deselectAll}
                      className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                    >
                      Deselect All
                    </button>
                  )}
                </div>
              </div>

              {/* Search bar */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="প্রোডাক্ট সার্চ করুন (নাম, SKU)..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20"
                />
              </div>

              {/* Selected products chips */}
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-[#111118] border border-[#1e1e2e] max-h-24 overflow-y-auto">
                  {selectedProducts.map(p => (
                    <span
                      key={p._id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-[11px] text-orange-300"
                    >
                      {p.name?.length > 25 ? p.name.slice(0, 25) + '...' : p.name}
                      <button
                        type="button"
                        onClick={() => toggleProductSelection(p)}
                        className="ml-0.5 text-orange-400 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Product list */}
              <div className="border border-[#1e1e2e] rounded-lg overflow-hidden">
                {productsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <svg className="w-5 h-5 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="ml-2 text-sm text-slate-400">Loading products...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-sm">কোন প্রোডাক্ট পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-600 mt-0.5">সার্চ পরিবর্তন করে আবার চেষ্টা করুন</p>
                  </div>
                ) : (
                  <div className="max-h-52 overflow-y-auto divide-y divide-[#1e1e2e]">
                    {products.map(product => {
                      const selected = isProductSelected(product._id);
                      return (
                        <div
                          key={product._id}
                          onClick={() => toggleProductSelection(product)}
                          className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all ${
                            selected
                              ? 'bg-orange-500/5 border-l-2 border-l-orange-500'
                              : 'hover:bg-[#111118] border-l-2 border-l-transparent'
                          }`}
                        >
                          {/* Checkbox */}
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                            selected
                              ? 'bg-orange-500 border-orange-500'
                              : 'border-[#3e3e4e] bg-transparent'
                          }`}>
                            {selected && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          {/* Product image */}
                          <div className="w-9 h-9 rounded-lg bg-[#1a1a25] border border-[#2e2e3e] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {(product.images?.[0]?.url || product.image) ? (
                              <img
                                src={product.images?.[0]?.url || product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            )}
                          </div>

                          {/* Product info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate font-medium">{product.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {product.sku && (
                                <span className="text-[10px] text-slate-500 font-mono">SKU: {product.sku}</span>
                              )}
                              <span className="text-[10px] text-slate-500">
                                Stock: {product.stock ?? 0}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-white">৳{product.price?.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination for products */}
                {productPages > 1 && (
                  <div className="flex items-center justify-between px-3 py-2 border-t border-[#1e1e2e] bg-[#0a0a0f]">
                    <span className="text-[11px] text-slate-500">
                      Page {productPage} of {productPages} ({productTotal} products)
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={productPage <= 1}
                        onClick={() => setProductPage(p => Math.max(1, p - 1))}
                        className="px-2 py-1 rounded text-[11px] bg-[#1a1a25] border border-[#2e2e3e] text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ← Prev
                      </button>
                      <button
                        type="button"
                        disabled={productPage >= productPages}
                        onClick={() => setProductPage(p => Math.min(productPages, p + 1))}
                        className="px-2 py-1 rounded text-[11px] bg-[#1a1a25] border border-[#2e2e3e] text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {errors.products && <p className="text-[11px] text-red-400 mt-1">{errors.products}</p>}
            </div>
          )}

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Time *</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={e => set('startTime', e.target.value)}
                className={inputCls('startTime')}
              />
              {errors.startTime && <p className="text-[11px] text-red-400 mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">End Time *</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={e => set('endTime', e.target.value)}
                className={inputCls('endTime')}
              />
              {errors.endTime && <p className="text-[11px] text-red-400 mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Stock + per user */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Stock *</label>
              <input
                type="number"
                min="1"
                value={form.totalStock}
                onChange={e => set('totalStock', e.target.value)}
                placeholder="e.g. 500"
                className={inputCls('totalStock')}
              />
              {errors.totalStock && <p className="text-[11px] text-red-400 mt-1">{errors.totalStock}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Orders / User</label>
              <input
                type="number"
                min="1"
                value={form.maxOrdersPerUser}
                onChange={e => set('maxOrdersPerUser', e.target.value)}
                placeholder="e.g. 2"
                className={inputCls('maxOrdersPerUser')}
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#111118] border border-[#1e1e2e]">
            <div>
              <p className="text-sm text-white font-medium">Active</p>
              <p className="text-xs text-slate-500">Inactive sales won't appear on storefront</p>
            </div>
            <button
              type="button"
              onClick={() => set('isActive', !form.isActive)}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-orange-500' : 'bg-[#2e2e3e]'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#1e1e2e]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1a1a25] border border-[#2e2e3e] text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {saving && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {editing ? 'Save Changes' : 'Create Sale'}
          </button>
        </div>
      </div>
    </div>
  );
}