'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { productService } from '@/services/productService';
import { uploadService } from '@/services/uploadService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productKeys } from '@/hooks/useProducts';
import { categoryService } from '@/services/categoryService';
import { brandService } from '@/services/brandService';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  name: '', slug: '', sku: '', price: '', comparePrice: '', cost: '',
  stock: '', description: '', shortDescription: '',
  category: '', subCategory: '', subSubCategory: '', brand: '', tags: [],
  status: 'draft', featured: false, trackInventory: true,
  weight: '', dimensions: { length: '', width: '', height: '' },
  images: [],
  discounts: [],
};

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function FormSection({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#0f0f17] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
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
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-colors";
const selectCls = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-colors";
const textareaCls = "w-full px-3 py-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-colors resize-none";

// ── Tag Input ──────────────────────────────────────────────────────────────────
function TagInput({ tags = [], onChange }) {
  const [input, setInput] = useState('');
  const addTag = (val) => {
    const trimmed = val.trim();
    if (!trimmed || tags.includes(trimmed)) { setInput(''); return; }
    onChange([...tags, trimmed]);
    setInput('');
  };
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); addTag(input); }
    if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1));
  };
  return (
    <div className="min-h-9 w-full rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-2 py-1.5 flex flex-wrap gap-1.5 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/20 transition-colors">
      {tags.map((tag, i) => (
        <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-xs">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((_, j) => j !== i))} className="hover:text-white leading-none">×</button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-slate-600 outline-none"
        placeholder={tags.length === 0 ? 'Type and press space…' : ''}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
      />
    </div>
  );
}

// ── Discount Rows ──────────────────────────────────────────────────────────────
function DiscountSection({ discounts = [], onChange }) {
  const add = () => onChange([...discounts, { minQty: '', discount: '', type: 'percent' }]);
  const remove = (i) => onChange(discounts.filter((_, j) => j !== i));
  const update = (i, key, val) => {
    const next = [...discounts];
    next[i] = { ...next[i], [key]: val };
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {discounts.length === 0 && (
        <p className="text-xs text-slate-500">No discounts added. Click below to add order-quantity discounts.</p>
      )}
      {discounts.map((d, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Min Qty</label>
            <input type="number" min="1" className={inputCls} placeholder="e.g. 5"
              value={d.minQty} onChange={e => update(i, 'minQty', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Discount</label>
            <input type="number" min="0" className={inputCls} placeholder="e.g. 10"
              value={d.discount} onChange={e => update(i, 'discount', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Type</label>
            <select className={selectCls} value={d.type} onChange={e => update(i, 'type', e.target.value)}>
              <option value="percent">%</option>
              <option value="fixed">BDT</option>
            </select>
          </div>
          <div className="pt-5">
            <button type="button" onClick={() => remove(i)}
              className="w-8 h-9 flex items-center justify-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-lg">×</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={add}
        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors mt-1">
        <span className="text-base leading-none">+</span> Add Discount Tier
      </button>
    </div>
  );
}

// ── Upload Progress Bar ────────────────────────────────────────────────────────
function UploadProgressBar({ uploadProgress, images }) {
  const vals = Object.values(uploadProgress);
  const overall = vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0;
  const newImgs = (images || []).filter(img => img?.file instanceof File);
  return (
    <div className="mb-4 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-violet-300 text-sm font-medium">
          <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Uploading to Cloudinary…
        </div>
        <span className="text-violet-300 text-sm font-semibold tabular-nums">{overall}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-[#1e1e2e] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-300 ease-out" style={{ width: `${overall}%` }} />
      </div>
      {newImgs.length > 1 && (
        <div className="mt-3 space-y-2">
          {newImgs.map((img, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 truncate w-28 flex-shrink-0">{img.name}</span>
              <div className="flex-1 h-1 rounded-full bg-[#1e1e2e] overflow-hidden">
                <div className="h-full rounded-full bg-violet-500/70 transition-all duration-300 ease-out" style={{ width: `${uploadProgress[i] ?? 0}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 w-8 text-right tabular-nums flex-shrink-0">{uploadProgress[i] ?? 0}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Saving Overlay ─────────────────────────────────────────────────────────────
function SavingOverlay({ mode, uploadingImages }) {
  return (
    <div className="fixed inset-0 bg-[#0a0a0f]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 px-10">
      <svg className="w-10 h-10 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-white text-sm font-medium">
        {uploadingImages ? 'Uploading images…' : mode === 'create' ? 'Creating product…' : 'Updating product…'}
      </p>
      <p className="text-slate-500 text-xs">একটু অপেক্ষা করো</p>
    </div>
  );
}

// ── Image upload resolver ──────────────────────────────────────────────────────
async function resolveImages(images = [], onFileProgress) {
  const newFileIndices = {};
  let slot = 0;
  images.forEach((img, i) => { if (img?.file instanceof File) newFileIndices[i] = slot++; });

  const resolved = await Promise.all(
    images.map(async (img, i) => {
      if (img?.file instanceof File) {
        const res = await uploadService.uploadImage(img.file, {
          folder: 'moom24/products',
          onProgress: (pct) => onFileProgress?.(newFileIndices[i], pct),
        });
        return { url: res.url, publicId: res.publicId };
      }
      if (img?.url) return { url: img.url, publicId: img.publicId ?? img.public_id ?? null };
      if (typeof img === 'string') return { url: img, publicId: null };
      return null;
    })
  );
  return resolved.filter(Boolean);
}

// ── Payload builders ───────────────────────────────────────────────────────────
function buildBasePayload(data, uploadedImages) {
  return {
    name: data.name.trim(),
    slug: data.slug.trim(),
    sku: data.sku.trim() || undefined,
    basePrice: parseFloat(data.price),
    comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
    cost: data.cost ? parseFloat(data.cost) : null,
    stock: data.stock !== '' ? parseInt(data.stock) : 0,
    description: data.description || '',
    shortDescription: data.shortDescription || '',
    category: data.category || null,
    subCategory: data.subCategory || null,
    subSubCategory: data.subSubCategory || null,
    brand: data.brand || null,
    tags: data.tags ?? [],
    status: data.status,
    featured: data.featured,
    trackInventory: data.trackInventory,
    weight: data.weight ? parseFloat(data.weight) : null,
    dimensions: {
      length: data.dimensions.length ? parseFloat(data.dimensions.length) : null,
      width: data.dimensions.width ? parseFloat(data.dimensions.width) : null,
      height: data.dimensions.height ? parseFloat(data.dimensions.height) : null,
    },
    images: uploadedImages,
    discounts: data.discounts.map(d => ({
      minQty: parseInt(d.minQty),
      discount: parseFloat(d.discount),
      type: d.type,
    })),
  };
}

function buildUpdatePayload(fullPayload, dirtyFields) {
  const changed = {};
  Object.keys(dirtyFields).forEach(key => { if (key in fullPayload) changed[key] = fullPayload[key]; });
  changed.images = fullPayload.images;
  return changed;
}

// ── Normalize API product → form shape ────────────────────────────────────────
function normalizeProduct(p) {
  return {
    name: p.name || '',
    slug: p.slug || '',
    sku: p.sku || '',
    price: p.price || '',
    comparePrice: p.comparePrice || '',
    cost: p.cost || '',
    stock: p.stock ?? '',
    description: p.description || '',
    shortDescription: p.shortDescription || '',
    category: p.category?._id || p.category || '',
    subCategory: p.subCategory?._id || p.subCategory || '',
    subSubCategory: p.subSubCategory?._id || p.subSubCategory || '',
    brand: p.brand?._id || p.brand || '',
    tags: Array.isArray(p.tags) ? p.tags : [],
    status: p.status || 'draft',
    featured: p.featured || false,
    trackInventory: p.trackInventory !== false,
    weight: p.weight || '',
    dimensions: p.dimensions || { length: '', width: '', height: '' },
    images: p.images || [],
    discounts: p.discounts || [],
  };
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProductFormPage({ mode = 'create', productId }) {
  const router = useRouter();
  const qc = useQueryClient();

  const {
    watch, setValue, reset,
    handleSubmit: rhfHandleSubmit,
    formState: { dirtyFields },
  } = useForm({ defaultValues: INITIAL_FORM });

  const form = watch();
  const set = (key, val) => setValue(key, val, { shouldDirty: true });
  const setDim = (key, val) => setValue('dimensions', { ...form.dimensions, [key]: val }, { shouldDirty: true });

  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [apiError, setApiError] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [imageMode, setImageMode] = useState('multiple');

  // ── Load product (React Query) ─────────────────────────────────
  const {
    data: productData,
    isLoading: loadingProduct,
    isError: loadError,
  } = useQuery({
    queryKey: ['admin-product', productId],
    queryFn: () => productService.adminGetById(productId),
    enabled: mode === 'edit' && !!productId,   // শুধু edit mode এ fetch করবে
    staleTime: 0,                                // সবসময় fresh data
  });

 

  // product load হলে form এ set করো
  useEffect(() => {
    if (!productData) return;
    const p = productData.data?.data || productData.data?.product || productData.data;
    if (p) {
      reset(normalizeProduct(p));
      setSlugManual(true);
    }
  }, [productData, reset]);

  // ── Categories (React Query) ───────────────────────────────────
  const { data: catData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: categoryService.adminGetTree,
  });
  const { data: brandData } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: brandService.adminGetAll,
  });
  
  const allCategories = catData?.data?.data ?? [];
  const subCategories = allCategories.find(c => c._id === form.category)?.children ?? [];
  const subSubCategories = subCategories.find(c => c._id === form.subCategory)?.children ?? [];
  const allBrands = brandData?.data?.data.brands ?? [];

  // ── Create Mutation ────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload) => productService.adminCreate(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: productKeys.all() });
      toast.success('Product created successfully!');
      router.push('/dashboard/products');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create product!');
    },
  });

  // ── Update Mutation ────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => productService.adminUpdate(id, payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: productKeys.all() });
      toast.success('Product updated successfully!');
      router.push('/dashboard/products');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update product');
    },
  });

  const saving = createMutation.isPending || updateMutation.isPending || uploadingImages;

  // ── Image upload ───────────────────────────────────────────────
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    if (imageMode === 'single') {
      (form.images || []).forEach(img => img?.preview && URL.revokeObjectURL(img.preview));
      const file = files[0];
      set('images', [{ file, preview: URL.createObjectURL(file), name: file.name, size: file.size }]);
    } else {
      const newImages = files.map(file => ({ file, preview: URL.createObjectURL(file), name: file.name, size: file.size }));
      set('images', [...(form.images || []), ...newImages]);
    }
  };

  const removeImage = (idx) => {
    const next = [...form.images];
    const [removed] = next.splice(idx, 1);
    if (removed?.preview) URL.revokeObjectURL(removed.preview);
    set('images', next);
  };

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); };

  const handleImageModeChange = (newMode) => {
    setImageMode(newMode);
    if (newMode === 'single' && (form.images || []).length > 1) {
      form.images.slice(1).forEach(img => img?.preview && URL.revokeObjectURL(img.preview));
      set('images', [form.images[0]]);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────
  const handleNameChange = (e) => {
    const val = e.target.value;
    set('name', val);
    if (!slugManual) set('slug', slugify(val));
  };

  const handleCategoryChange = (val) => {
    set('category', val);
    set('subCategory', '');
    set('subSubCategory', '');
  };

  const handleSubCategoryChange = (val) => {
    set('subCategory', val);
    set('subSubCategory', '');
  };

  // ── Validation ─────────────────────────────────────────────────
  const validate = (data) => {
    const e = {};
    if (!data.name.trim()) e.name = 'Product name is required';
    if (!data.slug.trim()) e.slug = 'Slug is required';
    if (!data.sku.trim()) e.sku = 'SKU is required';
    if (!data.category) e.category = 'Category is required';
    if (!data.price || isNaN(data.price) || Number(data.price) < 0) e.price = 'Valid price required';
    if (data.stock !== '' && (isNaN(data.stock) || Number(data.stock) < 0)) e.stock = 'Stock must be a non-negative number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = rhfHandleSubmit(async (data) => {
    if (!validate(data)) return;
    setApiError('');
    setUploadProgress({});
    setUploadingImages(true);

    let uploadedImages;
    try {
      uploadedImages = await resolveImages(data.images, (slot, pct) => {
        setUploadProgress(prev => ({ ...prev, [slot]: pct }));
      });
    } catch {
      setApiError('Image upload failed. Please try again.');
      setUploadingImages(false);
      setUploadProgress({});
      return;
    }
    setUploadingImages(false);
    setUploadProgress({});

    const fullPayload = buildBasePayload(data, uploadedImages);

    if (mode === 'create') {
      createMutation.mutate(fullPayload);

    } else {
      const updatePayload = buildUpdatePayload(fullPayload, dirtyFields);
      updateMutation.mutate({ id: productId, payload: updatePayload });
    }
  });

  // ── Loading / Error states ─────────────────────────────────────
  if (loadingProduct) {
    return (
      <div className="p-10 flex items-center gap-3 text-slate-400">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading product…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-10 space-y-3">
        <p className="text-red-400 text-sm">Failed to load product.</p>
        <Link href="/dashboard/products" className="text-xs text-violet-400 hover:underline">← Back to products</Link>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="relative p-6 text-white">
      {saving && <SavingOverlay mode={mode} uploadingImages={uploadingImages} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{mode === 'create' ? 'Add Product' : 'Edit Product'}</h1>
        <p className="text-sm text-slate-400">{mode === 'create' ? 'Create a new product in your catalog.' : 'Update product details.'}</p>
      </div>

      {apiError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{apiError}</div>
      )}

      {uploadingImages && <UploadProgressBar uploadProgress={uploadProgress} images={form.images} />}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            <FormSection title="Basic Information">
              <Field label="Product Name" required>
                <input className={inputCls} value={form.name} onChange={handleNameChange} placeholder="Product name" />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Slug" required>
                  <input className={inputCls} value={form.slug}
                    onChange={e => { setSlugManual(true); set('slug', e.target.value); }} />
                  {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug}</p>}
                </Field>
                <Field label="SKU" required>
                  <input className={inputCls} value={form.sku}
                    onChange={e => set('sku', e.target.value)} placeholder="e.g. SKU-001" />
                  {errors.sku && <p className="mt-1 text-xs text-red-400">{errors.sku}</p>}
                </Field>
              </div>
              <Field label="Short Description">
                <textarea className={textareaCls} rows={2} value={form.shortDescription}
                  onChange={e => set('shortDescription', e.target.value)} />
              </Field>
              <Field label="Description">
                <textarea className={textareaCls} rows={5} value={form.description}
                  onChange={e => set('description', e.target.value)} />
              </Field>
            </FormSection>

            <FormSection title="Pricing">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Price (BDT)" required>
                  <input type="number" min="0" step="0.01" className={inputCls} value={form.price}
                    onChange={e => set('price', e.target.value)} />
                  {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price}</p>}
                </Field>
                <Field label="Compare Price">
                  <input type="number" min="0" step="0.01" className={inputCls} value={form.comparePrice}
                    onChange={e => set('comparePrice', e.target.value)} />
                </Field>
                <Field label="Cost per item">
                  <input type="number" min="0" step="0.01" className={inputCls} value={form.cost}
                    onChange={e => set('cost', e.target.value)} />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Order Quantity Discounts">
              <DiscountSection discounts={form.discounts} onChange={val => set('discounts', val)} />
            </FormSection>

            <FormSection title="Inventory">
              <div className="flex items-center gap-3 mb-2">
                <button type="button" onClick={() => set('trackInventory', !form.trackInventory)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.trackInventory ? 'bg-violet-600' : 'bg-[#1e1e2e]'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.trackInventory ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-slate-400">Track Inventory</span>
              </div>
              {form.trackInventory && (
                <Field label="Stock Quantity">
                  <input type="number" min="0" className={inputCls} value={form.stock}
                    onChange={e => set('stock', e.target.value)} />
                  {errors.stock && <p className="mt-1 text-xs text-red-400">{errors.stock}</p>}
                </Field>
              )}
            </FormSection>

            <FormSection title="Shipping">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Weight (kg)">
                  <input type="number" min="0" step="0.01" className={inputCls} value={form.weight}
                    onChange={e => set('weight', e.target.value)} />
                </Field>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Dimensions (cm)</label>
                <div className="grid grid-cols-3 gap-3">
                  {['length', 'width', 'height'].map(dim => (
                    <input key={dim} type="number" min="0" step="0.1" className={inputCls} placeholder={dim}
                      value={form.dimensions[dim]} onChange={e => setDim(dim, e.target.value)} />
                  ))}
                </div>
              </div>
            </FormSection>
          </div>

          {/* ── Right ─────────────────────────────────────────────── */}
          <div className="space-y-5">
            <FormSection title="Status">
              <div className="space-y-2">
                {['active', 'draft', 'archived'].map(s => (
                  <label key={s} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="radio" name="status" value={s} checked={form.status === s}
                      onChange={() => set('status', s)} className="accent-violet-500" />
                    <span className="text-sm text-slate-300 capitalize">{s}</span>
                  </label>
                ))}
              </div>
            </FormSection>

            <FormSection title="Organisation">
              <Field label="Category" required>
                <select className={selectCls} value={form.category} onChange={e => handleCategoryChange(e.target.value)}>
                  <option value="">— Select Category —</option>
                  {allCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
              </Field>
              {subCategories.length > 0 && (
                <Field label="Sub Category">
                  <select className={selectCls} value={form.subCategory} onChange={e => handleSubCategoryChange(e.target.value)}>
                    <option value="">— Select Sub Category —</option>
                    {subCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </Field>
              )}
              {subSubCategories.length > 0 && (
                <Field label="Sub-Sub Category">
                  <select className={selectCls} value={form.subSubCategory} onChange={e => set('subSubCategory', e.target.value)}>
                    <option value="">— Select Sub-Sub Category —</option>
                    {subSubCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </Field>
              )}
              <Field label="Brand">
                <select className={selectCls} value={form.brand} onChange={e => set('brand', e.target.value)}>
                  <option value="">— Select Brand —</option>
                  {allBrands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </Field>
              <Field label="Tags" hint="Type a tag and press Space to add">
                <TagInput tags={form.tags} onChange={val => set('tags', val)} />
              </Field>
            </FormSection>

            <FormSection title="Images">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] w-fit">
                {['single', 'multiple'].map(m => (
                  <button key={m} type="button" onClick={() => handleImageModeChange(m)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${imageMode === m ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    {m}
                  </button>
                ))}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*"
                multiple={imageMode === 'multiple'} className="hidden"
                onChange={e => { handleFiles(e.target.files); e.target.value = ''; }} />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 text-center transition-colors ${dragOver ? 'border-violet-500 bg-violet-500/5' : 'border-[#1e1e2e] hover:border-violet-500/50'}`}>
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-slate-500">
                  <span className="text-violet-400 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-[10px] text-slate-600">
                  {imageMode === 'single' ? 'PNG, JPG, WEBP — one image' : 'PNG, JPG, WEBP — multiple allowed'}
                </p>
              </div>

              {form.images?.length > 0 && (
                <div className={`grid gap-2 mt-3 ${imageMode === 'single' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                  {form.images.map((img, idx) => (
                    <div key={idx}
                      className={`relative group overflow-hidden rounded-lg border border-[#1e1e2e] ${imageMode === 'single' ? 'aspect-video' : 'aspect-square'}`}>
                      <img
                        src={img?.preview || img?.url || img}
                        alt={img?.name || `image-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                        ×
                      </button>
                      {imageMode === 'single' && (
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/40 text-[10px] text-slate-300 truncate">
                          {img?.name || 'image'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </FormSection>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#1e1e2e]">
          <Link href="/dashboard/products"
            className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {uploadingImages
              ? 'Uploading images…'
              : createMutation.isPending || updateMutation.isPending
                ? 'Saving…'
                : mode === 'create' ? 'Create Product' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}