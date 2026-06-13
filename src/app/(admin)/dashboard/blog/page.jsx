'use client';

import { useMemo, useState } from 'react';
import BlogFormModal, { BLOG_CATEGORIES, BLOG_STATUSES } from '@/components/admin/blog/BlogFormModal';
import {
  useAdminBlogs,
  useCreateBlog,
  useUpdateBlog,
  useDeleteBlog,
  useBulkDeleteBlogs,
  useBulkUpdateBlogStatus,
  useToggleBlogFeatured,
} from '@/hooks/useBlog';


// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + 'M'
    : n >= 1000
    ? (n / 1000).toFixed(n >= 10_000 ? 0 : 1) + 'k'
    : String(n ?? 0);

const Icon = ({ d, className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
  </svg>
);

// ─── Status Pill ──────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  scheduled: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  review:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  draft:     'bg-slate-500/10 text-slate-400 border-slate-500/20',
  archived:  'bg-zinc-500/10  text-zinc-400  border-zinc-500/20',
};

function StatusPill({ status }) {
  const label = BLOG_STATUSES.find((s) => s.id === status)?.label ?? status;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${STATUS_COLOR[status] ?? STATUS_COLOR.draft}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${status === 'published' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(9)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-[#1a1a26]" />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] overflow-hidden animate-pulse">
      <div className="aspect-video bg-[#1a1a26]" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-[#1a1a26]" />
        <div className="h-3 w-1/2 rounded bg-[#1a1a26]" />
        <div className="h-3 w-full rounded bg-[#1a1a26]" />
      </div>
    </div>
  );
}

// ─── Stats color map ──────────────────────────────────────────────────────────
const STAT_COLORS = {
  violet:  'from-violet-500/15 to-violet-500/5 border-violet-500/20 text-violet-400',
  emerald: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  slate:   'from-slate-500/15 to-slate-500/5 border-slate-500/20 text-slate-300',
  sky:     'from-sky-500/15 to-sky-500/5 border-sky-500/20 text-sky-400',
  amber:   'from-amber-500/15 to-amber-500/5 border-amber-500/20 text-amber-400',
  pink:    'from-pink-500/15 to-pink-500/5 border-pink-500/20 text-pink-400',
};

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────
function BulkBar({ count, onPublish, onArchive, onDelete, onClear }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex-wrap">
      <span className="text-sm font-semibold text-amber-300">{count} selected</span>
      <div className="flex items-center gap-2 ml-auto flex-wrap">
        <button
          onClick={onPublish}
          className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
        >
          ✓ Publish
        </button>
        <button
          onClick={onArchive}
          className="px-3 py-1.5 rounded-lg bg-slate-600/80 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
        >
          📦 Archive
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
        >
          🗑 Delete
        </button>
        <button
          onClick={onClear}
          className="px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-500 hover:text-slate-300 text-xs transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1a1a26] flex items-center justify-center mb-4">
        <Icon
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          className="w-8 h-8 text-slate-600"
        />
      </div>
      <p className="text-slate-400 font-medium mb-1">No blog posts found</p>
      <p className="text-slate-600 text-sm mb-4">Adjust your filters or create a new post</p>
      <button
        onClick={onAdd}
        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors"
      >
        + New Post
      </button>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────
function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
        <Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-slate-400 font-medium mb-2">Failed to load blog posts</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-lg bg-[#1a1a26] border border-[#2a2a3a] text-slate-300 hover:text-white text-sm transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Page
// ══════════════════════════════════════════════════════════════════════════════
export default function BlogPage() {

  // ── Filter state ─────────────────────────────────────────────────────────
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [status,   setStatus]   = useState('all');

  // ── UI state ──────────────────────────────────────────────────────────────
  const [view,      setView]      = useState('table'); // table | grid
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [selected,  setSelected]  = useState([]);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useAdminBlogs({
    search,
    category,
    status,
  });

  const posts = data?.posts ?? [];
  const stats = data?.stats  ?? {};

  // ── Client-side filter ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return posts.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (status   !== 'all' && p.status   !== status)   return false;
      if (q && !p.title.toLowerCase().includes(q) &&
               !p.slug.toLowerCase().includes(q)  &&
               !(p.tags || []).some((t) => t.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [posts, search, category, status]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createBlog      = useCreateBlog();
  const updateBlog      = useUpdateBlog();
  const deleteBlog      = useDeleteBlog();
  const bulkDelete      = useBulkDeleteBlogs();
  const bulkStatus      = useBulkUpdateBlogStatus();
  const toggleFeatured  = useToggleBlogFeatured();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (p) => { setEditing(p);   setModalOpen(true); };
  const closeModal = ()  => { setEditing(null); setModalOpen(false); };

  const handleSave = (formData) => {
    if (editing) {
      updateBlog.mutate(
        { id: editing._id, data: formData },
        { onSuccess: closeModal }
      );
    } else {
      createBlog.mutate(formData, { onSuccess: closeModal });
    }
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this blog post? This cannot be undone.')) return;
    deleteBlog.mutate(id);
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selected.length} post(s)? This cannot be undone.`)) return;
    bulkDelete.mutate(selected, { onSuccess: () => setSelected([]) });
  };

  const handleBulkPublish = () => {
    bulkStatus.mutate(
      { ids: selected, status: 'published' },
      { onSuccess: () => setSelected([]) }
    );
  };

  const handleBulkArchive = () => {
    bulkStatus.mutate(
      { ids: selected, status: 'archived' },
      { onSuccess: () => setSelected([]) }
    );
  };

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const allSelected = filtered.length > 0 && filtered.every((p) => selected.includes(p._id));
  const toggleAll   = () =>
    setSelected(
      allSelected
        ? selected.filter((id) => !filtered.find((p) => p._id === id))
        : filtered.map((p) => p._id)
    );

  // ── Stats cards ───────────────────────────────────────────────────────────
  const STAT_CARDS = [
    { label: 'Total Posts',  value: stats.total     ?? 0,          color: 'violet'  },
    { label: 'Published',    value: stats.published ?? 0,          color: 'emerald' },
    { label: 'Drafts',       value: stats.draft     ?? 0,          color: 'slate'   },
    { label: 'Scheduled',    value: stats.scheduled ?? 0,          color: 'sky'     },
    { label: 'Total Views',  value: fmt(stats.totalViews ?? 0),    color: 'amber'   },
    { label: 'Featured',     value: stats.featured  ?? 0,          color: 'pink'    },
  ];

  const isMutating =
    createBlog.isPending ||
    updateBlog.isPending;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Blog</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage articles, tutorials and announcements published on the storefront.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-[#1e1e2e] overflow-hidden">
            <button
              onClick={() => setView('table')}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                view === 'table' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              ☰ Table
            </button>
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                view === 'grid' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              ▦ Grid
            </button>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors shadow-lg shadow-amber-900/30"
          >
            <Icon d="M12 4v16m8-8H4" className="w-4 h-4" />
            New Post
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border bg-gradient-to-br p-4 ${STAT_COLORS[s.color]}`}
          >
            {isLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-7 w-12 rounded bg-white/5" />
                <div className="h-3 w-full rounded bg-white/5" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider">{s.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Icon
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, slug, or tag…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0f0f17] border border-[#1e1e2e] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-[#0f0f17] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-amber-500/40"
        >
          <option value="all">All Categories</option>
          {BLOG_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-[#0f0f17] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-amber-500/40"
        >
          <option value="all">All Statuses</option>
          {BLOG_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        {(search || category !== 'all' || status !== 'all') && (
          <button
            onClick={() => { setSearch(''); setCategory('all'); setStatus('all'); }}
            className="px-3 py-2.5 rounded-lg border border-[#1e1e2e] text-slate-500 hover:text-white text-sm transition-colors whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Bulk Bar ── */}
      <BulkBar
        count={selected.length}
        onPublish={handleBulkPublish}
        onArchive={handleBulkArchive}
        onDelete={handleBulkDelete}
        onClear={() => setSelected([])}
      />

      {/* ── Error ── */}
      {isError && <ErrorState onRetry={refetch} />}

      {/* ══════════════════════════════════════════════════════════════════════
          TABLE VIEW
      ════════════════════════════════════════════════════════════════════════ */}
      {!isError && view === 'table' && (
        <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a12] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0f0f17] border-b border-[#1e1e2e]">
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      disabled={isLoading || filtered.length === 0}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                  </th>
                  <th className="px-4 py-3">Post</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Views</th>
                  <th className="px-4 py-3 text-right">Engagement</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2e]">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <EmptyState onAdd={openCreate} />
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const cat    = BLOG_CATEGORIES.find((c) => c.id === p.category);
                    const author = p.author;
                    const initials = (author?.name || 'AU')
                      .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                    const cover = p.coverImage?.url;

                    return (
                      <tr key={p._id} className="hover:bg-[#0f0f17] transition-colors">
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.includes(p._id)}
                            onChange={() => toggleSelect(p._id)}
                            className="w-4 h-4 rounded accent-amber-500"
                          />
                        </td>

                        {/* Post */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-[260px]">
                            <div className="w-12 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a26] to-[#0f0f17] border border-[#2a2a3a] flex-shrink-0">
                              {cover ? (
                                <img
                                  src={cover}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                  <Icon d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-white font-medium truncate max-w-[260px] text-sm">
                                  {p.title}
                                </p>
                                {p.isFeatured && (
                                  <span className="text-amber-400 text-xs flex-shrink-0">⭐</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-mono truncate">/{p.slug}</p>
                              {p.readTime && (
                                <p className="text-[10px] text-slate-600">{p.readTime} min read</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                            style={{ background: `${cat?.color}22`, color: cat?.color }}
                          >
                            {cat?.name ?? p.category}
                          </span>
                        </td>

                        {/* Author */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {author?.avatar ? (
                              <img
                                src={author.avatar}
                                alt={author.name}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
                                {initials}
                              </div>
                            )}
                            <span className="text-slate-300 text-xs truncate max-w-[100px]">
                              {author?.name ?? '—'}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusPill status={p.status} />
                        </td>

                        {/* Views */}
                        <td className="px-4 py-3 text-right text-slate-300 font-mono text-xs">
                          {fmt(p.views ?? 0)}
                        </td>

                        {/* Engagement */}
                        <td className="px-4 py-3 text-right">
                          <div className="text-xs text-slate-400 space-x-2">
                            <span>♥ {fmt(p.likes ?? 0)}</span>
                            <span>💬 {p.commentsCount ?? 0}</span>
                          </div>
                        </td>

                        {/* Published date */}
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {p.publishedAt
                            ? new Date(p.publishedAt).toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : <span className="text-slate-600">—</span>
                          }
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => toggleFeatured.mutate(p._id)}
                              title={p.isFeatured ? 'Remove featured' : 'Mark featured'}
                              className={`p-1.5 rounded hover:bg-[#1e1e2e] transition-colors ${
                                p.isFeatured ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'
                              }`}
                            >
                              <Icon d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </button>
                            <button
                              onClick={() => openEdit(p)}
                              title="Edit"
                              className="p-1.5 rounded hover:bg-[#1e1e2e] text-slate-400 hover:text-white transition-colors"
                            >
                              <Icon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              title="Delete"
                              className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Icon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Result count */}
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[#1e1e2e] text-xs text-slate-500">
              Showing {filtered.length} of {posts.length} posts
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          GRID VIEW
      ════════════════════════════════════════════════════════════════════════ */}
      {!isError && view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState onAdd={openCreate} />
          ) : (
            filtered.map((p) => {
              const cat    = BLOG_CATEGORIES.find((c) => c.id === p.category);
              const author = p.author;
              const initials = (author?.name || 'AU')
                .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
              const cover = p.coverImage?.url;

              return (
                <div
                  key={p._id}
                  className={`rounded-xl border bg-[#0f0f17] overflow-hidden hover:border-amber-500/30 transition-colors group ${
                    selected.includes(p._id) ? 'border-amber-500/50' : 'border-[#1e1e2e]'
                  }`}
                >
                  {/* Cover */}
                  <div
                    className="relative aspect-video bg-gradient-to-br from-[#1a1a26] to-[#0a0a12] overflow-hidden cursor-pointer"
                    onClick={() => toggleSelect(p._id)}
                  >
                    {cover ? (
                      <img
                        src={cover}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" className="w-12 h-12 text-slate-700" />
                      </div>
                    )}
                    {/* Selection overlay */}
                    {selected.includes(p._id) && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                          <Icon d="M5 13l4 4L19 7" className="w-5 h-5 text-black" />
                        </div>
                      </div>
                    )}
                    {p.isFeatured && (
                      <span className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                        FEATURED
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{ background: `${cat?.color}22`, color: cat?.color }}
                      >
                        {cat?.name ?? p.category}
                      </span>
                      <StatusPill status={p.status} />
                    </div>
                    <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-amber-300 transition-colors">
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-2">{p.excerpt}</p>
                    )}

                    {/* Author row */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#1e1e2e]">
                      <div className="flex items-center gap-2">
                        {author?.avatar ? (
                          <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-[9px] font-bold text-black">
                            {initials}
                          </div>
                        )}
                        <span className="text-xs text-slate-400 truncate max-w-[100px]">
                          {author?.name ?? '—'}
                        </span>
                      </div>
                      {p.readTime && (
                        <span className="text-xs text-slate-600">{p.readTime} min</span>
                      )}
                    </div>

                    {/* Stats + actions */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span>👁 {fmt(p.views ?? 0)}</span>
                        <span>♥ {fmt(p.likes ?? 0)}</span>
                        <span>💬 {p.commentsCount ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFeatured.mutate(p._id)}
                          className={`p-1 rounded hover:bg-[#1e1e2e] transition-colors ${
                            p.isFeatured ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'
                          }`}
                          title={p.isFeatured ? 'Remove featured' : 'Mark featured'}
                        >
                          ⭐
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="text-amber-400 hover:text-amber-300 font-semibold ml-1 text-xs"
                        >
                          Edit →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Form Modal ── */}
      <BlogFormModal
        open={modalOpen}
        post={editing}
        onClose={closeModal}
        onSave={handleSave}
        isSaving={isMutating}
      />
    </div>
  );
}
