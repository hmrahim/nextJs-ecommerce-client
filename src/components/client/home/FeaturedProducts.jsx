"use client";
import { ProductCard } from "../product/ProductCard";
import SectionHeader from "./SectionHeader";
import { Star } from "lucide-react";
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

export default function FeaturedProducts() {
  const { data: products = [], isLoading } = useShopFeaturedProducts(8);

  return (
    <section>
      <SectionHeader
        icon={<Star className="h-5 w-5" />}
        title="Featured Products"
        link="/shop?isFeatured=true"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : products.map((p) => <ProductCard key={p._id} p={p} />)
        }
      </div>
    </section>
  );
}