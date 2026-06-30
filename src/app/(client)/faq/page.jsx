export const metadata = {
  title: 'FAQs | Moom24',
  description: 'Find answers to the most frequently asked questions about shopping, selling, and using Moom24.',
  alternates: { canonical: 'https://www.moom24.com/faq' },
};

const CATEGORIES = [
  {
    cat: 'Orders & Payments',
    icon: '🛒',
    items: [
      { q: 'How do I place an order?', a: "Browse products, add to cart, select your address, choose a payment method, and confirm. You'll receive an email and SMS confirmation instantly." },
      { q: 'What payment methods are accepted?', a: 'We accept Visa, Mastercard, bKash, Nagad, Rocket, and cash on delivery for eligible areas.' },
      { q: 'Can I modify or cancel my order?', a: 'Orders can be cancelled within 30 minutes of placing them from My Orders. Modifications are not available after confirmation.' },
      { q: 'Is my payment information secure?', a: 'Yes. All transactions are encrypted with TLS and we never store your full card number.' },
    ],
  },
  {
    cat: 'Delivery',
    icon: '🚚',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 3–5 business days. Express delivery (1–2 days) and same-day delivery in Dhaka are also available.' },
      { q: 'Do you deliver to my area?', a: 'We cover all 64 districts of Bangladesh. Enter your address at checkout to confirm availability.' },
      { q: 'Is free delivery available?', a: 'Yes — orders over SAR 999 qualify for free standard delivery.' },
    ],
  },
  {
    cat: 'Returns & Refunds',
    icon: '↩️',
    items: [
      { q: 'What is your return policy?', a: 'We offer 7-day no-questions-asked returns for most items. Some categories (perishables, digital goods) are excluded.' },
      { q: 'How do I start a return?', a: "Go to My Orders, select the item, and tap \"Return Item.\" We'll schedule a free pickup." },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 3–5 business days after we receive and inspect the returned item.' },
    ],
  },
  {
    cat: 'Account & Security',
    icon: '🔐',
    items: [
      { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page and follow the instructions sent to your registered email.' },
      { q: 'Can I have multiple addresses?', a: 'Yes — you can save up to 10 addresses in your account under Address Book.' },
      { q: 'How do I delete my account?', a: 'Contact our support team to permanently delete your account and associated data.' },
    ],
  },
];

export default function FAQ() {
  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-20 text-white text-center">
        <div className="container-x">
          <h1 className="font-display text-5xl font-extrabold">Frequently Asked Questions</h1>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
            Quick answers to the questions we hear most often.
          </p>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid gap-10">
          {CATEGORIES.map((cat) => (
            <div key={cat.cat}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">{cat.icon}</span>
                <h2 className="font-display text-2xl font-bold">{cat.cat}</h2>
              </div>
              <div className="space-y-3">
                {cat.items.map((f) => (
                  <details key={f.q} className="group rounded-xl border border-border bg-card p-5 cursor-pointer">
                    <summary className="font-semibold list-none flex items-center justify-between">
                      {f.q}
                      <span className="ml-4 flex-shrink-0 text-emerald-600 group-open:rotate-45 transition-transform duration-200">+</span>
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-emerald-50 py-14">
        <div className="container-x max-w-lg text-center mx-auto">
          <h2 className="font-display text-2xl font-bold mb-3">Didn't find your answer?</h2>
          <p className="text-muted-foreground mb-6">Our support team is here around the clock to help you out.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/contact" className="rounded-xl bg-emerald-600 px-7 py-3 font-semibold text-white hover:bg-emerald-700">Contact Us</a>
            <a href="/help" className="rounded-xl border border-border bg-white px-7 py-3 font-semibold hover:border-emerald-400">Help Center</a>
          </div>
        </div>
      </section>
    </div>
  );
}