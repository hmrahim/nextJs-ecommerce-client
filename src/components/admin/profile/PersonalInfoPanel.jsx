// 📁 PATH: src/components/admin/profile/PersonalInfoPanel.jsx
'use client';
import { useState, useEffect } from 'react';

function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] overflow-hidden">
      {title && (
        <div className="px-5 py-3 border-b border-[#1e1e2e] bg-[#0f0f18]">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function InputField({ label, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        id={id}
        className="bg-[#0d0d16] border border-[#1e1e2e] rounded-lg px-3.5 py-2.5 text-sm text-slate-200
          placeholder-slate-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        {...props}
      />
    </div>
  );
}

export default function PersonalInfoPanel({ profile, onSave, saving }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    await onSave(form);
  };

  if (!profile) return null;

  const roleBadge = {
    admin:  'bg-violet-500/15 text-violet-300 border-violet-500/25',
    seller: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
    buyer:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  }[profile.role] || 'bg-slate-500/15 text-slate-300 border-slate-500/25';

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || '?';

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Orders placed', value: profile.orderCount ?? '—' },
          { label: 'Wishlists',     value: profile.wishlistCount ?? '—' },
          { label: 'Reviews left',  value: profile.reviewCount ?? '—' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-4">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Avatar + role */}
      <SectionCard title="Account overview">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30
            flex items-center justify-center text-xl font-bold text-violet-300 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-lg truncate">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-slate-400 text-sm truncate">{profile.email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${roleBadge}`}>
                {profile.role}
              </span>
              {profile.isActive && (
                <span className="text-xs px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Active
                </span>
              )}
              {profile.emailVerified && (
                <span className="text-xs px-2.5 py-0.5 rounded-full border bg-sky-500/10 text-sky-400 border-sky-500/20 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Email verified
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-slate-600 flex-shrink-0">
            <p>Member since</p>
            <p className="text-slate-400">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Editable fields */}
      <SectionCard title="Basic details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="First name"   id="firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
          <InputField label="Last name"    id="lastName"  name="lastName"  value={form.lastName}  onChange={handleChange} placeholder="Last name" />
          <InputField label="Email address" id="email"   name="email"     value={profile.email || ''} disabled type="email" />
          <InputField label="Phone number" id="phone"    name="phone"     value={form.phone}     onChange={handleChange} placeholder="+880" type="tel" />
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500
            disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {saving ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </SectionCard>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-5">
        <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Danger zone
        </h3>
        <p className="text-slate-500 text-sm mb-4 leading-relaxed">
          Permanently deletes your account, orders history, wishlists, and all associated data. This cannot be undone.
        </p>
        <button
          onClick={() => setDeleteModal(true)}
          className="px-4 py-2 border border-red-500/40 text-red-400 text-sm rounded-xl hover:bg-red-500/10 transition-colors"
        >
          Request account deletion
        </button>
      </div>

      {/* Delete confirm modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative bg-[#0e0e17] border border-red-500/30 rounded-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg mb-1">Delete account?</h3>
            <p className="text-slate-400 text-sm mb-4">Please provide a reason (optional). Your request will be reviewed within 48 hours.</p>
            <textarea
              value={deleteReason}
              onChange={e => setDeleteReason(e.target.value)}
              placeholder="Reason for deletion…"
              rows={3}
              className="w-full bg-[#0d0d16] border border-[#1e1e2e] rounded-lg px-3.5 py-2.5 text-sm text-slate-200
                placeholder-slate-600 outline-none focus:border-red-500/50 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-[#1e1e2e] text-slate-400 text-sm rounded-xl hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setDeleteModal(false); }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Confirm deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
