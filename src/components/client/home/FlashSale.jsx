import { ArrowRight, Zap } from 'lucide-react';
import React from 'react';
import { Countdown } from './Countdown';
import Link from 'next/link';
import { ProductCard } from '../product/ProductCard';
import { products } from '@/lib/shop-data';

const FlashSale = () => {
     const flash = products.slice(0, 6);
    return (
           <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-50 to-amber-50">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-white/60 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-400">
              <Zap className="h-5 w-5 text-emerald-950" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Flash Sale</h2>
              <div className="text-xs text-muted-foreground">Hurry, limited time only</div>
            </div>
            <div className="ml-2"><Countdown hours={8} /></div>
          </div>
          <Link href="/shop" className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-700 hover:underline">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-6">
          {flash.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    );
};

export default FlashSale;