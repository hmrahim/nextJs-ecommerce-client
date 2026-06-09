// 📁 PATH: src/components/admin/customers/CustomerDetailDrawer.jsx
// ⚠️  NEW FILE — Full slide-in side drawer with tabbed detail view

'use client';
import { useState, useEffect } from 'react';
import { CustomerAvatar, StatusChip, CustomerTags } from './CustomerTable';
import { DUMMY_CUSTOMER_ORDERS, makeDummyActivity } from './_dummyData';

const TABS = [
  { key: 'overview',   label: 'Overview',   icon: '📊' },
  { key: 'orders',     label: 'Orders',     icon: '🛍️' },
  { key: 'addresses',  label: 'Addresses',  icon: '📍' },
  { key: 'notes',      label: 'Notes',      icon: '📝' },
  { key: 'activity',   label: 'Activity',   icon: '📋' },
];

const ORDER_STATUS_CLS = {
  delivered: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  processing: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  shipped:    'text-sky-400    bg-sky-500/10    border-sky-500/20',
  cancelled:  'text-red-400   bg-red-500/10   border-red-500/20',
  refunded:   'text-slate-400 bg-slate-500/10 border-slate-500/20',
  pending:    'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

function KV({ k, v, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-[#1a1a28] last:border-0">
      <span className="text-slate-500 text-sm flex-shrink-0">{k}</span>
      <span className={`text-slate-200 text-sm text-right ${mono ? 'font-mono text-xs' : ''}`}>{v}</span>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#13131c] overflow-hidden">
      {title && <div className="px-4 py-2.5 border-b border-[#1e1e2e] bg-[#0f0f1a]">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{title}</h4>
      </div>}
      <div className="px-4">{children}</div>
    </div>
  );
}

export default function CustomerDetailDrawer({
  customer, onClose, onToggleBan, onToggleVerify, onDelete,
  onAddNote, onDeleteNote, onSendEmail,
}) {
  const [tab, setTab]           = useState('overview');
  const [localC, setLocalC]     = useState(customer);
  const [localNotes, setNotes]  = useState(customer?.notes || []);
  const [noteText, setNoteText] = useState('');
  const [emailSubj, setEmailSubj] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailDone, setEmailDone] = useState(false);
  const [sending, setSending]   = useState(false);
  const [showBanConfirm, setBanConfirm] = useState(false);
  const [banReason, setBanReason] = useState('');

  // Sync when outer customer changes
  useEffect(() => { setLocalC(customer); setNotes(customer?.notes || []); setTab('overview'); }, [customer]);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!localC) return null;

  const handleBan = () => {
    const updated = { ...localC, isBanned: !localC.isBanned, banReason: localC.isBanned ? '' : banReason };
    setLocalC(updated);
    onToggleBan?.(localC._id, banReason);
    setBanConfirm(false);
    setBanReason('');
  };
  const handleVerify = () => {
    setLocalC(c => ({ ...c, emailVerified: !c.emailVerified }));
    onToggleVerify?.(localC._id);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const note = { _id: `local_${Date.now()}`, text: noteText.trim(), createdAt: new Date().toISOString(), author: 'Admin' };
    setNotes(prev => [...prev, note]);
    onAddNote?.(localC._id, noteText.trim());
    setNoteText('');
  };
  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(n => n._id !== id));
    onDeleteNote?.(localC._id, id);
  };

  const handleSendEmail = async () => {
    if (!emailSubj.trim() || !emailBody.trim()) return;
    setSending(true);
    await onSendEmail?.(localC._id, { subject: emailSubj, body: emailBody });
    setSending(false);
    setEmailDone(true);
    setEmailSubj(''); setEmailBody('');
    setTimeout(() => setEmailDone(false), 3000);
  };

  const joined   = new Date(localC.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const lastSeen = localC.lastOrderAt ? new Date(localC.lastOrderAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never';
  const activity = makeDummyActivity(localC);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[560px] bg-[#0c0c15] border-l border-[#1e1e2e] flex flex-col shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex-shrink-0 border-b border-[#1e1e2e] bg-[#0f0f1a]">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs text-slate-600 font-mono">Customer Profile</span>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Customer hero */}
          <div className="px-5 pb-4 flex items-start gap-4">
            <CustomerAvatar firstName={localC.firstName} lastName={localC.lastName} size="lg" />
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-xl leading-tight">{localC.firstName} {localC.lastName}</h2>
              <p className="text-slate-400 text-sm mt-0.5 truncate">{localC.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <StatusChip customer={localC} />
                <CustomerTags tags={localC.tags} />
              </div>
            </div>
          </div>

          {/* Quick stat strip */}
          <div className="grid grid-cols-4 border-t border-[#1e1e2e]">
            {[
              { label: 'Orders',   value: localC.totalOrders ?? 0 },
              { label: 'Spent',    value: `$${(localC.totalSpent || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
              { label: 'LTV',      value: `$${(localC.ltv || 0).toLocaleString()}` },
              { label: 'Reviews',  value: localC.reviewCount ?? 0 },
            ].map(s => (
              <div key={s.label} className="py-3 text-center border-r border-[#1e1e2e] last:border-r-0">
                <p className="text-white font-bold text-base">{s.value}</p>
                <p className="text-slate-600 text-[10px] uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 px-5 py-3 border-t border-[#1e1e2e]">
            <button onClick={() => setBanConfirm(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${localC.isBanned ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'}`}>
              {localC.isBanned ? '✅ Unban' : '🚫 Ban'}
            </button>
            <button onClick={handleVerify}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs font-medium transition-colors">
              {localC.emailVerified ? '📧 Unverify' : '✅ Verify'}
            </button>
            <button onClick={() => setTab('notes')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs font-medium transition-colors">
              📝 Note
            </button>
            <button onClick={() => { setTab('overview'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs font-medium transition-colors">
              ✉️ Email
            </button>
            <button onClick={() => { onDelete?.(localC._id); onClose(); }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors">
              🗑 Delete
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-[#1e1e2e] overflow-x-auto">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                <span>{t.icon}</span> {t.label}
                {t.key === 'notes' && localNotes.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] flex items-center justify-center font-bold">{localNotes.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div className="p-5 space-y-4">
              <SectionCard title="Account Details">
                <KV k="Customer ID"      v={localC._id}        mono />
                <KV k="Role"             v={localC.role || 'buyer'} />
                <KV k="Phone"            v={localC.phone || '—'} />
                <KV k="Joined"           v={joined} />
                <KV k="Last Order"       v={lastSeen} />
                <KV k="Saved Cards"      v={localC.savedCards ?? 0} />
                <KV k="Wishlist Items"   v={localC.wishlistCount ?? 0} />
              </SectionCard>

              <SectionCard title="Purchase Behaviour">
                <KV k="Total Orders"     v={localC.totalOrders ?? 0} />
                <KV k="Lifetime Spend"   v={`$${(localC.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                <KV k="Avg. Order Value" v={`$${(localC.avgOrderValue || 0).toFixed(2)}`} />
                <KV k="Predicted LTV"   v={`$${(localC.ltv || 0).toLocaleString()}`} />
                <KV k="Reviews Written"  v={localC.reviewCount ?? 0} />
              </SectionCard>

              <SectionCard title="Risk & Compliance">
                <KV k="Risk Score"  v={localC.riskScore === 'high' ? '🔴 High' : localC.riskScore === 'medium' ? '🟡 Medium' : '🟢 Low'} />
                <KV k="Ban Status"  v={localC.isBanned ? `🚫 Banned` : '✅ Good standing'} />
                {localC.isBanned && localC.banReason && <KV k="Ban Reason" v={localC.banReason} />}
                <KV k="Verified"    v={localC.emailVerified ? '✅ Email verified' : '❌ Not verified'} />
              </SectionCard>

              {/* Send Email */}
              <SectionCard title="Send Email to Customer">
                <div className="py-3 space-y-3">
                  <input value={emailSubj} onChange={e => setEmailSubj(e.target.value)}
                    placeholder="Subject…"
                    className="w-full px-3 py-2 rounded-lg bg-[#0c0c15] border border-[#1e1e2e] text-slate-300 placeholder-slate-700 text-sm focus:outline-none focus:border-violet-500/50 transition-colors" />
                  <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={4}
                    placeholder={`Hi ${localC.firstName}, …`}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c0c15] border border-[#1e1e2e] text-slate-300 placeholder-slate-700 text-sm focus:outline-none focus:border-violet-500/50 transition-colors resize-none" />
                  <button onClick={handleSendEmail} disabled={sending || !emailSubj || !emailBody}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium transition-colors">
                    {emailDone ? '✅ Sent!' : sending ? 'Sending…' : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> Send Email</>)}
                  </button>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ── Orders ── */}
          {tab === 'orders' && (
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">{localC.totalOrders ?? DUMMY_CUSTOMER_ORDERS.length} orders total</p>
              {DUMMY_CUSTOMER_ORDERS.map(o => (
                <div key={o._id} className="flex items-center justify-between p-4 rounded-xl border border-[#1e1e2e] bg-[#13131c] hover:border-violet-500/20 transition-colors">
                  <div>
                    <p className="text-violet-400 font-mono font-semibold text-sm">#{o.orderNumber}</p>
                    <p className="text-slate-600 text-xs mt-0.5">{new Date(o.placedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {o.itemCount} item{o.itemCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${o.totalAmount.toFixed(2)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${ORDER_STATUS_CLS[o.status] || ''}`}>{o.status}</span>
                  </div>
                </div>
              ))}
              {(localC.totalOrders || 0) > DUMMY_CUSTOMER_ORDERS.length && (
                <p className="text-center text-slate-700 text-xs py-2">+ {localC.totalOrders - DUMMY_CUSTOMER_ORDERS.length} more — connect backend to load all</p>
              )}
            </div>
          )}

          {/* ── Addresses ── */}
          {tab === 'addresses' && (
            <div className="p-5 space-y-3">
              {localC.addresses?.length > 0 ? localC.addresses.map((a, i) => (
                <div key={i} className="p-4 rounded-xl border border-[#1e1e2e] bg-[#13131c]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{a.label || `Address ${i+1}`}</span>
                    {a.isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold">DEFAULT</span>}
                  </div>
                  <p className="text-slate-200 text-sm">{[a.street, a.city, a.state, a.zip, a.country].filter(Boolean).join(', ')}</p>
                </div>
              )) : (
                <div className="text-center py-16 text-slate-700">
                  <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  No addresses saved
                </div>
              )}
            </div>
          )}

          {/* ── Notes ── */}
          {tab === 'notes' && (
            <div className="p-5 space-y-4">
              {/* Add note box */}
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
                <label className="text-xs text-violet-400 font-semibold uppercase tracking-widest">New Internal Note</label>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3}
                  placeholder="Add an internal note visible only to admins…"
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c15] border border-[#1e1e2e] text-slate-300 placeholder-slate-700 text-sm focus:outline-none focus:border-violet-500/50 transition-colors resize-none" />
                <button onClick={handleAddNote} disabled={!noteText.trim()}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors">
                  Add Note
                </button>
              </div>

              {/* Notes list */}
              {localNotes.length === 0 ? (
                <p className="text-center text-slate-700 py-10">No notes yet</p>
              ) : [...localNotes].reverse().map(note => (
                <div key={note._id} className="rounded-xl border border-[#1e1e2e] bg-[#13131c] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-slate-200 text-sm leading-relaxed">{note.text}</p>
                    <button onClick={() => handleDeleteNote(note._id)}
                      className="p-1 rounded hover:bg-red-500/10 text-slate-700 hover:text-red-400 transition-colors flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <p className="text-slate-600 text-xs mt-2">
                    {note.author} · {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Activity ── */}
          {tab === 'activity' && (
            <div className="p-5">
              <div className="relative pl-6 space-y-3">
                <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/30 via-[#1e1e2e] to-transparent" />
                {activity.map((ev, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[18px] top-2.5 w-3.5 h-3.5 rounded-full bg-[#13131c] border border-[#2a2a3f] flex items-center justify-center text-[9px] select-none">
                      {ev.icon}
                    </div>
                    <div className="rounded-xl border border-[#1e1e2e] bg-[#13131c] px-4 py-3 hover:border-violet-500/20 transition-colors">
                      <p className="text-slate-200 text-sm">{ev.text}</p>
                      <p className="text-slate-600 text-xs mt-1">
                        {new Date(ev.time).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Ban Confirm Modal ── */}
      {showBanConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setBanConfirm(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">{localC.isBanned ? '✅' : '🚫'}</span>
            </div>
            <h3 className="text-white font-bold text-center mb-1">{localC.isBanned ? 'Unban this customer?' : 'Ban this customer?'}</h3>
            <p className="text-slate-400 text-sm text-center mb-4">
              {localC.isBanned ? `${localC.firstName} will regain access to the store.` : `${localC.firstName} will lose all access to the store.`}
            </p>
            {!localC.isBanned && (
              <input value={banReason} onChange={e => setBanReason(e.target.value)}
                placeholder="Reason for ban (optional)…"
                className="w-full px-3 py-2 mb-4 rounded-lg bg-[#0e0e17] border border-[#1e1e2e] text-slate-300 placeholder-slate-700 text-sm focus:outline-none focus:border-red-500/50 transition-colors" />
            )}
            <div className="flex gap-3">
              <button onClick={() => setBanConfirm(false)} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleBan} className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${localC.isBanned ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}>
                {localC.isBanned ? 'Unban' : 'Ban Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
