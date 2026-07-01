

'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { customerService }         from '@/services/customerService';
import CustomerStatsBar            from '@/components/admin/customers/CustomerStatsBar';
import CustomerSegmentTabs, { SEGMENTS } from '@/components/admin/customers/CustomerSegmentTabs';
import CustomerFilters             from '@/components/admin/customers/CustomerFilters';
import CustomerTable               from '@/components/admin/customers/CustomerTable';
import CustomerDetailDrawer        from '@/components/admin/customers/CustomerDetailDrawer';
import { DUMMY_CUSTOMERS }         from '@/components/admin/customers/_dummyData';
import { ADMIN_ITEMS_PER_PAGE }    from '@/lib/constants';
import { getSocket }               from '@/lib/socket';
import { toast as hotToast }       from 'react-hot-toast';

const PAGE_SIZE = ADMIN_ITEMS_PER_PAGE || 15;

const DEFAULT_FILTERS = { search: '', status: '', tag: '', dateFrom: '', dateTo: '', sort: 'createdAt:desc' };

export default function CustomersPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [allCustomers, setAllCustomers] = useState([]);   // full set (dummy or fetched)
  const [loading, setLoading]           = useState(true);
  const [usingDummy, setUsingDummy]     = useState(false);
  const [counts, setCounts]             = useState({});
  const [stats, setStats]               = useState(null);
  const [apiPagination, setApiPagination] = useState({ page: 1, total: 0, pages: 1 });

  const [filters, setFilters]   = useState(DEFAULT_FILTERS);
  const [segment, setSegment]   = useState('all');
  const [page, setPage]         = useState(1);

  const [selected, setSelected] = useState([]);
  const [bulkOp, setBulkOp]     = useState('');

  const [drawer, setDrawer]     = useState(null);   // customer object for detail drawer

  // ── Toast helper ──────────────────────────────────────────────────────────
  const toast = (msg, isError = false) => {
    if (isError) {
      hotToast.error(msg, {
        style: { background: '#13131c', color: '#fff', border: '1px solid rgba(239, 68, 68, 0.2)' },
        iconTheme: { primary: '#ef4444', secondary: '#fff' }
      });
    } else {
      hotToast.success(msg, {
        style: { background: '#13131c', color: '#fff', border: '1px solid rgba(16, 185, 129, 0.2)' },
        iconTheme: { primary: '#10b981', secondary: '#fff' }
      });
    }
  };

  // ── Fetch (backend) ────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [field, dir] = filters.sort.split(':');
      const res = await customerService.adminGetAll({
        page, limit: PAGE_SIZE,
        search: filters.search || undefined,
        status: filters.status || undefined,
        tag:    filters.tag    || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo:   filters.dateTo   || undefined,
        sortField: field, sortDir: dir,
        segment: segment !== 'all' ? segment : undefined,
      });
      setAllCustomers(res.data?.customers || res.data?.data || []);
      setCounts(res.data?.counts || {});
      setStats(res.data?.stats || null);
      setApiPagination(res.data?.pagination || { page: 1, total: 0, pages: 1 });
      setUsingDummy(false);
    } catch {
      setAllCustomers(DUMMY_CUSTOMERS);
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, [page, filters, segment]);

  useEffect(() => { load(); }, [load]);

  // Real-time socket sync
  useEffect(() => {
    let socket;
    let active = true;

    (async () => {
      socket = await getSocket();
      if (!active) return;

      const handleRealtimeChange = (evt) => {
        console.log('[CustomersPage] Socket event received:', evt);
        load();
      };

      socket.on('User:change', handleRealtimeChange);

      return () => {
        if (socket) {
          socket.off('User:change', handleRealtimeChange);
        }
      };
    })();

    return () => {
      active = false;
    };
  }, [load]);

  // ── Client-side filter + sort (dummy mode) ────────────────────────────────
  const processed = useMemo(() => {
    if (!usingDummy) return allCustomers;

    const segFn = SEGMENTS.find(s => s.key === segment)?.filter ?? (() => true);
    const srch   = filters.search.toLowerCase();

    let out = allCustomers.filter(c => {
      if (!segFn(c)) return false;
      if (srch) {
        const hay = `${c.firstName} ${c.lastName} ${c.email} ${c.phone || ''}`.toLowerCase();
        if (!hay.includes(srch)) return false;
      }
      if (filters.status === 'active'     && !(c.isActive && !c.isBanned && c.emailVerified))  return false;
      if (filters.status === 'inactive'   && !(!c.isActive && !c.isBanned))   return false;
      if (filters.status === 'banned'     && !c.isBanned)  return false;
      if (filters.status === 'unverified' && c.emailVerified) return false;
      if (filters.tag && !c.tags?.includes(filters.tag)) return false;
      if (filters.dateFrom && new Date(c.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo   && new Date(c.createdAt) > new Date(filters.dateTo))   return false;
      return true;
    });

    const [field, dir] = filters.sort.split(':');
    out.sort((a, b) => {
      const va = field === 'totalSpent'    ? a.totalSpent :
                 field === 'totalOrders'   ? a.totalOrders :
                 field === 'ltv'           ? a.ltv :
                 field === 'lastOrderAt'   ? new Date(a.lastOrderAt || 0) :
                 new Date(a.createdAt);
      const vb = field === 'totalSpent'    ? b.totalSpent :
                 field === 'totalOrders'   ? b.totalOrders :
                 field === 'ltv'           ? b.ltv :
                 field === 'lastOrderAt'   ? new Date(b.lastOrderAt || 0) :
                 new Date(b.createdAt);
      return dir === 'asc' ? va - vb : vb - va;
    });
    return out;
  }, [allCustomers, usingDummy, filters, segment]);

  const paginated = useMemo(() => {
    if (!usingDummy) return processed;
    return processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [processed, usingDummy, page]);

  const pagination = useMemo(() => {
    if (usingDummy) {
      return {
        page,
        total:  processed.length,
        pages:  Math.max(1, Math.ceil(processed.length / PAGE_SIZE)),
      };
    }
    return apiPagination;
  }, [usingDummy, processed, apiPagination, page]);

  // ── Segment counts (always from full dummy set or derived) ─────────────────
  const segCounts = useMemo(() => {
    if (usingDummy) {
      return Object.fromEntries(SEGMENTS.map(s => [s.key, DUMMY_CUSTOMERS.filter(s.filter).length]));
    }
    return counts;
  }, [usingDummy, counts]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const statsData = useMemo(() => {
    if (usingDummy) {
      return {
        total:   DUMMY_CUSTOMERS.length,
        active:  DUMMY_CUSTOMERS.filter(c => c.isActive && !c.isBanned && c.emailVerified).length,
        new:     DUMMY_CUSTOMERS.filter(c => new Date(c.createdAt) > new Date(Date.now() - 86400000 * 30)).length,
        vip:     DUMMY_CUSTOMERS.filter(c => c.tags?.includes('VIP')).length,
        banned:  DUMMY_CUSTOMERS.filter(c => c.isBanned).length,
        revenue: DUMMY_CUSTOMERS.reduce((s, c) => s + (c.totalSpent || 0), 0),
      };
    }
    return stats || { total: 0, active: 0, new: 0, vip: 0, banned: 0, revenue: 0 };
  }, [usingDummy, stats]);

  // ── Mutate helper (optimistic update) ─────────────────────────────────────
  const mutate = (id, fn) => {
    setAllCustomers(prev => prev.map(c => c._id === id ? fn(c) : c));
    if (drawer?._id === id) setDrawer(prev => fn(prev));
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onToggleBan = async (id, reason) => {
    const customer = allCustomers.find(c => c._id === id);
    const willBan = !customer?.isBanned;
    mutate(id, c => ({ ...c, isBanned: willBan, banReason: willBan ? reason : '' }));
    toast(`Customer ${willBan ? 'banned' : 'unbanned'}`);
    if (!usingDummy) {
      try {
        await customerService.adminToggleBan(id, reason);
      } catch (err) {
        toast('Failed to update ban status', true);
        mutate(id, c => ({ ...c, isBanned: !willBan, banReason: !willBan ? reason : '' }));
      }
    }
  };
  const onToggleVerify = async (id) => {
    const customer = allCustomers.find(c => c._id === id);
    const willVerify = !customer?.emailVerified;
    mutate(id, c => ({ ...c, emailVerified: willVerify }));
    toast('Email verification status updated');
    if (!usingDummy) {
      try {
        await customerService.adminToggleVerify(id);
      } catch (err) {
        toast('Failed to update verification status', true);
        mutate(id, c => ({ ...c, emailVerified: !willVerify }));
      }
    }
  };
  const onDelete = async (id) => {
    const original = allCustomers.find(c => c._id === id);
    setAllCustomers(prev => prev.filter(c => c._id !== id));
    setSelected(prev => prev.filter(x => x !== id));
    if (drawer?._id === id) setDrawer(null);
    toast('Customer deleted');
    if (!usingDummy) {
      try {
        await customerService.adminDelete(id);
      } catch (err) {
        toast('Failed to delete customer', true);
        if (original) setAllCustomers(prev => [...prev, original]);
      }
    }
  };

  // Bulk
  const applyBulk = async () => {
    if (!bulkOp || !selected.length) return;
    if (bulkOp === 'delete') {
      setAllCustomers(prev => prev.filter(c => !selected.includes(c._id)));
      toast(`${selected.length} customers deleted`);
      if (!usingDummy) await customerService.adminBulkDelete(selected).catch(console.error);
    } else if (bulkOp === 'ban') {
      selected.forEach(id => mutate(id, c => ({ ...c, isBanned: true })));
      toast(`${selected.length} customers banned`);
    } else if (bulkOp === 'unban') {
      selected.forEach(id => mutate(id, c => ({ ...c, isBanned: false })));
      toast(`${selected.length} customers unbanned`);
    } else if (bulkOp === 'verify') {
      selected.forEach(id => mutate(id, c => ({ ...c, emailVerified: true })));
      toast(`${selected.length} customers verified`);
    }
    setSelected([]); setBulkOp('');
  };

  // Export CSV
  const exportCSV = async () => {
    if (usingDummy) {
      const hdr = ['ID','First Name','Last Name','Email','Phone','Orders','Total Spent','LTV','Status','Tags','Joined'];
      const rows = (processed.length ? processed : DUMMY_CUSTOMERS).map(c => [
        c._id, c.firstName, c.lastName, c.email, c.phone || '',
        c.totalOrders, c.totalSpent, c.ltv || 0,
        c.isBanned ? 'Banned' : !c.isActive ? 'Inactive' : !c.emailVerified ? 'Unverified' : 'Active',
        (c.tags || []).join(';'),
        new Date(c.createdAt).toLocaleDateString(),
      ]);
      const csv = [hdr, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = `customers_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      toast('CSV exported');
      return;
    }
    try {
      const res = await customerService.adminExport({ format: 'csv' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click();
      toast('CSV exported');
    } catch { toast('Export failed', true); }
  };

  const handleFilterChange = (f) => { setFilters(f); setPage(1); setSelected([]); };
  const handleSegment      = (k) => { setSegment(k); setPage(1); setSelected([]); };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customers</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage, analyze and engage your entire customer base.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1e1e2e] text-slate-300 hover:bg-white/5 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Demo Banner ── */}
      {usingDummy && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Demo data — backend API not connected. All actions work locally but won't persist on reload.</span>
        </div>
      )}

      {/* ── Stats ── */}
      <CustomerStatsBar stats={statsData} />

      {/* ── Segments ── */}
      <CustomerSegmentTabs segment={segment} counts={segCounts} onChange={handleSegment} />

      {/* ── Filters + Bulk ── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1">
          <CustomerFilters filters={filters} onChange={handleFilterChange} totalCount={usingDummy ? processed.length : pagination.total} />
        </div>

        {/* Bulk action bar */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-violet-500/25 bg-violet-500/8 flex-shrink-0">
            <span className="text-violet-300 text-sm font-semibold tabular-nums">{selected.length} selected</span>
            <select value={bulkOp} onChange={e => setBulkOp(e.target.value)}
              className="px-2 py-1 rounded-lg bg-[#16161f] border border-[#1e1e2e] text-slate-300 text-xs focus:outline-none">
              <option value="">Bulk action…</option>
              <option value="ban">Ban</option>
              <option value="unban">Unban</option>
              <option value="verify">Mark verified</option>
              <option value="delete">Delete</option>
            </select>
            <button onClick={applyBulk} disabled={!bulkOp}
              className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors">
              Apply
            </button>
            <button onClick={() => setSelected([])} className="text-slate-600 hover:text-slate-300 text-xs transition-colors px-1">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <CustomerTable
        customers={paginated}
        loading={loading}
        selected={selected}
        onSelectChange={setSelected}
        onView={setDrawer}
        onToggleBan={onToggleBan}
        onToggleVerify={onToggleVerify}
        onDelete={onDelete}
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* ── Detail Drawer ── */}
      {drawer && (
        <CustomerDetailDrawer
          customer={drawer}
          onClose={() => setDrawer(null)}
          onToggleBan={onToggleBan}
          onToggleVerify={onToggleVerify}
          onDelete={onDelete}
          onAddNote={async (id, text) => {
            if (usingDummy) return;
            try {
              await customerService.adminAddNote(id, text);
              toast('Note added successfully');
            } catch (err) {
              toast('Failed to add note', true);
            }
          }}
          onDeleteNote={async (id, noteId) => {
            if (usingDummy) return;
            try {
              await customerService.adminDeleteNote(id, noteId);
              toast('Note deleted successfully');
            } catch (err) {
              toast('Failed to delete note', true);
            }
          }}
          onSendEmail={async (id, data) => {
            if (usingDummy) return Promise.resolve();
            try {
              await customerService.adminSendEmail(id, data);
              toast('Email sent successfully');
            } catch (err) {
              toast('Failed to send email', true);
              throw err;
            }
          }}
        />
      )}
    </div>
  );
}
