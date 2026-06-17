'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Package, Truck, Check, X, Eye, RotateCcw, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { orderService } from '@/services/orderService';

const TABS = ['All', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const TAB_LABELS = { All: 'All', pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };

const STATUS_STYLES = {
  delivered:  'bg-emerald-100 text-emerald-700',
  shipped:    'bg-sky-100 text-sky-700',
  confirmed:  'bg-blue-100 text-blue-700',
  pending:    'bg-amber-100 text-amber-700',
  cancelled:  'bg-rose-100 text-rose-700',
  refunded:   'bg-purple-100 text-purple-700',
};
const STATUS_ICONS = { delivered: Check, shipped: Truck, confirmed: Check, pending: Package, cancelled: X };

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-SA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OrdersPage() {
  const [tab, setTab] = useState('All');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  // Reset page when tab/search changes
  useEffect(() => { setPage(1); }, [tab, debouncedQ]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (tab !== 'All') params.status = tab;
      const res = await orderService.getMyOrders(params);
      let data = res.data?.data || [];
      // Client-side search filter (backend doesn't support search for client orders)
      if (debouncedQ) {
        const lower = debouncedQ.toLowerCase();
        data = data.filter(o =>
          o.orderNumber?.toLowerCase().includes(lower) ||
          o.items?.some(i => i.productName?.toLowerCase().includes(lower))
        );
      }
      setOrders(data);
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: data.length });
    } catch (err) {
      setError(err?.response?.data?.message || 'Orders load could not be done। Try again।');
    } finally {
      setLoading(false);
    }
  }, [tab, page, debouncedQ]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold">My Orders</h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Order ID Or product Search name"
              className="w-full rounded-lg border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-slate-500">Orders loading is happening...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <AlertCircle className="mx-auto w-10 h-10 text-rose-400" />
          <p className="mt-3 font-semibold text-slate-700">{error}</p>
          <button onClick={fetchOrders} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold">
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <Package className="mx-auto w-12 h-12 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">any order Not found</p>
          <p className="text-sm text-slate-500">different filter Or search term Try with।</p>
          <Link href="/" className="mt-4 inline-block px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold">
            Shopping Start
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <div className="space-y-3">
            {orders.map((o) => {
              const Icon = STATUS_ICONS[o.status] || Package;
              const firstItem = o.items?.[0];
              return (
                <div key={o._id} className="bg-white rounded-2xl border border-border p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                    <div>
                      <p className="font-bold text-slate-900">{o.orderNumber}</p>
                      <p className="text-xs text-slate-500">Placed {formatDate(o.createdAt)}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[o.status] || 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-3.5 h-3.5" /> {o.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    {o.items?.slice(0, 2).map((it, idx) => (
                      <div key={idx} className="flex items-center gap-3 flex-1 min-w-[220px]">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {it.productImage ? (
                            <Image src={it.productImage} alt={it.productName} fill className="object-cover" sizes="56px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-slate-300" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm line-clamp-1">{it.productName}</p>
                          <p className="text-xs text-slate-500">Qty {it.quantity} · SAR {it.unitPrice?.toLocaleString()}</p>
                          {it.variantAttrs && (
                            <p className="text-xs text-slate-400">
                              {Object.entries(it.variantAttrs).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {o.items?.length > 2 && (
                      <p className="text-xs text-slate-500">+{o.items.length - 2} more products</p>
                    )}
                    <div className="ml-auto text-right">
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="font-bold text-emerald-700">SAR {o.total?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/account/orders/${o._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </Link>
                    {o.status === 'shipped' && (
                      <Link href={`/account/orders/${o._id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50">
                        <Truck className="w-3.5 h-3.5" /> Track Order
                      </Link>
                    )}
                    {o.status === 'delivered' && (
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50">
                        <RotateCcw className="w-3.5 h-3.5" /> Buy Again
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {pagination.total} The order within it page {pagination.page}/{pagination.pages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-lg border border-border hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-lg border border-border hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}