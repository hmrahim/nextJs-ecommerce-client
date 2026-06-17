"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ============================================================================
   MOOM24 — Live Chat Console (Amazon / Daraz / Noon scale)
   Drop at: src/app/dashboard/support/live-chat/page.jsx
============================================================================ */

const NOW = Date.now();
const mins = (n) => new Date(NOW - n * 60000).toISOString();

const SEED_CHATS = [
  {
    id: "CHAT-7821", name: "Nusrat Jahan", email: "nusrat.j@gmail.com",
    status: "active", channel: "Web", queue: "Sales", waitSec: 12, unread: 2,
    tags: ["VIP", "Pre-sale"], country: "Bangladesh · Dhaka",
    device: "Chrome on Windows", page: "/product/iphone-15-pro",
    cart: 142000, lastSeen: "now", agentId: "AG-01", rating: null,
    messages: [
      { from: "customer", t: mins(8),  text: "Hi, is the iPhone 15 Pro 256GB available in stock?" },
      { from: "agent",    t: mins(7),  text: "Hello Nusrat! Yes it's in stock, Natural Titanium and Blue Titanium both." },
      { from: "customer", t: mins(5),  text: "What's the delivery time to Dhanmondi?" },
      { from: "agent",    t: mins(4),  text: "Same-day delivery if you order before 2 PM 🚚" },
      { from: "customer", t: mins(1),  text: "Great! Any EMI option for bKash payment?" },
    ],
  },
  {
    id: "CHAT-7820", name: "Arif Mahmud", email: "arif.m@yahoo.com",
    status: "active", channel: "Mobile App", queue: "Support", waitSec: 0, unread: 0,
    tags: ["Returning"], country: "Bangladesh · Chattogram",
    device: "Android App v4.2.1", page: "/orders/ORD-552087",
    cart: 0, lastSeen: "now", agentId: "AG-01", rating: null,
    messages: [
      { from: "customer", t: mins(15), text: "I received wrong color for my iPhone order." },
      { from: "agent",    t: mins(14), text: "I'm sorry about that, let me check ORD-552087..." },
      { from: "agent",    t: mins(12), text: "I've initiated a return pickup, will reach you tomorrow 10-2 PM." },
      { from: "customer", t: mins(10), text: "Thank you, that works!" },
    ],
  },
  {
    id: "CHAT-7819", name: "Sadia Rahman", email: "sadia.r@gmail.com",
    status: "waiting", channel: "Web", queue: "Billing", waitSec: 287, unread: 1,
    tags: ["Refund"], country: "Bangladesh · Sylhet",
    device: "Safari on iPhone", page: "/help/refund-status",
    cart: 0, lastSeen: "2m ago", agentId: null, rating: null,
    messages: [
      { from: "customer", t: mins(5), text: "My refund for ORD-551880 is still not processed after 12 days!" },
    ],
  },
  {
    id: "CHAT-7818", name: "Kamrul Islam", email: "kamrul@outlook.com",
    status: "waiting", channel: "WhatsApp", queue: "Sales", waitSec: 142, unread: 1,
    tags: ["Bulk-order"], country: "Bangladesh · Khulna",
    device: "WhatsApp Business", page: "—",
    cart: 0, lastSeen: "1m ago", agentId: null, rating: null,
    messages: [
      { from: "customer", t: mins(3), text: "I want to bulk order 50 office chairs for my company. Discount available?" },
    ],
  },
  {
    id: "CHAT-7817", name: "Mim Chowdhury", email: "mim.c@gmail.com",
    status: "waiting", channel: "Web", queue: "Support", waitSec: 65, unread: 1,
    tags: ["Payment"], country: "Bangladesh · Dhaka",
    device: "Edge on Windows", page: "/checkout",
    cart: 5400, lastSeen: "now", agentId: null, rating: null,
    messages: [
      { from: "customer", t: mins(2), text: "Payment failed but money was deducted from my card." },
    ],
  },
  {
    id: "CHAT-7816", name: "Tahsin Karim", email: "tahsin@gmail.com",
    status: "resolved", channel: "Web", queue: "Sales", waitSec: 0, unread: 0,
    tags: [], country: "Bangladesh · Rajshahi",
    device: "Chrome on Mac", page: "/cart",
    cart: 2300, lastSeen: "30m ago", agentId: "AG-02", rating: 5,
    messages: [
      { from: "customer", t: mins(45), text: "Does NEW500 coupon work on accessories?" },
      { from: "agent",    t: mins(44), text: "Yes! It works on all items above 2000 SAR 👍" },
      { from: "customer", t: mins(43), text: "Awesome, thanks!" },
      { from: "system",   t: mins(40), text: "Conversation marked as resolved · Customer rated ⭐ 5/5" },
    ],
  },
];

