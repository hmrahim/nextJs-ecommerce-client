// 📁 PATH: src/app/(admin)/dashboard/send-email/page.jsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Mail, Send, Loader2, Search, X, Users, AtSign,
  RefreshCw, CheckCircle2, XCircle, ChevronDown, History,
} from "lucide-react";
import { adminEmailService } from "@/services/adminEmailService";

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "rider", label: "Rider" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

function initials(first = "", last = "") {
  return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "U";
}

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

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function SendEmailPage() {
  /* ── Compose ── */
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  /* ── Custom emails (typed) ── */
  const [emailInput, setEmailInput] = useState("");
  const [customEmails, setCustomEmails] = useState([]);

  /* ── Users (selectable) ── */
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [selectedUserMap, setSelectedUserMap] = useState(new Map()); // id -> user (for chip display)

  /* ── History ── */
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = { limit: 100 };
      if (search.trim()) params.search = search.trim();
      if (role !== "all") params.role = role;
      const { data } = await adminEmailService.listUsers(params);
      setUsers(data?.data || []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, [search, role]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const { data } = await adminEmailService.getHistory({ limit: 10 });
      setHistory(data?.data || []);
    } catch (err) {
      // silent — history is a nice-to-have
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(loadUsers, 300); // debounce search
    return () => clearTimeout(t);
  }, [loadUsers]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /* ── Custom email chip handlers ── */
  function addEmailFromInput() {
    const raw = emailInput.trim().replace(/,$/, "");
    if (!raw) return;
    if (!isValidEmail(raw)) {
      toast.error("Enter a valid email address");
      return;
    }
    const lower = raw.toLowerCase();
    if (customEmails.includes(lower)) {
      setEmailInput("");
      return;
    }
    setCustomEmails((prev) => [...prev, lower]);
    setEmailInput("");
  }

  function handleEmailKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmailFromInput();
    }
  }

  function removeCustomEmail(email) {
    setCustomEmails((prev) => prev.filter((e) => e !== email));
  }

  /* ── User selection handlers ── */
  function toggleUser(u) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(u._id)) next.delete(u._id);
      else next.add(u._id);
      return next;
    });
    setSelectedUserMap((prev) => {
      const next = new Map(prev);
      if (next.has(u._id)) next.delete(u._id);
      else next.set(u._id, u);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      users.forEach((u) => next.add(u._id));
      return next;
    });
    setSelectedUserMap((prev) => {
      const next = new Map(prev);
      users.forEach((u) => next.set(u._id, u));
      return next;
    });
  }

  function clearAllSelectedUsers() {
    setSelectedUserIds(new Set());
    setSelectedUserMap(new Map());
  }

  function removeSelectedUser(id) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setSelectedUserMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  const totalRecipients = selectedUserIds.size + customEmails.length;

  async function handleSend() {
    if (!subject.trim()) return toast.error("Please enter a subject");
    if (!message.trim()) return toast.error("Please enter a message");
    if (totalRecipients === 0) return toast.error("Select at least one recipient or enter an email");

    if (!confirm(`Send email to ${totalRecipients} recipient(s)?`)) return;

    setSending(true);
    try {
      const { data } = await adminEmailService.send({
        userIds: Array.from(selectedUserIds),
        emails: customEmails,
        subject: subject.trim(),
        message: message.trim(),
      });
      toast.success(data?.message || "Email sent successfully");
      // reset compose state
      setSubject("");
      setMessage("");
      setCustomEmails([]);
      clearAllSelectedUsers();
      loadHistory();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  const selectedUsersArr = useMemo(() => Array.from(selectedUserMap.values()), [selectedUserMap]);

  return (
    <div style={{ color: "var(--adm-text)" }}>
      {/* ── Header ── */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Send Email</h1>
          <p className="text-sm" style={{ color: "var(--adm-muted)" }}>
            Send a message to any user or directly type an email address
          </p>
        </div>
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
          style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border)" }}
        >
          <History className="h-4 w-4" /> {showHistory ? "Hide" : "Show"} History
        </button>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 380px" }}>
        {/* ── LEFT: Compose + custom emails + selected chips ── */}
        <div className="space-y-5">
          {/* Compose card */}
          <div className="rounded-xl p-5" style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
              <Mail className="h-4 w-4" style={{ color: "var(--adm-accent)" }} /> Compose Message
            </h2>

            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--adm-muted)" }}>Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. New offer just for you!"
              className="mb-4 w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border)", color: "var(--adm-text)" }}
            />

            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--adm-muted)" }}>Message</label>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              className="w-full resize-none rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border)", color: "var(--adm-text)" }}
            />
            <p className="mt-2 text-xs" style={{ color: "var(--adm-muted)" }}>
              This message will be wrapped in a polished branded email template before reaching recipients' inboxes.
            </p>
          </div>

          {/* Custom emails card */}
          <div className="rounded-xl p-5" style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <AtSign className="h-4 w-4" style={{ color: "var(--adm-accent)" }} /> Type Email Addresses
            </h2>
            <div
              className="flex flex-wrap items-center gap-2 rounded-lg p-2.5"
              style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border)" }}
            >
              {customEmails.map((email) => (
                <span
                  key={email}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ background: "rgba(99,102,241,.15)", color: "#a5b4fc" }}
                >
                  {email}
                  <button onClick={() => removeCustomEmail(email)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                onBlur={addEmailFromInput}
                placeholder={customEmails.length === 0 ? "type an email and press Enter..." : "add another..."}
                className="min-w-[160px] flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--adm-text)" }}
              />
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--adm-muted)" }}>
              Press Enter or comma after each one to add multiple emails.
            </p>
          </div>

          {/* Selected users chips */}
          {selectedUsersArr.length > 0 && (
            <div className="rounded-xl p-5" style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                  <Users className="h-4 w-4" style={{ color: "var(--adm-accent)" }} />
                  Selected Users ({selectedUsersArr.length})
                </h2>
                <button onClick={clearAllSelectedUsers} className="text-xs font-medium" style={{ color: "#f87171" }}>
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsersArr.map((u) => (
                  <span
                    key={u._id}
                    className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-medium"
                    style={{ background: "rgba(16,185,129,.12)", color: "#6ee7b7" }}
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ background: "var(--adm-accent)" }}
                    >
                      {initials(u.firstName, u.lastName)}
                    </span>
                    {u.firstName} {u.lastName}
                    <button onClick={() => removeSelectedUser(u._id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={sending || totalRecipients === 0 || !subject.trim() || !message.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: "var(--adm-accent)" }}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending
              ? "Sending..."
              : totalRecipients > 0
              ? `Send to ${totalRecipients} recipient${totalRecipients > 1 ? "s" : ""}`
              : "Send Email"}
          </button>

          {/* History */}
          {showHistory && (
            <div className="rounded-xl p-5" style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)" }}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                  <History className="h-4 w-4" style={{ color: "var(--adm-accent)" }} /> Recent Sends
                </h2>
                <button onClick={loadHistory} className="rounded-lg p-1.5" style={{ background: "var(--adm-surface2)" }}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
              {historyLoading ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--adm-muted)" }} />
                </div>
              ) : history.length === 0 ? (
                <p className="py-6 text-center text-sm" style={{ color: "var(--adm-muted)" }}>
                  No emails sent yet
                </p>
              ) : (
                <div className="space-y-2">
                  {history.map((h) => (
                    <div
                      key={h._id}
                      className="flex items-center justify-between rounded-lg p-3"
                      style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border)" }}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{h.subject}</p>
                        <p className="text-xs" style={{ color: "var(--adm-muted)" }}>
                          {h.sentByName} · {timeAgo(h.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-xs">
                        <span className="flex items-center gap-1" style={{ color: "#6ee7b7" }}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> {h.sentCount}
                        </span>
                        {h.failedCount > 0 && (
                          <span className="flex items-center gap-1" style={{ color: "#f87171" }}>
                            <XCircle className="h-3.5 w-3.5" /> {h.failedCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: User picker ── */}
        <div className="rounded-xl" style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)", height: "fit-content" }}>
          <div className="p-4" style={{ borderBottom: "1px solid var(--adm-border)" }}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Users className="h-4 w-4" style={{ color: "var(--adm-accent)" }} /> Select Users
            </h2>
            <div className="relative mb-2.5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--adm-muted)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-lg py-2 pl-9 pr-3 text-sm outline-none"
                style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border)", color: "var(--adm-text)" }}
              />
            </div>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none rounded-lg py-2 pl-3 pr-8 text-sm outline-none"
                style={{ background: "var(--adm-surface2)", border: "1px solid var(--adm-border)", color: "var(--adm-text)" }}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--adm-muted)" }} />
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--adm-muted)" }}>
                {users.length} user{users.length !== 1 ? "s" : ""} shown
              </span>
              <button onClick={selectAllVisible} className="text-xs font-semibold" style={{ color: "var(--adm-accent)" }}>
                Select all visible
              </button>
            </div>
          </div>

          <div style={{ maxHeight: 520, overflowY: "auto" }}>
            {usersLoading ? (
              <div className="flex items-center justify-center p-10">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--adm-muted)" }} />
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: "var(--adm-muted)" }}>
                No users found
              </div>
            ) : (
              users.map((u) => {
                const checked = selectedUserIds.has(u._id);
                return (
                  <button
                    key={u._id}
                    onClick={() => toggleUser(u)}
                    className="flex w-full items-center gap-3 p-3 text-left"
                    style={{
                      borderBottom: "1px solid var(--adm-border)",
                      background: checked ? "rgba(99,102,241,.08)" : "transparent",
                    }}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: checked ? "var(--adm-accent)" : "var(--adm-surface2)" }}
                    >
                      {initials(u.firstName, u.lastName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {u.firstName} {u.lastName}
                      </span>
                      <span className="block truncate text-xs" style={{ color: "var(--adm-muted)" }}>
                        {u.email}
                      </span>
                    </span>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize"
                      style={{ background: "var(--adm-surface2)", color: "var(--adm-muted)" }}
                    >
                      {u.role}
                    </span>
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                      style={{
                        border: `2px solid ${checked ? "var(--adm-accent)" : "var(--adm-border)"}`,
                        background: checked ? "var(--adm-accent)" : "transparent",
                      }}
                    >
                      {checked && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}