"use client";
import SectionHeader from "./SectionHeader";
import { ProductCard } from "../product/ProductCard";
import { TrendingUp } from "lucide-react";
import { useShopProducts } from "@/hooks/client/useShopProducts";
import ProductSlider from "./ProductSlider";

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

const Trending = () => {
  const { data, isLoading } = useShopProducts(1, { sort: "sold:desc" });
  const products = data?.results ?? [];

  const cards = isLoading
    ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
    : products.slice(0, 12).map((p) => <ProductCard key={p._id} p={p} />);

  return (
    <section>
      <SectionHeader
        icon={<TrendingUp className="h-5 w-5" />}
        title="Trending Now"
        link="/shop"
      />
      <ProductSlider autoPlay={4000}>
        {cards}
      </ProductSlider>
    </section>
  );
};

export default Trending;