const AGENT_ME = { id: "AG-01", name: "Rashed Khan" };

const CANNED = [
  { title: "Greeting",        text: "Hi! 👋 Welcome to Moom24. How can I help you today?" },
  { title: "Hold",            text: "Could you give me a moment while I check that for you?" },
  { title: "Refund policy",   text: "Refunds are processed within 5-7 business days to your original payment method." },
  { title: "Delivery time",   text: "Standard delivery is 2-3 days inside Dhaka and 3-5 days outside Dhaka." },
  { title: "EMI info",        text: "We offer 0% EMI on EBL, City Bank, BRAC and DBBL cards for orders above 10,000 SAR." },
  { title: "Apology",         text: "I sincerely apologize for the inconvenience. Let me make this right for you." },
  { title: "Close",           text: "Glad I could help! Have a great day. Please rate this conversation ⭐" },
];

const STATUS_COLORS = {
  active:   { dot: "#10b981", label: "Active" },
  waiting:  { dot: "#f59e0b", label: "Waiting" },
  resolved: { dot: "#6b7280", label: "Resolved" },
};

const fmtTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};
const fmtWait = (s) => {
  if (s < 60) return s + "s";
  return Math.floor(s / 60) + "m " + (s % 60) + "s";
};

/* ============================================================================ */

