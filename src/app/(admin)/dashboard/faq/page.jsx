"use client";

import { useMemo, useState } from "react";

/* ============================================================================
   MOOM24 — FAQ Manager (Amazon Help Center / Daraz HC scale)
   Drop at: src/app/dashboard/support/faq-manager/page.jsx
============================================================================ */

const CATEGORIES = [
  { id: "orders",   name: "Orders & Tracking",   icon: "📦", color: "#3b82f6" },
  { id: "payment",  name: "Payments & Refunds",  icon: "💳", color: "#10b981" },
  { id: "delivery", name: "Shipping & Delivery", icon: "🚚", color: "#f59e0b" },
  { id: "returns",  name: "Returns & Warranty",  icon: "↩️", color: "#a78bfa" },
  { id: "account",  name: "Account & Security",  icon: "🔐", color: "#ef4444" },
  { id: "seller",   name: "Sell on Moom24",      icon: "🏪", color: "#06b6d4" },
  { id: "promo",    name: "Offers & Coupons",    icon: "🎁", color: "#ec4899" },
  { id: "general",  name: "General Info",        icon: "ℹ️", color: "#64748b" },
];

const LANGS = [
  { code: "en", name: "English" },
  { code: "bn", name: "বাংলা" },
  { code: "hi", name: "हिन्दी" },
  { code: "ar", name: "العربية" },
];

