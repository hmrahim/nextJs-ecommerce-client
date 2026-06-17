'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { ProductCard } from '@/components/client/product/ProductCard';
import { FilterPanel } from '@/components/client/shop/FilterPanel';
import { Filter, Grid3x3, List, SlidersHorizontal, Loader2 } from 'lucide-react';

const LIMIT = 20;

const SORT_OPTIONS = [
  { label: 'Best Match',         value: '-createdAt'  },
  { label: 'Price: Low to High', value: 'price:asc'   },
  { label: 'Price: High to Low', value: 'price:desc'  },
  { label: 'Newest',             value: 'newest'       },
  { label: 'Top Rated',          value: 'rating:desc'  },
  { label: 'Best Selling',       value: 'sold:desc'    },
];

/* ── Skeleton card ──────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-card overflow-hidden">
      <div className="aspect-square bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted rounded w-4/5" />
        <div className="h-3 bg-muted rounded w-3/5" />
        <div className="h-4 bg-muted rounded w-2/5" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SHOP PAGE  — Infinite Scroll
══════════════════════════════════════════════════════════ */
export default function ShopPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  /* ── filters from URL ── */
  const filters = {
    sort:           searchParams.get('sort')           || '-createdAt',
    category:       searchParams.get('category')       || undefined,
    subCategory:    searchParams.get('subCategory')    || undefined,
    subSubCategory: searchParams.get('subSubCategory') || undefined,
    brand:          searchParams.get('brand')          || undefined,
    tags:           searchParams.get('tags')           || undefined,
    featured:       searchParams.get('featured')       || undefined,
    inStock:        searchParams.get('inStock')        || undefined,
    minPrice:       searchParams.get('minPrice')       || undefined,
    maxPrice:       searchParams.get('maxPrice')       || undefined,
    rating:         searchParams.get('rating')         || undefined,
  };

  const [viewMode,          setViewMode]          = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* ── Infinite Query ── */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['shop-infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await productService.getAll({
        page:  pageParam,
        limit: LIMIT,
        ...filters,
      });
      return res.data;
      // shape: { results, total, page, pages }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.pages) return lastPage.page + 1;
      return undefined;
    },
    keepPreviousData: true,
  });

  /* ── Flatten all pages → single product list ── */
  const products = data?.pages?.flatMap(p => p.results) ?? [];
  const total    = data?.pages?.[0]?.total ?? 0;

  /* ── Intersection Observer — auto load on scroll ── */
  const sentinelRef = useRef(null);

  const onIntersect = useCallback((entries) => {
    if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(onIntersect, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect]);

  /* ── URL helpers ── */
  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set(key, value) : p.delete(key);
    router.push(`?${p.toString()}`);
  };

  const clearAll = () => router.push('/shop');

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="container-x py-6">

      {/* Breadcrumb */}
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        {' / '}
        <span className="text-foreground">Shop</span>
      </nav>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:block space-y-4">
          <FilterPanel filters={filters} onFilterChange={setParam} />
        </aside>

        {/* ── Mobile backdrop ── */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)} />
        )}

        {/* ── Mobile drawer ── */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white p-4 shadow-xl transition-transform duration-300 lg:hidden ${
          mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </span>
            <button onClick={() => setMobileFiltersOpen(false)} className="text-xl text-muted-foreground">✕</button>
          </div>
          <FilterPanel
            filters={filters}
            onFilterChange={(k, v) => { setParam(k, v); setMobileFiltersOpen(false); }}
          />
        </aside>

        {/* ── Product area ── */}
        <div>

          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? <span className="inline-block h-3 w-40 animate-pulse rounded bg-muted" />
                : <><span className="font-semibold text-foreground">{products.length}</span> / <span className="font-semibold text-foreground">{total.toLocaleString()}</span> products</>
              }
            </p>

            <div className="flex items-center gap-2">
              {/* Mobile filter btn */}
              <button
                className="lg:hidden flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <Filter className="h-4 w-4" /> Filters
              </button>

              {/* Sort */}
              <select
                value={filters.sort}
                onChange={e => setParam('sort', e.target.value)}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-sm"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* View toggle */}
              <div className="hidden md:flex rounded-md border border-border">
                <button onClick={() => setViewMode('grid')}
                  className={`grid h-8 w-8 place-items-center ${viewMode === 'grid' ? 'bg-emerald-50 text-emerald-700' : 'text-muted-foreground'}`}>
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`grid h-8 w-8 place-items-center ${viewMode === 'list' ? 'bg-emerald-50 text-emerald-700' : 'text-muted-foreground'}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
              Failed to load products. Please try again.
            </div>
          )}

          {/* Initial loading skeletons */}
          {isLoading && (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4'
              : 'flex flex-col gap-3'
            }>
              {Array.from({ length: LIMIT }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-20 text-center">
              <span className="text-4xl">🔍</span>
              <p className="font-semibold text-foreground">No products found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
              <button onClick={clearAll}
                className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                Clear all filters
              </button>
            </div>
          )}

          {/* Product grid / list */}
          {!isLoading && products.length > 0 && (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4'
              : 'flex flex-col gap-3'
            }>
              {products.map(p => (
                <ProductCard key={p._id} p={p} listView={viewMode === 'list'} />
              ))}
            </div>
          )}

          {/* ── Sentinel — IntersectionObserver here watch Do ── */}
          <div ref={sentinelRef} className="h-4" />

          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                Loading more products...
              </div>
            </div>
          )}

          {/* End of list */}
          {!hasNextPage && products.length > 0 && !isLoading && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              ✓ All {total.toLocaleString()} products loaded
            </p>
          )}

        </div>
      </div>
    </div>
  );
}