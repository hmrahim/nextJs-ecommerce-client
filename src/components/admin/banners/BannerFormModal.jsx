'use client';
// 📁 PATH: src/components/admin/banners/BannerFormModal.jsx

import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { uploadService, UPLOAD_FOLDERS } from '@/services/uploadService';

// ─── Constants ────────────────────────────────────────────────────────────────

export const PLATFORMS = [
  { id: 'web',    name: 'Next.js Web App',  icon: '🌐' },
  { id: 'mobile', name: 'Mobile App (Expo)', icon: '📱' },
  { id: 'both',   name: 'Both (Web + Mobile)', icon: '🔗' },
];

export const WEB_PLACEMENTS = [
  { id: 'web_home_hero_slider',     name: 'Home Hero Slider',       size: '1920×720', desc: 'Homepage top carousel slider' },
  { id: 'web_home_side_panel_1',    name: 'Home Side Panel 1 (Left)', size: '400×200', desc: 'Hero section side panel - top' },
  { id: 'web_home_side_panel_2',    name: 'Home Side Panel 2 (Right)', size: '400×200', desc: 'Hero section side panel - bottom' },
  { id: 'web_home_promo_banner_1',  name: 'Home Promo Banner 1',    size: '800×300', desc: 'Homepage promotional banner - left' },
  { id: 'web_home_promo_banner_2',  name: 'Home Promo Banner 2',    size: '800×300', desc: 'Homepage promotional banner - right' },
  { id: 'web_category_page_top',    name: 'Category Page Top',      size: '1600×320', desc: 'Above product grid on category pages' },
  { id: 'web_checkout_promo',       name: 'Checkout Promo',         size: '800×120', desc: 'Inside checkout summary section' },
  { id: 'web_flash_sale_banner',    name: 'Flash Sale Banner',      size: '1600×400', desc: 'Flash sale section banner' },
  { id: 'web_shop_page_banner',     name: 'Shop Page Banner',       size: '1600×320', desc: 'Top of shop/all products page' },
  { id: 'web_popup',                name: 'Web Popup',              size: '600×800', desc: 'Modal popup on first visit' },
];

export const MOBILE_PLACEMENTS = [
  { id: 'mobile_home_hero',            name: 'Home Hero Banner',        size: '750×400', desc: 'Mobile app homepage hero section' },
  { id: 'mobile_home_carousel',        name: 'Home Carousel',           size: '750×300', desc: 'Mobile app homepage carousel slider' },
  { id: 'mobile_category_banner',      name: 'Category Banner',         size: '750×200', desc: 'Category screen top banner' },
  { id: 'mobile_product_detail_banner', name: 'Product Detail Banner',  size: '750×150', desc: 'Product detail page promo banner' },
  { id: 'mobile_cart_promo',           name: 'Cart Promo Banner',       size: '750×120', desc: 'Cart screen promotional banner' },
  { id: 'mobile_splash_promo',         name: 'Splash/Launch Promo',     size: '750×1334', desc: 'App launch promotional screen' },
  { id: 'mobile_offer_popup',          name: 'Offer Popup',             size: '600×800', desc: 'In-app offer popup modal' },
];

// Combined for backward compat
export const PLACEMENTS = [...WEB_PLACEMENTS, ...MOBILE_PLACEMENTS];

export const STATUSES = [
  { id: 'live',      label: 'Live',      color: 'emerald' },
  { id: 'scheduled', label: 'Scheduled', color: 'sky' },
  { id: 'paused',    label: 'Paused',    color: 'amber' },
  { id: 'expired',   label: 'Expired',   color: 'zinc' },
  { id: 'draft',     label: 'Draft',     color: 'slate' },
];

