// 📁 PATH: src/app/(admin)/dashboard/returns/page.jsx
// ⚠️  NEW FILE — create this file and folder

'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { returnService }        from '@/services/returnService';
import ReturnsStatsBar          from '@/components/admin/returns/ReturnsStatsBar';
import ReturnsFilters           from '@/components/admin/returns/ReturnsFilters';
import ReturnsTable             from '@/components/admin/returns/ReturnsTable';
import ReturnDetailDrawer       from '@/components/admin/returns/ReturnDetailDrawer';
import { DUMMY_RETURNS, STATUS_CONFIG } from '@/components/admin/returns/_dummyData';

const PAGE_SIZE = 15;
const DEFAULT_FILTERS = { search: '', status: '', type: '', dateFrom: '', dateTo: '', sort: 'createdAt:desc' };

const SEGMENTS = [
  { key: 'all',              label: 'All',             filter: () => true },
  { key: 'pending_review',   label: 'Pending Review',  filter: r => r.status === 'pending_review' },
  { key: 'approved',         label: 'Approved',        filter: r => r.status === 'approved' },
  { key: 'item_received',    label: 'Item Received',   filter: r => r.status === 'item_received' },
  { key: 'refund_processed', label: 'Refunded',        filter: r => r.status === 'refund_processed' },
  { key: 'rejected',         label: 'Rejected',        filter: r => r.status === 'rejected' },
];

