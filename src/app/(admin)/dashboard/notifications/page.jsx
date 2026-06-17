'use client';
import { useState, useMemo } from 'react';

/* ── Types & Config ──────────────────────────────────────── */
const TYPE_CONFIG = {
  order: {
    label: 'Order',
    bg: 'bg-violet-500/15', border: 'border-violet-500/20', text: 'text-violet-400',
    dot: 'bg-violet-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
  },
  user: {
    label: 'Customer',
    bg: 'bg-sky-500/15', border: 'border-sky-500/20', text: 'text-sky-400',
    dot: 'bg-sky-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />,
  },
  stock: {
    label: 'Inventory',
    bg: 'bg-amber-500/15', border: 'border-amber-500/20', text: 'text-amber-400',
    dot: 'bg-amber-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
  },
  payment: {
    label: 'Payment',
    bg: 'bg-emerald-500/15', border: 'border-emerald-500/20', text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  review: {
    label: 'Review',
    bg: 'bg-pink-500/15', border: 'border-pink-500/20', text: 'text-pink-400',
    dot: 'bg-pink-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  },
  system: {
    label: 'System',
    bg: 'bg-slate-500/15', border: 'border-slate-500/20', text: 'text-slate-400',
    dot: 'bg-slate-400',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
  },
};

const PRIORITY_CFG = {
  critical: { label: 'Critical', cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
  high:     { label: 'High',     cls: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  medium:   { label: 'Medium',   cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  low:      { label: 'Low',      cls: 'bg-slate-500/15 text-slate-400 border-slate-500/25' },
};

/* ── Dummy Notifications ─────────────────────────────────── */
const INITIAL_NOTIFICATIONS = [
  { id: 1,  type: 'stock',   priority: 'critical', title: 'Critical Stock Alert',         message: 'Kantha Quilt is almost out of stock — only 2 units remain. Restock immediately to avoid lost sales.', time: '2 min ago',  date: 'Today',     unread: true,  pinned: true,  actions: [{ label: 'Restock', href: '/dashboard/inventory' }, { label: 'View Product', href: '/dashboard/products' }] },
  { id: 2,  type: 'order',   priority: 'high',     title: 'New Order Received',            message: 'Order #ORD-2841 placed by Rahim Uddin for SAR 1,250. 3 items. Payment via bKash — awaiting confirmation.', time: '5 min ago',  date: 'Today',     unread: true,  pinned: false, actions: [{ label: 'View Order', href: '/dashboard/orders' }] },
  { id: 3,  type: 'payment', priority: 'high',     title: 'Payment Failed',                message: 'Order #ORD-2838 payment via Nagad failed. Customer Karim Hossain may need to retry. Total: SAR 720.', time: '12 min ago', date: 'Today',     unread: true,  pinned: false, actions: [{ label: 'View Order', href: '/dashboard/orders' }] },
  { id: 4,  type: 'user',    priority: 'medium',   title: 'New Customer Registered',       message: 'Farida Begum just created a new account from Dhaka. First-time buyer — consider sending a welcome coupon.', time: '18 min ago', date: 'Today',     unread: true,  pinned: false, actions: [{ label: 'View Customer', href: '/dashboard/customers' }] },
  { id: 5,  type: 'review',  priority: 'low',      title: 'New 5★ Product Review',         message: 'A verified buyer left a 5-star review on "Jamdani Saree". Check and approve it to boost product credibility.', time: '45 min ago', date: 'Today',     unread: true,  pinned: false, actions: [{ label: 'View Review', href: '/dashboard/reviews' }] },
  { id: 6,  type: 'order',   priority: 'high',     title: 'Order Cancellation Request',    message: 'Customer Nusrat Jahan has requested cancellation of Order #ORD-2835. Order is in processing state.', time: '1 hr ago',   date: 'Today',     unread: true,  pinned: false, actions: [{ label: 'View Order', href: '/dashboard/orders' }] },
  { id: 7,  type: 'system',  priority: 'medium',   title: 'Coupon Usage Spike',            message: 'Coupon "EID2024" has been used 48 times in the last 6 hours. Usage is 73% of total allocation.', time: '2 hr ago',   date: 'Today',     unread: false, pinned: false, actions: [{ label: 'View Coupons', href: '/dashboard/coupons' }] },
  { id: 8,  type: 'payment', priority: 'low',      title: 'Daily Payment Summary',         message: 'Today\'s payment summary: SAR 48,320 collected across 38 orders. bKash: 62%, Nagad: 24%, COD: 14%.', time: '3 hr ago',   date: 'Today',     unread: false, pinned: false, actions: [] },
  { id: 9,  type: 'stock',   priority: 'medium',   title: 'Low Stock Warning',             message: '"Muslin Panjabi (L)" is running low — 7 units remaining. This item has averaged 12 sales/week.', time: '5 hr ago',   date: 'Today',     unread: false, pinned: false, actions: [{ label: 'Restock', href: '/dashboard/inventory' }] },
  { id: 10, type: 'user',    priority: 'low',      title: '5 New Registrations',           message: '5 new customers registered today: Mitu Akter, Sohel Rana, Arif Khan, Rina Begum, Hafiz Ali.', time: 'Yesterday',  date: 'Yesterday', unread: false, pinned: false, actions: [{ label: 'View Customers', href: '/dashboard/customers' }] },
  { id: 11, type: 'order',   priority: 'medium',   title: 'Bulk Order Alert',              message: 'Large order #ORD-2830 received — 12 items totalling SAR 18,400 from a verified wholesale buyer.', time: 'Yesterday',  date: 'Yesterday', unread: false, pinned: false, actions: [{ label: 'View Order', href: '/dashboard/orders' }] },
  { id: 12, type: 'system',  priority: 'low',      title: 'Weekly Report Ready',           message: 'Your weekly analytics report for the week of June 2–8 is now available. Revenue up 18.4% vs prior week.', time: '2 days ago', date: 'Earlier',   unread: false, pinned: false, actions: [{ label: 'View Reports', href: '/dashboard/reports' }] },
  { id: 13, type: 'review',  priority: 'high',     title: '1★ Review Flagged',             message: 'A 1-star review with potentially false claims was submitted on "Brass Ornament Set". Requires moderation.', time: '2 days ago', date: 'Earlier',   unread: false, pinned: false, actions: [{ label: 'Moderate Review', href: '/dashboard/reviews' }] },
  { id: 14, type: 'payment', priority: 'medium',   title: 'Refund Processed',              message: 'Refund of SAR 3,800 processed for Order #ORD-2821 (Nusrat Jahan). Transaction ID: TXN-88421.', time: '3 days ago', date: 'Earlier',   unread: false, pinned: false, actions: [] },
  { id: 15, type: 'stock',   priority: 'critical', title: 'Product Out of Stock',          message: '"Nakshi Kantha Pouch (Small)" is completely out of stock. 6 customers have it in their wishlists.', time: '3 days ago', date: 'Earlier',   unread: false, pinned: false, actions: [{ label: 'Restock', href: '/dashboard/inventory' }, { label: 'Notify Customers', href: '#' }] },
];

const CHANNEL_PREFS = [
  { key: 'order_new',       label: 'New Orders',          desc: 'Every new order placed on the store', inApp: true,  email: true,  sms: false },
  { key: 'order_cancel',    label: 'Order Cancellations', desc: 'When a customer requests cancellation', inApp: true,  email: true,  sms: true  },
  { key: 'payment_failed',  label: 'Failed Payments',     desc: 'When a payment transaction fails', inApp: true,  email: true,  sms: true  },
  { key: 'payment_refund',  label: 'Refunds',             desc: 'When a refund is issued to a customer', inApp: true,  email: false, sms: false },
  { key: 'stock_critical',  label: 'Critical Stock Alerts', desc: 'When stock drops below 5 units', inApp: true,  email: true,  sms: true  },
  { key: 'stock_low',       label: 'Low Stock Warnings',  desc: 'When stock drops below threshold', inApp: true,  email: true,  sms: false },
  { key: 'customer_new',    label: 'New Registrations',   desc: 'When a new customer creates an account', inApp: true,  email: false, sms: false },
  { key: 'review_new',      label: 'New Reviews',         desc: 'When a product review is submitted', inApp: true,  email: false, sms: false },
  { key: 'review_negative', label: 'Negative Reviews',    desc: 'When a 1–2 star review is submitted', inApp: true,  email: true,  sms: false },
  { key: 'report_weekly',   label: 'Weekly Reports',      desc: 'Automated weekly performance summary', inApp: false, email: true,  sms: false },
];

/* ── Toggle Switch ───────────────────────────────────────── */
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-violet-600' : 'bg-white/10'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab]         = useState('all');      // all | unread | pinned
  const [typeFilter, setTypeFilter]       = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch]               = useState('');
  const [selected, setSelected]           = useState([]);
  const [showSettings, setShowSettings]   = useState(false);
  const [channelPrefs, setChannelPrefs]   = useState(CHANNEL_PREFS);
  const [expandedId, setExpandedId]       = useState(null);

  /* ── Derived ── */
  const unreadCount = notifications.filter(n => n.unread).length;
  const pinnedCount = notifications.filter(n => n.pinned).length;

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (activeTab === 'unread' && !n.unread) return false;
      if (activeTab === 'pinned' && !n.pinned) return false;
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false;
      if (search && !n.title.toLowerCase().includes(search.toLowerCase()) &&
          !n.message.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [notifications, activeTab, typeFilter, priorityFilter, search]);

  /* ── Grouped by date ── */
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(n => {
      if (!groups[n.date]) groups[n.date] = [];
      groups[n.date].push(n);
    });
    return Object.entries(groups);
  }, [filtered]);

  /* ── Actions ── */
  const markRead    = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, unread: false } : n));
  const markAllRead = ()   => setNotifications(p => p.map(n => ({ ...n, unread: false })));
  const deleteOne   = (id) => { setNotifications(p => p.filter(n => n.id !== id)); setSelected(s => s.filter(x => x !== id)); };
  const togglePin   = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));

  const deleteSelected  = () => { setNotifications(p => p.filter(n => !selected.includes(n.id))); setSelected([]); };
  const markSelectedRead = () => { setNotifications(p => p.map(n => selected.includes(n.id) ? { ...n, unread: false } : n)); setSelected([]); };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleSelectAll = () => setSelected(s => s.length === filtered.length ? [] : filtered.map(n => n.id));

  const togglePref = (key, channel) => {
    setChannelPrefs(p => p.map(c => c.key === key ? { ...c, [channel]: !c[channel] } : c));
  };

  const TABS = [
    { key: 'all',    label: 'All',     count: notifications.length },
    { key: 'unread', label: 'Unread',  count: unreadCount },
    { key: 'pinned', label: 'Pinned',  count: pinnedCount },
  ];

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Notifications
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage alerts, stay on top of store activity, and configure delivery preferences.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(p => !p)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
            showSettings
              ? 'bg-violet-600 border-violet-500 text-white'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Preferences
        </button>
      </div>

      {/* ── Preferences Panel ── */}
      {showSettings && (
        <div className="rounded-xl border border-white/10 bg-[#111118] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Notification Preferences</h2>
              <p className="text-xs text-slate-500 mt-0.5">Control how and where you receive each type of alert</p>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
              <span>In-App</span>
              <span>Email</span>
              <span>SMS</span>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {channelPrefs.map(pref => (
              <div key={pref.key} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{pref.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{pref.desc}</p>
                </div>
                <div className="flex items-center gap-6">
                  <Toggle value={pref.inApp} onChange={v => togglePref(pref.key, 'inApp')} />
                  <Toggle value={pref.email} onChange={v => togglePref(pref.key, 'email')} />
                  <Toggle value={pref.sms}   onChange={v => togglePref(pref.key, 'sms')}   />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',    val: notifications.length, color: 'text-white' },
          { label: 'Unread',   val: unreadCount,          color: 'text-violet-400' },
          { label: 'Critical', val: notifications.filter(n => n.priority === 'critical').length, color: 'text-red-400' },
          { label: 'Pinned',   val: pinnedCount,          color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">{s.label}</span>
            <span className={`text-xl font-bold ${s.color}`} style={{ fontFamily: 'Syne, sans-serif' }}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Tabs */}
        <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-1 gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === t.key
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === t.key ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-white/10 bg-[#111118] text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
        >
          <option value="all">All Types</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-white/10 bg-[#111118] text-slate-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
        >
          <option value="all">All Priorities</option>
          {Object.entries(PRIORITY_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* Search */}
        <div className="flex-1 min-w-[180px] relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search notifications…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/10 bg-[#111118] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Bulk actions (when selected) */}
        {selected.length > 0 ? (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-slate-400">{selected.length} selected</span>
            <button onClick={markSelectedRead} className="px-3 py-1.5 text-xs rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors border border-violet-500/20">
              Mark Read
            </button>
            <button onClick={deleteSelected} className="px-3 py-1.5 text-xs rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors border border-red-500/20">
              Delete
            </button>
          </div>
        ) : (
          unreadCount > 0 && (
            <button onClick={markAllRead} className="ml-auto text-xs text-violet-400 hover:text-violet-300 transition-colors whitespace-nowrap">
              Mark all as read
            </button>
          )
        )}
      </div>

      {/* ── Notification List ── */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#111118] p-16 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-white font-medium text-sm">No notifications found</p>
          <p className="text-slate-500 text-xs">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Select all bar */}
          <div className="flex items-center gap-3 px-1">
            <input
              type="checkbox"
              checked={selected.length === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
              className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-violet-600 cursor-pointer"
            />
            <span className="text-xs text-slate-500">
              Showing {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {grouped.map(([date, items]) => (
            <div key={date} className="space-y-1">
              {/* Date group header */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{date}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Notifications */}
              <div className="rounded-xl border border-white/10 bg-[#111118] divide-y divide-white/5 overflow-hidden">
                {items.map(n => {
                  const cfg = TYPE_CONFIG[n.type];
                  const pri = PRIORITY_CFG[n.priority];
                  const isExpanded = expandedId === n.id;

                  return (
                    <div
                      key={n.id}
                      className={`group relative transition-colors ${n.unread ? 'bg-white/[0.015]' : ''} hover:bg-white/[0.03]`}
                    >
                      {/* Unread indicator bar */}
                      {n.unread && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-500" />
                      )}

                      <div className="flex gap-3 px-5 py-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selected.includes(n.id)}
                          onChange={() => toggleSelect(n.id)}
                          className="mt-1 w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-violet-600 cursor-pointer flex-shrink-0"
                          onClick={e => e.stopPropagation()}
                        />

                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${cfg.bg} ${cfg.border} mt-0.5`}>
                          <svg className={`w-4 h-4 ${cfg.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {cfg.icon}
                          </svg>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setExpandedId(isExpanded ? null : n.id); markRead(n.id); }}>
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className={`text-sm font-semibold leading-snug ${n.unread ? 'text-white' : 'text-slate-300'}`}>
                              {n.title}
                            </span>
                            {n.pinned && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-medium">
                                Pinned
                              </span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${pri.cls}`}>
                              {pri.label}
                            </span>
                          </div>

                          <p className={`text-xs leading-snug mt-1 ${isExpanded ? '' : 'line-clamp-1'} ${n.unread ? 'text-slate-400' : 'text-slate-500'}`}>
                            {n.message}
                          </p>

                          {/* Expanded actions */}
                          {isExpanded && n.actions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {n.actions.map((a, ai) => (
                                <a key={ai} href={a.href}
                                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                    ai === 0
                                      ? `${cfg.bg} ${cfg.border} ${cfg.text} hover:opacity-80`
                                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                                  }`}>
                                  {a.label}
                                </a>
                              ))}
                            </div>
                          )}

                          <p className="text-[10px] text-slate-600 mt-1.5">{n.time}</p>
                        </div>

                        {/* Right actions — visible on hover */}
                        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          {/* Pin */}
                          <button
                            onClick={() => togglePin(n.id)}
                            title={n.pinned ? 'Unpin' : 'Pin'}
                            className={`p-1.5 rounded-lg transition-colors ${n.pinned ? 'text-amber-400 bg-amber-500/10' : 'text-slate-600 hover:text-amber-400 hover:bg-amber-500/10'}`}
                          >
                            <svg className="w-3.5 h-3.5" fill={n.pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                          {/* Mark read */}
                          {n.unread && (
                            <button
                              onClick={() => markRead(n.id)}
                              title="Mark as read"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          {/* Delete */}
                          <button
                            onClick={() => deleteOne(n.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}