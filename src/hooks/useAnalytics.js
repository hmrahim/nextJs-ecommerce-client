'use client';
import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '@/services/analyticsService';

// ── Mock data generators ──────────────────────────────────────────────────
function generateRevenueSeries(range) {
  const now = new Date();
  const points = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 12 : 12;
  const isWeekly = range === '90d';
  const isMonthly = range === '1y';

  return Array.from({ length: points }, (_, i) => {
    const d = new Date(now);
    if (isMonthly) d.setMonth(now.getMonth() - (points - 1 - i));
    else if (isWeekly) d.setDate(now.getDate() - (points - 1 - i) * 7);
    else d.setDate(now.getDate() - (points - 1 - i));

    const label = isMonthly
      ? d.toLocaleDateString('en', { month: 'short' })
      : isWeekly
      ? `W${Math.ceil(d.getDate() / 7)}`
      : d.toLocaleDateString('en', { month: 'short', day: 'numeric' });

    const base = 4000 + Math.random() * 8000;
    return {
      label,
      revenue: Math.round(base),
      orders: Math.round(base / 120),
      visitors: Math.round(base / 15),
    };
  });
}

function mockOverview(range) {
  return {
    totalRevenue: 284750,
    revenueChange: 12.4,
    totalOrders: 3847,
    ordersChange: 8.7,
    totalCustomers: 12483,
    customersChange: 5.2,
    conversionRate: 3.6,
    conversionChange: 0.4,
    avgOrderValue: 74.02,
    aovChange: 3.4,
    activeProducts: 1247,
    lowStockCount: 38,
    returnRate: 4.2,
    returnChange: -0.8,
    refundRate: 1.9,
    refundChange: -0.3,
  };
}

function mockRevenueSeries(range) {
  return generateRevenueSeries(range);
}

function mockTopProducts() {
  const products = [
    { name: 'Wireless Earbuds Pro', sku: 'WEP-001', revenue: 18420, orders: 312, trend: 14.2 },
    { name: 'Smart Watch Series X', sku: 'SWX-004', revenue: 15890, orders: 178, trend: 9.7 },
    { name: 'USB-C Hub 7-in-1',     sku: 'UCH-012', revenue: 12340, orders: 445, trend: 22.1 },
    { name: 'Laptop Stand Pro',      sku: 'LSP-007', revenue: 9870,  orders: 267, trend: -3.4 },
    { name: 'Mechanical Keyboard',   sku: 'MKB-003', revenue: 8760,  orders: 134, trend: 6.8 },
    { name: 'RGB Mouse Pad XL',      sku: 'RMP-009', revenue: 7650,  orders: 510, trend: 18.9 },
    { name: 'Webcam 4K Ultra',       sku: 'WC4-011', revenue: 6540,  orders: 98,  trend: -1.2 },
  ];
  return products;
}

function mockTopCategories() {
  return [
    { name: 'Electronics',    revenue: 89420, share: 31.4, orders: 1204 },
    { name: 'Accessories',    revenue: 72180, share: 25.3, orders: 2187 },
    { name: 'Audio & Video',  revenue: 54760, share: 19.2, orders: 743  },
    { name: 'Smart Home',     revenue: 38920, share: 13.7, orders: 512  },
    { name: 'Peripherals',    revenue: 29470, share: 10.4, orders: 890  },
  ];
}

function mockFunnel() {
  return [
    { stage: 'Visitors',        count: 48200, pct: 100,  color: '#6c63ff' },
    { stage: 'Product Views',   count: 22840, pct: 47.4, color: '#8b83ff' },
    { stage: 'Add to Cart',     count: 8960,  pct: 18.6, color: '#a78bfa' },
    { stage: 'Checkout Start',  count: 4320,  pct: 9.0,  color: '#c4b5fd' },
    { stage: 'Order Placed',    count: 1740,  pct: 3.6,  color: '#ddd6fe' },
  ];
}

function mockCustomerGrowth(range) {
  const series = generateRevenueSeries(range);
  let cumulative = 10000;
  return series.map(p => {
    const newC = Math.round(40 + Math.random() * 120);
    cumulative += newC;
    return { label: p.label, new: newC, total: cumulative };
  });
}

function mockOrdersByStatus() {
  return [
    { status: 'Delivered',  count: 2104, color: '#22c55e' },
    { status: 'Shipped',    count: 743,  color: '#3b82f6' },
    { status: 'Processing', count: 512,  color: '#f59e0b' },
    { status: 'Pending',    count: 287,  color: '#94a3b8' },
    { status: 'Cancelled',  count: 138,  color: '#ef4444' },
    { status: 'Refunded',   count: 63,   color: '#f97316' },
  ];
}

function mockCouponStats() {
  return [
    { code: 'SAVE20',    uses: 1240, discount: 8720,  revenue: 34880,  conv: 18.4 },
    { code: 'FLASH50',   uses: 876,  discount: 21900, revenue: 21900,  conv: 24.7 },
    { code: 'WELCOME10', uses: 634,  discount: 2540,  revenue: 22860,  conv: 12.1 },
    { code: 'SUMMER30',  uses: 412,  discount: 9880,  revenue: 23053,  conv: 9.8  },
    { code: 'VIP15',     uses: 287,  discount: 4305,  revenue: 24378,  conv: 31.2 },
  ];
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAnalytics(range = '30d') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try real API; fall back to mock on any error
      const [overview, revenue, customerGrowth] = await Promise.all([
        analyticsService.getOverview({ range }).catch(() => null),
        analyticsService.getRevenue({ range }).catch(() => null),
        analyticsService.getCustomerGrowth({ range }).catch(() => null),
      ]);

      setData({
        overview: overview?.data ?? mockOverview(range),
        revenue: revenue?.data ?? mockRevenueSeries(range),
        topProducts: mockTopProducts(),
        topCategories: mockTopCategories(),
        funnel: mockFunnel(),
        customerGrowth: customerGrowth?.data ?? mockCustomerGrowth(range),
        ordersByStatus: mockOrdersByStatus(),
        couponStats: mockCouponStats(),
      });
    } catch (err) {
      setError(err);
      // Always render with mock data — never blank screen
      setData({
        overview: mockOverview(range),
        revenue: mockRevenueSeries(range),
        topProducts: mockTopProducts(),
        topCategories: mockTopCategories(),
        funnel: mockFunnel(),
        customerGrowth: mockCustomerGrowth(range),
        ordersByStatus: mockOrdersByStatus(),
        couponStats: mockCouponStats(),
      });
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}
