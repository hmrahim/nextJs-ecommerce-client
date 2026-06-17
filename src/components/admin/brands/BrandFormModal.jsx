// 📁 PATH: src/components/admin/brands/BrandFormModal.jsx

'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { uploadService, UPLOAD_FOLDERS } from '@/services/uploadService';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-colors";
const textareaCls = "w-full px-3 py-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-colors resize-none";

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

/* ── Logo Uploader ───────────────────────────────────────────────────────────── */
function LogoUploader({ value, brandName, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [imgErr, setImgErr]       = useState(false);

  useEffect(() => { setImgErr(false); }, [value]);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadErr('only image file (jpg, png, svg, webp)'); return; }
    if (file.size > 5 * 1024 * 1024)    { setUploadErr('File size 5MB Will not be more than this'); return; }

    setUploadErr('');
    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    onChange({ url: localUrl, publicId: null });

    try {
      const res = await uploadService.uploadImage(file, {
        folder: UPLOAD_FOLDERS.BRAND_LOGOS,
      });
      URL.revokeObjectURL(localUrl);
      onChange({ url: res.url, publicId: res.publicId });
    } catch (err) {
      setUploadErr(err?.message || 'Upload failed. Try again।');
    } finally {
      setUploading(false);
    }
  };

  const initials = (brandName || 'BR').slice(0, 2).toUpperCase();

  if (value && !imgErr) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden border border-[#1e1e2e] bg-white">
        <div className="flex items-center justify-center h-28 p-4">
          <img
            src={value}
            alt="Brand logo"
            className="max-h-full max-w-full object-contain"
            onError={() => setImgErr(true)}
          />
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <div className="flex items-center justify-between px-3 py-2 border-t border-[#1e1e2e] bg-[#0a0a0f]">
          <span className="text-xs text-slate-500 truncate max-w-[60%]">Logo uploaded</span>
          <button onClick={() => { onChange({ url: '', publicId: null }); if (inputRef.current) inputRef.current.value = ''; }}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
          dragOver ? 'border-amber-500/60 bg-amber-500/5' : 'border-[#1e1e2e] bg-[#0a0a0f] hover:border-amber-500/30'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2 py-6">
          {/* Brand initials placeholder */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20 flex items-center justify-center">
            {uploading
              ? <div className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
              : <span className="text-lg font-bold text-violet-400">{initials}</span>
            }
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-amber-400 font-medium">Click to upload</span> or drag & drop
          </p>
          <p className="text-[11px] text-slate-600">SVG, PNG, JPG, WEBP — max 5MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
      </div>
      {uploadErr && <p className="mt-1.5 text-xs text-amber-400">{uploadErr}</p>}
    </div>
  );
}

