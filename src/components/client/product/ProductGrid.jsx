'use client';
import { ProductCard } from './ProductCard';
import { useShopProducts } from '@/hooks/client/useShopProducts';

export default function ProductGrid({ searchParams = {} }) {
  const page = Number(searchParams.page) || 1;
  const filters = {
    sort:         searchParams.sort         || undefined,
    categoryId:   searchParams.categoryId   || undefined,
    brandId:      searchParams.brandId      || undefined,
    minPrice:     searchParams.minPrice     || undefined,
    maxPrice:     searchParams.maxPrice     || undefined,
    rating:       searchParams.rating       || undefined,
    inStock:      searchParams.inStock      || undefined,
    freeShipping: searchParams.freeShipping || undefined,
  };

  const { data, isLoading, isError } = useShopProducts(page, filters);
  const products = data?.results ?? [];

  if (isError) return <p className="text-red-500">Failed to load products.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {isLoading
        ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card overflow-hidden">
              <div className="aspect-square bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-muted rounded w-4/5" />
                <div className="h-3 bg-muted rounded w-3/5" />
                <div className="h-4 bg-muted rounded w-2/5" />
              </div>
            </div>
          ))
        : products.map((p) => <ProductCard key={p._id} p={p} />)
      }
    </div>
  );
}