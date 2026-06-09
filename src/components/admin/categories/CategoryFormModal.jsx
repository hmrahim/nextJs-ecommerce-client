
'use client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { uploadService } from '@/services/uploadService';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const inputCls = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-colors";
const selectCls = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-amber-500/60 transition-colors";

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

function ImageUploader({ value, onChange }) {
  const inputRef          = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const [uploadErr, setUploadErr] = useState('');

  const handleFile = async (file) => {
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) { setUploadErr('শুধু image file upload করো (jpg, png, webp)'); return; }
    if (file.size > 5 * 1024 * 1024)    { setUploadErr('File size ৫MB এর বেশি হবে না'); return; }

    setUploadErr('');
    setUploading(true);

    // Optimistic local preview
    const localUrl = URL.createObjectURL(file);
    onChange(localUrl);

    try {
      const res = await uploadService.uploadImage(file);
      const remoteUrl = res.data?.url || res.data?.imageUrl || res.data?.path;
      if (remoteUrl) {
        URL.revokeObjectURL(localUrl);
        onChange(remoteUrl);
      }
    } catch {
      // Backend not ready — keep local preview, warn user
      setUploadErr('Backend connected হলে image save হবে। এখন local preview দেখাচ্ছে।');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange('');
    setUploadErr('');
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── Has image ──────────────────────────────────────────────────────────────
  if (value) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden border border-[#1e1e2e] bg-[#0a0a0f]">
        <img
          src={value}
          alt="Category"
          className="w-full h-36 object-cover"
          onError={e => { e.target.src = ''; }}
        />
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-medium hover:bg-white/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Change
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 backdrop-blur border border-red-500/30 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove
          </button>
        </div>

        {/* Uploading spinner overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />

        {uploadErr && <p className="px-3 py-2 text-xs text-amber-400 bg-amber-500/5 border-t border-amber-500/10">{uploadErr}</p>}
      </div>
    );
  }

  // ── No image — upload zone ─────────────────────────────────────────────────
  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        disabled={uploading}
        className={`w-full rounded-xl border-2 border-dashed px-4 py-7 flex flex-col items-center gap-2 transition-colors cursor-pointer
          ${dragOver
            ? 'border-amber-500/60 bg-amber-500/5'
            : 'border-[#1e1e2e] hover:border-amber-500/30 hover:bg-amber-500/5 bg-[#0a0a0f]'
          }`}
      >
        {uploading ? (
          <>
            <svg className="w-7 h-7 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-amber-400">Uploading…</span>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-300">
                <span className="text-amber-400 font-medium">Click to upload</span> or drag & drop               </p>
              <p className="text-xs text-slate-600 mt-0.5">PNG, JPG, WEBP — max 5MB</p>
            </div>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />

      {uploadErr && <p className="mt-1.5 text-xs text-red-400">{uploadErr}</p>}
    </div>
  );
}

export default function CategoryFormModal({ editing, parentFor, allCategories, onSave, onClose }) {
  const isEdit = !!editing;

  const { watch, setValue, handleSubmit: rhfHandleSubmit } = useForm({
    defaultValues: {
      name:      editing?.name      || '',
      slug:      editing?.slug      || '',
      parentId:  editing?.parentId  || parentFor?._id || '',
      imageUrl:  editing?.imageUrl  || '',
      sortOrder: editing?.sortOrder ?? '',
      isActive:  editing?.isActive  !== false,
    },
  });
  const form = watch();
  const set = (k, v) => setValue(k, v, { shouldDirty: true });

  const [slugManual, setSlugManual] = useState(isEdit);
  const [errors, setErrors]         = useState({});
  const [saving, setSaving]         = useState(false);

  const handleNameChange = (e) => {
    const val = e.target.value;
    set('name', val);
    if (!slugManual) set('slug', slugify(val));
  };

  const validate = (data) => {
    const e = {};
    if (!data.name.trim()) e.name = 'Category name required';
    if (!data.slug.trim()) e.slug = 'Slug required';
    if (isEdit && data.parentId === editing._id) e.parentId = 'A category cannot be its own parent';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (data) => {
    if (!validate(data)) return;
    setSaving(true);
    try {
      await onSave({
        ...data,
        parentId:  data.parentId || null,
        sortOrder: data.sortOrder !== '' ? parseInt(data.sortOrder) : undefined,
      });
    } finally { setSaving(false); }
  };
  const handleSubmit = rhfHandleSubmit(onSubmit);

  const parentOptions = allCategories.filter(c => !isEdit || c._id !== editing._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-[#13131c] border border-[#1e1e2e] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold">
              {isEdit ? 'Edit Category' : parentFor ? `Add under "${parentFor.name}"` : 'New Category'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? 'Update category details.' : 'Fill in the details below.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Image upload */}
          <Field label="Category Image">
            <ImageUploader value={form.imageUrl} onChange={v => set('imageUrl', v)} />
          </Field>

          {/* Name */}
          <Field label="Category Name" required error={errors.name}>
            <input className={inputCls} placeholder="e.g. Mobile & Tablets" value={form.name} onChange={handleNameChange} autoFocus />
          </Field>

          {/* Slug */}
          <Field label="Slug" required hint="Auto-generated from name" error={errors.slug}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">/</span>
              <input
                className={`${inputCls} pl-5`}
                placeholder="mobile-tablets"
                value={form.slug}
                onChange={e => { setSlugManual(true); set('slug', e.target.value); }}
              />
            </div>
          </Field>

          {/* Parent */}
          <Field label="Parent Category" hint="Empty = root category" error={errors.parentId}>
            <select className={selectCls} value={form.parentId} onChange={e => set('parentId', e.target.value)}>
              <option value="">— None (Root) —</option>
              {parentOptions.map(c => (
                <option key={c._id} value={c._id}>
                  {'  '.repeat(c.depth || 0)}{c.depth > 0 ? '└ ' : ''}{c.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Sort Order + Status */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sort Order" hint="Lower = first">
              <input type="number" min="1" className={inputCls} placeholder="1" value={form.sortOrder} onChange={e => set('sortOrder', e.target.value)} />
            </Field>

            <Field label="Status">
              <button
                type="button"
                onClick={() => set('isActive', !form.isActive)}
                className={`w-full h-9 px-3 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                  form.isActive
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-slate-700/20 border-slate-700/40 text-slate-500'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.isActive ? 'border-emerald-400 bg-emerald-400/20' : 'border-slate-600'}`}>
                  {form.isActive && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                </div>
                {form.isActive ? 'Active' : 'Inactive'}
              </button>
            </Field>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isEdit ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
