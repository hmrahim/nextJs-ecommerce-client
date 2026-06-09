'use client';
import { useState } from 'react';

/* ─── Status & Priority configs ──────────────────────────────────────────── */
export const DISPUTE_STATUS = {
  open:        { label: 'Open',        cls: 'bg-red-500/10 text-red-400 border-red-500/20',         dot: 'bg-red-400' },
  under_review:{ label: 'Under Review',cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   dot: 'bg-amber-400' },
  awaiting_customer: { label: 'Awaiting Customer', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20', dot: 'bg-sky-400' },
  resolved:    { label: 'Resolved',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  closed:      { label: 'Closed',      cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20',   dot: 'bg-slate-400' },
  escalated:   { label: 'Escalated',   cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20',      dot: 'bg-rose-400' },
};

export const DISPUTE_PRIORITY = {
  critical: { label: 'Critical', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  high:     { label: 'High',     cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  medium:   { label: 'Medium',   cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low:      { label: 'Low',      cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

export const DISPUTE_TYPE = {
  item_not_received:   'Item Not Received',
  wrong_item:          'Wrong Item Sent',
  damaged_item:        'Damaged Item',
  not_as_described:    'Not As Described',
  refund_not_received: 'Refund Not Received',
  unauthorized_charge: 'Unauthorized Charge',
  other:               'Other',
};

export function DisputeStatusBadge({ status }) {
  const cfg = DISPUTE_STATUS[status] || DISPUTE_STATUS.open;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cfg = DISPUTE_PRIORITY[priority] || DISPUTE_PRIORITY.medium;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function Avatar({ name }) {
  const initials = (name || 'UN').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const colors = [
    'bg-violet-500/20 text-violet-400',
    'bg-sky-500/20 text-sky-400',
    'bg-emerald-500/20 text-emerald-400',
    'bg-amber-500/20 text-amber-400',
    'bg-rose-500/20 text-rose-400',
  ];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-full ${color} border border-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DisputesTable({
  disputes = [],
  loading,
  selected = [],
  onSelectChange,
  onViewDispute,
  pagination,
  onPageChange,
}) {
  const [actionMenu, setActionMenu] = useState(null);

  const allSelected = disputes.length > 0 && selected.length === disputes.length;
  const toggleAll = () => onSelectChange(allSelected ? [] : disputes.map(d => d._id));
  const toggleOne = (id) => onSelectChange(
    selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
        <div className="p-12 flex items-center justify-center gap-3 text-slate-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading disputes…
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="pl-5 pr-3 py-3.5 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-[#2a2a3a] bg-[#16161f] accent-violet-500"
                />
              </th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dispute</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Opened</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned</th>
              <th className="px-3 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a26]">
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-600">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">No disputes found</p>
                  </div>
                </td>
              </tr>
            ) : disputes.map((d) => (
              <tr
                key={d._id}
                className={`group transition-colors hover:bg-white/[0.02] cursor-pointer ${selected.includes(d._id) ? 'bg-violet-500/5' : ''}`}
                onClick={() => onViewDispute(d)}
              >
                {/* Checkbox */}
                <td className="pl-5 pr-3 py-4" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.includes(d._id)}
                    onChange={() => toggleOne(d._id)}
                    className="w-4 h-4 rounded border-[#2a2a3a] bg-[#16161f] accent-violet-500"
                  />
                </td>

                {/* Dispute ID + Order */}
                <td className="px-3 py-4">
                  <div className="flex items-center gap-2">
                    {d.priority === 'critical' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 animate-pulse" />
                    )}
                    <div>
                      <p className="font-semibold text-white text-sm">{d.disputeId}</p>
                      <p className="text-xs text-slate-500">Order {d.orderNumber}</p>
                    </div>
                  </div>
                </td>

                {/* Customer */}
                <td className="px-3 py-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={d.customerName} />
                    <div>
                      <p className="text-white text-sm font-medium leading-tight">{d.customerName}</p>
                      <p className="text-xs text-slate-500">{d.customerEmail}</p>
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-3 py-4">
                  <span className="text-slate-300 text-xs">{DISPUTE_TYPE[d.type] || d.type}</span>
                </td>

                {/* Priority */}
                <td className="px-3 py-4">
                  <PriorityBadge priority={d.priority} />
                </td>

                {/* Status */}
                <td className="px-3 py-4">
                  <DisputeStatusBadge status={d.status} />
                </td>

                {/* Amount */}
                <td className="px-3 py-4">
                  <span className="text-white font-medium">${d.claimedAmount?.toFixed(2) || '—'}</span>
                </td>

                {/* Opened */}
                <td className="px-3 py-4">
                  <div>
                    <p className="text-slate-300 text-xs">{timeAgo(d.openedAt)}</p>
                    {d.slaDeadline && new Date(d.slaDeadline) < new Date() && d.status !== 'resolved' && d.status !== 'closed' && (
                      <p className="text-rose-400 text-xs font-medium">SLA Breached</p>
                    )}
                    {d.slaDeadline && new Date(d.slaDeadline) > new Date() && d.status !== 'resolved' && d.status !== 'closed' && (
                      <p className="text-amber-400 text-xs">Due {timeAgo(d.slaDeadline).replace(' ago', '')}</p>
                    )}
                  </div>
                </td>

                {/* Assigned Agent */}
                <td className="px-3 py-4">
                  {d.assignedTo
                    ? <span className="text-xs text-slate-400 bg-[#1e1e2e] px-2 py-1 rounded-md">{d.assignedTo}</span>
                    : <span className="text-xs text-slate-600 italic">Unassigned</span>
                  }
                </td>

                {/* Actions */}
                <td className="px-3 py-4" onClick={e => e.stopPropagation()}>
                  <div className="relative flex justify-end">
                    <button
                      onClick={() => setActionMenu(actionMenu === d._id ? null : d._id)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                      </svg>
                    </button>
                    {actionMenu === d._id && (
                      <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-[#2a2a3a] bg-[#16161f] shadow-2xl py-1" onMouseLeave={() => setActionMenu(null)}>
                        {[
                          { label: 'View Details', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', action: () => { onViewDispute(d); setActionMenu(null); } },
                          { label: 'Assign Agent', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', action: () => setActionMenu(null) },
                          { label: 'Escalate', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', action: () => setActionMenu(null), cls: 'text-rose-400' },
                        ].map(item => (
                          <button
                            key={item.label}
                            onClick={item.action}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5 transition-colors ${item.cls || 'text-slate-300'}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-5 py-4 border-t border-[#1e1e2e] flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {disputes.length} of {pagination.total} disputes
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${pagination.page === p ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
