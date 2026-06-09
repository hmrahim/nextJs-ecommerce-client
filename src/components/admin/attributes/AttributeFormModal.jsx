// 📁 PATH: src/components/admin/attributes/AttributeFormModal.jsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ATTRIBUTE_TYPES } from './_dummyData';

function slugify(t) {
  return t.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const inputCls  = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-colors";
const selectCls = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-amber-500/60 transition-colors";

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint  && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors ${
        checked ? 'border-amber-500/30 bg-amber-500/5' : 'border-[#1e1e2e] bg-[#0a0a0f]'
      }`}
    >
      <div className="text-left">
        <p className={`text-sm font-medium ${checked ? 'text-amber-400' : 'text-slate-400'}`}>{label}</p>
        {description && <p className="text-xs text-slate-600 mt-0.5">{description}</p>}
      </div>
      <div className={`w-10 h-5 rounded-full border-2 flex items-center transition-all flex-shrink-0 ml-3 ${
        checked ? 'border-amber-500 bg-amber-500' : 'border-slate-600 bg-transparent'
      }`}>
        <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}/>
      </div>
    </button>
  );
}

export default function AttributeFormModal({ editing, onSave, onClose }) {
  const isEdit = !!editing;

  const { watch, setValue, handleSubmit: rhfHandleSubmit } = useForm({
    defaultValues: {
      name:         editing?.name         || '',
      slug:         editing?.slug         || '',
      type:         editing?.type         || 'select',
      isRequired:   editing?.isRequired   ?? false,
      isFilterable: editing?.isFilterable ?? true,
      isVariant:    editing?.isVariant    ?? false,
      isActive:     editing?.isActive     !== false,
    },
  });
  const form = watch();
  const set = (k, v) => setValue(k, v, { shouldDirty: true });

  const [slugManual, setSlugManual] = useState(isEdit);
  const [errors, setErrors]         = useState({});
  const [saving, setSaving]         = useState(false);

  const handleNameChange = (e) => {
    const val = e.target.value;
    set('name', val);
    if (!slugManual) set('slug', slugify(val));
  };

  const validate = (data) => {
    const e = {};
    if (!data.name.trim()) e.name = 'Attribute name required';
    if (!data.slug.trim()) e.slug = 'Slug required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (data) => {
    if (!validate(data)) return;
    setSaving(true);
    try { await onSave(data); } finally { setSaving(false); }
  };
  const handleSubmit = rhfHandleSubmit(onSubmit);

  const selectedType = ATTRIBUTE_TYPES.find(t => t.value === form.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className="relative bg-[#13131c] border border-[#1e1e2e] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold">
              {isEdit ? `Edit "${editing.name}"` : 'New Attribute'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? 'Update attribute settings.' : 'Define a product attribute like Size, Color or Material.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Name */}
          <Field label="Attribute Name" required error={errors.name}>
            <input className={inputCls} value={form.name} onChange={handleNameChange}
              placeholder="e.g. Color, Size, Material" autoFocus/>
          </Field>

          {/* Slug */}
          <Field label="Slug" required hint="Auto-generated from name — used in API & filters" error={errors.slug}>
            <input className={inputCls} value={form.slug}
              onChange={e => { setSlugManual(true); set('slug', e.target.value); }}
              placeholder="color"/>
          </Field>

          {/* Type */}
          <Field label="Input Type" required hint={selectedType?.desc}>
            <select className={selectCls} value={form.type} onChange={e => set('type', e.target.value)}>
              {ATTRIBUTE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.icon}  {t.label}</option>
              ))}
            </select>
          </Field>

          {/* Type info box */}
          {selectedType && (
            <div className="px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 text-xs text-amber-400/80">
              <span className="font-semibold">{selectedType.label}:</span> {selectedType.desc}
              {(form.type === 'select' || form.type === 'multiselect' || form.type === 'color') && (
                <span className="block mt-0.5 text-slate-500">
                  After saving, add values from the "Manage Values" panel.
                </span>
              )}
            </div>
          )}

          {/* Toggles */}
          <div className="space-y-2 pt-1">
            <Toggle
              checked={form.isActive}
              onChange={v => set('isActive', v)}
              label="Active"
              description="Inactive attributes are hidden from product forms"
            />
            <Toggle
              checked={form.isFilterable}
              onChange={v => set('isFilterable', v)}
              label="Filterable"
              description="Show in product listing filters (sidebar)"
            />
            <Toggle
              checked={form.isVariant}
              onChange={v => set('isVariant', v)}
              label="Used for Variants"
              description="Creates separate SKUs per value (e.g. Red / Blue)"
            />
            <Toggle
              checked={form.isRequired}
              onChange={v => set('isRequired', v)}
              label="Required on Product"
              description="Product cannot be saved without a value for this attribute"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors disabled:opacity-50">
              {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              {isEdit ? 'Save Changes' : 'Create Attribute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
