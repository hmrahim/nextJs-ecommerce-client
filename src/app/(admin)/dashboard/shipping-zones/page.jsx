// 📁 PATH: src/app/(admin)/dashboard/shipping-zones/page.jsx
'use client';
import { useState, useMemo } from 'react';
import ZoneTable     from '@/components/admin/shipping-zones/ZoneTable';
import ZoneFilters   from '@/components/admin/shipping-zones/ZoneFilters';
import ZoneFormModal from '@/components/admin/shipping-zones/ZoneFormModal';
import { DUMMY_ZONES } from '@/components/admin/shipping-zones/_dummyData';

export default function ShippingZonesPage() {
  const [zones, setZones] = useState(DUMMY_ZONES);
  const [filters, setFilters] = useState({ search: '', status: '', type: '', division: '', sort: 'priority:asc' });
  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    let list = [...zones];
    const q = filters.search?.toLowerCase().trim();
    if (q) list = list.filter(z =>
      z.name.toLowerCase().includes(q) ||
      z.code.toLowerCase().includes(q) ||
      z.regions.some(r => r.toLowerCase().includes(q))
    );
    if (filters.type)     list = list.filter(z => z.type === filters.type);
    if (filters.division) list = list.filter(z => z.division === filters.division);
    if (filters.status === 'active')   list = list.filter(z => z.isActive);
    if (filters.status === 'inactive') list = list.filter(z => !z.isActive);

    const [k, dir] = (filters.sort || 'priority:asc').split(':');
    const mul = dir === 'desc' ? -1 : 1;
    list.sort((a, b) => {
      const va = a[k], vb = b[k];
      if (typeof va === 'string') return va.localeCompare(vb) * mul;
      return ((va ?? 0) - (vb ?? 0)) * mul;
    });
    return list;
  }, [zones, filters]);

  const stats = useMemo(() => ({
    total:     zones.length,
    active:    zones.filter(z => z.isActive).length,
    inactive:  zones.filter(z => !z.isActive).length,
    avgRate:   Math.round(zones.reduce((s, z) => s + z.baseRate, 0) / Math.max(1, zones.length)),
    orders30d: zones.reduce((s, z) => s + z.orders30d, 0),
    codZones:  zones.filter(z => z.codAvailable).length,
  }), [zones]);

  const handleSave = (data) => {
    if (editing) {
      setZones(p => p.map(z => z._id === editing._id ? { ...z, ...data } : z));
    } else {
      setZones(p => [{ ...data, _id: 'z_' + Date.now(), orders30d: 0, createdAt: new Date().toISOString() }, ...p]);
    }
    setModalOpen(false); setEditing(null);
  };
  const handleDelete = (id) => { setZones(p => p.filter(z => z._id !== id)); setSelected(s => s.filter(x => x !== id)); };
  const handleToggle = (id) => setZones(p => p.map(z => z._id === id ? { ...z, isActive: !z.isActive } : z));
  const handleBulkDelete = () => { setZones(p => p.filter(z => !selected.includes(z._id))); setSelected([]); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Shipping Zones</h1>
          <p className="text-sm text-slate-400 mt-0.5">Region-wise delivery rates, COD options & courier mapping configure করো।</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete ({selected.length})
            </button>
          )}
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-900/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Zone
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Zones',  value: stats.total,      color: 'text-white' },
          { label: 'Active',       value: stats.active,     color: 'text-emerald-400' },
          { label: 'Inactive',     value: stats.inactive,   color: 'text-slate-400' },
          { label: 'Avg Rate',     value: `৳${stats.avgRate}`, color: 'text-orange-400' },
          { label: 'COD Zones',    value: stats.codZones,   color: 'text-sky-400' },
          { label: 'Orders (30d)', value: stats.orders30d.toLocaleString(), color: 'text-violet-400' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <ZoneFilters filters={filters} onChange={setFilters} />

      <ZoneTable
        zones={filtered}
        loading={false}
        selected={selected}
        onSelectChange={setSelected}
        onEdit={(z) => { setEditing(z); setModalOpen(true); }}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      <ZoneFormModal open={modalOpen} editing={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />
    </div>
  );
}
