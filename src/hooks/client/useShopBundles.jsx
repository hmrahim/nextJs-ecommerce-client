// 📁 PATH: src/hooks/client/useShopBundles.jsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { bundleService } from '@/services/bundleService';

export const shopBundleKeys = {
  all:    () => ['shop-bundles'],
  detail: (slug) => ['shop-bundles', 'detail', slug],
};

// Storefront: all currently active (non-expired) bundles.
export function useShopBundles() {
  return useQuery({
    queryKey: shopBundleKeys.all(),
    queryFn: async () => {
      const res = await bundleService.getAll();
      return res.data?.data ?? res.data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useShopBundleBySlug(slug) {
  return useQuery({
    queryKey: shopBundleKeys.detail(slug),
    queryFn: async () => {
      const res = await bundleService.getBySlug(slug);
      return res.data?.data ?? res.data ?? null;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}