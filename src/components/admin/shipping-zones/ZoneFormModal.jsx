// 📁 PATH: src/components/admin/shipping-zones/ZoneFormModal.jsx
'use client';
import { useState, useEffect } from 'react';
import { ZONE_TYPES, BD_DIVISIONS } from './_dummyData';

const COURIER_OPTIONS = ['Pathao', 'Steadfast', 'RedX', 'Paperfly', 'Sundarban', 'SA Paribahan', 'eCourier'];

const inp = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors";
const lbl = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5";

const emptyZone = {
  name: '', code: '', type: 'city', division: 'Dhaka',
  regions: [], baseRate: 60, perKgRate: 20, freeShippingThreshold: 1500,
  estimatedDays: { min: 1, max: 2 },
  codAvailable: true, codCharge: 15,
  isActive: true, priority: 99,
  couriersAllowed: ['Pathao', 'Steadfast'],
};

export default function ZoneFormModal({ open, editing, onSave, onClose }) {
  const [form, setForm] = useState(emptyZone);
  const [regionInput, setRegionInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(editing ? { ...emptyZone, ...editing } : emptyZone);
      setRegionInput('');
      setErrors({});
    }
  }, [open, editing]);

  if (!open) return null;

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updETA = (k, v) => setForm(f => ({ ...f, estimatedDays: { ...f.estimatedDays, [k]: Math.max(1, +v || 1) } }));

  const addRegion = () => {
    const r = regionInput.trim();
    if (!r || form.regions.includes(r)) return;
    upd('regions', [...form.regions, r]);
    setRegionInput('');
  };
  const removeRegion = (r) => upd('regions', form.regions.filter(x => x !== r));

  const toggleCourier = (c) => {
    upd('couriersAllowed', form.couriersAllowed.includes(c)
      ? form.couriersAllowed.filter(x => x !== c)
      : [...form.couriersAllowed, c]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Zone name required';
    if (!form.code.trim()) errs.code = 'Code required';
    if (form.regions.length === 0) errs.regions = 'Add at least 1 region';
    if (form.baseRate < 0) errs.baseRate = 'Invalid';
    if (form.estimatedDays.max < form.estimatedDays.min) errs.eta = 'Max must be ≥ min';
    if (form.couriersAllowed.length === 0) errs.couriers = 'Select at least 1 courier';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      ...form,
      baseRate: +form.baseRate, perKgRate: +form.perKgRate,
      freeShippingThreshold: +form.freeShippingThreshold || 0,
      codCharge: +form.codCharge || 0, priority: +form.priority || 99,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{editing ? 'Edit Shipping Zone' : 'New Shipping Zone'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Configure regional shipping rates & delivery options</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Zone Name *</label>
              <input className={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="e.g. Dhaka City (Inside)" />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className={lbl}>Zone Code *</label>
              <input className={`${inp} font-mono uppercase`} value={form.code} onChange={e => upd('code', e.target.value.toUpperCase())} placeholder="DHK-IN" />
              {errors.code && <p className="text-xs text-red-400 mt-1">{errors.code}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Type *</label>
              <select className={inp} value={form.type} onChange={e => upd('type', e.target.value)}>
                {ZONE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Division *</label>
              <select className={inp} value={form.division} onChange={e => upd('division', e.target.value)}>
                {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Priority</label>
              <input type="number" min="1" className={inp} value={form.priority} onChange={e => upd('priority', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={lbl}>Regions / Areas Covered *</label>
            <div className="flex gap-2 mb-2">
              <input
                className={inp}
                value={regionInput}
                onChange={e => setRegionInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRegion(); } }}
                placeholder="Type area name and press Enter…"
              />
              <button type="button" onClick={addRegion} className="px-4 h-9 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-colors whitespace-nowrap">+ Add</button>
            </div>
            {form.regions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-[#111118] border border-[#1e1e2e]">
                {form.regions.map(r => (
                  <span key={r} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs">
                    {r}
                    <button type="button" onClick={() => removeRegion(r)} className="hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            )}
            {errors.regions && <p className="text-xs text-red-400 mt-1">{errors.regions}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Base Rate (SAR )</label>
              <input type="number" min="0" className={inp} value={form.baseRate} onChange={e => upd('baseRate', e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Per Kg Rate (SAR )</label>
              <input type="number" min="0" className={inp} value={form.perKgRate} onChange={e => upd('perKgRate', e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Free Shipping Above (SAR )</label>
              <input type="number" min="0" className={inp} value={form.freeShippingThreshold} onChange={e => upd('freeShippingThreshold', e.target.value)} placeholder="0 = disabled" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Estimated Delivery (days)</label>
              <div className="flex items-center gap-2">
                <input type="number" min="1" className={inp} value={form.estimatedDays.min} onChange={e => updETA('min', e.target.value)} />
                <span className="text-slate-500">to</span>
                <input type="number" min="1" className={inp} value={form.estimatedDays.max} onChange={e => updETA('max', e.target.value)} />
              </div>
              {errors.eta && <p className="text-xs text-red-400 mt-1">{errors.eta}</p>}
            </div>
            <div>
              <label className={lbl}>COD Charge (SAR )</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-300 whitespace-nowrap">
                  <input type="checkbox" checked={form.codAvailable} onChange={e => upd('codAvailable', e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
                  Enabled
                </label>
                <input type="number" min="0" disabled={!form.codAvailable} className={`${inp} disabled:opacity-40`} value={form.codCharge} onChange={e => upd('codCharge', e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <label className={lbl}>Allowed Couriers *</label>
            <div className="flex flex-wrap gap-2">
              {COURIER_OPTIONS.map(c => {
                const sel = form.couriersAllowed.includes(c);
                return (
                  <button type="button" key={c} onClick={() => toggleCourier(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${sel ? 'bg-orange-500/15 border-orange-500/40 text-orange-300' : 'bg-[#111118] border-[#1e1e2e] text-slate-400 hover:border-slate-600'}`}>
                    {sel && '✓ '}{c}
                  </button>
                );
              })}
            </div>
            {errors.couriers && <p className="text-xs text-red-400 mt-1">{errors.couriers}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.isActive} onChange={e => upd('isActive', e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
            Zone Active (visible to customers at checkout)
          </label>
        </form>

        <div className="px-6 py-4 border-t border-[#1e1e2e] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-900/30">
            {editing ? 'Update Zone' : 'Create Zone'}
          </button>
        </div>
      </div>
    </div>
  );
}
