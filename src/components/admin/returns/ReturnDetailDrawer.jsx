// 📁 PATH: src/components/admin/returns/ReturnDetailDrawer.jsx
// ⚠️  NEW FILE

'use client';
import { useState, useEffect } from 'react';
import { StatusChip, TypeChip } from './ReturnsTable';
import { STATUS_CONFIG, REFUND_METHODS } from './_dummyData';

const TABS = [
  { key: 'details',  label: 'Details',  icon: '📋' },
  { key: 'timeline', label: 'Timeline', icon: '⏱' },
  { key: 'notes',    label: 'Notes',    icon: '📝' },
];

function KV({ k, v, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-[#1a1a28] last:border-0">
      <span className="text-slate-500 text-sm flex-shrink-0">{k}</span>
      <span className={`text-slate-200 text-sm text-right ${mono ? 'font-mono text-xs' : ''}`}>{v ?? '—'}</span>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#13131c] overflow-hidden">
      {title && <div className="px-4 py-2.5 border-b border-[#1e1e2e] bg-[#0f0f1a]">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{title}</h4>
      </div>}
      <div className="px-4">{children}</div>
    </div>
  );
}

export default function ReturnDetailDrawer({
  ret, onClose,
  onApprove, onReject, onMarkReceived, onProcessRefund,
  onAddNote, onDeleteNote,
}) {
  const [tab, setTab]             = useState('details');
  const [local, setLocal]         = useState(ret);
  const [localNotes, setNotes]    = useState(ret?.notes || []);
  const [noteText, setNoteText]   = useState('');

  // Approve / Reject modals
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject]   = useState(false);
  const [showRefund, setShowRefund]   = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [refundMethod, setRefundMethod] = useState(ret?.refundMethod || 'original_payment');
  const [refundNote, setRefundNote]   = useState('');
  const [processing, setProcessing]   = useState(false);

  useEffect(() => { setLocal(ret); setNotes(ret?.notes || []); setTab('details'); }, [ret]);
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!local) return null;

  const mutate = (changes) => setLocal(prev => ({ ...prev, ...changes }));

  const handleApprove = async () => {
    setProcessing(true);
    await onApprove?.(local._id);
    mutate({
      status: 'approved',
      timeline: [...(local.timeline||[]), { status:'approved', note:'Approved by admin.', createdAt: new Date().toISOString() }],
    });
    setShowApprove(false);
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setProcessing(true);
    await onReject?.(local._id, rejectReason);
    mutate({
      status: 'rejected',
      rejectionReason: rejectReason,
      timeline: [...(local.timeline||[]), { status:'rejected', note: `Rejected: ${rejectReason}`, createdAt: new Date().toISOString() }],
    });
    setShowReject(false);
    setRejectReason('');
    setProcessing(false);
  };

  const handleMarkReceived = async () => {
    setProcessing(true);
    await onMarkReceived?.(local._id);
    mutate({
      status: 'item_received',
      timeline: [...(local.timeline||[]), { status:'item_received', note:'Item received and inspected.', createdAt: new Date().toISOString() }],
    });
    setProcessing(false);
  };

  const handleProcessRefund = async () => {
    setProcessing(true);
    const txnId = `TXN-RF-${Math.floor(Math.random()*9000+1000)}`;
    await onProcessRefund?.(local._id, { refundMethod, note: refundNote });
    mutate({
      status: 'refund_processed',
      refundMethod,
      refundTransactionId: txnId,
      timeline: [...(local.timeline||[]), {
        status: 'refund_processed',
        note: `Refund of $${local.refundAmount?.toFixed(2)} processed via ${refundMethod}. Ref: ${txnId}. ${refundNote}`,
        createdAt: new Date().toISOString(),
      }],
    });
    setShowRefund(false);
    setRefundNote('');
    setProcessing(false);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const note = { _id: `ln_${Date.now()}`, text: noteText.trim(), createdAt: new Date().toISOString(), author: 'Admin' };
    setNotes(prev => [...prev, note]);
    onAddNote?.(local._id, noteText.trim());
    setNoteText('');
  };

  const TIMELINE_ICONS = {
    submitted:         '📩',
    approved:          '✅',
    rejected:          '❌',
    item_received:     '📦',
    refund_processed:  '💚',
    closed:            '🔒',
  };

  const canApprove    = local.status === 'pending_review';
  const canReject     = local.status === 'pending_review';
  const canReceive    = local.status === 'approved';
  const canRefund     = local.status === 'item_received' || (local.type === 'refund_only' && local.status === 'approved');

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose}/>

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[580px] bg-[#0c0c15] border-l border-[#1e1e2e] flex flex-col shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex-shrink-0 border-b border-[#1e1e2e] bg-[#0f0f1a]">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-slate-600 font-mono">Return / Refund Request</span>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Return hero */}
          <div className="px-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-white font-bold text-xl">{local.returnNumber}</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Order <span className="font-mono text-violet-400">{local.orderId?.orderNumber}</span>
                  {' · '}{local.userId?.firstName} {local.userId?.lastName}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <StatusChip status={local.status}/>
                  <TypeChip type={local.type}/>
                </div>
              </div>
              {local.refundAmount > 0 && (
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-white">${local.refundAmount?.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Refund amount</p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 px-5 py-3 border-t border-[#1e1e2e] flex-wrap">
            {canApprove && (
              <button onClick={() => setShowApprove(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors">
                ✅ Approve
              </button>
            )}
            {canReject && (
              <button onClick={() => setShowReject(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors">
                ❌ Reject
              </button>
            )}
            {canReceive && (
              <button onClick={handleMarkReceived} disabled={processing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
                📦 Mark Item Received
              </button>
            )}
            {canRefund && (
              <button onClick={() => setShowRefund(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors">
                💸 Process Refund
              </button>
            )}
            {local.status === 'refund_processed' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                ✅ Refund Complete {local.refundTransactionId && <span className="font-mono text-[10px] text-emerald-600">· {local.refundTransactionId}</span>}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-t border-[#1e1e2e] overflow-x-auto">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                {t.icon} {t.label}
                {t.key === 'notes' && localNotes.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] flex items-center justify-center font-bold">{localNotes.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Details tab ── */}
          {tab === 'details' && (
            <div className="p-5 space-y-4">

              {/* Customer + Order */}
              <div className="grid grid-cols-2 gap-4">
                <Card title="Customer">
                  <KV k="Name"  v={`${local.userId?.firstName} ${local.userId?.lastName}`}/>
                  <KV k="Email" v={local.userId?.email} mono/>
                </Card>
                <Card title="Order">
                  <KV k="Order #"  v={local.orderId?.orderNumber} mono/>
                  <KV k="Submitted" v={new Date(local.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}/>
                </Card>
              </div>

              {/* Return items */}
              <Card title={`Returned Items (${local.items?.length || 0})`}>
                <div className="py-2 space-y-3">
                  {local.items?.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1a1a28] last:border-0">
                      <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm flex-shrink-0">
                        {item.productId?.name?.[0] || 'P'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm font-medium truncate">{item.productId?.name || 'Product'}</p>
                        <p className="text-slate-600 text-xs mt-0.5">
                          SKU: <span className="font-mono">{item.variantSku}</span>
                          {' · '}Qty: {item.quantity}
                        </p>
                        <p className="text-amber-400/80 text-xs mt-0.5">Reason: {item.reason}</p>
                        {item.images?.length > 0 && (
                          <p className="text-sky-400 text-xs mt-0.5">📎 {item.images.length} photo{item.images.length > 1 ? 's' : ''} attached</p>
                        )}
                      </div>
                      <p className="text-white font-semibold text-sm flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Refund details */}
              <Card title="Refund Details">
                <KV k="Amount"   v={local.refundAmount > 0 ? `$${local.refundAmount.toFixed(2)}` : 'N/A'}/>
                <KV k="Method"   v={REFUND_METHODS.find(m => m.value === local.refundMethod)?.label || local.refundMethod}/>
                {local.refundTransactionId && <KV k="Transaction" v={local.refundTransactionId} mono/>}
                {local.type === 'exchange' && <KV k="Exchange SKU" v={local.exchangeVariant} mono/>}
              </Card>

              {/* Rejection reason */}
              {local.status === 'rejected' && local.rejectionReason && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1.5">Rejection Reason</p>
                  <p className="text-slate-300 text-sm">{local.rejectionReason}</p>
                </div>
              )}

              {/* Shipping info */}
              {(local.shippingLabel || local.trackingNumber) && (
                <Card title="Shipping">
                  {local.shippingLabel && <KV k="Label" v={local.shippingLabel} mono/>}
                  {local.trackingNumber && <KV k="Tracking" v={local.trackingNumber} mono/>}
                </Card>
              )}
            </div>
          )}

          {/* ── Timeline tab ── */}
          {tab === 'timeline' && (
            <div className="p-5">
              {local.timeline?.length === 0 ? (
                <p className="text-center text-slate-700 py-12">No timeline events yet</p>
              ) : (
                <div className="relative pl-6 space-y-3">
                  <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/30 via-[#1e1e2e] to-transparent"/>
                  {[...(local.timeline||[])].reverse().map((ev, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[18px] top-2.5 w-3.5 h-3.5 rounded-full bg-[#13131c] border border-[#2a2a3f] flex items-center justify-center text-[9px]">
                        {TIMELINE_ICONS[ev.status] || '●'}
                      </div>
                      <div className="rounded-xl border border-[#1e1e2e] bg-[#13131c] px-4 py-3 hover:border-violet-500/20 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusChip status={ev.status}/>
                        </div>
                        {ev.note && <p className="text-slate-300 text-sm mt-1">{ev.note}</p>}
                        <p className="text-slate-600 text-xs mt-1.5">
                          {new Date(ev.createdAt).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Notes tab ── */}
          {tab === 'notes' && (
            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
                <label className="text-xs text-violet-400 font-semibold uppercase tracking-widest">Internal Note</label>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3}
                  placeholder="Add an internal note for this return request…"
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c15] border border-[#1e1e2e] text-slate-300 placeholder-slate-700 text-sm focus:outline-none focus:border-violet-500/50 resize-none transition-colors"/>
                <button onClick={handleAddNote} disabled={!noteText.trim()}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors">
                  Add Note
                </button>
              </div>
              {localNotes.length === 0 ? (
                <p className="text-center text-slate-700 py-8">No notes yet</p>
              ) : [...localNotes].reverse().map(note => (
                <div key={note._id} className="rounded-xl border border-[#1e1e2e] bg-[#13131c] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-slate-200 text-sm leading-relaxed">{note.text}</p>
                    <button onClick={() => { setNotes(prev => prev.filter(n => n._id !== note._id)); onDeleteNote?.(local._id, note._id); }}
                      className="p-1 rounded hover:bg-red-500/10 text-slate-700 hover:text-red-400 transition-colors flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <p className="text-slate-600 text-xs mt-2">{note.author} · {new Date(note.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── Approve Confirm ── */}
      {showApprove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setShowApprove(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
          <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
            <h3 className="text-white font-bold text-center mb-1">Approve this return?</h3>
            <p className="text-slate-400 text-sm text-center mb-5">A shipping label will be generated and sent to the customer.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowApprove(false)} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleApprove} disabled={processing} className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {processing ? 'Approving…' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {showReject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setShowReject(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
          <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">❌</div>
            <h3 className="text-white font-bold text-center mb-1">Reject this return?</h3>
            <p className="text-slate-400 text-sm text-center mb-4">Provide a reason that will be shown to the customer.</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
              placeholder="e.g. Return window has expired…"
              className="w-full px-3 py-2 mb-4 rounded-lg bg-[#0e0e17] border border-[#1e1e2e] text-slate-300 placeholder-slate-700 text-sm focus:outline-none focus:border-red-500/50 resize-none transition-colors"/>
            <div className="flex gap-3">
              <button onClick={() => setShowReject(false)} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleReject} disabled={processing || !rejectReason.trim()} className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {processing ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Process Refund Modal ── */}
      {showRefund && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setShowRefund(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
          <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">💸</div>
            <h3 className="text-white font-bold text-center mb-1">Process Refund</h3>
            <p className="text-slate-400 text-sm text-center mb-4">
              Refund <span className="text-white font-bold">${local.refundAmount?.toFixed(2)}</span> to customer.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Refund Method</label>
                <select value={refundMethod} onChange={e => setRefundMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0e0e17] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-sky-500/50 transition-colors">
                  {REFUND_METHODS.filter(m => m.value !== 'exchange').map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Note (optional)</label>
                <input value={refundNote} onChange={e => setRefundNote(e.target.value)}
                  placeholder="e.g. Ref #, bank details…"
                  className="w-full px-3 py-2 rounded-lg bg-[#0e0e17] border border-[#1e1e2e] text-slate-300 placeholder-slate-700 text-sm focus:outline-none focus:border-sky-500/50 transition-colors"/>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRefund(false)} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleProcessRefund} disabled={processing} className="flex-1 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {processing ? 'Processing…' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
