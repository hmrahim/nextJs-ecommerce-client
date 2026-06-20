"use client";
import Link from "next/link";
import { Apple, Smartphone, ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";

// lucide-react v1+ removed brand icons — using inline SVG replacements
const Facebook = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const Instagram = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const Twitter = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const Youtube = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
  </svg>
);
function SiteFooter() {
  return <footer className="mt-16 bg-[var(--color-primary-deep)] text-white/85">
      {
    /* Trust bar */
  }
      <div className="border-b border-border border-white/10">
        <div className="container-x grid grid-cols-2 gap-3 py-6 md:grid-cols-4">
          {[
    { icon: Truck, t: "Free Shipping", s: "On orders over \u09F3999" },
    { icon: RotateCcw, t: "7-Day Returns", s: "Hassle-free returns" },
    { icon: ShieldCheck, t: "Secure Payment", s: "100% protected checkout" },
    { icon: Headphones, t: "24/7 Support", s: "We're here to help" }
  ].map((f) => <div key={f.t} className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15">
                <f.icon className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="font-semibold text-white">{f.t}</div>
                <div className="text-xs text-white/60">{f.s}</div>
              </div>
            </div>)}
        </div>
      </div>

      {
    /* Newsletter */
  }
      <div className="border-b border-border border-white/10">
        <div className="container-x grid gap-6 py-10 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="font-display text-2xl font-bold text-white">Join the Green Club</h3>
            <p className="mt-1 text-sm text-white/70">Get exclusive deals, early access to flash sales, and SAR 200 off your first order.</p>
          </div>
          <form className="flex w-full overflow-hidden rounded-lg bg-white">
            <input className="flex-1 px-4 py-3 text-sm text-foreground outline-none" placeholder="Enter your email address" />
            <button className="bg-amber-400 px-6 text-sm font-bold text-emerald-950 hover:bg-amber-300">Subscribe</button>
          </form>
        </div>
      </div>

      {
    /* Link columns */
  }
      <div className="container-x grid grid-cols-2 gap-6 py-8 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 font-display font-bold text-white">G</div>
            <div className="font-display text-xl font-bold text-white">Moom24</div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-white/70">
            Moom24 is South Asia's fastest-growing multivendor marketplace. Connecting 50,000+ verified sellers with millions of happy customers across 64 districts.
          </p>
          <div className="mt-5 flex gap-3">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => <a key={i} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-emerald-500" href="#"><Icon className="h-4 w-4" /></a>)}
          </div>
          <div className="mt-5 flex gap-3">
            <a className="flex items-center gap-2 rounded-lg border border-border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="#"><Apple className="h-5 w-5" /><div><div className="text-[9px] text-white/60">Download on the</div><div className="font-semibold">App Store</div></div></a>
            <a className="flex items-center gap-2 rounded-lg border border-border border-white/20 px-3 py-2 text-xs hover:bg-white/10" href="#"><Smartphone className="h-5 w-5" /><div><div className="text-[9px] text-white/60">Get it on</div><div className="font-semibold">Google Play</div></div></a>
          </div>
        </div>

        {[
    { t: "Company", l: [["About Us", "/about"], ["Contact", "/contact"], ["Careers", "/careers"], ["Press", "/press"], ["Blog", "/blog"]] },
    { t: "Customer Service", l: [["Help Center", "/help"], ["Track Order", "/account"], ["Returns", "/returns"], ["Shipping Info", "/shipping"], ["FAQs", "/help"]] },
    { t: "For Sellers", l: [["Become a Seller", "/become-seller"], ["Seller Login", "/seller/login"], ["Seller Help", "/seller/help"], ["Advertise", "/advertise"], ["Affiliate Program", "/affiliate"]] }
  ].map((col) => <div key={col.t}>
            <div className="mb-4 text-sm font-bold text-white">{col.t}</div>
            <ul className="space-y-2 text-sm text-white/70">
              {col.l.map(([t, h]) => <li key={t}><Link href={h} className="hover:text-emerald-300">{t}</Link></li>)}
            </ul>
          </div>)}
      </div>

      <div className="border-t border-border border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 md:flex-row">
          <div>© {(/* @__PURE__ */ new Date()).getFullYear()} Moom24 Marketplace. All rights reserved.</div>
          <div className="flex flex-wrap items-center gap-4">
            <span>Secured Payments:</span>
            {["VISA", "Mastercard", "bKash", "Nagad", "Rocket", "COD"].map((p) => <span key={p} className="rounded bg-white/10 px-2 py-1 font-semibold text-white/80">{p}</span>)}
          </div>
        </div>
      </div>
    </footer>;
}
export {
  SiteFooter
};
