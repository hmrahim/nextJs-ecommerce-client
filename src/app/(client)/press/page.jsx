export const metadata = {
  title: 'Press | Moom24',
  description: 'Media resources, press releases, and contact information for journalists covering Moom24.',
  alternates: { canonical: 'https://www.moom24.com/press' },
};

const RELEASES = [
  {
    date: 'June 2025',
    title: 'Moom24 Reaches 8 Million Customers, Announces SAR 500M Series C Funding',
    outlet: 'Moom24 Blog',
  },
  {
    date: 'March 2025',
    title: 'Moom24 Launches Carbon-Neutral Delivery Network Across 64 Districts',
    outlet: 'Moom24 Blog',
  },
  {
    date: 'Jan 2025',
    title: 'Moom24 Partners with bKash to Enable Instant Seller Payouts',
    outlet: 'Moom24 Blog',
  },
  {
    date: 'Oct 2024',
    title: 'Moom24 Flash Sale Platform Hits 200,000 Concurrent Shoppers Record',
    outlet: 'Moom24 Blog',
  },
];

const COVERAGE = [
  { outlet: 'TechCrunch', headline: '"The Amazon of South Asia is quietly winning"', date: 'May 2025' },
  { outlet: 'The Daily Star', headline: '"Moom24 creates 120,000 seller livelihoods"', date: 'Apr 2025' },
  { outlet: 'Forbes Asia', headline: '"30 Under 30: Moom24\'s Founders"', date: 'Feb 2025' },
  { outlet: 'Bloomberg', headline: '"E-commerce boom reshapes Bangladesh retail"', date: 'Dec 2024' },
];

export default function Press() {
  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-20 text-white text-center">
        <div className="container-x">
          <h1 className="font-display text-5xl font-extrabold">Press & Media</h1>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
            Resources for journalists, analysts, and media covering Moom24 and the South Asian ecommerce landscape.
          </p>
        </div>
      </section>

      <section className="container-x py-16 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold mb-6">Press Releases</h2>
          <div className="space-y-4">
            {RELEASES.map((r) => (
              <div key={r.title} className="rounded-xl border border-border bg-card p-5 hover:border-emerald-400 transition-colors cursor-pointer">
                <div className="text-xs text-muted-foreground mb-1">{r.date} · {r.outlet}</div>
                <div className="font-display font-semibold leading-snug">{r.title}</div>
                <a href="#" className="mt-2 inline-block text-sm text-emerald-600 hover:underline">Read more →</a>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold mb-6">Moom24 in the News</h2>
          <div className="space-y-4">
            {COVERAGE.map((c) => (
              <div key={c.headline} className="rounded-xl border border-border bg-card p-5">
                <div className="text-xs font-bold uppercase tracking-wide text-emerald-600 mb-1">{c.outlet} · {c.date}</div>
                <div className="font-display font-semibold italic">{c.headline}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-50 py-14">
        <div className="container-x max-w-2xl text-center mx-auto">
          <h2 className="font-display text-2xl font-bold mb-3">Media Contact</h2>
          <p className="text-muted-foreground mb-6">
            For press enquiries, interview requests, or hi-res brand assets, reach out to our communications team.
            We aim to respond within 4 hours on weekdays.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:press@moom24.com" className="rounded-xl bg-emerald-600 px-7 py-3 font-semibold text-white hover:bg-emerald-700">
              press@moom24.com
            </a>
            <a href="/contact" className="rounded-xl border border-border bg-white px-7 py-3 font-semibold hover:border-emerald-400">
              Contact Form
            </a>
          </div>

          <div className="mt-10">
            <h3 className="font-display font-bold mb-4">Download Brand Assets</h3>
            <div className="flex gap-3 justify-center flex-wrap">
              {['Logo (SVG)', 'Logo (PNG)', 'Brand Guidelines', 'Product Screenshots'].map((a) => (
                <button key={a} className="rounded-lg border border-border bg-white px-4 py-2 text-sm hover:border-emerald-400 transition-colors">
                  ⬇ {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
