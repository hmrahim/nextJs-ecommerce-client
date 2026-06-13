"use client";

import { useMemo, useState } from "react";

/* ============================================================================
   MOOM24 — Support Tickets (Amazon Seller Central / Daraz scale)
   Self-contained page. No external imports beyond React.
   Drop at: src/app/dashboard/support/tickets/page.jsx
============================================================================ */

const AGENTS = [
  { id: "AG-01", name: "Rashed Khan", avatar: "RK", load: 12 },
  { id: "AG-02", name: "Tanjila Ahmed", avatar: "TA", load: 8 },
  { id: "AG-03", name: "Mahir Hossain", avatar: "MH", load: 17 },
  { id: "AG-04", name: "Sumi Akter", avatar: "SA", load: 5 },
  { id: "AG-05", name: "Imran Sheikh", avatar: "IS", load: 9 },
];

const CATEGORIES = [
  "Order Issue", "Refund Request", "Product Quality", "Delivery Delay",
  "Seller Dispute", "Account / Login", "Payment Failed", "Coupon / Promo",
  "Return Pickup", "Warranty Claim",
];

const CHANNELS = ["Web", "Mobile App", "Email", "WhatsApp", "Facebook", "Phone"];

const TICKET_SEED = [
  ["#TCK-90234", "Order not delivered after 9 days", "Delivery Delay", "Urgent", "Open",       "Web",      "AG-03", "Nusrat Jahan",   "nusrat.j@gmail.com",   "ORD-552190", 14250, "2h ago",  3],
  ["#TCK-90233", "Wrong color received - iPhone 15", "Product Quality", "High",   "In Progress","Mobile App","AG-01", "Arif Mahmud",    "arif.m@yahoo.com",     "ORD-552087", 142000,"4h ago",  7],
  ["#TCK-90232", "Refund not processed for 12 days", "Refund Request",  "High",   "Escalated",  "Email",    "AG-02", "Sadia Rahman",   "sadia.r@gmail.com",    "ORD-551880", 8900,  "5h ago", 11],
  ["#TCK-90231", "Seller is non-responsive",         "Seller Dispute",  "Urgent", "Open",       "WhatsApp", null,    "Kamrul Islam",   "kamrul@outlook.com",   "ORD-551772", 32500, "6h ago",  1],
  ["#TCK-90230", "Payment deducted but order failed","Payment Failed",  "Urgent", "Open",       "Mobile App","AG-04", "Mim Chowdhury",  "mim.c@gmail.com",      "ORD-551701", 5400,  "8h ago",  2],
  ["#TCK-90229", "Coupon NEW500 not applying",       "Coupon / Promo",  "Low",    "Waiting",    "Web",      "AG-05", "Tahsin Karim",   "tahsin@gmail.com",     "—",          0,     "12h ago", 4],
  ["#TCK-90228", "Warranty claim - Samsung TV",      "Warranty Claim",  "Medium", "In Progress","Email",    "AG-03", "Rezaul Haque",   "rezaul.h@gmail.com",   "ORD-549812", 78500, "1d ago",  9],
  ["#TCK-90227", "Return pickup never arrived",      "Return Pickup",   "High",   "Open",       "Phone",    "AG-02", "Faria Tabassum", "faria@gmail.com",      "ORD-550012", 6700,  "1d ago",  5],
  ["#TCK-90226", "Account locked after 3 logins",    "Account / Login", "Medium", "Resolved",   "Web",      "AG-01", "Shovon Das",     "shovon@gmail.com",     "—",          0,     "2d ago", 12],
  ["#TCK-90225", "Damaged package - glass broken",   "Product Quality", "Urgent", "Escalated",  "Mobile App","AG-04", "Lubna Hasan",    "lubna.h@gmail.com",    "ORD-549103", 23400, "2d ago", 14],
  ["#TCK-90224", "Need invoice for company purchase","Order Issue",     "Low",    "Resolved",   "Email",    "AG-05", "Mahbub Alam",    "mahbub@bracu.ac.bd",   "ORD-548772", 187200,"3d ago", 6],
  ["#TCK-90223", "Fake product received - Nike shoe","Product Quality", "Urgent", "Escalated",  "Facebook", "AG-03", "Pritom Saha",    "pritom@gmail.com",     "ORD-548551", 11200, "3d ago", 8],
  ["#TCK-90222", "Address change after order",       "Order Issue",     "Medium", "Closed",     "Web",      "AG-02", "Anika Tahsin",   "anika@gmail.com",      "ORD-548330", 4500,  "4d ago", 3],
  ["#TCK-90221", "Duplicate charge on bKash",        "Payment Failed",  "High",   "In Progress","WhatsApp", "AG-01", "Sabbir Ahmed",   "sabbir@gmail.com",     "ORD-548112", 12800, "4d ago", 5],
  ["#TCK-90220", "Product description mismatch",     "Product Quality", "Medium", "Open",       "Web",      null,    "Rifat Hossain",  "rifat@gmail.com",      "ORD-547998", 3200,  "5d ago", 2],
];

