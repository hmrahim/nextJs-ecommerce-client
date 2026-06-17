// 📁 PATH: src/app/(admin)/dashboard/loyalty/page.jsx
// ⚠️  old page.jsx instead of REPLACE Do (or new)

'use client';
import { useState, useEffect, useCallback } from 'react';
import { loyaltyService } from '@/services/loyaltyService';
import LoyaltyMembersTab  from '@/components/admin/loyalty/LoyaltyMembersTab';
import LoyaltyTiersTab    from '@/components/admin/loyalty/LoyaltyTiersTab';
import LoyaltyRulesTab    from '@/components/admin/loyalty/LoyaltyRulesTab';
import LoyaltySettingsTab from '@/components/admin/loyalty/LoyaltySettingsTab';

const DUMMY_SETTINGS = {
  programName: 'BD Rewards', currencyName: 'Points', redemptionRate: 100, minRedeem: 500,
  maxPercentPerOrder: 20, expiryDays: 365, isActive: true, allowGuestEarn: false,
};

const DUMMY_TIERS = [
  { _id: 't1', name: 'Bronze',   threshold: 0,     multiplier: 1,   color: '#a16207', perks: ['Earn 1 pt / SAR 1', 'Birthday bonus'] },
  { _id: 't2', name: 'Silver',   threshold: 10000, multiplier: 1.25,color: '#94a3b8', perks: ['Earn 1.25× points', 'Free shipping over SAR 1000', 'Early sale access'] },
  { _id: 't3', name: 'Gold',     threshold: 50000, multiplier: 1.5, color: '#f59e0b', perks: ['Earn 1.5× points', 'Free shipping always', 'Priority support', '5% extra discount'] },
  { _id: 't4', name: 'Platinum', threshold: 150000,multiplier: 2,   color: '#22d3ee', perks: ['Earn 2× points', 'Dedicated manager', 'Exclusive drops', 'Free returns'] },
];

const DUMMY_RULES = [
  { _id: 'r1', name: 'Earn per SAR 1 spent', event: 'order_delivered', pointsType: 'percent', pointsValue: 1, minSpend: 0, isActive: true },
  { _id: 'r2', name: 'Signup Bonus', event: 'signup', pointsType: 'flat', pointsValue: 500, minSpend: 0, isActive: true },
  { _id: 'r3', name: 'Verified Review', event: 'review_posted', pointsType: 'flat', pointsValue: 50, minSpend: 0, isActive: true },
  { _id: 'r4', name: 'Birthday Gift', event: 'birthday', pointsType: 'flat', pointsValue: 250, minSpend: 0, isActive: true },
  { _id: 'r5', name: 'Referral Signup', event: 'referral_signup', pointsType: 'flat', pointsValue: 300, minSpend: 0, isActive: true },
  { _id: 'r6', name: 'Social Share', event: 'social_share', pointsType: 'flat', pointsValue: 20, minSpend: 0, isActive: false },
];

const DUMMY_MEMBERS = [
  { _id: 'lm01', name: 'Tanvir Ahmed',    email: 'tanvir@example.com',    tier: 'platinum', points: 18420, lifetimeEarned: 184200, lifetimeSpent: 165800, lastActivityAt: new Date(Date.now()-2*86400000).toISOString() },
  { _id: 'lm02', name: 'Nusrat Jahan',    email: 'nusrat@example.com',    tier: 'gold',     points: 9180,  lifetimeEarned: 91200,  lifetimeSpent: 82000,  lastActivityAt: new Date(Date.now()-5*86400000).toISOString() },
  { _id: 'lm03', name: 'Rakib Hasan',     email: 'rakib@example.com',     tier: 'gold',     points: 7240,  lifetimeEarned: 72400,  lifetimeSpent: 65000,  lastActivityAt: new Date(Date.now()-1*86400000).toISOString() },
  { _id: 'lm04', name: 'Sumaiya Khan',    email: 'sumaiya@example.com',   tier: 'silver',   points: 3420,  lifetimeEarned: 28400,  lifetimeSpent: 25000,  lastActivityAt: new Date(Date.now()-7*86400000).toISOString() },
  { _id: 'lm05', name: 'Faisal Mahmud',   email: 'faisal@example.com',    tier: 'silver',   points: 2840,  lifetimeEarned: 18200,  lifetimeSpent: 15400,  lastActivityAt: new Date(Date.now()-3*86400000).toISOString() },
  { _id: 'lm06', name: 'Anika Tabassum',  email: 'anika@example.com',     tier: 'bronze',   points: 1240,  lifetimeEarned: 5200,   lifetimeSpent: 3960,   lastActivityAt: new Date(Date.now()-14*86400000).toISOString() },
  { _id: 'lm07', name: 'Hasibul Islam',   email: 'hasib@example.com',     tier: 'bronze',   points: 820,   lifetimeEarned: 4800,   lifetimeSpent: 3980,   lastActivityAt: new Date(Date.now()-9*86400000).toISOString() },
  { _id: 'lm08', name: 'Mehedi Hassan',   email: 'mehedi@example.com',    tier: 'gold',     points: 5840,  lifetimeEarned: 65200,  lifetimeSpent: 59360,  lastActivityAt: new Date(Date.now()-2*86400000).toISOString() },
  { _id: 'lm09', name: 'Sadia Akter',     email: 'sadia@example.com',     tier: 'silver',   points: 4120,  lifetimeEarned: 22400,  lifetimeSpent: 18280,  lastActivityAt: new Date(Date.now()-6*86400000).toISOString() },
  { _id: 'lm10', name: 'Imran Khan',      email: 'imran@example.com',     tier: 'bronze',   points: 540,   lifetimeEarned: 1200,   lifetimeSpent: 660,    lastActivityAt: new Date(Date.now()-30*86400000).toISOString() },
];

