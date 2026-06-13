"use client";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/client/product/ProductCard";
import { products } from "@/lib/shop-data";
import { Search, X } from "lucide-react";
function SearchPage() {
  const sp = useSearchParams();
  const q = sp.get("q") || "";
  const list = q ? products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())) : products;
  return <div className="container-x py-6">
      <div className="mb-6 flex overflow-hidden rounded-lg border border-border bg-white">
        <Search className="ml-3 mt-3 h-5 w-5 text-muted-foreground" />
        <input defaultValue={q} className="flex-1 px-3 py-3 text-sm outline-none" placeholder="Search products, brands, vendors…" />
        <button className="bg-emerald-600 px-6 text-white">Search</button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Active filters:</span>
        {["Price: \u09F30-5000", "Free Shipping", "4\u2605 & up"].map((f) => <span key={f} className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{f}<X className="h-3 w-3 cursor-pointer" /></span>)}
      </div>

      <h1 className="mb-2 font-display text-2xl font-bold">{list.length} results {q && <span className="text-muted-foreground font-normal">for "{q}"</span>}</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>;
}
export {
  SearchPage as default
};