const FAQ_SEED = [
  {
    id: "FAQ-1001", category: "orders",
    question: "How can I track my order?",
    answer: "Once your order is shipped, you'll receive a tracking number via SMS and email. You can also track it from My Orders → Track in your account. Live tracking updates are available for all Express deliveries.",
    status: "published", priority: 1, views: 142850, helpful: 12420, notHelpful: 380,
    tags: ["tracking", "shipment", "express"], updated: "2 days ago", author: "Tanjila A.",
    languages: ["en", "bn"],
  },
  {
    id: "FAQ-1002", category: "orders",
    question: "Can I change my delivery address after placing an order?",
    answer: "You can change the delivery address within 30 minutes of placing the order, before it enters processing. Go to My Orders → Modify Address. After that you'll need to contact support.",
    status: "published", priority: 2, views: 87200, helpful: 7300, notHelpful: 410,
    tags: ["address", "modify"], updated: "5 days ago", author: "Rashed K.",
    languages: ["en", "bn", "hi"],
  },
  {
    id: "FAQ-1003", category: "payment",
    question: "How long do refunds take to process?",
    answer: "Refunds are processed within 5-7 business days for bank cards, 2-3 days for bKash/Nagad, and instantly for Moom24 Wallet. For COD orders, refunds are issued via your preferred method.",
    status: "published", priority: 1, views: 196420, helpful: 18900, notHelpful: 720,
    tags: ["refund", "bkash", "nagad", "wallet"], updated: "1 day ago", author: "Mahir H.",
    languages: ["en", "bn"],
  },
  {
    id: "FAQ-1004", category: "payment",
    question: "What payment methods do you accept?",
    answer: "We accept Visa, Mastercard, American Express, bKash, Nagad, Rocket, Upay, Moom24 Wallet, EMI from 12+ banks, and Cash on Delivery (COD) for eligible products.",
    status: "published", priority: 2, views: 124300, helpful: 11200, notHelpful: 290,
    tags: ["payment", "emi", "cod"], updated: "1 week ago", author: "Sumi A.",
    languages: ["en", "bn", "hi", "ar"],
  },
  {
    id: "FAQ-1005", category: "delivery",
    question: "What are the delivery charges?",
    answer: "Inside Dhaka: ৳60 (free above ৳1,500). Outside Dhaka: ৳120 (free above ৳2,500). Express same-day delivery: ৳200. Heavy items have additional charges shown at checkout.",
    status: "published", priority: 1, views: 232100, helpful: 21400, notHelpful: 1820,
    tags: ["delivery-charge", "free-shipping", "express"], updated: "3 days ago", author: "Tanjila A.",
    languages: ["en", "bn"],
  },
  {
    id: "FAQ-1006", category: "delivery",
    question: "Do you deliver to remote areas outside Dhaka?",
    answer: "Yes, we deliver to all 64 districts of Bangladesh. Remote sub-districts may take 4-7 business days. Some Chittagong Hill Tract areas require pickup from the nearest hub.",
    status: "published", priority: 3, views: 65400, helpful: 5800, notHelpful: 420,
    tags: ["coverage", "remote"], updated: "2 weeks ago", author: "Imran S.",
    languages: ["en", "bn"],
  },
  {
    id: "FAQ-1007", category: "returns",
    question: "What is your return policy?",
    answer: "Most products have a 7-day return window. Electronics: 7 days for defects, 30 days for DOA. Fashion: 14 days unused with tags. Personal care, food, and customized items are non-returnable.",
    status: "published", priority: 1, views: 188900, helpful: 16200, notHelpful: 980,
    tags: ["return", "policy", "warranty"], updated: "4 days ago", author: "Mahir H.",
    languages: ["en", "bn", "hi"],
  },
  {
    id: "FAQ-1008", category: "returns",
    question: "How do I claim warranty on my product?",
    answer: "Go to My Orders → Select item → Claim Warranty. Upload the issue photos/video. Our team verifies within 24h and arranges pickup or service center visit. Warranty period varies by brand.",
    status: "published", priority: 2, views: 78400, helpful: 6700, notHelpful: 510,
    tags: ["warranty", "brand"], updated: "1 week ago", author: "Rashed K.",
    languages: ["en", "bn"],
  },
  {
    id: "FAQ-1009", category: "account",
    question: "How do I reset my password?",
    answer: "Click 'Forgot Password' on the login page, enter your registered email or phone. You'll receive an OTP/link to set a new password. For security, recent passwords cannot be reused.",
    status: "published", priority: 1, views: 98200, helpful: 8900, notHelpful: 320,
    tags: ["password", "security", "otp"], updated: "1 month ago", author: "Sumi A.",
    languages: ["en", "bn", "hi", "ar"],
  },
  {
    id: "FAQ-1010", category: "account",
    question: "How do I enable two-factor authentication?",
    answer: "Go to Settings → Security → Two-Factor Authentication. Choose SMS or Authenticator App. We strongly recommend enabling 2FA for orders above ৳25,000.",
    status: "draft", priority: 5, views: 0, helpful: 0, notHelpful: 0,
    tags: ["2fa", "security"], updated: "Today", author: "Rashed K.",
    languages: ["en"],
  },
  {
    id: "FAQ-1011", category: "seller",
    question: "How do I register as a seller on Moom24?",
    answer: "Visit sell.moom24.com → Register. Submit your Trade License, NID, and Bank info. Approval takes 2-3 business days. Onboarding includes free product listing training.",
    status: "published", priority: 1, views: 54600, helpful: 4800, notHelpful: 210,
    tags: ["seller", "registration", "onboarding"], updated: "5 days ago", author: "Imran S.",
    languages: ["en", "bn"],
  },
  {
    id: "FAQ-1012", category: "seller",
    question: "What commission does Moom24 charge?",
    answer: "Commission ranges from 4-15% based on category. Electronics: 4-7%, Fashion: 12-15%, FMCG: 8-10%. Includes payment processing, fraud protection, and platform tools.",
    status: "review", priority: 2, views: 0, helpful: 0, notHelpful: 0,
    tags: ["commission", "seller-fee"], updated: "Yesterday", author: "Tanjila A.",
    languages: ["en"],
  },
  {
    id: "FAQ-1013", category: "promo",
    question: "Why isn't my coupon code working?",
    answer: "Common reasons: (1) Minimum order value not met, (2) Coupon expired, (3) Category exclusion, (4) Already used (single-use codes), (5) Geographic restriction. Check the coupon terms on the offer page.",
    status: "published", priority: 1, views: 167800, helpful: 14100, notHelpful: 2240,
    tags: ["coupon", "promo", "discount"], updated: "3 days ago", author: "Mahir H.",
    languages: ["en", "bn"],
  },
  {
    id: "FAQ-1014", category: "promo",
    question: "How does Moom24 Cashback work?",
    answer: "Cashback is credited to your Moom24 Wallet within 7 days of order delivery. You can use wallet balance for any future purchase. Wallet money never expires.",
    status: "published", priority: 2, views: 89400, helpful: 8200, notHelpful: 380,
    tags: ["cashback", "wallet"], updated: "1 week ago", author: "Sumi A.",
    languages: ["en", "bn", "hi"],
  },
  {
    id: "FAQ-1015", category: "general",
    question: "How do I contact customer support?",
    answer: "24/7 Live Chat in the app. Phone: 16630 (8am-10pm). Email: help@moom24.com. WhatsApp: +880 1700-000000. Average response: under 60 seconds on chat.",
    status: "published", priority: 1, views: 312400, helpful: 28900, notHelpful: 1100,
    tags: ["contact", "support", "phone"], updated: "1 day ago", author: "Imran S.",
    languages: ["en", "bn", "hi", "ar"],
  },
];

