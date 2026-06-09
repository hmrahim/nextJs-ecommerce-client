// 📁 PATH: src/components/admin/attributes/AttributeValuesDrawer.jsx
'use client';
import { useState } from 'react';
import { TypeBadge } from './AttributeTable';

// ── Colour swatch input ──────────────────────────────────────────────────────
function ColorInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"/>
        <div className="w-full h-full" style={{ backgroundColor: value || '#000000' }}/>
      </div>
      <input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 h-8 px-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
      />
    </div>
  );
}

// ── Single value row (edit inline) ───────────────────────────────────────────
function ValueRow({ val, isColor, onUpdate, onDelete, onToggle }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({ label: val.label, value: val.value });

  const save = () => {
    if (!draft.label.trim()) return;
    onUpdate(val._id, draft);
    setEditing(false);
  };
  const cancel = () => { setDraft({ label: val.label, value: val.value }); setEditing(false); };

  return (
    <div className={`group flex items-center gap-3 px-4 py-2.5 border-b border-[#1e1e2e] last:border-0 hover:bg-white/[0.02] transition-colors ${!val.isActive ? 'opacity-40' : ''}`}>
      {/* Drag handle */}
      <svg className="w-4 h-4 text-slate-700 flex-shrink-0 cursor-grab active:cursor-grabbing" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16"/>
      </svg>

      {/* Color swatch / bullet */}
      {isColor ? (
        <div className="w-6 h-6 rounded-full border border-white/10 flex-shrink-0"
          style={{ backgroundColor: val.value || '#666' }}/>
      ) : (
        <div className="w-2 h-2 rounded-full bg-white/20 flex-shrink-0"/>
      )}

      {/* Inline edit */}
      {editing ? (
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <input
            value={draft.label}
            onChange={e => setDraft(p => ({ ...p, label: e.target.value }))}
            placeholder="Label"
            className="h-7 px-2 rounded-lg border border-amber-500/40 bg-[#0a0a0f] text-white text-sm flex-1 min-w-0 focus:outline-none"
            autoFocus
          />
          {isColor ? (
            <ColorInput value={draft.value} onChange={v => setDraft(p => ({ ...p, value: v }))}/>
          ) : (
            <input
              value={draft.value}
              onChange={e => setDraft(p => ({ ...p, value: e.target.value }))}
              placeholder="Value (slug)"
              className="h-7 px-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-slate-300 text-xs font-mono flex-1 min-w-0 focus:outline-none focus:border-amber-500/40"
            />
          )}
          <div className="flex gap-1">
            <button onClick={save} className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors">Save</button>
            <button onClick={cancel} className="px-2.5 py-1 rounded-lg border border-[#1e1e2e] text-slate-400 text-xs hover:bg-white/5 transition-colors">✕</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <span className="text-slate-200 text-sm font-medium">{val.label}</span>
            {!isColor && val.value && val.value !== val.label && (
              <span className="ml-2 text-slate-600 text-xs font-mono">{val.value}</span>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} title="Edit"
              className="p-1.5 rounded-lg hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button onClick={() => onToggle(val._id)} title={val.isActive ? 'Deactivate' : 'Activate'}
              className="p-1.5 rounded-lg hover:bg-sky-500/10 text-slate-500 hover:text-sky-400 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {val.isActive
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                }
              </svg>
            </button>
            <button onClick={() => onDelete(val._id)} title="Delete"
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Add value form ───────────────────────────────────────────────────────────
function AddValueForm({ isColor, onAdd }) {
  const [label, setLabel]   = useState('');
  const [value, setValue]   = useState('');
  const [adding, setAdding] = useState(false);

  const submit = async () => {
    if (!label.trim()) return;
    setAdding(true);
    const slug = value.trim() || label.toLowerCase().trim().replace(/\s+/g, '-');
    await onAdd({ label: label.trim(), value: isColor ? value : slug });
    setLabel(''); setValue('');
    setAdding(false);
  };

  return (
    <div className="px-4 py-3 border-t border-[#1e1e2e] bg-[#0d0d14]">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Add New Value</p>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder={isColor ? 'Color name (e.g. Navy Blue)' : 'Value label'}
          className="flex-1 min-w-[140px] h-8 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
        />
        {isColor ? (
          <ColorInput value={value} onChange={setValue}/>
        ) : (
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="slug (auto)"
            className="w-28 h-8 px-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-slate-400 text-xs font-mono placeholder-slate-700 focus:outline-none focus:border-amber-500/40"
          />
        )}
        <button
          onClick={submit}
          disabled={adding || !label.trim()}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold transition-colors flex-shrink-0"
        >
          {adding ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
          )}
          Add
        </button>
      </div>
    </div>
  );
}

// ── Main Drawer ──────────────────────────────────────────────────────────────
export default function AttributeValuesDrawer({
  attribute, onClose,
  onAddValue, onUpdateValue, onDeleteValue, onToggleValue,
}) {
  if (!attribute) return null;

  const isColor    = attribute.type === 'color';
  const noValueTypes = ['boolean', 'text', 'number'];
  const values     = attribute.values || [];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose}/>

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0e0e17] border-l border-[#1e1e2e] shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#1e1e2e] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white font-bold text-lg">{attribute.name}</h2>
              <TypeBadge type={attribute.type}/>
            </div>
            <p className="text-slate-500 text-sm">
              Manage values for this attribute · <span className="font-mono text-xs text-slate-600">/{attribute.slug}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Scrollable values */}
        <div className="flex-1 overflow-y-auto">
          {noValueTypes.includes(attribute.type) ? (
            <div className="p-8 text-center text-slate-500">
              <div className="text-4xl mb-3">
                {attribute.type === 'boolean' ? '◉' : attribute.type === 'text' ? 'T' : '#'}
              </div>
              <p className="font-medium text-slate-400 mb-1">No values needed</p>
              <p className="text-sm">
                {attribute.type === 'boolean' && 'Boolean attributes only have Yes / No values.'}
                {attribute.type === 'text'    && 'Text attributes accept free-form input on the product.'}
                {attribute.type === 'number'  && 'Number attributes accept any numeric value on the product.'}
              </p>
            </div>
          ) : values.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
              </div>
              <p>No values yet. Add your first one below.</p>
            </div>
          ) : (
            <div>
              {/* Count bar */}
              <div className="px-4 py-2 border-b border-[#1e1e2e] bg-[#0d0d14] flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {values.filter(v => v.isActive).length} active · {values.filter(v => !v.isActive).length} inactive
                </span>
                <span className="text-xs text-slate-600">{values.length} total</span>
              </div>

              {values.map(val => (
                <ValueRow
                  key={val._id}
                  val={val}
                  isColor={isColor}
                  onUpdate={onUpdateValue}
                  onDelete={onDeleteValue}
                  onToggle={onToggleValue}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add form — only for types that need values */}
        {!noValueTypes.includes(attribute.type) && (
          <AddValueForm isColor={isColor} onAdd={(data) => onAddValue(attribute._id, data)}/>
        )}
      </div>
    </>
  );
}
