export const metadata = {
  title: 'Shipping Information | Moom24',
  description: 'Learn about Moom24 delivery options, timeframes, costs, and our coverage across Bangladesh.',
  alternates: { canonical: 'https://www.moom24.com/shipping-info' },
};

const METHODS = [
  { name: 'Standard Delivery', time: '3–5 business days', cost: 'SAR 49 (Free over SAR 999)', desc: 'Available nationwide across all 64 districts.' },
  { name: 'Express Delivery', time: '1–2 business days', cost: 'SAR 119', desc: 'Available in Dhaka, Chittagong, Sylhet, and Rajshahi.' },
  { name: 'Same-Day Delivery', time: 'Order before 12 PM', cost: 'SAR 179', desc: 'Currently available in Dhaka city only.' },
  { name: 'Scheduled Delivery', time: 'You choose the slot', cost: 'SAR 79', desc: 'Pick a 2-hour delivery window that suits you.' },
];

const ZONES = [
  { zone: 'Dhaka & Surroundings', days: '1–2', coverage: '100%' },
  { zone: 'Chittagong & Sylhet', days: '2–3', coverage: '100%' },
  { zone: 'Rajshahi & Khulna', days: '3–4', coverage: '100%' },
  { zone: 'Remote Districts', days: '4–6', coverage: '98%' },
];

export default function ShippingInfo() {
  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-20 text-white text-center">
        <div className="container-x">
          <h1 className="font-display text-5xl font-extrabold">Shipping Information</h1>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
            Fast, reliable delivery to all 64 districts of Bangladesh. Free shipping on orders over SAR 999.
          </p>
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Delivery Options</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {METHODS.map((m) => (
            <div key={m.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-bold">{m.name}</h3>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 whitespace-nowrap">{m.time}</span>
              </div>
              <div className="mt-2 text-emerald-600 font-semibold text-sm">{m.cost}</div>
              <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-emerald-50 py-14">
        <div className="container-x">
          <h2 className="font-display text-3xl font-bold text-center mb-10">Delivery Coverage by Zone</h2>
          <div className="overflow-x-auto rounded-2xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-emerald-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Zone</th>
                  <th className="px-6 py-4 text-left font-semibold">Estimated Days</th>
                  <th className="px-6 py-4 text-left font-semibold">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ZONES.map((z) => (
                  <tr key={z.zone} className="hover:bg-emerald-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{z.zone}</td>
                    <td className="px-6 py-4 text-muted-foreground">{z.days} business days</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{z.coverage}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="container-x py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { i: '📦', t: 'Packaging', d: 'All orders are securely packed. Fragile items get double-box protection at no extra cost.' },
            { i: '🌿', t: 'Eco Shipping', d: 'We use biodegradable packaging and carbon-offset all deliveries through our Green Delivery program.' },
            { i: '📍', t: 'Live Tracking', d: 'Track your order in real time from our app or the Track Order page. SMS updates at every step.' },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="text-4xl mb-3">{f.i}</div>
              <h3 className="font-display font-bold mb-1">{f.t}</h3>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pb-14 text-center">
        <p className="text-muted-foreground">
          Questions about your shipment?{' '}
          <a href="/track-order" className="text-emerald-600 hover:underline">Track your order</a>
          {' '}or{' '}
          <a href="/contact" className="text-emerald-600 hover:underline">contact support</a>.
        </p>
      </section>
    </div>
  );
}
