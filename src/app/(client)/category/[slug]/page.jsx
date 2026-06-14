'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/client/product/ProductCard';
import { FilterPanel } from '@/components/client/shop/FilterPanel';
import { useShopProductsByCategory } from '@/hooks/client/useShopProducts';
import { Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Best Match',         value: '-createdAt'  },
  { label: 'Price: Low to High', value: 'price:asc'   },
  { label: 'Price: High to Low', value: 'price:desc'  },
  { label: 'Newest',             value: 'newest'       },
  { label: 'Top Rated',          value: 'rating:desc'  },
];

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

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-8 flex justify-center gap-1 flex-wrap">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}
        className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-emerald-50 disabled:opacity-40">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1)
        .filter(n => n === 1 || n === pages || Math.abs(n - page) <= 2)
        .reduce((acc, n, i, arr) => {
          if (i > 0 && n - arr[i - 1] > 1) acc.push('...');
          acc.push(n);
          return acc;
        }, [])
        .map((n, i) => n === '...'
          ? <span key={`d${i}`} className="grid h-9 place-items-center px-2 text-muted-foreground">…</span>
          : <button key={n} onClick={() => onChange(n)}
              className={`grid h-9 min-w-9 place-items-center rounded-md border px-3 text-sm ${
                n === page ? 'bg-emerald-600 text-white border-emerald-600' : 'border-border hover:bg-emerald-50'
              }`}>{n}</button>
        )}
      <button disabled={page === pages} onClick={() => onChange(page + 1)}
        className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-emerald-50 disabled:opacity-40">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function CategoryPage() {
  const { slug }     = useParams();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') || 1);
  const filters = {
    sort:           searchParams.get('sort')           || undefined,
    brand:          searchParams.get('brand')          || undefined,
    subCategory:    searchParams.get('subCategory')    || undefined,
    subSubCategory: searchParams.get('subSubCategory') || undefined,
    minPrice:       searchParams.get('minPrice')       || undefined,
    maxPrice:       searchParams.get('maxPrice')       || undefined,
    rating:         searchParams.get('rating')         || undefined,
    inStock:        searchParams.get('inStock')        || undefined,
    featured:       searchParams.get('featured')       || undefined,
  };

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data, isLoading, isError } = useShopProductsByCategory(slug, page, filters);

  const categoryName = data?.category?.name ?? slug;
  const total        = data?.total   ?? 0;
  const pages        = data?.pages   ?? 1;
  const products     = data?.results ?? [];

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set(key, value) : p.delete(key);
    p.delete('page');
    router.push(`?${p.toString()}`);
  };

  const setPage = (n) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', n);
    router.push(`?${p.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white">
        <div className="container-x py-10">
          <nav className="mb-3 text-xs text-emerald-100">
            <Link href="/" className="hover:text-white">Home</Link>{' / '}
            <Link href="/shop" className="hover:text-white">Shop</Link>{' / '}
            <span className="text-white capitalize">{categoryName}</span>
          </nav>
          <h1 className="font-display text-4xl font-bold capitalize">{categoryName}</h1>
          <p className="mt-2 text-emerald-100 text-sm">
            {isLoading ? 'Loading...' : `${total.toLocaleString()} products found`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-x py-6 grid gap-6 lg:grid-cols-[260px_1fr]">

        {/* Desktop sidebar */}
        <aside className="hidden lg:block space-y-4">
          <FilterPanel filters={filters} onFilterChange={setParam} />
        </aside>

        {/* Mobile drawer backdrop */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileFiltersOpen(false)} />
        )}

        {/* Mobile drawer */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white p-4 shadow-xl transition-transform duration-300 lg:hidden ${
          mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</span>
            <button onClick={() => setMobileFiltersOpen(false)} className="text-xl text-muted-foreground">✕</button>
          </div>
          <FilterPanel filters={filters} onFilterChange={(k, v) => { setParam(k, v); setMobileFiltersOpen(false); }} />
        </aside>

        {/* Products */}
        <div>
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? <span className="inline-block h-3 w-40 animate-pulse rounded bg-muted" />
                : <><span className="font-semibold text-foreground">{total.toLocaleString()}</span> products in <span className="font-semibold text-foreground capitalize">{categoryName}</span></>
              }
            </p>
            <div className="flex items-center gap-2">
              <button className="lg:hidden flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium"
                onClick={() => setMobileFiltersOpen(true)}>
                <Filter className="h-4 w-4" /> Filters
              </button>
              <select value={filters.sort || '-createdAt'} onChange={e => setParam('sort', e.target.value)}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-sm">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Error */}
          {isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
              Failed to load products. Please try again.
            </div>
          )}

          {/* Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 20 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-20 text-center">
              <span className="text-4xl">🔍</span>
              <p className="font-semibold">No products found</p>
              <p className="text-sm text-muted-foreground">Try changing your filters.</p>
              <button onClick={() => router.push(`/category/${slug}`)}
                className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                Clear filters
              </button>
            </div>
          )}

          {/* Grid */}
          {!isLoading && products.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map(p => <ProductCard key={p._id} p={p} />)}
            </div>
          )}

          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}