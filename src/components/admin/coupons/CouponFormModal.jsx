// 📁 PATH: src/components/admin/coupons/CouponFormModal.jsx
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

'use client';
import { useState } from 'react';
import { couponService } from '@/services/couponService';

const INITIAL = {
  code: '', type: 'percent', value: '',
  minOrderAmount: '', maxUses: '', maxUsesPerUser: 1,
  isActive: true, expiresAt: '', description: '',
  applicableTo: 'all',
  startDate: '',
};

const inp = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-colors";
const sel = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-orange-500/60 transition-colors";

function Field({ label, required, hint, error, half, children }) {
  return (
    <div className={half ? '' : ''}>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint  && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] overflow-hidden">
      <div className="px-4 py-2.5 bg-[#0d0d14] border-b border-[#1e1e2e]">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

// Random uppercase code generator
function genCode(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function CouponFormModal({ editing, onSave, onClose }) {
  const isEdit = !!editing;

  const [form, setForm] = useState(
    isEdit ? {
      code:           editing.code        || '',
      type:           editing.type        || 'percent',
      value:          editing.value       ?? '',
      minOrderAmount: editing.minOrderAmount ?? '',
      maxUses:        editing.maxUses     ?? '',
      maxUsesPerUser: editing.maxUsesPerUser ?? 1,
      isActive:       editing.isActive    !== false,
      expiresAt:      editing.expiresAt ? editing.expiresAt.split('T')[0] : '',
      startDate:      editing.startDate  ? editing.startDate.split('T')[0] : '',
      description:    editing.description || '',
      applicableTo:   editing.applicableTo || 'all',
    } : { ...INITIAL }
  );

  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [generating, setGen]    = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleGenCode = async () => {
    setGen(true);
    try {
      const res = await couponService.adminGenCode();
      set('code', res.data?.code || genCode());
    } catch {
      set('code', genCode());
    } finally {
      setGen(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.code.trim())                           e.code  = 'Coupon code required';
    if (form.code && !/^[A-Z0-9_-]+$/i.test(form.code)) e.code = 'Only letters, numbers, - and _ allowed';
    if (!form.value || isNaN(form.value) || Number(form.value) <= 0) e.value = 'Valid discount value required';
    if (form.type === 'percent' && Number(form.value) > 100) e.value = 'Percentage cannot exceed 100%';
    if (form.maxUses && (isNaN(form.maxUses) || Number(form.maxUses) < 1)) e.maxUses = 'Must be at least 1';
    if (form.startDate && form.expiresAt && form.startDate > form.expiresAt) e.expiresAt = 'Expiry must be after start date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await onSave({
      ...form,
      code:           form.code.toUpperCase().trim(),
      value:          parseFloat(form.value),
      minOrderAmount: form.minOrderAmount !== '' ? parseFloat(form.minOrderAmount) : 0,
      maxUses:        form.maxUses !== '' ? parseInt(form.maxUses) : null,
      maxUsesPerUser: form.maxUsesPerUser ? parseInt(form.maxUsesPerUser) : null,
      expiresAt:      form.expiresAt || null,
      startDate:      form.startDate || null,
    });
    setSaving(false);
  };

  // Live preview
  const previewLabel = () => {
    if (!form.value) return null;
    if (form.type === 'percent')  return `${form.value}% off`;
    if (form.type === 'fixed')    return `৳${form.value} off`;
    if (form.type === 'shipping') return 'Free Shipping';
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-[#13131c] border border-[#1e1e2e] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg">🎟️</div>
            <div>
              <h2 className="text-white font-semibold">{isEdit ? 'Edit Coupon' : 'Create New Coupon'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{isEdit ? `Editing ${editing.code}` : 'Set up discount rules below.'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1 p-6 space-y-4">

          {/* Live Preview */}
          {(form.code || previewLabel()) && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/15">
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-0.5">Preview</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {form.code && (
                    <span className="font-mono font-bold text-orange-400 text-base tracking-widest bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-lg">
                      {form.code.toUpperCase()}
                    </span>
                  )}
                  {previewLabel() && (
                    <span className="text-white font-semibold">{previewLabel()}</span>
                  )}
                  {form.minOrderAmount > 0 && (
                    <span className="text-xs text-slate-400">on orders above ৳{form.minOrderAmount}</span>
                  )}
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${form.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </div>
          )}

          {/* ── Section 1: Code & Type ── */}
          <Section title="Coupon Identity">
            <Field label="Coupon Code" required error={errors.code} hint="Uppercase letters and numbers only">
              <div className="flex gap-2">
                <input
                  className={`${inp} flex-1 uppercase`}
                  placeholder="e.g. WELCOME20"
                  value={form.code}
                  onChange={e => set('code', e.target.value.toUpperCase())}
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={handleGenCode}
                  disabled={generating}
                  className="flex-shrink-0 h-9 px-3 rounded-lg border border-[#1e1e2e] text-slate-400 text-xs hover:bg-white/5 hover:text-orange-400 transition-colors flex items-center gap-1.5"
                  title="Auto-generate code"
                >
                  {generating
                    ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  }
                  Generate
                </button>
              </div>
            </Field>

            <Field label="Description" hint="Internal note — not visible to customers">
              <input className={inp} placeholder="e.g. New user welcome discount" value={form.description} onChange={e => set('description', e.target.value)} />
            </Field>
          </Section>

          {/* ── Section 2: Discount ── */}
          <Section title="Discount Rules">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Discount Type" required>
                <select className={sel} value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="percent">% Percentage off</option>
                  <option value="fixed">৳ Fixed amount off</option>
                  <option value="shipping">🚚 Free shipping</option>
                </select>
              </Field>

              <Field label={form.type === 'percent' ? 'Percentage (%)' : form.type === 'shipping' ? 'Shipping Value (৳)' : 'Amount (৳)'} required error={errors.value}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                    {form.type === 'percent' ? '%' : '৳'}
                  </span>
                  <input
                    type="number" min="0" step="0.01"
                    className={`${inp} pl-7`}
                    placeholder={form.type === 'percent' ? '20' : '100'}
                    value={form.value}
                    onChange={e => set('value', e.target.value)}
                    disabled={form.type === 'shipping'}
                  />
                </div>
                {form.type === 'shipping' && !form.value && (
                  <button type="button" className="hidden" onClick={() => set('value', 100)} />
                )}
              </Field>
            </div>

            <Field label="Minimum Order Amount (৳)" hint="Leave 0 for no minimum">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">৳</span>
                <input type="number" min="0" className={`${inp} pl-6`} placeholder="0" value={form.minOrderAmount} onChange={e => set('minOrderAmount', e.target.value)} />
              </div>
            </Field>

            <Field label="Applicable To">
              <select className={sel} value={form.applicableTo} onChange={e => set('applicableTo', e.target.value)}>
                <option value="all">All Products</option>
                <option value="category">Specific Category</option>
                <option value="product">Specific Products</option>
              </select>
            </Field>
          </Section>

          {/* ── Section 3: Usage Limits ── */}
          <Section title="Usage Limits">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Total Usage Limit" hint="Leave empty for unlimited" error={errors.maxUses}>
                <input type="number" min="1" className={inp} placeholder="∞ Unlimited" value={form.maxUses} onChange={e => set('maxUses', e.target.value)} />
              </Field>
              <Field label="Per Customer Limit" hint="Max uses per individual user">
                <input type="number" min="1" className={inp} placeholder="1" value={form.maxUsesPerUser} onChange={e => set('maxUsesPerUser', e.target.value)} />
              </Field>
            </div>
          </Section>

          {/* ── Section 4: Validity ── */}
          <Section title="Validity Period">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Date" hint="Leave empty to activate immediately">
                <input type="date" className={`${inp} text-slate-300`} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              </Field>
              <Field label="Expiry Date" hint="Leave empty for no expiry" error={errors.expiresAt}>
                <input type="date" className={`${inp} text-slate-300`} value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
              </Field>
            </div>
          </Section>

          {/* ── Section 5: Status ── */}
          <Section title="Status">
            <button
              type="button"
              onClick={() => set('isActive', !form.isActive)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                form.isActive
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                  : 'bg-[#0a0a0f] border-[#1e1e2e] text-slate-500'
              }`}
            >
              <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.isActive ? 'bg-emerald-500' : 'bg-[#1e1e2e]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.isActive ? 'left-5' : 'left-0.5'}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{form.isActive ? 'Active' : 'Inactive'}</p>
                <p className="text-xs text-slate-600">{form.isActive ? 'Customers can use this coupon.' : 'Coupon is disabled and cannot be applied.'}</p>
              </div>
            </button>
          </Section>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1e1e2e] flex items-center justify-between gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-orange-900/30"
          >
            {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {isEdit ? 'Save Changes' : 'Create Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
}
