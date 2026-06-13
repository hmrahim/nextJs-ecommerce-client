// 📁 PATH: src/components/admin/attributes/AttributeTable.jsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { ATTRIBUTE_TYPES } from './_dummyData';

// ── Type badge ───────────────────────────────────────────────────────────────
export function TypeBadge({ type }) {
  const cfg = ATTRIBUTE_TYPES.find(t => t.value === type);
  const colors = {
    select:      'bg-violet-500/10 text-violet-400 border-violet-500/20',
    multiselect: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    color:       'bg-pink-500/10   text-pink-400   border-pink-500/20',
    boolean:     'bg-sky-500/10    text-sky-400    border-sky-500/20',
    text:        'bg-slate-500/10  text-slate-400  border-slate-500/20',
    number:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${colors[type] || colors.text}`}>
      <span>{cfg?.icon}</span>
      {cfg?.label || type}
    </span>
  );
}

// ── Color swatch strip ───────────────────────────────────────────────────────
function ColorStrip({ values }) {
  const active = values.filter(v => v.isActive).slice(0, 8);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {active.map(v => (
        <div
          key={v._id}
          title={v.label}
          className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0"
          style={{ backgroundColor: v.value }}
        />
      ))}
      {values.length > 8 && (
        <span className="text-[10px] text-slate-600">+{values.length - 8}</span>
      )}
    </div>
  );
}

// ── Value pill list ──────────────────────────────────────────────────────────
function ValuePills({ values }) {
  const active = values.filter(v => v.isActive).slice(0, 4);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {active.map(v => (
        <span key={v._id} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 text-[10px] font-mono">
          {v.label}
        </span>
      ))}
      {values.length > 4 && (
        <span className="text-[10px] text-slate-600">+{values.length - 4} more</span>
      )}
    </div>
  );
}

// ── Toggle chip ──────────────────────────────────────────────────────────────
function Chip({ on, label, offLabel }) {
  return on ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
      <span className="w-1 h-1 rounded-full bg-emerald-400" /> {label}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 px-1.5 py-0.5 rounded-full">
      {offLabel || '—'}
    </span>
  );
}

// ── Main table ───────────────────────────────────────────────────────────────
export default function AttributeTable({
  attributes = [], loading,
  selected = [], onSelectChange,
  onEdit, onDelete, onToggle, onManageValues,
}) {
  const [menu, setMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const openMenu = (e, id) => {
    if (menu === id) { setMenu(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    setMenu(id);
  };

  const allSel = attributes.length > 0 && selected.length === attributes.length;
  const toggle = (id) => onSelectChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  if (loading) return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] flex items-center justify-center p-16 gap-3 text-slate-500">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Loading attributes…
    </div>
  );

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSel}
                  onChange={() => onSelectChange(allSel ? [] : attributes.map(a => a._id))}
                  className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-amber-500"/>
              </th>
              {['Attribute','Type','Values','Filterable','Variant','Required','Used In','Status',''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e2e]">
            {attributes.length === 0 ? (
              <tr><td colSpan={10} className="py-20 text-center">
                <div className="flex flex-col items-center gap-3 text-slate-600">
                  <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                  </svg>
                  <p>No attributes yet. Create your first one!</p>
                </div>
              </td></tr>
            ) : attributes.map(attr => (
              <tr key={attr._id}
                className={`group hover:bg-white/[0.025] transition-colors ${selected.includes(attr._id) ? 'bg-amber-500/[0.04]' : ''} ${!attr.isActive ? 'opacity-50' : ''}`}>

                {/* Checkbox */}
                <td className="px-4 py-3.5">
                  <input type="checkbox" checked={selected.includes(attr._id)} onChange={() => toggle(attr._id)}
                    className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-amber-500"/>
                </td>

                {/* Name + slug */}
                <td className="px-4 py-3.5 min-w-[160px]">
                  <button onClick={() => onManageValues(attr)} className="text-left group/name">
                    <p className="text-white font-semibold group-hover/name:text-amber-400 transition-colors">
                      {attr.name}
                    </p>
                    <p className="text-slate-600 text-xs font-mono mt-0.5">/{attr.slug}</p>
                  </button>
                </td>

                {/* Type */}
                <td className="px-4 py-3.5">
                  <TypeBadge type={attr.type}/>
                </td>

                {/* Values preview */}
                <td className="px-4 py-3.5 min-w-[150px]">
                  {attr.type === 'color' ? (
                    <ColorStrip values={attr.values}/>
                  ) : attr.values.length > 0 ? (
                    <ValuePills values={attr.values}/>
                  ) : (
                    <span className="text-slate-700 text-xs italic">
                      {attr.type === 'boolean' ? 'Yes / No' : attr.type === 'text' ? 'Free text' : attr.type === 'number' ? 'Numeric' : 'No values'}
                    </span>
                  )}
                  {attr.values.length > 0 && (
                    <button onClick={() => onManageValues(attr)} className="mt-1 text-[10px] text-amber-500 hover:text-amber-400 transition-colors block">
                      {attr.values.length} value{attr.values.length !== 1 ? 's' : ''} →
                    </button>
                  )}
                </td>

                {/* Filterable */}
                <td className="px-4 py-3.5">
                  <Chip on={attr.isFilterable} label="Filterable"/>
                </td>

                {/* Variant */}
                <td className="px-4 py-3.5">
                  <Chip on={attr.isVariant} label="Variant"/>
                </td>

                {/* Required */}
                <td className="px-4 py-3.5">
                  <Chip on={attr.isRequired} label="Required"/>
                </td>

                {/* Used in */}
                <td className="px-4 py-3.5">
                  <span className={`font-semibold tabular-nums text-sm ${attr.usedInProducts > 0 ? 'text-white' : 'text-slate-700'}`}>
                    {attr.usedInProducts ?? 0}
                  </span>
                  <span className="text-slate-600 text-xs ml-1">products</span>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  {attr.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"/>Inactive
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className={`flex items-center gap-0.5 transition-opacity ${menu === attr._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {/* Manage values */}
                    <button onClick={() => onManageValues(attr)} title="Manage values"
                      className="p-1.5 rounded-lg hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                      </svg>
                    </button>
                    {/* Edit */}
                    <button onClick={() => onEdit(attr)} title="Edit"
                      className="p-1.5 rounded-lg hover:bg-violet-500/10 text-slate-500 hover:text-violet-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    {/* More */}
                    <div className="relative">
                      <button onClick={(e) => openMenu(e, attr._id)} title="More"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                        </svg>
                      </button>
                      {menu === attr._id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)}/>
                          <div
                            className="fixed z-50 bg-[#16161f] border border-[#1e1e2e] rounded-xl shadow-2xl overflow-hidden min-w-[170px]"
                            style={{ top: menuPos.top, right: menuPos.right }}
                          >
                            <button onClick={() => { onManageValues(attr); setMenu(null); }}
                              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-slate-300 hover:bg-white/5">
                              📋 Manage Values
                            </button>
                            <button onClick={() => { onEdit(attr); setMenu(null); }}
                              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-slate-300 hover:bg-white/5">
                              ✏️ Edit Attribute
                            </button>
                            <button onClick={() => { onToggle(attr._id); setMenu(null); }}
                              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10">
                              {attr.isActive ? '⏸ Deactivate' : '▶ Activate'}
                            </button>
                            <div className="border-t border-[#1e1e2e] my-0.5"/>
                            <button onClick={() => { onDelete(attr._id); setMenu(null); }}
                              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
                              🗑 Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}