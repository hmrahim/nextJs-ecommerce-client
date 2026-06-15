
'use client';
import { useState, useEffect, useCallback } from 'react';
import { orderService } from '@/services/orderService';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import OrderFilters from '@/components/admin/orders/OrderFilters';
import OrderDetailModal from '@/components/admin/orders/OrderDetailModal';
import { useOrderSocket } from '@/hooks/useOrderSocket';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 12;

// ── Dummy orders (used while backend not ready) ───────────────────────────────
const DUMMY_ORDERS = [
  { _id: 'ord001', orderNumber: 'ORD-10421', customerName: 'Sarah Johnson', customerEmail: 'sarah@example.com', items: [{ name: 'Premium Wireless Headphones', quantity: 1, price: 129.99 }, { name: 'Leather Wallet', quantity: 2, price: 49.99 }], subtotal: 229.97, taxAmount: 18.40, shippingAmount: 9.99, discountAmount: 0, totalAmount: 258.36, status: 'delivered', paymentStatus: 'paid', paymentMethod: 'credit_card', shippingAddress: { street: '123 Maple Ave', city: 'New York', state: 'NY', zip: '10001', country: 'US' }, placedAt: new Date(Date.now() - 86400000 * 5).toISOString(), statusHistory: [{ status: 'pending', changedAt: new Date(Date.now() - 86400000 * 5).toISOString() }, { status: 'confirmed', changedAt: new Date(Date.now() - 86400000 * 4).toISOString() }, { status: 'shipped', changedAt: new Date(Date.now() - 86400000 * 2).toISOString() }, { status: 'delivered', changedAt: new Date(Date.now() - 86400000).toISOString() }] },
  { _id: 'ord002', orderNumber: 'ORD-10422', customerName: 'Michael Chen', customerEmail: 'mchen@example.com', items: [{ name: 'Yoga Mat Premium', quantity: 1, price: 64.99 }], subtotal: 64.99, taxAmount: 5.20, shippingAmount: 0, discountAmount: 6.50, totalAmount: 63.69, status: 'shipped', paymentStatus: 'paid', paymentMethod: 'paypal', shippingAddress: { street: '456 Oak Street', city: 'San Francisco', state: 'CA', zip: '94105', country: 'US' }, placedAt: new Date(Date.now() - 86400000 * 3).toISOString(), statusHistory: [{ status: 'pending', changedAt: new Date(Date.now() - 86400000 * 3).toISOString() }, { status: 'confirmed', changedAt: new Date(Date.now() - 86400000 * 2.5).toISOString() }, { status: 'shipped', changedAt: new Date(Date.now() - 86400000).toISOString(), note: 'Tracking: FX38271002' }] },
  { _id: 'ord003', orderNumber: 'ORD-10423', customerName: 'Emily Rodriguez', customerEmail: 'emily.r@example.com', items: [{ name: 'Mechanical Keyboard TKL', quantity: 1, price: 149.99 }, { name: 'Stainless Steel Bottle', quantity: 1, price: 24.99 }], subtotal: 174.98, taxAmount: 14.00, shippingAmount: 9.99, discountAmount: 0, totalAmount: 198.97, status: 'processing', paymentStatus: 'paid', paymentMethod: 'credit_card', shippingAddress: { street: '789 Pine Road', city: 'Chicago', state: 'IL', zip: '60601', country: 'US' }, placedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), statusHistory: [{ status: 'pending', changedAt: new Date(Date.now() - 86400000 * 1.5).toISOString() }, { status: 'confirmed', changedAt: new Date(Date.now() - 86400000).toISOString() }, { status: 'processing', changedAt: new Date(Date.now() - 3600000 * 6).toISOString() }] },
  { _id: 'ord004', orderNumber: 'ORD-10424', customerName: 'David Kim', customerEmail: 'dkim@example.com', items: [{ name: 'Merino Wool Blanket', quantity: 2, price: 89.99 }], subtotal: 179.98, taxAmount: 14.40, shippingAmount: 9.99, discountAmount: 18.00, totalAmount: 186.37, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'apple_pay', shippingAddress: { street: '321 Elm Court', city: 'Seattle', state: 'WA', zip: '98101', country: 'US' }, placedAt: new Date(Date.now() - 3600000 * 10).toISOString(), statusHistory: [{ status: 'pending', changedAt: new Date(Date.now() - 3600000 * 10).toISOString() }, { status: 'confirmed', changedAt: new Date(Date.now() - 3600000 * 8).toISOString() }] },
  { _id: 'ord005', orderNumber: 'ORD-10425', customerName: 'Jessica Williams', customerEmail: 'jwilliams@example.com', items: [{ name: 'Cold Brew Coffee Maker', quantity: 1, price: 44.99 }, { name: 'Organic Green Tea Set', quantity: 1, price: 34.99 }], subtotal: 79.98, taxAmount: 6.40, shippingAmount: 0, discountAmount: 0, totalAmount: 86.38, status: 'pending', paymentStatus: 'pending', paymentMethod: 'bank_transfer', shippingAddress: { street: '654 Birch Lane', city: 'Austin', state: 'TX', zip: '78701', country: 'US' }, placedAt: new Date(Date.now() - 3600000 * 2).toISOString(), statusHistory: [{ status: 'pending', changedAt: new Date(Date.now() - 3600000 * 2).toISOString() }] },
  { _id: 'ord006', orderNumber: 'ORD-10426', customerName: 'Robert Nguyen', customerEmail: 'rnguyen@example.com', items: [{ name: 'Artisan Soy Candle Set', quantity: 3, price: 54.99 }], subtotal: 164.97, taxAmount: 13.20, shippingAmount: 9.99, discountAmount: 0, totalAmount: 188.16, status: 'cancelled', paymentStatus: 'failed', paymentMethod: 'credit_card', shippingAddress: { street: '987 Cedar Blvd', city: 'Miami', state: 'FL', zip: '33101', country: 'US' }, placedAt: new Date(Date.now() - 86400000 * 7).toISOString(), statusHistory: [{ status: 'pending', changedAt: new Date(Date.now() - 86400000 * 7).toISOString() }, { status: 'cancelled', changedAt: new Date(Date.now() - 86400000 * 6).toISOString(), note: 'Payment declined' }] },
  { _id: 'ord007', orderNumber: 'ORD-10427', customerName: 'Amanda Foster', customerEmail: 'afoster@example.com', items: [{ name: 'Bamboo Cutting Board Set', quantity: 1, price: 27.99 }, { name: 'Ceramic Coffee Dripper', quantity: 2, price: 39.99 }], subtotal: 107.97, taxAmount: 8.64, shippingAmount: 0, discountAmount: 10.80, totalAmount: 105.81, status: 'refunded', paymentStatus: 'paid', paymentMethod: 'credit_card', shippingAddress: { street: '246 Walnut Way', city: 'Denver', state: 'CO', zip: '80201', country: 'US' }, placedAt: new Date(Date.now() - 86400000 * 10).toISOString(), statusHistory: [{ status: 'pending', changedAt: new Date(Date.now() - 86400000 * 10).toISOString() }, { status: 'confirmed', changedAt: new Date(Date.now() - 86400000 * 9).toISOString() }, { status: 'delivered', changedAt: new Date(Date.now() - 86400000 * 7).toISOString() }, { status: 'refunded', changedAt: new Date(Date.now() - 86400000 * 5).toISOString(), note: 'Item damaged on arrival' }] },
  { _id: 'ord008', orderNumber: 'ORD-10428', customerName: 'Thomas Wright', customerEmail: 'twright@example.com', items: [{ name: 'Linen Tote Bag', quantity: 5, price: 19.99 }], subtotal: 99.95, taxAmount: 8.00, shippingAmount: 9.99, discountAmount: 0, totalAmount: 117.94, status: 'processing', paymentStatus: 'paid', paymentMethod: 'paypal', shippingAddress: { street: '135 Spruce St', city: 'Boston', state: 'MA', zip: '02101', country: 'US' }, placedAt: new Date(Date.now() - 86400000 * 2).toISOString(), statusHistory: [{ status: 'pending', changedAt: new Date(Date.now() - 86400000 * 2).toISOString() }, { status: 'confirmed', changedAt: new Date(Date.now() - 86400000 * 1.5).toISOString() }, { status: 'processing', changedAt: new Date(Date.now() - 3600000 * 4).toISOString() }] },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);

  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ search: '', status: '', paymentStatus: '', sort: 'placedAt:desc' });
  const [selected, setSelected] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: ITEMS_PER_PAGE,
        search: filters.search || undefined,
        status: filters.status || undefined,
        paymentStatus: filters.paymentStatus || undefined,
        sort: filters.sort,
      };
      const res = await orderService.adminGetAll(params);
      const data = res.data;
      setOrders(data.orders || data.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.pagination?.total || 0,
        pages: data.pages || data.pagination?.pages || 1,
      }));
      setUsingDummy(false);
    } catch {
      // Fall back to dummy data
      const s = filters.search?.toLowerCase() || '';
      const filtered = DUMMY_ORDERS.filter(o => {
        if (s && !o.orderNumber.toLowerCase().includes(s) && !o.customerName.toLowerCase().includes(s) && !o.customerEmail.toLowerCase().includes(s)) return false;
        if (filters.status && o.status !== filters.status) return false;
        if (filters.paymentStatus && o.paymentStatus !== filters.paymentStatus) return false;
        return true;
      });
      // Sort
      const [field, dir] = (filters.sort || 'placedAt:desc').split(':');
      filtered.sort((a, b) => {
        const va = field === 'totalAmount' ? a.totalAmount : new Date(a.placedAt);
        const vb = field === 'totalAmount' ? b.totalAmount : new Date(b.placedAt);
        return dir === 'asc' ? va - vb : vb - va;
      });
      setOrders(filtered);
      setPagination({ page: 1, total: filtered.length, pages: 1 });
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Realtime: নতুন order এলে বা status update হলে instantly table refresh হবে ──
  const handleOrderEvent = useCallback((type, payload) => {
    if (usingDummy) return; // ডামি ডেটায় থাকলে SSE ইগনোর করবে
    if (type === 'order_created') {
      toast.success(`New order received${payload?.orderNumber ? ` — ${payload.orderNumber}` : ''}`);
    }
    fetchOrders();
  }, [fetchOrders, usingDummy]);

  useOrderSocket(handleOrderEvent);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelected([]);
  };

  const handleUpdateStatus = async (id, status, note) => {
    if (usingDummy) {
      setOrders(prev => prev.map(o => {
        if (o._id !== id) return o;
        const newHistory = [...(o.statusHistory || []), { status, changedAt: new Date().toISOString(), note }];
        return { ...o, status, statusHistory: newHistory };
      }));
      if (activeOrder?._id === id) {
        setActiveOrder(prev => {
          const newHistory = [...(prev.statusHistory || []), { status, changedAt: new Date().toISOString(), note }];
          return { ...prev, status, statusHistory: newHistory };
        });
      }
      return;
    }
    try {
      await orderService.adminUpdateStatus(id, status, note);
      fetchOrders();
      if (activeOrder?._id === id) {
        const res = await orderService.adminGetById(id);
        setActiveOrder(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const allOrders = usingDummy ? DUMMY_ORDERS : orders;
  const statsCards = [
    {
      label: 'Total Orders',
      value: usingDummy ? DUMMY_ORDERS.length : pagination.total,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/20', text: 'text-violet-400',
    },
    {
      label: 'Pending',
      value: allOrders.filter(o => o.status === 'pending').length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400',
    },
    {
      label: 'In Transit',
      value: allOrders.filter(o => ['confirmed','processing','shipped'].includes(o.status)).length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      color: 'from-sky-500/20 to-sky-500/5', border: 'border-sky-500/20', text: 'text-sky-400',
    },
    {
      label: 'Delivered',
      value: allOrders.filter(o => o.status === 'delivered').length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400',
    },
    {
      label: 'Revenue',
      value: '$' + allOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Orders</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage and track all customer orders.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="text-sm text-slate-400 bg-[#16161f] border border-[#1e1e2e] px-3 py-2 rounded-lg">
              {selected.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Demo notice */}
      {usingDummy && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Showing demo data — backend API not connected yet. Status changes will not persist on reload.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statsCards.map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.color} p-4`}>
            <div className={`${s.text} mb-2`}>{s.icon}</div>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <OrderFilters filters={filters} onChange={handleFilterChange} />

      {/* Table */}
      <OrdersTable
        orders={orders}
        loading={loading}
        selected={selected}
        onSelectChange={setSelected}
        onViewOrder={setActiveOrder}
        onUpdateStatus={handleUpdateStatus}
        pagination={pagination}
        onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
      />

      {/* Detail Modal */}
      {activeOrder && (
        <OrderDetailModal
          order={activeOrder}
          onClose={() => setActiveOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
