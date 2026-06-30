export const metadata = {
  title: 'Advertise on Moom24 | Reach 8M+ Shoppers',
  description: 'Grow your brand on Moom24 with targeted sponsored listings, banner ads, and flash sale features.',
  alternates: { canonical: 'https://www.moom24.com/advertise' },
};

const AD_PRODUCTS = [
  {
    name: 'Sponsored Products',
    icon: '📦',
    desc: 'Appear at the top of search results and category pages. Pay only when shoppers click.',
    from: 'From SAR 0.50 / click',
  },
  {
    name: 'Banner Ads',
    icon: '🖼️',
    desc: 'Premium placements on the homepage, category banners, and Flash Sale pages.',
    from: 'From SAR 5,000 / week',
  },
  {
    name: 'Flash Sale Features',
    icon: '⚡',
    desc: "Feature your deals during Moom24's high-traffic flash sale events for massive exposure.",
    from: 'Contact for pricing',
  },
  {
    name: 'Email & Push Campaigns',
    icon: '📧',
    desc: 'Reach targeted segments of our 8M+ customer base with personalised promotions.',
    from: 'From SAR 3,000 / campaign',
  },
];

const STATS = [
  { v: '8M+', l: 'Monthly active shoppers' },
  { v: '4.2x', l: 'Average ROAS for sponsored ads' },
  { v: '64', l: 'Districts covered' },
  { v: '12M+', l: 'Products discovered daily' },
];

export default function Advertise() {
  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-20 text-white text-center">
        <div className="container-x">
          <span className="inline-block rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-emerald-900 mb-4">ADVERTISING</span>
          <h1 className="font-display text-5xl font-extrabold">Reach Millions of Shoppers</h1>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
            Put your brand in front of 8 million ready-to-buy customers with Moom24's suite of advertising solutions.
          </p>
          <a href="#contact" className="mt-8 inline-block rounded-full bg-amber-400 px-8 py-3 font-bold text-emerald-900 hover:bg-amber-300">
            Get Started →
          </a>
        </div>
      </section>

      <section className="bg-emerald-50 py-12">
        <div className="container-x grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <div className="font-display text-4xl font-extrabold text-emerald-700">{s.v}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Advertising Solutions</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {AD_PRODUCTS.map((a) => (
            <div key={a.name} className="rounded-2xl border border-border bg-card p-6 hover:border-emerald-400 transition-colors">
              <div className="text-4xl mb-3">{a.icon}</div>
              <h3 className="font-display text-xl font-bold">{a.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
              <div className="mt-4 font-semibold text-emerald-600 text-sm">{a.from}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="bg-emerald-50 py-14">
        <div className="container-x max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-2">Talk to our Advertising Team</h2>
          <p className="text-center text-muted-foreground mb-8">Tell us about your brand and we'll design a campaign that hits your goals.</p>
          <div className="rounded-2xl border border-border bg-white p-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Your name" />
              <input className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Company name" />
              <input className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Work email" />
              <input className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Monthly budget (SAR)" />
            </div>
            <select className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none">
              <option>What are you interested in?</option>
              <option>Sponsored Products</option>
              <option>Banner Ads</option>
              <option>Flash Sale Features</option>
              <option>Email & Push Campaigns</option>
              <option>All of the above</option>
            </select>
            <textarea rows={4} className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Tell us about your brand and campaign goals…" />
            <button className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700">
              Submit Enquiry
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}