// 📁 src/components/admin/products/ProductVariantBuilder.jsx
'use client';
import { useState, useCallback, useMemo } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// সব attribute এর value combination তৈরি করো (Cartesian product)
function cartesian(arrays) {
  if (!arrays.length) return [];
  return arrays.reduce(
    (acc, curr) => acc.flatMap(a => curr.map(b => [...a, b])),
    [[]]
  );
}

// variant এর unique key বানাও (e.g. "color:red|size:m")
function variantKey(combo) {
  return combo.map(c => `${c.attrId}:${c.valueId}`).sort().join('|');
}

// variant এর display label (e.g. "Red / M")
function variantLabel(combo) {
  return combo.map(c => c.valueLabel).join(' / ');
}

// ─── Small components ─────────────────────────────────────────────────────────

const inputCls = 'h-8 w-full px-2.5 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition-colors';

function ColorDot({ hex }) {
  if (!hex?.startsWith('#')) return null;
  return (
    <span
      className="inline-block w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
      style={{ backgroundColor: hex }}
    />
  );
}

// ─── Step 1 — Attribute selector ──────────────────────────────────────────────
function AttributeSelector({ allAttributes, selectedAttrs, onChange }) {
  // শুধু isVariant:true attributes দেখাবো
  const variantAttrs = allAttributes.filter(a => a.isVariant && a.isActive);

  const toggle = (attr) => {
    const exists = selectedAttrs.find(a => a._id === attr._id);
    if (exists) {
      onChange(selectedAttrs.filter(a => a._id !== attr._id));
    } else {
      // সব active values নিয়ে add করো, সবগুলো initially selected
      onChange([...selectedAttrs, {
        ...attr,
        selectedValues: attr.values.filter(v => v.isActive).map(v => v._id),
      }]);
    }
  };

  const toggleValue = (attrId, valueId) => {
    onChange(selectedAttrs.map(a => {
      if (a._id !== attrId) return a;
      const already = a.selectedValues.includes(valueId);
      return {
        ...a,
        selectedValues: already
          ? a.selectedValues.filter(v => v !== valueId)
          : [...a.selectedValues, valueId],
      };
    }));
  };

  if (!variantAttrs.length) {
    return (
      <div className="px-4 py-8 text-center text-slate-500 text-sm">
        কোনো variant attribute নেই। Attributes page থেকে{' '}
        <span className="text-amber-400 font-medium">"Used for Variants"</span>{' '}
        চালু করো।
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {variantAttrs.map(attr => {
        const isSelected = !!selectedAttrs.find(a => a._id === attr._id);
        const selAttr    = selectedAttrs.find(a => a._id === attr._id);

        return (
          <div
            key={attr._id}
            className={`rounded-xl border transition-colors ${
              isSelected
                ? 'border-violet-500/30 bg-violet-500/[0.04]'
                : 'border-[#1e1e2e] bg-[#0d0d14]'
            }`}
          >
            {/* Attribute header */}
            <button
              type="button"
              onClick={() => toggle(attr)}
              className="w-full flex items-center gap-3 px-4 py-3"
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center border flex-shrink-0 transition-colors ${
                isSelected
                  ? 'bg-violet-600 border-violet-600'
                  : 'border-slate-600 bg-transparent'
              }`}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </div>
              <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                {attr.name}
              </span>
              <span className="text-xs text-slate-600 font-mono">/{attr.slug}</span>
              <span className="ml-auto text-xs text-slate-600">
                {attr.values.filter(v => v.isActive).length} values
              </span>
            </button>

            {/* Value chips (only when selected) */}
            {isSelected && (
              <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                {attr.values.filter(v => v.isActive).map(val => {
                  const checked = selAttr?.selectedValues.includes(val._id);
                  return (
                    <button
                      key={val._id}
                      type="button"
                      onClick={() => toggleValue(attr._id, val._id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                        checked
                          ? 'bg-violet-600 border-violet-500 text-white'
                          : 'border-[#1e1e2e] text-slate-500 hover:border-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {attr.type === 'color' && <ColorDot hex={val.value} />}
                      {val.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 2 — Variant table (generated combinations) ─────────────────────────
function VariantTable({ variants, onChange, basePrice }) {
  // সব row এ একসাথে price/stock set করার জন্য
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  const applyBulkPrice = () => {
    if (!bulkPrice) return;
    onChange(variants.map(v => ({ ...v, price: parseFloat(bulkPrice) || 0 })));
    setBulkPrice('');
  };
  const applyBulkStock = () => {
    if (!bulkStock) return;
    onChange(variants.map(v => ({ ...v, stock: parseInt(bulkStock) || 0 })));
    setBulkStock('');
  };

  const updateVariant = (key, field, value) => {
    onChange(variants.map(v =>
      v._key === key ? { ...v, [field]: value } : v
    ));
  };

  const toggleVariant = (key) => {
    onChange(variants.map(v =>
      v._key === key ? { ...v, isActive: !v.isActive } : v
    ));
  };

  if (!variants.length) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm">
        উপরে attribute ও value select করলে এখানে variants তৈরি হবে।
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* Bulk set bar */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] flex-wrap">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mr-1">
          Bulk Set →
        </span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder={`Price (base: ৳${basePrice || 0})`}
            value={bulkPrice}
            onChange={e => setBulkPrice(e.target.value)}
            className="h-7 w-36 px-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-xs text-white placeholder-slate-700 focus:outline-none focus:border-violet-500/50"
          />
          <button
            type="button"
            onClick={applyBulkPrice}
            disabled={!bulkPrice}
            className="h-7 px-2.5 rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white text-xs disabled:opacity-40 transition-colors"
          >
            Apply Price
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            placeholder="Stock"
            value={bulkStock}
            onChange={e => setBulkStock(e.target.value)}
            className="h-7 w-24 px-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-xs text-white placeholder-slate-700 focus:outline-none focus:border-violet-500/50"
          />
          <button
            type="button"
            onClick={applyBulkStock}
            disabled={!bulkStock}
            className="h-7 px-2.5 rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white text-xs disabled:opacity-40 transition-colors"
          >
            Apply Stock
          </button>
        </div>
        <span className="ml-auto text-xs text-slate-600">
          {variants.filter(v => v.isActive).length}/{variants.length} active
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#1e1e2e] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_110px_110px_120px_40px] gap-2 px-3 py-2 bg-[#0d0d14] border-b border-[#1e1e2e]">
          {['Variant', 'Attributes', 'SKU', 'Price (৳)', 'Stock', ''].map(h => (
            <span key={h} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#1e1e2e]">
          {variants.map(v => (
            <div
              key={v._key}
              className={`grid grid-cols-[1fr_auto_110px_110px_120px_40px] gap-2 items-center px-3 py-2.5 transition-colors ${
                v.isActive ? 'hover:bg-white/[0.02]' : 'opacity-40 bg-slate-900/20'
              }`}
            >
              {/* Label */}
              <div className="min-w-0">
                <span className="text-white text-sm font-medium">{v.label}</span>
              </div>

              {/* Attribute chips */}
              <div className="flex items-center gap-1 flex-wrap">
                {v.combo.map(c => (
                  <span
                    key={c.attrId}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-400"
                  >
                    {c.attrType === 'color' && <ColorDot hex={c.valueHex} />}
                    <span className="text-slate-500 text-[9px]">{c.attrName}:</span>
                    {c.valueLabel}
                  </span>
                ))}
              </div>

              {/* SKU */}
              <input
                type="text"
                placeholder="SKU-001"
                value={v.sku || ''}
                onChange={e => updateVariant(v._key, 'sku', e.target.value)}
                className={inputCls}
              />

              {/* Price */}
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={basePrice || '0'}
                value={v.price === undefined ? '' : v.price}
                onChange={e => updateVariant(v._key, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={inputCls}
              />

              {/* Stock */}
              <input
                type="number"
                min="0"
                placeholder="0"
                value={v.stock === undefined ? '' : v.stock}
                onChange={e => updateVariant(v._key, 'stock', e.target.value ? parseInt(e.target.value) : 0)}
                className={inputCls}
              />

              {/* Toggle active */}
              <button
                type="button"
                onClick={() => toggleVariant(v._key)}
                title={v.isActive ? 'Disable variant' : 'Enable variant'}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                  v.isActive
                    ? 'border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                    : 'border-slate-700 text-slate-600 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
                }`}
              >
                {v.isActive ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductVariantBuilder({
  allAttributes = [],    // API থেকে আনা সব attributes (isVariant:true গুলো ব্যবহার হবে)
  value = [],            // বাইরে থেকে controlled value (variants array)
  onChange,              // (variants) => void
  basePrice = 0,
  existingVariants = [], // edit mode এ আগের variants (DB থেকে)
}) {
  // ── Selected attributes state (Step 1) ────────────────────────────────────
  const [selectedAttrs, setSelectedAttrs] = useState(() => {
    // edit mode এ: existing variants থেকে কোন attributes ছিল সেটা reconstruct করো
    if (!existingVariants.length) return [];
    const attrMap = {};
    existingVariants.forEach(v => {
      v.attributes?.forEach(a => {
        if (!attrMap[a.attributeId]) {
          attrMap[a.attributeId] = new Set();
        }
        attrMap[a.attributeId].add(a.valueId);
      });
    });
    return Object.entries(attrMap).map(([attrId, valueIds]) => {
      const attr = allAttributes.find(a => a._id === attrId);
      if (!attr) return null;
      return { ...attr, selectedValues: [...valueIds] };
    }).filter(Boolean);
  });

  // ── Generate variants from selected attributes ────────────────────────────
  const generatedVariants = useMemo(() => {
    const activeAttrs = selectedAttrs.filter(a => a.selectedValues.length > 0);
    if (!activeAttrs.length) return [];

    // প্রতিটা attribute এর selected values থেকে combo items বানাও
    const comboParts = activeAttrs.map(attr =>
      attr.selectedValues.map(valueId => {
        const valObj = attr.values.find(v => v._id === valueId);
        return {
          attrId:     attr._id,
          attrName:   attr.name,
          attrType:   attr.type,
          valueId,
          valueLabel: valObj?.label || valueId,
          valueHex:   attr.type === 'color' ? valObj?.value : undefined,
        };
      })
    );

    // Cartesian product → সব combinations
    return cartesian(comboParts).map(combo => {
      const key   = variantKey(combo);
      const label = variantLabel(combo);

      // existing variant match করো (edit mode এ price/stock preserve করতে)
      const existing = existingVariants.find(ev => {
        if (!ev.attributes?.length) return false;
        const evKey = variantKey(
          ev.attributes.map(a => ({ attrId: a.attributeId, valueId: a.valueId }))
        );
        return evKey === key;
      });

      // controlled value থেকেও match করো
      const controlled = value.find(v => v._key === key);

      return {
        _key:       key,
        _id:        existing?._id || controlled?._id || undefined,
        label,
        combo,
        sku:        controlled?.sku        ?? existing?.sku        ?? '',
        price:      controlled?.price      ?? existing?.price      ?? undefined,
        stock:      controlled?.stock      ?? existing?.stock      ?? 0,
        isActive:   controlled?.isActive   ?? existing?.isActive   ?? true,
        attributes: combo.map(c => ({
          attributeId:   c.attrId,
          attributeName: c.attrName,
          valueId:       c.valueId,
          valueLabel:    c.valueLabel,
          ...(c.valueHex && { valueHex: c.valueHex }),
        })),
      };
    });
  }, [selectedAttrs, existingVariants, value]);

  // parent কে update করো যখন variants generate হয়
  const handleVariantsChange = useCallback((updated) => {
    onChange?.(updated);
  }, [onChange]);

  // selectedAttrs বদলালে নতুন variants generate করো
  const handleAttrsChange = useCallback((attrs) => {
    setSelectedAttrs(attrs);
    // নতুন generation হবে useMemo এ, parent কে জানাবো
    // (effect এর বদলে এটা সরাসরি এরপরই re-render এ হবে)
  }, []);

  // generated variants যখন বদলায়, controlled onChange এ পাঠাও
  useMemo(() => {
    onChange?.(generatedVariants);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAttrs]);

  const [step, setStep] = useState(0); // 0 = attribute select, 1 = variant table

  const hasAttrs     = selectedAttrs.length > 0;
  const hasVariants  = generatedVariants.length > 0;

  return (
    <div className="space-y-4">

      {/* Step tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] w-fit">
        <button
          type="button"
          onClick={() => setStep(0)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            step === 0
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">1</span>
          Attributes
        </button>
        <button
          type="button"
          onClick={() => hasVariants && setStep(1)}
          disabled={!hasVariants}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${
            step === 1
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">2</span>
          Variants
          {hasVariants && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold">
              {generatedVariants.length}
            </span>
          )}
        </button>
      </div>

      {/* Step content */}
      {step === 0 && (
        <div className="space-y-3">
          <AttributeSelector
            allAttributes={allAttributes}
            selectedAttrs={selectedAttrs}
            onChange={handleAttrsChange}
          />
          {hasVariants && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
            >
              Next: Configure {generatedVariants.length} Variants →
            </button>
          )}
        </div>
      )}

      {step === 1 && (
        <VariantTable
          variants={generatedVariants}
          onChange={handleVariantsChange}
          basePrice={basePrice}
        />
      )}
    </div>
  );
}