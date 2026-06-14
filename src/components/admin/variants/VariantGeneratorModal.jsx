
'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';

import { productService }  from '@/services/productService';
import { variantService }  from '@/services/Variantservice';

// ── Attribute Set Row ──────────────────────────────────────────────────────────
function AttributeSetRow({ attr, selectedValues, onChange }) {
  const activeValues = (attr.values || []).filter(v => v.isActive);

  const toggleValue = (val) => {
    const exists = selectedValues.some(v => v.valueId === val._id);
    if (exists) onChange(selectedValues.filter(v => v.valueId !== val._id));
    else onChange([
      ...selectedValues,
      {
        valueId:    val._id,
        valueLabel: val.label,
        // valueData: hex for color, actual value for others — fallback chain
        valueData:  val.valueData ?? val.value ?? val.hex ?? '',
      },
    ]);
  };

  const selectAll = () => onChange(
    activeValues.map(v => ({
      valueId:    v._id,
      valueLabel: v.label,
      valueData:  v.valueData ?? v.value ?? v.hex ?? '',
    }))
  );
  const clearAll = () => onChange([]);

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{attr.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono">
            {attr.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={selectAll} className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors">All</button>
          <span className="text-slate-700">·</span>
          <button onClick={clearAll}  className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">Clear</button>
          <span className="text-xs text-slate-500 ml-1">{selectedValues.length}/{activeValues.length}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {activeValues.map(val => {
          const selected  = selectedValues.some(v => v.valueId === val._id);
          // color value এর hex — backend schema অনুযায়ী সব fallback চেষ্টা করো
          const colorHex  = val.valueData ?? val.value ?? val.hex ?? null;
          const isColor   = attr.type === 'color' && colorHex && colorHex.startsWith('#');
          return (
            <button
              key={val._id}
              onClick={() => toggleValue(val)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                selected
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                  : 'border-[#2a2a3e] bg-[#16161f] text-slate-400 hover:border-slate-500'
              }`}
            >
              {isColor && (
                <span
                  className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                  style={{ backgroundColor: colorHex }}
                />
              )}
              {val.label}
              {selected && <span className="text-amber-400 text-[10px]">✓</span>}
            </button>
          );
        })}
        {activeValues.length === 0 && (
          <p className="text-xs text-slate-600 italic">No active values</p>
        )}
      </div>
    </div>
  );
}

// ── Helper: cartesian product ──────────────────────────────────────────────────
// activeSets: array of attribute objects (each has ._id, .name, .slug)
// selections: { [attrId]: [{ valueId, valueLabel, valueData }] }
function buildCartesian(activeSets, selections) {
  if (!activeSets.length) return [];

  return activeSets.reduce((acc, attr) => {
    const vals = selections[attr._id] || [];
    if (!vals.length) return acc; // shouldn't happen since activeSets is pre-filtered
    return acc.flatMap(combo =>
      vals.map(val => [
        ...combo,
        {
          attributeId:   attr._id,
          attributeName: attr.name,
          attributeSlug: attr.slug,
          valueId:       val.valueId,
          valueLabel:    val.valueLabel,
          valueData:     val.valueData || '',
        },
      ])
    );
  }, [[]]);
}

function buildTitle(combo) {
  return combo.map(a => a.valueLabel).join(' / ');
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function VariantGeneratorModal({ attributes = [], onClose, onSuccess }) {
  const [step, setStep]         = useState(1);
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Only variant-type attributes
  const variantAttrs = attributes.filter(a => a.isVariant && a.isActive);

  const [selections, setSelections] = useState(() =>
    Object.fromEntries(variantAttrs.map(a => [a._id, []]))
  );

  // ── Pricing mode ────────────────────────────────────────────────────────────
  const [pricingMode, setPricingMode] = useState('same');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [defaultStock, setDefaultStock] = useState('');
  const [variantPrices, setVariantPrices] = useState({});

  const [generating, setGenerating] = useState(false);
  const [result, setResult]         = useState(null);

  // ── Debounced product search ─────────────────────────────────────────────────
  const debounceRef = useRef(null);
  useEffect(() => {
    if (step !== 1) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoadingProducts(true);
      const params = { limit: 50 };
      if (productSearch.trim()) params.search = productSearch.trim();
      productService.adminGetAll(params)
        .then(r => {
          const list = r.data?.results || r.data?.products || r.data?.data || [];
          setProducts(list);
        })
        .catch(() => setProducts([]))
        .finally(() => setLoadingProducts(false));
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [step, productSearch]);

  // ── Combinations ─────────────────────────────────────────────────────────────
  // activeSets = attributes যেগুলোতে কমপক্ষে ১টা value select করা হয়েছে
  const activeSets = variantAttrs.filter(a => (selections[a._id]?.length || 0) > 0);
  const combinations = useMemo(
    () => buildCartesian(activeSets, selections),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(activeSets.map(a => a._id)), JSON.stringify(selections)]
  );
  const totalCombinations = combinations.length;

  // Seed individual prices when combinations change
  useEffect(() => {
    if (pricingMode !== 'individual') return;
    setVariantPrices(prev => {
      const next = {};
      combinations.forEach(combo => {
        const title = buildTitle(combo);
        next[title] = prev[title] !== undefined ? prev[title] : (defaultPrice || '');
      });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinations, pricingMode]);

  const handlePricingModeChange = (mode) => {
    setPricingMode(mode);
    if (mode === 'individual') {
      const next = {};
      combinations.forEach(combo => {
        const title = buildTitle(combo);
        next[title] = defaultPrice || '';
      });
      setVariantPrices(next);
    }
  };

  const fillAllPrices = () => {
    const next = {};
    combinations.forEach(combo => { next[buildTitle(combo)] = defaultPrice || ''; });
    setVariantPrices(next);
  };

  const allPricesFilled = pricingMode === 'same'
    ? defaultPrice !== ''
    : combinations.every(c => (variantPrices[buildTitle(c)] || '') !== '');

  const canGenerate = selectedProduct && activeSets.length > 0 && allPricesFilled;

  // ── Generate ─────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);

    // attributeSets: প্রতিটা active attribute এর selected values পাঠাও
    const attributeSets = activeSets.map(attr => ({
      attributeId:   attr._id,
      attributeName: attr.name,
      attributeSlug: attr.slug,
      values:        selections[attr._id].map(v => ({
        valueId:    v.valueId,
        valueLabel: v.valueLabel,
        valueData:  v.valueData || '',
      })),
    }));

    const payload = {
      attributeSets,
      defaultPrice: pricingMode === 'same' ? parseFloat(defaultPrice) : 0,
      defaultStock: parseInt(defaultStock) || 0,
      ...(pricingMode === 'individual' && {
        variantPrices: Object.fromEntries(
          Object.entries(variantPrices).map(([k, v]) => [k, parseFloat(v) || 0])
        ),
      }),
    };

    try {
      const res = await variantService.adminBulkGenerate(selectedProduct._id, payload);
      setResult(res.data?.data || res.data);
      setStep(3);
      toast.success(`✅ ${res.data?.data?.created || 0} variants generated!`);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate variants');
    } finally {
      setGenerating(false);
    }
  };

  // ── Preview: combination list preview ────────────────────────────────────────
  const PreviewList = () => {
    if (!totalCombinations) return null;
    const preview = combinations.slice(0, 12);
    return (
      <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-3 space-y-1.5">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Preview combinations</p>
        <div className="flex flex-wrap gap-1.5">
          {preview.map((combo, i) => {
            const title = buildTitle(combo);
            // color dot থেকে প্রথম color attribute
            const colorAttr = combo.find(a => a.attributeSlug === 'color');
            return (
              <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#16161f] border border-[#1e1e2e] text-xs text-slate-300">
                {colorAttr?.valueData && colorAttr.valueData.startsWith('#') && (
                  <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: colorAttr.valueData }} />
                )}
                {title}
              </span>
            );
          })}
          {totalCombinations > 12 && (
            <span className="px-2 py-1 rounded-lg bg-[#16161f] border border-[#1e1e2e] text-xs text-slate-500">
              +{totalCombinations - 12} more
            </span>
          )}
        </div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e]">
          <div>
            <h2 className="text-base font-bold text-white">Generate Product Variants</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Color × Size → Red/S, Red/M, Green/S… সব combinations auto-তৈরি
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-[#1e1e2e]">
          {[{ n:1, label:'Product' },{ n:2, label:'Configure' },{ n:3, label:'Done' }].map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-medium ${step >= s.n ? 'text-amber-400' : 'text-slate-600'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                  step > s.n  ? 'bg-amber-500 border-amber-500 text-black' :
                  step === s.n ? 'border-amber-500 text-amber-400' :
                                 'border-slate-700 text-slate-600'
                }`}>
                  {step > s.n ? '✓' : s.n}
                </span>
                {s.label}
              </div>
              {i < arr.length - 1 && <div className="w-8 h-px bg-[#1e1e2e]"/>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Step 1: Product Selection ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">কোন product এ variants add করবে?</p>
              <input
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Product name search..."
                className="w-full px-3 py-2 rounded-xl border border-[#1e1e2e] bg-[#0f0f17] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {loadingProducts && (
                  <div className="text-center py-8 text-slate-500 text-sm">Loading products…</div>
                )}
                {!loadingProducts && products.length === 0 && (
                  <div className="text-center py-8 text-slate-600 text-sm">No products found</div>
                )}
                {products.map(p => {
                  const imgUrl = p.images?.[0]?.url || p.images?.[0];
                  return (
                    <button
                      key={p._id}
                      onClick={() => setSelectedProduct(p)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        selectedProduct?._id === p._id
                          ? 'border-amber-500/50 bg-amber-500/5 text-white'
                          : 'border-[#1e1e2e] bg-[#0f0f17] text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {imgUrl ? (
                        <img src={imgUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-white/5"/>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">SKU: {p.sku || '—'} · ৳{p.price || p.basePrice || 0}</p>
                      </div>
                      {selectedProduct?._id === p._id && <span className="text-amber-400 text-sm">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 2: Attribute Configuration ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{selectedProduct?.name}</p>
                  <p className="text-xs text-slate-500">প্রতিটি attribute combination এ একটা variant হবে</p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-amber-400 transition-colors">Change</button>
              </div>

              {/* ── Info box: how combinations work ── */}
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-blue-300 flex gap-2">
                <span className="text-blue-400 flex-shrink-0">ℹ️</span>
                <span>
                  সব attribute থেকে values select করো। উদাহরণ: Color (Red, Green) + Size (S, M, L)
                  {' '}= <strong>6টা</strong> combination (Red/S, Red/M, Red/L, Green/S, Green/M, Green/L)
                </span>
              </div>

              {variantAttrs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  কোনো isVariant=true attribute নেই। Attribute তৈরি করুন আগে।
                </div>
              ) : (
                <>
                  {variantAttrs.map(attr => (
                    <AttributeSetRow
                      key={attr._id}
                      attr={attr}
                      selectedValues={selections[attr._id] || []}
                      onChange={vals => setSelections(prev => ({ ...prev, [attr._id]: vals }))}
                    />
                  ))}

                  {/* ── Combination preview ── */}
                  {totalCombinations > 0 && <PreviewList />}

                  {/* ── Stock field ── */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Default Stock (সব variant এর জন্য)</label>
                    <input
                      type="number" min="0" value={defaultStock}
                      onChange={e => setDefaultStock(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>

                  {/* ── Pricing mode toggle ── */}
                  <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-300">Pricing Mode</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePricingModeChange('same')}
                        className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                          pricingMode === 'same'
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                            : 'border-[#2a2a3e] bg-[#16161f] text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        🏷️ সব variant এক দামে
                      </button>
                      <button
                        onClick={() => handlePricingModeChange('individual')}
                        className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                          pricingMode === 'individual'
                            ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                            : 'border-[#2a2a3e] bg-[#16161f] text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        🔖 প্রতিটা variant আলাদা দাম
                      </button>
                    </div>

                    {pricingMode === 'same' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">
                          Price <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number" min="0" value={defaultPrice}
                          onChange={e => setDefaultPrice(e.target.value)}
                          placeholder="e.g. 500"
                          className="w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                        />
                      </div>
                    )}

                    {pricingMode === 'individual' && totalCombinations > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number" min="0" value={defaultPrice}
                            onChange={e => setDefaultPrice(e.target.value)}
                            placeholder="Base price..."
                            className="flex-1 h-8 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-xs text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                          />
                          <button
                            onClick={fillAllPrices}
                            className="px-3 h-8 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-colors whitespace-nowrap"
                          >
                            সবগুলোতে দাও
                          </button>
                        </div>

                        <div className="rounded-lg border border-[#1e1e2e] overflow-hidden max-h-52 overflow-y-auto">
                          {combinations.map((combo, i) => {
                            const title = buildTitle(combo);
                            const colorAttr = combo.find(a => a.attributeSlug === 'color');
                            return (
                              <div
                                key={title}
                                className={`flex items-center gap-3 px-3 py-2 ${i % 2 === 0 ? 'bg-[#0a0a0f]' : 'bg-[#0f0f17]'}`}
                              >
                                {colorAttr?.valueData && colorAttr.valueData.startsWith('#') && (
                                  <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: colorAttr.valueData }} />
                                )}
                                <span className="flex-1 text-xs text-slate-300 font-medium">{title}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-slate-500">৳</span>
                                  <input
                                    type="number" min="0"
                                    value={variantPrices[title] ?? ''}
                                    onChange={e => setVariantPrices(prev => ({ ...prev, [title]: e.target.value }))}
                                    placeholder="0"
                                    className="w-24 h-7 px-2 rounded border border-[#2a2a3e] bg-[#16161f] text-xs text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {!allPricesFilled && (
                          <p className="text-[10px] text-amber-500">⚠️ সব variant এর price দাও</p>
                        )}
                      </div>
                    )}

                    {pricingMode === 'individual' && totalCombinations === 0 && (
                      <p className="text-xs text-slate-600 italic">আগে attribute values select করো।</p>
                    )}
                  </div>

                  {totalCombinations > 0 && (
                    <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-center">
                      <span className="text-violet-400 font-bold text-lg">{totalCombinations}</span>
                      <span className="text-slate-400 text-sm ml-2">টি variant তৈরি হবে</span>
                      <p className="text-[10px] text-slate-600 mt-1">
                        {activeSets.map(a => `${a.name}(${selections[a._id].length})`).join(' × ')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {step === 3 && result && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg">{result.created} Variants Created!</p>
                <p className="text-slate-400 text-sm mt-1">{selectedProduct?.name} এ auto-add হয়ে গেছে</p>
                {result.skipped > 0 && (
                  <p className="text-amber-400 text-xs mt-1">{result.skipped}টি ইতিমধ্যে ছিল, skip করা হয়েছে</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {[
                  { label: 'Created', value: result.created, color: 'text-emerald-400' },
                  { label: 'Skipped', value: result.skipped, color: 'text-amber-400' },
                  { label: 'Total',   value: result.total,   color: 'text-white' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] p-3">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1e1e2e]">
          <button
            onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
            disabled={generating || step === 3}
            className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 hover:text-slate-200 hover:border-slate-600 text-sm transition-colors disabled:opacity-40"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              disabled={!selectedProduct}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next → Configure
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || generating}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Generating…</>
              ) : (
                <>⚡ Generate {totalCombinations > 0 ? totalCombinations : ''} Variants</>
              )}
            </button>
          )}

          {step === 3 && (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
            >
              Done ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}