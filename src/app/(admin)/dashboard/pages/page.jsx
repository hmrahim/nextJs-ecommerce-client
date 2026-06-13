"use client";

import { useMemo, useState } from "react";

/* ============================================================================
   MOOM24 — Pages / CMS Manager
   Drop at: src/app/(admin)/dashboard/pages/page.jsx
   Manages static + landing pages: About, Contact, T&C, Privacy, Help, etc.
============================================================================ */

const TEMPLATES = [
  { id: "default",  name: "Default",      desc: "Standard sidebar + content" },
  { id: "landing",  name: "Landing",      desc: "Marketing hero + sections" },
  { id: "legal",    name: "Legal",        desc: "Long-form policy template" },
  { id: "help",     name: "Help Article", desc: "FAQ-style help center page" },
  { id: "campaign", name: "Campaign",     desc: "Time-bound promo page" },
];

const STATUSES = [
  { id: "published", label: "Published", color: "emerald" },
  { id: "draft",     label: "Draft",     color: "slate" },
  { id: "review",    label: "In Review", color: "amber" },
];

const VISIBILITY = [
  { id: "public",      label: "Public" },
  { id: "private",     label: "Private (logged in)" },
  { id: "internal",    label: "Internal only" },
];

const PAGES_SEED = [
  { id: "PG-101", title: "About Moom24",          slug: "about",            template: "default",  status: "published", visibility: "public",   showInFooter: true,  showInHeader: true,  views: 84200,  updated: "2025-02-10", author: "Tanjila A.",  parent: null, sortOrder: 1 },
  { id: "PG-102", title: "Contact Us",            slug: "contact",          template: "default",  status: "published", visibility: "public",   showInFooter: true,  showInHeader: true,  views: 142800, updated: "2025-01-22", author: "Mahir H.",     parent: null, sortOrder: 2 },
  { id: "PG-103", title: "Terms & Conditions",    slug: "terms",            template: "legal",    status: "published", visibility: "public",   showInFooter: true,  showInHeader: false, views: 32400,  updated: "2024-11-30", author: "Rashed K.",    parent: null, sortOrder: 10 },
  { id: "PG-104", title: "Privacy Policy",        slug: "privacy",          template: "legal",    status: "published", visibility: "public",   showInFooter: true,  showInHeader: false, views: 28200,  updated: "2024-11-30", author: "Rashed K.",    parent: null, sortOrder: 11 },
  { id: "PG-105", title: "Refund Policy",         slug: "refund-policy",    template: "legal",    status: "published", visibility: "public",   showInFooter: true,  showInHeader: false, views: 56700,  updated: "2024-12-14", author: "Sumi A.",      parent: null, sortOrder: 12 },
  { id: "PG-106", title: "Shipping Policy",       slug: "shipping",         template: "legal",    status: "published", visibility: "public",   showInFooter: true,  showInHeader: false, views: 48200,  updated: "2024-12-14", author: "Sumi A.",      parent: null, sortOrder: 13 },
  { id: "PG-107", title: "Help Center",           slug: "help",             template: "help",     status: "published", visibility: "public",   showInFooter: true,  showInHeader: true,  views: 384600, updated: "2025-02-28", author: "Imran S.",     parent: null, sortOrder: 3 },
  { id: "PG-108", title: "Become a Seller",       slug: "become-seller",    template: "landing",  status: "published", visibility: "public",   showInFooter: true,  showInHeader: true,  views: 142300, updated: "2025-01-18", author: "Tanjila A.",   parent: null, sortOrder: 4 },
  { id: "PG-109", title: "Affiliate Program",     slug: "affiliates",       template: "landing",  status: "published", visibility: "public",   showInFooter: true,  showInHeader: false, views: 28400,  updated: "2025-02-01", author: "Mahir H.",     parent: null, sortOrder: 14 },
  { id: "PG-110", title: "Eid 2025 — Mega Sale",  slug: "eid-2025",         template: "campaign", status: "published", visibility: "public",   showInFooter: false, showInHeader: true,  views: 1248200,updated: "2025-03-25", author: "Sumi A.",      parent: null, sortOrder: 5 },
  { id: "PG-111", title: "Careers",               slug: "careers",          template: "default",  status: "published", visibility: "public",   showInFooter: true,  showInHeader: false, views: 18200,  updated: "2025-01-10", author: "Rashed K.",    parent: null, sortOrder: 15 },
  { id: "PG-112", title: "Press & Media",         slug: "press",            template: "default",  status: "published", visibility: "public",   showInFooter: true,  showInHeader: false, views: 8400,   updated: "2024-10-20", author: "Mahir H.",     parent: null, sortOrder: 16 },
  { id: "PG-113", title: "Black Friday 2025",     slug: "black-friday-2025",template: "campaign", status: "draft",     visibility: "internal", showInFooter: false, showInHeader: false, views: 0,      updated: "2025-03-30", author: "Tanjila A.",   parent: null, sortOrder: 20 },
  { id: "PG-114", title: "Wholesale Program",     slug: "wholesale",        template: "landing",  status: "review",    visibility: "public",   showInFooter: true,  showInHeader: false, views: 0,      updated: "2025-03-12", author: "Imran S.",     parent: null, sortOrder: 17 },
];

