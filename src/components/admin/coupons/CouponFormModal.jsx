// 📁 PATH: src/components/admin/coupons/CouponFormModal.jsx

'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { couponSchema, toApiPayload } from '@/lib/schemas/coupon.schema';
import { useGenerateCouponCode } from '@/hooks/useCoupons';

const INITIAL = {
  code: '',
  type: 'percent',
  value: '',
  minOrderAmount: '',
  maxUses: '',
  maxUsesPerUser: 1,
  isActive: true,
  expiresAt: '',
  startDate: '',
  description: '',
  applicableTo: 'all',
  products: [],
  categories: [],
};

const inp =
  'w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-colors';
const sel =
  'w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-orange-500/60 transition-colors';

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
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

const Spinner = ({ className = 'w-4 h-4' }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export default function CouponFormModal({ editing, onSave, onClose, saving = false }) {
  const isEdit = !!editing;

  const defaultValues = isEdit
    ? {
        code:           editing.code           || '',
        type:           editing.type           || 'percent',
        value:          editing.value          ?? '',
        minOrderAmount: editing.minOrderAmount ?? '',
        maxUses:        editing.maxUses        ?? '',
        maxUsesPerUser: editing.maxUsesPerUser ?? 1,
        isActive:       editing.isActive       !== false,
        expiresAt:      editing.expiresAt ? String(editing.expiresAt).split('T')[0] : '',
        startDate:      editing.startDate  ? String(editing.startDate).split('T')[0] : '',
        description:    editing.description    || '',
        applicableTo:   editing.applicableTo   || 'all',
        products:       editing.products       || [],
        categories:     editing.categories     || [],
      }
    : { ...INITIAL };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: zodResolver(couponSchema),
    mode: 'onBlur',
  });

  const values  = watch();
  // ── FIX: useGenerateCouponCode is a mutation; call it at top level ──
  const genCode = useGenerateCouponCode();

  // ── FIX: handleGenerate calls mutateAsync and sets the code field ──
  const handleGenerate = async () => {
    try {
      const code = await genCode.mutateAsync();
      if (code) {
        setValue('code', String(code).toUpperCase(), {
          shouldDirty:    true,
          shouldValidate: true,
        });
      }
    } catch {
      // toast already shown by hook's onError
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    await onSave(toApiPayload(data));
  });

  const previewLabel = () => {
    if (!values.value && values.type !== 'shipping') return null;
    if (values.type === 'percent')  return `${values.value}% off`;
    if (values.type === 'fixed')    return `SAR ${values.value} off`;
    if (values.type === 'shipping') return 'Free Shipping';
    return null;
  };

  const busy = saving || isSubmitting || genCode.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-[#13131c] border border-[#1e1e2e] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg">
              🎟️
            </div>
            <div>
              <h2 className="text-white font-semibold">
                {isEdit ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEdit ? `Editing ${editing.code}` : 'Set up discount rules below.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Live preview */}
          {(values.code || previewLabel()) && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/15">
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-0.5">Preview</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {values.code && (
                    <span className="font-mono font-bold text-orange-400 text-base tracking-widest bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-lg">
                      {String(values.code).toUpperCase()}
                    </span>
                  )}
                  {previewLabel() && (
                    <span className="text-white font-semibold">{previewLabel()}</span>
                  )}
                  {Number(values.minOrderAmount) > 0 && (
                    <span className="text-xs text-slate-400">
                      on orders above SAR {values.minOrderAmount}
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  values.isActive ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
            </div>
          )}

          {/* ── Identity ── */}
          <Section title="Coupon Identity">
            <Field
              label="Coupon Code"
              required
              error={errors.code?.message}
              hint="Uppercase letters, numbers, - and _"
            >
              <div className="flex gap-2">
                <input
                  {...register('code')}
                  onChange={(e) =>
                    setValue('code', e.target.value.toUpperCase(), { shouldDirty: true })
                  }
                  className={`${inp} flex-1 uppercase`}
                  placeholder="e.g. WELCOME20"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={genCode.isPending}
                  className="flex-shrink-0 h-9 px-3 rounded-lg border border-[#1e1e2e] text-slate-400 text-xs hover:bg-white/5 hover:text-orange-400 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {genCode.isPending ? (
                    <Spinner className="w-3.5 h-3.5" />
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
                  Generate
                </button>
              </div>
            </Field>

            <Field
              label="Description"
              hint="Internal note — not visible to customers"
              error={errors.description?.message}
            >
              <input
                {...register('description')}
                className={inp}
                placeholder="e.g. New user welcome discount"
              />
            </Field>
          </Section>

          {/* ── Discount Rules ── */}
          <Section title="Discount Rules">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Discount Type" required error={errors.type?.message}>
                <select {...register('type')} className={sel}>
                  <option value="percent">% Percentage off</option>
                  <option value="fixed">SAR  Fixed amount off</option>
                  <option value="shipping">🚚 Free shipping</option>
                </select>
              </Field>

              <Field
                label={
                  values.type === 'percent'
                    ? 'Percentage (%)'
                    : values.type === 'shipping'
                    ? 'Shipping Value (SAR )'
                    : 'Amount (SAR )'
                }
                required={values.type !== 'shipping'}
                error={errors.value?.message}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                    {values.type === 'percent' ? '%' : 'SAR '}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('value')}
                    className={`${inp} pl-7`}
                    placeholder={values.type === 'percent' ? '20' : '100'}
                  />
                </div>
              </Field>
            </div>

            <Field
              label="Minimum Order Amount (SAR )"
              hint="Leave 0 for no minimum"
              error={errors.minOrderAmount?.message}
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                  SAR 
                </span>
                <input
                  type="number"
                  min="0"
                  {...register('minOrderAmount')}
                  className={`${inp} pl-6`}
                  placeholder="0"
                />
              </div>
            </Field>

            <Field label="Applicable To" error={errors.applicableTo?.message}>
              <select {...register('applicableTo')} className={sel}>
                <option value="all">All Products</option>
                <option value="category">Specific Category</option>
                <option value="product">Specific Products</option>
              </select>
            </Field>
          </Section>

          {/* ── Usage limits ── */}
          <Section title="Usage Limits">
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Total Usage Limit"
                hint="Leave empty for unlimited"
                error={errors.maxUses?.message}
              >
                <input
                  type="number"
                  min="1"
                  {...register('maxUses')}
                  className={inp}
                  placeholder="∞ Unlimited"
                />
              </Field>
              <Field
                label="Per Customer Limit"
                hint="Max uses per individual user"
                error={errors.maxUsesPerUser?.message}
              >
                <input
                  type="number"
                  min="1"
                  {...register('maxUsesPerUser')}
                  className={inp}
                  placeholder="1"
                />
              </Field>
            </div>
          </Section>

          {/* ── Validity ── */}
          <Section title="Validity Period">
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Start Date"
                hint="Leave empty to activate immediately"
                error={errors.startDate?.message}
              >
                <input
                  type="date"
                  {...register('startDate')}
                  className={`${inp} text-slate-300`}
                />
              </Field>
              <Field
                label="Expiry Date"
                hint="Leave empty for no expiry"
                error={errors.expiresAt?.message}
              >
                <input
                  type="date"
                  {...register('expiresAt')}
                  className={`${inp} text-slate-300`}
                />
              </Field>
            </div>
          </Section>

          {/* ── Status ── */}
          <Section title="Status">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    field.value
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                      : 'bg-[#0a0a0f] border-[#1e1e2e] text-slate-500'
                  }`}
                >
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                      field.value ? 'bg-emerald-500' : 'bg-[#1e1e2e]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        field.value ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{field.value ? 'Active' : 'Inactive'}</p>
                    <p className="text-xs text-slate-600">
                      {field.value
                        ? 'Customers can use this coupon.'
                        : 'Coupon is disabled and cannot be applied.'}
                    </p>
                  </div>
                </button>
              )}
            />
          </Section>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1e1e2e] flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={busy}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-orange-900/30"
          >
            {busy && <Spinner />}
            {isEdit ? 'Save Changes' : 'Create Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
}
