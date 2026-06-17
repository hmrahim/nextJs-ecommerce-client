// 📁 PATH: src/app/(admin)/dashboard/attributes/page.jsx
'use client';
import { useState, useMemo } from 'react';

import {
  useAdminAttributes,
  useCreateAttribute,
  useUpdateAttribute,
  useDeleteAttribute,
  useToggleAttribute,
  useBulkActivateAttributes,
  useBulkDeactivateAttributes,
  useBulkDeleteAttributes,
  useAddAttributeValue,
  useUpdateAttributeValue,
  useDeleteAttributeValue,
  useToggleAttributeValue,
} from '@/hooks/Useattributes';

import AttributeStatsBar      from '@/components/admin/attributes/AttributeStatsBar';
import AttributeTable         from '@/components/admin/attributes/AttributeTable';
import AttributeFormModal     from '@/components/admin/attributes/AttributeFormModal';
import AttributeValuesDrawer  from '@/components/admin/attributes/AttributeValuesDrawer';
import VariantGeneratorModal  from '@/components/admin/variants/VariantGeneratorModal';

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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AttributesPage() {
  // ── Filters (client-side state) ───────────────────────────────────────────
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selected, setSelected]         = useState([]);
  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState(null);
  const [drawer, setDrawer]             = useState(null);
  const [variantModalOpen, setVariantModalOpen] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data, isLoading } = useAdminAttributes({ search, typeFilter, statusFilter });
  const attributes = data?.attributes ?? [];
  const stats      = data?.stats      ?? {};

  // ── Client-side filtering (If backend filter without doing) ────────────────────
  const filtered = useMemo(() => {
    // If backend filtering If you do, then this block Remove it and just `attributes` return Do
    let list = [...attributes];
    if (search)       list = list.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.slug.includes(search.toLowerCase()));
    if (typeFilter)   list = list.filter(a => a.type === typeFilter);
    if (statusFilter) list = list.filter(a => statusFilter === 'active' ? a.isActive : !a.isActive);
    return list;
  }, [attributes, search, typeFilter, statusFilter]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createAttr      = useCreateAttribute();
  const updateAttr      = useUpdateAttribute();
  const deleteAttr      = useDeleteAttribute();
  const toggleAttr      = useToggleAttribute();
  const bulkActivate    = useBulkActivateAttributes();
  const bulkDeactivate  = useBulkDeactivateAttributes();
  const bulkDelete      = useBulkDeleteAttributes();
  const addValue        = useAddAttributeValue();
  const updateValue     = useUpdateAttributeValue();
  const deleteValue     = useDeleteAttributeValue();
  const toggleValue     = useToggleAttributeValue();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    if (editing) {
      await updateAttr.mutateAsync({ id: editing._id, data: formData });
    } else {
      await createAttr.mutateAsync(formData);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this attribute? Products using it may lose data.')) return;
    deleteAttr.mutate(id);
    setSelected(prev => prev.filter(x => x !== id));
  };

  const handleToggle = (id) => toggleAttr.mutate(id);

  const handleBulkActivate = () => {
    bulkActivate.mutate(selected, { onSuccess: () => setSelected([]) });
  };
  const handleBulkDeactivate = () => {
    bulkDeactivate.mutate(selected, { onSuccess: () => setSelected([]) });
  };
  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selected.length} attribute(s)? This cannot be undone.`)) return;
    bulkDelete.mutate(selected, { onSuccess: () => setSelected([]) });
  };

  // ── Value handlers (drawer) ───────────────────────────────────────────────
  const handleAddValue = (attrId, valueData) =>
    addValue.mutate({ attrId, data: valueData });

  const handleUpdateValue = (attrId, valId, valueData) =>
    updateValue.mutate({ attrId, valId, data: valueData });

  const handleDeleteValue = (attrId, valId) =>
    deleteValue.mutate({ attrId, valId });

  const handleToggleValue = (attrId, valId, currentActive) =>
    toggleValue.mutate({ attrId, valId, currentActive });

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
          <button
            onClick={() => setVariantModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 text-violet-400 text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8"/>
            </svg>
            Generate Variants
          </button>

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
      <AttributeStatsBar stats={stats} loading={isLoading} />

      {/* Filters */}
      <Filters
        search={search}           setSearch={setSearch}
        typeFilter={typeFilter}   setTypeFilter={setTypeFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
      />

      {/* Bulk bar */}
      <BulkBar
        count={selected.length}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onDelete={handleBulkDelete}
        onClear={() => setSelected([])}
      />

      {/* Table */}
      <AttributeTable
        attributes={filtered}
        loading={isLoading}
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
         onAddValue={(_attrId, data) => handleAddValue(drawer._id, data)}
          onUpdateValue={(valId, data) => handleUpdateValue(drawer._id, valId, data)}
          onDeleteValue={(valId) => handleDeleteValue(drawer._id, valId)}
          onToggleValue={(valId, currentActive) => handleToggleValue(drawer._id, valId, currentActive)}
        />
      )}

      {/* Variant Generator Modal */}
      {variantModalOpen && (
        <VariantGeneratorModal
          attributes={attributes}
          onClose={() => setVariantModalOpen(false)}
        />
      )}
    </div>
  );
}