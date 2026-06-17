'use client';
import { useState, useEffect, useCallback } from 'react';
import DisputesTable from '@/components/admin/disputes/DisputesTable';
import DisputeFilters from '@/components/admin/disputes/DisputeFilters';
import DisputeDetailModal from '@/components/admin/disputes/DisputeDetailModal';

const ITEMS_PER_PAGE = 12;

/* ─── Dummy Data ─────────────────────────────────────────────────────────── */
const now = Date.now();
const d = (days) => new Date(now - 86400000 * days).toISOString();

const DUMMY_DISPUTES = [
  {
    _id: 'dsp001', disputeId: 'DSP-3021', orderNumber: 'ORD-10421',
    customerName: 'Sarah Johnson', customerEmail: 'sarah@example.com', customerOrderCount: 14,
    type: 'item_not_received', priority: 'critical', status: 'escalated',
    claimedAmount: 258.36, orderTotal: 258.36, paymentMethod: 'Credit Card',
    description: 'I placed this order 3 weeks ago and it still has not arrived. The tracking shows it was delivered, but I never received it. My neighbor also confirmed nothing was left at my door.',
    assignedTo: 'Mike R.', team: 'Tier 2 Support',
    openedAt: d(8), slaDeadline: d(-1),
    timeline: [
      { type: 'open', label: 'Dispute opened', note: 'Item not received after 21 days', at: d(8), by: 'Sarah Johnson' },
      { type: 'under_review', label: 'Moved to Under Review', at: d(7), by: 'System' },
      { type: 'note', label: 'Internal note added', note: 'Contacted carrier — investigating', at: d(6), by: 'Mike R.' },
      { type: 'escalated', label: 'Escalated to Tier 2', note: 'Carrier claims delivered, customer disputes', at: d(4), by: 'Mike R.' },
    ],
    messages: [
      { sender: 'customer', name: 'Sarah Johnson', text: 'I have been waiting for 3 weeks and my package has not arrived. Tracking says delivered but I never got it.', sentAt: d(8) },
      { sender: 'admin', name: 'Support Agent', text: 'Hi Sarah, I\'m so sorry to hear that. I\'ve opened an investigation with the carrier and will update you within 48 hours.', sentAt: d(7) },
      { sender: 'customer', name: 'Sarah Johnson', text: 'It has now been 5 days and still no update. This is unacceptable.', sentAt: d(4) },
      { sender: 'admin', name: 'Mike R.', text: 'I understand your frustration, Sarah. I\'ve escalated this to our senior team. We will resolve this within 24 hours.', sentAt: d(4) },
    ],
    evidence: [
      { name: 'delivery_photo.jpg', uploadedBy: 'Carrier', uploadedAt: d(8) },
      { name: 'chat_screenshot.png', uploadedBy: 'Sarah Johnson', uploadedAt: d(7) },
    ],
  },
  {
    _id: 'dsp002', disputeId: 'DSP-3022', orderNumber: 'ORD-10418',
    customerName: 'Michael Chen', customerEmail: 'mchen@example.com', customerOrderCount: 3,
    type: 'wrong_item', priority: 'high', status: 'under_review',
    claimedAmount: 149.99, orderTotal: 149.99, paymentMethod: 'PayPal',
    description: 'I ordered a Mechanical Keyboard TKL in Black but received one in White. This was a gift and is now ruined. I need either the correct item or a full refund immediately.',
    assignedTo: 'Lisa T.', team: 'Tier 1 Support',
    openedAt: d(3), slaDeadline: d(-0.5),
    timeline: [
      { type: 'open', label: 'Dispute opened', note: 'Wrong item color received', at: d(3), by: 'Michael Chen' },
      { type: 'under_review', label: 'Assigned to Lisa T.', at: d(2.5), by: 'System' },
    ],
    messages: [
      { sender: 'customer', name: 'Michael Chen', text: 'You sent me the wrong color keyboard. I specifically ordered Black but got White. I want the correct item ASAP.', sentAt: d(3) },
      { sender: 'admin', name: 'Lisa T.', text: 'Hi Michael, I apologize for the mix-up. Could you share a photo of what you received? I\'ll arrange an immediate replacement.', sentAt: d(2) },
    ],
    evidence: [
      { name: 'wrong_keyboard.jpg', uploadedBy: 'Michael Chen', uploadedAt: d(2.5) },
    ],
  },
  {
    _id: 'dsp003', disputeId: 'DSP-3023', orderNumber: 'ORD-10415',
    customerName: 'Emily Rodriguez', customerEmail: 'emily.r@example.com', customerOrderCount: 27,
    type: 'damaged_item', priority: 'high', status: 'awaiting_customer',
    claimedAmount: 64.99, orderTotal: 64.99, paymentMethod: 'Credit Card',
    description: 'The Yoga Mat arrived completely torn on one side and unusable. The packaging looked fine from outside but inside it was clearly damaged. I want a replacement or refund.',
    assignedTo: 'James K.', team: 'Tier 1 Support',
    openedAt: d(5), slaDeadline: new Date(now + 86400000 * 2).toISOString(),
    timeline: [
      { type: 'open', label: 'Dispute opened', note: 'Damaged item reported', at: d(5), by: 'Emily Rodriguez' },
      { type: 'under_review', label: 'Under Review', at: d(4), by: 'James K.' },
      { type: 'awaiting_customer', label: 'Awaiting Customer Response', note: 'Requested additional photos of damage', at: d(2), by: 'James K.' },
    ],
    messages: [
      { sender: 'customer', name: 'Emily Rodriguez', text: 'My yoga mat arrived with a large tear. I want a replacement.', sentAt: d(5) },
      { sender: 'admin', name: 'James K.', text: 'Hi Emily, could you send us a few photos of the damage so we can file a claim with the carrier?', sentAt: d(4) },
    ],
    evidence: [],
  },
  {
    _id: 'dsp004', disputeId: 'DSP-3024', orderNumber: 'ORD-10409',
    customerName: 'David Kim', customerEmail: 'dkim@example.com', customerOrderCount: 8,
    type: 'refund_not_received', priority: 'medium', status: 'open',
    claimedAmount: 186.37, orderTotal: 186.37, paymentMethod: 'Apple Pay',
    description: 'My return was approved 2 weeks ago but I still have not received my refund of SAR 186.37. The return tracking shows it was delivered to your warehouse 10 days ago.',
    assignedTo: null, team: null,
    openedAt: d(2), slaDeadline: new Date(now + 86400000 * 3).toISOString(),
    timeline: [
      { type: 'open', label: 'Dispute opened', note: 'Refund not received after approved return', at: d(2), by: 'David Kim' },
    ],
    messages: [
      { sender: 'customer', name: 'David Kim', text: 'I returned my order 2 weeks ago, return tracking confirms delivery, but no refund yet.', sentAt: d(2) },
    ],
    evidence: [
      { name: 'return_tracking.pdf', uploadedBy: 'David Kim', uploadedAt: d(2) },
    ],
  },
  {
    _id: 'dsp005', disputeId: 'DSP-3025', orderNumber: 'ORD-10402',
    customerName: 'Jessica Williams', customerEmail: 'jwilliams@example.com', customerOrderCount: 1,
    type: 'unauthorized_charge', priority: 'critical', status: 'open',
    claimedAmount: 86.38, orderTotal: 86.38, paymentMethod: 'Bank Transfer',
    description: 'I never placed this order. Someone used my account to make a purchase. I need an immediate refund and for my account to be secured.',
    assignedTo: null, team: null,
    openedAt: d(0.5), slaDeadline: new Date(now + 86400000 * 1).toISOString(),
    timeline: [
      { type: 'open', label: 'Dispute opened', note: 'Unauthorized charge reported', at: d(0.5), by: 'Jessica Williams' },
    ],
    messages: [
      { sender: 'customer', name: 'Jessica Williams', text: 'I did not make this purchase. Someone hacked my account. I want my money back immediately!', sentAt: d(0.5) },
    ],
    evidence: [],
  },
  {
    _id: 'dsp006', disputeId: 'DSP-3019', orderNumber: 'ORD-10398',
    customerName: 'Robert Nguyen', customerEmail: 'rnguyen@example.com', customerOrderCount: 5,
    type: 'not_as_described', priority: 'medium', status: 'resolved',
    claimedAmount: 54.99, orderTotal: 164.97, paymentMethod: 'Credit Card',
    description: 'The candles do not match the product description at all. They smell nothing like what was advertised and are much smaller than shown.',
    assignedTo: 'Lisa T.', team: 'Tier 1 Support',
    openedAt: d(15), slaDeadline: d(10),
    resolutionType: 'Partial Refund', refundIssued: 27.50, resolvedAt: d(10),
    timeline: [
      { type: 'open', label: 'Dispute opened', at: d(15), by: 'Robert Nguyen' },
      { type: 'under_review', label: 'Under Review', at: d(14), by: 'Lisa T.' },
      { type: 'refund_issued', label: 'Partial refund issued — SAR 27.50', note: 'Customer accepted partial refund', at: d(10), by: 'Lisa T.' },
      { type: 'resolved', label: 'Dispute resolved', at: d(10), by: 'Lisa T.' },
    ],
    messages: [],
    evidence: [],
  },
  {
    _id: 'dsp007', disputeId: 'DSP-3017', orderNumber: 'ORD-10391',
    customerName: 'Amanda Foster', customerEmail: 'afoster@example.com', customerOrderCount: 19,
    type: 'damaged_item', priority: 'low', status: 'closed',
    claimedAmount: 107.97, orderTotal: 107.97, paymentMethod: 'Credit Card',
    description: 'Ceramic coffee dripper arrived cracked.',
    assignedTo: 'Mike R.', team: 'Tier 1 Support',
    openedAt: d(20), slaDeadline: d(15),
    resolutionType: 'Full Refund', refundIssued: 107.97, resolvedAt: d(14),
    timeline: [
      { type: 'open', label: 'Dispute opened', at: d(20), by: 'Amanda Foster' },
      { type: 'under_review', label: 'Under Review', at: d(19), by: 'Mike R.' },
      { type: 'refund_issued', label: 'Full refund issued', at: d(14), by: 'Mike R.' },
      { type: 'resolved', label: 'Dispute resolved', at: d(14), by: 'Mike R.' },
      { type: 'closed', label: 'Dispute closed', at: d(12), by: 'System' },
    ],
    messages: [],
    evidence: [],
  },
];

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', type: '', sort: 'openedAt:desc' });
  const [selected, setSelected] = useState([]);
  const [activeDispute, setActiveDispute] = useState(null);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      // Replace with your actual API call:
      // const res = await disputeService.adminGetAll({ page: pagination.page, limit: ITEMS_PER_PAGE, ...filters });
      throw new Error('API not connected');
    } catch {
      // Fallback to dummy data
      const s = filters.search?.toLowerCase() || '';
      let filtered = DUMMY_DISPUTES.filter(d => {
        if (s && !d.disputeId.toLowerCase().includes(s) && !d.orderNumber.toLowerCase().includes(s)
          && !d.customerName.toLowerCase().includes(s) && !d.customerEmail.toLowerCase().includes(s)) return false;
        if (filters.status && d.status !== filters.status) return false;
        if (filters.priority && d.priority !== filters.priority) return false;
        if (filters.type && d.type !== filters.type) return false;
        return true;
      });

      const [field, dir] = (filters.sort || 'openedAt:desc').split(':');
      filtered.sort((a, b) => {
        const va = field === 'claimedAmount' ? a.claimedAmount : new Date(a.openedAt);
        const vb = field === 'claimedAmount' ? b.claimedAmount : new Date(b.openedAt);
        return dir === 'asc' ? va - vb : vb - va;
      });

      const start = (pagination.page - 1) * ITEMS_PER_PAGE;
      setDisputes(filtered.slice(start, start + ITEMS_PER_PAGE));
      setPagination(prev => ({ ...prev, total: filtered.length, pages: Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)) }));
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelected([]);
  };

  const handleUpdateStatus = async (id, status, note) => {
    setDisputes(prev => prev.map(d => {
      if (d._id !== id) return d;
      const newEvent = { type: status, label: `Status changed to ${status}`, note, at: new Date().toISOString(), by: 'Admin' };
      return { ...d, status, timeline: [...(d.timeline || []), newEvent] };
    }));
    if (activeDispute?._id === id) {
      setActiveDispute(prev => {
        const newEvent = { type: status, label: `Status changed to ${status}`, note, at: new Date().toISOString(), by: 'Admin' };
        return { ...prev, status, timeline: [...(prev.timeline || []), newEvent] };
      });
    }
  };

  // Stats
  const all = DUMMY_DISPUTES;
  const openCount = all.filter(d => d.status === 'open').length;
  const escalatedCount = all.filter(d => d.status === 'escalated').length;
  const reviewCount = all.filter(d => d.status === 'under_review').length;
  const resolvedCount = all.filter(d => d.status === 'resolved').length;
  const totalClaimed = all.filter(d => !['resolved','closed'].includes(d.status)).reduce((s, d) => s + (d.claimedAmount || 0), 0);
  const slaBreach = all.filter(d => d.slaDeadline && new Date(d.slaDeadline) < new Date() && !['resolved','closed'].includes(d.status)).length;

  const statsCards = [
    {
      label: 'Open Disputes', value: openCount,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
      color: 'from-red-500/20 to-red-500/5', border: 'border-red-500/20', text: 'text-red-400',
    },
    {
      label: 'Escalated', value: escalatedCount,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      color: 'from-rose-500/20 to-rose-500/5', border: 'border-rose-500/20', text: 'text-rose-400',
    },
    {
      label: 'Under Review', value: reviewCount,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
      color: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400',
    },
    {
      label: 'Resolved (30d)', value: resolvedCount,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400',
    },
    {
      label: 'Amount at Risk', value: `$${totalClaimed.toFixed(0)}`,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/20', text: 'text-violet-400',
    },
    {
      label: 'SLA Breached', value: slaBreach,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: slaBreach > 0 ? 'from-rose-500/20 to-rose-500/5' : 'from-slate-500/10 to-slate-500/5',
      border: slaBreach > 0 ? 'border-rose-500/20' : 'border-slate-500/20',
      text: slaBreach > 0 ? 'text-rose-400' : 'text-slate-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Disputes</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage customer disputes, escalations, and resolutions.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 bg-[#16161f] border border-[#1e1e2e] px-3 py-2 rounded-lg">
                {selected.length} selected
              </span>
              <button className="px-3 py-2 text-sm text-slate-400 bg-[#16161f] border border-[#1e1e2e] rounded-lg hover:text-white hover:border-[#2a2a3a] transition-colors">
                Bulk Assign
              </button>
            </div>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-sm font-medium rounded-xl hover:border-[#2a2a3a] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Demo notice */}
      {usingDummy && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Showing demo data — connect your backend API to <code className="bg-amber-500/10 px-1 rounded">disputeService</code> to go live.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statsCards.map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.color} p-4`}>
            <div className={`${s.text} mb-2`}>{s.icon}</div>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <DisputeFilters filters={filters} onChange={handleFilterChange} />

      {/* Table */}
      <DisputesTable
        disputes={disputes}
        loading={loading}
        selected={selected}
        onSelectChange={setSelected}
        onViewDispute={setActiveDispute}
        pagination={pagination}
        onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
      />

      {/* Detail Modal */}
      {activeDispute && (
        <DisputeDetailModal
          dispute={activeDispute}
          onClose={() => setActiveDispute(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
