import Link from "next/link";
import { vendors, products } from "@/lib/shop-data";
import { BadgeCheck, Star, MapPin, Search } from "lucide-react";
function Vendors() {
  return <div>
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 py-8 sm:py-12 text-white">
        <div className="container-x">
          <h1 className="font-display text-2xl sm:text-4xl font-bold">Discover Our Vendors</h1>
          <p className="mt-2 text-emerald-100">Browse 50,000+ verified sellers shipping nationwide.</p>
          <div className="mt-5 flex max-w-xl overflow-hidden rounded-lg bg-white">
            <input className="flex-1 px-4 py-3 text-sm text-foreground outline-none" placeholder="Search vendors by name or category…" />
            <button className="bg-amber-400 px-5 text-emerald-950"><Search className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      <div className="container-x py-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 mb-6">
          {[
    { v: "50,000+", l: "Active Vendors" },
    { v: "12M+", l: "Products Listed" },
    { v: "98.7%", l: "Positive Reviews" },
    { v: "64", l: "Districts Covered" }
  ].map((s) => <div key={s.l} className="rounded-xl border border-border bg-card p-5 text-center">
              <div className="font-display text-3xl font-bold text-emerald-700">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>)}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {vendors.map((v) => {
    const vp = products.filter((p) => p.vendor.id === v.id).slice(0, 4);
    return <Link key={v.id} href={`/vendor/${v.slug}`} className="overflow-hidden rounded-2xl border border-border bg-card card-hover">
                <div className="relative h-32"><img src={v.banner} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" /></div>
                <div className="p-5">
                  <div className="-mt-12 flex items-start gap-4">
                    <img src={v.logo} className="h-20 w-20 rounded-xl border-4 border-white object-cover shadow" alt="" />
                    <div className="flex-1 min-w-0 pt-12">
                      <div className="flex items-center gap-1 font-display font-bold text-lg truncate">{v.name} {v.verified && <BadgeCheck className="h-5 w-5 text-emerald-600" />}</div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {v.rating}</span>
                        <span>{v.followers.toLocaleString()} followers</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {v.location}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{v.description}</p>
                  <div className="mt-3 grid grid-cols-4 gap-1">
                    {vp.map((p) => <img key={p.id} src={p.image} className="aspect-square w-full rounded-md object-cover" alt="" />)}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-md bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Visit Store</button>
                    <button className="flex-1 rounded-md border border-border py-2 text-xs font-semibold hover:bg-emerald-50">+ Follow</button>
                  </div>
                </div>
              </Link>;
  })}
        </div>
      </div>
    </div>;
}
export {
  Vendors as default
};
