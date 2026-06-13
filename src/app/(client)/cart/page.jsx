import Link from "next/link";
import { products } from "@/lib/shop-data";
import { Trash2, Plus, Minus, Truck, Tag, ShieldCheck } from "lucide-react";
function Cart() {
  const items = products.slice(0, 3).map((p, i) => ({ ...p, qty: i + 1 }));
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = 0;
  const discount = 320;
  const total = subtotal + shipping - discount;
  return <div className="container-x py-6">
      <nav className="mb-4 text-xs text-muted-foreground"><Link href="/" className="hover:text-primary">Home</Link> / <span className="text-foreground">Shopping Cart</span></nav>
      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-4">Shopping Cart <span className="text-muted-foreground text-base font-normal">({items.length} items)</span></h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">
              <input type="checkbox" defaultChecked className="accent-emerald-600" /> Select All ({items.length} items)
              <button className="ml-auto text-xs text-rose-600 hover:underline">Remove Selected</button>
            </div>
            {items.map((it) => <div key={it.id} className="flex flex-wrap gap-4 border-b border-border p-4 last:border-b-0">
                <input type="checkbox" defaultChecked className="mt-2 accent-emerald-600" />
                <img src={it.image} className="h-16 w-16 sm:h-24 sm:w-24 rounded-lg object-cover flex-shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${it.id}`} className="font-medium hover:text-primary line-clamp-2">{it.title}</Link>
                  <div className="mt-1 text-xs text-muted-foreground">Sold by <span className="text-emerald-700 font-semibold">{it.vendor.name}</span></div>
                  <div className="mt-1 text-xs text-muted-foreground">Size: M · Color: Forest Green</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-emerald-700">৳{it.price.toLocaleString()}</span>
                    {it.oldPrice && <span className="text-xs text-muted-foreground line-through">৳{it.oldPrice.toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between gap-2">
                  <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                  <div className="flex items-center rounded-md border border-border">
                    <button className="grid h-8 w-8 place-items-center hover:bg-emerald-50"><Minus className="h-3 w-3" /></button>
                    <span className="w-10 text-center text-sm font-semibold">{it.qty}</span>
                    <button className="grid h-8 w-8 place-items-center hover:bg-emerald-50"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>)}
          </div>

          <div className="rounded-xl border border-border bg-emerald-50 p-4 flex items-center gap-3 text-sm">
            <Truck className="h-5 w-5 text-emerald-700" />
            Add ৳{Math.max(0, 999 - subtotal).toLocaleString()} more for <b>FREE delivery</b>! 🎉
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-32 h-fit">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display text-lg font-bold mb-4">Order Summary</h3>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-emerald-600" />
              <input className="flex-1 rounded-md border border-border px-3 py-2 text-sm" placeholder="Promo code" />
              <button className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Apply</button>
            </div>
            <div className="space-y-2 border-t border-border pt-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-emerald-700 font-semibold">FREE</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-emerald-700">-৳{discount}</span></div>
              <div className="flex justify-between border-t border-border pt-3 text-lg font-bold"><span>Total</span><span className="text-emerald-700">৳{total.toLocaleString()}</span></div>
            </div>
            <Link href="/checkout" className="mt-4 block w-full rounded-lg bg-amber-400 py-3 text-center font-bold text-emerald-950 hover:bg-amber-300">Proceed to Checkout →</Link>
            <Link href="/shop" className="mt-2 block w-full rounded-lg border border-border py-3 text-center text-sm font-semibold hover:bg-emerald-50">Continue Shopping</Link>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure SSL Checkout</div>
          </div>
        </aside>
      </div>
    </div>;
}
export {
  Cart as default
};