/* ── Main Modal ──────────────────────────────────────────────────────────────── */
export default function BrandFormModal({ editing, onSave, onClose }) {
  const [activeTab, setActiveTab] = useState('general'); // general | seo
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState({});
  const [slugManual, setSlugManual] = useState(false);

  const { watch, setValue, handleSubmit: rhfHandleSubmit } = useForm({
    defaultValues: {
      name:            '',
      slug:            '',
      logoUrl:         '',
      logoPublicId:    '',
      website:         '',
      description:     '',
      country:         '',
      isFeatured:      false,
      isActive:        true,
      sortOrder:       1,
      metaTitle:       '',
      metaDescription: '',
      ...editing,
    },
  });
  const form = watch();
  const set = (k, v) => {
    setValue(k, v, { shouldDirty: true });
    if (k === 'name' && !slugManual) setValue('slug', slugify(v), { shouldDirty: true });
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = (data) => {
    const e = {};
    if (!data.name.trim())    e.name = 'Brand name required';
    if (!data.slug.trim())    e.slug = 'Slug required';
    if (data.website && !/^https?:\/\//i.test(data.website)) e.website = 'URL must start with http:// or https://';
    return e;
  };

  const handleSubmit = rhfHandleSubmit(async () => {
    const e = validate(form);
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  });

  const TABS = [
    { key: 'general', label: 'General', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { key: 'seo',     label: 'SEO',     icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  ];

  const COUNTRIES = [
    '', 'Bangladesh', 'United States', 'United Kingdom', 'Germany', 'Japan', 'South Korea',
    'China', 'France', 'Italy', 'India', 'Singapore', 'Australia', 'Canada', 'Sweden',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#1e1e2e]">
          <div>
            <h2 className="text-base font-bold text-white">
              {editing ? 'Edit Brand' : 'Add New Brand'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {editing ? `Editing "${editing.name}"` : 'Create a new brand for your catalog'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-amber-500 text-black'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {activeTab === 'general' && (
            <>
              {/* Logo */}
              <Field label="Brand Logo" hint="Recommended: SVG or transparent PNG, min 200×100px">
                <LogoUploader
                  value={form.logoUrl}
                  brandName={form.name}
                  onChange={({ url, publicId }) => {
                    set('logoUrl', url);
                    setValue('logoPublicId', publicId ?? '', { shouldDirty: true });
                  }}
                />
              </Field>

              {/* Name + Slug */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Brand Name" required error={errors.name}>
                  <input
                    className={inputCls}
                    placeholder="e.g. Samsung"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                  />
                </Field>
                <Field label="Slug" required hint="URL-friendly identifier" error={errors.slug}>
                  <input
                    className={inputCls}
                    placeholder="e.g. samsung"
                    value={form.slug}
                    onChange={e => { setSlugManual(true); set('slug', slugify(e.target.value)); }}
                  />
                </Field>
              </div>

              {/* Website + Country */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Website URL" error={errors.website}>
                  <input
                    className={inputCls}
                    placeholder="https://brand.com"
                    value={form.website}
                    onChange={e => set('website', e.target.value)}
                  />
                </Field>
                <Field label="Country of Origin">
                  <select
                    className={inputCls + ' cursor-pointer'}
                    value={form.country}
                    onChange={e => set('country', e.target.value)}
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c || '— Select country —'}</option>)}
                  </select>
                </Field>
              </div>

              {/* Description */}
              <Field label="Description" hint="Brief brand description (shows on brand page)">
                <textarea
                  className={textareaCls}
                  rows={3}
                  placeholder="Short brand bio or tagline…"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </Field>

              {/* Sort Order */}
              <Field label="Sort Order" hint="Lower number = appears first">
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  value={form.sortOrder}
                  onChange={e => set('sortOrder', parseInt(e.target.value) || 1)}
                />
              </Field>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'isActive', label: 'Active', desc: 'Brand is visible on storefront', color: 'emerald' },
                  { key: 'isFeatured', label: 'Featured', desc: 'Show in featured brands section', color: 'amber' },
                ].map(tog => (
                  <button
                    key={tog.key}
                    type="button"
                    onClick={() => set(tog.key, !form[tog.key])}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                      form[tog.key]
                        ? tog.color === 'emerald'
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-amber-500/30 bg-amber-500/5'
                        : 'border-[#1e1e2e] bg-[#0a0a0f] hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-4 h-4 rounded border mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors ${
                      form[tog.key]
                        ? tog.color === 'emerald' ? 'bg-emerald-500 border-emerald-500' : 'bg-amber-500 border-amber-500'
                        : 'border-[#2a2a3a] bg-[#0a0a0f]'
                    }`}>
                      {form[tog.key] && (
                        <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{tog.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{tog.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === 'seo' && (
            <>
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-sky-500/5 border border-sky-500/15 mb-2">
                <svg className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-sky-300">
                  These fields help search engines understand your brand page. Fill them in for better SEO rankings.
                </p>
              </div>

              <Field label="Meta Title" hint={`${form.metaTitle.length}/60 characters recommended`}>
                <input
                  className={inputCls}
                  placeholder={`${form.name || 'Brand'} | Your Store Name`}
                  value={form.metaTitle}
                  onChange={e => set('metaTitle', e.target.value)}
                  maxLength={70}
                />
              </Field>

              <Field label="Meta Description" hint={`${form.metaDescription.length}/160 characters recommended`}>
                <textarea
                  className={textareaCls}
                  rows={3}
                  placeholder="Brief description of this brand for search results…"
                  value={form.metaDescription}
                  onChange={e => set('metaDescription', e.target.value)}
                  maxLength={180}
                />
              </Field>

              {/* SERP Preview */}
              {(form.metaTitle || form.name) && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">SERP Preview</p>
                  <div className="p-4 rounded-xl border border-[#1e1e2e] bg-white">
                    <p className="text-[#1a0dab] text-base font-medium truncate leading-tight">
                      {form.metaTitle || `${form.name} | Your Store`}
                    </p>
                    <p className="text-[#006621] text-xs mt-0.5">yourdomain.com/brands/{form.slug || 'brand-slug'}</p>
                    <p className="text-[#545454] text-sm mt-1 line-clamp-2 leading-snug">
                      {form.metaDescription || form.description || 'No description set. Add a meta description above.'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1e1e2e] bg-[#0d0d14]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black text-sm font-semibold transition-colors shadow-lg shadow-amber-900/20"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {editing ? 'Update Brand' : 'Create Brand'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}