const TABS = [
  { id: 'members',  label: 'Members',   icon: '👥' },
  { id: 'tiers',    label: 'Tiers',     icon: '🏆' },
  { id: 'rules',    label: 'Earn Rules',icon: '⚙️' },
  { id: 'settings', label: 'Settings',  icon: '🛠' },
];

export default function LoyaltyPage() {
  const [tab, setTab] = useState('members');
  const [usingDummy, setUsingDummy] = useState(false);
  const [members, setMembers]   = useState([]);
  const [tiers, setTiers]       = useState([]);
  const [rules, setRules]       = useState([]);
  const [settings, setSettings] = useState(DUMMY_SETTINGS);
  const [loading, setLoading]   = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [m, t, r, s] = await Promise.all([
        loyaltyService.adminGetMembers({ limit: 50 }),
        loyaltyService.adminGetTiers(),
        loyaltyService.adminGetRules(),
        loyaltyService.adminGetSettings(),
      ]);
      setMembers(m.data.members || m.data || []);
      setTiers(t.data.tiers || t.data || []);
      setRules(r.data.rules || r.data || []);
      setSettings(s.data || DUMMY_SETTINGS);
      setUsingDummy(false);
    } catch {
      setMembers(DUMMY_MEMBERS); setTiers(DUMMY_TIERS); setRules(DUMMY_RULES); setSettings(DUMMY_SETTINGS);
      setUsingDummy(true);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  // Members
  const handleAdjust = async (id, data) => {
    if (usingDummy) setMembers(p => p.map(m => m._id === id ? { ...m, points: Math.max(0, (m.points || 0) + data.delta) } : m));
    else { await loyaltyService.adminAdjustPoints(id, data); loadAll(); }
  };

  // Tiers
  const handleTierSave = async (data) => {
    if (usingDummy) {
      if (data._id === 'new') setTiers(p => [...p, { ...data, _id: 't_' + Date.now() }]);
      else setTiers(p => p.map(t => t._id === data._id ? data : t));
      return;
    }
    if (data._id === 'new') await loyaltyService.adminCreateTier(data); else await loyaltyService.adminUpdateTier(data._id, data);
    loadAll();
  };
  const handleTierDelete = async (id) => { if (usingDummy) return setTiers(p => p.filter(t => t._id !== id)); await loyaltyService.adminDeleteTier(id); loadAll(); };

  // Rules
  const handleRuleSave = async (data) => {
    if (usingDummy) {
      if (data._id === 'new') setRules(p => [...p, { ...data, _id: 'r_' + Date.now() }]);
      else setRules(p => p.map(r => r._id === data._id ? data : r));
      return;
    }
    if (data._id === 'new') await loyaltyService.adminCreateRule(data); else await loyaltyService.adminUpdateRule(data._id, data);
    loadAll();
  };
  const handleRuleDelete = async (id) => { if (usingDummy) return setRules(p => p.filter(r => r._id !== id)); await loyaltyService.adminDeleteRule(id); loadAll(); };
  const handleRuleToggle = async (id) => { if (usingDummy) return setRules(p => p.map(r => r._id === id ? { ...r, isActive: !r.isActive } : r)); await loyaltyService.adminToggleRule(id); loadAll(); };

  // Settings
  const handleSettingsSave = async (data) => { setSettings(data); if (!usingDummy) await loyaltyService.adminSaveSettings(data); };

  const stats = {
    members: members.length,
    points: members.reduce((s, m) => s + (m.points || 0), 0),
    lifetime: members.reduce((s, m) => s + (m.lifetimeEarned || 0), 0),
    gold: members.filter(m => m.tier === 'gold' || m.tier === 'platinum').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Loyalty Points</h1>
        <p className="text-sm text-slate-400 mt-0.5">Run a points-based rewards program with tiers, rules & perks.</p>
      </div>

      {usingDummy && <div className="px-4 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs">⚠️ Showing demo data — backend unreachable.</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: 'Active Members',    v: new Intl.NumberFormat().format(stats.members), c: 'text-white' },
          { l: 'Outstanding Points',v: new Intl.NumberFormat().format(stats.points),  c: 'text-orange-400' },
          { l: 'Lifetime Issued',   v: new Intl.NumberFormat().format(stats.lifetime),c: 'text-emerald-400' },
          { l: 'Gold + Platinum',   v: stats.gold,                                    c: 'text-amber-400' },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-[#1e1e2e] bg-[#16161f] p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.l}</p>
            <p className={`text-xl font-bold mt-1 ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="flex border-b border-[#1e1e2e]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-orange-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            <span className="mr-2">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#1e1e2e] bg-[#16161f] p-12 text-center"><div className="w-10 h-10 mx-auto border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>
      ) : (
        <>
          {tab === 'members'  && <LoyaltyMembersTab members={members} onAdjust={handleAdjust} />}
          {tab === 'tiers'    && <LoyaltyTiersTab tiers={tiers} onSave={handleTierSave} onDelete={handleTierDelete} />}
          {tab === 'rules'    && <LoyaltyRulesTab rules={rules} onSave={handleRuleSave} onDelete={handleRuleDelete} onToggle={handleRuleToggle} />}
          {tab === 'settings' && <LoyaltySettingsTab settings={settings} onSave={handleSettingsSave} />}
        </>
      )}
    </div>
  );
}
