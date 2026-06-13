"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProduct, products, vendors } from "@/lib/shop-data";
import { ProductCard } from "@/components/client/product/ProductCard";
import { Star, ShoppingCart, Heart, Share2, Truck, RotateCcw, ShieldCheck, BadgeCheck, MessageSquare, ChevronRight, MapPin, Plus, Minus } from "lucide-react";
import { useState } from "react";
function ProductPage() {
  const params = useParams();
  const p = getProduct(params.id) || products[0];
  const vendor = vendors.find((v) => v.id === p.vendor.id);
  const [img, setImg] = useState(p.images?.[0] || p.image);
  const [qty, setQty] = useState(1);
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 6);
  return <div className="container-x py-6">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link> / <Link href={`/category/${p.category}`} className="hover:text-primary capitalize">{p.category}</Link> / <span className="text-foreground">{p.title}</span>
      </nav>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_320px]">
        {
    /* Gallery */
  }
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-card">
            <img src={img} alt={p.title} className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {(p.images || [p.image]).map((i) => <button key={i} onClick={() => setImg(i)} className={`aspect-square overflow-hidden rounded-lg border-2 ${img === i ? "border-emerald-600" : "border-transparent"}`}>
                <img src={i} alt="" className="h-full w-full object-cover" />
              </button>)}
          </div>
        </div>

        {
    /* Info */
  }
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {p.badge && <span className="chip">{p.badge}</span>}
            <span className="chip">Verified Seller</span>
          </div>
          <h1 className="font-display text-xl font-bold md:text-3xl">{p.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> <span className="font-semibold">{p.rating.toFixed(1)}</span></span>
            <a href="#reviews" className="text-emerald-700 hover:underline">{p.reviews.toLocaleString()} reviews</a>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">{p.sold.toLocaleString()} sold</span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-1 text-emerald-700"><BadgeCheck className="h-4 w-4" /> Authentic</span>
          </div>

          <div className="rounded-xl border border-border bg-gradient-to-br from-emerald-50 to-amber-50 p-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-emerald-700">৳{p.price.toLocaleString()}</span>
              {p.oldPrice && <>
                <span className="text-lg text-muted-foreground line-through">৳{p.oldPrice.toLocaleString()}</span>
                <span className="sale-badge">-{Math.round((p.oldPrice - p.price) / p.oldPrice * 100)}%</span>
              </>}
            </div>
            <div className="mt-1 text-xs text-emerald-800">💰 Save ৳{((p.oldPrice ?? p.price) - p.price).toLocaleString()} · Use code <b>GREEN50</b> for extra 5% off</div>
          </div>

          {
    /* Variants */
  }
          <div>
            <div className="text-sm font-semibold mb-2">Color: <span className="text-muted-foreground font-normal">Forest Green</span></div>
            <div className="flex gap-2">
              {["bg-emerald-700", "bg-amber-500", "bg-slate-800", "bg-rose-500", "bg-sky-600"].map((c, i) => <button key={i} className={`h-9 w-9 rounded-full border-2 ${c} ${i === 0 ? "border-emerald-900 ring-2 ring-emerald-300" : "border-white"}`} />)}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Size:</div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {["S", "M", "L", "XL", "XXL"].map((s) => <button key={s} className={`min-w-12 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:border-emerald-600 ${s === "M" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : ""}`}>{s}</button>)}
            </div>
          </div>

          {
    /* Quantity */
  }
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">Quantity:</span>
            <div className="flex items-center rounded-md border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-9 w-9 place-items-center hover:bg-emerald-50"><Minus className="h-4 w-4" /></button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="grid h-9 w-9 place-items-center hover:bg-emerald-50"><Plus className="h-4 w-4" /></button>
            </div>
            <span className="text-xs text-muted-foreground">{p.stock} pieces available</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 py-3 font-bold text-emerald-950 hover:bg-amber-300">Buy Now</button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"><ShoppingCart className="h-4 w-4" /> Add to Cart</button>
            <button className="grid h-12 w-12 place-items-center rounded-lg border border-border hover:border-rose-500 hover:text-rose-500"><Heart className="h-5 w-5" /></button>
            <button className="grid h-12 w-12 place-items-center rounded-lg border border-border hover:border-emerald-500"><Share2 className="h-5 w-5" /></button>
          </div>
        </div>

        {
    /* Right rail: vendor + delivery */
  }
        <aside className="space-y-4 md:col-span-2 lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Sold by</div>
            <Link href={`/vendor/${vendor.slug}`} className="mt-3 flex items-center gap-3">
              <img src={vendor.logo} className="h-12 w-12 rounded-lg object-cover" alt="" />
              <div className="min-w-0">
                <div className="flex items-center gap-1 font-semibold truncate">{vendor.name} {vendor.verified && <BadgeCheck className="h-4 w-4 text-emerald-600" />}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{vendor.rating} · {vendor.products} products</div>
              </div>
            </Link>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md bg-emerald-50 p-2"><div className="font-bold text-emerald-700">98%</div><div className="text-muted-foreground">Positive</div></div>
              <div className="rounded-md bg-emerald-50 p-2"><div className="font-bold text-emerald-700">2h</div><div className="text-muted-foreground">Response</div></div>
              <div className="rounded-md bg-emerald-50 p-2"><div className="font-bold text-emerald-700">99%</div><div className="text-muted-foreground">On-Time</div></div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="rounded-md border border-border py-2 text-xs font-semibold hover:bg-emerald-50 flex items-center justify-center gap-1"><MessageSquare className="h-3 w-3" /> Chat</button>
              <Link href={`/vendor/${vendor.slug}`} className="rounded-md bg-emerald-600 py-2 text-xs font-semibold text-white text-center hover:bg-emerald-700">Visit Store</Link>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-sm">
            <div className="font-semibold flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-600" /> Delivery Options</div>
            <div className="flex items-start gap-2 text-xs"><MapPin className="h-4 w-4 text-emerald-600 mt-0.5" /><div><div className="font-semibold">Dhaka, Mirpur 1207</div><button className="text-emerald-700 hover:underline">Change</button></div></div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded border border-border p-2"><span>Standard (3-5 days)</span><span className="font-semibold text-emerald-700">Free</span></div>
              <div className="flex items-center justify-between rounded border border-border p-2"><span>Express (1-2 days)</span><span className="font-semibold">৳120</span></div>
              <div className="flex items-center justify-between rounded border border-border p-2"><span>Cash on Delivery</span><span className="font-semibold text-emerald-700">Available</span></div>
            </div>
            <div className="space-y-2 border-t border-border pt-3 text-xs">
              <div className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-emerald-600" /> 7-Day easy returns</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> 1-year manufacturer warranty</div>
              <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" /> 100% authentic guarantee</div>
            </div>
          </div>
        </aside>
      </div>

      {
    /* Details tabs */
  }
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex gap-3 sm:gap-6 border-b border-border pb-3 text-sm font-semibold overflow-x-auto scrollbar-hide">
            <button className="border-b-2 border-emerald-600 pb-2 text-emerald-700">Description</button>
            <button className="text-muted-foreground">Specifications</button>
            <button className="text-muted-foreground">Reviews ({p.reviews.toLocaleString()})</button>
            <button className="text-muted-foreground">Q&A</button>
          </div>
          <div className="prose prose-sm mt-4 max-w-none text-muted-foreground">
            <p>Experience uncompromising quality with the <strong>{p.title}</strong>. Engineered for performance and built to last, this product delivers exceptional value at a price that won't break the bank.</p>
            <p>Sourced directly from authorized distributors and backed by our 100% authenticity guarantee. Every item is quality-checked before dispatch.</p>
            <ul>
              <li>Premium-grade materials with rigorous quality control</li>
              <li>1-year manufacturer warranty included</li>
              <li>Free shipping nationwide on orders over ৳999</li>
              <li>7-day easy returns, no questions asked</li>
              <li>24/7 customer support via chat and phone</li>
            </ul>
          </div>

          <div id="reviews" className="mt-8 border-t border-border pt-6">
            <h3 className="font-display text-xl font-bold mb-4">Customer Reviews</h3>
            <div className="grid gap-6 md:grid-cols-[200px_1fr]">
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-700">{p.rating.toFixed(1)}</div>
                <div className="text-amber-400">{"\u2605".repeat(Math.round(p.rating))}</div>
                <div className="text-xs text-muted-foreground">{p.reviews.toLocaleString()} reviews</div>
              </div>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((r) => <div key={r} className="flex items-center gap-2 text-xs">
                    <span className="w-6">{r}★</span>
                    <div className="h-2 flex-1 rounded-full bg-muted"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${r === 5 ? 78 : r === 4 ? 15 : 3}%` }} /></div>
                    <span className="w-10 text-right text-muted-foreground">{r === 5 ? 78 : r === 4 ? 15 : 3}%</span>
                  </div>)}
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[
    { n: "Sarah K.", r: 5, t: "2 days ago", c: "Absolutely love it! Exceeded my expectations. Build quality is solid and delivery was super fast." },
    { n: "Rahim H.", r: 4, t: "1 week ago", c: "Great value for the price. Minor issue with packaging but the product itself is fantastic." },
    { n: "Mona F.", r: 5, t: "3 weeks ago", c: "Bought as a gift and the recipient was thrilled. Will buy from this vendor again." }
  ].map((r, i) => <div key={i} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">{r.n[0]}</div><div><div className="text-sm font-semibold">{r.n}</div><div className="text-amber-400 text-xs">{"\u2605".repeat(r.r)}</div></div></div>
                    <span className="text-xs text-muted-foreground">{r.t}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.c}</p>
                </div>)}
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="font-semibold mb-3 text-sm">Frequently Bought Together</div>
            {products.slice(0, 3).map((x) => <Link key={x.id} href={`/product/${x.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-emerald-50">
                <img src={x.image} className="h-14 w-14 rounded-md object-cover" alt="" />
                <div className="min-w-0 flex-1"><div className="text-xs font-medium line-clamp-2">{x.title}</div><div className="text-sm font-bold text-emerald-700">৳{x.price.toLocaleString()}</div></div>
              </Link>)}
          </div>
        </aside>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 font-display text-xl font-bold flex items-center justify-between">Related Products <Link href="/shop" className="text-sm font-semibold text-emerald-700 flex items-center gap-1">More <ChevronRight className="h-4 w-4" /></Link></h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {related.map((rp) => <ProductCard key={rp.id} p={rp} />)}
        </div>
      </section>
    </div>;
}
export {
  ProductPage as default
};
