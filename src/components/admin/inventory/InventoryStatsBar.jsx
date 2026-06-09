
'use client';

export default function InventoryStatsBar({ items, warehouses }) {
  const totalSKUs    = items.length;
  const totalUnits   = items.reduce((s, i) => s + i.quantity, 0);
  const outOfStock   = items.filter(i => i.quantity === 0).length;
  const lowStock     = items.filter(i => i.quantity > 0 && i.quantity <= i.threshold).length;
  const healthyStock = totalSKUs - outOfStock - lowStock;

  const stats = [
    {
      label: 'Total SKUs',
      value: totalSKUs.toLocaleString(),
      sub: `across ${warehouses.length} warehouses`,
      color: 'violet',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
        </svg>
      ),
    },
    {
      label: 'Total Units',
      value: totalUnits.toLocaleString(),
      sub: 'in all warehouses',
      color: 'sky',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
    {
      label: 'Low Stock',
      value: lowStock,
      sub: 'need restocking',
      color: 'amber',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    {
      label: 'Out of Stock',
      value: outOfStock,
      sub: 'require urgent action',
      color: 'red',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
  ];

  const colorMap = {
    violet: { card: 'border-violet-500/20 bg-violet-500/5',  icon: 'bg-violet-500/10 text-violet-400 border-violet-500/20', val: 'text-violet-300' },
    sky:    { card: 'border-sky-500/20    bg-sky-500/5',     icon: 'bg-sky-500/10    text-sky-400    border-sky-500/20',    val: 'text-sky-300'    },
    amber:  { card: 'border-amber-500/20  bg-amber-500/5',   icon: 'bg-amber-500/10  text-amber-400  border-amber-500/20',  val: 'text-amber-300'  },
    red:    { card: 'border-red-500/20    bg-red-500/5',     icon: 'bg-red-500/10    text-red-400    border-red-500/20',    val: 'text-red-300'    },
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const c = colorMap[s.color];
        return (
          <div key={s.label} className={`rounded-2xl border ${c.card} p-5 flex items-start gap-4`}>
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${c.icon}`}>
              {s.icon}
            </div>
            <div>
              <div className={`text-2xl font-bold ${c.val}`}>{s.value}</div>
              <div className="text-xs font-semibold text-white/80 mt-0.5">{s.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
