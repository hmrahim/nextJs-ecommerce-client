// 📁 PATH: components/search/SearchPageClient.jsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, Search as SearchIcon, PackageSearch, AlertCircle } from 'lucide-react';
import { useSearchProducts, useCategories } from '@/hooks/client/useSearch';
import SearchFilters from './SearchFilters';
import { ProductCard } from '@/components/client/product/ProductCard';
import SearchPagination from './SearchPagination';

/**
 * SearchPageClient
 * Main client component for /search page.
 * Search input lives in the header (Amazon-style global search).
 * This page only reads URL query params → renders results + filters.
 */
export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const buildParamsFromUrl = () => ({
    q:        searchParams.get('q')        ?? '',
    category: searchParams.get('category') ?? '',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    rating:   searchParams.get('rating')   ?? '',
    inStock:  searchParams.get('inStock')  === 'true',
    sort:     searchParams.get('sort')     ?? '',
    page:     Number(searchParams.get('page') ?? 1),
  });

  const [activeParams, setActiveParams] = useState(buildParamsFromUrl);

  useEffect(() => {
    setActiveParams(buildParamsFromUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: activeParams,
  });

  useEffect(() => {
    reset(activeParams);
  }, [activeParams, reset]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchEnabled = Boolean(activeParams.q);
  const { data: categories = [] } = useCategories();
  const { data, isFetching, isError } = useSearchProducts(activeParams, searchEnabled);

  const onSubmit = (values) => {
    const params = new URLSearchParams();
    if (activeParams.q)    params.set('q', activeParams.q);
    if (values.category)   params.set('category', values.category);
    if (values.minPrice)   params.set('minPrice', values.minPrice);
    if (values.maxPrice)   params.set('maxPrice', values.maxPrice);
    if (values.rating)     params.set('rating', values.rating);
    if (values.inStock)    params.set('inStock', 'true');
    if (values.sort)       params.set('sort', values.sort);
    params.set('page', '1');

    router.push(`/search?${params.toString()}`);
    setFiltersOpen(false);
  };

  const handlePageChange = (newPage) => {
    setValue('page', newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const results     = data?.results ?? [];
  const total       = data?.total   ?? 0;
  const pages       = data?.pages   ?? 0;
  const query       = data?.query   ?? activeParams.q;
  const currentPage = activeParams.page ?? 1;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ── Result Header ── */}
        {searchEnabled && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">
                Results for <span className="text-neutral-900">&ldquo;{query}&rdquo;</span>
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                {isFetching
                  ? 'Searching...'
                  : `${total} ${total === 1 ? 'product' : 'products'} found`}
              </p>
            </div>

            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 text-sm text-neutral-700 border border-neutral-300 hover:bg-neutral-50 rounded-md px-3 py-1.5 transition-colors"
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* ── Sidebar Filters (Desktop) ── */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="hidden lg:block w-60 shrink-0"
          >
            <div className="sticky top-24">
              <h2 className="text-sm font-semibold text-neutral-900 mb-3">Filters</h2>
              <SearchFilters register={register} categories={categories} />
              <button
                type="submit"
                className="mt-5 w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-md text-sm transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </form>

          {/* ── Mobile Filter Drawer ── */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setFiltersOpen(false)}
              />
              <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-neutral-900">Filters</h2>
                  <button onClick={() => setFiltersOpen(false)}>
                    <X size={20} className="text-neutral-500" />
                  </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <SearchFilters register={register} categories={categories} />
                  <button
                    type="submit"
                    className="mt-5 w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-md text-sm transition-colors"
                  >
                    Apply Filters
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── Results Grid ── */}
          <div className="flex-1 min-w-0">
            {isFetching && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-neutral-200 bg-white animate-pulse overflow-hidden"
                  >
                    <div className="aspect-square bg-neutral-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-neutral-100 rounded w-1/3" />
                      <div className="h-4 bg-neutral-100 rounded w-3/4" />
                      <div className="h-4 bg-neutral-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isError && !isFetching && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle size={40} className="text-neutral-400 mb-3" />
                <p className="text-base font-medium text-neutral-800">Something went wrong</p>
                <p className="text-sm text-neutral-500 mt-1">Please try again later</p>
              </div>
            )}

            {!isFetching && !isError && searchEnabled && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <PackageSearch size={48} className="text-neutral-400 mb-4" />
                <p className="text-base font-medium text-neutral-800">
                  No products found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  Try a different keyword or category
                </p>
              </div>
            )}

            {!isFetching && !searchEnabled && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <SearchIcon size={48} className="text-neutral-400 mb-4" />
                <p className="text-base font-medium text-neutral-800">
                  Start searching
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  Use the search bar in the header to find products
                </p>
              </div>
            )}

            {!isFetching && !isError && results.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {results.map((product) => (
                    <ProductCard key={product._id} p={product} />
                  ))}
                </div>

                {pages > 1 && (
                  <div className="mt-8">
                    <SearchPagination
                      currentPage={currentPage}
                      totalPages={pages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
