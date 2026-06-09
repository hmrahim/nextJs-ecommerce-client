
'use client';

export default function WarehousePanel({ warehouses = [], allItems = [] }) {
  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Warehouses</h3>
        <span className="text-xs text-slate-500">{warehouses.length} locations</span>
      </div>
      <div className="divide-y divide-[#1a1a24]">
        {warehouses.map(wh => {
          const whItems = allItems.filter(i => i.warehouseId === wh._id);
          const totalUnits = whItems.reduce((s, i) => s + i.quantity, 0);
          const outCount   = whItems.filter(i => i.quantity === 0).length;
          const lowCount   = whItems.filter(i => i.quantity > 0 && i.quantity <= i.threshold).length;
          const fillPct    = warehouses.length > 0 ? (totalUnits / Math.max(...warehouses.map(w => {
            return allItems.filter(i => i.warehouseId === w._id).reduce((s, i) => s + i.quantity, 0);
          }))) * 100 : 0;

          return (
            <div key={wh._id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-white">{wh.name}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 ml-4">{wh.city}, {wh.country}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white tabular-nums">{totalUnits.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">units</div>
                </div>
              </div>

              {/* Fill bar */}
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all"
                  style={{ width: `${Math.min(fillPct, 100)}%` }}
                />
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400"><span className="text-white font-semibold">{whItems.length}</span> SKUs</span>
                {lowCount > 0 && <span className="text-amber-400"><span className="font-semibold">{lowCount}</span> low</span>}
                {outCount > 0 && <span className="text-red-400"><span className="font-semibold">{outCount}</span> OOS</span>}
                {lowCount === 0 && outCount === 0 && <span className="text-emerald-400">All healthy</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
