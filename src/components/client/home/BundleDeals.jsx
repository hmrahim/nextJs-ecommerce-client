// 📁 PATH: src/components/client/home/BundleDeals.jsx
"use client";
import { Package } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { BundleCard } from "../bundles/BundleCard";
import { useShopBundles } from "@/hooks/client/useShopBundles";

const VISIBLE_LIMIT = 12;

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

export default function BundleDeals() {
  const { data: bundles = [], isLoading } = useShopBundles();

  // Hide the section entirely if there are no bundles and we're done loading.
  if (!isLoading && bundles.length === 0) return null;

  const visible = bundles.slice(0, VISIBLE_LIMIT);

  return (
    <section>
      <SectionHeader
        icon={<Package className="h-5 w-5" />}
        title="Bundle Deals"
        link="/bundles"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : visible.map((b) => <BundleCard key={b._id} b={b} />)
        }
      </div>
    </section>
  );
}