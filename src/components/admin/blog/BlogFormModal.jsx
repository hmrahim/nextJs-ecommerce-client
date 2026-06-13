'use client';
// 📁 PATH: src/components/admin/blog/BlogFormModal.jsx

import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { uploadService, UPLOAD_FOLDERS } from '@/services/uploadService';
import { useAuth } from '@/hooks/useAuth';

// ─── Constants (exported for page.jsx) ───────────────────────────────────────
export const BLOG_CATEGORIES = [
  { id: 'news',      name: 'News & Updates',  color: '#3b82f6' },
  { id: 'tutorial',  name: 'Tutorials',       color: '#10b981' },
  { id: 'review',    name: 'Product Reviews', color: '#f59e0b' },
  { id: 'guide',     name: 'Buying Guides',   color: '#a78bfa' },
  { id: 'lifestyle', name: 'Lifestyle',       color: '#ec4899' },
  { id: 'seller',    name: 'Seller Stories',  color: '#06b6d4' },
  { id: 'promo',     name: 'Promotions',      color: '#ef4444' },
];

export const BLOG_STATUSES = [
  { id: 'draft',     label: 'Draft',     color: 'slate' },
  { id: 'review',    label: 'In Review', color: 'amber' },
  { id: 'scheduled', label: 'Scheduled', color: 'sky'   },
  { id: 'published', label: 'Published', color: 'emerald'},
  { id: 'archived',  label: 'Archived',  color: 'zinc'  },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2.5 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-white text-sm ' +
  'focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors placeholder-slate-600';

const selectCls =
  'w-full px-3 py-2.5 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-white text-sm ' +
  'focus:outline-none focus:border-amber-500/50 transition-colors';

function slugify(text) {
  return text
    .toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint  && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({ value = [], onChange }) {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    // Space অথবা Enter অথবা Comma — নতুন tag
    if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
      setInputVal('');
    }
    // Backspace — শেষ tag delete
    if (e.key === 'Backspace' && inputVal === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    // comma দিয়ে লিখলে সাথে সাথে add করো
    if (val.endsWith(',')) {
      addTag(val.slice(0, -1));
      setInputVal('');
    } else {
      setInputVal(val);
    }
  };

  const handleBlur = () => {
    if (inputVal.trim()) {
      addTag(inputVal);
      setInputVal('');
    }
  };

  return (
    <div
      className="min-h-[42px] flex flex-wrap gap-1.5 px-2.5 py-2 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20 transition-colors cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Tags */}
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
            className="ml-0.5 text-amber-400/60 hover:text-amber-300 transition-colors leading-none"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}

      {/* Input */}
      <input
        ref={inputRef}
        value={inputVal}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? 'smart-home, iot, gadgets…' : ''}
        className="flex-1 min-w-[120px] bg-transparent text-white text-sm outline-none placeholder-slate-600 py-0.5"
      />
    </div>
  );
}

