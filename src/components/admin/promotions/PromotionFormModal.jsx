// 📁 PATH: src/components/admin/promotions/PromotionFormModal.jsx
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

'use client';
import { useState, useEffect } from 'react';

const TYPES = [
  { value: 'bogo',          label: 'Buy 1 Get 1 Free',  icon: '🎁' },
  { value: 'buy_x_get_y',   label: 'Buy X Get Y',       icon: '🔢' },
  { value: 'bundle_deal',   label: 'Bundle Deal',       icon: '📦' },
  { value: 'tier_discount', label: 'Tier Discount',     icon: '📈' },
  { value: 'cart_percent',  label: '% Cart Discount',   icon: '%'  },
  { value: 'cart_fixed',    label: '৳ Cart Fixed Off',  icon: '৳'  },
  { value: 'free_gift',     label: 'Free Gift',         icon: '🎀' },
  { value: 'free_shipping', label: 'Free Shipping',     icon: '🚚' },
];
const APPLIES = ['All Products', 'Specific Categories', 'Specific Products', 'Specific Brands', 'Customer Group'];

const empty = {
  name: '', description: '', type: 'cart_percent', appliesTo: 'All Products',
  buyQty: 1, getQty: 1, discountPercent: 10, discountAmount: 100,
  minOrderAmount: 0, maxDiscount: 0, freeGiftProduct: '',
  startsAt: '', endsAt: '', priority: 10, stackable: false, isActive: true,
  customerGroups: [], usageLimit: 0, perUserLimit: 0,
};

const ipt = 'w-full h-10 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50';
const lbl = 'block text-xs font-medium text-slate-400 mb-1.5';

export default function PromotionFormModal({ promotion, onSave, onClose }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (promotion) setForm({
      ...empty, ...promotion,
      startsAt: promotion.startsAt ? new Date(promotion.startsAt).toISOString().slice(0, 16) : '',
      endsAt:   promotion.endsAt   ? new Date(promotion.endsAt).toISOString().slice(0, 16)   : '',
    });
    else setForm(empty);
  }, [promotion]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const rewardLabel = (() => {
    switch (form.type) {
      case 'bogo':          return 'Buy 1 Get 1 Free';
      case 'buy_x_get_y':   return `Buy ${form.buyQty} Get ${form.getQty}`;
      case 'cart_percent':  return `${form.discountPercent}% off cart`;
      case 'cart_fixed':    return `৳${form.discountAmount} off cart`;
      case 'tier_discount': return 'Spend more, save more';
      case 'bundle_deal':   return `Bundle: ${form.discountPercent}% off`;
      case 'free_gift':     return `Free gift: ${form.freeGiftProduct || '—'}`;
      case 'free_shipping': return 'Free shipping';
      default: return '';
    }
  })();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (form.endsAt && form.startsAt && new Date(form.endsAt) <= new Date(form.startsAt)) e.endsAt = 'End must be after start';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...form, rewardLabel,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt:   form.endsAt   ? new Date(form.endsAt).toISOString()   : null,
      });
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e]">
          <div>
            <h2 className="text-lg font-bold text-white">{promotion ? 'Edit Promotion' : 'New Promotion'}</h2>
            <p className="text-xs text-slate-500">Build rule-based discounts like BOGO, bundles & tier deals.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className={lbl}>Promotion Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className={ipt} placeholder="e.g. Buy 2 Get 1 Free on Tees" />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className={lbl}>Description</label>
            <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)} className={`${ipt} h-auto py-2 resize-none`} placeholder="Short internal note about this promotion" />
          </div>

          <div>
            <label className={lbl}>Promotion Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => set('type', t.value)}
                  className={`flex flex-col items-start px-3 py-3 rounded-lg border text-left transition-colors ${form.type === t.value ? 'border-orange-500 bg-orange-500/10' : 'border-[#1e1e2e] bg-[#111118] hover:border-slate-700'}`}>
                  <span className="text-lg">{t.icon}</span>
                  <span className={`text-xs mt-1 ${form.type === t.value ? 'text-orange-400 font-medium' : 'text-slate-400'}`}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type-specific fields */}
          {(form.type === 'cart_percent' || form.type === 'bundle_deal' || form.type === 'tier_discount') && (
            <div className="grid grid-cols-3 gap-4">
              <div><label className={lbl}>Discount %</label><input type="number" min={0} max={100} value={form.discountPercent} onChange={e => set('discountPercent', +e.target.value)} className={ipt} /></div>
              <div><label className={lbl}>Min Order ৳</label><input type="number" min={0} value={form.minOrderAmount} onChange={e => set('minOrderAmount', +e.target.value)} className={ipt} /></div>
              <div><label className={lbl}>Max Discount ৳</label><input type="number" min={0} value={form.maxDiscount} onChange={e => set('maxDiscount', +e.target.value)} className={ipt} placeholder="0 = no cap" /></div>
            </div>
          )}
          {form.type === 'cart_fixed' && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Discount Amount ৳</label><input type="number" min={0} value={form.discountAmount} onChange={e => set('discountAmount', +e.target.value)} className={ipt} /></div>
              <div><label className={lbl}>Min Order ৳</label><input type="number" min={0} value={form.minOrderAmount} onChange={e => set('minOrderAmount', +e.target.value)} className={ipt} /></div>
            </div>
          )}
          {(form.type === 'buy_x_get_y' || form.type === 'bogo') && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Buy Quantity</label><input type="number" min={1} value={form.buyQty} onChange={e => set('buyQty', +e.target.value)} className={ipt} /></div>
              <div><label className={lbl}>Get Quantity (free)</label><input type="number" min={1} value={form.getQty} onChange={e => set('getQty', +e.target.value)} className={ipt} /></div>
            </div>
          )}
          {form.type === 'free_gift' && (
            <div><label className={lbl}>Free Gift Product</label><input value={form.freeGiftProduct} onChange={e => set('freeGiftProduct', e.target.value)} className={ipt} placeholder="e.g. Branded Tote Bag" /></div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Applies To</label>
              <select value={form.appliesTo} onChange={e => set('appliesTo', e.target.value)} className={ipt}>
                {APPLIES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Priority (high runs first)</label><input type="number" min={0} value={form.priority} onChange={e => set('priority', +e.target.value)} className={ipt} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Starts At</label>
              <input type="datetime-local" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} className={ipt} />
            </div>
            <div>
              <label className={lbl}>Ends At</label>
              <input type="datetime-local" value={form.endsAt} onChange={e => set('endsAt', e.target.value)} className={ipt} />
              {errors.endsAt && <p className="text-xs text-red-400 mt-1">{errors.endsAt}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Total Usage Limit</label><input type="number" min={0} value={form.usageLimit} onChange={e => set('usageLimit', +e.target.value)} className={ipt} placeholder="0 = unlimited" /></div>
            <div><label className={lbl}>Per-user Limit</label><input type="number" min={0} value={form.perUserLimit} onChange={e => set('perUserLimit', +e.target.value)} className={ipt} placeholder="0 = unlimited" /></div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" />
              <span className="text-sm text-slate-300">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.stackable} onChange={e => set('stackable', e.target.checked)} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" />
              <span className="text-sm text-slate-300">Stackable with coupons</span>
            </label>
          </div>

          <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
            <p className="text-xs uppercase tracking-wider text-orange-400/80 mb-1">Reward Preview</p>
            <p className="text-sm font-semibold text-white">{rewardLabel}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#1e1e2e]">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium disabled:opacity-60">{saving ? 'Saving…' : promotion ? 'Update' : 'Create Promotion'}</button>
        </div>
      </div>
    </div>
  );
}
