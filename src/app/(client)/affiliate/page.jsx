export const metadata = {
  title: 'Affiliate Program | Moom24',
  description: 'Earn commission by promoting Moom24 products. Join thousands of affiliates already earning.',
  alternates: { canonical: 'https://www.moom24.com/affiliate' },
};

const HOW_IT_WORKS = [
  { n: '01', t: 'Sign Up Free', d: 'Create your affiliate account in under 2 minutes. No approval wait time.' },
  { n: '02', t: 'Share Links', d: 'Get unique tracking links for any product, category, or flash sale on Moom24.' },
  { n: '03', t: 'Drive Traffic', d: 'Share on your blog, YouTube, Instagram, TikTok, or wherever your audience is.' },
  { n: '04', t: 'Earn Commission', d: 'Earn 3–12% on every sale made through your link, paid weekly.' },
];

const TIERS = [
  { tier: 'Starter', sales: '0–50 sales/mo', rate: '3–5%', perks: ['Access to all product links', 'Monthly payment', 'Basic dashboard'] },
  { tier: 'Silver', sales: '51–200 sales/mo', rate: '6–8%', perks: ['Everything in Starter', 'Weekly payment', 'Priority support', 'Exclusive coupon codes'] },
  { tier: 'Gold', sales: '200+ sales/mo', rate: '9–12%', perks: ['Everything in Silver', 'Same-day payment', 'Dedicated account manager', 'Early access to flash sales', 'Co-marketing opportunities'] },
];

export default function Affiliate() {
  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-20 text-white text-center">
        <div className="container-x">
          <span className="inline-block rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-emerald-900 mb-4">AFFILIATE PROGRAM</span>
          <h1 className="font-display text-5xl font-extrabold">Earn While You Share</h1>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
            Join 15,000+ affiliates earning up to 12% commission on every sale. No minimums. Payments every week.
          </p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <button className="rounded-full bg-amber-400 px-8 py-3 font-bold text-emerald-900 hover:bg-amber-300">Join for Free</button>
            <a href="#tiers" className="rounded-full border border-white/40 px-8 py-3 font-bold text-white hover:bg-white/10">See Rates ↓</a>
          </div>
        </div>
      </section>

      <section className="bg-emerald-50 py-12">
        <div className="container-x grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { v: '15K+', l: 'Active affiliates' },
            { v: 'SAR 2.3M', l: 'Paid out this year' },
            { v: 'Up to 12%', l: 'Commission rate' },
            { v: 'Weekly', l: 'Payout frequency' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <div className="font-display text-3xl font-extrabold text-emerald-700">{s.v}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="font-display text-5xl font-extrabold text-emerald-200 mb-3">{s.n}</div>
              <h3 className="font-display text-lg font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tiers" className="bg-emerald-50 py-16">
        <div className="container-x">
          <h2 className="font-display text-3xl font-bold text-center mb-10">Commission Tiers</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {TIERS.map((t, i) => (
              <div key={t.tier} className={`rounded-2xl border p-6 ${i === 2 ? 'border-amber-400 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white' : 'border-border bg-white'}`}>
                {i === 2 && <div className="mb-3 inline-block rounded-full bg-amber-400 px-3 py-0.5 text-xs font-bold text-emerald-900">BEST RATE</div>}
                <div className={`font-display text-2xl font-extrabold ${i === 2 ? 'text-amber-400' : 'text-emerald-700'}`}>{t.rate}</div>
                <div className="font-display text-xl font-bold mt-1">{t.tier}</div>
                <div className={`text-xs mt-1 ${i === 2 ? 'text-emerald-200' : 'text-muted-foreground'}`}>{t.sales}</div>
                <ul className="mt-5 space-y-2">
                  {t.perks.map((p) => (
                    <li key={p} className={`text-sm flex gap-2 ${i === 2 ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                      <span className={i === 2 ? 'text-amber-400' : 'text-emerald-600'}>✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <button className={`mt-6 w-full rounded-lg py-2.5 font-semibold text-sm ${i === 2 ? 'bg-amber-400 text-emerald-900 hover:bg-amber-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-14 text-center">
        <h2 className="font-display text-2xl font-bold mb-3">Ready to start earning?</h2>
        <p className="text-muted-foreground mb-6">Sign up free and share your first link in under 5 minutes.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700">Create Affiliate Account</button>
          <a href="/contact" className="rounded-xl border border-border px-8 py-3 font-semibold hover:border-emerald-400">Talk to Us</a>
        </div>
      </section>
    </div>
  );
}
