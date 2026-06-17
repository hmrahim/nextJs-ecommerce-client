// 📁 PATH: src/app/(admin)/dashboard/tracking/page.jsx
'use client';
import { useState, useMemo } from 'react';
import TrackingTable       from '@/components/admin/tracking/TrackingTable';
import TrackingFilters     from '@/components/admin/tracking/TrackingFilters';
import TrackingDetailModal from '@/components/admin/tracking/TrackingDetailModal';
import { DUMMY_SHIPMENTS, TRACKING_STATUSES } from '@/components/admin/tracking/_dummyData';

const ADVANCE_MAP = {
  pending:          'picked_up',
  picked_up:        'in_transit',
  in_transit:       'at_hub',
  at_hub:           'out_for_delivery',
  out_for_delivery: 'delivered',
  failed_attempt:   'out_for_delivery',
};

export default function TrackingPage() {
  const [shipments, setShipments] = useState(DUMMY_SHIPMENTS);
  const [filters, setFilters] = useState({ search: '', status: '', courier: '', priority: '', cod: '' });
  const [viewing, setViewing] = useState(null);
  const [toast, setToast] = useState(null);

  const courierList = useMemo(() => [...new Set(shipments.map(s => s.courier))].sort(), [shipments]);

  const filtered = useMemo(() => {
    let list = [...shipments];
    const q = filters.search?.toLowerCase().trim();
    if (q) list = list.filter(s =>
      s.trackingNumber.toLowerCase().includes(q) ||
      s.orderId.toLowerCase().includes(q) ||
      s.customer.name.toLowerCase().includes(q) ||
      s.customer.phone.includes(q)
    );
    if (filters.status)   list = list.filter(s => s.status === filters.status);
    if (filters.courier)  list = list.filter(s => s.courier === filters.courier);
    if (filters.priority) list = list.filter(s => s.priority === filters.priority);
    if (filters.cod === 'cod')     list = list.filter(s => s.isCod);
    if (filters.cod === 'prepaid') list = list.filter(s => !s.isCod);
    return list.sort((a, b) => new Date(b.events[0]?.timestamp || b.createdAt) - new Date(a.events[0]?.timestamp || a.createdAt));
  }, [shipments, filters]);

  const stats = useMemo(() => ({
    total: shipments.length,
    inTransit: shipments.filter(s => ['picked_up', 'in_transit', 'at_hub', 'out_for_delivery'].includes(s.status)).length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    pending:   shipments.filter(s => s.status === 'pending').length,
    failed:    shipments.filter(s => ['failed_attempt', 'returned'].includes(s.status)).length,
    codValue:  shipments.filter(s => s.isCod && s.status !== 'delivered').reduce((sum, s) => sum + s.codAmount, 0),
    overdue:   shipments.filter(s => s.estimatedDelivery && new Date(s.estimatedDelivery) < new Date() && !['delivered', 'returned', 'cancelled'].includes(s.status)).length,
  }), [shipments]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const handleAddNote = (id, noteText) => {
    setShipments(p => p.map(s => {
      if (s._id !== id) return s;
      const newEvent = {
        status: s.status,
        location: s.currentLocation,
        note: noteText,
        operator: 'Admin (You)',
        timestamp: new Date().toISOString(),
      };
      return { ...s, events: [newEvent, ...s.events] };
    }));
    setViewing(v => v && v._id === id ? { ...v, events: [{ status: v.status, location: v.currentLocation, note: noteText, operator: 'Admin (You)', timestamp: new Date().toISOString() }, ...v.events] } : v);
    showToast('✓ Note added to timeline');
  };

  const handleAdvanceStatus = (id) => {
    setShipments(p => p.map(s => {
      if (s._id !== id) return s;
      const next = ADVANCE_MAP[s.status];
      if (!next) return s;
      const st = TRACKING_STATUSES[next];
      const newEvent = {
        status: next,
        location: s.currentLocation,
        note: `Manually advanced to ${st.label}`,
        operator: 'Admin (You)',
        timestamp: new Date().toISOString(),
      };
      const updated = {
        ...s,
        status: next,
        events: [newEvent, ...s.events],
        ...(next === 'delivered' ? { deliveredAt: new Date().toISOString(), currentLocation: 'Delivered' } : {}),
      };
      return updated;
    }));
    setViewing(null);
    showToast('✓ Status advanced');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Shipment Tracking</h1>
          <p className="text-sm text-slate-400 mt-0.5">Real-time tracking, status timeline And courier performance monitoring।</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live updates
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total',       value: stats.total,        color: 'text-white' },
          { label: 'Pending',     value: stats.pending,      color: 'text-slate-300' },
          { label: 'In Transit',  value: stats.inTransit,    color: 'text-violet-400' },
          { label: 'Delivered',   value: stats.delivered,    color: 'text-emerald-400' },
          { label: 'Failed/Ret.', value: stats.failed,       color: 'text-red-400' },
          { label: 'Overdue',     value: stats.overdue,      color: 'text-amber-400' },
          { label: 'COD Pending', value: `SAR ${(stats.codValue / 1000).toFixed(1)}k`, color: 'text-orange-400' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <TrackingFilters filters={filters} onChange={setFilters} couriers={courierList} />

      <TrackingTable shipments={filtered} loading={false} onView={setViewing} />

      <TrackingDetailModal
        shipment={viewing}
        onClose={() => setViewing(null)}
        onAddNote={handleAddNote}
        onAdvanceStatus={handleAdvanceStatus}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-[#16161f] border border-orange-500/30 text-orange-300 text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
