// 📁 PATH: src/components/admin/loyalty/LoyaltyMembersTab.jsx
// ⚠️  This is a completely new file

'use client';
import { useState, useMemo } from 'react';
import AdjustPointsModal from './AdjustPointsModal';

const TIER_CFG = {
  bronze:   { label: 'Bronze',   icon: '🥉', cls: 'text-amber-600' },
  silver:   { label: 'Silver',   icon: '🥈', cls: 'text-slate-300' },
  gold:     { label: 'Gold',     icon: '🥇', cls: 'text-amber-400' },
  platinum: { label: 'Platinum', icon: '💎', cls: 'text-cyan-300' },
};

export default function LoyaltyMembersTab({ members, onAdjust }) {
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [target, setTarget] = useState(null);

  const filtered = useMemo(() => {
    let l = [...members];
    const q = search.toLowerCase();
    if (q) l = l.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    if (tier) l = l.filter(m => m.tier === tier);
    return l;
  }, [members, search, tier]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…" className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50" />
        </div>
        <select value={tier} onChange={e => setTier(e.target.value)} className="h-9 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-slate-300 focus:outline-none focus:border-orange-500/50">
          <option value="">All Tiers</option>
          {Object.entries(TIER_CFG).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111118] border-b border-[#1e1e2e]">
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Points Balance</th>
                <th className="px-4 py-3">Lifetime Earned</th>
                <th className="px-4 py-3">Lifetime Spent</th>
                <th className="px-4 py-3">Last Activity</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2e]">
              {filtered.map(m => {
                const tc = TIER_CFG[m.tier] || TIER_CFG.bronze;
                return (
                  <tr key={m._id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 flex items-center justify-center text-orange-400 font-semibold text-sm">{m.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <p className="text-sm font-semibold text-white">{m.name}</p>
                          <p className="text-xs text-slate-500">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 text-sm font-medium ${tc.cls}`}><span>{tc.icon}</span>{tc.label}</span></td>
                    <td className="px-4 py-3"><p className="text-sm font-bold text-orange-400">{new Intl.NumberFormat().format(m.points || 0)}</p></td>
                    <td className="px-4 py-3 text-sm text-emerald-400">{new Intl.NumberFormat().format(m.lifetimeEarned || 0)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{new Intl.NumberFormat().format(m.lifetimeSpent || 0)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{m.lastActivityAt ? new Date(m.lastActivityAt).toLocaleDateString('en-SA', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setTarget(m)} className="px-3 py-1 rounded-md border border-[#1e1e2e] text-xs text-slate-300 hover:bg-white/5">Adjust</button>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">No members found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {target && <AdjustPointsModal member={target} onSave={(d) => { onAdjust(target._id, d); setTarget(null); }} onClose={() => setTarget(null)} />}
    </div>
  );
}