const TICKETS = TICKET_SEED.map((r) => ({
  id: r[0], subject: r[1], category: r[2], priority: r[3], status: r[4],
  channel: r[5], agentId: r[6], customer: r[7], email: r[8],
  order: r[9], amount: r[10], updated: r[11], messages: r[12],
  createdAt: "2026-06-05",
  sla: r[3] === "Urgent" ? 4 : r[3] === "High" ? 12 : 24,
  slaUsed: Math.min(100, 20 + ((r[12] * 7) % 90)),
}));

const STATUS_META = {
  Open:          { dot: "#3b82f6", bg: "rgba(59,130,246,.12)",  fg: "#93c5fd" },
  "In Progress": { dot: "#f59e0b", bg: "rgba(245,158,11,.12)",  fg: "#fcd34d" },
  Waiting:      { dot: "#a78bfa", bg: "rgba(167,139,250,.12)", fg: "#c4b5fd" },
  Escalated:    { dot: "#ef4444", bg: "rgba(239,68,68,.14)",   fg: "#fca5a5" },
  Resolved:     { dot: "#10b981", bg: "rgba(16,185,129,.12)",  fg: "#6ee7b7" },
  Closed:       { dot: "#6b7280", bg: "rgba(107,114,128,.18)", fg: "#9ca3af" },
};

const PRIORITY_META = {
  Urgent: { fg: "#fca5a5", bg: "rgba(239,68,68,.14)",  bar: "#ef4444" },
  High:   { fg: "#fdba74", bg: "rgba(249,115,22,.14)", bar: "#f97316" },
  Medium: { fg: "#fcd34d", bg: "rgba(245,158,11,.14)", bar: "#f59e0b" },
  Low:    { fg: "#86efac", bg: "rgba(16,185,129,.14)", bar: "#10b981" },
};

const STATUSES = ["Open", "In Progress", "Waiting", "Escalated", "Resolved", "Closed"];
const PRIORITIES = ["Urgent", "High", "Medium", "Low"];

const fmtBDT = (n) => "৳" + Number(n || 0).toLocaleString("en-BD");

/* ----------------------------- atoms ----------------------------- */
function Pill({ children, bg, fg, dot }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600,
      background: bg, color: fg, border: `1px solid ${fg}22`,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 99, background: dot }} />}
      {children}
    </span>
  );
}

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: "linear-gradient(180deg,#111827,#0b1220)",
      border: "1px solid #1f2937", borderRadius: 14, padding: 16,
      display: "flex", flexDirection: "column", gap: 8, minWidth: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: .3 }}>{label}</span>
        <span style={{
          width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center",
          background: `${accent}22`, color: accent, fontSize: 14,
        }}>{icon}</span>
      </div>
      <div style={{ color: "#f8fafc", fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: 11.5 }}>{sub}</div>
    </div>
  );
}

