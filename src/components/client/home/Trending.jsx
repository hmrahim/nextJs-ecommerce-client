import React from 'react';
import SectionHeader from './SectionHeader';
import { products } from '@/lib/shop-data';
import { ProductCard } from '../product/ProductCard';
import { TrendingUp } from 'lucide-react';

const Trending = () => {
    const trending = products.slice(6, 14);
    return (
          <section>
        <SectionHeader icon={<TrendingUp className="h-5 w-5" />} title="Trending Now" link="/shop" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {trending.slice(0, 6).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    );
};

export default Trending;