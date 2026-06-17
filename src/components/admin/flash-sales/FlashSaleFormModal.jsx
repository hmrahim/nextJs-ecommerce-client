// 📁 PATH: src/components/admin/flash-sales/FlashSaleFormModal.jsx

'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const EMPTY = {
  name: '',
  slug: '',
  discountType: 'percent',
  discountValue: '',
  startTime: '',
  endTime: '',
  totalStock: '',
  maxOrdersPerUser: 1,
  isActive: true,
  banner: '',
};

function toSlug(str) {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function toDatetimeLocal(iso) {
  if (!iso) return '';
  // convert ISO to datetime-local format
  return iso.slice(0, 16);
}

function fromDatetimeLocal(val) {
  if (!val) return '';
  return new Date(val).toISOString();
}

export default function FlashSaleFormModal({ editing, onSave, onClose }) {
  const { watch, setValue, reset, handleSubmit: rhfHandleSubmit } = useForm({ defaultValues: EMPTY });
  const form = watch();
  const set = (k, v) => setValue(k, v, { shouldDirty: true });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      reset({
        name:             editing.name ?? '',
        slug:             editing.slug ?? '',
        discountType:     editing.discountType ?? 'percent',
        discountValue:    editing.discountValue ?? '',
        startTime:        toDatetimeLocal(editing.startTime),
        endTime:          toDatetimeLocal(editing.endTime),
        totalStock:       editing.totalStock ?? '',
        maxOrdersPerUser: editing.maxOrdersPerUser ?? 1,
        isActive:         editing.isActive ?? true,
        banner:           editing.banner ?? '',
      });
    } else {
      reset(EMPTY);
    }
    setErrors({});
  }, [editing, reset]);

  const handleNameChange = (v) => {
    set('name', v);
    if (!editing) set('slug', toSlug(v));
  };

  const validate = (data) => {
    const e = {};
    if (!data.name.trim())      e.name = 'Name is required';
    if (!data.discountValue)    e.discountValue = 'Discount value is required';
    if (Number(data.discountValue) <= 0) e.discountValue = 'Must be greater than 0';
    if (data.discountType === 'percent' && Number(data.discountValue) > 100) e.discountValue = 'Percentage cannot exceed 100';
    if (!data.startTime)        e.startTime = 'Start time is required';
    if (!data.endTime)          e.endTime = 'End time is required';
    if (data.startTime && data.endTime && data.endTime <= data.startTime) e.endTime = 'End must be after start';
    if (!data.totalStock)       e.totalStock = 'Total stock is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = rhfHandleSubmit(async (data) => {
    if (!validate(data)) return;
    setSaving(true);
    try {
      await onSave({
        name:             data.name.trim(),
        slug:             data.slug.trim() || toSlug(data.name),
        discountType:     data.discountType,
        discountValue:    Number(data.discountValue),
        startTime:        fromDatetimeLocal(data.startTime),
        endTime:          fromDatetimeLocal(data.endTime),
        totalStock:       Number(data.totalStock),
        maxOrdersPerUser: Number(data.maxOrdersPerUser) || 1,
        isActive:         data.isActive,
        banner:           data.banner || null,
      });
    } finally {
      setSaving(false);
    }
  });

  const inputCls = (field) =>
    `w-full h-9 px-3 rounded-lg border bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-colors ${
      errors[field]
        ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
        : 'border-[#1e1e2e] focus:border-orange-500/60 focus:ring-orange-500/20'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e]">
          <div>
            <h2 className="text-base font-bold text-white">
              {editing ? '✏️ Edit Flash Sale' : '⚡ New Flash Sale'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {editing ? 'Update sale details' : 'Create a limited-time flash sale'}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#1a1a25] border border-[#2e2e3e] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Sale Name *</label>
            <input
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Eid Mega Flash Sale"
              className={inputCls('name')}
            />
            {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Slug</label>
            <input
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
              placeholder="auto-generated"
              className={inputCls('slug')}
            />
          </div>

          {/* Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Discount Type *</label>
              <select
                value={form.discountType}
                onChange={e => set('discountType', e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-orange-500/60"
              >
                <option value="percent">% Percentage</option>
                <option value="fixed">SAR  Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {form.discountType === 'percent' ? 'Percentage (%)' : 'Amount (SAR )'} *
              </label>
              <input
                type="number"
                min="0"
                max={form.discountType === 'percent' ? 100 : undefined}
                value={form.discountValue}
                onChange={e => set('discountValue', e.target.value)}
                placeholder={form.discountType === 'percent' ? '0 – 100' : 'e.g. 500'}
                className={inputCls('discountValue')}
              />
              {errors.discountValue && <p className="text-[11px] text-red-400 mt-1">{errors.discountValue}</p>}
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Time *</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={e => set('startTime', e.target.value)}
                className={inputCls('startTime')}
              />
              {errors.startTime && <p className="text-[11px] text-red-400 mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">End Time *</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={e => set('endTime', e.target.value)}
                className={inputCls('endTime')}
              />
              {errors.endTime && <p className="text-[11px] text-red-400 mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Stock + per user */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Stock *</label>
              <input
                type="number"
                min="1"
                value={form.totalStock}
                onChange={e => set('totalStock', e.target.value)}
                placeholder="e.g. 500"
                className={inputCls('totalStock')}
              />
              {errors.totalStock && <p className="text-[11px] text-red-400 mt-1">{errors.totalStock}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Orders / User</label>
              <input
                type="number"
                min="1"
                value={form.maxOrdersPerUser}
                onChange={e => set('maxOrdersPerUser', e.target.value)}
                placeholder="e.g. 2"
                className={inputCls('maxOrdersPerUser')}
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#111118] border border-[#1e1e2e]">
            <div>
              <p className="text-sm text-white font-medium">Active</p>
              <p className="text-xs text-slate-500">Inactive sales won't appear on storefront</p>
            </div>
            <button
              type="button"
              onClick={() => set('isActive', !form.isActive)}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-orange-500' : 'bg-[#2e2e3e]'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#1e1e2e]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1a1a25] border border-[#2e2e3e] text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {saving && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {editing ? 'Save Changes' : 'Create Sale'}
          </button>
        </div>
      </div>
    </div>
  );
}
