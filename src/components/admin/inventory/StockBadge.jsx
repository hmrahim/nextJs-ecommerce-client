
'use client';

export function getStockStatus(item) {
  if (item.quantity === 0) return 'out';
  if (item.quantity <= item.threshold) return 'low';
  return 'healthy';
}

const STATUS_MAP = {
  healthy: { label: 'In Stock',     cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  low:     { label: 'Low Stock',    cls: 'bg-amber-500/10  text-amber-400  border-amber-500/20',     dot: 'bg-amber-400'  },
  out:     { label: 'Out of Stock', cls: 'bg-red-500/10    text-red-400    border-red-500/20',       dot: 'bg-red-400'    },
};

export function StockBadge({ item }) {
  const status = getStockStatus(item);
  const cfg    = STATUS_MAP[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function AdjTypeBadge({ type }) {
  const map = {
    restock:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    sale:       'bg-sky-500/10     text-sky-400     border-sky-500/20',
    adjustment: 'bg-amber-500/10  text-amber-400  border-amber-500/20',
    transfer:   'bg-violet-500/10 text-violet-400 border-violet-500/20',
    return:     'bg-orange-500/10 text-orange-400 border-orange-500/20',
    damage:     'bg-red-500/10    text-red-400    border-red-500/20',
  };
  const cls = map[type] || map.adjustment;
  const labels = { restock: 'Restock', sale: 'Sale', adjustment: 'Adjustment', transfer: 'Transfer', return: 'Return', damage: 'Damage' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cls}`}>
      {labels[type] || type}
    </span>
  );
}
