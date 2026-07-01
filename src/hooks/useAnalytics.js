// 📁 PATH: src/hooks/useAnalytics.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '@/services/analyticsService';

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAnalytics(range = '30d') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        overview,
        revenue,
        customerGrowth,
        funnel,
        ordersByStatus,
        topProducts,
        topCategories,
        couponStats,
      ] = await Promise.all([
        analyticsService.getOverview({ range }),
        analyticsService.getRevenue({ range }),
        analyticsService.getCustomerGrowth({ range }),
        analyticsService.getConversionFunnel({ range }),
        analyticsService.getOrdersByStatus({ range }),
        analyticsService.getTopProducts({ range }),
        analyticsService.getTopCategories({ range }),
        analyticsService.getCouponStats({ range }),
      ]);

      setData({
        overview:       overview?.data?.data ?? null,
        revenue:        revenue?.data?.data ?? [],
        customerGrowth: customerGrowth?.data?.data ?? [],
        funnel:         funnel?.data?.data ?? [],
        ordersByStatus: ordersByStatus?.data?.data ?? [],
        topProducts:    topProducts?.data?.data ?? [],
        topCategories:  topCategories?.data?.data ?? [],
        couponStats:    couponStats?.data?.data ?? [],
      });
    } catch (err) {
      console.error('useAnalytics load error:', err);
      setError(err);
      // রিয়েল ডেটা না পেলে empty state দেখাও — fake/mock ডেটা আর দেখানো হবে না
      setData({
        overview: null,
        revenue: [],
        customerGrowth: [],
        funnel: [],
        ordersByStatus: [],
        topProducts: [],
        topCategories: [],
        couponStats: [],
      });
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}