const STATUS_META = {
  published: { bg: "rgba(16,185,129,.14)", fg: "#6ee7b7", label: "Published" },
  draft:     { bg: "rgba(245,158,11,.14)", fg: "#fcd34d", label: "Draft" },
  review:    { bg: "rgba(167,139,250,.14)", fg: "#c4b5fd", label: "In Review" },
  archived:  { bg: "rgba(107,114,128,.18)", fg: "#9ca3af", label: "Archived" },
};

const STATUSES = ["published", "draft", "review", "archived"];

const helpfulRate = (h, n) => {
  const total = h + n;
  return total === 0 ? 0 : Math.round((h / total) * 100);
};

/* ============================================================================ */

function FAQModal({ faq, onClose, onSave }) {
  const blank = {
    id: "FAQ-" + Math.floor(1000 + Math.random() * 9000),
    category: "orders", question: "", answer: "", status: "draft",
    priority: 5, views: 0, helpful: 0, notHelpful: 0, tags: [],
    updated: "Just now", author: "You", languages: ["en"],
  };
  const [form, setForm] = useState(faq || blank);
  const [tagInput, setTagInput] = useState("");

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleLang = (code) => upd("languages",
    form.languages.includes(code) ? form.languages.filter((c) => c !== code) : [...form.languages, code]
  );
  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      upd("tags", [...form.tags, tagInput.trim()]); setTagInput("");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.65)", backdropFilter: "blur(2px)" }} />
      <div style={{
        position: "relative", background: "#0b1220", border: "1px solid #1f2937",
        borderRadius: 14, width: "min(820px, 100%)", maxHeight: "92vh", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{form.id}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>{faq ? "Edit FAQ" : "Create new FAQ"}</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #334155", color: "#cbd5e1", padding: "7px 14px", borderRadius: 7, cursor: "pointer" }}>Close</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Question">
            <input value={form.question} onChange={(e) => upd("question", e.target.value)}
              placeholder="e.g. How do I track my order?" style={inputStyle} />
          </Field>

          <Field label="Answer (supports basic markdown)">
            <textarea value={form.answer} onChange={(e) => upd("answer", e.target.value)}
              placeholder="Write a clear, concise answer..."
              style={{ ...inputStyle, minHeight: 140, fontFamily: "inherit", resize: "vertical" }} />
            <div style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>{form.answer.length} characters · Recommended: 100-400</div>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Category">
              <select value={form.category} onChange={(e) => upd("category", e.target.value)} style={inputStyle}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => upd("status", e.target.value)} style={inputStyle}>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label={`Priority (current: ${form.priority})`}>
              <input type="range" min="1" max="10" value={form.priority}
                onChange={(e) => upd("priority", Number(e.target.value))}
                style={{ width: "100%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#64748b" }}>
                <span>High (1)</span><span>Low (10)</span>
              </div>
            </Field>
            <Field label="Languages available">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {LANGS.map((l) => {
                  const on = form.languages.includes(l.code);
                  return (
                    <button key={l.code} onClick={() => toggleLang(l.code)} style={{
                      padding: "6px 11px", borderRadius: 7, fontSize: 12, cursor: "pointer", fontWeight: 600,
                      background: on ? "#1e40af" : "transparent",
                      color: on ? "white" : "#94a3b8",
                      border: `1px solid ${on ? "#1e40af" : "#334155"}`,
                    }}>{on ? "✓ " : ""}{l.name}</button>
                  );
                })}
              </div>
            </Field>
          </div>

          <Field label="Tags (for search optimization)">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {form.tags.map((t) => (
                <span key={t} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "4px 9px", borderRadius: 99, fontSize: 11.5,
                  background: "#1e3a8a55", color: "#93c5fd", border: "1px solid #1e40af",
                }}>
                  #{t}
                  <button onClick={() => upd("tags", form.tags.filter((x) => x !== t))}
                    style={{ background: "transparent", border: "none", color: "#93c5fd", cursor: "pointer", fontSize: 13, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter" style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addTag} style={btnSecondary}>Add</button>
            </div>
          </Field>

          {/* Live preview */}
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: .5, marginBottom: 8, textTransform: "uppercase" }}>Live preview</div>
            <div style={{ background: "#0a101c", border: "1px solid #1f2937", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginBottom: 8 }}>
                {form.question || "Your question will appear here"}
              </div>
              <div style={{ fontSize: 13.5, color: "#cbd5e1", lineHeight: 1.55 }}>
                {form.answer || <span style={{ color: "#64748b", fontStyle: "italic" }}>Your answer will appear here</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid #1f2937", display: "flex", justifyContent: "space-between" }}>
          <button style={btnSecondary}>📋 Preview on storefront</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={btnSecondary}>Cancel</button>
            <button onClick={() => { onSave(form); onClose(); }}
              disabled={!form.question || !form.answer} style={{
                ...btnPrimary, opacity: (!form.question || !form.answer) ? .5 : 1,
                cursor: (!form.question || !form.answer) ? "not-allowed" : "pointer",
              }}>
              {faq ? "Save changes" : "Create FAQ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

/* ============================================================================ */

export default function FAQManagerPage() {
  const [faqs, setFaqs] = useState(FAQ_SEED);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeLang, setActiveLang] = useState("all");
  const [modal, setModal] = useState(null); // null | "new" | faq
  const [expanded, setExpanded] = useState(new Set());

  const toggle = (id) => setExpanded((s) => {
    const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns;
  });

  const filtered = useMemo(() => {
    return faqs.filter((f) => {
      if (activeCategory !== "all" && f.category !== activeCategory) return false;
      if (activeStatus !== "all" && f.status !== activeStatus) return false;
      if (activeLang !== "all" && !f.languages.includes(activeLang)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!f.question.toLowerCase().includes(q) &&
            !f.answer.toLowerCase().includes(q) &&
            !f.tags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      return true;
    }).sort((a, b) => a.priority - b.priority);
  }, [faqs, activeCategory, activeStatus, activeLang, search]);

  const stats = useMemo(() => {
    const totalViews = faqs.reduce((s, f) => s + f.views, 0);
    const totalHelpful = faqs.reduce((s, f) => s + f.helpful + f.notHelpful, 0);
    const helpfulSum = faqs.reduce((s, f) => s + f.helpful, 0);
    return {
      total: faqs.length,
      published: faqs.filter((f) => f.status === "published").length,
      drafts: faqs.filter((f) => f.status === "draft").length,
      review: faqs.filter((f) => f.status === "review").length,
      views: totalViews,
      satisfaction: totalHelpful === 0 ? 0 : Math.round((helpfulSum / totalHelpful) * 100),
    };
  }, [faqs]);

  const saveFaq = (f) => {
    setFaqs((arr) => {
      const exists = arr.find((x) => x.id === f.id);
      return exists ? arr.map((x) => x.id === f.id ? f : x) : [f, ...arr];
    });
  };
  const deleteFaq = (id) => {
    if (confirm("Delete this FAQ permanently?")) setFaqs((arr) => arr.filter((f) => f.id !== id));
  };
  const togglePublish = (id) => setFaqs((arr) => arr.map((f) =>
    f.id === id ? { ...f, status: f.status === "published" ? "draft" : "published" } : f
  ));

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e2e8f0", padding: "24px 28px" }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>FAQ Manager</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13.5 }}>
            Build, translate and publish your customer help center across categories, languages and devices.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btnSecondary}>📊 Analytics</button>
          <button style={btnSecondary}>📥 Import CSV</button>
          <button style={btnPrimary} onClick={() => setModal("new")}>+ New FAQ</button>
        </div>
      </div>

      {/* stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 22 }}>
        <Stat label="Total articles"   value={stats.total}          sub={`${stats.published} live`}    accent="#60a5fa" icon="📚" />
        <Stat label="Pending review"   value={stats.review}         sub="Awaiting approval"            accent="#a78bfa" icon="👁️" />
        <Stat label="Drafts"           value={stats.drafts}         sub="In progress"                  accent="#fbbf24" icon="✏️" />
        <Stat label="Monthly views"    value={(stats.views/1000).toFixed(1) + "K"} sub="↑ 18% vs last month" accent="#34d399" icon="📈" />
        <Stat label="Helpfulness"      value={stats.satisfaction + "%"} sub="Across all articles"      accent="#f472b6" icon="💚" />
      </div>

      {/* category cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 20 }}>
        <CategoryCard
          active={activeCategory === "all"} onClick={() => setActiveCategory("all")}
          name="All categories" icon="🌐" color="#64748b" count={faqs.length}
        />
        {CATEGORIES.map((c) => (
          <CategoryCard key={c.id}
            active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)}
            name={c.name} icon={c.icon} color={c.color}
            count={faqs.filter((f) => f.category === c.id).length}
          />
        ))}
      </div>

      {/* search + filter row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by question, answer or tag..."
          style={{ ...inputStyle, flex: 1, minWidth: 280 }}
        />
        <select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)} style={inputStyle}>
          <option value="all">All status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
        <select value={activeLang} onChange={(e) => setActiveLang(e.target.value)} style={inputStyle}>
          <option value="all">All languages</option>
          {LANGS.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      </div>

      {/* FAQ list */}
      <div style={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 12, overflow: "hidden" }}>
        {filtered.map((f, idx) => {
          const cat = CATEGORIES.find((c) => c.id === f.category);
          const sm = STATUS_META[f.status];
          const isOpen = expanded.has(f.id);
          const rate = helpfulRate(f.helpful, f.notHelpful);
          return (
            <div key={f.id} style={{ borderBottom: idx === filtered.length - 1 ? "none" : "1px solid #1f2937" }}>
              <div onClick={() => toggle(f.id)} style={{
                padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
              }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: cat.color + "22", color: cat.color,
                  display: "grid", placeItems: "center", fontSize: 17,
                }}>{cat.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{f.question}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10.5, fontWeight: 700, background: sm.bg, color: sm.fg }}>{sm.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "#64748b", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "monospace" }}>{f.id}</span>
                    <span>{cat.name}</span>
                    <span>👁 {f.views.toLocaleString()} views</span>
                    {f.helpful + f.notHelpful > 0 && (
                      <span>👍 {rate}% helpful ({(f.helpful+f.notHelpful).toLocaleString()})</span>
                    )}
                    <span>🌐 {f.languages.map((l) => l.toUpperCase()).join(", ")}</span>
                    <span>by {f.author} · {f.updated}</span>
                  </div>
                </div>
                <span style={{ color: "#64748b", fontSize: 18, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>⌄</span>
              </div>

              {isOpen && (
                <div style={{ padding: "0 18px 18px 68px", background: "#0a101c" }}>
                  <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: 14, fontSize: 13.5, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 12 }}>
                    {f.answer}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {f.tags.map((t) => (
                        <span key={t} style={{
                          padding: "3px 9px", borderRadius: 99, fontSize: 11,
                          background: "#1e3a8a44", color: "#93c5fd", border: "1px solid #1e40af55",
                        }}>#{t}</span>
                      ))}
                      {f.tags.length === 0 && <span style={{ color: "#64748b", fontSize: 11.5, fontStyle: "italic" }}>No tags</span>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={(e) => { e.stopPropagation(); togglePublish(f.id); }} style={btnSecondary}>
                        {f.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setModal(f); }} style={btnSecondary}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); deleteFaq(f.id); }} style={{ ...btnSecondary, color: "#fca5a5", borderColor: "#7f1d1d" }}>Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
            No FAQs match your filters. <button onClick={() => setModal("new")} style={{ background: "transparent", border: "none", color: "#3b82f6", cursor: "pointer", fontWeight: 600 }}>Create one →</button>
          </div>
        )}
      </div>

      {modal && (
        <FAQModal
          faq={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={saveFaq}
        />
      )}
    </div>
  );
}

