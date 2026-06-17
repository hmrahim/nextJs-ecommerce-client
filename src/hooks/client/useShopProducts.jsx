'use client';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';

const ITEMS_PER_PAGE = 20;

export const shopProductKeys = {
  all:        ()        => ['shop-products'],
  list:       (filters) => ['shop-products', 'list',     filters],
  detail:     (slug)    => ['shop-products', 'detail',   slug],
  sku:        (sku)     => ['shop-products', 'sku',      sku],
  search:     (params)  => ['shop-products', 'search',   params],
  featured:   (limit)   => ['shop-products', 'featured', limit],
  related:    (id)      => ['shop-products', 'related',  id],
  byCategory: (slug, f) => ['shop-products', 'category', slug, f],
  variants:   (id)      => ['shop-products', 'variants', id],
};

export function useShopProducts(page = 1, filters = {}) {
  return useQuery({
    queryKey: shopProductKeys.list({ page, ...filters }),
    queryFn: async () => {
      const res = await productService.getAll({
        page,
        limit:          ITEMS_PER_PAGE,
        sort:           filters.sort           || undefined,
        category:       filters.category       || undefined,
        subCategory:    filters.subCategory    || undefined,
        subSubCategory: filters.subSubCategory || undefined,
        brand:          filters.brand          || undefined,
        tags:           filters.tags           || undefined,
        featured:       filters.featured       ?? undefined,
        inStock:        filters.inStock        ?? undefined,
        minPrice:       filters.minPrice       || undefined,
        maxPrice:       filters.maxPrice       || undefined,
        rating:         filters.rating         || undefined,
      });
      return res.data;
    },
    staleTime:        1000 * 60 * 5,  // 5 minutes — before 2 minutes were
    placeholderData:  (prev) => prev,  // keepPreviousData its new API
  });
}

export function useShopProductBySlug(slug) {
  return useQuery({
    queryKey: shopProductKeys.detail(slug),
    queryFn: async () => {
      const res = await productService.getBySlug(slug);
      return res.data?.data ?? res.data;
    },
    enabled:   !!slug,
    staleTime: 1000 * 60 * 10, // 10 minute — product details Too long fresh is
  });
}

export function useShopProductBySku(sku) {
  return useQuery({
    queryKey: shopProductKeys.sku(sku),
    queryFn: async () => {
      const res = await productService.getBySku(sku);
      return res.data?.data ?? res.data;
    },
    enabled:   !!sku,
    staleTime: 1000 * 60 * 10,
  });
}

export function useShopSearch(params = {}) {
  const { q, page = 1, ...rest } = params;
  return useQuery({
    queryKey: shopProductKeys.search({ q, page, ...rest }),
    queryFn: async () => {
      const res = await productService.search(q, { page, limit: ITEMS_PER_PAGE, ...rest });
      return res.data;
    },
    enabled:          !!q?.trim(),
    staleTime:        1000 * 60 * 2,
    placeholderData:  (prev) => prev,
  });
}

export function useShopFeaturedProducts(limit = 10) {
  return useQuery({
    queryKey: shopProductKeys.featured(limit),
    queryFn: async () => {
      const res = await productService.getFeatured({ limit });
      return res.data?.results ?? res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useShopRelatedProducts(productId, limit = 8) {
  return useQuery({
    queryKey: shopProductKeys.related(productId),
    queryFn: async () => {
      const res = await productService.getRelated(productId, { limit });
      return res.data?.results ?? res.data;
    },
    enabled:   !!productId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useShopProductsByCategory(categorySlug, page = 1, filters = {}) {
  return useQuery({
    queryKey: shopProductKeys.byCategory(categorySlug, { page, ...filters }),
    queryFn: async () => {
      const res = await productService.getByCategory(categorySlug, {
        page,
        limit:          ITEMS_PER_PAGE,
        sort:           filters.sort           || undefined,
        subCategory:    filters.subCategory    || undefined,
        subSubCategory: filters.subSubCategory || undefined,
        brand:          filters.brand          || undefined,
        tags:           filters.tags           || undefined,
        featured:       filters.featured       ?? undefined,
        inStock:        filters.inStock        ?? undefined,
        minPrice:       filters.minPrice       || undefined,
        maxPrice:       filters.maxPrice       || undefined,
        rating:         filters.rating         || undefined,
      });
      return res.data;
    },
    enabled:         !!categorySlug,
    staleTime:       1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
}

// ✅ Variants Whom React Query Brought it to — useEffect + useState instead of this
// ProductDetailPage In variantService.getPublic() direct call was happening, cache was not
export function useProductVariants(productId) {
  return useQuery({
    queryKey: shopProductKeys.variants(productId),
    queryFn: async () => {
      const { variantService } = await import('@/services/Variantservice');
      const res  = await variantService.getPublic(productId);
      const list = res.data?.data || res.data?.results || res.data || [];
      return Array.isArray(list) ? list : [];
    },
    enabled:   !!productId,
    staleTime: 1000 * 60 * 10, // 10 minute cache
  });
}

export function useInfiniteShopProducts(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['shop-infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await productService.getAll({
        page:  pageParam,
        limit: 20,
        ...filters,
      });
      return res.data;
    },
    getNextPageParam: (last) => last.page < last.pages ? last.page + 1 : undefined,
    placeholderData:  (prev) => prev,
    staleTime:        1000 * 60 * 5,
  });
}
