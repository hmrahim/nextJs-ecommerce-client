// 📁 PATH: src/components/admin/profile/SecurityPanel.jsx
'use client';
import { useState } from 'react';

function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#1e1e2e] bg-[#0f0f18]">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex w-10 h-5.5 rounded-full border transition-colors flex-shrink-0
        ${on ? 'bg-violet-600 border-violet-500' : 'bg-[#1e1e2e] border-[#2a2a3e]'}`}
      style={{ height: '22px' }}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
          ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

const DEMO_SESSIONS = [
  { id: '1', browser: 'Chrome', os: 'Windows',     location: 'Riyadh, SA',  current: true,  lastSeen: 'Now' },
  { id: '2', browser: 'Android App', os: 'Android', location: 'Dhaka, BD',  current: false, lastSeen: '2 days ago' },
  { id: '3', browser: 'Safari', os: 'iPhone',      location: 'Dhaka, BD',   current: false, lastSeen: '5 days ago' },
];

export default function SecurityPanel({ onChangePassword, saving }) {
  const [pwForm, setPwForm]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError]     = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [twoFaApp, setTwoFaApp]   = useState(true);
  const [twoFaSms, setTwoFaSms]   = useState(false);
  const [sessions, setSessions]   = useState(DEMO_SESSIONS);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePwChange = (e) => setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePwSubmit = async () => {
    setPwError('');
    setPwSuccess(false);
    if (!pwForm.currentPassword || !pwForm.newPassword) { setPwError('All fields required.'); return; }
    if (pwForm.newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Passwords do not match.'); return; }
    const res = await onChangePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
    if (res.success) { setPwSuccess(true); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    else { setPwError(res.error || 'Failed to change password.'); }
  };

  const revokeSession = (id) => setSessions(prev => prev.filter(s => s.id !== id));

  const PasswordInput = ({ label, name, show, onToggle }) => (
    <div>
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={show ? 'text' : 'password'}
          value={pwForm[name]}
          onChange={handlePwChange}
          placeholder="••••••••"
          className="w-full bg-[#0d0d16] border border-[#1e1e2e] rounded-lg px-3.5 py-2.5 text-sm text-slate-200
            placeholder-slate-700 outline-none focus:border-violet-500/60 pr-10 transition-colors"
        />
        <button
          onClick={onToggle}
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
        >
          {show ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Change password */}
      <SectionCard title="Change password">
        <div className="space-y-4">
          <PasswordInput label="Current password"  name="currentPassword" show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
          <PasswordInput label="New password"      name="newPassword"     show={showNew}     onToggle={() => setShowNew(v => !v)} />
          <PasswordInput label="Confirm new password" name="confirmPassword" show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
          {pwError   && <p className="text-red-400 text-sm">{pwError}</p>}
          {pwSuccess && <p className="text-emerald-400 text-sm">Password changed successfully.</p>}
          <button
            onClick={handlePwSubmit}
            disabled={saving}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50
              text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            Update password
          </button>
        </div>
      </SectionCard>

      {/* 2FA */}
      <SectionCard title="Two-factor authentication">
        <div className="space-y-0 divide-y divide-[#1e1e2e]">
          {[
            { label: 'Authenticator app', sub: 'Google Authenticator or Authy', on: twoFaApp, toggle: () => setTwoFaApp(v => !v) },
            { label: 'SMS verification',  sub: 'One-time code to your phone',   on: twoFaSms, toggle: () => setTwoFaSms(v => !v) },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-4">
              <div>
                <p className="text-slate-200 text-sm font-medium">{row.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{row.sub}</p>
              </div>
              <Toggle on={row.on} onToggle={row.toggle} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Active sessions */}
      <SectionCard title="Active sessions">
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#1e1e2e] bg-[#0d0d16]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1e1e2e] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-medium">{s.browser} · {s.os}</p>
                  <p className="text-slate-500 text-xs">{s.location} · {s.lastSeen}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {s.current ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Current
                  </span>
                ) : (
                  <button
                    onClick={() => revokeSession(s.id)}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50
                      px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
          {sessions.filter(s => !s.current).length > 0 && (
            <button
              onClick={() => setSessions(prev => prev.filter(s => s.current))}
              className="w-full py-2 text-sm text-red-400 hover:text-red-300 border border-red-500/20
                hover:border-red-500/40 rounded-xl transition-colors"
            >
              Revoke all other sessions
            </button>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
