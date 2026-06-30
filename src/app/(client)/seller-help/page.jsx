export const metadata = {
  title: 'Seller Help | Moom24',
  description: 'Resources, guides, and support for Moom24 sellers.',
  alternates: { canonical: 'https://www.moom24.com/seller-help' },
};

const TOPICS = [
  {
    icon: '🚀',
    title: 'Getting Started',
    links: ['Create your seller account', 'Verify your identity', 'Set up your store profile', 'List your first product'],
  },
  {
    icon: '📦',
    title: 'Managing Products',
    links: ['Add and edit listings', 'Upload product images', 'Set variants and pricing', 'Manage stock levels'],
  },
  {
    icon: '🛒',
    title: 'Orders & Fulfilment',
    links: ['Process incoming orders', 'Print shipping labels', 'Handle cancellations', 'Mark orders as shipped'],
  },
  {
    icon: '💰',
    title: 'Payments & Payouts',
    links: ['Understand commission rates', 'Set up payout method', 'View earnings history', 'Raise a payout dispute'],
  },
  {
    icon: '⭐',
    title: 'Reviews & Reputation',
    links: ['Respond to customer reviews', 'Improve your seller rating', 'Handle return requests', 'Dispute unfair reviews'],
  },
  {
    icon: '📣',
    title: 'Promotions & Ads',
    links: ['Join Flash Sales', 'Create coupons for your shop', 'Boost product visibility', 'Run sponsored ads'],
  },
];

export default function SellerHelp() {
  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-20 text-white">
        <div className="container-x text-center">
          <h1 className="font-display text-5xl font-extrabold">Seller Help Center</h1>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
            Everything you need to grow your business on Moom24.
          </p>
          <div className="mt-8 mx-auto max-w-md flex">
            <input className="flex-1 rounded-l-xl px-5 py-3 text-sm text-gray-900 outline-none" placeholder="Search seller guides…" />
            <button className="rounded-r-xl bg-amber-400 px-6 font-semibold text-emerald-900 hover:bg-amber-300">Search</button>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Browse Topics</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-border bg-card p-6 hover:border-emerald-400 transition-colors">
              <div className="text-3xl mb-3">{t.icon}</div>
              <h3 className="font-display text-lg font-bold mb-3">{t.title}</h3>
              <ul className="space-y-2">
                {t.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-emerald-600 hover:underline">→ {l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-emerald-50 py-14">
        <div className="container-x grid gap-8 md:grid-cols-3 text-center">
          {[
            { i: '💬', t: 'Seller Community', d: 'Join 50,000+ sellers sharing tips and strategies on our community forum.', cta: 'Visit Forum' },
            { i: '📞', t: 'Dedicated Seller Support', d: 'Sellers get priority support via phone and live chat, 7 days a week.', cta: 'Call Now' },
            { i: '🎓', t: 'Seller Academy', d: 'Free video courses on photography, pricing, SEO, and growing your store.', cta: 'Start Learning' },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border bg-white p-6">
              <div className="text-4xl mb-3">{c.i}</div>
              <h3 className="font-display font-bold mb-2">{c.t}</h3>
              <p className="text-sm text-muted-foreground mb-4">{c.d}</p>
              <button className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700">{c.cta}</button>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-10 text-center">
        <p className="text-muted-foreground">
          New to Moom24?{' '}
          <a href="/become-seller" className="text-emerald-600 hover:underline font-medium">Start selling today →</a>
        </p>
      </section>
    </div>
  );
}
