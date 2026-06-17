// 📁 PATH: hooks/client/useSearch.js
'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { searchProducts, getCategories } from '@/services/searchService';

/** Categories — search bar dropdown */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories-for-search'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
    select: (data) => data?.data ?? [],
  });
};

/**
 * Search products hook
 * ✅ FIX: React Query v5 In keepPreviousData: true deprecated →
 *         placeholderData: keepPreviousData must be used।
 */
export const useSearchProducts = (searchParams, enabled = false) => {
  return useQuery({
    queryKey: ['search-products', searchParams],
    queryFn: () => searchProducts(searchParams),
    enabled: enabled && Boolean(searchParams?.q?.trim()),
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  });
};
