export const metadata = {
  title: 'Returns & Refunds | Moom24',
  description: 'Learn about Moom24\'s easy 7-day return policy and how to start a return.',
  alternates: { canonical: 'https://www.moom24.com/returns' },
};

const STEPS = [
  { n: '01', t: 'Initiate Return', d: 'Go to My Orders, select the item, and tap "Return Item" within 7 days of delivery.' },
  { n: '02', t: 'Pack the Item', d: 'Place the item in its original packaging with all tags attached and accessories included.' },
  { n: '03', t: 'Schedule Pickup', d: 'Choose a free courier pickup from your address or drop off at a Moom24 point.' },
  { n: '04', t: 'Refund Processed', d: 'Once we inspect the item (1–2 days), your refund is issued within 3–5 business days.' },
];

const FAQS = [
  { q: 'How long do I have to return an item?', a: '7 days from the delivery date for most items. Some categories like fresh food are non-returnable.' },
  { q: 'Is return shipping free?', a: 'Yes — for all eligible returns, we offer a free home pickup or drop-off at our partner locations.' },
  { q: 'When will I get my refund?', a: 'Refunds are processed within 3–5 business days after the item reaches our warehouse.' },
  { q: 'What items cannot be returned?', a: 'Perishables, digital downloads, personal hygiene products, and items marked "Final Sale" are not eligible.' },
  { q: 'Can I exchange instead of returning?', a: 'Yes — during the return flow, select "Exchange" instead of "Refund" and pick your replacement.' },
];

export default function Returns() {
  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-20 text-white text-center">
        <div className="container-x">
          <h1 className="font-display text-5xl font-extrabold">Returns & Refunds</h1>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
            Not happy with your order? No problem. We offer hassle-free 7-day returns with free pickup.
          </p>
          <a href="/account/orders" className="mt-8 inline-block rounded-full bg-amber-400 px-8 py-3 font-bold text-emerald-900 hover:bg-amber-300">
            Start a Return →
          </a>
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-12">How Returns Work</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <div className="font-display text-4xl font-extrabold text-emerald-200">{s.n}</div>
              <h3 className="mt-3 font-display text-lg font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-emerald-50 py-14">
        <div className="container-x max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-white p-5 cursor-pointer">
                <summary className="font-semibold list-none flex items-center justify-between">
                  {f.q}
                  <span className="text-emerald-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-14 text-center">
        <h2 className="font-display text-2xl font-bold mb-3">Still need help?</h2>
        <p className="text-muted-foreground mb-6">Our support team is available 24/7 to assist with any return or refund query.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/contact" className="rounded-xl bg-emerald-600 px-7 py-3 font-semibold text-white hover:bg-emerald-700">Contact Support</a>
          <a href="/help" className="rounded-xl border border-border px-7 py-3 font-semibold hover:border-emerald-400">Help Center</a>
        </div>
      </section>
    </div>
  );
}
