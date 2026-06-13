import React from 'react';
import { ProductCard } from '../product/ProductCard';
import SectionHeader from './SectionHeader';
import { Flame } from 'lucide-react';
import { products } from '@/lib/shop-data';

const Recommended = () => {
      const recommended = products.slice(2, 18);
    return (
        <section>
            <SectionHeader icon={<Flame className="h-5 w-5" />} title="Recommended For You" link="/shop" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {recommended.slice(0, 12).map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
        </section>
    );
};

export default Recommended;