'use client';
// 📁 PATH: src/app/(admin)/dashboard/banners/page.jsx

import { useMemo, useState } from 'react';
import BannerFormModal, { PLACEMENTS, STATUSES } from '@/components/admin/banners/BannerFormModal';
import {
  useAdminBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  useToggleBannerStatus,
} from '@/hooks/useBanners';

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
  live:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  scheduled: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  paused:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  expired:   'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  draft:     'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

function StatusPill({ status }) {
  const label = STATUSES.find((s) => s.id === status)?.label ?? status;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${STATUS_COLOR[status] ?? STATUS_COLOR.draft}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${status === 'live' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] overflow-hidden animate-pulse">
      <div className="aspect-[16/7] bg-[#1a1a26]" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-[#1a1a26]" />
        <div className="h-3 w-1/2 rounded bg-[#1a1a26]" />
        <div className="grid grid-cols-3 gap-2">
          {[0,1,2].map((i) => <div key={i} className="h-10 rounded-lg bg-[#1a1a26]" />)}
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-[#1a1a26]" />
        </td>
      ))}
    </tr>
  );
}

// ─── Stats color map ──────────────────────────────────────────────────────────
const STAT_COLORS = {
  violet:  'from-violet-500/15 to-violet-500/5 border-violet-500/20 text-violet-400',
  emerald: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  sky:     'from-sky-500/15 to-sky-500/5 border-sky-500/20 text-sky-400',
  amber:   'from-amber-500/15 to-amber-500/5 border-amber-500/20 text-amber-400',
  pink:    'from-pink-500/15 to-pink-500/5 border-pink-500/20 text-pink-400',
  slate:   'from-slate-500/15 to-slate-500/5 border-slate-500/20 text-slate-300',
};

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1a1a26] flex items-center justify-center mb-4">
        <Icon d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-.293.707L13 15.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-5.586L4.293 7.707A1 1 0 014 7V5z" className="w-8 h-8 text-slate-600" />
      </div>
      <p className="text-slate-400 font-medium mb-1">No banners found</p>
      <p className="text-slate-600 text-sm mb-4">Try adjusting your filters or create a new banner</p>
      <button
        onClick={onAdd}
        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors"
      >
        + New Banner
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Page
// ══════════════════════════════════════════════════════════════════════════════
export default function BannersPage() {

  // ── Filter state ────────────────────────────────────────────────────────────
  const [search,    setSearch]    = useState('');
  const [placement, setPlacement] = useState('all');
  const [status,    setStatus]    = useState('all');

  // ── UI state ────────────────────────────────────────────────────────────────
  const [view,      setView]      = useState('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useAdminBanners({
    search,
    placement,
    status,
  });

  const banners = data?.banners ?? [];
  const stats   = data?.stats   ?? {};

  // ── Client-side filter (debounce ছাড়া কাজ করার জন্য) ───────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return banners.filter((b) => {
      if (placement !== 'all' && b.placement !== placement) return false;
      if (status    !== 'all' && b.status    !== status)    return false;
      if (q && !b.title.toLowerCase().includes(q))          return false;
      return true;
    });
  }, [banners, search, placement, status]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  const toggleStatus = useToggleBannerStatus();

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (b)  => { setEditing(b);   setModalOpen(true); };
  const closeModal = ()   => { setEditing(null); setModalOpen(false); };

  const handleSave = async (formData) => {
    if (editing) {
      await updateBanner.mutateAsync({ id: editing._id, data: formData });
    } else {
      await createBanner.mutateAsync(formData);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this banner? This action cannot be undone.')) return;
    deleteBanner.mutate(id);
  };

  const handleToggle = (id) => toggleStatus.mutate(id);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const STATS_CONFIG = [
    { label: 'Total Banners', value: stats.total       ?? 0,                   color: 'violet' },
    { label: 'Live Now',      value: stats.live        ?? 0,                   color: 'emerald' },
    { label: 'Scheduled',     value: stats.scheduled   ?? 0,                   color: 'sky' },
    { label: 'Paused',        value: stats.paused      ?? 0,                   color: 'amber' },
    { label: 'Total Clicks',  value: fmt(stats.clicks  ?? 0),                  color: 'pink' },
    { label: 'Impressions',   value: fmt(stats.impressions ?? 0),              color: 'slate' },
  ];

  const isSaving =
    createBanner.isPending || updateBanner.isPending;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Banners / Sliders</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Hero sliders, promo strips and category banners across the storefront.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-[#1e1e2e] overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${view === 'grid' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              ▦ Grid
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${view === 'table' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              ☰ Table
            </button>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold shadow-lg shadow-amber-900/30 transition-colors"
          >
            <Icon d="M12 4v16m8-8H4" />
            New Banner
          </button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATS_CONFIG.map((s) => (
          <div key={s.label} className={`rounded-xl border bg-gradient-to-br p-4 ${STAT_COLORS[s.color]}`}>
            {isLoading ? (
              <div className="h-7 w-10 rounded bg-white/5 animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-bold">{s.value}</p>
            )}
            <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Icon
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search banners by name…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0f0f17] border border-[#1e1e2e] text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <Icon d="M6 18L18 6M6 6l12 12" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={placement}
          onChange={(e) => setPlacement(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-[#0f0f17] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
        >
          <option value="all">All placements</option>
          {PLACEMENTS.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-[#0f0f17] border border-[#1e1e2e] text-slate-300 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
        >
          <option value="all">All status</option>
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* ── Error state ─────────────────────────────────────────────────────── */}
      {isError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center justify-between">
          <p className="text-red-400 text-sm">Failed to load banners.</p>
          <button
            onClick={() => refetch()}
            className="text-xs text-red-400 hover:text-red-300 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          GRID VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {isLoading
            ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
            : filtered.length === 0
            ? <EmptyState onAdd={openCreate} />
            : filtered.map((b) => {
                const place = PLACEMENTS.find((p) => p.id === b.placement);
                const ctr   = b.impressions ? ((b.clicks / b.impressions) * 100).toFixed(2) : '0.00';
                return (
                  <div
                    key={b._id}
                    className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] overflow-hidden group hover:border-amber-500/30 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[16/7] relative bg-gradient-to-br from-[#1a1a26] to-[#0a0a12]">
                      {b.image ? (
                        <img
                          src={b.image}
                          alt={b.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
                          No image
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <StatusPill status={b.status} />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-white font-semibold truncate">{b.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {place?.name} · Priority #{b.priority}
                        </p>
                      </div>

                      {/* Analytics */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-[#1a1a26] p-2">
                          <p className="text-sm font-bold text-white">{fmt(b.impressions)}</p>
                          <p className="text-[10px] text-slate-500 uppercase">Views</p>
                        </div>
                        <div className="rounded-lg bg-[#1a1a26] p-2">
                          <p className="text-sm font-bold text-white">{fmt(b.clicks)}</p>
                          <p className="text-[10px] text-slate-500 uppercase">Clicks</p>
                        </div>
                        <div className="rounded-lg bg-[#1a1a26] p-2">
                          <p className="text-sm font-bold text-emerald-400">{ctr}%</p>
                          <p className="text-[10px] text-slate-500 uppercase">CTR</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#1e1e2e]">
                        <button
                          onClick={() => handleToggle(b._id)}
                          disabled={toggleStatus.isPending}
                          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                            b.status === 'live'
                              ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {b.status === 'live' ? '⏸ Pause' : '▶ Activate'}
                        </button>
                        <button
                          onClick={() => openEdit(b)}
                          className="px-3 py-1.5 rounded-lg bg-[#1a1a26] hover:bg-[#252535] text-slate-300 text-xs font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(b._id)}
                          disabled={deleteBanner.isPending}
                          className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <Icon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TABLE VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {view === 'table' && (
        <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a12] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0f0f17] border-b border-[#1e1e2e]">
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Banner</th>
                  <th className="px-4 py-3">Placement</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3 text-right">Impressions</th>
                  <th className="px-4 py-3 text-right">Clicks</th>
                  <th className="px-4 py-3 text-right">CTR</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2e]">
                {isLoading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-slate-500 text-sm">
                      No banners match these filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => {
                    const place = PLACEMENTS.find((p) => p.id === b.placement);
                    const ctr   = b.impressions
                      ? ((b.clicks / b.impressions) * 100).toFixed(2)
                      : '0.00';
                    const toDate = (v) =>
                      v ? new Date(v).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';

                    return (
                      <tr key={b._id} className="hover:bg-[#0f0f17] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-md overflow-hidden bg-[#1a1a26] flex-shrink-0">
                              {b.image && (
                                <img src={b.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium truncate">{b.title}</p>
                              <p className="text-[11px] text-slate-500">#{b.priority}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">
                          {place?.name ?? b.placement}
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill status={b.status} />
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                          {toDate(b.startsAt)}<br />→ {toDate(b.endsAt)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">
                          {fmt(b.impressions)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">
                          {fmt(b.clicks)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">
                          {ctr}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => handleToggle(b._id)}
                              disabled={toggleStatus.isPending}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-[#1a1a26] hover:bg-[#252535] text-slate-300 transition-colors disabled:opacity-50"
                            >
                              {b.status === 'live' ? 'Pause' : 'Activate'}
                            </button>
                            <button
                              onClick={() => openEdit(b)}
                              className="p-1.5 rounded hover:bg-[#1e1e2e] text-slate-400 hover:text-white transition-colors"
                            >
                              <Icon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </button>
                            <button
                              onClick={() => handleDelete(b._id)}
                              disabled={deleteBanner.isPending}
                              className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
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
        </div>
      )}

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      <BannerFormModal
        open={modalOpen}
        editing={editing}
        isSaving={isSaving}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}