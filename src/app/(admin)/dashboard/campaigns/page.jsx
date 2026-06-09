// 📁 PATH: src/app/(admin)/dashboard/campaigns/page.jsx
// ⚠️  পুরোনো page.jsx এর জায়গায় REPLACE করো (অথবা নতুন)

'use client';
import { useState, useEffect, useCallback } from 'react';
import { campaignService } from '@/services/campaignService';
import CampaignTable     from '@/components/admin/campaigns/CampaignTable';
import CampaignFilters   from '@/components/admin/campaigns/CampaignFilters';
import CampaignFormModal from '@/components/admin/campaigns/CampaignFormModal';

const now = new Date();
const f = (d) => new Date(now.getTime() + d * 86400000).toISOString();
const p = (d) => new Date(now.getTime() - d * 86400000).toISOString();

const DUMMY = [
  { _id: 'cmp01', name: 'Eid Mega Sale 2026',    channel: 'email',    goal: 'sales',    subject: '🔥 Up to 70% off — Eid Sale starts now', message: 'Celebrate Eid with unbeatable prices on top brands.', segment: 'All Customers', audienceSize: 48230, sentCount: 48230, openCount: 21450, clickCount: 6210, conversions: 1842, revenue: 1284500, status: 'completed', scheduledAt: p(7), createdAt: p(30), couponCode: 'EID50' },
  { _id: 'cmp02', name: 'Win-back Inactive Users',channel: 'email',   goal: 'winback',  subject: 'We miss you 💛 — here\'s 20% off', message: 'Come back and enjoy a special discount made for you.', segment: 'Inactive (60d+)', audienceSize: 12480, sentCount: 12480, openCount: 3420, clickCount: 612, conversions: 184, revenue: 96200, status: 'running', scheduledAt: p(2), createdAt: p(5), couponCode: 'COMEBACK20' },
  { _id: 'cmp03', name: 'Flash Friday SMS Blast', channel: 'sms',     goal: 'sales',    subject: '',                                       message: 'Flash Friday: 3 hours only — extra 15% off everything. Code FLASH15. Shop now: bit.ly/ff15', segment: 'VIP / Top Spenders', audienceSize: 5200, sentCount: 5200, openCount: 4980, clickCount: 1102, conversions: 412, revenue: 312000, status: 'scheduled', scheduledAt: f(1), createdAt: p(1), couponCode: 'FLASH15' },
  { _id: 'cmp04', name: 'New Arrivals Push',      channel: 'push',    goal: 'awareness',subject: 'New drops are live ✨',                  message: 'Discover this week\'s freshest arrivals before they sell out.', segment: 'Mobile App Users', audienceSize: 28900, sentCount: 28900, openCount: 9200, clickCount: 2410, conversions: 514, revenue: 184200, status: 'completed', scheduledAt: p(3), createdAt: p(10) },
  { _id: 'cmp05', name: 'Abandoned Cart Recovery',channel: 'whatsapp',goal: 'retention',subject: '',                                       message: 'Hey! You left items in your cart 🛒 — complete the order in the next hour and get free shipping.', segment: 'Abandoned Cart Users', audienceSize: 1340, sentCount: 1340, openCount: 1290, clickCount: 412, conversions: 167, revenue: 89400, status: 'running', scheduledAt: p(1), createdAt: p(3) },
  { _id: 'cmp06', name: 'Loyalty Tier Upgrade',   channel: 'in_app',  goal: 'retention',subject: '🎉 You\'re close to Gold tier!',         message: 'Spend ৳1,500 more this month to unlock Gold tier benefits.', segment: 'Repeat Buyers', audienceSize: 9120, sentCount: 0, openCount: 0, clickCount: 0, conversions: 0, revenue: 0, status: 'draft', scheduledAt: null, createdAt: p(1) },
  { _id: 'cmp07', name: 'Pohela Boishakh Festival',channel: 'email',  goal: 'launch',   subject: 'শুভ নববর্ষ — celebrate with us 🌸',     message: 'Festive collection live now. Discover handcrafted pieces curated for the season.', segment: 'All Customers', audienceSize: 50100, sentCount: 0, openCount: 0, clickCount: 0, conversions: 0, revenue: 0, status: 'scheduled', scheduledAt: f(15), createdAt: p(2), couponCode: 'NOBOBORSHO25' },
  { _id: 'cmp08', name: 'VIP Early Access Drop',  channel: 'email',   goal: 'sales',    subject: 'VIP only — early access starts in 24h', message: 'You get first dibs on our limited-edition drop before anyone else.', segment: 'VIP / Top Spenders', audienceSize: 1820, sentCount: 1820, openCount: 1410, clickCount: 612, conversions: 248, revenue: 412000, status: 'completed', scheduledAt: p(14), createdAt: p(20) },
  { _id: 'cmp09', name: 'Weekend SMS Reminder',   channel: 'sms',     goal: 'sales',    subject: '',                                       message: 'Weekend is here! Up to 40% off across electronics. Reply STOP to unsubscribe.', segment: 'All Customers', audienceSize: 38400, sentCount: 0, openCount: 0, clickCount: 0, conversions: 0, revenue: 0, status: 'paused', scheduledAt: f(2), createdAt: p(4) },
  { _id: 'cmp10', name: 'Birthday Wish Automation',channel: 'email',  goal: 'retention',subject: '🎂 Happy Birthday — a gift from us',    message: 'Your special day deserves something special. Enjoy 25% off any order this week.', segment: 'All Customers', audienceSize: 0, sentCount: 8420, openCount: 5210, clickCount: 1812, conversions: 612, revenue: 184500, status: 'running', scheduledAt: p(30), createdAt: p(45), couponCode: 'BDAY25' },
];

