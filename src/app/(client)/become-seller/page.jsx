import { CheckCircle2, TrendingUp, Globe, Headphones, Truck, BarChart3, Wallet, ArrowRight } from "lucide-react";


export const metadata = {
  title: 'Become a Seller | Moom24',
  description: 'Start selling on Moom24 marketplace. Reach millions of customers in Saudi Arabia.',
  alternates: { canonical: 'https://www.moom24.com/become-seller' },
};
function BecomeSeller() {
  return <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 py-20 text-white">
        <div className="container-x grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="chip">For Businesses</span>
            <h1 className="mt-3 font-display text-5xl font-extrabold leading-tight">Grow your business with <span className="text-amber-300">Moom24</span></h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-100">Reach millions of customers across 64 districts. Open a store in 5 minutes, ship from anywhere, get paid weekly.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-amber-400 px-8 py-3.5 font-bold text-emerald-950 hover:bg-amber-300">Start Selling Today →</button>
              <button className="rounded-full border border-border border-white/30 bg-white/10 px-8 py-3.5 font-semibold backdrop-blur hover:bg-white/20">Watch Demo</button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              {["No setup fees", "Low commission", "Weekly payouts", "Free training"].map((f) => <span key={f} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-amber-300" />{f}</span>)}
            </div>
          </div>
          <div className="rounded-2xl border border-border border-white/20 bg-white/10 p-6 backdrop-blur">
            <h3 className="font-display text-xl font-bold mb-4">Quick Application</h3>
            <div className="space-y-3">
              <input className="w-full rounded-md bg-white/95 px-4 py-3 text-sm text-foreground" placeholder="Your business name" />
              <input className="w-full rounded-md bg-white/95 px-4 py-3 text-sm text-foreground" placeholder="Email address" />
              <input className="w-full rounded-md bg-white/95 px-4 py-3 text-sm text-foreground" placeholder="Phone number" />
              <select className="w-full rounded-md bg-white/95 px-4 py-3 text-sm text-foreground"><option>Primary category</option><option>Electronics</option><option>Fashion</option><option>Groceries</option></select>
              <button className="w-full rounded-md bg-amber-400 py-3 font-bold text-emerald-950 hover:bg-amber-300">Create Free Account</button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
    { v: "50K+", l: "Active Sellers" },
    { v: "12M+", l: "Products" },
    { v: "\u09F350B+", l: "GMV in 2025" },
    { v: "8M+", l: "Buyers" }
  ].map((s) => <div key={s.l} className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="font-display text-4xl font-extrabold text-emerald-700">{s.v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </div>)}
        </div>
      </section>

      <section className="container-x py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl font-bold">Why sell with us?</h2>
          <p className="mt-2 text-muted-foreground">Everything you need to run a successful online business.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
    { i: TrendingUp, t: "Reach Millions", d: "Tap into our 8M+ active buyers across the country with zero marketing cost." },
    { i: Wallet, t: "Low Commission", d: "Industry-best rates starting at just 5%. No hidden fees, ever." },
    { i: Truck, t: "End-to-End Logistics", d: "Pickup from your doorstep, delivery to the customer. We handle it all." },
    { i: BarChart3, t: "Powerful Dashboard", d: "Real-time analytics, inventory tools and AI-driven insights to grow." },
    { i: Headphones, t: "Dedicated Support", d: "Personal account manager + 24/7 seller helpdesk in your language." },
    { i: Globe, t: "Multi-channel Selling", d: "List once, sell across web, app and partner marketplaces." }
  ].map((f) => <div key={f.t} className="rounded-2xl border border-border bg-card p-6 card-hover">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><f.i className="h-6 w-6" /></div>
              <h3 className="mt-4 font-display text-lg font-bold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>)}
        </div>
      </section>

      <section className="bg-emerald-50 py-16">
        <div className="container-x">
          <h2 className="text-center font-display text-4xl font-bold mb-10">Start selling in 4 simple steps</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {[
    { n: "01", t: "Register", d: "Sign up with your business details in 5 minutes." },
    { n: "02", t: "List Products", d: "Upload product catalog using our bulk tools." },
    { n: "03", t: "Receive Orders", d: "Start getting orders from millions of buyers." },
    { n: "04", t: "Ship & Earn", d: "We pickup, deliver, and pay you weekly." }
  ].map((s) => <div key={s.n} className="relative rounded-2xl border-2 border-dashed border-emerald-300 bg-white p-6">
                <div className="absolute -top-4 left-6 grid h-9 w-fit place-items-center rounded-full bg-emerald-600 px-3 text-xs font-bold text-white">STEP {s.n}</div>
                <h3 className="mt-3 font-display text-xl font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>)}
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-900 p-10 text-center text-white">
          <h2 className="font-display text-3xl font-bold">Ready to join 50,000+ sellers?</h2>
          <p className="mt-2 text-emerald-100">No setup fees. No monthly charges. Just success.</p>
          <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-3.5 font-bold text-emerald-950 hover:bg-amber-300">Open Your Store Now <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>
    </div>;
}
export {
  BecomeSeller as default
};
