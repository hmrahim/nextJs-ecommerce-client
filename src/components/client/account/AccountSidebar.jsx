"use client";
// 📁 PATH: src/components/client/account/AccountSidebar.jsx
// ✅ Updated: "Quotations" menu item যোগ করা হয়েছে

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShoppingBag, CreditCard, Ticket, Star,
  Gift, Bell, LogOut, Loader2, FileText,
} from "lucide-react";
import { useAuth }    from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const navItems = [
  { label: "Orders",          href: "/account/orders",          icon: ShoppingBag },
  { label: "Quotations",      href: "/account/quotations",      icon: FileText    }, // ✅ NEW
  { label: "Payment Methods", href: "/account/payment-methods", icon: CreditCard  },
  { label: "Vouchers",        href: "/account/vouchers",        icon: Ticket,  badge: null },
  { label: "Reviews",         href: "/account/reviews",         icon: Star         },
  { label: "Rewards",         href: "/account/rewards",         icon: Gift         },
  { label: "Notifications",   href: "/account/notifications",   icon: Bell,    badge: null },
];

function getInitials(firstName, lastName, email) {
  const a = (firstName || "").trim()[0] || "";
  const b = (lastName  || "").trim()[0] || "";
  return (a + b).toUpperCase() || (email || "U")[0].toUpperCase();
}

export default function AccountSidebar() {
  const pathname = usePathname();
  const { user, loading: authLoading, logout } = useAuth();
  const { profile, loading: profileLoading }   = useProfile();

  const loading = authLoading || profileLoading;

  /* ── derived display values ─────────────────────────────── */
  const firstName = profile?.firstName || user?.firstName || "";
  const lastName  = profile?.lastName  || user?.lastName  || "";
  const email     = profile?.email     || user?.email     || "";
  const fullName  = `${firstName} ${lastName}`.trim() || "User";
  const avatarSrc = profile?.avatar    || user?.image     || null;
  const initials  = getInitials(firstName, lastName, email);

  // Rewards / loyalty (use profile fields if backend sends them, else hide)
  const rewardPoints  = profile?.rewardPoints  ?? null;
  const loyaltyTier   = profile?.loyaltyTier   ?? null;
  const nextTierName  = profile?.nextTierName  ?? null;
  const nextTierDelta = profile?.nextTierDelta ?? null;
  const tierProgress  = profile?.tierProgress  ?? null;

  const showRewards = loyaltyTier !== null;

  return (
    <aside className="space-y-4 lg:sticky lg:top-32 h-fit">

      {/* ── Profile Card ──────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 text-center">

        {/* Avatar */}
        <div className="mx-auto h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-2xl font-bold text-white ring-2 ring-emerald-200">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin opacity-70" />
          ) : avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={fullName}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Name & Email */}
        {loading ? (
          <div className="mt-3 space-y-2 animate-pulse">
            <div className="h-4 w-32 rounded bg-muted mx-auto" />
            <div className="h-3 w-40 rounded bg-muted mx-auto" />
          </div>
        ) : (
          <>
            <div className="mt-3 font-semibold text-sm">{fullName}</div>
            <div className="text-xs text-muted-foreground truncate px-2">{email}</div>
          </>
        )}

        {/* Loyalty Tier Badge */}
        {!loading && showRewards && (
          <div className="mt-3 rounded-lg bg-emerald-50 p-2.5 text-xs">
            <span className="font-bold text-emerald-700">🏅 {loyaltyTier}</span>
            {rewardPoints !== null && (
              <div className="text-muted-foreground mt-0.5">
                {rewardPoints.toLocaleString()} points
                {nextTierDelta !== null && nextTierName && (
                  <> · {nextTierDelta} to {nextTierName}</>
                )}
              </div>
            )}
            {tierProgress !== null && (
              <div className="mt-1.5 h-1.5 rounded-full bg-emerald-100">
                <div
                  className="h-1.5 rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, tierProgress)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {!loading && !showRewards && rewardPoints !== null && (
          <div className="mt-2 text-xs text-emerald-700 font-semibold">
            🎯 {rewardPoints.toLocaleString()} reward points
          </div>
        )}
      </div>

      {/* ── Navigation Card ───────────────────────────────── */}
      <nav className="rounded-xl border border-border bg-card p-2">
        {navItems.map(({ label, href, icon: Icon, badge }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge != null && (
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white leading-none">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="my-1.5 h-px bg-border" />

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
