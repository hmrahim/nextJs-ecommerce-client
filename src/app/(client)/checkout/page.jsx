import { products } from "@/lib/shop-data";
import { CreditCard, Wallet, Banknote, Truck, ShieldCheck, MapPin } from "lucide-react";
function Checkout() {
  const items = products.slice(0, 3);
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  return <div className="container-x py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-xl sm:text-3xl font-bold">Checkout</h1>
        <div className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-hide">
          {["Cart", "Information", "Payment", "Confirm"].map((s, i) => <div key={s} className="flex items-center gap-1 whitespace-nowrap">
              <div className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${i <= 1 ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
              <span className={`hidden sm:inline ${i <= 1 ? "font-semibold" : "text-muted-foreground"}`}>{s}</span>
              {i < 3 && <span className="text-muted-foreground text-xs">›</span>}
            </div>)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Section title="Contact Information" icon="📧">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Email" placeholder="you@example.com" />
              <Field label="Phone" placeholder="+880 1XXX-XXXXXX" />
            </div>
          </Section>

          <Section title="Shipping Address" icon={<MapPin className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First Name" />
              <Field label="Last Name" />
              <Field label="Address" full placeholder="House #, Road, Area" />
              <Field label="City" placeholder="Dhaka" />
              <Field label="Postal Code" placeholder="1207" />
              <Field label="Country" placeholder="Bangladesh" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-full border-2 border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">🏠 Home</button>
              <button className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-emerald-600">🏢 Office</button>
              <button className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-emerald-600">+ New Address</button>
            </div>
          </Section>

          <Section title="Delivery Method" icon={<Truck className="h-5 w-5" />}>
            <div className="space-y-2">
              {[
    { n: "Standard Delivery", t: "3-5 business days", p: "FREE", checked: true },
    { n: "Express Delivery", t: "1-2 business days", p: "\u09F3120" },
    { n: "Same-Day Delivery", t: "Order before 12 PM", p: "\u09F3200" }
  ].map((d) => <label key={d.n} className={`flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer ${d.checked ? "border-emerald-600 bg-emerald-50" : "hover:border-emerald-300"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="delivery" defaultChecked={d.checked} className="accent-emerald-600" />
                    <div><div className="font-semibold text-sm">{d.n}</div><div className="text-xs text-muted-foreground">{d.t}</div></div>
                  </div>
                  <span className="font-bold text-emerald-700">{d.p}</span>
                </label>)}
            </div>
          </Section>

          <Section title="Payment Method" icon={<CreditCard className="h-5 w-5" />}>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
    { i: <CreditCard className="h-5 w-5" />, n: "Credit / Debit Card", checked: true },
    { i: <Wallet className="h-5 w-5" />, n: "bKash / Nagad / Rocket" },
    { i: <Banknote className="h-5 w-5" />, n: "Cash on Delivery" },
    { i: "\u{1F3E6}", n: "Bank Transfer" }
  ].map((p) => <label key={p.n} className={`flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer ${p.checked ? "border-emerald-600 bg-emerald-50" : "hover:border-emerald-300"}`}>
                  <input type="radio" name="pay" defaultChecked={p.checked} className="accent-emerald-600" />
                  <span className="text-emerald-700">{p.i}</span>
                  <span className="font-semibold text-sm">{p.n}</span>
                </label>)}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Card Number" placeholder="1234 5678 9012 3456" full />
              <Field label="Expiry" placeholder="MM / YY" />
              <Field label="CVV" placeholder="•••" />
            </div>
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-32 h-fit">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display text-lg font-bold mb-4">Your Order</h3>
            <div className="space-y-3 border-b border-border pb-3">
              {items.map((it) => <div key={it.id} className="flex gap-3">
                  <div className="relative">
                    <img src={it.image} className="h-14 w-14 rounded-md object-cover" alt="" />
                    <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">1</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium line-clamp-2">{it.title}</div>
                    <div className="text-xs text-muted-foreground">{it.vendor.name}</div>
                  </div>
                  <div className="text-sm font-bold whitespace-nowrap">৳{it.price.toLocaleString()}</div>
                </div>)}
            </div>
            <div className="space-y-2 py-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-emerald-700 font-semibold">FREE</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>৳0</span></div>
              <div className="flex justify-between border-t border-border pt-2 text-lg font-bold"><span>Total</span><span className="text-emerald-700">৳{subtotal.toLocaleString()}</span></div>
            </div>
            <button className="mt-2 w-full rounded-lg bg-amber-400 py-3 font-bold text-emerald-950 hover:bg-amber-300">Place Order →</button>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600" /> 256-bit SSL Encrypted</div>
          </div>
        </aside>
      </div>
    </div>;
}
function Section({ title, icon, children }) {
  return <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700">{icon}</span>
        {title}
      </h2>
      {children}
    </div>;
}
function Field({ label, placeholder, full }) {
  return <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <input className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500" placeholder={placeholder || label} />
    </div>;
}
export {
  Checkout as default
};
