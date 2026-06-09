'use client';
import { useState } from 'react';
import { DisputeStatusBadge, PriorityBadge, DISPUTE_TYPE, DISPUTE_STATUS } from './DisputesTable';

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-3 py-1">
      <span className="text-xs text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-xs text-slate-300 text-right">{value || '—'}</span>
    </div>
  );
}

const TIMELINE_ICON = {
  open:              { icon: '🔴', bg: 'bg-red-500/20' },
  under_review:      { icon: '🔍', bg: 'bg-amber-500/20' },
  awaiting_customer: { icon: '💬', bg: 'bg-sky-500/20' },
  resolved:          { icon: '✅', bg: 'bg-emerald-500/20' },
  closed:            { icon: '🔒', bg: 'bg-slate-500/20' },
  escalated:         { icon: '🚨', bg: 'bg-rose-500/20' },
  note:              { icon: '📝', bg: 'bg-violet-500/20' },
  refund_issued:     { icon: '💳', bg: 'bg-emerald-500/20' },
};

export default function DisputeDetailModal({ dispute, onClose, onUpdateStatus }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [updating, setUpdating] = useState(false);

  if (!dispute) return null;

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    await onUpdateStatus(dispute._id, newStatus, resolution);
    setUpdating(false);
    setNewStatus('');
    setResolution('');
  };

  const NEXT_STATUS = {
    open:              ['under_review', 'awaiting_customer', 'escalated', 'closed'],
    under_review:      ['awaiting_customer', 'resolved', 'escalated', 'closed'],
    awaiting_customer: ['under_review', 'resolved', 'closed'],
    escalated:         ['under_review', 'resolved', 'closed'],
    resolved:          ['closed'],
  };

  const availableStatuses = NEXT_STATUS[dispute.status] || [];
  const timeline = dispute.timeline || [];
  const messages = dispute.messages || [];
  const evidence = dispute.evidence || [];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'messages', label: `Messages ${messages.length > 0 ? `(${messages.length})` : ''}` },
    { id: 'evidence', label: 'Evidence' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'resolve', label: 'Resolve' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#0e0e17] border border-[#1e1e2e] rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-lg">{dispute.disputeId}</h2>
                <PriorityBadge priority={dispute.priority} />
              </div>
              <p className="text-slate-500 text-xs">Order {dispute.orderNumber} · Opened {new Date(dispute.openedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DisputeStatusBadge status={dispute.status} />
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#1e1e2e] flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
                activeTab === tab.id
                  ? 'text-violet-400 border-violet-500'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* SLA warning */}
              {dispute.slaDeadline && new Date(dispute.slaDeadline) < new Date() && !['resolved','closed'].includes(dispute.status) && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  SLA Breached — This dispute is overdue for resolution.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Section title="Customer">
                  <p className="text-white font-medium">{dispute.customerName}</p>
                  <p className="text-slate-400 text-sm mt-0.5">{dispute.customerEmail}</p>
                  <p className="text-slate-500 text-xs mt-1">Total orders: {dispute.customerOrderCount || '—'}</p>
                </Section>

                <Section title="Dispute Info">
                  <div className="space-y-0.5">
                    <InfoRow label="Type" value={DISPUTE_TYPE[dispute.type] || dispute.type} />
                    <InfoRow label="Claimed Amount" value={`$${dispute.claimedAmount?.toFixed(2)}`} />
                    <InfoRow label="Order Total" value={`$${dispute.orderTotal?.toFixed(2)}`} />
                    <InfoRow label="Payment Method" value={dispute.paymentMethod} />
                  </div>
                </Section>
              </div>

              <Section title="Customer's Complaint">
                <p className="text-slate-300 text-sm leading-relaxed">{dispute.description || 'No description provided.'}</p>
              </Section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Section title="Assignment">
                  <div className="space-y-0.5">
                    <InfoRow label="Assigned To" value={dispute.assignedTo || 'Unassigned'} />
                    <InfoRow label="Team" value={dispute.team || '—'} />
                    <InfoRow label="SLA Deadline" value={dispute.slaDeadline ? new Date(dispute.slaDeadline).toLocaleString() : '—'} />
                  </div>
                </Section>

                <Section title="Resolution">
                  <div className="space-y-0.5">
                    <InfoRow label="Resolution Type" value={dispute.resolutionType || 'Pending'} />
                    <InfoRow label="Refund Issued" value={dispute.refundIssued ? `$${dispute.refundIssued.toFixed(2)}` : '—'} />
                    <InfoRow label="Resolved At" value={dispute.resolvedAt ? new Date(dispute.resolvedAt).toLocaleString() : '—'} />
                  </div>
                </Section>
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.sender === 'admin' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    msg.sender === 'admin' ? 'bg-violet-500/20 text-violet-400' : 'bg-sky-500/20 text-sky-400'
                  }`}>
                    {msg.sender === 'admin' ? 'A' : msg.name?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <div className={`max-w-[75%] ${msg.sender === 'admin' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{msg.name}</span>
                      <span className="text-xs text-slate-600">{new Date(msg.sentAt).toLocaleString()}</span>
                      {msg.isInternal && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Internal</span>
                      )}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl text-sm text-slate-200 leading-relaxed ${
                      msg.sender === 'admin'
                        ? 'bg-violet-500/10 border border-violet-500/20 rounded-tr-sm'
                        : 'bg-[#1e1e2e] border border-[#2a2a3a] rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {/* Reply box */}
              <div className="mt-6 rounded-xl border border-[#2a2a3a] bg-[#13131a] p-4">
                <textarea
                  placeholder="Write a reply to the customer…"
                  rows={3}
                  value={internalNote}
                  onChange={e => setInternalNote(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none outline-none"
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e1e2e]">
                  <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <input type="checkbox" className="accent-amber-500" />
                    Mark as internal note
                  </label>
                  <button className="px-4 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-xs font-semibold rounded-lg transition-colors">
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EVIDENCE */}
          {activeTab === 'evidence' && (
            <div className="space-y-3">
              {evidence.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <p className="text-sm">No evidence uploaded</p>
                </div>
              ) : evidence.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#1e1e2e] bg-[#13131a] hover:border-[#2a2a3a] transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{e.name}</p>
                    <p className="text-xs text-slate-500">Uploaded by {e.uploadedBy} · {new Date(e.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors px-3 py-1.5 rounded-lg border border-violet-500/20 hover:bg-violet-500/10">
                    View
                  </button>
                </div>
              ))}
              <button className="w-full mt-2 py-3 rounded-xl border border-dashed border-[#2a2a3a] text-slate-500 hover:text-slate-300 hover:border-[#3a3a4a] text-xs font-medium transition-colors">
                + Upload Evidence
              </button>
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-1">
              {timeline.length === 0 ? (
                <p className="text-center py-12 text-slate-600 text-sm">No timeline events yet</p>
              ) : timeline.map((event, i) => {
                const cfg = TIMELINE_ICON[event.type] || TIMELINE_ICON.note;
                return (
                  <div key={i} className="flex gap-4 relative">
                    {i < timeline.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-0 w-px bg-[#1e1e2e]" />
                    )}
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center text-base flex-shrink-0 z-10`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-white font-medium">{event.label}</p>
                        <span className="text-xs text-slate-500 flex-shrink-0">{new Date(event.at).toLocaleString()}</span>
                      </div>
                      {event.note && <p className="text-xs text-slate-400 mt-1">{event.note}</p>}
                      {event.by && <p className="text-xs text-slate-600 mt-0.5">by {event.by}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* RESOLVE */}
          {activeTab === 'resolve' && (
            <div className="space-y-5">
              {['resolved','closed'].includes(dispute.status) ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  This dispute has been {dispute.status}.
                </div>
              ) : (
                <>
                  {/* Change Status */}
                  <Section title="Update Status">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {availableStatuses.map(s => {
                          const cfg = DISPUTE_STATUS[s];
                          return (
                            <button
                              key={s}
                              onClick={() => setNewStatus(s)}
                              className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                                newStatus === s
                                  ? `${cfg.cls} scale-[1.02]`
                                  : 'border-[#2a2a3a] text-slate-400 hover:border-[#3a3a4a] hover:text-slate-200'
                              }`}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        placeholder="Resolution note (required for status change)…"
                        rows={3}
                        value={resolution}
                        onChange={e => setResolution(e.target.value)}
                        className="w-full bg-[#13131a] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/50 resize-none"
                      />
                      <button
                        onClick={handleStatusUpdate}
                        disabled={!newStatus || !resolution || updating}
                        className="w-full py-2.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                      >
                        {updating ? 'Updating…' : `Set as ${newStatus ? DISPUTE_STATUS[newStatus]?.label : '—'}`}
                      </button>
                    </div>
                  </Section>

                  {/* Refund */}
                  <Section title="Issue Refund">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                          <input
                            type="number"
                            placeholder={`Max: ${dispute.claimedAmount?.toFixed(2)}`}
                            value={refundAmount}
                            onChange={e => setRefundAmount(e.target.value)}
                            className="w-full pl-7 pr-4 py-2.5 bg-[#13131a] border border-[#2a2a3a] rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500/50"
                          />
                        </div>
                        <button
                          onClick={() => setRefundAmount(dispute.claimedAmount?.toFixed(2))}
                          className="text-xs text-slate-500 hover:text-slate-300 px-3 py-2.5 border border-[#2a2a3a] rounded-xl transition-colors"
                        >
                          Full
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['Full Refund', 'Partial Refund', 'Replacement'].map(t => (
                          <button key={t} className="px-3 py-2 rounded-lg text-xs text-slate-400 border border-[#2a2a3a] hover:border-emerald-500/30 hover:text-emerald-400 transition-colors">
                            {t}
                          </button>
                        ))}
                      </div>
                      <button className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-xl transition-colors">
                        Issue Refund
                      </button>
                    </div>
                  </Section>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
