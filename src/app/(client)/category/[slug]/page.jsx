"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductCard } from "@/components/client/product/ProductCard";
import { FilterPanel } from "@/components/client/shop/FilterPanel";
import { categories, getCategory, products } from "@/lib/shop-data";
function CategoryPage() {
  const params = useParams();
  const cat = getCategory(params.slug) || categories[0];
  const list = products;
  return <div>
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white">
        <div className="container-x grid gap-4 py-10 md:grid-cols-[1fr_300px] md:items-center">
          <div>
            <nav className="mb-3 text-xs text-emerald-100"><Link href="/" className="hover:text-white">Home</Link> / <Link href="/shop" className="hover:text-white">Shop</Link> / <span className="text-white">{cat.name}</span></nav>
            <h1 className="font-display text-4xl font-bold">{cat.icon} {cat.name}</h1>
            <p className="mt-2 max-w-xl text-emerald-100">Explore the best of {cat.name.toLowerCase()} from {Math.floor(50 + Math.random() * 500)}+ verified sellers. Free shipping on orders over ৳999.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {cat.subcategories.map((s) => <button key={s} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur hover:bg-white/20">{s}</button>)}
            </div>
          </div>
          <img src={cat.image} alt="" className="hidden md:block h-40 w-full rounded-xl object-cover" />
        </div>
      </div>

      <div className="container-x py-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6"><FilterPanel /></aside>
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
            <div className="text-sm text-muted-foreground">Showing {list.length} of <span className="font-semibold text-foreground">2,140</span> products in {cat.name}</div>
            <select className="rounded-md border border-border bg-white px-3 py-1.5 text-sm">
              <option>Best Match</option><option>Price ↑</option><option>Price ↓</option><option>Newest</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </div>

      <div className="container-x mt-12">
        <h2 className="mb-4 font-display text-xl font-bold">Related Categories</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
          {categories.filter((c) => c.slug !== cat.slug).slice(0, 8).map((c) => <Link key={c.slug} href={`/category/${c.slug}`} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-3 text-center card-hover">
              <div className="text-3xl">{c.icon}</div>
              <div className="text-xs font-medium">{c.name}</div>
            </Link>)}
        </div>
      </div>
    </div>;
}
export {
  CategoryPage as default
};
