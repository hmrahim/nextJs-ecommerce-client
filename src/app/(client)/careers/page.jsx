export const metadata = {
  title: 'Careers | Moom24',
  description: 'Join the Moom24 team and help build the future of ecommerce in South Asia.',
  alternates: { canonical: 'https://www.moom24.com/careers' },
};

const OPENINGS = [
  { dept: 'Engineering', title: 'Senior Frontend Engineer', loc: 'Dhaka (Hybrid)', type: 'Full-time' },
  { dept: 'Engineering', title: 'Backend Engineer – Payments', loc: 'Dhaka (Hybrid)', type: 'Full-time' },
  { dept: 'Product', title: 'Product Manager – Seller Experience', loc: 'Dhaka / Remote', type: 'Full-time' },
  { dept: 'Design', title: 'Senior UX Designer', loc: 'Dhaka (Hybrid)', type: 'Full-time' },
  { dept: 'Operations', title: 'Logistics Operations Lead', loc: 'Chittagong', type: 'Full-time' },
  { dept: 'Marketing', title: 'Growth Marketing Manager', loc: 'Dhaka (Hybrid)', type: 'Full-time' },
  { dept: 'Support', title: 'Customer Experience Specialist', loc: 'Remote', type: 'Part-time' },
];

const PERKS = [
  { i: '💰', t: 'Competitive Pay', d: 'Market-leading salaries + equity for senior roles.' },
  { i: '🌿', t: 'Green Office', d: 'Solar-powered HQ, free EV charging, plant-rich workspace.' },
  { i: '🏖️', t: 'Generous Leave', d: '30 days annual leave + your birthday off, always.' },
  { i: '📚', t: 'Learning Budget', d: 'BDT 50,000/year for courses, books, and conferences.' },
  { i: '🏥', t: 'Health Coverage', d: 'Full family medical + dental, no premiums.' },
  { i: '🍔', t: 'Daily Meals', d: 'Free lunch at HQ, delivery credit if you work remotely.' },
];

export default function Careers() {
  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-20 text-white text-center">
        <div className="container-x">
          <h1 className="font-display text-5xl font-extrabold">Come build with us</h1>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
            Moom24 is growing fast and we're looking for curious, kind people who love solving real problems.
            Join 400+ team members across Bangladesh and beyond.
          </p>
          <a href="#openings" className="mt-8 inline-block rounded-full bg-amber-400 px-8 py-3 font-bold text-emerald-900 hover:bg-amber-300">
            See Open Roles ↓
          </a>
        </div>
      </section>

      <section className="bg-emerald-50 py-14">
        <div className="container-x grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { v: '400+', l: 'Team members' },
            { v: '12', l: 'Countries represented' },
            { v: '4.7★', l: 'Glassdoor rating' },
            { v: '92%', l: 'Would recommend us' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <div className="font-display text-4xl font-extrabold text-emerald-700">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Perks & Benefits</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PERKS.map((p) => (
            <div key={p.t} className="rounded-2xl border border-border bg-card p-6">
              <div className="text-4xl">{p.i}</div>
              <h3 className="mt-3 font-display text-lg font-bold">{p.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="openings" className="container-x py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Open Positions</h2>
        <div className="space-y-3">
          {OPENINGS.map((o) => (
            <div key={o.title} className="flex items-center justify-between rounded-xl border border-border bg-card px-6 py-4 hover:border-emerald-400 transition-colors">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{o.dept}</span>
                <div className="font-display font-bold mt-0.5">{o.title}</div>
                <div className="text-sm text-muted-foreground">{o.loc} · {o.type}</div>
              </div>
              <button className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                Apply
              </button>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't see your role?{' '}
          <a href="/contact" className="text-emerald-600 hover:underline">Send us your CV anyway</a> — we'd love to meet you.
        </p>
      </section>
    </div>
  );
}
