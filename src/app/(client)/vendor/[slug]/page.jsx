"use client";
import { useParams } from "next/navigation";
import { ProductCard } from "@/components/client/product/ProductCard";
import { getVendor, products } from "@/lib/shop-data";
import { BadgeCheck, Star, MapPin, MessageSquare, Share2, Calendar, Package, Users } from "lucide-react";
function VendorPage() {
  const params = useParams();
  const v = getVendor(params.slug) || vendors[0];
  const vp = products.filter((p) => p.vendor.id === v.id);
  return <div>
      <div className="relative h-36 sm:h-64 md:h-80">
        <img src={v.banner} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>
      <div className="container-x -mt-10 sm:-mt-24 relative">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-lg">
          <div className="flex flex-wrap items-start gap-5">
            <img src={v.logo} className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl border-4 border-white object-cover shadow-lg" alt="" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl sm:text-3xl font-bold">{v.name}</h1>
                {v.verified && <span className="chip"><BadgeCheck className="h-3 w-3" /> Verified</span>}
                <span className="chip">⭐ Top Seller</span>
              </div>
              <p className="mt-2 text-muted-foreground max-w-2xl">{v.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> <b>{v.rating}</b> rating</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-4 w-4" /> {v.followers.toLocaleString()} followers</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Package className="h-4 w-4" /> {v.products} products</span>
                <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" /> {v.location}</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-4 w-4" /> Since {v.since}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg bg-emerald-600 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 whitespace-nowrap">+ Follow Store</button>
              <button className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-emerald-50"><MessageSquare className="h-4 w-4" /></button>
              <button className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-emerald-50"><Share2 className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5 md:grid-cols-4">
            {[
    { l: "Positive Ratings", v: "98.7%" },
    { l: "Ship on Time", v: "99.2%" },
    { l: "Response Rate", v: "100%" },
    { l: "Avg Response", v: "< 2 hours" }
  ].map((m) => <div key={m.l} className="rounded-lg bg-emerald-50 p-3 text-center">
                <div className="font-display text-xl font-bold text-emerald-700">{m.v}</div>
                <div className="text-xs text-muted-foreground">{m.l}</div>
              </div>)}
          </div>
        </div>

        <div className="mt-6 flex gap-1 border-b border-border overflow-x-auto scrollbar-hide">
          {["All Products", "Top Sellers", "New Arrivals", "Promotions", "Reviews", "About"].map((t, i) => <button key={t} className={`whitespace-nowrap px-3 sm:px-4 py-3 text-sm font-semibold ${i === 0 ? "border-b-2 border-emerald-600 text-emerald-700" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>)}
        </div>

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">All Products ({vp.length})</h2>
            <select className="rounded-md border border-border bg-white px-3 py-1.5 text-sm"><option>Sort: Popular</option><option>Price ↑</option><option>Price ↓</option><option>Newest</option></select>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {vp.map((p) => <ProductCard key={p.id} p={p} />)}
            {vp.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">No products yet.</div>}
          </div>
        </div>
      </div>
    </div>;
}
export {
  VendorPage as default
};
