'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { inventoryService }      from '@/services/inventoryService';
import InventoryStatsBar         from '@/components/admin/inventory/InventoryStatsBar';
import InventoryFilters          from '@/components/admin/inventory/InventoryFilters';
import InventoryTable            from '@/components/admin/inventory/InventoryTable';
import AdjustStockModal          from '@/components/admin/inventory/AdjustStockModal';
import TransferStockModal        from '@/components/admin/inventory/TransferStockModal';
import HistoryDrawer             from '@/components/admin/inventory/HistoryDrawer';
import WarehousePanel            from '@/components/admin/inventory/WarehousePanel';
import { DUMMY_INVENTORY, DUMMY_WAREHOUSES, DUMMY_HISTORY } from '@/components/admin/inventory/_dummyData';

const PAGE_SIZE = 15;
const DEFAULT_FILTERS = { search: '', warehouseId: '', stockStatus: '', sort: 'updatedAt:desc' };

export default function InventoryPage() {
  const [allItems,    setAllItems]    = useState([]);
  const [warehouses,  setWarehouses]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [usingDummy,  setUsingDummy]  = useState(false);

  const [filters,   setFilters]   = useState(DEFAULT_FILTERS);
  const [page,      setPage]      = useState(1);
  const [selected,  setSelected]  = useState([]);
  const [toastMsg,  setToastMsg]  = useState('');

  const [adjustItem,   setAdjustItem]   = useState(null);
  const [transferItem, setTransferItem] = useState(null);
  const [historyItem,  setHistoryItem]  = useState(null);
  const [historyLog,   setHistoryLog]   = useState([]);

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2800); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, whRes] = await Promise.all([
        inventoryService.getAll({ limit: 500 }),
        inventoryService.getWarehouses(),
      ]);
      setAllItems(invRes.data?.items || invRes.data?.data || []);
      setWarehouses(whRes.data?.warehouses || whRes.data?.data || []);
      setUsingDummy(false);
    } catch {
      setAllItems(DUMMY_INVENTORY);
      setWarehouses(DUMMY_WAREHOUSES);
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let items = [...allItems];
    const s = filters.search.toLowerCase();
    if (s) items = items.filter(i =>
      i.productName.toLowerCase().includes(s) ||
      i.variantSku.toLowerCase().includes(s)  ||
      (i.sku || '').toLowerCase().includes(s)
    );
    if (filters.warehouseId) items = items.filter(i => i.warehouseId === filters.warehouseId);
    if (filters.stockStatus === 'out')     items = items.filter(i => i.quantity === 0);
    if (filters.stockStatus === 'low')     items = items.filter(i => i.quantity > 0 && i.quantity <= i.threshold);
    if (filters.stockStatus === 'healthy') items = items.filter(i => i.quantity > i.threshold);

    const [field, dir] = filters.sort.split(':');
    items.sort((a, b) => {
      const va = a[field] ?? '', vb = b[field] ?? '';
      if (typeof va === 'number') return dir === 'asc' ? va - vb : vb - va;
      return dir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return items;
  }, [allItems, filters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (f) => { setFilters(f); setPage(1); setSelected([]); };

  const handleAdjustSave = async (id, data) => {
    try { await inventoryService.adjust(id, data); } catch {}
    setAllItems(prev => prev.map(i =>
      i._id === id
        ? { ...i, quantity: Math.max(0, i.quantity + data.delta), updatedAt: new Date().toISOString() }
        : i
    ));
    setAdjustItem(null);
    showToast('Stock adjusted successfully.');
  };

  const handleTransferSave = async ({ fromInventoryId, toWarehouseId, quantity, reason }) => {
    try { await inventoryService.transfer({ fromInventoryId, toWarehouseId, quantity, reason }); } catch {}
    const source = allItems.find(i => i._id === fromInventoryId);
    if (!source) return;
    const destItem = allItems.find(i => i.warehouseId === toWarehouseId && i.variantSku === source.variantSku);
    const destWarehouse = warehouses.find(w => w._id === toWarehouseId);
    setAllItems(prev => {
      let updated = prev.map(i =>
        i._id === fromInventoryId
          ? { ...i, quantity: Math.max(0, i.quantity - quantity), updatedAt: new Date().toISOString() }
          : i
      );
      if (destItem) {
        updated = updated.map(i =>
          i._id === destItem._id
            ? { ...i, quantity: i.quantity + quantity, updatedAt: new Date().toISOString() }
            : i
        );
      } else {
        updated = [...updated, {
          ...source,
          _id: `inv_new_${Date.now()}`,
          warehouseId: toWarehouseId,
          warehouseName: destWarehouse?.name || 'Unknown',
          quantity,
          reserved: 0,
          updatedAt: new Date().toISOString(),
        }];
      }
      return updated;
    });
    setTransferItem(null);
    showToast(`${quantity} units transferred to ${destWarehouse?.name}.`);
  };

  const handleViewHistory = async (item) => {
    setHistoryItem(item);
    try {
      const res = await inventoryService.getHistory(item._id);
      setHistoryLog(res.data?.history || res.data?.data || []);
    } catch {
      setHistoryLog(DUMMY_HISTORY[item._id] || DUMMY_HISTORY.default);
    }
  };

  const handleBulkExport = () => {
    const rows = [
      ['SKU', 'Product', 'Warehouse', 'Quantity', 'Reserved', 'Available', 'Threshold'],
      ...filtered.map(i => [i.variantSku, i.productName, i.warehouseName, i.quantity, i.reserved, i.quantity - i.reserved, i.threshold]),
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'inventory.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Inventory exported as CSV.');
  };

  const alertItems = allItems.filter(i => i.quantity <= i.threshold);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inventory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Multi-warehouse stock tracking &amp; management
            {usingDummy && (
              <span className="ml-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Demo data
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleBulkExport}
          className="h-9 px-4 rounded-xl border border-[#1e1e2e] text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Alert banner */}
      {alertItems.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">
              {alertItems.filter(i => i.quantity === 0).length} out of stock &middot; {alertItems.filter(i => i.quantity > 0).length} low stock
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              {alertItems.slice(0, 3).map(i => i.productName).join(', ')}{alertItems.length > 3 ? ` and ${alertItems.length - 3} more…` : ''}
            </p>
          </div>
          <button
            onClick={() => handleFilterChange({ ...DEFAULT_FILTERS, stockStatus: 'out' })}
            className="text-xs text-amber-400 hover:text-amber-300 underline flex-shrink-0 transition-colors"
          >
            View all
          </button>
        </div>
      )}

      {/* Stats */}
      <InventoryStatsBar items={allItems} warehouses={warehouses} />

      {/* Main content */}
      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <InventoryFilters filters={filters} onChange={handleFilterChange} warehouses={warehouses} />

          {selected.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-violet-500/20 bg-violet-500/5">
              <span className="text-sm text-violet-300 font-medium">
                {selected.length} item{selected.length > 1 ? 's' : ''} selected
              </span>
              <button onClick={() => setSelected([])} className="text-xs text-slate-500 hover:text-white transition-colors">
                Clear
              </button>
            </div>
          )}

          <InventoryTable
            items={pageItems}
            loading={loading}
            selected={selected}
            onSelectChange={setSelected}
            onAdjust={setAdjustItem}
            onViewHistory={handleViewHistory}
            onTransfer={setTransferItem}
            pagination={{ page, pages: totalPages, total: filtered.length }}
            onPageChange={(p) => { setPage(p); setSelected([]); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </div>

        {/* Warehouse sidebar */}
        <div className="w-64 flex-shrink-0">
          <WarehousePanel warehouses={warehouses} allItems={allItems} />
        </div>
      </div>

      {/* Modals */}
      {adjustItem   && <AdjustStockModal   item={adjustItem}   onClose={() => setAdjustItem(null)}   onSave={handleAdjustSave}   />}
      {transferItem && <TransferStockModal item={transferItem} onClose={() => setTransferItem(null)} onSave={handleTransferSave} warehouses={warehouses} />}
      {historyItem  && <HistoryDrawer      item={historyItem}  onClose={() => setHistoryItem(null)}  history={historyLog}        />}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl border border-emerald-500/30 bg-[#0d0d14] shadow-2xl text-sm text-emerald-300 font-medium">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
