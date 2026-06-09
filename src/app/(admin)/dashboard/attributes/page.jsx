// 📁 PATH: src/app/(admin)/dashboard/attributes/page.jsx
'use client';
import { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

import { DUMMY_ATTRIBUTES, DUMMY_STATS } from '@/components/admin/attributes/_dummyData';
import AttributeStatsBar      from '@/components/admin/attributes/AttributeStatsBar';
import AttributeTable         from '@/components/admin/attributes/AttributeTable';
import AttributeFormModal     from '@/components/admin/attributes/AttributeFormModal';
import AttributeValuesDrawer  from '@/components/admin/attributes/AttributeValuesDrawer';

// ── Slug helper ───────────────────────────────────────────────────────────────
const slugify = (t) => t.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

// ── Filter bar ────────────────────────────────────────────────────────────────
function Filters({ search, setSearch, typeFilter, setTypeFilter, statusFilter, setStatusFilter }) {
  const TYPES = [
    { value: '', label: 'All Types' },
    { value: 'select',       label: 'Select' },
    { value: 'multiselect',  label: 'Multi-select' },
    { value: 'color',        label: 'Color' },
    { value: 'boolean',      label: 'Boolean' },
    { value: 'text',         label: 'Text' },
    { value: 'number',       label: 'Number' },
  ];
  const sel = 'px-3 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-amber-500/50 transition-colors';
  const active = search || typeFilter || statusFilter;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Attribute name or slug…"
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#16161f] border border-[#1e1e2e] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={sel}>
        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={sel}>
        <option value="">All Status</option>
        <option value="active">✅ Active</option>
        <option value="inactive">⏸ Inactive</option>
      </select>

      {active && (
        <button onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); }}
          className="px-3 py-2 rounded-xl border border-[#1e1e2e] text-slate-500 hover:text-slate-300 text-sm transition-colors">
          Clear
        </button>
      )}
    </div>
  );
}