function Avatar({ name, size = 28 }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const hue = (name.charCodeAt(0) * 17) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: 99, flexShrink: 0,
      display: "grid", placeItems: "center",
      background: `hsl(${hue} 60% 22%)`, color: `hsl(${hue} 80% 75%)`,
      fontWeight: 700, fontSize: size * 0.4, border: `1px solid hsl(${hue} 60% 30%)`,
    }}>{initials}</div>
  );
}

/* ----------------------------- Detail drawer ----------------------------- */
function TicketDrawer({ ticket, onClose, agents, onUpdate }) {
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  if (!ticket) return null;
  const agent = agents.find((a) => a.id === ticket.agentId);
  const sMeta = STATUS_META[ticket.status];
  const pMeta = PRIORITY_META[ticket.priority];

  const conversation = [
    { who: ticket.customer, role: "customer", time: "2d ago", body: `Hi, I placed order ${ticket.order} and there's a problem. Please help.` },
    { who: "System", role: "system", time: "2d ago", body: `Ticket auto-routed to ${ticket.category} queue.` },
    agent && { who: agent.name, role: "agent", time: "1d ago", body: "Hello, sorry for the inconvenience — I'm looking into it now and will update you shortly." },
    { who: ticket.customer, role: "customer", time: "12h ago", body: "Any update? This is getting frustrating." },
  ].filter(Boolean);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(2px)" }} />
      <div style={{
        position: "relative", width: "min(940px, 100%)", height: "100%",
        background: "#0b1220", borderLeft: "1px solid #1f2937", display: "flex", flexDirection: "column",
      }}>
        {/* header */}
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #1f2937", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
              <span style={{ color: "#64748b", fontFamily: "monospace", fontSize: 12 }}>{ticket.id}</span>
              <Pill {...sMeta} dot={sMeta.dot}>{ticket.status}</Pill>
              <Pill {...pMeta}>{ticket.priority}</Pill>
              <Pill bg="#1f2937" fg="#cbd5e1">{ticket.channel}</Pill>
            </div>
            <div style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700 }}>{ticket.subject}</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #334155", color: "#cbd5e1", padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>Close</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 320px" }}>
          {/* conversation */}
          <div style={{ padding: 22, borderRight: "1px solid #1f2937" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {conversation.map((m, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: m.role === "agent" ? "row-reverse" : "row", gap: 10,
                }}>
                  <Avatar name={m.who} />
                  <div style={{ maxWidth: "78%" }}>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 4, textAlign: m.role === "agent" ? "right" : "left" }}>
                      {m.who} · {m.time}
                    </div>
                    <div style={{
                      padding: "10px 14px", borderRadius: 12, fontSize: 13.5, lineHeight: 1.5,
                      background: m.role === "agent" ? "#1e40af33" :
                                  m.role === "system" ? "#0f172a" : "#111827",
                      border: m.role === "system" ? "1px dashed #334155" : "1px solid #1f2937",
                      color: m.role === "system" ? "#94a3b8" : "#e2e8f0",
                      fontStyle: m.role === "system" ? "italic" : "normal",
                    }}>{m.body}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* reply box */}
            <div style={{ marginTop: 20, background: "#0f172a", border: "1px solid #1f2937", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <button onClick={() => setInternal(false)} style={{
                  padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: !internal ? "#1e40af" : "transparent",
                  color: !internal ? "white" : "#94a3b8",
                  border: `1px solid ${!internal ? "#1e40af" : "#334155"}`,
                }}>Reply to customer</button>
                <button onClick={() => setInternal(true)} style={{
                  padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: internal ? "#92400e" : "transparent",
                  color: internal ? "white" : "#94a3b8",
                  border: `1px solid ${internal ? "#92400e" : "#334155"}`,
                }}>Internal note</button>
              </div>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={internal ? "Write a note visible only to your team..." : "Type your reply to the customer..."}
                style={{
                  width: "100%", minHeight: 90, background: "#0b1220",
                  border: "1px solid #1f2937", borderRadius: 8, padding: 10,
                  color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", resize: "vertical",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btnGhost}>📎 Attach</button>
                  <button style={btnGhost}>⚡ Macros</button>
                  <button style={btnGhost}>📋 Templates</button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btnSecondary}>Save draft</button>
                  <button style={btnPrimary} onClick={() => { setReply(""); }}>Send</button>
                </div>
              </div>
            </div>
          </div>

          {/* sidebar */}
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, fontSize: 13 }}>
            <Section title="Customer">
              <Row k="Name" v={ticket.customer} />
              <Row k="Email" v={ticket.email} />
              <Row k="Loyalty" v="Gold · 24 orders" />
              <Row k="LTV" v={fmtBDT(184750)} />
            </Section>
            <Section title="Order">
              <Row k="Order ID" v={ticket.order} />
              <Row k="Amount" v={fmtBDT(ticket.amount)} />
              <Row k="Payment" v="bKash · Paid" />
              <Row k="Seller" v="TechZone BD" />
            </Section>
            <Section title="Ticket">
              <Row k="Category" v={ticket.category} />
              <Row k="Created" v={ticket.createdAt} />
              <Row k="SLA" v={`${ticket.sla}h target · ${ticket.slaUsed}% used`} />
              <div style={{ height: 6, background: "#1f2937", borderRadius: 99, marginTop: 6 }}>
                <div style={{
                  width: `${ticket.slaUsed}%`, height: "100%", borderRadius: 99,
                  background: ticket.slaUsed > 80 ? "#ef4444" : ticket.slaUsed > 60 ? "#f59e0b" : "#10b981",
                }} />
              </div>
            </Section>
            <Section title="Assignment">
              <select
                value={ticket.agentId || ""}
                onChange={(e) => onUpdate({ ...ticket, agentId: e.target.value || null })}
                style={selectStyle}
              >
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.load} active)</option>)}
              </select>
              <select
                value={ticket.status}
                onChange={(e) => onUpdate({ ...ticket, status: e.target.value })}
                style={{ ...selectStyle, marginTop: 8 }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={ticket.priority}
                onChange={(e) => onUpdate({ ...ticket, priority: e.target.value })}
                style={{ ...selectStyle, marginTop: 8 }}
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p} Priority</option>)}
              </select>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, letterSpacing: .8, marginBottom: 8, textTransform: "uppercase" }}>{title}</div>
      <div style={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        {children}
      </div>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <span style={{ color: "#64748b" }}>{k}</span>
      <span style={{ color: "#e2e8f0", fontWeight: 500, textAlign: "right" }}>{v}</span>
    </div>
  );
}

