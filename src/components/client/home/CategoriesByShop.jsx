import React from 'react';
import SectionHeader from './SectionHeader';
import { Tag } from 'lucide-react';
import { categories } from '@/lib/shop-data';
import Link from 'next/link';

const CategoriesByShop = () => {
    return (
            <section>
        <SectionHeader
         icon={<Tag className="h-5 w-5" />} title="Shop by Category" link="/shop" />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-10">
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white p-2 sm:p-3 text-center card-hover">
              <div className="grid h-10 w-10 sm:h-14 sm:w-14 place-items-center rounded-full bg-emerald-50 text-2xl sm:text-3xl">{c.icon}</div>
              <div className="text-xs font-medium">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>
    );
};

export default CategoriesByShop;