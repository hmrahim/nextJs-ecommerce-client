"use client";
import { ProductCard } from "../product/ProductCard";
import SectionHeader from "./SectionHeader";
import { Flame } from "lucide-react";
import { useShopProducts } from "@/hooks/client/useShopProducts";

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

const Recommended = () => {
  const { data, isLoading } = useShopProducts(1, { sort: "rating:desc" });
  const products = data?.results ?? [];

  return (
    <section>
      <SectionHeader
        icon={<Flame className="h-5 w-5" />}
        title="Recommended For You"
        link="/shop"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : products.slice(0, 12).map((p) => <ProductCard key={p._id} p={p} />)
        }
      </div>
    </section>
  );
};

export default Recommended;