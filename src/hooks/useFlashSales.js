// 📁 PATH: src/hooks/useFlashSales.js
// ⚠️  This is a completely new file — src/hooks/ Keep in folder

import { useState, useCallback } from 'react';
import { flashSaleService } from '@/services/flashSaleService';

export function useFlashSales() {
  const [sales, setSales]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const fetchSales = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await flashSaleService.adminGetAll(params);
      const d   = res.data;
      setSales(d.flashSales ?? d.data ?? []);
      setPagination({ page: d.page ?? 1, total: d.total ?? 0, pages: d.pages ?? 1 });
      return { ok: true };
    } catch {
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const createSale  = useCallback(async (data) => {
    const res = await flashSaleService.adminCreate(data);
    return res.data;
  }, []);

  const updateSale  = useCallback(async (id, data) => {
    const res = await flashSaleService.adminUpdate(id, data);
    return res.data;
  }, []);

  const deleteSale  = useCallback(async (id) => {
    await flashSaleService.adminDelete(id);
  }, []);

  const toggleSale  = useCallback(async (id) => {
    const res = await flashSaleService.adminToggle(id);
    return res.data;
  }, []);

  const bulkDelete  = useCallback(async (ids) => {
    await flashSaleService.adminBulkDelete(ids);
  }, []);

  const duplicateSale = useCallback(async (id) => {
    const res = await flashSaleService.adminDuplicate(id);
    return res.data;
  }, []);

  return {
    sales, loading, pagination,
    fetchSales, createSale, updateSale, deleteSale, toggleSale, bulkDelete, duplicateSale,
  };
}
