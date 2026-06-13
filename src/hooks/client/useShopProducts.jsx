// src/hooks/client/useShopProducts.js
//
// ─── CLIENT-SIDE PRODUCT HOOKS ────────────────────────────────────────────────
// Admin hooks live in  src/hooks/useProducts.js  (key namespace: 'admin-products')
// These hooks live in  src/hooks/client/          (key namespace: 'shop-products')
// The two namespaces never collide in React Query's cache.
// ─────────────────────────────────────────────────────────────────────────────

'use client';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { ITEMS_PER_PAGE } from '@/lib/constants';

/* ─────────────────────────────────────────────────────────────
   QUERY KEY FACTORY
   All keys start with 'shop-products' so they are completely
   isolated from the admin namespace ('admin-products').
───────────────────────────────────────────────────────────── */
export const shopProductKeys = {
  all:        ()           => ['shop-products'],
  list:       (filters)    => ['shop-products', 'list',     filters],
  detail:     (slug)       => ['shop-products', 'detail',   slug],
  sku:        (sku)        => ['shop-products', 'sku',      sku],
  search:     (params)     => ['shop-products', 'search',   params],
  featured:   (limit)      => ['shop-products', 'featured', limit],
  related:    (id)         => ['shop-products', 'related',  id],
  byCategory: (slug, f)    => ['shop-products', 'category', slug, f],
};

/* ─────────────────────────────────────────────────────────────
   1. useShopProducts — paginated, filtered product list
      Used on /shop page.

   filters shape:
   {
     sort?:            string   // 'price:asc' | 'price:desc' | 'rating:desc' | 'sold:desc' | 'newest'
     categoryId?:      string
     subCategoryId?:   string
     subSubCategoryId?:string
     brandId?:         string
     tags?:            string   // comma-separated
     isFeatured?:      boolean
     freeShipping?:    boolean
     inStock?:         boolean
     minPrice?:        number | string
     maxPrice?:        number | string
     rating?:          number   // minimum average rating  e.g. 4
   }
───────────────────────────────────────────────────────────── */
export function useShopProducts(page = 1, filters = {}) {
  return useQuery({
    queryKey: shopProductKeys.list({ page, ...filters }),
    queryFn:  async () => {
      const res = await productService.getAll({
        page,
        limit:            ITEMS_PER_PAGE,
        sort:             filters.sort             || '-createdAt',
        categoryId:       filters.categoryId       || undefined,
        subCategoryId:    filters.subCategoryId    || undefined,
        subSubCategoryId: filters.subSubCategoryId || undefined,
        brandId:          filters.brandId          || undefined,
        tags:             filters.tags             || undefined,
        isFeatured:       filters.isFeatured       ?? undefined,
        freeShipping:     filters.freeShipping     ?? undefined,
        inStock:          filters.inStock          ?? undefined,
        minPrice:         filters.minPrice         || undefined,
        maxPrice:         filters.maxPrice         || undefined,
        rating:           filters.rating           || undefined,
      });
      return res.data;
      // shape: { success, total, page, pages, limit, results: Product[] }
    },
    staleTime:        1000 * 60 * 2,   // 2 min — shop listings stay fresh
    keepPreviousData: true,            // prevents blank flash on page change
  });
}

/* ─────────────────────────────────────────────────────────────
   2. useShopProductBySlug — single product detail
      Used on /product/[slug] and /shop/[slug] pages.
───────────────────────────────────────────────────────────── */
export function useShopProductBySlug(slug) {
  return useQuery({
    queryKey: shopProductKeys.detail(slug),
    queryFn:  async () => {
      const res = await productService.getBySlug(slug);
      return res.data?.data ?? res.data;
    },
    enabled:   !!slug,
    staleTime: 1000 * 60 * 5,  // product detail pages can be a little staler
  });
}

