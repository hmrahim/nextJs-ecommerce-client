'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Quarterly'];
const REPORT_OPTS  = ['Revenue Report', 'Orders Report', 'Customer Report', 'Product Performance', 'Full Dashboard'];
const FORMAT_OPTS  = ['PDF', 'XLSX', 'CSV'];

export default function ReportScheduler({ onClose }) {
  const { register, watch, setValue, handleSubmit: rhfHandleSubmit } = useForm({
    defaultValues: {
      name: '',
      frequency: 'Weekly',
      report: 'Revenue Report',
      format: 'PDF',
      email: '',
      day: 'Monday',
      time: '08:00',
    },
  });
  const form = watch();
  const setForm = (updater) => {
    const next = typeof updater === 'function' ? updater(form) : updater;
    Object.entries(next).forEach(([k, v]) => setValue(k, v, { shouldDirty: true }));
  };
  const [saved, setSaved] = useState(false);

  const handleSave = rhfHandleSubmit(() => {
    setSaved(true);
    setTimeout(onClose, 1400);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/60 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Schedule Report
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Automatically deliver reports to your inbox.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        {saved ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">✓</div>
            <p className="text-white font-semibold">Schedule saved!</p>
            <p className="text-xs text-slate-400">Your report will be delivered as scheduled.</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Schedule name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Schedule Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Weekly Revenue Digest"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Report type */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Report</label>
                <select
                  value={form.report}
                  onChange={e => setForm(p => ({ ...p, report: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {REPORT_OPTS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Format</label>
                <div className="flex gap-1.5">
                  {FORMAT_OPTS.map(f => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => setForm(p => ({ ...p, format: f }))}
                      className={`flex-1 py-2 text-xs rounded-lg font-medium border transition-all ${
                        form.format === f
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Frequency</label>
              <div className="flex gap-1.5">
                {FREQUENCIES.map(f => (
                  <button
                    type="button"
                    key={f}
                    onClick={() => setForm(p => ({ ...p, frequency: f }))}
                    className={`flex-1 py-2 text-xs rounded-lg font-medium border transition-all ${
                      form.frequency === f
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : 'border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Day */}
              {form.frequency === 'Weekly' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Day of Week</label>
                  <select
                    value={form.day}
                    onChange={e => setForm(p => ({ ...p, day: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              )}

              {/* Time */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Delivery Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Deliver to</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@yourstore.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Preview summary */}
            <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 px-4 py-3">
              <p className="text-xs text-slate-400">
                <span className="text-slate-300 font-medium">{form.report}</span> will be sent as{' '}
                <span className="text-indigo-300">{form.format}</span>{' '}
                {form.frequency === 'Weekly' ? `every ${form.day}` : form.frequency.toLowerCase()}{' '}
                at <span className="text-slate-300">{form.time}</span>
                {form.email && <> to <span className="text-slate-300">{form.email}</span></>}.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:text-white transition-all">
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                Save Schedule
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
