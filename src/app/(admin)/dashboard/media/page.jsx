"use client";

import { useMemo, useRef, useState } from "react";

/* ============================================================================
   MOOM24 — Media Library
   Drop at: src/app/(admin)/dashboard/media/page.jsx
   Manage all uploaded assets: images, videos, documents.
============================================================================ */

const FOLDERS = [
  { id: "all",       name: "All Files",      icon: "📁" },
  { id: "products",  name: "Products",       icon: "🛍️" },
  { id: "banners",   name: "Banners",        icon: "🖼️" },
  { id: "blog",      name: "Blog",           icon: "📝" },
  { id: "brands",    name: "Brand Logos",    icon: "🏷️" },
  { id: "users",     name: "User Avatars",   icon: "👤" },
  { id: "documents", name: "Documents",      icon: "📄" },
  { id: "videos",    name: "Videos",         icon: "🎬" },
];

const TYPES = ["all", "image", "video", "document"];

const MEDIA_SEED = [
  { id: "M-3001", name: "hero-eid-2025.jpg",          folder: "banners",  type: "image",    size: 482300, w: 1920, h: 720,  url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400", uploaded: "2025-03-25", by: "Tanjila A.", usedIn: 4 },
  { id: "M-3002", name: "iphone-16-pro.jpg",          folder: "products", type: "image",    size: 184200, w: 800,  h: 800,  url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400", uploaded: "2025-03-12", by: "Rashed K.",  usedIn: 12 },
  { id: "M-3003", name: "samsung-s25-ultra.jpg",      folder: "products", type: "image",    size: 192400, w: 800,  h: 800,  url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400", uploaded: "2025-03-10", by: "Rashed K.",  usedIn: 9 },
  { id: "M-3004", name: "smart-home-cover.jpg",       folder: "blog",     type: "image",    size: 240100, w: 1200, h: 630,  url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400", uploaded: "2025-01-12", by: "Tanjila A.", usedIn: 1 },
  { id: "M-3005", name: "skincare-products.jpg",      folder: "blog",     type: "image",    size: 198600, w: 1200, h: 630,  url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400", uploaded: "2025-02-19", by: "Sumi A.",    usedIn: 2 },
  { id: "M-3006", name: "apple-logo.png",             folder: "brands",   type: "image",    size: 12400,  w: 256,  h: 256,  url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200", uploaded: "2024-09-04", by: "Imran S.",   usedIn: 38 },
  { id: "M-3007", name: "samsung-logo.png",           folder: "brands",   type: "image",    size: 14800,  w: 256,  h: 256,  url: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=200", uploaded: "2024-09-04", by: "Imran S.",   usedIn: 42 },
  { id: "M-3008", name: "promo-video-30s.mp4",        folder: "videos",   type: "video",    size: 8420000,w: 1920, h: 1080, url: "", uploaded: "2025-03-20", by: "Mahir H.",   usedIn: 2 },
  { id: "M-3009", name: "unboxing-laptop.mp4",        folder: "videos",   type: "video",    size: 14200000,w: 1920,h: 1080, url: "", uploaded: "2025-02-08", by: "Mahir H.",   usedIn: 1 },
  { id: "M-3010", name: "shipping-policy-v3.pdf",     folder: "documents",type: "document", size: 84200,  w: 0,    h: 0,    url: "", uploaded: "2024-12-14", by: "Rashed K.",  usedIn: 1 },
  { id: "M-3011", name: "seller-handbook.pdf",        folder: "documents",type: "document", size: 1842000,w: 0,    h: 0,    url: "", uploaded: "2025-01-08", by: "Tanjila A.", usedIn: 3 },
  { id: "M-3012", name: "user-avatar-default.png",    folder: "users",    type: "image",    size: 4200,   w: 256,  h: 256,  url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200", uploaded: "2024-08-01", by: "System",     usedIn: 1820 },
  { id: "M-3013", name: "headphones-black.jpg",       folder: "products", type: "image",    size: 168400, w: 800,  h: 800,  url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400", uploaded: "2025-02-22", by: "Rashed K.",  usedIn: 6 },
  { id: "M-3014", name: "smart-watch.jpg",            folder: "products", type: "image",    size: 174200, w: 800,  h: 800,  url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400", uploaded: "2025-02-19", by: "Rashed K.",  usedIn: 8 },
  { id: "M-3015", name: "ramadan-banner.jpg",         folder: "banners",  type: "image",    size: 412800, w: 1920, h: 720,  url: "https://images.unsplash.com/photo-1614849963640-9cc74b2a826f?w=400", uploaded: "2025-02-28", by: "Sumi A.",    usedIn: 2 },
  { id: "M-3016", name: "winter-collection.jpg",      folder: "banners",  type: "image",    size: 380200, w: 1920, h: 720,  url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400", uploaded: "2024-12-01", by: "Tanjila A.", usedIn: 1 },
  { id: "M-3017", name: "running-shoes.jpg",          folder: "products", type: "image",    size: 158400, w: 800,  h: 800,  url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", uploaded: "2025-03-05", by: "Imran S.",   usedIn: 11 },
  { id: "M-3018", name: "kitchen-blender.jpg",        folder: "products", type: "image",    size: 142800, w: 800,  h: 800,  url: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400", uploaded: "2025-02-14", by: "Imran S.",   usedIn: 4 },
];

const Icon = ({ d, className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
  </svg>
);

const fmtSize = (b) => {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  if (b < 1024 * 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + " MB";
  return (b / 1024 / 1024 / 1024).toFixed(2) + " GB";
};

function FilePreview({ file, className = "" }) {
  if (file.type === "image" && file.url) {
    return <img src={file.url} alt={file.name} className={`object-cover ${className}`} loading="lazy" />;
  }
  const emoji = file.type === "video" ? "🎬" : file.type === "document" ? "📄" : "🖼️";
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-[#1a1a26] to-[#0f0f17] ${className}`}>
      <span className="text-4xl">{emoji}</span>
    </div>
  );
}

function DetailDrawer({ file, onClose, onDelete, onCopy }) {
  if (!file) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose}>
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0f0f17] border-l border-[#1e1e2e] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between sticky top-0 bg-[#0f0f17]">
          <h3 className="text-white font-bold truncate">{file.name}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl leading-none">×</button>
        </div>
        <FilePreview file={file} className="w-full aspect-video" />
        <div className="p-5 space-y-4">
          <button onClick={() => onCopy(file)} className="w-full px-3 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold">
            Copy file URL
          </button>

          <div className="rounded-xl border border-[#1e1e2e] divide-y divide-[#1e1e2e]">
            {[
              ["ID", file.id],
              ["Type", file.type],
              ["Size", fmtSize(file.size)],
              ["Dimensions", file.w ? `${file.w} × ${file.h}` : "—"],
              ["Folder", file.folder],
              ["Uploaded", file.uploaded],
              ["Uploaded by", file.by],
              ["Used in", file.usedIn + " place(s)"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-3 py-2.5">
                <span className="text-xs text-slate-500 uppercase tracking-wider">{k}</span>
                <span className="text-sm text-slate-200">{v}</span>
              </div>
            ))}
          </div>

          <button onClick={() => onDelete(file.id)} disabled={file.usedIn > 0}
            className="w-full px-3 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
            {file.usedIn > 0 ? `Cannot delete — used in ${file.usedIn} place(s)` : "🗑 Delete file"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MediaLibraryPage() {
  const [files, setFiles]       = useState(MEDIA_SEED);
  const [folder, setFolder]     = useState("all");
  const [type, setType]         = useState("all");
  const [search, setSearch]     = useState("");
  const [sort, setSort]         = useState("recent");
  const [view, setView]         = useState("grid");
  const [selected, setSelected] = useState([]);
  const [openFile, setOpenFile] = useState(null);
  const [toast, setToast]       = useState("");
  const fileInputRef            = useRef(null);

  const stats = useMemo(() => {
    const totalBytes = files.reduce((a, f) => a + f.size, 0);
    return {
      total:     files.length,
      images:    files.filter((f) => f.type === "image").length,
      videos:    files.filter((f) => f.type === "video").length,
      documents: files.filter((f) => f.type === "document").length,
      size:      fmtSize(totalBytes),
      unused:    files.filter((f) => f.usedIn === 0).length,
    };
  }, [files]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let arr = files.filter((f) => {
      if (folder !== "all" && f.folder !== folder) return false;
      if (type !== "all" && f.type !== type) return false;
      if (!q) return true;
      return f.name.toLowerCase().includes(q);
    });
    if (sort === "recent") arr = arr.slice().sort((a, b) => b.uploaded.localeCompare(a.uploaded));
    if (sort === "name")   arr = arr.slice().sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "size")   arr = arr.slice().sort((a, b) => b.size - a.size);
    if (sort === "used")   arr = arr.slice().sort((a, b) => b.usedIn - a.usedIn);
    return arr;
  }, [files, folder, type, search, sort]);

  const toggleSelected = (id) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const allSelected = filtered.length > 0 && filtered.every((f) => selected.includes(f.id));
  const toggleAll = () =>
    setSelected(allSelected ? selected.filter((id) => !filtered.find((f) => f.id === id)) : filtered.map((f) => f.id));

  const handleUpload = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    const today = new Date().toISOString().slice(0, 10);
    const added = list.map((f, i) => {
      const t = f.type.startsWith("image/") ? "image" : f.type.startsWith("video/") ? "video" : "document";
      return {
        id: "M-" + Math.floor(3000 + Math.random() * 9000),
        name: f.name,
        folder: folder === "all" ? (t === "video" ? "videos" : t === "document" ? "documents" : "products") : folder,
        type: t,
        size: f.size,
        w: 0, h: 0,
        url: t === "image" ? URL.createObjectURL(f) : "",
        uploaded: today,
        by: "You",
        usedIn: 0,
      };
    });
    setFiles((arr) => [...added, ...arr]);
    setToast(`✓ Uploaded ${added.length} file(s)`);
    setTimeout(() => setToast(""), 2500);
    e.target.value = "";
  };

  const copyUrl = (file) => {
    const url = file.url || `https://cdn.moom24.com/media/${file.id}/${file.name}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    setToast("✓ URL copied to clipboard");
    setTimeout(() => setToast(""), 2000);
  };

  const handleDelete = (id) => {
    const f = files.find((x) => x.id === id);
    if (f && f.usedIn > 0) { alert(`Cannot delete — file is used in ${f.usedIn} place(s).`); return; }
    if (!confirm("Delete this file?")) return;
    setFiles((arr) => arr.filter((f) => f.id !== id));
    setSelected((s) => s.filter((x) => x !== id));
    setOpenFile(null);
  };

  const bulkDelete = () => {
    const blocked = files.filter((f) => selected.includes(f.id) && f.usedIn > 0);
    if (blocked.length) { alert(`${blocked.length} file(s) are in use and were skipped.`); }
    if (!confirm(`Delete ${selected.length - blocked.length} file(s)?`)) return;
    setFiles((arr) => arr.filter((f) => !selected.includes(f.id) || f.usedIn > 0));
    setSelected([]);
  };

  const moveFolderBulk = (target) => {
    setFiles((arr) => arr.map((f) => selected.includes(f.id) ? { ...f, folder: target } : f));
    setSelected([]);
  };

  const STATS = [
    { label: "Total Files", value: stats.total,     color: "violet" },
    { label: "Images",      value: stats.images,    color: "sky" },
    { label: "Videos",      value: stats.videos,    color: "pink" },
    { label: "Documents",   value: stats.documents, color: "amber" },
    { label: "Storage Used",value: stats.size,      color: "emerald" },
    { label: "Unused",      value: stats.unused,    color: "slate" },
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
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Media Library</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            All images, videos and documents used across the storefront.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors shadow-lg shadow-amber-900/30">
            <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            Upload files
          </button>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] p-2">
            <p className="px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Folders</p>
            {FOLDERS.map((f) => (
              <button key={f.id} onClick={() => setFolder(f.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${folder === f.id ? "bg-amber-500/10 text-amber-300" : "text-slate-300 hover:bg-[#1a1a26]"}`}>
                <span>{f.icon}</span>
                <span className="flex-1 text-left">{f.name}</span>
                <span className="text-[10px] text-slate-500">
                  {f.id === "all" ? files.length : files.filter((x) => x.folder === f.id).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Icon d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by filename…"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0f0f17] border border-[#1e1e2e] text-white text-sm" />
            </div>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-[#0f0f17] border border-[#1e1e2e] text-slate-300 text-sm">
              {TYPES.map((t) => <option key={t} value={t}>{t === "all" ? "All types" : t}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-[#0f0f17] border border-[#1e1e2e] text-slate-300 text-sm">
              <option value="recent">Most recent</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">Largest first</option>
              <option value="used">Most used</option>
            </select>
            <div className="flex items-center rounded-lg border border-[#1e1e2e] overflow-hidden">
              <button onClick={() => setView("grid")} className={`px-3 py-2 text-xs font-semibold ${view === "grid" ? "bg-amber-500 text-black" : "text-slate-400"}`}>▦</button>
              <button onClick={() => setView("list")} className={`px-3 py-2 text-xs font-semibold ${view === "list" ? "bg-amber-500 text-black" : "text-slate-400"}`}>☰</button>
            </div>
          </div>

          {/* Bulk bar */}
          {selected.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex-wrap">
              <span className="text-sm font-semibold text-amber-300">{selected.length} selected</span>
              <select onChange={(e) => { if (e.target.value) { moveFolderBulk(e.target.value); e.target.value = ""; }}}
                className="px-3 py-1.5 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-slate-300 text-xs ml-auto">
                <option value="">Move to folder…</option>
                {FOLDERS.filter((f) => f.id !== "all").map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <button onClick={bulkDelete} className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold">🗑 Delete</button>
              <button onClick={() => setSelected([])} className="px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-500 text-xs">Clear</button>
            </div>
          )}

          {/* Grid view */}
          {view === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map((f) => {
                const isSel = selected.includes(f.id);
                return (
                  <div key={f.id}
                    className={`group relative rounded-xl border overflow-hidden bg-[#0f0f17] cursor-pointer transition-all ${isSel ? "border-amber-500 ring-2 ring-amber-500/30" : "border-[#1e1e2e] hover:border-amber-500/30"}`}>
                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition" style={{ opacity: isSel ? 1 : undefined }}>
                      <input type="checkbox" checked={isSel} onChange={() => toggleSelected(f.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded accent-amber-500" />
                    </div>
                    <div onClick={() => setOpenFile(f)}>
                      <FilePreview file={f} className="w-full aspect-square" />
                      <div className="p-2">
                        <p className="text-xs text-white truncate font-medium">{f.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-slate-500">{fmtSize(f.size)}</span>
                          {f.usedIn > 0 && <span className="text-[10px] text-emerald-400">● used</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 text-sm">No files match these filters.</div>
              )}
            </div>
          )}

          {/* List view */}
          {view === "list" && (
            <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a12] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#0f0f17] border-b border-[#1e1e2e]">
                    <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3 w-10">
                        <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded accent-amber-500" />
                      </th>
                      <th className="px-4 py-3">File</th>
                      <th className="px-4 py-3">Folder</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Size</th>
                      <th className="px-4 py-3 text-right">Used</th>
                      <th className="px-4 py-3">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e2e]">
                    {filtered.map((f) => (
                      <tr key={f.id} className="hover:bg-[#0f0f17] cursor-pointer" onClick={() => setOpenFile(f)}>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggleSelected(f.id)} className="w-4 h-4 rounded accent-amber-500" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <FilePreview file={f} className="w-10 h-10 rounded-md flex-shrink-0" />
                            <span className="text-white">{f.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs capitalize">{f.folder}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs capitalize">{f.type}</td>
                        <td className="px-4 py-3 text-right text-slate-400 font-mono text-xs">{fmtSize(f.size)}</td>
                        <td className="px-4 py-3 text-right text-slate-400 text-xs">{f.usedIn}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{f.uploaded} · {f.by}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-16 text-center text-slate-500 text-sm">No files match these filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <DetailDrawer file={openFile} onClose={() => setOpenFile(null)} onDelete={handleDelete} onCopy={copyUrl} />
    </div>
  );
}