export const LINK_TYPES = [
  { id: 'url',      label: 'Custom URL' },
  { id: 'product',  label: 'Product' },
  { id: 'category', label: 'Category' },
  { id: 'brand',    label: 'Brand' },
  { id: 'page',     label: 'CMS Page' },
  { id: 'none',     label: 'No link' },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2.5 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-white text-sm ' +
  'focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors';

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

// ══════════════════════════════════════════════════════════════════════════════
// PlacementSelector — Multi-select checkboxes for placements
// ══════════════════════════════════════════════════════════════════════════════
function PlacementSelector({ platform, selectedPlacements, onChange }) {
  const getAvailablePlacements = () => {
    if (platform === 'web') return WEB_PLACEMENTS;
    if (platform === 'mobile') return MOBILE_PLACEMENTS;
    return [...WEB_PLACEMENTS, ...MOBILE_PLACEMENTS]; // both
  };

  const available = getAvailablePlacements();

  const togglePlacement = (placementId) => {
    if (selectedPlacements.includes(placementId)) {
      onChange(selectedPlacements.filter((p) => p !== placementId));
    } else {
      onChange([...selectedPlacements, placementId]);
    }
  };

  const selectAll = () => {
    onChange(available.map((p) => p.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  // Group placements by platform
  const webPlacements = available.filter((p) => p.id.startsWith('web_'));
  const mobilePlacements = available.filter((p) => p.id.startsWith('mobile_'));

  return (
    <div className="space-y-3">
      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold transition-colors"
        >
          Select All
        </button>
        <span className="text-slate-600">|</span>
        <button
          type="button"
          onClick={clearAll}
          className="text-[11px] text-slate-400 hover:text-slate-300 font-semibold transition-colors"
        >
          Clear All
        </button>
        <span className="ml-auto text-[11px] text-slate-500">
          {selectedPlacements.length} selected
        </span>
      </div>

      {/* Web placements section */}
      {webPlacements.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
            <span>🌐</span> Next.js Web App Locations
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {webPlacements.map((p) => {
              const isChecked = selectedPlacements.includes(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    isChecked
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-[#2a2a3a] bg-[#1a1a26] hover:border-[#3a3a4a]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => togglePlacement(p.id)}
                    className="w-4 h-4 rounded border-[#3a3a4a] bg-[#0f0f17] text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-500">{p.desc} · {p.size}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile placements section */}
      {mobilePlacements.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-sky-400 font-semibold mb-2 flex items-center gap-1.5">
            <span>📱</span> Mobile App Locations
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {mobilePlacements.map((p) => {
              const isChecked = selectedPlacements.includes(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    isChecked
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-[#2a2a3a] bg-[#1a1a26] hover:border-[#3a3a4a]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => togglePlacement(p.id)}
                    className="w-4 h-4 rounded border-[#3a3a4a] bg-[#0f0f17] text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-500">{p.desc} · {p.size}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {selectedPlacements.length === 0 && (
        <p className="text-[11px] text-amber-400/70 italic">⚠ কমপক্ষে একটি location select করুন</p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BannerImageUploader
// ══════════════════════════════════════════════════════════════════════════════
function BannerImageUploader({ value, publicId, onChange, placementSize }) {
  const inputRef             = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [dragOver, setDragOver]   = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [imgErr, setImgErr]       = useState(false);

  useEffect(() => { setImgErr(false); }, [value]);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadErr('শুধুমাত্র image file দিন (JPG, PNG, WEBP, SVG)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadErr('File size 10MB এর বেশি হবে না');
      return;
    }

    setUploadErr('');
    setProgress(0);
    setUploading(true);

    const localUrl = URL.createObjectURL(file);
    onChange({ url: localUrl, publicId: null });

    try {
      const res = await uploadService.uploadImage(file, {
        folder:     UPLOAD_FOLDERS.BANNER_IMAGES,
        onProgress: (pct) => setProgress(pct),
      });
      URL.revokeObjectURL(localUrl);
      onChange({ url: res.url, publicId: res.publicId });
    } catch (err) {
      onChange({ url: '', publicId: null });
      setUploadErr(err?.message || 'Upload failed — আবার চেষ্টা করুন');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    onChange({ url: '', publicId: null });
    setUploadErr('');
    if (inputRef.current) inputRef.current.value = '';
  };

  if (value && !imgErr) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden border border-[#2a2a3a] bg-[#1a1a26]">
        <div className="relative aspect-[16/6] overflow-hidden bg-[#0f0f17]">
          <img
            src={value}
            alt="Banner preview"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
              <p className="text-xs text-amber-400 font-semibold">{progress}%</p>
              <div className="w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-3 py-2 border-t border-[#2a2a3a] bg-[#0f0f17]">
          <div className="flex items-center gap-2 min-w-0">
            {publicId ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-xs text-slate-400 truncate">Cloudinary-তে uploaded</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <span className="text-xs text-slate-400">Uploading…</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-40"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Remove
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
          dragOver
            ? 'border-amber-500/60 bg-amber-500/5'
            : 'border-[#2a2a3a] bg-[#1a1a26] hover:border-amber-500/30 hover:bg-amber-500/[0.03]'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2.5 py-8">
          <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            ) : (
              <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-300">
              <span className="text-amber-400 font-semibold">Click to upload</span> or drag &amp; drop
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              JPG, PNG, WEBP, SVG · max 10MB
              {placementSize && (
                <span className="ml-1 text-slate-600">· Recommended {placementSize}</span>
              )}
            </p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {uploadErr && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {uploadErr}
        </p>
      )}
    </div>
  );
}

// ─── Default values ───────────────────────────────────────────────────────────
const DEFAULT_VALUES = {
  title:         '',
  subtitle:      '',
  buttonText:    'Shop now',
  platform:      'both',
  placements:    [],
  status:        'draft',
  priority:      5,
  imageUrl:      '',
  imagePublicId: '',
  linkType:      'url',
  linkValue:     '',
  startsAt:      '',
  endsAt:        '',
  devices:       'all',
};

// ─── ISO date → YYYY-MM-DD ────────────────────────────────────────────────────
function toDateInput(v) {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

// ─── Normalize banner object for form ────────────────────────────────────────
function normalizeBanner(banner) {
  if (!banner) return DEFAULT_VALUES;
  return {
    title:         banner.title         ?? '',
    subtitle:      banner.subtitle      ?? '',
    buttonText:    banner.buttonText    ?? 'Shop now',
    platform:      banner.platform      ?? 'both',
    placements:    banner.placements    ?? (banner.placement ? [banner.placement] : []),
    status:        banner.status        ?? 'draft',
    priority:      banner.priority      ?? 5,
    imageUrl:      banner.image         ?? '',
    imagePublicId: banner.imagePublicId ?? '',
    linkType:      banner.linkType      ?? 'url',
    linkValue:     banner.linkValue     ?? '',
    startsAt:      toDateInput(banner.startsAt),
    endsAt:        toDateInput(banner.endsAt),
    devices:       banner.devices       ?? 'all',
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// BannerFormModal — main export
// ══════════════════════════════════════════════════════════════════════════════
export default function BannerFormModal({ open, editing, isSaving, onClose, onSave }) {
  const isEdit = !!editing;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: normalizeBanner(editing),
    mode: 'onChange',
  });

  useEffect(() => {
    reset(normalizeBanner(editing));
  }, [editing, open, reset]);

  const watchedValues = watch();

  // Get recommended size from first selected placement
  const getRecommendedSize = () => {
    if (!watchedValues.placements || watchedValues.placements.length === 0) return null;
    const firstPlacement = PLACEMENTS.find((p) => p.id === watchedValues.placements[0]);
    return firstPlacement?.size ?? null;
  };

  if (!open) return null;

  const onSubmit = (data) => {
    const payload = {
      title:         data.title,
      subtitle:      data.subtitle      || '',
      buttonText:    data.buttonText    || '',
      platform:      data.platform,
      placements:    data.placements    || [],
      placement:     data.placements?.[0] || '',
      status:        data.status,
      priority:      Number(data.priority),
      image:         data.imageUrl      || '',
      imagePublicId: data.imagePublicId || '',
      linkType:      data.linkType,
      linkValue:     data.linkType === 'none' ? '' : (data.linkValue || ''),
      startsAt:      data.startsAt || null,
      endsAt:        data.endsAt   || null,
      devices:       data.devices,
    };
    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f17] border border-[#1e1e2e] rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-[#1e1e2e] flex items-center justify-between sticky top-0 bg-[#0f0f17] z-10">
          <div>
            <h3 className="text-lg font-bold text-white">
              {isEdit ? 'Edit Banner' : 'New Banner / Slide'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? `Editing "${editing.title}"` : 'Banner upload করুন এবং platform ও location select করুন'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ─── Left: Form fields ──────────────────────────────────────── */}
            <div className="space-y-4">

              {/* ── Image Upload ── */}
              <Field
                label="Banner Image"
                hint={`Cloudinary-তে upload হবে${getRecommendedSize() ? ` · Recommended: ${getRecommendedSize()}` : ''}`}
              >
                <Controller
                  name="imageUrl"
                  control={control}
                  render={({ field }) => (
                    <BannerImageUploader
                      value={field.value}
                      publicId={watchedValues.imagePublicId}
                      placementSize={getRecommendedSize()}
                      onChange={({ url, publicId }) => {
                        field.onChange(url);
                        setValue('imagePublicId', publicId ?? '', { shouldDirty: true });
                      }}
                    />
                  )}
                />
              </Field>

              {/* ── Title ── */}
              <Field label="Internal name" required error={errors.title?.message}>
                <input
                  {...register('title', {
                    required:  'Title is required',
                    maxLength: { value: 150, message: 'Max 150 characters' },
                  })}
                  placeholder="e.g. Eid Mega Sale 2025"
                  className={`${inputCls} ${errors.title ? 'border-red-500/50' : ''}`}
                />
              </Field>

              {/* ── Subtitle + Button text ── */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Subtitle" error={errors.subtitle?.message}>
                  <input
                    {...register('subtitle', {
                      maxLength: { value: 200, message: 'Max 200 chars' },
                    })}
                    className={`${inputCls} ${errors.subtitle ? 'border-red-500/50' : ''}`}
                  />
                </Field>
                <Field label="CTA button text" error={errors.buttonText?.message}>
                  <input
                    {...register('buttonText', {
                      maxLength: { value: 40, message: 'Max 40 chars' },
                    })}
                    className={`${inputCls} ${errors.buttonText ? 'border-red-500/50' : ''}`}
                  />
                </Field>
              </div>

              {/* ── Platform Selection ── */}
              <Field
                label="Platform"
                required
                hint="এই banner কোন platform এ দেখাবে select করুন"
              >
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map((p) => {
                    const isSelected = watchedValues.platform === p.id;
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-center ${
                          isSelected
                            ? 'border-amber-500/50 bg-amber-500/10 text-white'
                            : 'border-[#2a2a3a] bg-[#1a1a26] text-slate-400 hover:border-[#3a3a4a]'
                        }`}
                      >
                        <input
                          type="radio"
                          {...register('platform')}
                          value={p.id}
                          className="hidden"
                        />
                        <span className="text-base">{p.icon}</span>
                        <span className="text-xs font-medium">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              </Field>

              {/* ── Link type + Link value ── */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Link type">
                  <select {...register('linkType')} className={inputCls}>
                    {LINK_TYPES.map((l) => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Link target" error={errors.linkValue?.message}>
                  <input
                    {...register('linkValue')}
                    placeholder={watchedValues.linkType === 'url' ? '/shop/sale' : 'slug or id'}
                    disabled={watchedValues.linkType === 'none'}
                    className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                  />
                </Field>
              </div>

              {/* ── Dates ── */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Starts at" error={errors.startsAt?.message}>
                  <input type="date" {...register('startsAt')} className={inputCls} />
                </Field>
                <Field label="Ends at" error={errors.endsAt?.message}>
                  <input
                    type="date"
                    {...register('endsAt', {
                      validate: (val) => {
                        if (!val || !watchedValues.startsAt) return true;
                        return (
                          new Date(val) >= new Date(watchedValues.startsAt) ||
                          'End date must be ≥ start date'
                        );
                      },
                    })}
                    className={`${inputCls} ${errors.endsAt ? 'border-red-500/50' : ''}`}
                  />
                </Field>
              </div>

              {/* ── Status + Priority + Devices ── */}
              <div className="grid grid-cols-3 gap-3">
                <Field label="Status">
                  <select {...register('status')} className={inputCls}>
                    {STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority" error={errors.priority?.message}>
                  <input
                    type="number"
                    min={1}
                    {...register('priority', {
                      required:     true,
                      min:          { value: 1, message: 'Min 1' },
                      valueAsNumber: true,
                    })}
                    className={`${inputCls} ${errors.priority ? 'border-red-500/50' : ''}`}
                  />
                </Field>
                <Field label="Devices">
                  <select {...register('devices')} className={inputCls}>
                    <option value="all">All</option>
                    <option value="mobile">Mobile only</option>
                    <option value="desktop">Desktop only</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* ─── Right: Placement Selection + Preview ───────────────────── */}
            <div className="space-y-4">

              {/* ── Placement Selection ── */}
              <Field
                label="Banner Locations (কোথায় কোথায় দেখাবে)"
                required
                hint="Platform অনুযায়ী available locations থেকে select করুন"
              >
                <Controller
                  name="placements"
                  control={control}
                  rules={{
                    validate: (val) => (val && val.length > 0) || 'কমপক্ষে একটি location select করুন',
                  }}
                  render={({ field }) => (
                    <div className="max-h-[320px] overflow-y-auto rounded-xl border border-[#2a2a3a] p-3 bg-[#0f0f17]">
                      <PlacementSelector
                        platform={watchedValues.platform}
                        selectedPlacements={field.value || []}
                        onChange={(val) => field.onChange(val)}
                      />
                    </div>
                  )}
                />
                {errors.placements && (
                  <p className="mt-1 text-[11px] text-red-400">{errors.placements.message}</p>
                )}
              </Field>

              {/* ── Live Preview ── */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Live preview
                </p>
                <div className="rounded-xl border border-[#1e1e2e] overflow-hidden bg-[#1a1a26]">
                  <div className="aspect-[16/7] relative bg-gradient-to-br from-[#1a1a26] to-[#0f0f17]">
                    {watchedValues.imageUrl ? (
                      <img
                        src={watchedValues.imageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-2">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs">Upload an image to preview</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-center">
                      <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold">
                        {watchedValues.subtitle || 'Subtitle'}
                      </p>
                      <h2 className="text-2xl font-bold text-white mt-1">
                        {watchedValues.title || 'Banner title'}
                      </h2>
                      {watchedValues.buttonText && (
                        <button
                          type="button"
                          className="mt-3 w-fit px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold pointer-events-none"
                        >
                          {watchedValues.buttonText} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info panel */}
                <div className="mt-3 rounded-xl border border-[#1e1e2e] p-4 space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Platform</span>
                    <span className="text-slate-200">
                      {PLATFORMS.find((p) => p.id === watchedValues.platform)?.name ?? '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Locations</span>
                    <span className="text-slate-200 text-right max-w-[200px]">
                      {watchedValues.placements?.length > 0
                        ? `${watchedValues.placements.length} location(s) selected`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schedule</span>
                    <span className="text-slate-200">
                      {watchedValues.startsAt || '—'} → {watchedValues.endsAt || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Link</span>
                    <span className="text-slate-200 truncate max-w-[180px]">
                      {watchedValues.linkType === 'none'
                        ? 'None'
                        : watchedValues.linkValue || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Image status</span>
                    <span className={watchedValues.imagePublicId ? 'text-emerald-400' : 'text-slate-500'}>
                      {watchedValues.imagePublicId
                        ? '✓ Uploaded to Cloudinary'
                        : watchedValues.imageUrl
                        ? '⟳ Uploading…'
                        : 'No image'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ────────────────────────────────────────────────────── */}
          <div className="px-6 py-4 border-t border-[#1e1e2e] flex items-center justify-end gap-2 sticky bottom-0 bg-[#0f0f17]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-[#2a2a3a] text-slate-400 hover:text-white text-sm transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-semibold transition-colors"
            >
              {isSaving && (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              )}
              {isEdit ? 'Save banner' : 'Create banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}