// ── Bulk bar ──────────────────────────────────────────────────────────────────
function BulkBar({ count, onDelete, onActivate, onDeactivate, onClear }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex-wrap">
      <span className="text-sm font-semibold text-amber-300">{count} selected</span>
      <div className="flex items-center gap-2 ml-auto flex-wrap">
        <button onClick={onActivate}   className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors">✓ Activate</button>
        <button onClick={onDeactivate} className="px-3 py-1.5 rounded-lg bg-slate-600/80 hover:bg-slate-600 text-white text-xs font-semibold transition-colors">⏸ Deactivate</button>
        <button onClick={onDelete}     className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors">🗑 Delete</button>
        <button onClick={onClear}      className="px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-500 hover:text-slate-300 text-xs transition-colors">Clear</button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AttributesPage() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [attributes, setAttributes] = useState(DUMMY_ATTRIBUTES);
  const [stats, setStats]           = useState(DUMMY_STATS);
  const [selected, setSelected]     = useState([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [drawer, setDrawer]         = useState(null);   // attribute being managed

  // Filters
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── Recalc stats ──────────────────────────────────────────────────────────
  const recalc = useCallback((list) => {
    setStats({
      total:       list.length,
      active:      list.filter(a => a.isActive).length,
      inactive:    list.filter(a => !a.isActive).length,
      filterable:  list.filter(a => a.isFilterable).length,
      variant:     list.filter(a => a.isVariant).length,
      totalValues: list.reduce((s, a) => s + (a.values?.length || 0), 0),
    });
  }, []);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...attributes];
    if (search)       list = list.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.slug.includes(search.toLowerCase()));
    if (typeFilter)   list = list.filter(a => a.type === typeFilter);
    if (statusFilter) list = list.filter(a => statusFilter === 'active' ? a.isActive : !a.isActive);
    return list;
  }, [attributes, search, typeFilter, statusFilter]);

  // ── Attribute CRUD ────────────────────────────────────────────────────────
  const handleSave = useCallback(async (formData) => {
    setAttributes(prev => {
      let updated;
      if (editing) {
        updated = prev.map(a => a._id === editing._id ? { ...a, ...formData } : a);
        toast.success('Attribute updated');
      } else {
        const newAttr = {
          ...formData,
          _id: 'attr_' + Date.now(),
          slug: formData.slug || slugify(formData.name),
          usedInProducts: 0,
          values: [],
        };
        updated = [...prev, newAttr];
        toast.success('Attribute created');
      }
      recalc(updated);
      return updated;
    });
    setModalOpen(false);
    setEditing(null);
    // 🔌 REAL API: editing ? await attributeService.adminUpdate(editing._id, formData) : await attributeService.adminCreate(formData);
  }, [editing, recalc]);

  const handleDelete = useCallback((id) => {
    if (!confirm('Delete this attribute? Products using it may lose data.')) return;
    setAttributes(prev => { const u = prev.filter(a => a._id !== id); recalc(u); return u; });
    setSelected(prev => prev.filter(x => x !== id));
    toast.success('Attribute deleted');
    // 🔌 REAL API: await attributeService.adminDelete(id);
  }, [recalc]);

  const handleToggle = useCallback((id) => {
    setAttributes(prev => { const u = prev.map(a => a._id === id ? { ...a, isActive: !a.isActive } : a); recalc(u); return u; });
    // 🔌 REAL API: await attributeService.adminToggle(id);
  }, [recalc]);

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const bulkActivate = () => {
    setAttributes(prev => { const u = prev.map(a => selected.includes(a._id) ? { ...a, isActive: true } : a); recalc(u); return u; });
    toast.success(`${selected.length} activated`);
    setSelected([]);
  };
  const bulkDeactivate = () => {
    setAttributes(prev => { const u = prev.map(a => selected.includes(a._id) ? { ...a, isActive: false } : a); recalc(u); return u; });
    toast.success(`${selected.length} deactivated`);
    setSelected([]);
  };
  const bulkDelete = () => {
    if (!confirm(`Delete ${selected.length} attribute(s)? This cannot be undone.`)) return;
    setAttributes(prev => { const u = prev.filter(a => !selected.includes(a._id)); recalc(u); return u; });
    toast.success(`${selected.length} deleted`);
    setSelected([]);
  };

  // ── Value CRUD (inside drawer) ────────────────────────────────────────────
  const handleAddValue = useCallback((attrId, data) => {
    const newVal = { _id: 'v_' + Date.now(), ...data, sortOrder: 99, isActive: true };
    setAttributes(prev => {
      const u = prev.map(a => a._id === attrId ? { ...a, values: [...(a.values || []), newVal] } : a);
      recalc(u);
      return u;
    });
    setDrawer(prev => prev?._id === attrId
      ? { ...prev, values: [...(prev.values || []), newVal] }
      : prev
    );
    toast.success('Value added');
    // 🔌 REAL API: await attributeService.adminAddValue(attrId, data);
  }, [recalc]);

  const handleUpdateValue = useCallback((valId, data) => {
    setAttributes(prev => {
      const u = prev.map(a => ({
        ...a,
        values: (a.values || []).map(v => v._id === valId ? { ...v, ...data } : v),
      }));
      recalc(u);
      return u;
    });
    setDrawer(prev => prev ? {
      ...prev,
      values: (prev.values || []).map(v => v._id === valId ? { ...v, ...data } : v),
    } : prev);
    // 🔌 REAL API: await attributeService.adminUpdateValue(attrId, valId, data);
  }, [recalc]);

  const handleDeleteValue = useCallback((valId) => {
    setAttributes(prev => {
      const u = prev.map(a => ({ ...a, values: (a.values || []).filter(v => v._id !== valId) }));
      recalc(u);
      return u;
    });
    setDrawer(prev => prev ? { ...prev, values: (prev.values || []).filter(v => v._id !== valId) } : prev);
    toast.success('Value removed');
    // 🔌 REAL API: await attributeService.adminDeleteValue(attrId, valId);
  }, [recalc]);

  const handleToggleValue = useCallback((valId) => {
    setAttributes(prev => {
      const u = prev.map(a => ({
        ...a,
        values: (a.values || []).map(v => v._id === valId ? { ...v, isActive: !v.isActive } : v),
      }));
      recalc(u);
      return u;
    });
    setDrawer(prev => prev ? {
      ...prev,
      values: (prev.values || []).map(v => v._id === valId ? { ...v, isActive: !v.isActive } : v),
    } : prev);
  }, [recalc]);

  // ── Open helpers ──────────────────────────────────────────────────────────
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (attr) => { setEditing(attr); setModalOpen(true); };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Attributes</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Define product attributes like Color, Size and Material to power variants and filters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium">
            ⚡ Demo Mode
          </span>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors shadow-lg shadow-amber-900/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New Attribute
          </button>
        </div>
      </div>

      {/* Stats */}
      <AttributeStatsBar stats={stats} loading={false}/>

      {/* Filters */}
      <Filters
        search={search}      setSearch={setSearch}
        typeFilter={typeFilter}   setTypeFilter={setTypeFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
      />

      {/* Bulk bar */}
      <BulkBar
        count={selected.length}
        onActivate={bulkActivate}
        onDeactivate={bulkDeactivate}
        onDelete={bulkDelete}
        onClear={() => setSelected([])}
      />

      {/* Table */}
      <AttributeTable
        attributes={filtered}
        loading={false}
        selected={selected}
        onSelectChange={setSelected}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        onManageValues={setDrawer}
      />

      {/* Create / Edit modal */}
      {modalOpen && (
        <AttributeFormModal
          editing={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}

      {/* Values drawer */}
      {drawer && (
        <AttributeValuesDrawer
          attribute={drawer}
          onClose={() => setDrawer(null)}
          onAddValue={handleAddValue}
          onUpdateValue={handleUpdateValue}
          onDeleteValue={handleDeleteValue}
          onToggleValue={handleToggleValue}
        />
      )}
    </div>
  );
}
