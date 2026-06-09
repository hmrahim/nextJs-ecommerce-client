// 📁 PATH: src/app/(admin)/dashboard/couriers/page.jsx
'use client';
import { useState, useMemo } from 'react';
import CourierTable     from '@/components/admin/couriers/CourierTable';
import CourierFilters   from '@/components/admin/couriers/CourierFilters';
import CourierFormModal from '@/components/admin/couriers/CourierFormModal';
import { DUMMY_COURIERS } from '@/components/admin/couriers/_dummyData';

export default function CouriersPage() {
  const [couriers, setCouriers] = useState(DUMMY_COURIERS);
  const [filters, setFilters] = useState({ search: '', status: '', type: '', api: '', sort: 'activeShipments:desc' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => {
    let list = [...couriers];
    const q = filters.search?.toLowerCase().trim();
    if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    if (filters.type)   list = list.filter(c => c.type === filters.type);
    if (filters.api)    list = list.filter(c => c.apiStatus === filters.api);
    if (filters.status === 'active')   list = list.filter(c => c.isActive);
    if (filters.status === 'inactive') list = list.filter(c => !c.isActive);

    const [k, dir] = (filters.sort || 'activeShipments:desc').split(':');
    const mul = dir === 'desc' ? -1 : 1;
    list.sort((a, b) => {
      const va = a[k], vb = b[k];
      if (typeof va === 'string') return va.localeCompare(vb) * mul;
      return ((va ?? 0) - (vb ?? 0)) * mul;
    });
    return list;
  }, [couriers, filters]);

  const stats = useMemo(() => ({
    total: couriers.length,
    active: couriers.filter(c => c.isActive).length,
    apiConnected: couriers.filter(c => c.apiStatus === 'connected').length,
    activeShipments: couriers.reduce((s, c) => s + c.activeShipments, 0),
    avgSuccess: (couriers.reduce((s, c) => s + c.successRate, 0) / Math.max(1, couriers.length)).toFixed(1),
    preferred: couriers.filter(c => c.isPreferred).length,
  }), [couriers]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const handleSave = (data) => {
    if (editing) {
      setCouriers(p => p.map(c => c._id === editing._id ? { ...c, ...data } : c));
      showToast('✓ Courier updated');
    } else {
      setCouriers(p => [{ ...data, _id: 'cr_' + Date.now(), createdAt: new Date().toISOString() }, ...p]);
      showToast('✓ Courier added');
    }
    setModalOpen(false); setEditing(null);
  };
  const handleDelete = (id) => { setCouriers(p => p.filter(c => c._id !== id)); showToast('✓ Courier removed'); };
  const handleToggle = (id) => setCouriers(p => p.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c));
  const handleTestApi = (id) => {
    const c = couriers.find(x => x._id === id);
    if (c?.apiStatus === 'connected') showToast(`✓ ${c.name} API working — ${Math.floor(Math.random() * 80 + 120)}ms`);
    else showToast(`✗ ${c?.name} API unreachable`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Couriers</h1>
          <p className="text-sm text-slate-400 mt-0.5">Delivery partners, API integration, rates ও performance manage করো।</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-900/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Courier
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total',         value: stats.total,                       color: 'text-white' },
          { label: 'Active',        value: stats.active,                      color: 'text-emerald-400' },
          { label: 'API Connected', value: stats.apiConnected,                color: 'text-sky-400' },
          { label: 'Preferred',     value: stats.preferred,                   color: 'text-amber-400' },
          { label: 'Active Ship.',  value: stats.activeShipments.toLocaleString(), color: 'text-violet-400' },
          { label: 'Avg Success',   value: `${stats.avgSuccess}%`,            color: 'text-orange-400' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <CourierFilters filters={filters} onChange={setFilters} />

      <CourierTable
        couriers={filtered}
        loading={false}
        onEdit={(c) => { setEditing(c); setModalOpen(true); }}
        onDelete={handleDelete}
        onToggle={handleToggle}
        onTestApi={handleTestApi}
      />

      <CourierFormModal open={modalOpen} editing={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-[#16161f] border border-orange-500/30 text-orange-300 text-sm shadow-xl animate-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}