export default function ReturnsPage() {
  const [allReturns, setAllReturns] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingDummy, setDummy]      = useState(false);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [segment, setSegment] = useState('all');
  const [page, setPage]       = useState(1);

  const [selected, setSelected] = useState([]);
  const [bulkOp, setBulkOp]     = useState('');
  const [drawer, setDrawer]     = useState(null);
  const [toast, setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [field, dir] = filters.sort.split(':');
      const res = await returnService.adminGetAll({
        page, limit: PAGE_SIZE,
        search: filters.search || undefined,
        status: filters.status || undefined,
        type:   filters.type   || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo:   filters.dateTo   || undefined,
        sortField: field, sortDir: dir,
        segment: segment !== 'all' ? segment : undefined,
      });
      setAllReturns(res.data?.returns || res.data?.data || []);
      setDummy(false);
    } catch {
      setAllReturns(DUMMY_RETURNS);
      setDummy(true);
    } finally {
      setLoading(false);
    }
  }, [page, filters, segment]);

  useEffect(() => { load(); }, [load]);

  // ── Client-side filter (dummy) ─────────────────────────────────────────────
  const processed = useMemo(() => {
    if (!usingDummy) return allReturns;
    const segFn = SEGMENTS.find(s => s.key === segment)?.filter ?? (() => true);
    const srch = filters.search.toLowerCase();

    let out = allReturns.filter(r => {
      if (!segFn(r)) return false;
      if (srch) {
        const hay = `${r.returnNumber} ${r.userId?.firstName} ${r.userId?.lastName} ${r.userId?.email} ${r.orderId?.orderNumber}`.toLowerCase();
        if (!hay.includes(srch)) return false;
      }
      if (filters.status && r.status !== filters.status) return false;
      if (filters.type   && r.type   !== filters.type)   return false;
      if (filters.dateFrom && new Date(r.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo   && new Date(r.createdAt) > new Date(filters.dateTo))   return false;
      return true;
    });

    const [field, dir] = filters.sort.split(':');
    out.sort((a, b) => {
      const va = field === 'refundAmount' ? a.refundAmount : field === 'updatedAt' ? new Date(a.updatedAt) : new Date(a.createdAt);
      const vb = field === 'refundAmount' ? b.refundAmount : field === 'updatedAt' ? new Date(b.updatedAt) : new Date(b.createdAt);
      return dir === 'asc' ? va - vb : vb - va;
    });
    return out;
  }, [allReturns, usingDummy, filters, segment]);

  const paginated = useMemo(() =>
    usingDummy ? processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : processed,
    [processed, usingDummy, page]
  );

  const pagination = useMemo(() => ({
    page,
    total: usingDummy ? processed.length : allReturns.length,
    pages: Math.max(1, Math.ceil((usingDummy ? processed.length : allReturns.length) / PAGE_SIZE)),
  }), [usingDummy, processed, allReturns, page]);

  // ── Segment counts ─────────────────────────────────────────────────────────
  const segCounts = useMemo(() => {
    const src = usingDummy ? DUMMY_RETURNS : allReturns;
    return Object.fromEntries(SEGMENTS.map(s => [s.key, src.filter(s.filter).length]));
  }, [usingDummy, allReturns]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const src = usingDummy ? DUMMY_RETURNS : allReturns;
    return {
      total:             src.length,
      pending_review:    src.filter(r => r.status === 'pending_review').length,
      approved:          src.filter(r => r.status === 'approved').length,
      refund_processed:  src.filter(r => r.status === 'refund_processed').length,
      totalRefunded:     src.filter(r => r.status === 'refund_processed').reduce((s, r) => s + (r.refundAmount || 0), 0),
    };
  }, [usingDummy, allReturns]);

  // ── Mutate ─────────────────────────────────────────────────────────────────
  const mutate = (id, fn) => {
    setAllReturns(prev => prev.map(r => r._id === id ? fn(r) : r));
    if (drawer?._id === id) setDrawer(fn);
  };

  const handleApprove = async (id) => {
    mutate(id, r => ({
      ...r, status: 'approved',
      timeline: [...(r.timeline||[]), { status:'approved', note:'Approved by admin.', createdAt: new Date().toISOString() }],
    }));
    showToast('Return approved ✅');
    if (!usingDummy) await returnService.adminApprove(id, {}).catch(console.error);
  };

  const handleReject = async (id, reason) => {
    mutate(id, r => ({
      ...r, status: 'rejected', rejectionReason: reason,
      timeline: [...(r.timeline||[]), { status:'rejected', note:`Rejected: ${reason}`, createdAt: new Date().toISOString() }],
    }));
    showToast('Return rejected');
    if (!usingDummy) await returnService.adminReject(id, reason).catch(console.error);
  };

  const handleMarkReceived = async (id) => {
    mutate(id, r => ({
      ...r, status: 'item_received',
      timeline: [...(r.timeline||[]), { status:'item_received', note:'Item received and inspected.', createdAt: new Date().toISOString() }],
    }));
    showToast('Item marked as received 📦');
    if (!usingDummy) await returnService.adminMarkReceived(id).catch(console.error);
  };

  const handleProcessRefund = async (id, data) => {
    const txn = `TXN-RF-${Math.floor(Math.random()*9000+1000)}`;
    mutate(id, r => ({
      ...r, status: 'refund_processed', refundTransactionId: txn,
      timeline: [...(r.timeline||[]), {
        status: 'refund_processed',
        note: `Refund of $${r.refundAmount?.toFixed(2)} processed. Ref: ${txn}.`,
        createdAt: new Date().toISOString(),
      }],
    }));
    showToast('Refund processed 💚');
    if (!usingDummy) await returnService.adminProcessRefund(id, data).catch(console.error);
  };

  // Bulk
  const applyBulk = async () => {
    if (!bulkOp || !selected.length) return;
    if (bulkOp === 'approve') {
      selected.forEach(id => handleApprove(id));
      showToast(`${selected.length} returns approved`);
    } else if (bulkOp === 'reject') {
      selected.forEach(id => handleReject(id, 'Bulk rejected by admin.'));
      showToast(`${selected.length} returns rejected`);
    }
    setSelected([]); setBulkOp('');
  };

  // Export
  const exportCSV = () => {
    const hdr = ['Return #','Order #','Customer','Email','Type','Status','Refund Amt','Method','Submitted'];
    const rows = (processed.length ? processed : DUMMY_RETURNS).map(r => [
      r.returnNumber, r.orderId?.orderNumber,
      `${r.userId?.firstName} ${r.userId?.lastName}`, r.userId?.email,
      r.type, r.status, r.refundAmount, r.refundMethod,
      new Date(r.createdAt).toLocaleDateString(),
    ]);
    const csv = [hdr,...rows].map(row => row.map(v=>`"${v ?? ''}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download = `returns_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast('CSV exported');
  };

  const handleFilterChange = (f) => { setFilters(f); setPage(1); setSelected([]); };
  const handleSegment = (k) => { setSegment(k); setPage(1); setSelected([]); };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Returns & Refunds</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage all customer return and refund requests.</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1e1e2e] text-slate-300 hover:bg-white/5 text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </button>
      </div>

      {/* Demo banner */}
      {usingDummy && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Demo data — backend API not connected. All actions work locally.
        </div>
      )}

      {/* Stats */}
      <ReturnsStatsBar stats={stats}/>

      {/* Segment tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {SEGMENTS.map(s => {
          const active = segment === s.key;
          const cfg = STATUS_CONFIG[s.key];
          return (
            <button key={s.key} onClick={() => handleSegment(s.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                active ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/20' : 'border-[#1e1e2e] text-slate-400 hover:text-slate-200 hover:border-slate-600 bg-[#111118]'
              }`}>
              {s.label}
              <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${active ? 'bg-white/20 text-white' : 'bg-[#1e1e2e] text-slate-500'}`}>
                {segCounts[s.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters + Bulk */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1">
          <ReturnsFilters filters={filters} onChange={handleFilterChange} total={usingDummy ? processed.length : pagination.total}/>
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-violet-500/25 bg-violet-500/8 flex-shrink-0">
            <span className="text-violet-300 text-sm font-semibold tabular-nums">{selected.length} selected</span>
            <select value={bulkOp} onChange={e => setBulkOp(e.target.value)}
              className="px-2 py-1 rounded-lg bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-xs focus:outline-none">
              <option value="">Bulk action…</option>
              <option value="approve">Approve all</option>
              <option value="reject">Reject all</option>
            </select>
            <button onClick={applyBulk} disabled={!bulkOp}
              className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors">
              Apply
            </button>
            <button onClick={() => setSelected([])} className="text-slate-600 hover:text-slate-300 text-xs px-1 transition-colors">✕</button>
          </div>
        )}
      </div>

      {/* Table */}
      <ReturnsTable
        returns={paginated}
        loading={loading}
        selected={selected}
        onSelectChange={setSelected}
        onView={setDrawer}
        onApprove={handleApprove}
        onReject={handleReject}
        onProcessRefund={handleProcessRefund}
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* Detail Drawer */}
      {drawer && (
        <ReturnDetailDrawer
          ret={drawer}
          onClose={() => setDrawer(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onMarkReceived={handleMarkReceived}
          onProcessRefund={handleProcessRefund}
          onAddNote={(id, text) => { if (!usingDummy) returnService.adminAddNote(id, text).catch(console.error); }}
          onDeleteNote={(id, nid) => { if (!usingDummy) returnService.adminDeleteNote(id, nid).catch(console.error); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#1e1e2e] border border-[#2a2a3f] text-slate-200 text-sm font-medium shadow-2xl pointer-events-none">
          <span className="text-emerald-400">✓</span>{toast}
        </div>
      )}
    </div>
  );
}