const btnPrimary = { background: "#2563eb", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" };
const btnSecondary = { background: "transparent", color: "#cbd5e1", border: "1px solid #334155", padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" };
const btnGhost = { background: "transparent", color: "#94a3b8", border: "none", padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer" };
const selectStyle = { width: "100%", background: "#0b1220", border: "1px solid #1f2937", color: "#e2e8f0", padding: "8px 10px", borderRadius: 8, fontSize: 12.5, cursor: "pointer" };
const inputStyle = { background: "#0b1220", border: "1px solid #1f2937", color: "#e2e8f0", padding: "8px 12px", borderRadius: 8, fontSize: 13, outline: "none" };

/* ----------------------------- Page ----------------------------- */
export default function TicketsPage() {
  const [tickets, setTickets] = useState(TICKETS);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All");
  const [category, setCategory] = useState("All");
  const [channel, setChannel] = useState("All");
  const [agentFilter, setAgentFilter] = useState("All");
  const [open, setOpen] = useState(null);
  const [view, setView] = useState("list"); // list | kanban

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (tab !== "All" && t.status !== tab) return false;
      if (priority !== "All" && t.priority !== priority) return false;
      if (category !== "All" && t.category !== category) return false;
      if (channel !== "All" && t.channel !== channel) return false;
      if (agentFilter === "Unassigned" && t.agentId) return false;
      if (agentFilter !== "All" && agentFilter !== "Unassigned" && t.agentId !== agentFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.id.toLowerCase().includes(q) &&
            !t.subject.toLowerCase().includes(q) &&
            !t.customer.toLowerCase().includes(q) &&
            !t.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [tickets, tab, priority, category, channel, agentFilter, search]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => ["Open","In Progress","Waiting","Escalated"].includes(t.status)).length;
    const escalated = tickets.filter((t) => t.status === "Escalated").length;
    const breach = tickets.filter((t) => t.slaUsed > 80 && !["Resolved","Closed"].includes(t.status)).length;
    const resolved = tickets.filter((t) => t.status === "Resolved").length;
    return { total, open, escalated, breach, resolved };
  }, [tickets]);

  const updateTicket = (next) => setTickets((arr) => arr.map((t) => t.id === next.id ? next : t));

  const kanbanCols = ["Open", "In Progress", "Waiting", "Escalated", "Resolved"];

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e2e8f0", padding: "24px 28px" }}>
      {/* page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>Support Tickets</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13.5 }}>
            Manage every customer issue across channels — from order disputes to warranty claims.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btnSecondary}>Export CSV</button>
          <button style={btnSecondary}>SLA Report</button>
          <button style={btnPrimary}>+ New Ticket</button>
        </div>
      </div>

      {/* stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard label="Total tickets"     value={stats.total}      sub="Last 30 days"            accent="#60a5fa" icon="🎫" />
        <StatCard label="Active"            value={stats.open}       sub="Open + In Progress + Waiting" accent="#34d399" icon="⚡" />
        <StatCard label="Escalated"         value={stats.escalated}  sub="Need supervisor"          accent="#f87171" icon="🚨" />
        <StatCard label="SLA at risk"       value={stats.breach}     sub=">80% of target used"      accent="#fbbf24" icon="⏱️" />
        <StatCard label="Resolved today"    value={stats.resolved}   sub="92% CSAT this week"       accent="#a78bfa" icon="✅" />
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14, borderBottom: "1px solid #1f2937", overflowX: "auto" }}>
        {["All", ...STATUSES].map((s) => {
          const count = s === "All" ? tickets.length : tickets.filter((t) => t.status === s).length;
          const active = tab === s;
          return (
            <button key={s} onClick={() => setTab(s)} style={{
              padding: "10px 16px", background: "transparent",
              border: "none", borderBottom: active ? "2px solid #3b82f6" : "2px solid transparent",
              color: active ? "#f1f5f9" : "#94a3b8",
              fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
            }}>
              {s} <span style={{ color: "#64748b", marginLeft: 4 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ticket id, subject, customer, email..."
          style={{ ...inputStyle, minWidth: 320, flex: 1 }}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={selectStyle}>
          <option>All</option>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
          <option>All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={channel} onChange={(e) => setChannel(e.target.value)} style={selectStyle}>
          <option>All</option>{CHANNELS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} style={selectStyle}>
          <option value="All">All agents</option>
          <option value="Unassigned">Unassigned</option>
          {AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <div style={{ display: "flex", gap: 0, marginLeft: "auto", border: "1px solid #334155", borderRadius: 8, overflow: "hidden" }}>
          {["list", "kanban"].map((v) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "8px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: view === v ? "#1e40af" : "transparent",
              color: view === v ? "white" : "#94a3b8",
            }}>{v === "list" ? "📋 List" : "🗂 Kanban"}</button>
          ))}
        </div>
      </div>

      {view === "list" ? (
        <div style={{
          background: "#0f172a", border: "1px solid #1f2937", borderRadius: 12, overflow: "hidden",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#0b1220", color: "#94a3b8", fontSize: 11.5, textTransform: "uppercase", letterSpacing: .5 }}>
                  <Th>Ticket</Th><Th>Subject</Th><Th>Customer</Th>
                  <Th>Priority</Th><Th>Status</Th><Th>SLA</Th>
                  <Th>Agent</Th><Th>Updated</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const s = STATUS_META[t.status];
                  const p = PRIORITY_META[t.priority];
                  const agent = AGENTS.find((a) => a.id === t.agentId);
                  return (
                    <tr key={t.id}
                        onClick={() => setOpen(t)}
                        style={{ borderTop: "1px solid #1f2937", cursor: "pointer", transition: "background .15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#111827"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <Td>
                        <div style={{ fontFamily: "monospace", color: "#60a5fa", fontSize: 12 }}>{t.id}</div>
                        <div style={{ fontSize: 10.5, color: "#64748b" }}>{t.channel} · {t.category}</div>
                      </Td>
                      <Td>
                        <div style={{ color: "#f1f5f9", fontWeight: 500, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>💬 {t.messages} messages · Order {t.order}</div>
                      </Td>
                      <Td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar name={t.customer} size={26} />
                          <div>
                            <div style={{ color: "#e2e8f0" }}>{t.customer}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{t.email}</div>
                          </div>
                        </div>
                      </Td>
                      <Td><Pill {...p}><span style={{ width: 6, height: 6, borderRadius: 99, background: p.bar }} />{t.priority}</Pill></Td>
                      <Td><Pill {...s} dot={s.dot}>{t.status}</Pill></Td>
                      <Td>
                        <div style={{ width: 80, height: 5, background: "#1f2937", borderRadius: 99 }}>
                          <div style={{
                            width: `${t.slaUsed}%`, height: "100%", borderRadius: 99,
                            background: t.slaUsed > 80 ? "#ef4444" : t.slaUsed > 60 ? "#f59e0b" : "#10b981",
                          }} />
                        </div>
                        <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 3 }}>{t.slaUsed}% of {t.sla}h</div>
                      </Td>
                      <Td>
                        {agent ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Avatar name={agent.name} size={22} />
                            <span style={{ fontSize: 12 }}>{agent.name.split(" ")[0]}</span>
                          </div>
                        ) : <span style={{ color: "#64748b", fontSize: 11.5, fontStyle: "italic" }}>Unassigned</span>}
                      </Td>
                      <Td><span style={{ color: "#94a3b8", fontSize: 12 }}>{t.updated}</span></Td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No tickets match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 16px", borderTop: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#64748b", fontSize: 12 }}>
            <span>Showing {filtered.length} of {tickets.length} tickets</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={btnSecondary}>‹ Prev</button>
              <button style={btnSecondary}>Next ›</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${kanbanCols.length}, minmax(260px, 1fr))`, gap: 12, overflowX: "auto", paddingBottom: 12 }}>
          {kanbanCols.map((col) => {
            const items = filtered.filter((t) => t.status === col);
            const meta = STATUS_META[col];
            return (
              <div key={col} style={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 12, padding: 12, minHeight: 400 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: meta.dot }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9" }}>{col}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b", background: "#1f2937", padding: "2px 8px", borderRadius: 99 }}>{items.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map((t) => {
                    const p = PRIORITY_META[t.priority];
                    const agent = AGENTS.find((a) => a.id === t.agentId);
                    return (
                      <div key={t.id} onClick={() => setOpen(t)} style={{
                        background: "#0b1220", border: "1px solid #1f2937", borderRadius: 10,
                        padding: 12, cursor: "pointer", borderLeft: `3px solid ${p.bar}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#60a5fa" }}>{t.id}</span>
                          <span style={{ fontSize: 10, color: "#64748b" }}>{t.updated}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: "#e2e8f0", fontWeight: 500, marginBottom: 6, lineHeight: 1.4 }}>{t.subject}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>{t.customer} · {t.category}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Pill {...p}>{t.priority}</Pill>
                          {agent ? <Avatar name={agent.name} size={20} /> :
                            <span style={{ fontSize: 10, color: "#64748b" }}>Unassigned</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && <TicketDrawer ticket={open} agents={AGENTS} onClose={() => setOpen(null)} onUpdate={updateTicket} />}
    </div>
  );
}

const Th = ({ children }) => <th style={{ padding: "11px 14px", textAlign: "left", fontWeight: 600 }}>{children}</th>;
const Td = ({ children }) => <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>{children}</td>;