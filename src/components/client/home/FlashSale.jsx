"use client";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Countdown } from "./Countdown";
import { ProductCard } from "../product/ProductCard";
import { useShopFeaturedProducts } from "@/hooks/client/useShopProducts";

function SkeletonCard() {
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

const FlashSale = () => {
  const { data: products = [], isLoading } = useShopFeaturedProducts(6);

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
          <div className="ml-2">
            <Countdown hours={8} />
          </div>
        </div>
        <Link
          href="/shop"
          className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-700 hover:underline"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : products.map((p) => <ProductCard key={p._id} p={p} />)
        }
      </div>
    </section>
  );
};

export default FlashSale;