
'use client';
import { useState } from 'react';
import { StockBadge, getStockStatus } from './StockBadge';

function StockBar({ quantity, threshold }) {
  const pct = threshold > 0 ? Math.min((quantity / (threshold * 4)) * 100, 100) : (quantity > 0 ? 100 : 0);
  const color =
    quantity === 0 ? 'bg-red-500' :
    quantity <= threshold ? 'bg-amber-500' :
    'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 tabular-nums">{quantity.toLocaleString()}</span>
    </div>
  );
}

export default function InventoryTable({
  items = [], loading,
  selected = [], onSelectChange,
  onAdjust, onViewHistory, onTransfer,
  pagination, onPageChange,
}) {
  const [actionMenu, setActionMenu] = useState(null);

  const allSelected = items.length > 0 && selected.length === items.length;
  const toggleAll = () => onSelectChange(allSelected ? [] : items.map(i => i._id));
  const toggleOne = (id) => onSelectChange(
    selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
        <div className="p-12 flex items-center justify-center gap-3 text-slate-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading inventory…
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
        <div className="p-16 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-[#1e1e2e] flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-medium">No inventory items found</p>
          <p className="text-slate-600 text-xs">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-violet-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Product / SKU</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Warehouse</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Reserved</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Available</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a24]">
            {items.map((item) => {
              const available = item.quantity - item.reserved;
              const status = getStockStatus(item);
              const isChecked = selected.includes(item._id);

              return (
                <tr
                  key={item._id}
                  className={`group transition-colors hover:bg-white/[0.02] ${isChecked ? 'bg-violet-500/5' : ''}`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(item._id)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-violet-500"
                    />
                  </td>

                  {/* Product */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-[#1e1e2e] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm leading-tight">{item.productName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{item.variantSku}</div>
                        {(item.attrs?.color || item.attrs?.size) && (
                          <div className="flex gap-1 mt-1">
                            {item.attrs.color && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-[#1e1e2e]">{item.attrs.color}</span>
                            )}
                            {item.attrs.size && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-[#1e1e2e]">{item.attrs.size}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Warehouse */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                      <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {item.warehouseName}
                    </div>
                  </td>

                  {/* Stock bar */}
                  <td className="px-4 py-3.5">
                    <StockBar quantity={item.quantity} threshold={item.threshold} />
                  </td>

                  {/* Reserved */}
                  <td className="px-4 py-3.5 text-slate-400 text-sm tabular-nums">
                    {item.reserved.toLocaleString()}
                  </td>

                  {/* Available */}
                  <td className="px-4 py-3.5">
                    <span className={`text-sm font-semibold tabular-nums ${available <= 0 ? 'text-red-400' : available <= item.threshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {Math.max(0, available).toLocaleString()}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StockBadge item={item} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {/* Adjust */}
                      <button
                        onClick={() => onAdjust(item)}
                        title="Adjust Stock"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      {/* Transfer */}
                      <button
                        onClick={() => onTransfer(item)}
                        title="Transfer Stock"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </button>
                      {/* History */}
                      <button
                        onClick={() => onViewHistory(item)}
                        title="View History"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="border-t border-[#1e1e2e] px-5 py-3.5 flex items-center justify-between text-sm text-slate-400">
          <span>
            Showing {((pagination.page - 1) * 15) + 1}–{Math.min(pagination.page * 15, pagination.total)} of {pagination.total} items
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${pagination.page === p ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'hover:bg-white/5 text-slate-400'}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
