function About() {
  return <div>
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-20 text-white">
        <div className="container-x text-center">
          <h1 className="font-display text-5xl font-extrabold">Building the future of commerce, sustainably</h1>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-100">GreenMart connects millions of buyers with verified sellers across South Asia. Founded in 2018, we're on a mission to make ecommerce fair, fast, and green.</p>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <img src="https://picsum.photos/seed/about-1/900/600" alt="" className="rounded-2xl" />
          <div>
            <span className="chip">Our Story</span>
            <h2 className="mt-3 font-display text-3xl font-bold">From a small idea to a national marketplace</h2>
            <p className="mt-4 text-muted-foreground">Started in a Dhaka garage with 3 founders and 12 products, GreenMart now serves 8 million customers across 64 districts, partnering with 50,000+ vendors from local artisans to global brands.</p>
            <p className="mt-3 text-muted-foreground">We believe ecommerce should empower small businesses, delight customers, and respect the planet — and every decision we make is rooted in those three values.</p>
          </div>
        </div>
      </section>

      <section className="bg-emerald-50 py-16">
        <div className="container-x grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
    { v: "8M+", l: "Happy customers" },
    { v: "50K+", l: "Vendors" },
    { v: "64", l: "Districts" },
    { v: "12M+", l: "Products" }
  ].map((s) => <div key={s.l} className="rounded-2xl bg-white p-6 text-center">
              <div className="font-display text-4xl font-extrabold text-emerald-700">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>)}
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Our Values</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
    { i: "\u{1F331}", t: "Sustainability First", d: "Carbon-neutral shipping, reusable packaging, plant-a-tree partnership on every order over \u09F32000." },
    { i: "\u{1F91D}", t: "Fair to Sellers", d: "Industry-best commission rates, weekly payouts, and free seller education for everyone." },
    { i: "\u{1F49A}", t: "Customer Obsession", d: "7-day returns, 24/7 support, and a 100% authentic guarantee on every product." }
  ].map((v) => <div key={v.t} className="rounded-2xl border border-border bg-card p-6">
              <div className="text-4xl">{v.i}</div>
              <h3 className="mt-3 font-display text-xl font-bold">{v.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
            </div>)}
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Leadership Team</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {["Ahmed Rahman", "Fatima Hossain", "Karim Sheikh", "Nadia Akter"].map((n, i) => <div key={n} className="rounded-2xl border border-border bg-card p-5 text-center">
              <img src={`https://picsum.photos/seed/team-${i}/200/200`} className="mx-auto h-24 w-24 rounded-full object-cover" alt="" />
              <div className="mt-3 font-display font-bold">{n}</div>
              <div className="text-xs text-muted-foreground">{["CEO & Co-founder", "COO", "CTO", "CMO"][i]}</div>
            </div>)}
        </div>
      </section>
    </div>;
}
export {
  About as default
};
