'use client';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '@/components/ui/skeleton';

export default function ProductGrid({ searchParams = {} }) {
  const { products, loading, error } = useProducts(searchParams);

  if (error) return <p className="text-red-500">Failed to load products.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {loading
        ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((p) => <ProductCard key={p.id} product={p} />)
      }
    </div>
  );
}
