// 📁 PATH: src/components/admin/categories/CategoryFormModal.jsx

'use client';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadService, UPLOAD_FOLDERS } from '@/services/uploadService';
import { categoryService } from '@/services/categoryService';
import toast from 'react-hot-toast';
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
      {hint && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function ImagePicker({ imageUrl, onFileSelect, onRemoveExisting, disabled }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(imageUrl || '');
  const [dragOver, setDragOver] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setPreview(prev => prev || imageUrl || '');
  }, [imageUrl]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('শুধু image file দাও (jpg, png, webp, gif)'); return; }
    if (file.size > 10 * 1024 * 1024) { setErr('File size ১০MB এর বেশি হবে না'); return; }
    setErr('');
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleRemove = () => {
    setPreview('');
    setErr('');
    if (inputRef.current) inputRef.current.value = '';
    onFileSelect(null);
    onRemoveExisting();
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); };

  if (preview) {
    return (
      <div className="rounded-xl overflow-hidden border border-[#1e1e2e] bg-[#0a0a0f]">
        <div className="relative">
          <img src={preview} alt="Category" className="w-full h-36 object-cover" onError={e => { e.target.style.display = 'none'; }} />
          {!disabled && (
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-medium hover:bg-white/20 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Change
              </button>
              <button type="button" onClick={handleRemove} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 backdrop-blur border border-red-500/30 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Remove
              </button>
            </div>
          )}
        </div>
        {err && <p className="px-3 py-2 text-xs text-red-400 bg-red-500/5 border-t border-red-500/10">{err}</p>}
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`w-full rounded-xl border-2 border-dashed px-4 py-7 flex flex-col items-center gap-2 transition-colors cursor-pointer ${dragOver ? 'border-amber-500/60 bg-amber-500/5' : 'border-[#1e1e2e] hover:border-amber-500/30 hover:bg-amber-500/5 bg-[#0a0a0f]'}`}
      >
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-300"><span className="text-amber-400 font-medium">Click to select</span> or drag & drop</p>
          <p className="text-xs text-slate-600 mt-0.5">PNG, JPG, WEBP, GIF — max 10MB</p>
          <p className="text-xs text-slate-700 mt-0.5">Upload হবে Submit করার পরে</p>
        </div>
      </button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      {err && <p className="mt-1.5 text-xs text-red-400">{err}</p>}
    </div>
  );
}

// ── Saving Overlay — mutation.isPending এ দেখাবে ────────────
function SavingOverlay({ isEdit }) {
  return (
    <div className="absolute inset-0 bg-[#13131c]/90 backdrop-blur-sm rounded-2xl z-10 flex flex-col items-center justify-center gap-4 px-10">
      <svg className="w-10 h-10 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-white text-sm font-medium">
        {isEdit ? 'Updating category...' : 'Creating category...'}
      </p>
      <p className="text-slate-500 text-xs">একটু অপেক্ষা করো</p>
    </div>
  );
}

