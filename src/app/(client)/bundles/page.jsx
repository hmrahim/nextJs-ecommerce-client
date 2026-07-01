// 📁 PATH: src/app/(client)/bundles/page.jsx
"use client";

import { Package } from "lucide-react";
import { BundleCard } from "@/components/client/bundles/BundleCard";
import { useShopBundles } from "@/hooks/client/useShopBundles";

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

export default function BundlesPage() {
  const { data: bundles = [], isLoading } = useShopBundles();

  return (
    <div className="container-x py-6 space-y-6">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-100 text-violet-700">
          <Package className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold md:text-2xl">Bundle Deals</h1>
          <p className="text-sm text-muted-foreground">
            Save more by buying these curated product combos together.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : bundles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <Package className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No bundle deals available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {bundles.map((b) => <BundleCard key={b._id} b={b} />)}
        </div>
      )}
    </div>
  );
}