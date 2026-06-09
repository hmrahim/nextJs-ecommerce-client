import ProductGrid from '@/components/client/product/ProductGrid';

export default function FeaturedProducts() {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
      <ProductGrid searchParams={{ featured: true, limit: 8 }} />
    </section>
  );
}
