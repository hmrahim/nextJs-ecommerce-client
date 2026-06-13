import Link from "next/link";
import { ProductCard } from "@/components/client/product/ProductCard";
import { products } from "@/lib/shop-data";
import { Heart, Trash2 } from "lucide-react";
function Wishlist() {
  const items = products.slice(0, 8);
  return <div className="container-x py-6">
      <nav className="mb-4 text-xs text-muted-foreground"><Link href="/" className="hover:text-primary">Home</Link> / <span className="text-foreground">Wishlist</span></nav>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold"><Heart className="h-7 w-7 fill-rose-500 text-rose-500" /> My Wishlist</h1>
        <div className="flex gap-2">
          <button className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-emerald-50">Move All to Cart</button>
          <button className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1"><Trash2 className="h-4 w-4" /> Clear</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>;
}
export {
  Wishlist as default
};