export default function CampaignsPage() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters]       = useState({ search: '', status: '', channel: '', sort: 'createdAt:desc' });
  const [selected, setSelected]     = useState([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await campaignService.adminGetAll({
        page: pagination.page, limit: 15,
        search: filters.search || undefined,
        status: filters.status || undefined,
        channel: filters.channel || undefined,
        sort: filters.sort,
      });
      const d = res.data;
      setItems(d.campaigns || d.data || []);
      setPagination(p => ({ ...p, total: d.total || 0, pages: d.pages || 1 }));
      setUsingDummy(false);
    } catch {
      let list = [...DUMMY];
      const q = filters.search?.toLowerCase();
      if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.subject?.toLowerCase().includes(q) || c.message?.toLowerCase().includes(q));
      if (filters.status)  list = list.filter(c => c.status === filters.status);
      if (filters.channel) list = list.filter(c => c.channel === filters.channel);
      setItems(list);
      setPagination({ page: 1, total: list.length, pages: 1 });
      setUsingDummy(true);
    } finally { setLoading(false); }
  }, [pagination.page, filters]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    if (usingDummy) {
      if (editing) setItems(p => p.map(c => c._id === editing._id ? { ...c, ...data } : c));
      else setItems(p => [{ ...data, _id: 'cmp_' + Date.now(), sentCount: 0, openCount: 0, clickCount: 0, conversions: 0, revenue: 0, createdAt: new Date().toISOString() }, ...p]);
    } else {
      if (editing) await campaignService.adminUpdate(editing._id, data);
      else         await campaignService.adminCreate(data);
      load();
    }
    setModalOpen(false); setEditing(null);
  };
  const handleDelete    = async (id) => { if (usingDummy) return setItems(p => p.filter(c => c._id !== id)); await campaignService.adminDelete(id); load(); };
  const handleDuplicate = async (id) => {
    if (usingDummy) { const c = items.find(x => x._id === id); if (c) setItems(p => [{ ...c, _id: 'cmp_' + Date.now(), name: c.name + ' (Copy)', status: 'draft', sentCount: 0, openCount: 0, clickCount: 0, conversions: 0, revenue: 0 }, ...p]); return; }
    await campaignService.adminDuplicate(id); load();
  };
  const handleLaunch = async (id) => { if (usingDummy) return setItems(p => p.map(c => c._id === id ? { ...c, status: 'running' } : c)); await campaignService.adminLaunch(id); load(); };
  const handlePause  = async (id) => { if (usingDummy) return setItems(p => p.map(c => c._id === id ? { ...c, status: 'paused' } : c));  await campaignService.adminPause(id);  load(); };
  const handleBulkDelete = async () => { if (usingDummy) { setItems(p => p.filter(c => !selected.includes(c._id))); setSelected([]); return; } await campaignService.adminBulkDelete(selected); setSelected([]); load(); };

  const stats = {
    total:     items.length,
    running:   items.filter(c => c.status === 'running').length,
    scheduled: items.filter(c => c.status === 'scheduled').length,
    sent:      items.reduce((s, c) => s + (c.sentCount || 0), 0),
    revenue:   items.reduce((s, c) => s + (c.revenue || 0), 0),
    conversions: items.reduce((s, c) => s + (c.conversions || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Campaigns</h1>
          <p className="text-sm text-slate-400 mt-0.5">Run multi-channel marketing campaigns — email, SMS, push, WhatsApp & in-app.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete ({selected.length})
            </button>
          )}
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Campaign
          </button>
        </div>
      </div>

      {usingDummy && (
        <div className="px-4 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs">
          ⚠️ Showing demo data — backend unreachable. All actions work locally only.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { l: 'Total',       v: stats.total,                       c: 'text-white' },
          { l: 'Running',     v: stats.running,                     c: 'text-emerald-400' },
          { l: 'Scheduled',   v: stats.scheduled,                   c: 'text-sky-400' },
          { l: 'Sent',        v: new Intl.NumberFormat().format(stats.sent), c: 'text-violet-400' },
          { l: 'Conversions', v: new Intl.NumberFormat().format(stats.conversions), c: 'text-orange-400' },
          { l: 'Revenue',     v: '৳' + new Intl.NumberFormat().format(stats.revenue), c: 'text-emerald-400' },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-[#1e1e2e] bg-[#16161f] p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.l}</p>
            <p className={`text-xl font-bold mt-1 ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <CampaignFilters filters={filters} onChange={(f) => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); setSelected([]); }} />

      <CampaignTable
        campaigns={items} loading={loading} selected={selected} onSelectChange={setSelected}
        onEdit={(c) => { setEditing(c); setModalOpen(true); }}
        onDelete={handleDelete} onDuplicate={handleDuplicate} onLaunch={handleLaunch} onPause={handlePause}
        pagination={pagination} onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
      />

      {modalOpen && <CampaignFormModal campaign={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />}
    </div>
  );
}
