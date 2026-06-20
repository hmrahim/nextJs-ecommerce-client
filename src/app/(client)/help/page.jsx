import { Search, ChevronDown, MessageSquare, Phone, Mail } from "lucide-react";
function Help() {
  return <div>
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-16 text-white">
        <div className="container-x text-center">
          <h1 className="font-display text-4xl font-bold">How can we help?</h1>
          <p className="mt-2 text-emerald-100">Search our help center or browse popular topics.</p>
          <div className="mx-auto mt-6 flex max-w-2xl overflow-hidden rounded-full bg-white">
            <Search className="ml-4 mt-3 h-5 w-5 text-muted-foreground" />
            <input className="flex-1 px-3 py-3 text-sm text-foreground outline-none" placeholder="Describe your issue or search…" />
            <button className="bg-amber-400 px-6 font-semibold text-emerald-950">Search</button>
          </div>
        </div>
      </section>

      <section className="container-x py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
    { i: "\u{1F4E6}", t: "Orders & Returns", d: "Track, cancel, return" },
    { i: "\u{1F4B3}", t: "Payments & Refunds", d: "Methods, refund status" },
    { i: "\u{1F69A}", t: "Shipping & Delivery", d: "Charges, delays" },
    { i: "\u{1F510}", t: "Account & Security", d: "Login, profile, password" },
    { i: "\u{1F6D2}", t: "Buying on Moom24", d: "Vouchers, deals, search" },
    { i: "\u{1F3EA}", t: "For Sellers", d: "Open store, payouts" },
    { i: "\u2B50", t: "Reviews & Ratings", d: "Leave or edit a review" },
    { i: "\u{1F4F1}", t: "App Help", d: "Install, notifications" }
  ].map((c) => <a key={c.t} className="rounded-2xl border border-border bg-card p-5 card-hover">
              <div className="text-3xl">{c.i}</div>
              <div className="mt-2 font-semibold">{c.t}</div>
              <div className="text-xs text-muted-foreground">{c.d}</div>
            </a>)}
        </div>
      </section>

      <section className="container-x pb-12">
        <h2 className="mb-6 font-display text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
    "How do I track my order?",
    "What is the return policy?",
    "How long does delivery take?",
    "Which payment methods are accepted?",
    "How do I become a vendor?",
    "How do I redeem a voucher code?",
    "Is Cash on Delivery available everywhere?",
    "How are products verified for authenticity?"
  ].map((q, i) => <details key={q} className="group rounded-xl border border-border bg-card p-4" open={i === 0}>
              <summary className="flex cursor-pointer items-center justify-between font-semibold">
                {q}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">
                We'd love to help with that. Our team has prepared a step-by-step guide covering every scenario. Reach out via live chat anytime for instant assistance.
              </p>
            </details>)}
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="rounded-2xl bg-emerald-50 p-8 text-center">
          <h3 className="font-display text-2xl font-bold">Still need help?</h3>
          <p className="mt-1 text-muted-foreground">Our team is online 24/7.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"><MessageSquare className="h-4 w-4" /> Live Chat</button>
            <button className="flex items-center gap-2 rounded-full border border-border border-emerald-600 px-6 py-3 text-sm font-semibold text-emerald-700"><Phone className="h-4 w-4" /> +880 1700-000000</button>
            <button className="flex items-center gap-2 rounded-full border border-border border-emerald-600 px-6 py-3 text-sm font-semibold text-emerald-700"><Mail className="h-4 w-4" /> support@Moom24.com</button>
          </div>
        </div>
      </section>
    </div>;
}
export {
  Help as default
};