function CategoryCard({ active, onClick, name, icon, color, count }) {
  return (
    <button onClick={onClick} style={{
      padding: "14px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
      background: active ? `${color}18` : "#0f172a",
      border: `1px solid ${active ? color + "66" : "#1f2937"}`,
      display: "flex", flexDirection: "column", gap: 8, transition: "all .15s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
          background: color + "22", color,
        }}>{count}</span>
      </div>
      <span style={{ color: active ? "#f1f5f9" : "#cbd5e1", fontWeight: 600, fontSize: 13 }}>{name}</span>
    </button>
  );
}

function Stat({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: "linear-gradient(180deg,#111827,#0b1220)",
      border: "1px solid #1f2937", borderRadius: 14, padding: 16,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{label}</span>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: `${accent}22`, color: accent, display: "grid", placeItems: "center", fontSize: 14 }}>{icon}</span>
      </div>
      <div style={{ color: "#f8fafc", fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: 11.5 }}>{sub}</div>
    </div>
  );
}

const btnPrimary = { background: "#2563eb", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" };
const btnSecondary = { background: "transparent", color: "#cbd5e1", border: "1px solid #334155", padding: "8px 14px", borderRadius: 8, fontWeight: 600, fontSize: 12.5, cursor: "pointer" };
const inputStyle = { background: "#0b1220", border: "1px solid #1f2937", color: "#e2e8f0", padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none", width: "100%" };