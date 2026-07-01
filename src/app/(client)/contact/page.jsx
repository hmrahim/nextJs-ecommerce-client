// 📁 PATH: src/app/(client)/contact/page.jsx
import ContactForm from "@/components/client/contact/ContactForm";
import { Mail, Phone, MapPin, MessageSquare, Clock } from "lucide-react";

export const metadata = {
  title: "Contact Us | Moom24",
  description:
    "Get in touch with the Moom24 support team in Saudi Arabia. We are here to help with orders, vendor questions, and more.",
  alternates: { canonical: "https://www.moom24.com/contact" },
};

const CONTACT_INFO = [
  { icon: Phone, t: "Call us", v: "+966 11 234 5678", s: "Sat – Thu, 9 AM – 9 PM" },
  { icon: Mail, t: "Email", v: "support@moom24.com", s: "We reply within 24h" },
  { icon: MessageSquare, t: "Live Chat", v: "Start a chat", s: "Always available" },
  { icon: MapPin, t: "Visit", v: "Olaya District, Riyadh", s: "Saudi Arabia" },
  { icon: Clock, t: "Office hours", v: "9 AM – 9 PM AST", s: "Saturday – Thursday" },
];

export default function Contact() {
  return (
    <div className="container-x py-12">
      <div className="mb-10 text-center">
        <h1 className="font-display text-2xl font-bold sm:text-4xl">We&apos;d love to hear from you</h1>
        <p className="mt-2 text-muted-foreground">
          Got a question? Need help with an order? Our team is here for you.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
          <h2 className="mb-4 font-display text-xl font-bold">Send us a message</h2>
          <ContactForm />
        </div>

        <aside className="space-y-4">
          {CONTACT_INFO.map((c) => (
            <div key={c.t} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary-deep)]">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{c.t}</div>
                <div className="font-semibold">{c.v}</div>
                <div className="text-xs text-muted-foreground">{c.s}</div>
              </div>
            </div>
          ))}

          <div className="overflow-hidden rounded-xl border border-border">
            <iframe
              title="Moom24 office location — Riyadh, Saudi Arabia"
              src="https://www.google.com/maps?q=Olaya+District,+Riyadh,+Saudi+Arabia&output=embed"
              width="100%"
              height="220"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}