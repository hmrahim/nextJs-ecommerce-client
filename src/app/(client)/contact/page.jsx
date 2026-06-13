import { Mail, Phone, MapPin, MessageSquare, Clock } from "lucide-react";
function Contact() {
  return <div className="container-x py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-2xl sm:text-4xl font-bold">We'd love to hear from you</h1>
        <p className="mt-2 text-muted-foreground">Got a question? Need help with an order? Our team is here 24/7.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
          <h2 className="font-display text-xl font-bold mb-4">Send us a message</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Your name" />
            <input className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Email" />
            <input className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500 sm:col-span-2" placeholder="Subject" />
            <select className="rounded-lg border border-border px-4 py-3 text-sm outline-none sm:col-span-2"><option>Order issue</option><option>Vendor question</option><option>Account & billing</option><option>Partnerships</option><option>Press</option></select>
            <textarea rows={6} className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-emerald-500 sm:col-span-2" placeholder="How can we help?" />
            <button className="rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 sm:col-span-2">Send Message</button>
          </div>
        </div>

        <aside className="space-y-4">
          {[
    { i: Phone, t: "Call us", v: "+880 1700-000000", s: "Mon-Sun, 24/7" },
    { i: Mail, t: "Email", v: "support@greenmart.com", s: "We reply in under 2h" },
    { i: MessageSquare, t: "Live Chat", v: "Start a chat", s: "Always available" },
    { i: MapPin, t: "Visit", v: "Banani, Dhaka 1213", s: "Bangladesh" },
    { i: Clock, t: "Office hours", v: "9 AM \u2013 7 PM BST", s: "Sat \u2013 Thu" }
  ].map((c) => <div key={c.t} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><c.i className="h-5 w-5" /></div>
              <div><div className="text-xs text-muted-foreground">{c.t}</div><div className="font-semibold">{c.v}</div><div className="text-xs text-muted-foreground">{c.s}</div></div>
            </div>)}
        </aside>
      </div>
    </div>;
}
export {
  Contact as default
};