// ── Main Modal ───────────────────────────────────────────────
export default function CategoryFormModal({ editing, parentFor, allCategories, onSave, onClose }) {
  const isEdit = !!editing;
  const queryClient = useQueryClient();

  // ── Image state ──────────────────────────────────────────
  const [existingUrl, setExistingUrl] = useState(editing?.image?.url || '');
  const [existingPublicId] = useState(editing?.image?.publicId || '');
  const [pendingFile, setPendingFile] = useState(null);
  const [removeExisting, setRemoveExisting] = useState(false);

  // image upload চলছে কিনা (cloudinary) — এটা mutation এর বাইরে তাই আলাদা রাখতে হবে
  const [uploading, setUploading] = useState(false);

  const { watch, setValue, handleSubmit: rhfSubmit } = useForm({
    defaultValues: {
      name: editing?.name || '',
      slug: editing?.slug || '',
      parentId: editing?.parentId || parentFor?._id || '',
      sortOrder: editing?.sortOrder ?? '',
      isActive: editing?.isActive !== false,
    },
  });
  const form = watch();
  const set = (k, v) => setValue(k, v, { shouldDirty: true });

  const [slugManual, setSlugManual] = useState(isEdit);
  const [errors, setErrors] = useState({});

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

  // ── useMutation — create ─────────────────────────────────

const createMutation = useMutation({
  mutationFn: (payload) => categoryService.adminCreate(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    toast.success('Category created successfully!');
    onClose(); // ← onSave এর বদলে onClose
  },
  onError: (err) => {
    toast.error(err?.response?.data?.message || 'Something went wrong');
  },
});

// updateMutation
const updateMutation = useMutation({
  mutationFn: ({ id, payload }) => categoryService.adminUpdate(id, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    toast.success('Category updated successfully!');
    onClose(); // ← onSave এর বদলে onClose
  },
  onError: (err) => {
    toast.error(err?.response?.data?.message || 'Something went wrong');
  },
});

  // image upload + mutation মিলিয়ে সব pending হলে true
  const isPending = uploading || createMutation.isPending || updateMutation.isPending;

  // ── Submit ───────────────────────────────────────────────
  const onSubmit = async (data) => {
    if (!validate(data)) return;

    let finalImageUrl = existingUrl;
    let finalImagePublicId = existingPublicId;

    try {
      // ── Image upload ─────────────────────────────────────
      if (pendingFile) {
        setUploading(true);
        const result = await uploadService.uploadImage(pendingFile, {
          folder: UPLOAD_FOLDERS.CATEGORY_IMAGES,
        });
        setUploading(false);

        finalImageUrl = result.url;
        finalImagePublicId = result.publicId;

        // পুরোনো image delete
        if (existingPublicId && existingPublicId !== finalImagePublicId) {
          try { await uploadService.deleteFile(existingPublicId); } catch {
            console.warn('Old image delete failed:', existingPublicId);
          }
        }
      }

      // ── Edit: image remove করলে delete ──────────────────
      if (isEdit && removeExisting && existingPublicId && !pendingFile) {
        try { await uploadService.deleteFile(existingPublicId); } catch {
          console.warn('Old image delete failed:', existingPublicId);
        }
        finalImageUrl = '';
        finalImagePublicId = '';
      }

      // ── Payload ──────────────────────────────────────────
      const payload = {
        ...data,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder !== '' ? parseInt(data.sortOrder) : undefined,
        image: { url: finalImageUrl, publicId: finalImagePublicId },
      };

      // ── API call ─────────────────────────────────────────
      if (isEdit) {
        updateMutation.mutate({ id: editing._id, payload });
      } else {
        createMutation.mutate(payload);
      }

    } catch (err) {
      setUploading(false);
      alert('❌ Image upload failed: ' + (err?.message || 'Something went wrong'));
    }
  };

  const handleSubmit = rhfSubmit(onSubmit);
  const parentOptions = allCategories.filter(c => !isEdit || c._id !== editing._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-[#13131c] border border-[#1e1e2e] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Overlay — mutation চলার সময় */}
        {isPending && <SavingOverlay isEdit={isEdit} />}

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
          <button onClick={onClose} disabled={isPending} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 overflow-y-auto flex-1">

          <Field label="Category Image">
            <ImagePicker
              imageUrl={existingUrl}
              disabled={isPending}
              onFileSelect={(file) => { setPendingFile(file); if (file) setRemoveExisting(false); }}
              onRemoveExisting={() => { setExistingUrl(''); setRemoveExisting(true); setPendingFile(null); }}
            />
            {pendingFile && !isPending && (
              <p className="mt-1.5 text-xs text-amber-400/80 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Submit করার পরে upload হবে
              </p>
            )}
          </Field>

          <Field label="Category Name" required error={errors.name}>
            <input className={inputCls} placeholder="e.g. Mobile & Tablets" value={form.name} onChange={handleNameChange} autoFocus />
          </Field>

          <Field label="Slug" required hint="Auto-generated from name" error={errors.slug}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">/</span>
              <input className={`${inputCls} pl-5`} placeholder="mobile-tablets" value={form.slug} onChange={e => { setSlugManual(true); set('slug', e.target.value); }} />
            </div>
          </Field>

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

          <div className="grid grid-cols-2 gap-4">
            <Field label="Sort Order" hint="Lower = first">
              <input type="number" min="1" className={inputCls} placeholder="1" value={form.sortOrder} onChange={e => set('sortOrder', e.target.value)} />
            </Field>
            <Field label="Status">
              <button
                type="button"
                onClick={() => set('isActive', !form.isActive)}
                className={`w-full h-9 px-3 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${form.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-700/20 border-slate-700/40 text-slate-500'}`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.isActive ? 'border-emerald-400 bg-emerald-400/20' : 'border-slate-600'}`}>
                  {form.isActive && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                </div>
                {form.isActive ? 'Active' : 'Inactive'}
              </button>
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isPending} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors disabled:opacity-30">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors disabled:opacity-50">
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {uploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                isEdit ? 'Save Changes' : 'Create Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}