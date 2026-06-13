// 📁 PATH: src/components/admin/variants/VariantGeneratorModal.jsx
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
    else onChange([...selectedValues, { valueId: val._id, valueLabel: val.label, valueData: val.valueData || val.value || '' }]);
  };

  const selectAll = () => onChange(activeValues.map(v => ({ valueId: v._id, valueLabel: v.label, valueData: v.valueData || v.value || '' })));
  const clearAll  = () => onChange([]);

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{attr.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono">{attr.type}</span>
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
          const selected = selectedValues.some(v => v.valueId === val._id);
          const colorVal = val.valueData || val.value;
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
              {attr.type === 'color' && colorVal && (
                <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: colorVal }} />
              )}
              {val.label}
              {selected && <span className="text-amber-400">✓</span>}
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
function buildCartesian(activeSets, selections) {
  if (!activeSets.length) return [];
  return activeSets.reduce((acc, attr) =>
    acc.flatMap(combo =>
      selections[attr._id].map(val => [
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
    ), [[]]);
}

function buildTitle(combo) {
  return combo.map(a => a.valueLabel).join(' / ');
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function VariantGeneratorModal({ attributes = [], onClose }) {
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
  // 'same'       → সব variant এর একই price
  // 'individual' → প্রতিটা variant এর আলাদা price
  const [pricingMode, setPricingMode] = useState('same');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [defaultStock, setDefaultStock] = useState('');

  // per-variant prices: { [variantTitle]: string }
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

  // ── Counts & combinations ────────────────────────────────────────────────────
  const activeSets = variantAttrs.filter(a => (selections[a._id]?.length || 0) > 0);
  const combinations = useMemo(() => buildCartesian(activeSets, selections), [activeSets, selections]);
  const totalCombinations = combinations.length;

  // When combinations change & mode is individual → seed prices from defaultPrice
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
  }, [combinations, pricingMode]);

  // When switching to individual mode → seed all from defaultPrice
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

  // Fill all individual prices with defaultPrice at once
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

    const attributeSets = activeSets.map(attr => ({
      attributeId:   attr._id,
      attributeName: attr.name,
      attributeSlug: attr.slug,
      values:        selections[attr._id],
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate variants');
    } finally {
      setGenerating(false);
    }
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
              Attribute combinations থেকে variants তৈরি করো
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
                  <p className="text-xs text-slate-500">প্রতিটি combination এ একটা variant হবে</p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-amber-400 transition-colors">Change</button>
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

                    {/* Same price input */}
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
                        <p className="text-[10px] text-slate-600 mt-1">পরে প্রতিটা variant এ আলাদা করা যাবে</p>
                      </div>
                    )}

                    {/* Individual price table */}
                    {pricingMode === 'individual' && totalCombinations > 0 && (
                      <div className="space-y-2">
                        {/* Quick fill */}
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
                        <p className="text-[10px] text-slate-600">উপরের দাম দিয়ে সবগুলো fill করো, তারপর আলাদা করে edit করো।</p>

                        {/* Per-variant price rows */}
                        <div className="rounded-lg border border-[#1e1e2e] overflow-hidden max-h-52 overflow-y-auto">
                          {combinations.map((combo, i) => {
                            const title = buildTitle(combo);
                            return (
                              <div
                                key={title}
                                className={`flex items-center gap-3 px-3 py-2 ${i % 2 === 0 ? 'bg-[#0a0a0f]' : 'bg-[#0f0f17]'}`}
                              >
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
