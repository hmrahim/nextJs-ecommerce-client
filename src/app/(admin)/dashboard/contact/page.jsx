// 📁 PATH: src/app/(admin)/dashboard/contact/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Mail, Send, Trash2, Loader2, RefreshCw, Phone, Clock } from "lucide-react";
import { contactService } from "@/services/contactService";

const STATUS_META = {
  new:     { dot: "#3b82f6", bg: "rgba(59,130,246,.12)", fg: "#93c5fd", label: "New" },
  read:    { dot: "#f59e0b", bg: "rgba(245,158,11,.12)", fg: "#fcd34d", label: "Read" },
  replied: { dot: "#10b981", bg: "rgba(16,185,129,.12)", fg: "#6ee7b7", label: "Replied" },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "replied", label: "Replied" },
];

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function Pill({ status }) {
  const m = STATUS_META[status] || STATUS_META.new;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "3px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600,
        background: m.bg, color: m.fg,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: m.dot }} />
      {m.label}
    </span>
  );
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, replied: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab !== "all") params.status = tab;
      const [{ data }, statsRes] = await Promise.all([
        contactService.adminGetAll(params),
        contactService.adminStats(),
      ]);
      setMessages(data?.data || []);
      setStats(statsRes?.data?.data || { total: 0, new: 0, read: 0, replied: 0 });
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  async function openMessage(id) {
    setSelectedId(id);
    setLoadingDetail(true);
    setReplyText("");
    try {
      const { data } = await contactService.adminGetById(id);
      setSelected(data?.data);
      // reflect read status locally without a full reload
      setMessages((prev) =>
        prev.map((m) => (m._id === id && m.status === "new" ? { ...m, status: "read" } : m))
      );
    } catch (err) {
      toast.error("Failed to open message");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleReply() {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      const { data } = await contactService.adminReply(selected._id, replyText.trim());
      setSelected(data?.data);
      setMessages((prev) =>
        prev.map((m) => (m._id === selected._id ? { ...m, status: "replied" } : m))
      );
      setReplyText("");
      toast.success("Reply sent to customer's email");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await contactService.adminDelete(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (selectedId === id) {
        setSelected(null);
        setSelectedId(null);
      }
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = messages.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ color: "var(--adm-text)" }}>
      {/* ── Header ── */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Contact Messages</h1>
          <p className="text-sm" style={{ color: "var(--adm-muted)" }}>
            Customer inquiries from the website contact form
          </p>
        </div>
        <button
          onClick={loadMessages}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
          style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border)" }}
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total, color: "#a78bfa" },
          { label: "New", value: stats.new, color: "#93c5fd" },
          { label: "Read", value: stats.read, color: "#fcd34d" },
          { label: "Replied", value: stats.replied, color: "#6ee7b7" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: "var(--adm-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Inbox: list + detail ── */}
      <div
        className="grid overflow-hidden rounded-xl"
        style={{
          border: "1px solid var(--adm-border)",
          gridTemplateColumns: "360px 1fr",
          minHeight: 560,
        }}
      >
        {/* LEFT — list */}
        <div style={{ borderRight: "1px solid var(--adm-border)", background: "var(--adm-surface)" }}>
          <div className="p-3" style={{ borderBottom: "1px solid var(--adm-border)" }}>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--adm-muted)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full rounded-lg py-2 pl-9 pr-3 text-sm outline-none"
                style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border)", color: "var(--adm-text)" }}
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{
                    background: tab === t.key ? "var(--adm-accent)" : "var(--adm-surface2)",
                    color: tab === t.key ? "#fff" : "var(--adm-muted)",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ maxHeight: 620, overflowY: "auto" }}>
            {loading ? (
              <div className="flex items-center justify-center p-10">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--adm-muted)" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-sm" style={{ color: "var(--adm-muted)" }}>
                No messages found
              </div>
            ) : (
              filtered.map((m) => (
                <button
                  key={m._id}
                  onClick={() => openMessage(m._id)}
                  className="block w-full p-4 text-left"
                  style={{
                    borderBottom: "1px solid var(--adm-border)",
                    background: selectedId === m._id ? "var(--adm-surface2)" : "transparent",
                  }}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{m.name}</span>
                    <span className="shrink-0 text-[11px]" style={{ color: "var(--adm-muted)" }}>
                      {timeAgo(m.createdAt)}
                    </span>
                  </div>
                  <div className="mb-1.5 truncate text-xs" style={{ color: "var(--adm-muted)" }}>
                    {m.subject}
                  </div>
                  <div className="mb-2 line-clamp-2 text-xs" style={{ color: "var(--adm-muted)" }}>
                    {m.message}
                  </div>
                  <Pill status={m.status} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT — detail + reply */}
        <div style={{ background: "var(--adm-bg)" }}>
          {!selectedId ? (
            <div className="flex h-full items-center justify-center" style={{ color: "var(--adm-muted)" }}>
              <div className="text-center">
                <Mail className="mx-auto mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm">Select a message to view details</p>
              </div>
            </div>
          ) : loadingDetail || !selected ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--adm-muted)" }} />
            </div>
          ) : (
            <div className="flex h-full flex-col">
              {/* header */}
              <div className="p-5" style={{ borderBottom: "1px solid var(--adm-border)" }}>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{selected.subject}</h2>
                    <div className="mt-1 text-sm" style={{ color: "var(--adm-muted)" }}>
                      From <span style={{ color: "var(--adm-text)" }}>{selected.name}</span> ({selected.email})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill status={selected.status} />
                    <button
                      onClick={() => handleDelete(selected._id)}
                      disabled={deleting}
                      className="rounded-lg p-2"
                      style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border)" }}
                      title="Delete message"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--adm-muted)" }}>
                  {selected.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {selected.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {new Date(selected.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* thread */}
              <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: 360 }}>
                <div className="rounded-xl p-4" style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
                  <p className="whitespace-pre-wrap text-sm">{selected.message}</p>
                </div>

                {selected.replies?.map((r, i) => (
                  <div
                    key={i}
                    className="ml-6 rounded-xl p-4"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}
                  >
                    <div className="mb-1.5 flex items-center justify-between text-xs" style={{ color: "var(--adm-muted)" }}>
                      <span className="font-semibold" style={{ color: "#6ee7b7" }}>
                        Reply by {r.repliedByName || "Admin"}
                      </span>
                      <span>{new Date(r.repliedAt).toLocaleString()}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{r.message}</p>
                  </div>
                ))}
              </div>

              {/* reply box */}
              <div className="p-5" style={{ borderTop: "1px solid var(--adm-border)" }}>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${selected.name}...`}
                  className="w-full resize-none rounded-lg p-3 text-sm outline-none"
                  style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)", color: "var(--adm-text)" }}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleReply}
                    disabled={sending || !replyText.trim()}
                    className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: "var(--adm-accent)" }}
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {sending ? "Sending..." : "Send Reply"}
                  </button>
                </div>
                <p className="mt-2 text-xs" style={{ color: "var(--adm-muted)" }}>
                  This reply will be emailed directly to {selected.email}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}