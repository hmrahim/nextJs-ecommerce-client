// 📁 PATH: src/components/admin/campaigns/CampaignTable.jsx
// ⚠️  This is a completely new file

'use client';
import { useState } from 'react';

const STATUS_CFG = {
  draft:     { label: 'Draft',     cls: 'bg-slate-700/30 text-slate-400 border-slate-700/50' },
  scheduled: { label: 'Scheduled', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  running:   { label: 'Running',   cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  paused:    { label: 'Paused',    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  completed: { label: 'Completed', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  archived:  { label: 'Archived',  cls: 'bg-slate-700/30 text-slate-500 border-slate-700/50' },
};
const CHANNEL_CFG = {
  email:    { label: 'Email',    icon: '📧', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  sms:      { label: 'SMS',      icon: '💬', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  push:     { label: 'Push',     icon: '🔔', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  whatsapp: { label: 'WhatsApp', icon: '🟢', cls: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  in_app:   { label: 'In-App',   icon: '🛍', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
};

function Metric({ label, value, hint, color = 'text-slate-300' }) {
  return (
    <div className="min-w-[58px]">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-sm font-semibold ${color}`}>{value}</p>
      {hint && <p className="text-[10px] text-slate-600">{hint}</p>}
    </div>
  );
}

function fmt(n) { return new Intl.NumberFormat('en-US').format(n || 0); }
function pct(a, b) { if (!b) return '0%'; return ((a / b) * 100).toFixed(1) + '%'; }

function ConfirmDelete({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </div>
        <h3 className="text-white font-semibold text-center mb-1">Delete Campaign?</h3>
        <p className="text-slate-400 text-sm text-center mb-5">"<span className="text-orange-400 font-semibold">{name}</span>" permanently delete will be।</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function CampaignTable({ campaigns, loading, selected, onSelectChange, onEdit, onDelete, onDuplicate, onLaunch, onPause, pagination, onPageChange }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuFor, setMenuFor] = useState(null);

  const allSelected = campaigns.length > 0 && selected.length === campaigns.length;
  const toggleAll = () => onSelectChange(allSelected ? [] : campaigns.map(c => c._id));
  const toggleOne = (id) => onSelectChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] p-12 text-center">
        <div className="w-10 h-10 mx-auto border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm mt-3">Loading campaigns…</p>
      </div>
    );
  }

  if (!campaigns.length) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] p-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
        </div>
        <h3 className="text-white font-semibold">No campaigns found</h3>
        <p className="text-slate-500 text-sm mt-1">Create your first marketing campaign to reach customers.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#111118] border-b border-[#1e1e2e]">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" />
              </th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Audience</th>
              <th className="px-4 py-3">Performance</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Schedule</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e2e]">
            {campaigns.map(c => {
              const ch = CHANNEL_CFG[c.channel] || CHANNEL_CFG.email;
              const st = STATUS_CFG[c.status] || STATUS_CFG.draft;
              const openRate = pct(c.openCount, c.sentCount);
              const clickRate = pct(c.clickCount, c.sentCount);
              const convRate = pct(c.conversions, c.sentCount);
              return (
                <tr key={c._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(c._id)} onChange={() => toggleOne(c._id)} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" />
                  </td>
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 truncate">{c.subject || c.message?.slice(0, 60) || '—'}</p>
                    {c.segment && <p className="text-[11px] text-orange-400/80 mt-0.5">🎯 {c.segment}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${ch.cls}`}>
                      <span>{ch.icon}</span> {ch.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-medium">{fmt(c.audienceSize)}</p>
                    <p className="text-xs text-slate-500">recipients</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-4">
                      <Metric label="Sent" value={fmt(c.sentCount)} />
                      <Metric label="Open" value={openRate} color="text-sky-400" />
                      <Metric label="Click" value={clickRate} color="text-violet-400" />
                      <Metric label="Conv" value={convRate} color="text-emerald-400" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-emerald-400">SAR {fmt(c.revenue)}</p>
                    <p className="text-xs text-slate-500">{fmt(c.conversions)} orders</p>
                  </td>
                  <td className="px-4 py-3">
                    {c.scheduledAt
                      ? <>
                          <p className="text-xs text-slate-300">{new Date(c.scheduledAt).toLocaleDateString('en-SA', { day: '2-digit', month: 'short' })}</p>
                          <p className="text-[11px] text-slate-500">{new Date(c.scheduledAt).toLocaleTimeString('en-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                        </>
                      : <span className="text-xs text-slate-600">Not scheduled</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-md border text-xs font-medium ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button onClick={() => setMenuFor(menuFor === c._id ? null : c._id)} className="p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-white">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm-2 4a2 2 0 104 0 2 2 0 00-4 0z" /></svg>
                      </button>
                      {menuFor === c._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                          <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-[#1e1e2e] bg-[#16161f] shadow-xl py-1">
                            <button onClick={() => { setMenuFor(null); onEdit(c); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5">✏️ Edit</button>
                            <button onClick={() => { setMenuFor(null); onDuplicate(c._id); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5">📑 Duplicate</button>
                            {(c.status === 'draft' || c.status === 'paused') && <button onClick={() => { setMenuFor(null); onLaunch(c._id); }} className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-white/5">🚀 Launch</button>}
                            {(c.status === 'running' || c.status === 'scheduled') && <button onClick={() => { setMenuFor(null); onPause(c._id); }} className="w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-white/5">⏸️ Pause</button>}
                            <div className="border-t border-[#1e1e2e] my-1" />
                            <button onClick={() => { setMenuFor(null); setDeleteTarget(c); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5">🗑 Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination?.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e2e] text-sm text-slate-400">
          <span>Page {pagination.page} of {pagination.pages} · {pagination.total} campaigns</span>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)} className="h-8 px-3 rounded-md border border-[#1e1e2e] disabled:opacity-40 hover:bg-white/5">Prev</button>
            <button disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)} className="h-8 px-3 rounded-md border border-[#1e1e2e] disabled:opacity-40 hover:bg-white/5">Next</button>
          </div>
        </div>
      )}

      {deleteTarget && <ConfirmDelete name={deleteTarget.name} onConfirm={() => { onDelete(deleteTarget._id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}
