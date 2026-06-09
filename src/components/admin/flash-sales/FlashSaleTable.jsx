// 📁 PATH: src/components/admin/flash-sales/FlashSaleTable.jsx
// ⚠️  এটা সম্পূর্ণ নতুন ফাইল

'use client';
import { useState } from 'react';
import CountdownTimer from './CountdownTimer';

/* ── helpers ────────────────────────────────────────────────────── */
function fmt(d)  { return new Date(d).toLocaleString('en-BD', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }); }
function fmtBDT(n){ return `৳${Number(n).toLocaleString('en-BD')}`; }

const STATUS_STYLE = {
  active:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  upcoming:  'bg-blue-500/10    text-blue-400    border-blue-500/20',
  scheduled: 'bg-blue-500/10    text-blue-400    border-blue-500/20',
  ended:     'bg-slate-500/10   text-slate-400   border-slate-500/20',
  draft:     'bg-yellow-500/10  text-yellow-400  border-yellow-500/20',
};
const STATUS_DOT = {
  active:    'bg-emerald-400 animate-pulse',
  upcoming:  'bg-blue-400',
  scheduled: 'bg-blue-400',
  ended:     'bg-slate-500',
  draft:     'bg-yellow-400',
};

function StockBar({ sold, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;
  const col  = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-orange-500' : 'bg-emerald-500';
  return (
    <div className="space-y-0.5">
      <div className="w-full h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${col}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-slate-500">{sold}/{total} sold ({pct}%)</p>
    </div>
  );
}

/* ── BulkActionBar ───────────────────────────────────────────────── */
function BulkActionBar({ count, onDelete, onClear }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-3">
      <span className="text-sm font-medium text-orange-400">{count} selected</span>
      <button onClick={onDelete} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        Delete selected
      </button>
      <button onClick={onClear} className="text-xs text-slate-500 hover:text-white transition-colors">Clear</button>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export default function FlashSaleTable({ sales, loading, onEdit, onDelete, onToggle, onDuplicate, onViewProducts, onBulkDelete }) {
  const [selected, setSelected] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const allChecked  = sales.length > 0 && selected.length === sales.length;
  const toggleAll   = () => setSelected(allChecked ? [] : sales.map(s => s._id));
  const toggleOne   = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#1e1e2e] overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-[#1e1e2e] last:border-0">
            <div className="w-4 h-4 rounded bg-[#1e1e2e] animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="w-48 h-4 rounded bg-[#1e1e2e] animate-pulse" />
              <div className="w-32 h-3 rounded bg-[#1e1e2e] animate-pulse" />
            </div>
            <div className="w-20 h-6 rounded bg-[#1e1e2e] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!sales.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-[#1e1e2e] text-center">
        <div className="text-5xl mb-4">⚡</div>
        <p className="text-slate-400 font-medium">No flash sales found</p>
        <p className="text-sm text-slate-600 mt-1">Create your first flash sale to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <BulkActionBar
          count={selected.length}
          onDelete={() => { onBulkDelete(selected); setSelected([]); }}
          onClear={() => setSelected([])}
        />
      )}

      <div className="rounded-xl border border-[#1e1e2e] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0d0d14] border-b border-[#1e1e2e]">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            className="w-3.5 h-3.5 rounded accent-orange-500"
          />
          <span className="flex-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sale Name</span>
          <span className="w-24 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:block">Status</span>
          <span className="w-36 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:block">Timeline</span>
          <span className="w-28 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:block">Stock</span>
          <span className="w-24 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden xl:block">Revenue</span>
          <span className="w-24 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</span>
        </div>

        {/* Rows */}
        {sales.map(sale => {
          const isExpanded = expandedId === sale._id;
          return (
            <div key={sale._id} className="border-b border-[#1e1e2e] last:border-0">
              {/* Main row */}
              <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[#0f0f18] transition-colors ${selected.includes(sale._id) ? 'bg-orange-500/5' : ''}`}>
                <input
                  type="checkbox"
                  checked={selected.includes(sale._id)}
                  onChange={() => toggleOne(sale._id)}
                  onClick={e => e.stopPropagation()}
                  className="w-3.5 h-3.5 rounded accent-orange-500 flex-shrink-0"
                />

                {/* Name + info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : sale._id)}
                      className="text-sm font-semibold text-white hover:text-orange-400 transition-colors text-left truncate max-w-[200px]"
                    >
                      {sale.name}
                    </button>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1e1e2e] text-slate-400 font-mono flex-shrink-0">
                      {sale.discountType === 'percent' ? `${sale.discountValue}% OFF` : `৳${sale.discountValue} OFF`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-slate-500">{sale.products?.length ?? 0} products</span>
                    <CountdownTimer endTime={sale.endTime} startTime={sale.startTime} status={sale.status} />
                  </div>
                </div>

                {/* Status */}
                <div className="w-24 hidden md:flex items-center gap-1.5 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${STATUS_STYLE[sale.status] ?? STATUS_STYLE.draft}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[sale.status] ?? STATUS_DOT.draft}`} />
                    {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                  </span>
                </div>

                {/* Timeline */}
                <div className="w-36 hidden lg:block flex-shrink-0">
                  <p className="text-[11px] text-slate-400">{fmt(sale.startTime)}</p>
                  <p className="text-[11px] text-slate-600">→ {fmt(sale.endTime)}</p>
                </div>

                {/* Stock */}
                <div className="w-28 hidden lg:block flex-shrink-0">
                  <StockBar sold={sale.soldCount || 0} total={sale.totalStock || 0} />
                </div>

                {/* Revenue */}
                <div className="w-24 hidden xl:block flex-shrink-0">
                  <p className="text-sm font-semibold text-emerald-400">{fmtBDT(sale.revenue || 0)}</p>
                </div>

                {/* Actions */}
                <div className="w-24 flex items-center justify-end gap-1 flex-shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => onToggle(sale._id)}
                    title={sale.isActive ? 'Deactivate' : 'Activate'}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border ${
                      sale.isActive
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-[#1a1a25] border-[#2e2e3e] text-slate-500 hover:text-white'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sale.isActive ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                    </svg>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => onEdit(sale)}
                    className="w-7 h-7 rounded-lg bg-[#1a1a25] border border-[#2e2e3e] flex items-center justify-center text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>

                  {/* More menu */}
                  <MoreMenu sale={sale} onDuplicate={onDuplicate} onDelete={onDelete} onViewProducts={onViewProducts} />
                </div>
              </div>

              {/* Expanded product list */}
              {isExpanded && sale.products?.length > 0 && (
                <div className="px-4 pb-3 bg-[#0a0a0f] border-t border-[#1e1e2e]">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pt-3 mb-2">Products in this sale</p>
                  <div className="space-y-1.5">
                    {sale.products.map(p => (
                      <div key={p._id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#111118] border border-[#1e1e2e]">
                        <div className="w-7 h-7 rounded-lg bg-[#1e1e2e] flex items-center justify-center text-sm flex-shrink-0">
                          {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover rounded-lg" /> : '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-600 font-mono">{p.sku}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-orange-400">{fmtBDT(p.salePrice)}</p>
                          <p className="text-[10px] text-slate-600 line-through">{fmtBDT(p.originalPrice)}</p>
                        </div>
                        <div className="text-right flex-shrink-0 hidden sm:block">
                          <p className="text-[10px] text-slate-400">{p.sold}/{p.stock} sold</p>
                          <div className="w-14 h-1 bg-[#1e1e2e] rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${p.stock > 0 ? Math.min(100, Math.round((p.sold/p.stock)*100)) : 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── MoreMenu ────────────────────────────────────────────────────── */
function MoreMenu({ sale, onDuplicate, onDelete, onViewProducts }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-7 h-7 rounded-lg bg-[#1a1a25] border border-[#2e2e3e] flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-[#2e2e3e] bg-[#111118] shadow-2xl z-20 overflow-hidden">
            <button
              onClick={() => { onViewProducts(sale); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-300 hover:bg-[#1e1e2e] hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Manage Products
            </button>
            <button
              onClick={() => { onDuplicate(sale._id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-300 hover:bg-[#1e1e2e] hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Duplicate
            </button>
            <div className="border-t border-[#1e1e2e]" />
            <button
              onClick={() => { onDelete(sale._id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete Sale
            </button>
          </div>
        </>
      )}
    </div>
  );
}
