// 📁 PATH: src/components/admin/couriers/CourierFormModal.jsx
'use client';
import { useState, useEffect } from 'react';
import { COURIER_TYPES, SERVICE_TYPES } from './_dummyData';

const BD_DIVISIONS = ['Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];

const inp = "w-full h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors";
const lbl = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5";

const empty = {
  name: '', code: '', logo: '📦', type: 'third_party',
  apiIntegrated: false, apiStatus: 'manual',
  contactPerson: '', phone: '', email: '', website: '',
  coverageAreas: ['Dhaka'], serviceTypes: ['regular'],
  baseRate: 70, perKgRate: 25, codChargePercent: 1.0, pickupCharge: 0,
  insuranceAvailable: false, avgDeliveryHours: 48,
  successRate: 90, returnRate: 10, rating: 4.0,
  activeShipments: 0, completedShipments: 0,
  isActive: true, isPreferred: false, notes: '',
};

export default function CourierFormModal({ open, editing, onSave, onClose }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) { setForm(editing ? { ...empty, ...editing } : empty); setErrors({}); }
  }, [open, editing]);

  if (!open) return null;
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleArr = (key, val) => {
    upd(key, form[key].includes(val) ? form[key].filter(x => x !== val) : [...form[key], val]);
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.code.trim()) errs.code = 'Required';
    if (!form.phone.trim()) errs.phone = 'Required';
    if (form.coverageAreas.length === 0) errs.coverage = 'Select at least 1';
    if (form.serviceTypes.length === 0) errs.service = 'Select at least 1';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      ...form,
      baseRate: +form.baseRate, perKgRate: +form.perKgRate,
      codChargePercent: +form.codChargePercent, pickupCharge: +form.pickupCharge || 0,
      avgDeliveryHours: +form.avgDeliveryHours || 48,
      successRate: +form.successRate, returnRate: +form.returnRate,
      rating: +form.rating,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{editing ? 'Edit Courier' : 'Add Courier Partner'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Configure delivery partner & API connection</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-2">
              <label className={lbl}>Logo</label>
              <input className={`${inp} text-center text-xl`} value={form.logo} onChange={e => upd('logo', e.target.value)} maxLength={2} />
            </div>
            <div className="col-span-6">
              <label className={lbl}>Courier Name *</label>
              <input className={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Pathao Courier" />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div className="col-span-4">
              <label className={lbl}>Code *</label>
              <input className={`${inp} font-mono uppercase`} value={form.code} onChange={e => upd('code', e.target.value.toUpperCase())} placeholder="PATHAO" />
              {errors.code && <p className="text-xs text-red-400 mt-1">{errors.code}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Type</label>
              <select className={inp} value={form.type} onChange={e => upd('type', e.target.value)}>
                {COURIER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>API Status</label>
              <select className={inp} value={form.apiStatus} onChange={e => upd('apiStatus', e.target.value)}>
                <option value="manual">Manual Entry</option>
                <option value="connected">Connected</option>
                <option value="disconnected">Disconnected</option>
              </select>
            </div>
          </div>

          <div className="border-t border-[#1e1e2e] pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">📞 Contact</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Contact Person</label>
                <input className={inp} value={form.contactPerson} onChange={e => upd('contactPerson', e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Phone *</label>
                <input className={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+8801XXXXXXXXX" />
                {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input className={inp} value={form.email} onChange={e => upd('email', e.target.value)} type="email" />
              </div>
              <div>
                <label className={lbl}>Website</label>
                <input className={inp} value={form.website} onChange={e => upd('website', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="border-t border-[#1e1e2e] pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">💰 Rates</p>
            <div className="grid grid-cols-4 gap-3">
              <div><label className={lbl}>Base ৳</label><input type="number" min="0" className={inp} value={form.baseRate} onChange={e => upd('baseRate', e.target.value)} /></div>
              <div><label className={lbl}>Per Kg ৳</label><input type="number" min="0" className={inp} value={form.perKgRate} onChange={e => upd('perKgRate', e.target.value)} /></div>
              <div><label className={lbl}>COD %</label><input type="number" min="0" step="0.1" className={inp} value={form.codChargePercent} onChange={e => upd('codChargePercent', e.target.value)} /></div>
              <div><label className={lbl}>Pickup ৳</label><input type="number" min="0" className={inp} value={form.pickupCharge} onChange={e => upd('pickupCharge', e.target.value)} /></div>
            </div>
          </div>

          <div className="border-t border-[#1e1e2e] pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">🗺️ Coverage</p>
            <div className="flex flex-wrap gap-2">
              {BD_DIVISIONS.map(d => {
                const s = form.coverageAreas.includes(d);
                return (
                  <button type="button" key={d} onClick={() => toggleArr('coverageAreas', d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${s ? 'bg-orange-500/15 border-orange-500/40 text-orange-300' : 'bg-[#111118] border-[#1e1e2e] text-slate-400 hover:border-slate-600'}`}>
                    {s && '✓ '}{d}
                  </button>
                );
              })}
            </div>
            {errors.coverage && <p className="text-xs text-red-400 mt-1">{errors.coverage}</p>}
          </div>

          <div>
            <p className={lbl}>Service Types</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES.map(s => {
                const sel = form.serviceTypes.includes(s);
                return (
                  <button type="button" key={s} onClick={() => toggleArr('serviceTypes', s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${sel ? 'bg-sky-500/15 border-sky-500/40 text-sky-300' : 'bg-[#111118] border-[#1e1e2e] text-slate-400 hover:border-slate-600'}`}>
                    {sel && '✓ '}{s.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
            {errors.service && <p className="text-xs text-red-400 mt-1">{errors.service}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.isActive} onChange={e => upd('isActive', e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.isPreferred} onChange={e => upd('isPreferred', e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
              ⭐ Mark as Preferred
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.insuranceAvailable} onChange={e => upd('insuranceAvailable', e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
              Insurance Available
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.apiIntegrated} onChange={e => upd('apiIntegrated', e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
              API Integrated
            </label>
          </div>

          <div>
            <label className={lbl}>Notes</label>
            <textarea rows={2} className={`${inp} h-auto py-2`} value={form.notes} onChange={e => upd('notes', e.target.value)} placeholder="Internal notes…" />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-[#1e1e2e] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-900/30">
            {editing ? 'Update Courier' : 'Add Courier'}
          </button>
        </div>
      </div>
    </div>
  );
}