export default function LiveChatPage() {
  const [chats, setChats] = useState(SEED_CHATS);
  const [activeId, setActiveId] = useState(SEED_CHATS[0].id);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [typingByCustomer, setTypingByCustomer] = useState(false);
  const scrollRef = useRef(null);

  /* live ticker — wait timers + simulated typing */
  useEffect(() => {
    const t = setInterval(() => {
      setChats((cs) => cs.map((c) =>
        c.status === "waiting" ? { ...c, waitSec: c.waitSec + 1 } : c
      ));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setTypingByCustomer((v) => !v), 4000);
    return () => clearTimeout(t);
  }, [typingByCustomer, activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeId, chats]);

  const active = chats.find((c) => c.id === activeId);

  const visibleChats = useMemo(() => {
    return chats
      .filter((c) => filter === "all" ? true :
                      filter === "mine" ? c.agentId === AGENT_ME.id && c.status !== "resolved" :
                      c.status === filter)
      .filter((c) => !search || (c.name + c.email + c.id).toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (b.waitSec - a.waitSec) || (b.unread - a.unread));
  }, [chats, filter, search]);

  const counts = useMemo(() => ({
    all: chats.length,
    mine: chats.filter((c) => c.agentId === AGENT_ME.id && c.status !== "resolved").length,
    waiting: chats.filter((c) => c.status === "waiting").length,
    active: chats.filter((c) => c.status === "active").length,
    resolved: chats.filter((c) => c.status === "resolved").length,
  }), [chats]);

  const send = () => {
    if (!draft.trim() || !active) return;
    const msg = { from: "agent", t: new Date().toISOString(), text: draft.trim() };
    setChats((cs) => cs.map((c) => c.id === active.id
      ? { ...c, messages: [...c.messages, msg], status: "active", agentId: AGENT_ME.id, waitSec: 0, unread: 0 }
      : c));
    setDraft("");
  };

  const acceptChat = (id) => setChats((cs) => cs.map((c) =>
    c.id === id ? { ...c, status: "active", agentId: AGENT_ME.id, waitSec: 0, unread: 0 } : c
  ));

  const resolveChat = (id) => setChats((cs) => cs.map((c) =>
    c.id === id ? {
      ...c, status: "resolved",
      messages: [...c.messages, { from: "system", t: new Date().toISOString(), text: "Conversation marked as resolved" }],
    } : c
  ));

  const insertCanned = (text) => setDraft((d) => (d ? d + " " : "") + text);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0b1220", color: "#e2e8f0" }}>
      {/* Top bar */}
      <div style={{
        padding: "14px 22px", borderBottom: "1px solid #1f2937",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>Live Chat Console</h1>
          <span style={{ color: "#64748b", fontSize: 12 }}>·</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8" }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
            You are <strong style={{ color: "#e2e8f0" }}>{AGENT_ME.name}</strong> · Available
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <MiniStat label="Avg response" value="42s" trend="-12%" up />
          <MiniStat label="Avg handle"   value="6m"  trend="-3%"  up />
          <MiniStat label="CSAT today"   value="4.8" trend="+0.2" up />
          <MiniStat label="In queue"     value={counts.waiting} trend="" />
          <button style={{
            padding: "8px 14px", borderRadius: 8, background: "#1e40af", color: "white",
            border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>End shift</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "300px 1fr 320px", overflow: "hidden" }}>
        {/* === LEFT: chat list === */}
        <div style={{ borderRight: "1px solid #1f2937", display: "flex", flexDirection: "column", background: "#0a101c" }}>
          <div style={{ padding: 12, borderBottom: "1px solid #1f2937" }}>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              style={{
                width: "100%", background: "#0b1220", border: "1px solid #1f2937",
                color: "#e2e8f0", padding: "8px 12px", borderRadius: 8, fontSize: 13, outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
              {[
                ["all", "All", counts.all],
                ["mine", "Mine", counts.mine],
                ["waiting", "Queue", counts.waiting],
                ["active", "Active", counts.active],
                ["resolved", "Done", counts.resolved],
              ].map(([k, l, c]) => (
                <button key={k} onClick={() => setFilter(k)} style={{
                  padding: "5px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  background: filter === k ? "#1e40af" : "#0b1220",
                  color: filter === k ? "white" : "#94a3b8",
                  border: `1px solid ${filter === k ? "#1e40af" : "#1f2937"}`,
                }}>{l} <span style={{ opacity: .7 }}>({c})</span></button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {visibleChats.map((c) => {
              const sc = STATUS_COLORS[c.status];
              const isActive = c.id === activeId;
              const last = c.messages[c.messages.length - 1];
              return (
                <div key={c.id} onClick={() => setActiveId(c.id)} style={{
                  padding: "12px 14px", cursor: "pointer", borderBottom: "1px solid #111827",
                  background: isActive ? "#111827" : "transparent",
                  borderLeft: `3px solid ${isActive ? "#3b82f6" : "transparent"}`,
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <Avatar name={c.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                      <span style={{ fontSize: 10.5, color: "#64748b" }}>{c.status === "waiting" ? fmtWait(c.waitSec) : fmtTime(last.t)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {last.from === "agent" && "↗ "}{last.text}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <span style={{ width: 6, height: 6, borderRadius: 99, background: sc.dot }} />
                        <span style={{ fontSize: 10.5, color: "#64748b" }}>{c.channel} · {c.queue}</span>
                      </div>
                      {c.unread > 0 && (
                        <span style={{
                          background: "#ef4444", color: "white", fontSize: 10, fontWeight: 700,
                          padding: "1px 6px", borderRadius: 99, minWidth: 18, textAlign: "center",
                        }}>{c.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {visibleChats.length === 0 && (
              <div style={{ padding: 30, textAlign: "center", color: "#64748b", fontSize: 13 }}>No chats in this view.</div>
            )}
          </div>
        </div>

        {/* === CENTER: conversation === */}
        {active ? (
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* conversation header */}
            <div style={{
              padding: "12px 22px", borderBottom: "1px solid #1f2937",
              display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={active.name} size={36} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>{active.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                      background: STATUS_COLORS[active.status].dot + "33",
                      color: STATUS_COLORS[active.status].dot,
                    }}>{STATUS_COLORS[active.status].label.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>{active.email} · {active.channel} · last seen {active.lastSeen}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {active.status === "waiting" && (
                  <button onClick={() => acceptChat(active.id)} style={btnPrimary}>Accept chat</button>
                )}
                <button style={btnSecondary}>Transfer</button>
                <button style={btnSecondary}>Block</button>
                {active.status !== "resolved" && (
                  <button onClick={() => resolveChat(active.id)} style={{ ...btnPrimary, background: "#059669" }}>✓ Resolve</button>
                )}
              </div>
            </div>

            {/* messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "22px 28px", background: "#0a101c" }}>
              {active.messages.map((m, i) => {
                if (m.from === "system") {
                  return (
                    <div key={i} style={{ textAlign: "center", color: "#64748b", fontSize: 11.5, fontStyle: "italic", margin: "14px 0" }}>
                      — {m.text} —
                    </div>
                  );
                }
                const isAgent = m.from === "agent";
                return (
                  <div key={i} style={{
                    display: "flex", flexDirection: isAgent ? "row-reverse" : "row",
                    gap: 10, marginBottom: 12, alignItems: "flex-end",
                  }}>
                    {!isAgent && <Avatar name={active.name} size={26} />}
                    <div style={{ maxWidth: "70%" }}>
                      <div style={{
                        padding: "9px 14px", borderRadius: 14,
                        background: isAgent ? "linear-gradient(135deg,#2563eb,#1e40af)" : "#111827",
                        color: isAgent ? "white" : "#e2e8f0",
                        border: isAgent ? "none" : "1px solid #1f2937",
                        fontSize: 13.5, lineHeight: 1.45,
                      }}>{m.text}</div>
                      <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 3, textAlign: isAgent ? "right" : "left" }}>
                        {fmtTime(m.t)}{isAgent && " · ✓✓ Seen"}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typingByCustomer && active.status === "active" && (
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
                  <Avatar name={active.name} size={24} />
                  <div style={{ background: "#111827", padding: "8px 14px", borderRadius: 14, border: "1px solid #1f2937" }}>
                    <span style={{ display: "inline-flex", gap: 4 }}>
                      <Dot delay={0} /><Dot delay={.2} /><Dot delay={.4} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* canned responses */}
            <div style={{ padding: "8px 18px", borderTop: "1px solid #1f2937", display: "flex", gap: 6, overflowX: "auto", flexShrink: 0, background: "#0b1220" }}>
              {CANNED.map((c, i) => (
                <button key={i} onClick={() => insertCanned(c.text)} style={{
                  padding: "5px 11px", borderRadius: 99, background: "#111827",
                  border: "1px solid #1f2937", color: "#cbd5e1", fontSize: 11.5,
                  whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
                }}>⚡ {c.title}</button>
              ))}
            </div>

            {/* composer */}
            <div style={{ padding: "12px 18px", borderTop: "1px solid #1f2937", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <button style={composerBtn}>😊</button>
                <button style={composerBtn}>📎</button>
                <button style={composerBtn}>🖼️</button>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={active.status === "resolved" ? "This conversation is resolved." : "Type your message... (Enter to send)"}
                  disabled={active.status === "resolved"}
                  style={{
                    flex: 1, minHeight: 42, maxHeight: 120, padding: "10px 14px",
                    background: "#0b1220", border: "1px solid #1f2937", borderRadius: 10,
                    color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", resize: "none", outline: "none",
                  }}
                />
                <button onClick={send} disabled={!draft.trim() || active.status === "resolved"} style={{
                  ...btnPrimary, padding: "10px 18px", opacity: (!draft.trim() || active.status === "resolved") ? .5 : 1,
                  cursor: (!draft.trim() || active.status === "resolved") ? "not-allowed" : "pointer",
                }}>Send ➤</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", placeItems: "center", color: "#64748b" }}>Select a conversation</div>
        )}

        {/* === RIGHT: customer profile === */}
        {active && (
          <div style={{ borderLeft: "1px solid #1f2937", background: "#0a101c", overflowY: "auto", padding: 18 }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Avatar name={active.name} size={56} />
              <div style={{ marginTop: 8, fontWeight: 700, fontSize: 15, color: "#f8fafc" }}>{active.name}</div>
              <div style={{ fontSize: 11.5, color: "#64748b" }}>{active.email}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {active.tags.map((t) => (
                  <span key={t} style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    background: "#1e3a8a55", color: "#93c5fd", border: "1px solid #1e40af",
                  }}>{t}</span>
                ))}
              </div>
            </div>

            <Block title="Session">
              <Item k="Channel" v={active.channel} />
              <Item k="Location" v={active.country} />
              <Item k="Device" v={active.device} />
              <Item k="Current page" v={active.page} />
              {active.cart > 0 && <Item k="Cart value" v={"SAR " + active.cart.toLocaleString()} highlight />}
            </Block>

            <Block title="Customer history">
              <Item k="Total orders" v="24" />
              <Item k="Lifetime value" v="SAR 184,750" />
              <Item k="Avg order" v="SAR 7,698" />
              <Item k="Tier" v="Gold · 1,420 points" />
              <Item k="Previous chats" v="5 · Avg CSAT 4.6" />
            </Block>

            <Block title="Recent orders">
              {[
                ["ORD-552087", "iPhone 15 Pro 256GB", "SAR 142,000", "Delivered"],
                ["ORD-549812", "Samsung 65\" QLED",   "SAR 78,500",  "Delivered"],
                ["ORD-548112", "Sony WH-1000XM5",    "SAR 32,800",  "Delivered"],
              ].map(([id, name, amt, st]) => (
                <div key={id} style={{
                  padding: 8, marginBottom: 6, background: "#0b1220",
                  border: "1px solid #1f2937", borderRadius: 8, fontSize: 11.5,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "monospace", color: "#60a5fa" }}>{id}</span>
                    <span style={{ color: "#10b981" }}>{st}</span>
                  </div>
                  <div style={{ color: "#cbd5e1", marginTop: 3 }}>{name}</div>
                  <div style={{ color: "#64748b", marginTop: 2 }}>{amt}</div>
                </div>
              ))}
            </Block>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
      `}</style>
    </div>
  );
}

function MiniStat({ label, value, trend, up }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <div style={{ fontSize: 11, color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>
        {value} {trend && <span style={{ fontSize: 10, color: up ? "#10b981" : "#ef4444", marginLeft: 2 }}>{trend}</span>}
      </div>
    </div>
  );
}

function Avatar({ name, size = 32 }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const hue = (name.charCodeAt(0) * 17) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: 99, flexShrink: 0,
      display: "grid", placeItems: "center",
      background: `hsl(${hue} 60% 22%)`, color: `hsl(${hue} 80% 75%)`,
      fontWeight: 700, fontSize: size * 0.38, border: `1px solid hsl(${hue} 60% 30%)`,
    }}>{initials}</div>
  );
}

function Block({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ color: "#64748b", fontSize: 10.5, fontWeight: 700, letterSpacing: .8, marginBottom: 8, textTransform: "uppercase" }}>{title}</div>
      <div>{children}</div>
    </div>
  );
}
function Item({ k, v, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, borderBottom: "1px dashed #1f2937" }}>
      <span style={{ color: "#64748b" }}>{k}</span>
      <span style={{ color: highlight ? "#fbbf24" : "#e2e8f0", fontWeight: highlight ? 700 : 500, textAlign: "right", maxWidth: "65%" }}>{v}</span>
    </div>
  );
}
function Dot({ delay }) {
  return <span style={{
    width: 6, height: 6, borderRadius: 99, background: "#94a3b8",
    animation: `blink 1.4s infinite both`, animationDelay: `${delay}s`,
  }} />;
}

const btnPrimary = { background: "#2563eb", color: "white", border: "none", padding: "7px 14px", borderRadius: 7, fontWeight: 600, fontSize: 12.5, cursor: "pointer" };
const btnSecondary = { background: "transparent", color: "#cbd5e1", border: "1px solid #334155", padding: "7px 14px", borderRadius: 7, fontWeight: 600, fontSize: 12.5, cursor: "pointer" };
const composerBtn = { background: "transparent", border: "1px solid #1f2937", color: "#94a3b8", padding: "8px 12px", borderRadius: 8, fontSize: 16, cursor: "pointer" };