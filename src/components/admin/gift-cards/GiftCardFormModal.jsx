// 📁 PATH: src/components/admin/gift-cards/GiftCardFormModal.jsx

'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { giftCardService } from '@/services/giftCardService';

const INITIAL = {
  code: '',
  type: 'digital',
  initialValue: '',
  balance: '',
  currency: 'BDT',
  recipientName: '',
  recipientEmail: '',
  senderName: '',
  message: '',
  isActive: true,
  expiresAt: '',
  issuedAt: '',
  sendEmailNow: false,
};

const inp = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-colors";
const sel = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white focus:outline-none focus:border-orange-500/60 transition-colors";
const txt = "w-full px-3 py-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-colors resize-none";

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

// Random formatted code generator like GIFT-XXXX-XXXX-XXXX
function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `GIFT-${seg()}-${seg()}-${seg()}`;
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function GiftCardFormModal({ editing, onSave, onClose }) {
  const isEdit = !!editing;

  const defaultValues = isEdit ? {
    code:           editing.code           || '',
    type:           editing.type           || 'digital',
    initialValue:   editing.initialValue   ?? '',
    balance:        editing.balance        ?? editing.initialValue ?? '',
    currency:       editing.currency       || 'BDT',
    recipientName:  editing.recipientName  || '',
    recipientEmail: editing.recipientEmail || '',
    senderName:     editing.senderName     || '',
    message:        editing.message        || '',
    isActive:       editing.isActive       !== false,
    expiresAt:      editing.expiresAt ? editing.expiresAt.split('T')[0] : '',
    issuedAt:       editing.issuedAt  ? editing.issuedAt.split('T')[0]  : '',
    sendEmailNow:   false,
  } : { ...INITIAL };

  const { watch, setValue, handleSubmit: rhfHandleSubmit } = useForm({ defaultValues });
  const form = watch();
  const set = (k, v) => setValue(k, v, { shouldDirty: true });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [generating, setGen] = useState(false);

  const handleGenCode = async () => {
    setGen(true);
    try {
      const res = await giftCardService.adminGenCode();
      set('code', res.data?.code || genCode());
    } catch {
      set('code', genCode());
    } finally {
      setGen(false);
    }
  };

  const validate = (data) => {
    const e = {};
    if (!data.code.trim()) e.code = 'Gift card code required';
    if (data.code && !/^[A-Z0-9_-]+$/i.test(data.code)) e.code = 'Only letters, numbers, - and _ allowed';

    const iv = Number(data.initialValue);
    if (!data.initialValue || isNaN(iv) || iv <= 0) e.initialValue = 'Valid amount required';
    if (iv > 1000000) e.initialValue = 'Amount too large (max ৳10,00,000)';

    if (isEdit) {
      const bal = Number(data.balance);
      if (data.balance === '' || isNaN(bal) || bal < 0) e.balance = 'Valid balance required';
      if (bal > iv) e.balance = 'Balance cannot exceed initial value';
    }

    if (data.type === 'digital' && data.recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.recipientEmail)) {
      e.recipientEmail = 'Valid email required';
    }
    if (data.type === 'digital' && data.sendEmailNow && !data.recipientEmail) {
      e.recipientEmail = 'Email required to send delivery';
    }
    if (data.issuedAt && data.expiresAt && data.issuedAt > data.expiresAt) {
      e.expiresAt = 'Expiry must be after issue date';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = rhfHandleSubmit(async (data) => {
    if (!validate(data)) return;
    setSaving(true);
    try {
      const initialValue = parseFloat(data.initialValue);
      const balance      = isEdit && data.balance !== '' ? parseFloat(data.balance) : initialValue;
      await onSave({
        ...data,
        code:         data.code.toUpperCase().trim(),
        initialValue,
        balance,
        recipientEmail: data.recipientEmail?.trim().toLowerCase() || '',
        expiresAt:    data.expiresAt || null,
        issuedAt:     data.issuedAt  || null,
      });
    } finally { setSaving(false); }
  });

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
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg">🎁</div>
            <div>
              <h2 className="text-white font-semibold">{isEdit ? 'Edit Gift Card' : 'Issue New Gift Card'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{isEdit ? `Editing ${editing.code}` : 'Configure the gift card details below.'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1 p-6 space-y-4">

          {/* Live Preview Card */}
          {(form.code || form.initialValue) && (
            <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent p-5">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-orange-500/10 blur-2xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-orange-300/80 mb-1">Gift Card</p>
                  <p className="text-2xl font-bold text-white">
                    ৳{form.initialValue ? Number(form.initialValue).toLocaleString() : '0'}
                  </p>
                  {form.recipientName && <p className="text-xs text-slate-300 mt-2">For: <span className="font-medium">{form.recipientName}</span></p>}
                  {form.senderName    && <p className="text-xs text-slate-400">From: {form.senderName}</p>}
                </div>
                <div className="text-right">
                  <div className={`w-3 h-3 rounded-full ml-auto mb-2 ${form.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className="font-mono font-bold text-orange-400 text-xs tracking-widest bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded">
                    {(form.code || 'GIFT-----').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Identity */}
          <Section title="Gift Card Identity">
            <Field label="Gift Card Code" required error={errors.code} hint="Uppercase letters, numbers, dash">
              <div className="flex gap-2">
                <input
                  className={`${inp} flex-1 uppercase font-mono tracking-wider`}
                  placeholder="GIFT-XXXX-XXXX-XXXX"
                  value={form.code}
                  onChange={e => set('code', e.target.value.toUpperCase())}
                  maxLength={32}
                  disabled={isEdit}
                />
                {!isEdit && (
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
                )}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Delivery Type" required>
                <select className={sel} value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="digital">✉️ Digital (Email)</option>
                  <option value="physical">📦 Physical Card</option>
                </select>
              </Field>
              <Field label="Currency">
                <select className={sel} value={form.currency} onChange={e => set('currency', e.target.value)}>
                  <option value="BDT">৳ BDT</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Section: Value */}
          <Section title="Value & Balance">
            <Field label="Initial Value (৳)" required error={errors.initialValue}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">৳</span>
                <input
                  type="number" min="1" step="1"
                  className={`${inp} pl-6`}
                  placeholder="1000"
                  value={form.initialValue}
                  onChange={e => set('initialValue', e.target.value)}
                  disabled={isEdit}
                />
              </div>
              {!isEdit && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PRESET_AMOUNTS.map(a => (
                    <button
                      key={a} type="button"
                      onClick={() => set('initialValue', a)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                        Number(form.initialValue) === a
                          ? 'border-orange-500/40 bg-orange-500/10 text-orange-400'
                          : 'border-[#1e1e2e] text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      ৳{a.toLocaleString()}
                    </button>
                  ))}
                </div>
              )}
            </Field>

            {isEdit && (
              <Field label="Current Balance (৳)" required error={errors.balance} hint="Admin adjustment — use with care">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">৳</span>
                  <input
                    type="number" min="0" step="1"
                    className={`${inp} pl-6`}
                    value={form.balance}
                    onChange={e => set('balance', e.target.value)}
                  />
                </div>
              </Field>
            )}
          </Section>

          {/* Section: Recipient */}
          <Section title="Recipient & Sender">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Recipient Name">
                <input className={inp} placeholder="e.g. Rahim Uddin" value={form.recipientName} onChange={e => set('recipientName', e.target.value)} />
              </Field>
              <Field label="Recipient Email" error={errors.recipientEmail} hint={form.type === 'digital' ? 'Required for digital delivery' : 'Optional'}>
                <input type="email" className={inp} placeholder="rahim@example.com" value={form.recipientEmail} onChange={e => set('recipientEmail', e.target.value)} />
              </Field>
            </div>
            <Field label="Sender Name" hint="Shown on the gift card">
              <input className={inp} placeholder="e.g. Karim" value={form.senderName} onChange={e => set('senderName', e.target.value)} />
            </Field>
            <Field label="Personal Message" hint={`${(form.message || '').length}/300 characters`}>
              <textarea
                rows={3}
                maxLength={300}
                className={txt}
                placeholder="Happy Birthday! Enjoy your gift…"
                value={form.message}
                onChange={e => set('message', e.target.value)}
              />
            </Field>
          </Section>

          {/* Section: Validity */}
          <Section title="Validity Period">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Issue Date" hint="Leave empty for today">
                <input type="date" className={`${inp} text-slate-300`} value={form.issuedAt} onChange={e => set('issuedAt', e.target.value)} />
              </Field>
              <Field label="Expiry Date" hint="Leave empty for no expiry" error={errors.expiresAt}>
                <input type="date" className={`${inp} text-slate-300`} value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
              </Field>
            </div>
          </Section>

          {/* Section: Delivery & Status */}
          <Section title="Delivery & Status">
            {!isEdit && form.type === 'digital' && (
              <button
                type="button"
                onClick={() => set('sendEmailNow', !form.sendEmailNow)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                  form.sendEmailNow
                    ? 'bg-sky-500/5 border-sky-500/20 text-sky-400'
                    : 'bg-[#0a0a0f] border-[#1e1e2e] text-slate-500'
                }`}
              >
                <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.sendEmailNow ? 'bg-sky-500' : 'bg-[#1e1e2e]'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.sendEmailNow ? 'left-5' : 'left-0.5'}`} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Send email to recipient now</p>
                  <p className="text-xs text-slate-600">Delivery email will be queued after creation.</p>
                </div>
              </button>
            )}

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
                <p className="text-xs text-slate-600">{form.isActive ? 'Recipients can redeem this gift card.' : 'Card is disabled and cannot be redeemed.'}</p>
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
            {isEdit ? 'Save Changes' : 'Issue Gift Card'}
          </button>
        </div>
      </div>
    </div>
  );
}