const Icon = ({ d, className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
  </svg>
);

const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k" : String(n));

function StatusPill({ status }) {
  const s = STATUSES.find((x) => x.id === status) || STATUSES[1];
  const map = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    slate:   "bg-slate-500/10 text-slate-400 border-slate-500/20",
    amber:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${map[s.color]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

function PageFormModal({ open, page, onClose, onSave }) {
  const [form, setForm] = useState(() =>
    page || { title: "", slug: "", template: "default", status: "draft",
              visibility: "public", showInFooter: false, showInHeader: false,
              sortOrder: 99, metaTitle: "", metaDescription: "", content: "" }
  );
  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const autoSlug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0f0f17] border border-[#1e1e2e] rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#1e1e2e] flex items-center justify-between sticky top-0 bg-[#0f0f17] z-10">
          <h3 className="text-lg font-bold text-white">{page ? "Edit Page" : "Create Page"}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main col */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Page title</label>
              <input value={form.title}
                onChange={(e) => set("title", e.target.value)}
                onBlur={() => !form.slug && set("slug", autoSlug(form.title))}
                placeholder="e.g. Return & Refund Policy"
                className="w-full px-3 py-2.5 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-white text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">URL slug</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">/p/</span>
                <input value={form.slug} onChange={(e) => set("slug", autoSlug(e.target.value))}
                  className="flex-1 px-3 py-2.5 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-white text-sm font-mono focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Body (markdown / HTML)</label>
              <textarea rows={10} value={form.content} onChange={(e) => set("content", e.target.value)}
                placeholder="## Heading&#10;&#10;Write your page content here…"
                className="w-full px-3 py-2.5 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-white text-sm font-mono resize-none focus:outline-none focus:border-amber-500/50" />
            </div>

            <div className="rounded-xl border border-[#1e1e2e] p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SEO</p>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Meta title</label>
                <input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)}
                  placeholder={form.title || "Meta title"}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Meta description</label>
                <textarea rows={2} value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-white text-sm resize-none" />
                <p className="text-[10px] text-slate-600 mt-1">{(form.metaDescription || "").length}/160</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[#1e1e2e] p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Publish</p>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Status</label>
                <select value={form.status} onChange={(e) => set("status", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-white text-sm">
                  {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Visibility</label>
                <select value={form.visibility} onChange={(e) => set("visibility", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-white text-sm">
                  {VISIBILITY.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Sort order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", +e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-white text-sm" />
              </div>
            </div>

            <div className="rounded-xl border border-[#1e1e2e] p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Template</p>
              <div className="space-y-2">
                {TEMPLATES.map((t) => (
                  <label key={t.id} className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer border ${form.template === t.id ? "border-amber-500/40 bg-amber-500/5" : "border-[#1e1e2e] hover:bg-[#1a1a26]"}`}>
                    <input type="radio" name="tpl" checked={form.template === t.id} onChange={() => set("template", t.id)}
                      className="mt-1 accent-amber-500" />
                    <div>
                      <p className="text-sm text-white font-medium">{t.name}</p>
                      <p className="text-[11px] text-slate-500">{t.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#1e1e2e] p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.showInHeader} onChange={(e) => set("showInHeader", e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500" />
                <span className="text-sm text-slate-300">Show in header menu</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.showInFooter} onChange={(e) => set("showInFooter", e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500" />
                <span className="text-sm text-slate-300">Show in footer menu</span>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#1e1e2e] flex items-center justify-end gap-2 sticky bottom-0 bg-[#0f0f17]">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#2a2a3a] text-slate-400 hover:text-white text-sm">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.title || !form.slug}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-sm font-semibold">
            {page ? "Save page" : "Create page"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PagesCMSPage() {
  const [pages, setPages]       = useState(PAGES_SEED);
  const [search, setSearch]     = useState("");
  const [template, setTemplate] = useState("all");
  const [status, setStatus]     = useState("all");
  const [selected, setSelected] = useState([]);
  const [modalOpen, setModal]   = useState(false);
  const [editing, setEditing]   = useState(null);

  const stats = useMemo(() => ({
    total:      pages.length,
    published:  pages.filter((p) => p.status === "published").length,
    drafts:     pages.filter((p) => p.status === "draft").length,
    inFooter:   pages.filter((p) => p.showInFooter).length,
    inHeader:   pages.filter((p) => p.showInHeader).length,
    views:      pages.reduce((a, p) => a + p.views, 0),
  }), [pages]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pages.filter((p) => {
      if (template !== "all" && p.template !== template) return false;
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [pages, search, template, status]);

  const toggleSelected = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const allSelected = filtered.length > 0 && filtered.every((p) => selected.includes(p.id));
  const toggleAll = () =>
    setSelected(allSelected ? selected.filter((id) => !filtered.find((p) => p.id === id)) : filtered.map((p) => p.id));

  const openCreate = () => { setEditing(null); setModal(true); };
  const openEdit   = (p) => { setEditing(p); setModal(true); };
  const duplicate  = (p) => {
    const id = "PG-" + Math.floor(200 + Math.random() * 800);
    setPages((ps) => [{ ...p, id, slug: p.slug + "-copy", title: p.title + " (Copy)", status: "draft", views: 0 }, ...ps]);
  };

  const handleSave = (form) => {
    if (editing) {
      setPages((ps) => ps.map((p) => p.id === editing.id ? { ...p, ...form, updated: new Date().toISOString().slice(0, 10) } : p));
    } else {
      const id = "PG-" + Math.floor(200 + Math.random() * 800);
      setPages((ps) => [{ ...form, id, views: 0, author: "You", parent: null, updated: new Date().toISOString().slice(0, 10) }, ...ps]);
    }
    setModal(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setPages((ps) => ps.filter((p) => p.id !== id));
    setSelected((s) => s.filter((x) => x !== id));
  };

  const bulkPublish = () => {
    setPages((ps) => ps.map((p) => selected.includes(p.id) ? { ...p, status: "published" } : p));
    setSelected([]);
  };
  const bulkDelete = () => {
    if (!confirm(`Delete ${selected.length} page(s)?`)) return;
    setPages((ps) => ps.filter((p) => !selected.includes(p.id)));
    setSelected([]);
  };

  const STATS = [
    { label: "Total Pages",    value: stats.total,         color: "violet" },
    { label: "Published",      value: stats.published,     color: "emerald" },
    { label: "Drafts",         value: stats.drafts,        color: "slate" },
    { label: "In Header",      value: stats.inHeader,      color: "sky" },
    { label: "In Footer",      value: stats.inFooter,      color: "amber" },
    { label: "Total Views",    value: fmt(stats.views),    color: "pink" },
  ];
  const colorMap = {
    violet: "from-violet-500/15 to-violet-500/5 border-violet-500/20 text-violet-400",
    emerald:"from-emerald-500/15 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    slate:  "from-slate-500/15 to-slate-500/5 border-slate-500/20 text-slate-300",
    sky:    "from-sky-500/15 to-sky-500/5 border-sky-500/20 text-sky-400",
    amber:  "from-amber-500/15 to-amber-500/5 border-amber-500/20 text-amber-400",
    pink:   "from-pink-500/15 to-pink-500/5 border-pink-500/20 text-pink-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pages / CMS</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Static pages, landing pages and legal documents shown on the storefront.
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors shadow-lg shadow-amber-900/30">
          <Icon d="M12 4v16m8-8H4" className="w-4 h-4" />
          New Page
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className={`rounded-xl border bg-gradient-to-br p-4 ${colorMap[s.color]}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Icon d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages by title or slug…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0f0f17] border border-[#1e1e2e] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40" />
        </div>
        <select value={template} onChange={(e) => setTemplate(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-[#0f0f17] border border-[#1e1e2e] text-slate-300 text-sm">
          <option value="all">All templates</option>
          {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-[#0f0f17] border border-[#1e1e2e] text-slate-300 text-sm">
          <option value="all">All status</option>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex-wrap">
          <span className="text-sm font-semibold text-amber-300">{selected.length} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={bulkPublish} className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold">✓ Publish</button>
            <button onClick={bulkDelete}  className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold">🗑 Delete</button>
            <button onClick={() => setSelected([])} className="px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-500 hover:text-slate-300 text-xs">Clear</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a12] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0f0f17] border-b border-[#1e1e2e]">
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded accent-amber-500" />
                </th>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3">Navigation</th>
                <th className="px-4 py-3 text-right">Views</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2e]">
              {filtered.map((p) => {
                const tpl = TEMPLATES.find((t) => t.id === p.template);
                return (
                  <tr key={p.id} className="hover:bg-[#0f0f17] transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelected(p.id)} className="w-4 h-4 rounded accent-amber-500" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{p.title}</p>
                      <p className="text-xs text-slate-500 font-mono">/p/{p.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-[#1a1a26] border border-[#2a2a3a] text-slate-300 text-[11px] font-semibold">{tpl?.name}</span>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400 capitalize">{p.visibility}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {p.showInHeader && <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-semibold">HEADER</span>}
                        {p.showInFooter && <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-semibold">FOOTER</span>}
                        {!p.showInHeader && !p.showInFooter && <span className="text-slate-600 text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 font-mono text-xs">{fmt(p.views)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      <div>{p.updated}</div>
                      <div className="text-slate-600">by {p.author}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-[#1e1e2e] text-slate-400 hover:text-white" title="Edit">
                          <Icon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </button>
                        <button onClick={() => duplicate(p)} className="p-1.5 rounded hover:bg-[#1e1e2e] text-slate-400 hover:text-white" title="Duplicate">
                          <Icon d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400" title="Delete">
                          <Icon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-16 text-center text-slate-500 text-sm">No pages match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PageFormModal open={modalOpen} page={editing} onClose={() => { setModal(false); setEditing(null); }} onSave={handleSave} />
    </div>
  );
}
