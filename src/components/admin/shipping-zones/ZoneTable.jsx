// 📁 PATH: src/components/admin/shipping-zones/ZoneTable.jsx
'use client';
import { useState } from 'react';
import { ZONE_TYPES } from './_dummyData';

const TYPE_MAP = Object.fromEntries(ZONE_TYPES.map(t => [t.value, t]));

function ConfirmDeleteModal({ zone, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-center mb-1">Delete Shipping Zone?</h3>
        <p className="text-slate-400 text-sm text-center mb-5">
          "<span className="text-orange-400 font-semibold">{zone?.name}</span>" permanently delete হবে।
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function ZoneTable({ zones, loading, selected, onSelectChange, onEdit, onDelete, onToggle }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const allSelected = zones.length > 0 && selected.length === zones.length;
  const toggleAll = () => onSelectChange(allSelected ? [] : zones.map(z => z._id));
  const toggleOne = (id) => onSelectChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-8 flex items-center justify-center gap-3 text-slate-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading zones…
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-orange-500" />
                </th>
                {['Zone', 'Type', 'Coverage', 'Base Rate', 'Per Kg', 'Free Above', 'ETA', 'COD', 'Orders (30d)', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2e]">
              {zones.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      No shipping zones found
                    </div>
                  </td>
                </tr>
              ) : zones.map(z => {
                const t = TYPE_MAP[z.type] || TYPE_MAP.city;
                return (
                  <tr key={z._id} className={`group hover:bg-white/[0.02] transition-colors ${selected.includes(z._id) ? 'bg-orange-500/5' : ''} ${!z.isActive ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(z._id)} onChange={() => toggleOne(z._id)} className="w-4 h-4 rounded border-[#1e1e2e] bg-[#16161f] accent-orange-500" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">#{z.priority}</span>
                        <div>
                          <p className="text-white font-medium text-sm">{z.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{z.code} · {z.division}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${t.cls}`}>{t.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[180px]">
                        <p className="text-xs text-slate-400 truncate" title={z.regions.join(', ')}>{z.regions.slice(0, 2).join(', ')}{z.regions.length > 2 ? ` +${z.regions.length - 2}` : ''}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{z.regions.length} areas</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-200 font-semibold whitespace-nowrap">৳{z.baseRate}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">৳{z.perKgRate}/kg</td>
                    <td className="px-4 py-3 text-emerald-400 text-xs whitespace-nowrap">{z.freeShippingThreshold ? `৳${z.freeShippingThreshold.toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">{z.estimatedDays.min}-{z.estimatedDays.max}d</td>
                    <td className="px-4 py-3">
                      {z.codAvailable
                        ? <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ৳{z.codCharge}</span>
                        : <span className="text-xs text-slate-600">No COD</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm font-semibold">{z.orders30d.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => onToggle(z._id)} className={`relative w-10 h-5 rounded-full transition-colors ${z.isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${z.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(z)} className="p-1.5 rounded-md text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(z)} className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          zone={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { onDelete(deleteTarget._id); setDeleteTarget(null); }}
        />
      )}
    </>
  );
}