// ─── Cover Image Uploader ─────────────────────────────────────────────────────
function CoverImageUploader({ value, onChange }) {
  const inputRef                      = useRef(null);
  const [uploading, setUploading]     = useState(false);
  const [progress,  setProgress]      = useState(0);
  const [dragOver,  setDragOver]      = useState(false);
  const [uploadErr, setUploadErr]     = useState('');
  const [imgErr,    setImgErr]        = useState(false);

  useEffect(() => { setImgErr(false); }, [value]);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadErr('শুধু image file দাও (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadErr('File size ১০MB এর বেশি হবে না');
      return;
    }
    setUploadErr('');
    setProgress(0);
    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    onChange({ url: localUrl, publicId: null });
    try {
      const res = await uploadService.uploadImage(file, {
        folder:     UPLOAD_FOLDERS.DOCUMENTS || 'moom24/blog-covers',
        onProgress: (pct) => setProgress(pct),
      });
      URL.revokeObjectURL(localUrl);
      onChange({ url: res.url, publicId: res.publicId });
    } catch (err) {
      onChange({ url: '', publicId: null });
      setUploadErr(err?.message || 'Upload failed — আবার চেষ্টা করো');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange({ url: '', publicId: null });
    setUploadErr('');
    if (inputRef.current) inputRef.current.value = '';
  };

  if (value && !imgErr) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden border border-[#2a2a3a] bg-[#1a1a26]">
        <div className="relative aspect-[16/7] overflow-hidden bg-[#0f0f17]">
          <img
            src={value}
            alt="Cover"
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              <div className="w-40 h-1.5 rounded-full bg-[#1a1a26] overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-amber-400">{progress}%</span>
            </div>
          )}
        </div>
        {!uploading && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-[#2a2a3a] bg-[#1a1a26]">
            <span className="text-xs text-slate-500">Cover image uploaded</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-red-400 hover:text-red-300 font-medium"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
        dragOver ? 'border-amber-500/60 bg-amber-500/5' : 'border-[#2a2a3a] bg-[#1a1a26] hover:border-amber-500/30'
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="w-12 h-12 rounded-xl bg-[#0f0f17] flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-300">Drop cover image here</p>
        <p className="text-xs text-slate-600">or click to browse · JPG, PNG, WEBP · max 10MB</p>
        <p className="text-xs text-slate-600">Recommended: 1200×630px</p>
      </div>
      {uploadErr && (
        <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-red-400">{uploadErr}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BlogFormModal
// ══════════════════════════════════════════════════════════════════════════════
export default function BlogFormModal({ open, post, authors = [], onClose, onSave, isSaving }) {
  const { user } = useAuth();
  const isEdit = !!post;
  const { data: session } = useSession();

  const defaultValues = {
    title:       '',
    slug:        '',
    category:    'news',
    authorId:    user?.id,
    status:      'draft',
    isFeatured:  false,
    readTime:    5,
    tags:        [],   // ← array হিসেবে রাখো
    excerpt:     '',
    content:     '',
    coverImage:  { url: '', publicId: null },
    metaTitle:       '',
    metaDescription: '',
    publishedAt:     '',
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  // populate when editing
  useEffect(() => {
    if (!open) return;
    if (post) {
      reset({
        title:       post.title       || '',
        slug:        post.slug        || '',
        category:    post.category    || 'news',
        authorId:    post.author?._id || post.authorId || '',
        status:      post.status      || 'draft',
        isFeatured:  post.isFeatured  || false,
        readTime:    post.readTime    || 5,
        tags:        post.tags || [],   // ← array হিসেবে
        excerpt:     post.excerpt     || '',
        content:     post.content     || '',
        coverImage:  post.coverImage  || { url: '', publicId: null },
        metaTitle:       post.metaTitle       || '',
        metaDescription: post.metaDescription || '',
        publishedAt:     post.publishedAt
          ? new Date(post.publishedAt).toISOString().slice(0, 16)
          : '',
      });
    } else {
      reset(defaultValues);
    }
  }, [open, post]);

  // Auto-generate slug from title
  const titleVal = watch('title');
  const [slugLocked, setSlugLocked] = useState(false);

  useEffect(() => {
    if (!isEdit && !slugLocked && titleVal) {
      setValue('slug', slugify(titleVal), { shouldDirty: false });
    }
  }, [titleVal, isEdit, slugLocked]);

  const onSubmit = (data) => {
    const payload = {
      ...data,
      // tags ইতিমধ্যে array — আলাদা করে split করতে হবে না
      publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : null,
    };
    onSave(payload);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0a0a12] border border-[#1e1e2e] rounded-2xl w-full max-w-3xl my-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a12] rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-white">
              {isEdit ? 'Edit Blog Post' : 'New Blog Post'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? `Editing: ${post.title}` : 'Fill in the details below'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a1a26] hover:bg-[#2a2a3a] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-5">

            {/* Cover Image */}
            <Field label="Cover Image" hint="Recommended size: 1200×630px (16:5 ratio)">
              <Controller
                name="coverImage"
                control={control}
                render={({ field }) => (
                  <CoverImageUploader
                    value={field.value?.url || ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            {/* Title */}
            <Field label="Title" required error={errors.title?.message}>
              <input
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g. 10 Must-Have Smart Home Gadgets for 2025"
                className={inputCls}
              />
            </Field>

            {/* Slug */}
            <Field
              label="URL Slug"
              required
              hint="Auto-generated from title. Edit to lock."
              error={errors.slug?.message}
            >
              <div className="flex gap-2">
                <input
                  {...register('slug', { required: 'Slug is required' })}
                  placeholder="must-have-gadgets-2025"
                  onInput={() => setSlugLocked(true)}
                  className={`${inputCls} font-mono`}
                />
                {slugLocked && (
                  <button
                    type="button"
                    onClick={() => { setSlugLocked(false); setValue('slug', slugify(titleVal)); }}
                    className="px-3 py-2.5 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-xs text-slate-400 hover:text-white whitespace-nowrap"
                  >
                    Reset
                  </button>
                )}
              </div>
            </Field>

            {/* Category + Author */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" required error={errors.category?.message}>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className={selectCls}
                >
                  {BLOG_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Author" error={errors.authorId?.message}>
                {authors.length > 0 ? (
                  <select
                    {...register('authorId')}
                    className={selectCls}
                  >
                    <option value="">— Current user (default) —</option>
                    {authors.map((a) => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="px-3 py-2.5 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-slate-500 text-sm">
                    Assigned to you automatically
                  </p>
                )}
              </Field>
            </div>

            {/* Status + Read Time + Publish Date */}
            <div className="grid grid-cols-3 gap-4">
              <Field label="Status" required>
                <select {...register('status')} className={selectCls}>
                  {BLOG_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Read Time (min)" hint="Estimated reading time">
                <input
                  type="number"
                  min={1}
                  max={120}
                  {...register('readTime', { min: 1, max: 120, valueAsNumber: true })}
                  className={inputCls}
                />
              </Field>

              <Field label="Publish Date" hint="For scheduled posts">
                <input
                  type="datetime-local"
                  {...register('publishedAt')}
                  className={`${inputCls} [color-scheme:dark]`}
                />
              </Field>
            </div>

            {/* Featured toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  {...register('isFeatured')}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 rounded-full bg-[#2a2a3a] peer-checked:bg-amber-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <span className="text-sm text-slate-300 font-medium">Featured Post</span>
                <p className="text-xs text-slate-600">Pinned on the blog homepage</p>
              </div>
            </label>

            {/* Excerpt */}
            <Field
              label="Excerpt"
              required
              hint="Short summary shown on blog list pages (max 300 chars)"
              error={errors.excerpt?.message}
            >
              <textarea
                rows={3}
                maxLength={300}
                placeholder="Short summary that entices the reader to click..."
                {...register('excerpt', { required: 'Excerpt is required', maxLength: { value: 300, message: 'Max 300 characters' } })}
                className={`${inputCls} resize-none`}
              />
            </Field>

            {/* Content */}
            <Field
              label="Content (HTML / Markdown)"
              hint="Full blog post body. Supports basic HTML."
            >
              <textarea
                rows={8}
                placeholder="Write your full blog post here..."
                {...register('content')}
                className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
              />
            </Field>

            {/* Tags — Controller দিয়ে TagInput এ connect করো */}
            <Field label="Tags" hint="Space বা Enter বা Comma দিলে tag আলাদা হবে। Backspace দিলে শেষ tag মুছে যাবে।">
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            {/* SEO Section */}
            <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] p-4 space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SEO / Meta</p>
              <Field label="Meta Title" hint="Defaults to post title if empty">
                <input
                  {...register('metaTitle')}
                  placeholder="Custom SEO title (max 70 chars)"
                  maxLength={70}
                  className={inputCls}
                />
              </Field>
              <Field label="Meta Description" hint="Max 160 characters">
                <textarea
                  rows={2}
                  maxLength={160}
                  placeholder="Brief description for search engines..."
                  {...register('metaDescription')}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-2 px-6 py-4 border-t border-[#1e1e2e] bg-[#0a0a12] rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#2a2a3a] text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-semibold transition-colors"
            >
              {isSaving && (
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              )}
              {isEdit ? 'Save changes' : 'Create post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}