/* ─────────────────────────────────────────────────────────────
   3. useShopProductBySku
      Useful for quick-lookup search bars and QR / barcode flows.
───────────────────────────────────────────────────────────── */
export function useShopProductBySku(sku) {
  return useQuery({
    queryKey: shopProductKeys.sku(sku),
    queryFn:  async () => {
      const res = await productService.getBySku(sku);
      return res.data?.data ?? res.data;
    },
    enabled:   !!sku,
    staleTime: 1000 * 60 * 5,
  });
}

/* ─────────────────────────────────────────────────────────────
   4. useShopSearch — full-text search with optional filters
      Used on /search page.

   params shape:
   {
     q:          string          // required
     page?:      number
     sort?:      string
     minPrice?:  number | string
     maxPrice?:  number | string
     categoryId?:string
     brandId?:   string
     rating?:    number
     inStock?:   boolean
   }
───────────────────────────────────────────────────────────── */
export function useShopSearch(params = {}) {
  const { q, page = 1, ...rest } = params;

  return useQuery({
    queryKey: shopProductKeys.search({ q, page, ...rest }),
    queryFn:  async () => {
      const res = await productService.search(q, {
        page,
        limit:      ITEMS_PER_PAGE,
        sort:       rest.sort       || undefined,
        minPrice:   rest.minPrice   || undefined,
        maxPrice:   rest.maxPrice   || undefined,
        categoryId: rest.categoryId || undefined,
        brandId:    rest.brandId    || undefined,
        rating:     rest.rating     || undefined,
        inStock:    rest.inStock    ?? undefined,
      });
      return res.data;
      // shape: { success, query, total, page, pages, limit, results: Product[] }
    },
    enabled:          !!q?.trim(),
    staleTime:        1000 * 60,
    keepPreviousData: true,
  });
}

/* ─────────────────────────────────────────────────────────────
   5. useShopFeaturedProducts — homepage / widget use
───────────────────────────────────────────────────────────── */
export function useShopFeaturedProducts(limit = 10) {
  return useQuery({
    queryKey: shopProductKeys.featured(limit),
    queryFn:  async () => {
      const res = await productService.getFeatured({ limit });
      return res.data?.results ?? res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/* ─────────────────────────────────────────────────────────────
   6. useShopRelatedProducts — product detail "You may also like"
───────────────────────────────────────────────────────────── */
export function useShopRelatedProducts(productId, limit = 8) {
  return useQuery({
    queryKey: shopProductKeys.related(productId),
    queryFn:  async () => {
      const res = await productService.getRelated(productId, { limit });
      return res.data?.results ?? res.data;
    },
    enabled:   !!productId,
    staleTime: 1000 * 60 * 5,
  });
}

/* ─────────────────────────────────────────────────────────────
   7. useShopProductsByCategory — category browse pages
      Used on /category/[slug].

   filters shape: same as useShopProducts filters (except no categoryId —
   that is derived from the slug automatically by the backend)
───────────────────────────────────────────────────────────── */
export function useShopProductsByCategory(categorySlug, page = 1, filters = {}) {
  return useQuery({
    queryKey: shopProductKeys.byCategory(categorySlug, { page, ...filters }),
    queryFn:  async () => {
      const res = await productService.getByCategory(categorySlug, {
        page,
        limit:            ITEMS_PER_PAGE,
        sort:             filters.sort             || '-createdAt',
        subCategoryId:    filters.subCategoryId    || undefined,
        subSubCategoryId: filters.subSubCategoryId || undefined,
        brandId:          filters.brandId          || undefined,
        tags:             filters.tags             || undefined,
        isFeatured:       filters.isFeatured       ?? undefined,
        freeShipping:     filters.freeShipping     ?? undefined,
        inStock:          filters.inStock          ?? undefined,
        minPrice:         filters.minPrice         || undefined,
        maxPrice:         filters.maxPrice         || undefined,
        rating:           filters.rating           || undefined,
      });
      return res.data;
      // shape: { success, category: {name,slug}, total, page, pages, limit, results }
    },
    enabled:          !!categorySlug,
    staleTime:        1000 * 60 * 2,
    keepPreviousData: true,
  });
}
