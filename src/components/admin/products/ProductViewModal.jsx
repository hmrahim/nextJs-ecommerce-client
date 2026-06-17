'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAdminProductById } from '@/hooks/useProducts';

const STATUS_CONFIG = {
  active:   { label: 'Active',   cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  draft:    { label: 'Draft',    cls: 'bg-slate-500/10  text-slate-400  border-slate-500/20'  },
  archived: { label: 'Archived', cls: 'bg-gray-500/10   text-gray-400   border-gray-500/20'   },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function ImageSlider({ images = [] }) {
  const [current, setCurrent] = useState(0);

  const validImages = images.filter(img => img?.url || typeof img === 'string');

  if (validImages.length === 0) {
    return (
      <div className="aspect-square w-full rounded-xl bg-[#1e1e2e] flex items-center justify-center">
        <svg className="w-16 h-16 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const prev = () => setCurrent(i => (i === 0 ? validImages.length - 1 : i - 1));
  const next = () => setCurrent(i => (i === validImages.length - 1 ? 0 : i + 1));
  const src = validImages[current]?.url || validImages[current];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#1e1e2e] group">
        <img src={src} alt={`Product image ${current + 1}`} className="w-full h-full object-cover" />

        {validImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs">
              {current + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((img, i) => {
            const thumbSrc = img?.url || img;
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === current ? 'border-violet-500' : 'border-[#1e1e2e] hover:border-slate-500'
                }`}
              >
                <img src={thumbSrc} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VariantsSection({ variants = [] }) {
  if (!variants.length) return null;

  // Group by attributeName, deduplicate by valueId
  const groups = variants.reduce((acc, variant) => {
    variant.attributes?.forEach(attr => {
      if (!acc[attr.attributeName]) acc[attr.attributeName] = [];
      if (!acc[attr.attributeName].find(v => v.valueId === attr.valueId)) {
        acc[attr.attributeName].push({
          valueId:    attr.valueId,
          valueLabel: attr.valueLabel,
          valueData:  attr.valueData,
          price:      variant.price,
          stock:      variant.stock,
          isActive:   variant.isActive,
        });
      }
    });
    return acc;
  }, {});

  const isHex = val => val && /^#[0-9a-fA-F]{3,6}$/.test(val.trim());

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] p-4 space-y-4">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Variants</h4>
      {Object.entries(groups).map(([attrName, values]) => (
        <div key={attrName}>
          <p className="text-xs text-slate-400 font-medium mb-2">{attrName}</p>
          <div className="flex flex-wrap gap-2">
            {values.map(v =>
              isHex(v.valueData) ? (
                <div key={v.valueId} className="flex flex-col items-center gap-1">
                  <div
                    className="w-9 h-9 rounded-full border-2 border-[#2a2a3a] hover:border-violet-500 transition-colors"
                    style={{ backgroundColor: v.valueData }}
                    title={v.valueLabel}
                  />
                  <span className="text-[10px] text-slate-400 leading-none">{v.valueLabel}</span>
                  <span className="text-[10px] text-slate-300 font-semibold leading-none">SAR {v.price}</span>
                </div>
              ) : (
                <div
                  key={v.valueId}
                  className="flex flex-col items-center justify-center px-3 py-2 rounded-lg border border-[#2a2a3a] bg-[#1a1a24] hover:border-violet-500/50 transition-colors min-w-[64px]"
                >
                  <span className="text-xs text-slate-200 font-medium">{v.valueLabel}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">SAR {v.price}</span>
                  {!v.isActive && <span className="text-[9px] text-red-400 mt-0.5">Inactive</span>}
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[#1e1e2e] last:border-0">
      <span className="text-xs text-slate-500 shrink-0 w-28">{label}</span>
      <span className="text-sm text-slate-200 text-right">{children}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] p-4">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</h4>
      {children}
    </div>
  );
}

export default function ProductViewModal({ product: listProduct, onClose, onToggleStatus, onEdit }) {
  if (!listProduct) return null;

  // list data In variants is not there — full data fetch Do
  const { data: fullProduct, isLoading } = useAdminProductById(listProduct._id);
  const product = fullProduct ?? listProduct;

  const isActive = product.status === 'active';
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  const handleToggle = () => onToggleStatus?.(product._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e] flex-shrink-0">
          <div className="flex items-center gap-3">
            <StatusBadge status={product.status} />
            <span className="text-xs text-slate-500 font-mono">{product.sku}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Active / Deactive Toggle */}
            <button
              onClick={handleToggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isActive
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {isActive ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Deactivate
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Activate
                </>
              )}
            </button>

            {/* Edit button */}
            <Link
              href={`/dashboard/products/${product._id}`}
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 text-xs font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {isLoading && (
            <div className="flex items-center justify-center py-6 gap-2 text-slate-500 text-sm">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading details…
            </div>
          )}
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Left — Image Slider + Variants */}
            <div className="space-y-4">
              <ImageSlider images={product.images} />
              {product.variants?.length > 0 && (
                <VariantsSection variants={product.variants} />
              )}
            </div>

            {/* Right — Core Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">{product.name}</h2>
                {product.shortDescription && (
                  <p className="text-sm text-slate-400 mt-1">{product.shortDescription}</p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-white">
                  SAR {product.price?.toLocaleString()}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <>
                    <span className="text-sm text-slate-500 line-through">
                      SAR {product.comparePrice?.toLocaleString()}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Stock', value: product.stock, color: product.stock === 0 ? 'text-red-400' : product.stock <= 5 ? 'text-amber-400' : 'text-emerald-400' },
                  { label: 'Sales', value: product.sold ?? 0, color: 'text-violet-400' },
                  { label: 'Rating', value: product.avgRating ? `${product.avgRating}★` : '—', color: 'text-yellow-400' },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-[#1a1a24] border border-[#1e1e2e] p-3 text-center">
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Details */}
              <Section title="Details">
                <InfoRow label="Category">{product.category?.name ?? '—'}</InfoRow>
                {product.subCategory && <InfoRow label="Sub Category">{product.subCategory?.name}</InfoRow>}
                {product.brand && <InfoRow label="Brand">{product.brand?.name}</InfoRow>}
                <InfoRow label="Cost">{product.cost ? `SAR ${product.cost}` : '—'}</InfoRow>
                <InfoRow label="Weight">{product.weight ? `${product.weight} kg` : '—'}</InfoRow>
                {(product.dimensions?.length || product.dimensions?.width || product.dimensions?.height) && (
                  <InfoRow label="Dimensions">
                    {[product.dimensions.length, product.dimensions.width, product.dimensions.height]
                      .filter(Boolean).join(' × ')} cm
                  </InfoRow>
                )}
                <InfoRow label="Track Inventory">{product.trackInventory ? 'Yes' : 'No'}</InfoRow>
                <InfoRow label="Featured">{product.featured ? 'Yes' : 'No'}</InfoRow>
              </Section>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-[#1e1e2e] text-slate-400 text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="px-5 pb-5">
              <Section title="Description">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </Section>
            </div>
          )}

          {/* Discounts */}
          {product.discounts?.length > 0 && (
            <div className="px-5 pb-5">
              <Section title="Quantity Discounts">
                <div className="space-y-1.5">
                  {product.discounts.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Buy {d.minQty}+ units</span>
                      <span className="text-emerald-400 font-medium">
                        {d.type === 'percent' ? `${d.discount}% off` : `SAR ${d.discount} off`}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}