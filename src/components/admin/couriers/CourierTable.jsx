// 📁 PATH: src/components/admin/couriers/CourierTable.jsx
'use client';
import { useState } from 'react';
import { COURIER_TYPES, API_STATUS } from './_dummyData';

const TYPE_MAP = Object.fromEntries(COURIER_TYPES.map(t => [t.value, t]));

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400 text-xs">
      ★ <span className="text-slate-300 font-semibold">{rating.toFixed(1)}</span>
    </span>
  );
}

function ConfirmDeleteModal({ courier, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-center mb-1">Remove Courier?</h3>
        <p className="text-slate-400 text-sm text-center mb-5">"<span className="text-orange-400 font-semibold">{courier?.name}</span>" courier list theke remove hobe।</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">Remove</button>
        </div>
      </div>
    </div>
  );
}

export default function CourierTable({ couriers, loading, onEdit, onDelete, onToggle, onTestApi }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [testing, setTesting] = useState(null);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-8 flex items-center justify-center gap-3 text-slate-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        Loading couriers…
      </div>
    );
  }

  const handleTest = async (id) => {
    setTesting(id);
    setTimeout(() => { setTesting(null); onTestApi?.(id); }, 1200);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {couriers.length === 0 && (
          <div className="col-span-full rounded-2xl border border-[#1e1e2e] bg-[#111118] p-12 text-center text-slate-500">
            No couriers found
          </div>
        )}

        {couriers.map(c => {
          const t = TYPE_MAP[c.type];
          const api = API_STATUS[c.apiStatus];
          return (
            <div key={c._id} className={`rounded-2xl border border-[#1e1e2e] bg-[#111118] p-5 flex flex-col gap-4 hover:border-orange-500/30 transition-colors ${!c.isActive ? 'opacity-60' : ''}`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                    {c.logo}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-white font-bold truncate">{c.name}</h3>
                      {c.isPreferred && <span title="Preferred" className="text-amber-400 text-xs">⭐</span>}
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{c.code}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${t.cls}`}>{t.label}</span>
                      <Stars rating={c.rating} />
                    </div>
                  </div>
                </div>
                <button onClick={() => onToggle(c._id)} className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${c.isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${c.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* API status */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${api.cls}`}>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className={`w-2 h-2 rounded-full ${api.dot} ${c.apiStatus === 'connected' ? 'animate-pulse' : ''}`} />
                  API: {api.label}
                </div>
                {c.apiIntegrated && (
                  <button onClick={() => handleTest(c._id)} disabled={testing === c._id} className="text-xs font-semibold hover:underline disabled:opacity-50">
                    {testing === c._id ? 'Testing…' : 'Test'}
                  </button>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-[#0c0c12]">
                  <p className="text-[10px] text-slate-500 uppercase">Success</p>
                  <p className="text-sm font-bold text-emerald-400">{c.successRate.toFixed(1)}%</p>
                </div>
                <div className="p-2 rounded-lg bg-[#0c0c12]">
                  <p className="text-[10px] text-slate-500 uppercase">Return</p>
                  <p className="text-sm font-bold text-amber-400">{c.returnRate.toFixed(1)}%</p>
                </div>
                <div className="p-2 rounded-lg bg-[#0c0c12]">
                  <p className="text-[10px] text-slate-500 uppercase">Avg ETA</p>
                  <p className="text-sm font-bold text-sky-400">{Math.round(c.avgDeliveryHours / 24)}d</p>
                </div>
              </div>

              {/* Rates */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 rounded-md bg-[#0c0c12]">
                  <span className="text-slate-500">Base</span><span className="text-slate-200 font-semibold">SAR {c.baseRate}</span>
                </div>
                <div className="flex justify-between p-2 rounded-md bg-[#0c0c12]">
                  <span className="text-slate-500">/Kg</span><span className="text-slate-200 font-semibold">SAR {c.perKgRate}</span>
                </div>
                <div className="flex justify-between p-2 rounded-md bg-[#0c0c12]">
                  <span className="text-slate-500">COD</span><span className="text-slate-200 font-semibold">{c.codChargePercent}%</span>
                </div>
                <div className="flex justify-between p-2 rounded-md bg-[#0c0c12]">
                  <span className="text-slate-500">Pickup</span><span className="text-slate-200 font-semibold">{c.pickupCharge ? `SAR ${c.pickupCharge}` : 'Free'}</span>
                </div>
              </div>

              {/* Shipments */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-[#1e1e2e] pt-3">
                <span>🚚 Active: <span className="text-white font-semibold">{c.activeShipments.toLocaleString()}</span></span>
                <span>✓ Delivered: <span className="text-white font-semibold">{c.completedShipments.toLocaleString()}</span></span>
              </div>

              {/* Coverage */}
              <div className="text-xs">
                <p className="text-slate-500 mb-1">Coverage: <span className="text-slate-300">{c.coverageAreas.length} divisions</span></p>
                <div className="flex flex-wrap gap-1">
                  {c.coverageAreas.slice(0, 4).map(a => (
                    <span key={a} className="px-1.5 py-0.5 rounded bg-[#0c0c12] text-slate-400 text-[10px]">{a}</span>
                  ))}
                  {c.coverageAreas.length > 4 && <span className="px-1.5 py-0.5 rounded bg-[#0c0c12] text-slate-500 text-[10px]">+{c.coverageAreas.length - 4}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <button onClick={() => onEdit(c)} className="flex-1 px-3 py-2 rounded-lg border border-[#1e1e2e] text-slate-300 text-xs font-medium hover:bg-white/5 hover:border-orange-500/30 transition-colors">
                  ✏️ Edit
                </button>
                <button onClick={() => setDeleteTarget(c)} className="px-3 py-2 rounded-lg border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors">
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal courier={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={() => { onDelete(deleteTarget._id); setDeleteTarget(null); }} />
      )}
    </>
  );
}
