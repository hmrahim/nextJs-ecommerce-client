
'use client';

const STOCK_STATUS_OPTIONS = [
  { value: '', label: 'All Stock Status' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'low', label: 'Low Stock' },
  { value: 'out', label: 'Out of Stock' },
];

const SORT_OPTIONS = [
  { value: 'updatedAt:desc',  label: 'Recently Updated' },
  { value: 'quantity:asc',    label: 'Quantity: Low → High' },
  { value: 'quantity:desc',   label: 'Quantity: High → Low' },
  { value: 'productName:asc', label: 'Product A → Z' },
];

export default function InventoryFilters({ filters, onChange, warehouses = [] }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const inputCls =
    'h-9 px-3 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors';
  const selectCls =
    'h-9 px-3 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer';

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search product, SKU…"
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          className={`${inputCls} pl-9 w-full`}
        />
      </div>

      {/* Warehouse filter */}
      <select value={filters.warehouseId} onChange={e => set('warehouseId', e.target.value)} className={selectCls}>
        <option value="">All Warehouses</option>
        {warehouses.map(w => (
          <option key={w._id} value={w._id}>{w.name}</option>
        ))}
      </select>

      {/* Stock status */}
      <select value={filters.stockStatus} onChange={e => set('stockStatus', e.target.value)} className={selectCls}>
        {STOCK_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Sort */}
      <select value={filters.sort} onChange={e => set('sort', e.target.value)} className={selectCls}>
        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
