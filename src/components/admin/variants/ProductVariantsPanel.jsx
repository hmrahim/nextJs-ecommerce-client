// 📁 PATH: src/components/admin/variants/ProductVariantsPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Product create/edit page in this panel add Do।
// Product save after being productId If available, it will show this।
// Variants inline edit + delete can be done।
// ─────────────────────────────────────────────────────────────────────────────
'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { variantService } from '@/services/Variantservice';

// ── Stock badge ────────────────────────────────────────────────────────────────
function StockBadge({ stock }) {
  if (stock === 0)  return <span className="text-xs font-semibold text-red-400">Out of Stock</span>;
  if (stock <= 5)   return <span className="text-xs font-semibold text-amber-400">{stock} left</span>;
  return <span className="text-xs font-semibold text-emerald-400">{stock} in stock</span>;
}

// ── Inline editable cell ───────────────────────────────────────────────────────
function EditableCell({ value, type = 'number', onSave, prefix }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value);

  const commit = () => {
    setEditing(false);
    if (String(val) !== String(value)) onSave(type === 'number' ? Number(val) : val);
  };

  if (editing) return (
    <input
      autoFocus
      type={type}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(value); setEditing(false); } }}
      className="w-20 px-1.5 py-0.5 rounded border border-amber-500/50 bg-[#0a0a0f] text-white text-xs focus:outline-none"
    />
  );

  return (
    <button onClick={() => setEditing(true)} className="text-sm text-white hover:text-amber-300 transition-colors group flex items-center gap-1">
      {prefix}{val}
      <svg className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
      </svg>
    </button>
  );
}

// ── Attribute pills ────────────────────────────────────────────────────────────
function AttributePills({ attributes = [] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {attributes.map((a, i) => (
        <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#2a2a3e] bg-[#16161f] text-xs text-slate-300">
          {a.attributeSlug === 'color' && a.valueData && (
            <span className="w-2.5 h-2.5 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: a.valueData }}/>
          )}
          <span className="text-slate-500 text-[10px]">{a.attributeName}:</span>
          {a.valueLabel}
        </span>
      ))}
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────────
export default function ProductVariantsPanel({ productId }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState([]);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await variantService.adminGetAll(productId);
      setVariants(res.data?.data || []);
    } catch {
      toast.error('Failed to load variants');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  // ── Update helper ──────────────────────────────────────────────────────────
  const updateVariant = async (variantId, fields) => {
    try {
      const res = await variantService.adminUpdate(productId, variantId, fields);
      setVariants(prev => prev.map(v => v._id === variantId ? res.data.data : v));
    } catch {
      toast.error('Update failed');
    }
  };

  // ── Toggle ─────────────────────────────────────────────────────────────────
  const toggleVariant = async (variantId) => {
    try {
      const res = await variantService.adminToggle(productId, variantId);
      setVariants(prev => prev.map(v => v._id === variantId ? res.data.data : v));
    } catch {
      toast.error('Toggle failed');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteVariant = async (variantId) => {
    if (!confirm('Delete this variant?')) return;
    try {
      await variantService.adminDelete(productId, variantId);
      setVariants(prev => prev.filter(v => v._id !== variantId));
      toast.success('Variant deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const deleteAll = async () => {
    if (!confirm(`Delete all ${variants.length} variants? Cannot be undone.`)) return;
    try {
      await variantService.adminDeleteAll(productId);
      setVariants([]);
      setSelected([]);
      toast.success('All variants deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const deleteSelected = async () => {
    if (!confirm(`Delete ${selected.length} selected variants?`)) return;
    await Promise.all(selected.map(id => variantService.adminDelete(productId, id)));
    setVariants(prev => prev.filter(v => !selected.includes(v._id)));
    setSelected([]);
    toast.success(`${selected.length} variants deleted`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!productId) return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#0f0f17] p-6 text-center">
      <p className="text-sm text-slate-500">Product save After doing, here variants will show and manage can be done।</p>
    </div>
  );

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#0f0f17] overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Product Variants</h3>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
            {variants.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button onClick={deleteSelected} className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg border border-red-500/20 hover:bg-red-500/10">
              Delete {selected.length}
            </button>
          )}
          {variants.length > 0 && (
            <button onClick={deleteAll} className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg border border-[#1e1e2e] hover:border-red-500/20">
              Clear All
            </button>
          )}
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors" title="Refresh">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-500 text-sm">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading variants…
        </div>
      ) : variants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-600">
          <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h8m-8 4h8"/>
          </svg>
          <p className="text-sm">any variant isn't।</p>
          <p className="text-xs text-slate-700">Attributes page from "Generate Variants" Do।</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="px-4 py-2.5 w-8">
                  <input type="checkbox"
                    checked={selected.length === variants.length && variants.length > 0}
                    onChange={() => setSelected(selected.length === variants.length ? [] : variants.map(v => v._id))}
                    className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-amber-500"
                  />
                </th>
                {['Variant','Attributes','Price','Stock','SKU','Status',''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2e]">
              {variants.map(v => (
                <tr key={v._id} className={`group hover:bg-white/[0.02] transition-colors ${!v.isActive ? 'opacity-50' : ''} ${selected.includes(v._id) ? 'bg-amber-500/[0.03]' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox"
                      checked={selected.includes(v._id)}
                      onChange={() => setSelected(s => s.includes(v._id) ? s.filter(x => x !== v._id) : [...s, v._id])}
                      className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-amber-500"
                    />
                  </td>

                  {/* Variant title */}
                  <td className="px-4 py-3 font-semibold text-white text-sm whitespace-nowrap">
                    {v.variantTitle}
                  </td>

                  {/* Attribute pills */}
                  <td className="px-4 py-3">
                    <AttributePills attributes={v.attributes}/>
                  </td>

                  {/* Price — inline edit */}
                  <td className="px-4 py-3">
                    <EditableCell
                      value={v.price}
                      prefix="SAR "
                      onSave={val => updateVariant(v._id, { price: val })}
                    />
                  </td>

                  {/* Stock — inline edit */}
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <EditableCell
                        value={v.stock}
                        onSave={val => updateVariant(v._id, { stock: val })}
                      />
                      <StockBadge stock={v.stock}/>
                    </div>
                  </td>

                  {/* SKU — inline edit */}
                  <td className="px-4 py-3">
                    <EditableCell
                      value={v.sku || '—'}
                      type="text"
                      onSave={val => updateVariant(v._id, { sku: val })}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <button onClick={() => toggleVariant(v._id)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                        v.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20'
                      }`}
                    >
                      {v.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteVariant(v._id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all"
                      title="Delete variant"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
